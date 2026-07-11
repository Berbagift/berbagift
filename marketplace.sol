// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IGiftNFT {
    function nftDataMap(uint256 tokenId) external view returns (address recipient, address tokenUsed, uint256 tokenAmount);
}

contract LockedNFTMarketplace is ReentrancyGuard {
    // Referensi ke Contract NFT dan Token
    IERC721 public nftContract;
    IERC20 public xlmToken;
    IERC20 public rpkToken;

    // Struct untuk menyimpan data barang yang dijual
    struct Listing {
        address seller;
        address paymentToken; // Token yang dipilih penjual (XLM / RPK)
        uint256 price;
        bool isActive;
    }

    // Mapping dari Token ID ke Data Listing
    mapping(uint256 => Listing) public listings;

    // Events untuk kemudahan tracking di frontend/backend
    event ItemListed(
        address indexed seller,
        uint256 indexed tokenId,
        address paymentToken,
        uint256 price
    );
    event ItemSold(
        address indexed buyer,
        address indexed seller,
        uint256 indexed tokenId,
        address paymentToken,
        uint256 price
    );
    event ListingCanceled(address indexed seller, uint256 indexed tokenId);

    /**
     * @dev Constructor
     * Memasukkan alamat contract NFT yang terkunci, serta alamat token XLM dan RPK
     */
    constructor(address _nftAddress, address _xlmAddress, address _rpkAddress) {
        nftContract = IERC721(_nftAddress);
        xlmToken = IERC20(_xlmAddress);
        rpkToken = IERC20(_rpkAddress);
    }

    /**
     * @dev FUNGSI PENJUAL: Menjual NFT ke Marketplace
     */
    function listItem(
        uint256 tokenId,
        address paymentToken,
        uint256 price
    ) external {
        require(
            nftContract.ownerOf(tokenId) == msg.sender,
            "Anda bukan pemilik NFT ini"
        );
        require(price > 0, "Harga harus lebih dari 0");
        require(
            paymentToken == address(xlmToken) ||
                paymentToken == address(rpkToken),
            "Hanya menerima pembayaran XLM atau RPK"
        );

        // Pastikan NFT berasal dari sendgift (tercatat di nftDataMap contract NFT)
        (address originalRecipient, , ) = IGiftNFT(address(nftContract)).nftDataMap(tokenId);
        require(originalRecipient != address(0), "NFT bukan berasal dari sendgift");

        // Pastikan penjual sudah memberikan izin (Approve) ke contract marketplace ini
        require(
            nftContract.getApproved(tokenId) == address(this) ||
                nftContract.isApprovedForAll(msg.sender, address(this)),
            "Marketplace belum di-approve untuk NFT ini"
        );

        listings[tokenId] = Listing({
            seller: msg.sender, // Alamat penjual otomatis tersimpan di sini
            paymentToken: paymentToken,
            price: price,
            isActive: true
        });

        emit ItemListed(msg.sender, tokenId, paymentToken, price);
    }

    /**
     * @dev FUNGSI PEMBELI: Membeli NFT yang sedang di-listing
     */
    function buyItem(uint256 tokenId) external nonReentrant {
        Listing memory listedItem = listings[tokenId];

        require(listedItem.isActive, "NFT ini tidak sedang dijual");
        require(
            listedItem.seller != msg.sender,
            "Tidak bisa membeli NFT sendiri"
        );

        // 1. Tandai listing tidak aktif
        listings[tokenId].isActive = false;

        // 2. Proses Pembayaran (Pembeli -> Penjual)
        IERC20 payToken = IERC20(listedItem.paymentToken);
        bool paymentSuccess = payToken.transferFrom(
            msg.sender,
            listedItem.seller,
            listedItem.price
        );
        require(paymentSuccess, "Transfer pembayaran gagal");

        // 3. Proses Transfer NFT (Penjual -> Pembeli)
        nftContract.safeTransferFrom(listedItem.seller, msg.sender, tokenId);

        emit ItemSold(
            msg.sender,
            listedItem.seller,
            tokenId,
            listedItem.paymentToken,
            listedItem.price
        );
    }

    /**
     * @dev FUNGSI PENJUAL: Membatalkan penjualan NFT
     */
    function cancelListing(uint256 tokenId) external {
        Listing memory listedItem = listings[tokenId];

        require(listedItem.isActive, "NFT ini tidak sedang dijual");
        require(
            listedItem.seller == msg.sender,
            "Hanya penjual yang bisa membatalkan"
        );

        listings[tokenId].isActive = false;

        emit ListingCanceled(msg.sender, tokenId);
    }

    // ========================================================
    // FUNGSI BANTUAN (VIEW) UNTUK FRONTEND
    // ========================================================

    /**
     * @dev Mengambil detail lengkap dari NFT yang dijual (Return berupa struct)
     */
    function getListingDetail(
        uint256 tokenId
    ) external view returns (Listing memory) {
        return listings[tokenId];
    }

    /**
     * @dev Mengambil spesifik alamat dompet penjual dari NFT tertentu
     */
    function getSeller(uint256 tokenId) external view returns (address) {
        return listings[tokenId].seller;
    }
}
