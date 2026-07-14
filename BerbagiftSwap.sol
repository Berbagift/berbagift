// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Interface untuk TokenRegistry
interface ITokenRegistry {
    function isValidToken(address _token) external view returns (bool);
    function getAllTokens() external view returns (address[] memory);
}

contract BerbagiftSwapMulti is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    address public platformWallet;
    uint256 public platformFeeBps = 50; // 50 / 10000 = 0.5%

    ITokenRegistry public tokenRegistry;

    struct Pool {
        uint256 reserveETH;
        uint256 reserveToken;
        uint256 totalLPSupply;
    }

    mapping(address => Pool) public pools;

    event Swap(
        address indexed caller,
        address indexed tokenPool,
        address indexed tokenIn,
        uint256 amountIn,
        uint256 amountOut,
        uint256 feeAmount,
        address feeToken // address(0) = ETH, atau address ERC20
    );

    event LiquidityAdded(
        address indexed provider,
        address indexed tokenPool,
        uint256 ethAmount,
        uint256 tokenAmount,
        uint256 lpMinted
    );

    event FeePaid(
        address indexed payer,
        address indexed platformWallet,
        address tokenUsed, // address(0) = ETH, atau address ERC20
        uint256 feeAmount
    );

    event FeePercentageUpdated(uint256 oldFee, uint256 newFee);
    event PlatformWalletUpdated(address oldWallet, address newWallet);
    event TokenRegistryUpdated(address oldRegistry, address newRegistry);

    constructor(
        address _platformWallet,
        address _tokenRegistry
    ) Ownable(msg.sender) {
        require(_platformWallet != address(0), "Platform wallet tidak valid");
        require(_tokenRegistry != address(0), "Token registry tidak valid");
        platformWallet = _platformWallet;
        tokenRegistry = ITokenRegistry(_tokenRegistry);
    }

    function setPlatformWallet(address _platformWallet) external onlyOwner {
        require(
            _platformWallet != address(0),
            "Alamat platform tidak boleh nol"
        );
        address oldWallet = platformWallet;
        platformWallet = _platformWallet;
        emit PlatformWalletUpdated(oldWallet, _platformWallet);
    }

    function setPlatformFeeBps(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 1000, "Fee maksimal 10%");
        uint256 oldFee = platformFeeBps;
        platformFeeBps = _feeBps;
        emit FeePercentageUpdated(oldFee, _feeBps);
    }

    function setTokenRegistry(address _tokenRegistry) external onlyOwner {
        require(_tokenRegistry != address(0), "Alamat registry tidak boleh nol");
        address oldRegistry = address(tokenRegistry);
        tokenRegistry = ITokenRegistry(_tokenRegistry);
        emit TokenRegistryUpdated(oldRegistry, _tokenRegistry);
    }

    function _isValidToken(address _token) internal view returns (bool) {
        return tokenRegistry.isValidToken(_token);
    }

    // ========================================================
    // LIQUIDITY
    // ========================================================

    function addLiquidity(
        address _token,
        uint256 _tokenAmount
    ) external payable nonReentrant {
        require(_isValidToken(_token), "Token tidak terdaftar di registry");
        require(msg.value > 0, "ETH harus lebih dari 0");
        require(_tokenAmount > 0, "Token harus lebih dari 0");

        Pool storage pool = pools[_token];
        uint256 lpToMint;

        if (pool.totalLPSupply == 0) {
            lpToMint = _sqrt(msg.value * _tokenAmount);
            require(lpToMint > 0, "Likuiditas terlalu kecil");
        } else {
            uint256 lpFromETH = (msg.value * pool.totalLPSupply) /
                pool.reserveETH;
            uint256 lpFromToken = (_tokenAmount * pool.totalLPSupply) /
                pool.reserveToken;
            lpToMint = lpFromETH < lpFromToken ? lpFromETH : lpFromToken;
            require(lpToMint > 0, "Likuiditas terlalu kecil");
        }

        IERC20(_token).safeTransferFrom(
            msg.sender,
            address(this),
            _tokenAmount
        );

        pool.reserveETH += msg.value;
        pool.reserveToken += _tokenAmount;
        pool.totalLPSupply += lpToMint;

        emit LiquidityAdded(
            msg.sender,
            _token,
            msg.value,
            _tokenAmount,
            lpToMint
        );
    }

    // ========================================================
    // SWAP ETH → TOKEN (fee dalam ETH)
    // ========================================================

    function swapETHForToken(
        address _token,
        uint256 _minTokenOut
    ) external payable nonReentrant {
        require(_isValidToken(_token), "Token tidak terdaftar di registry");
        require(msg.value > 0, "ETH harus lebih dari 0");

        Pool storage pool = pools[_token];
        require(
            pool.reserveETH > 0 && pool.reserveToken > 0,
            "Pool belum ada likuiditas"
        );

        uint256 amountIn = msg.value;
        // Fee diambil dari ETH input (token yang digunakan user)
        uint256 feeAmount = (amountIn * platformFeeBps) / 10000;
        uint256 amountInAfterFee = amountIn - feeAmount;

        uint256 amountOut = (pool.reserveToken * amountInAfterFee) /
            (pool.reserveETH + amountInAfterFee);

        require(amountOut > 0, "Output terlalu kecil");
        require(amountOut >= _minTokenOut, "Slippage terlalu tinggi");
        require(amountOut < pool.reserveToken, "Likuiditas tidak cukup");

        // Kirim fee ETH ke platform wallet
        if (feeAmount > 0) {
            (bool feeSuccess, ) = payable(platformWallet).call{
                value: feeAmount
            }("");
            require(feeSuccess, "Transfer fee ETH gagal");
            emit FeePaid(msg.sender, platformWallet, address(0), feeAmount);
        }

        // Hanya masukkan jumlah bersih ke dalam reserve
        pool.reserveETH += amountInAfterFee;
        pool.reserveToken -= amountOut;

        IERC20(_token).safeTransfer(msg.sender, amountOut);

        emit Swap(
            msg.sender,
            _token,
            address(0),
            amountIn,
            amountOut,
            feeAmount,
            address(0) // fee dalam ETH
        );
    }

    // ========================================================
    // SWAP TOKEN → ETH (fee dalam Token ERC20)
    // ========================================================

    function swapTokenForETH(
        address _token,
        uint256 _tokenAmountIn,
        uint256 _minETHOut
    ) external nonReentrant {
        require(_isValidToken(_token), "Token tidak terdaftar di registry");
        require(_tokenAmountIn > 0, "Token harus lebih dari 0");

        Pool storage pool = pools[_token];
        require(
            pool.reserveETH > 0 && pool.reserveToken > 0,
            "Pool belum ada likuiditas"
        );

        // Fee diambil dari token input (token yang digunakan user)
        uint256 feeAmount = (_tokenAmountIn * platformFeeBps) / 10000;
        uint256 amountInAfterFee = _tokenAmountIn - feeAmount;

        uint256 amountOut = (pool.reserveETH * amountInAfterFee) /
            (pool.reserveToken + amountInAfterFee);

        require(amountOut > 0, "Output terlalu kecil");
        require(amountOut >= _minETHOut, "Slippage terlalu tinggi");
        require(amountOut < pool.reserveETH, "Likuiditas tidak cukup");

        // Transfer seluruh token dari user ke contract
        IERC20(_token).safeTransferFrom(
            msg.sender,
            address(this),
            _tokenAmountIn
        );

        // Kirim fee token ke platform wallet
        if (feeAmount > 0) {
            IERC20(_token).safeTransfer(platformWallet, feeAmount);
            emit FeePaid(msg.sender, platformWallet, _token, feeAmount);
        }

        // Update reserves: hanya token bersih masuk pool
        pool.reserveToken += amountInAfterFee;
        pool.reserveETH -= amountOut;

        // Kirim ETH ke user
        (bool success, ) = payable(msg.sender).call{value: amountOut}("");
        require(success, "Transfer ETH gagal");

        emit Swap(
            msg.sender,
            _token,
            _token,
            _tokenAmountIn,
            amountOut,
            feeAmount,
            _token // fee dalam token ERC20
        );
    }

    // ========================================================
    // SWAP TOKEN → TOKEN (fee dalam Token ERC20 dan ETH)
    // ========================================================

    function swapTokenForToken(
        address _tokenIn,
        address _tokenOut,
        uint256 _tokenAmountIn,
        uint256 _minTokenOut
    ) external nonReentrant {
        require(_isValidToken(_tokenIn), "Token in tidak terdaftar");
        require(_isValidToken(_tokenOut), "Token out tidak terdaftar");
        require(_tokenIn != _tokenOut, "Token harus berbeda");
        require(_tokenAmountIn > 0, "Token harus lebih dari 0");

        Pool storage poolIn = pools[_tokenIn];
        Pool storage poolOut = pools[_tokenOut];

        require(
            poolIn.reserveETH > 0 && poolIn.reserveToken > 0,
            "Pool In belum ada likuiditas"
        );
        require(
            poolOut.reserveETH > 0 && poolOut.reserveToken > 0,
            "Pool Out belum ada likuiditas"
        );

        // Hop 1: TokenIn -> ETH
        uint256 feeAmountIn = (_tokenAmountIn * platformFeeBps) / 10000;
        uint256 amountInAfterFee = _tokenAmountIn - feeAmountIn;

        uint256 ethIntermediate = (poolIn.reserveETH * amountInAfterFee) /
            (poolIn.reserveToken + amountInAfterFee);

        require(ethIntermediate > 0, "Output ETH terlalu kecil");
        require(ethIntermediate < poolIn.reserveETH, "Likuiditas ETH pool In tidak cukup");

        // Hop 2: ETH -> TokenOut
        uint256 feeAmountETH = (ethIntermediate * platformFeeBps) / 10000;
        uint256 ethInAfterFee = ethIntermediate - feeAmountETH;

        uint256 amountOut = (poolOut.reserveToken * ethInAfterFee) /
            (poolOut.reserveETH + ethInAfterFee);

        require(amountOut > 0, "Output Token terlalu kecil");
        require(amountOut >= _minTokenOut, "Slippage terlalu tinggi");
        require(amountOut < poolOut.reserveToken, "Likuiditas Token pool Out tidak cukup");

        // 1. Transfer TokenIn dari user ke contract
        IERC20(_tokenIn).safeTransferFrom(
            msg.sender,
            address(this),
            _tokenAmountIn
        );

        // 2. Kirim fee TokenIn ke platform wallet
        if (feeAmountIn > 0) {
            IERC20(_tokenIn).safeTransfer(platformWallet, feeAmountIn);
            emit FeePaid(msg.sender, platformWallet, _tokenIn, feeAmountIn);
        }

        // 3. Kirim fee ETH ke platform wallet
        if (feeAmountETH > 0) {
            (bool feeSuccess, ) = payable(platformWallet).call{
                value: feeAmountETH
            }("");
            require(feeSuccess, "Transfer fee ETH gagal");
            emit FeePaid(msg.sender, platformWallet, address(0), feeAmountETH);
        }

        // 4. Update reserves
        poolIn.reserveToken += amountInAfterFee;
        poolIn.reserveETH -= ethIntermediate;

        poolOut.reserveETH += ethInAfterFee;
        poolOut.reserveToken -= amountOut;

        // 5. Kirim TokenOut ke user
        IERC20(_tokenOut).safeTransfer(msg.sender, amountOut);

        // 6. Emit events
        emit Swap(
            msg.sender,
            _tokenIn,
            _tokenIn,
            _tokenAmountIn,
            ethIntermediate,
            feeAmountIn,
            _tokenIn
        );

        emit Swap(
            msg.sender,
            _tokenOut,
            address(0),
            ethIntermediate,
            amountOut,
            feeAmountETH,
            address(0)
        );
    }

    // ========================================================
    // VIEW / ESTIMASI
    // ========================================================

    function getEstimatedTokenOut(
        address _token,
        uint256 _ethAmountIn
    ) external view returns (uint256 tokenOut, uint256 fee) {
        Pool memory pool = pools[_token];
        require(pool.reserveETH > 0 && pool.reserveToken > 0, "Pool kosong");
        fee = (_ethAmountIn * platformFeeBps) / 10000;
        uint256 amountInAfterFee = _ethAmountIn - fee;
        tokenOut =
            (pool.reserveToken * amountInAfterFee) /
            (pool.reserveETH + amountInAfterFee);
    }

    function getEstimatedETHOut(
        address _token,
        uint256 _tokenAmountIn
    ) external view returns (uint256 ethOut, uint256 fee) {
        Pool memory pool = pools[_token];
        require(pool.reserveETH > 0 && pool.reserveToken > 0, "Pool kosong");
        fee = (_tokenAmountIn * platformFeeBps) / 10000;
        uint256 amountInAfterFee = _tokenAmountIn - fee;
        ethOut =
            (pool.reserveETH * amountInAfterFee) /
            (pool.reserveToken + amountInAfterFee);
    }

    function getEstimatedTokenForTokenOut(
        address _tokenIn,
        address _tokenOut,
        uint256 _tokenAmountIn
    ) external view returns (uint256 tokenOut, uint256 feeIn, uint256 feeETH) {
        Pool memory poolIn = pools[_tokenIn];
        Pool memory poolOut = pools[_tokenOut];

        require(poolIn.reserveETH > 0 && poolIn.reserveToken > 0, "Pool In kosong");
        require(poolOut.reserveETH > 0 && poolOut.reserveToken > 0, "Pool Out kosong");

        feeIn = (_tokenAmountIn * platformFeeBps) / 10000;
        uint256 amountInAfterFee = _tokenAmountIn - feeIn;
        uint256 ethIntermediate = (poolIn.reserveETH * amountInAfterFee) /
            (poolIn.reserveToken + amountInAfterFee);

        feeETH = (ethIntermediate * platformFeeBps) / 10000;
        uint256 ethInAfterFee = ethIntermediate - feeETH;
        tokenOut = (poolOut.reserveToken * ethInAfterFee) /
            (poolOut.reserveETH + ethInAfterFee);
    }

    function getPriceETHinToken(
        address _token
    ) external view returns (uint256) {
        Pool memory pool = pools[_token];
        require(pool.reserveETH > 0, "Pool kosong");
        return (pool.reserveToken * 1e18) / pool.reserveETH;
    }

    function getPriceTokeninETH(
        address _token
    ) external view returns (uint256) {
        Pool memory pool = pools[_token];
        require(pool.reserveToken > 0, "Pool kosong");
        return (pool.reserveETH * 1e18) / pool.reserveToken;
    }

    // ========================================================
    // INTERNAL HELPERS
    // ========================================================

    function _sqrt(uint256 x) internal pure returns (uint256 y) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    receive() external payable {}
}
