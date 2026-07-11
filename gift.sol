// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BundleBatchTransferXLMRPK is ERC721URIStorage, Ownable {
    // Interface spesifik untuk token XLM (ERC-20) dan RPK
    IERC20 public xlmToken;
    IERC20 public rpkToken;

    // Alamat Smart Contract Marketplace Resmi
    address public marketplaceAddress;

    // Counter untuk ID NFT
    uint256 private _currentTokenID = 0;

    // Flag Kunci Cadangan untuk mengirim NFT yang sudah ada
    bool private _isSendingExistingGift = false;

    // Struct untuk menyimpan data on-chain
    struct NFTData {
        address recipient;
        address tokenUsed;
        uint256 tokenAmount;
    }

    // Mapping public agar compiler otomatis membuat fungsi getter
    mapping(uint256 => NFTData) public nftDataMap;

    // Event untuk tracking di blockchain
    event BundleSent(
        address indexed sender,
        address indexed recipient,
        uint256 indexed nftTokenId,
        address tokenUsed,
        uint256 tokenAmount,
        string tokenURI,
        string message
    );

    constructor(
        address _xlmAddress,
        address _rpkAddress
    ) ERC721("Batch Bundle NFT", "BBNFT") Ownable(msg.sender) {
        xlmToken = IERC20(_xlmAddress);
        rpkToken = IERC20(_rpkAddress);
    }

    function setMarketplaceAddress(address _marketplace) external onlyOwner {
        marketplaceAddress = _marketplace;
    }

    // ========================================================
    // FUNGSI 1 & 2: MINTING NFT BARU (Seperti Sebelumnya)
    // ========================================================

    function sendBatchXLMAndNFT(
        address[] calldata recipients,
        uint256[] calldata tokenAmounts,
        string[] calldata customTokenURIs,
        string[] calldata messages
    ) external {
        uint256 totalRecipients = recipients.length;
        require(totalRecipients <= 3, "Maksimal 3 user");
        require(totalRecipients > 0, "Daftar kosong");
        require(
            totalRecipients == tokenAmounts.length &&
                totalRecipients == customTokenURIs.length,
            "Panjang array tidak sama"
        );
        require(
            messages.length == 0 || messages.length == totalRecipients,
            "Panjang array pesan tidak valid"
        );

        address xlmAddress = address(xlmToken);

        for (uint256 i = 0; i < totalRecipients; i++) {
            address recipient = recipients[i];
            uint256 amount = tokenAmounts[i];
            string memory customTokenURI = customTokenURIs[i];
            string memory userMessage = messages.length > 0 ? messages[i] : "";

            require(recipient != address(0), "Zero address");
            require(amount > 0, "Amount > 0");

            bool success = xlmToken.transferFrom(msg.sender, recipient, amount);
            require(success, "Transfer XLM gagal");

            _currentTokenID++;
            uint256 newItemID = _currentTokenID;

            nftDataMap[newItemID] = NFTData({
                recipient: recipient,
                tokenUsed: xlmAddress,
                tokenAmount: amount
            });

            _mint(recipient, newItemID);
            _setTokenURI(newItemID, customTokenURI);

            emit BundleSent(
                msg.sender,
                recipient,
                newItemID,
                xlmAddress,
                amount,
                customTokenURI,
                userMessage
            );
        }
    }

    function sendBatchRPKAndNFT(
        address[] calldata recipients,
        uint256[] calldata tokenAmounts,
        string[] calldata customTokenURIs,
        string[] calldata messages
    ) external {
        uint256 totalRecipients = recipients.length;
        require(totalRecipients <= 3, "Maksimal 3 user");
        require(totalRecipients > 0, "Daftar kosong");
        require(
            totalRecipients == tokenAmounts.length &&
                totalRecipients == customTokenURIs.length,
            "Panjang array tidak sama"
        );
        require(
            messages.length == 0 || messages.length == totalRecipients,
            "Panjang array pesan tidak valid"
        );

        address rpkAddress = address(rpkToken);

        for (uint256 i = 0; i < totalRecipients; i++) {
            address recipient = recipients[i];
            uint256 amount = tokenAmounts[i];
            string memory customTokenURI = customTokenURIs[i];
            string memory userMessage = messages.length > 0 ? messages[i] : "";

            require(recipient != address(0), "Zero address");
            require(amount > 0, "Amount > 0");

            bool success = rpkToken.transferFrom(msg.sender, recipient, amount);
            require(success, "Transfer RPK gagal");

            _currentTokenID++;
            uint256 newItemID = _currentTokenID;

            nftDataMap[newItemID] = NFTData({
                recipient: recipient,
                tokenUsed: rpkAddress,
                tokenAmount: amount
            });

            _mint(recipient, newItemID);
            _setTokenURI(newItemID, customTokenURI);

            emit BundleSent(
                msg.sender,
                recipient,
                newItemID,
                rpkAddress,
                amount,
                customTokenURI,
                userMessage
            );
        }
    }

    // ========================================================
    // FUNGSI 3 & 4: MENGIRIM NFT YANG SUDAH ADA (BARU)
    // ========================================================

    /**
     * @dev Mengirim NFT yang sudah dimiliki beserta token XLM
     */
    function sendBatchExistingXLMAndNFT(
        address[] calldata recipients,
        uint256[] calldata tokenIds, // Gunakan ID NFT yang sudah ada
        uint256[] calldata tokenAmounts,
        string[] calldata messages
    ) external {
        uint256 totalRecipients = recipients.length;
        require(totalRecipients <= 3, "Maksimal 3 user");
        require(totalRecipients > 0, "Daftar kosong");
        require(
            totalRecipients == tokenIds.length &&
                totalRecipients == tokenAmounts.length,
            "Panjang array tidak sama"
        );
        require(
            messages.length == 0 || messages.length == totalRecipients,
            "Panjang array pesan tidak valid"
        );

        address xlmAddress = address(xlmToken);

        // Buka Kunci Sementara
        _isSendingExistingGift = true;

        for (uint256 i = 0; i < totalRecipients; i++) {
            address recipient = recipients[i];
            uint256 tokenId = tokenIds[i];
            uint256 amount = tokenAmounts[i];
            string memory userMessage = messages.length > 0 ? messages[i] : "";

            require(recipient != address(0), "Zero address");
            require(amount > 0, "Amount > 0");
            require(
                ownerOf(tokenId) == msg.sender,
                "Anda bukan pemilik NFT ini"
            );

            // 1. Transfer XLM
            bool success = xlmToken.transferFrom(msg.sender, recipient, amount);
            require(success, "Transfer XLM gagal");

            // 2. Transfer NFT
            _transfer(msg.sender, recipient, tokenId);

            // 3. Update Data di Mapping
            nftDataMap[tokenId] = NFTData({
                recipient: recipient,
                tokenUsed: xlmAddress,
                tokenAmount: amount
            });

            emit BundleSent(
                msg.sender,
                recipient,
                tokenId,
                xlmAddress,
                amount,
                tokenURI(tokenId),
                userMessage
            );
        }

        // Tutup Kunci Kembali
        _isSendingExistingGift = false;
    }

    /**
     * @dev Mengirim NFT yang sudah dimiliki beserta token RPK
     */
    function sendBatchExistingRPKAndNFT(
        address[] calldata recipients,
        uint256[] calldata tokenIds,
        uint256[] calldata tokenAmounts,
        string[] calldata messages
    ) external {
        uint256 totalRecipients = recipients.length;
        require(totalRecipients <= 3, "Maksimal 3 user");
        require(totalRecipients > 0, "Daftar kosong");
        require(
            totalRecipients == tokenIds.length &&
                totalRecipients == tokenAmounts.length,
            "Panjang array tidak sama"
        );
        require(
            messages.length == 0 || messages.length == totalRecipients,
            "Panjang array pesan tidak valid"
        );

        address rpkAddress = address(rpkToken);

        // Buka Kunci Sementara
        _isSendingExistingGift = true;

        for (uint256 i = 0; i < totalRecipients; i++) {
            address recipient = recipients[i];
            uint256 tokenId = tokenIds[i];
            uint256 amount = tokenAmounts[i];
            string memory userMessage = messages.length > 0 ? messages[i] : "";

            require(recipient != address(0), "Zero address");
            require(amount > 0, "Amount > 0");
            require(
                ownerOf(tokenId) == msg.sender,
                "Anda bukan pemilik NFT ini"
            );

            // 1. Transfer RPK
            bool success = rpkToken.transferFrom(msg.sender, recipient, amount);
            require(success, "Transfer RPK gagal");

            // 2. Transfer NFT
            _transfer(msg.sender, recipient, tokenId);

            // 3. Update Data di Mapping
            nftDataMap[tokenId] = NFTData({
                recipient: recipient,
                tokenUsed: rpkAddress,
                tokenAmount: amount
            });

            emit BundleSent(
                msg.sender,
                recipient,
                tokenId,
                rpkAddress,
                amount,
                tokenURI(tokenId),
                userMessage
            );
        }

        // Tutup Kunci Kembali
        _isSendingExistingGift = false;
    }

    // ========================================================
    // FUNGSI BLOKIR TRANSFER (SATPAM)
    // ========================================================

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);

        // Aturan Tambahan:
        // _isSendingExistingGift == true (Izinkan jalur resmi dari fungsi sendBatchExisting)
        require(
            from == address(0) ||
                msg.sender == marketplaceAddress ||
                _isSendingExistingGift,
            "NFT ini terkunci! Hanya bisa dijual/ditransfer melalui Marketplace Resmi"
        );

        return super._update(to, tokenId, auth);
    }
}
