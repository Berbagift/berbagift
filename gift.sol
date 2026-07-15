// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// Interface untuk TokenRegistry
interface ITokenRegistry {
    function isValidToken(address _token) external view returns (bool);
    function getAllTokens() external view returns (address[] memory);
}

contract BerbagiftNFT is ERC721URIStorage, Ownable {
    using SafeERC20 for IERC20;

    ITokenRegistry public tokenRegistry;

    address public marketplaceAddress;
    uint256 public maxBatchSize = 3;
    uint256 private _currentTokenID = 0;

    address public platformWallet;
    uint256 public feePercentage = 5; // 5 / 1000 = 0.5%

    struct NFTData {
        address recipient;
        address tokenUsed; // address(0) for native token
        uint256 tokenAmount;
    }

    mapping(uint256 => NFTData) public nftDataMap;

    event BundleSent(
        address indexed sender,
        address indexed recipient,
        uint256 indexed nftTokenId,
        address tokenUsed,
        uint256 tokenAmount,
        string tokenURI,
        string message
    );

    event MaxBatchSizeUpdated(uint256 oldSize, uint256 newSize);

    event FeePaid(
        address indexed sender,
        address indexed platformWallet,
        address tokenUsed,
        uint256 feeAmount
    );

    constructor(address _tokenRegistry) ERC721("Berbagift NFT", "BGFT") Ownable(msg.sender) {
        require(_tokenRegistry != address(0), "Token registry tidak valid");
        tokenRegistry = ITokenRegistry(_tokenRegistry);
        platformWallet = msg.sender;
    }

    modifier onlyMarketplace() {
        require(
            msg.sender == marketplaceAddress,
            "Hanya marketplace yang diizinkan"
        );
        _;
    }

    function mintFromMarketplace(
        address recipient,
        string calldata customTokenURI
    ) external onlyMarketplace returns (uint256) {
        _currentTokenID++;
        uint256 newItemID = _currentTokenID;

        // Kosongkan data bundle karena ini murni minting custom dari marketplace
        nftDataMap[newItemID] = NFTData({
            recipient: recipient,
            tokenUsed: address(0),
            tokenAmount: 0
        });

        _mint(recipient, newItemID);
        _setTokenURI(newItemID, customTokenURI);

        return newItemID;
    }

    function setMarketplaceAddress(address _marketplace) external onlyOwner {
        marketplaceAddress = _marketplace;
    }

    function setPlatformWallet(address _platformWallet) external onlyOwner {
        require(
            _platformWallet != address(0),
            "Alamat platform tidak boleh nol"
        );
        platformWallet = _platformWallet;
    }

    event FeePercentageUpdated(uint256 oldFee, uint256 newFee);

    function setFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 100, "Fee maksimal 10%");
        uint256 oldFee = feePercentage;
        feePercentage = _feePercentage;
        emit FeePercentageUpdated(oldFee, _feePercentage);
    }

    function setMaxBatchSize(uint256 _newSize) external onlyOwner {
        require(_newSize > 0, "Kapasitas tidak boleh 0");
        uint256 oldSize = maxBatchSize;
        maxBatchSize = _newSize;
        emit MaxBatchSizeUpdated(oldSize, _newSize);
    }

    event TokenRegistryUpdated(address oldRegistry, address newRegistry);

    function setTokenRegistry(address _tokenRegistry) external onlyOwner {
        require(_tokenRegistry != address(0), "Alamat registry tidak boleh nol");
        address oldRegistry = address(tokenRegistry);
        tokenRegistry = ITokenRegistry(_tokenRegistry);
        emit TokenRegistryUpdated(oldRegistry, _tokenRegistry);
    }

    // ========================================================
    // FUNGSI 1 & 2: MINTING NFT BARU
    // ========================================================

    function sendBatchGift(
        address _token,
        uint256 _totalTokenAmount, // Diabaikan jika _token == address(0)
        address[] calldata recipients,
        bool isSplit, // <-- Opsi: true untuk dibagi rata, false untuk nominal sama per user
        string[] calldata customTokenURIs,
        string[] calldata messages
    ) external payable {
        require(tokenRegistry.isValidToken(_token), "Token tidak terdaftar");
        
        uint256 totalRecipients = recipients.length;
        require(
            totalRecipients <= maxBatchSize,
            "Melebihi batas maksimal user per batch"
        );
        require(totalRecipients > 0, "Daftar kosong");
        
        uint256 totalAmount = _token == address(0) ? msg.value : _totalTokenAmount;
        require(totalAmount > 0, "Amount harus lebih besar dari 0");
        
        if (_token != address(0)) {
            require(msg.value == 0, "Jangan kirim ETH jika pakai ERC20");
        }

        require(
            totalRecipients == customTokenURIs.length,
            "Panjang array URI tidak sama"
        );
        require(
            messages.length == 0 || messages.length == totalRecipients,
            "Panjang array pesan tidak valid"
        );

        // Hitung fee 0.5% untuk platform
        uint256 totalFeeAmount = (totalAmount * feePercentage) / 1000;
        uint256 actualRewardPool = totalAmount - totalFeeAmount;

        // Transfer fee ke platform wallet
        if (totalFeeAmount > 0) {
            if (_token == address(0)) {
                (bool feeSuccess, ) = payable(platformWallet).call{value: totalFeeAmount}("");
                require(feeSuccess, "Transfer fee ETH gagal");
            } else {
                IERC20(_token).safeTransferFrom(msg.sender, platformWallet, totalFeeAmount);
            }
            emit FeePaid(msg.sender, platformWallet, _token, totalFeeAmount);
        }

        // Jika menggunakan ERC20, transfer reward pool ke kontrak ini sementara
        if (_token != address(0) && actualRewardPool > 0) {
            IERC20(_token).safeTransferFrom(msg.sender, address(this), actualRewardPool);
        }

        // Menghitung jumlah token yang sebenarnya akan diterima setiap user
        uint256 amountPerUser = actualRewardPool / totalRecipients;
        require(amountPerUser > 0, "Amount per user terlalu kecil");

        for (uint256 i = 0; i < totalRecipients; i++) {
            address recipient = recipients[i];
            string memory customTokenURI = customTokenURIs[i];
            string memory userMessage = messages.length > 0 ? messages[i] : "";

            require(recipient != address(0), "Zero address");

            // Transfer ke recipient
            if (_token == address(0)) {
                (bool success, ) = payable(recipient).call{value: amountPerUser}("");
                require(success, "Transfer ETH gagal");
            } else {
                IERC20(_token).safeTransfer(recipient, amountPerUser);
            }

            _currentTokenID++;
            uint256 newItemID = _currentTokenID;

            nftDataMap[newItemID] = NFTData({
                recipient: recipient,
                tokenUsed: _token,
                tokenAmount: amountPerUser
            });

            _mint(recipient, newItemID);
            _setTokenURI(newItemID, customTokenURI);

            emit BundleSent(
                msg.sender,
                recipient,
                newItemID,
                _token,
                amountPerUser,
                customTokenURI,
                userMessage
            );
        }
    }

    function sendExistingBatchGift(
        address _token,
        uint256 _totalTokenAmount, // Diabaikan jika _token == address(0)
        address[] calldata recipients,
        bool isSplit,
        uint256[] calldata tokenIds,
        string[] calldata messages
    ) external payable {
        require(tokenRegistry.isValidToken(_token), "Token tidak terdaftar");
        
        uint256 totalRecipients = recipients.length;
        require(
            totalRecipients <= maxBatchSize,
            "Melebihi batas maksimal user"
        );
        require(totalRecipients > 0, "Daftar kosong");
        
        uint256 totalAmount = _token == address(0) ? msg.value : _totalTokenAmount;
        require(totalAmount > 0, "Amount > 0");

        if (_token != address(0)) {
            require(msg.value == 0, "Jangan kirim ETH jika pakai ERC20");
        }

        require(
            totalRecipients == tokenIds.length,
            "Panjang array token ID beda"
        );
        require(
            messages.length == 0 || messages.length == totalRecipients,
            "Panjang array pesan invalid"
        );

        // Hitung fee 0.5% untuk platform
        uint256 totalFeeAmount = (totalAmount * feePercentage) / 1000;
        uint256 actualRewardPool = totalAmount - totalFeeAmount;

        // Transfer fee ke platform wallet
        if (totalFeeAmount > 0) {
            if (_token == address(0)) {
                (bool feeSuccess, ) = payable(platformWallet).call{value: totalFeeAmount}("");
                require(feeSuccess, "Transfer fee ETH gagal");
            } else {
                IERC20(_token).safeTransferFrom(msg.sender, platformWallet, totalFeeAmount);
            }
            emit FeePaid(msg.sender, platformWallet, _token, totalFeeAmount);
        }
        
        // Jika menggunakan ERC20, transfer reward pool ke kontrak ini sementara
        if (_token != address(0) && actualRewardPool > 0) {
            IERC20(_token).safeTransferFrom(msg.sender, address(this), actualRewardPool);
        }

        uint256 amountPerUser = actualRewardPool / totalRecipients;
        require(amountPerUser > 0, "Amount per user terlalu kecil");

        for (uint256 i = 0; i < totalRecipients; i++) {
            address recipient = recipients[i];
            uint256 tokenId = tokenIds[i];
            string memory userMessage = messages.length > 0 ? messages[i] : "";

            require(recipient != address(0), "Zero address");
            require(
                ownerOf(tokenId) == msg.sender,
                "Anda bukan pemilik NFT ini"
            );

            // Transfer ke recipient
            if (_token == address(0)) {
                (bool success, ) = payable(recipient).call{value: amountPerUser}("");
                require(success, "Transfer ETH gagal");
            } else {
                IERC20(_token).safeTransfer(recipient, amountPerUser);
            }

            _transfer(msg.sender, recipient, tokenId);

            nftDataMap[tokenId] = NFTData({
                recipient: recipient,
                tokenUsed: _token,
                tokenAmount: amountPerUser
            });

            string memory currentURI = tokenURI(tokenId);

            emit BundleSent(
                msg.sender,
                recipient,
                tokenId,
                _token,
                amountPerUser,
                currentURI,
                userMessage
            );
        }
    }
}
