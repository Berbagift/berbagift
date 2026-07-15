// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title BerbagiftTokenRegistry
/// @notice Registry token pembayaran yang diizinkan di platform Berbagift.
///         Dipakai oleh Marketplace, Swap, Gift, dll.
///         Hanya admin (owner) yang bisa menambah/menghapus token.
///         ETH (address(0)) selalu diizinkan tanpa perlu didaftarkan.
contract BerbagiftTokenRegistry is Ownable {
    mapping(address => bool) public isAllowed;
    address[] public tokenList;

    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);

    constructor() Ownable(msg.sender) {}

    /// @notice Tambahkan token ERC20 sebagai opsi pembayaran
    function addToken(address _token) external onlyOwner {
        require(_token != address(0), "Gunakan address(0) untuk ETH");
        require(!isAllowed[_token], "Token sudah terdaftar");

        isAllowed[_token] = true;
        tokenList.push(_token);
        emit TokenAdded(_token);
    }

    /// @notice Hapus token ERC20 dari daftar
    function removeToken(address _token) external onlyOwner {
        require(_token != address(0), "ETH tidak bisa dihapus");
        require(isAllowed[_token], "Token belum terdaftar");

        isAllowed[_token] = false;

        for (uint256 i = 0; i < tokenList.length; i++) {
            if (tokenList[i] == _token) {
                tokenList[i] = tokenList[tokenList.length - 1];
                tokenList.pop();
                break;
            }
        }
        emit TokenRemoved(_token);
    }

    /// @notice Cek apakah token valid (ETH selalu valid)
    function isValidToken(address _token) external view returns (bool) {
        return _token == address(0) || isAllowed[_token];
    }

    /// @notice Ambil semua daftar token yang diizinkan
    function getAllTokens() external view returns (address[] memory) {
        return tokenList;
    }

    /// @notice Jumlah token yang terdaftar (tidak termasuk ETH)
    function tokenCount() external view returns (uint256) {
        return tokenList.length;
    }
}
