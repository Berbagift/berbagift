// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Interface khusus untuk memanggil fungsi mint internal dari NFT contract pertama Anda
interface IBerbagiftNFT {
    function mintFromMarketplace(
        address recipient,
        string calldata customTokenURI
    ) external returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
    function isApprovedForAll(
        address owner,
        address operator
    ) external view returns (bool);
}

// Interface untuk TokenRegistry
interface ITokenRegistry {
    function isValidToken(address _token) external view returns (bool);
    function getAllTokens() external view returns (address[] memory);
}

contract BerbagiftMarketplace is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IBerbagiftNFT public nftContract;
    ITokenRegistry public tokenRegistry;

    address public platformWallet;
    uint256 public feePercentage = 5; // 5 / 1000 = 0.5%

    struct Listing {
        address seller;
        uint256 price;
        address paymentToken; // address(0) = ETH, RPK address = RPK
        bool isActive;
    }

    mapping(uint256 => Listing) public listings;

    event NFTListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        address paymentToken
    );
    event TokenRegistryUpdated(address oldRegistry, address newRegistry);
    event NFTBought(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        address paymentToken
    );
    event ListingCanceled(uint256 indexed tokenId, address indexed seller);
    event FeePaid(
        address indexed payer,
        address indexed platformWallet,
        address tokenUsed, // address(0) = ETH, atau address ERC20
        uint256 feeAmount
    );
    event FeePercentageUpdated(uint256 oldFee, uint256 newFee);

    constructor(
        address _nftAddress,
        address _tokenRegistry
    ) Ownable(msg.sender) {
        nftContract = IBerbagiftNFT(_nftAddress);
        tokenRegistry = ITokenRegistry(_tokenRegistry);
        platformWallet = msg.sender;
    }

    function setPlatformWallet(address _platformWallet) external onlyOwner {
        require(
            _platformWallet != address(0),
            "Alamat platform tidak boleh nol"
        );
        platformWallet = _platformWallet;
    }

    function setFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 100, "Fee maksimal 10%");
        uint256 oldFee = feePercentage;
        feePercentage = _feePercentage;
        emit FeePercentageUpdated(oldFee, _feePercentage);
    }

    function setTokenRegistry(address _tokenRegistry) external onlyOwner {
        require(_tokenRegistry != address(0), "Alamat registry tidak boleh nol");
        address oldRegistry = address(tokenRegistry);
        tokenRegistry = ITokenRegistry(_tokenRegistry);
        emit TokenRegistryUpdated(oldRegistry, _tokenRegistry);
    }

    function _isValidPaymentToken(address _token) internal view returns (bool) {
        return tokenRegistry.isValidToken(_token);
    }

    // ========================================================
    // MINT & LIST
    // ========================================================

    /// @notice Mint NFT baru dan langsung list di marketplace
    /// @param _customTokenURI URI metadata NFT
    /// @param _price Harga listing
    /// @param _paymentToken address(0) untuk ETH, atau address ERC20 yang terdaftar
    /// @dev Fee listing (0.5%) menggunakan token yang sama dengan paymentToken
    function customMintAndList(
        string calldata _customTokenURI,
        uint256 _price,
        address _paymentToken
    ) external payable nonReentrant {
        require(_price > 0, "Harga harus lebih besar dari 0");
        require(_isValidPaymentToken(_paymentToken), "Token pembayaran tidak didukung");

        uint256 listingFee = (_price * feePercentage) / 1000;

        if (_paymentToken == address(0)) {
            // Fee dalam ETH
            require(msg.value == listingFee, "Fee listing ETH tidak sesuai");
            if (listingFee > 0) {
                (bool feeSuccess, ) = payable(platformWallet).call{value: listingFee}("");
                require(feeSuccess, "Transfer fee listing gagal");
                emit FeePaid(msg.sender, platformWallet, address(0), listingFee);
            }
        } else {
            // Fee dalam ERC20 (user harus approve terlebih dahulu)
            require(msg.value == 0, "Jangan kirim ETH untuk listing ERC20");
            if (listingFee > 0) {
                IERC20(_paymentToken).safeTransferFrom(msg.sender, platformWallet, listingFee);
                emit FeePaid(msg.sender, platformWallet, _paymentToken, listingFee);
            }
        }

        uint256 newId = nftContract.mintFromMarketplace(
            msg.sender,
            _customTokenURI
        );

        require(
            nftContract.isApprovedForAll(msg.sender, address(this)),
            "Marketplace membutuhkan approval global (setApprovalForAll) dari Anda terlebih dahulu"
        );

        listings[newId] = Listing({
            seller: msg.sender,
            price: _price,
            paymentToken: _paymentToken,
            isActive: true
        });

        emit NFTListed(newId, msg.sender, _price, _paymentToken);
    }

    // ========================================================
    // FUNGSI UTAMA MARKETPLACE
    // ========================================================

    /// @notice List NFT yang sudah dimiliki di marketplace
    /// @param _tokenId ID NFT yang akan dijual
    /// @param _price Harga listing
    /// @param _paymentToken address(0) untuk ETH, atau address ERC20 yang terdaftar
    /// @dev Fee listing (0.5%) menggunakan token yang sama dengan paymentToken
    function listNFT(
        uint256 _tokenId,
        uint256 _price,
        address _paymentToken
    ) external payable {
        require(_price > 0, "Harga harus lebih besar dari 0");
        require(_isValidPaymentToken(_paymentToken), "Token pembayaran tidak didukung");
        require(
            nftContract.ownerOf(_tokenId) == msg.sender,
            "Anda bukan pemilik NFT ini"
        );

        uint256 listingFee = (_price * feePercentage) / 1000;

        if (_paymentToken == address(0)) {
            // Fee dalam ETH
            require(msg.value == listingFee, "Fee listing ETH tidak sesuai");
            if (listingFee > 0) {
                (bool feeSuccess, ) = payable(platformWallet).call{value: listingFee}("");
                require(feeSuccess, "Transfer fee listing gagal");
                emit FeePaid(msg.sender, platformWallet, address(0), listingFee);
            }
        } else {
            // Fee dalam ERC20
            require(msg.value == 0, "Jangan kirim ETH untuk listing ERC20");
            if (listingFee > 0) {
                IERC20(_paymentToken).safeTransferFrom(msg.sender, platformWallet, listingFee);
                emit FeePaid(msg.sender, platformWallet, _paymentToken, listingFee);
            }
        }

        listings[_tokenId] = Listing({
            seller: msg.sender,
            price: _price,
            paymentToken: _paymentToken,
            isActive: true
        });

        emit NFTListed(_tokenId, msg.sender, _price, _paymentToken);
    }

    /// @notice Beli NFT dari marketplace
    /// @param _tokenId ID NFT yang akan dibeli
    /// @dev Jika listing pakai ETH: kirim msg.value = price (fee dipotong dari payment)
    /// @dev Jika listing pakai ERC20: approve ERC20 = price, tidak perlu kirim ETH
    function buyNFT(uint256 _tokenId) external payable nonReentrant {
        Listing storage listing = listings[_tokenId];
        require(listing.isActive, "NFT ini tidak sedang dijual");

        address seller = listing.seller;
        uint256 price = listing.price;
        address paymentToken = listing.paymentToken;

        require(
            nftContract.ownerOf(_tokenId) == seller,
            "Penjual bukan lagi pemilik NFT"
        );

        listing.isActive = false;

        uint256 feeAmount = (price * feePercentage) / 1000;
        uint256 sellerAmount = price - feeAmount;

        if (paymentToken == address(0)) {
            // ========== PEMBAYARAN DENGAN ETH ==========
            require(msg.value == price, "Nominal ETH tidak sesuai harga NFT");

            // Transfer fee ETH ke platform wallet
            if (feeAmount > 0) {
                (bool feeSuccess, ) = payable(platformWallet).call{value: feeAmount}("");
                require(feeSuccess, "Transfer fee gagal");
                emit FeePaid(msg.sender, platformWallet, address(0), feeAmount);
            }

            // Transfer sisa ETH ke seller
            (bool success, ) = payable(seller).call{value: sellerAmount}("");
            require(success, "Transfer pembayaran ke seller gagal");
        } else {
            // ========== PEMBAYARAN DENGAN ERC20 ==========
            require(msg.value == 0, "Jangan kirim ETH untuk pembelian ERC20");

            // Transfer fee ERC20 ke platform wallet
            if (feeAmount > 0) {
                IERC20(paymentToken).safeTransferFrom(msg.sender, platformWallet, feeAmount);
                emit FeePaid(msg.sender, platformWallet, paymentToken, feeAmount);
            }

            // Transfer sisa ERC20 ke seller
            IERC20(paymentToken).safeTransferFrom(msg.sender, seller, sellerAmount);
        }

        // Memindahkan NFT dari penjual ke pembeli
        (bool nftSuccess, ) = address(nftContract).call(
            abi.encodeWithSignature(
                "safeTransferFrom(address,address,uint256)",
                seller,
                msg.sender,
                _tokenId
            )
        );
        require(nftSuccess, "Transfer NFT gagal");

        emit NFTBought(_tokenId, msg.sender, seller, price, paymentToken);
    }

    function cancelListing(uint256 _tokenId) external {
        Listing storage listing = listings[_tokenId];
        require(listing.isActive, "NFT ini tidak sedang dijual");
        require(listing.seller == msg.sender, "Anda bukan penjual NFT ini");

        listing.isActive = false;

        emit ListingCanceled(_tokenId, msg.sender);
    }
}
