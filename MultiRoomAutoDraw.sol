// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// Interface untuk TokenRegistry
interface ITokenRegistry {
    function isValidToken(address _token) external view returns (bool);
    function getAllTokens() external view returns (address[] memory);
}

contract BerbagiftRoom is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    ITokenRegistry public tokenRegistry;

    // Karena otomatis, status FULL dilewati, langsung dari OPEN ke COMPLETED
    enum RoomState {
        OPEN,
        COMPLETED
    }

    struct Room {
        address admin;
        address rewardToken;
        uint256 capacity;
        uint256 totalWinners;
        uint256 claimSessionStart;
        uint256 rewardPool;
        address[] participants;
        RoomState state;
        uint256 rewardPerWinner;
    }

    address public platformWallet;
    uint256 public feePercentage = 5; // 5 / 1000 = 0.5%

    uint256 public roomCount;
    mapping(uint256 => Room) public rooms;

    mapping(uint256 => mapping(address => bool)) public hasJoined;
    mapping(uint256 => mapping(address => bool)) public isWinner;
    mapping(uint256 => mapping(address => bool)) public isRewardClaimed;

    event RoomCreated(
        uint256 indexed roomId,
        address indexed admin,
        string title,
        string description,
        uint256 capacity,
        uint256 totalWinners,
        uint256 claimSessionStart,
        uint256 totalReward,
        address rewardToken
    );
    event UserJoined(
        uint256 indexed roomId,
        address indexed user,
        uint256 totalJoined
    );
    event GiveawayCompleted(
        uint256 indexed roomId,
        address[] winners,
        uint256 rewardPerWinner
    );
    event RewardClaimed(
        uint256 indexed roomId,
        address indexed winner,
        uint256 amount,
        address rewardToken
    );
    event FeePaid(
        address indexed payer,
        address indexed platformWallet,
        address tokenUsed,
        uint256 feeAmount
    );
    event FeePercentageUpdated(uint256 oldFee, uint256 newFee);
    event TokenRegistryUpdated(address oldRegistry, address newRegistry);

    constructor(address _platformWallet, address _tokenRegistry) Ownable(msg.sender) {
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

    function createRoom(
        string memory _title,
        string memory _description,
        uint256 _capacity,
        uint256 _totalWinners,
        uint256 _claimSessionStart,
        address _token,
        uint256 _totalTokenAmount
    ) external payable nonReentrant {
        require(tokenRegistry.isValidToken(_token), "Token tidak terdaftar");
        require(_capacity > 0, "Kapasitas harus lebih dari 0");
        require(
            _totalWinners > 0 && _totalWinners <= _capacity,
            "Total pemenang tidak valid"
        );
        
        uint256 totalReward = _token == address(0) ? msg.value : _totalTokenAmount;
        require(totalReward > 0, "Reward harus lebih dari 0");

        if (_token != address(0)) {
            require(msg.value == 0, "Jangan kirim ETH jika pakai ERC20");
        }

        uint256 fee = (totalReward * feePercentage) / 1000;
        uint256 actualRewardPool = totalReward - fee;

        if (fee > 0) {
            if (_token == address(0)) {
                (bool success, ) = payable(platformWallet).call{value: fee}("");
                require(success, "Gagal mengirim fee ETH");
            } else {
                IERC20(_token).safeTransferFrom(msg.sender, platformWallet, fee);
            }
            emit FeePaid(msg.sender, platformWallet, _token, fee);
        }

        if (_token != address(0) && actualRewardPool > 0) {
            IERC20(_token).safeTransferFrom(msg.sender, address(this), actualRewardPool);
        }

        uint256 currentRoomId = roomCount;
        Room storage newRoom = rooms[currentRoomId];

        newRoom.admin = msg.sender;
        newRoom.rewardToken = _token;
        newRoom.capacity = _capacity;
        newRoom.totalWinners = _totalWinners;
        newRoom.claimSessionStart = _claimSessionStart;
        newRoom.rewardPool = actualRewardPool;
        newRoom.state = RoomState.OPEN;

        roomCount++;

        emit RoomCreated(
            currentRoomId,
            msg.sender,
            _title,
            _description,
            _capacity,
            _totalWinners,
            _claimSessionStart,
            totalReward,
            _token
        );
    }

    function joinRoom(uint256 _roomId) external nonReentrant {
        require(_roomId < roomCount, "Room tidak ditemukan");
        Room storage room = rooms[_roomId];

        require(room.state == RoomState.OPEN, "Room sudah ditutup/selesai");
        require(
            block.timestamp >= room.claimSessionStart,
            "Sesi belum dimulai"
        );
        require(
            msg.sender != room.admin,
            "Admin tidak boleh join room sendiri"
        );
        require(!hasJoined[_roomId][msg.sender], "Anda sudah join room ini");
        require(room.participants.length < room.capacity, "Room sudah penuh");

        room.participants.push(msg.sender);
        hasJoined[_roomId][msg.sender] = true;

        emit UserJoined(_roomId, msg.sender, room.participants.length);

        if (room.participants.length == room.capacity) {
            _autoDrawWinners(_roomId);
        }
    }

    function _autoDrawWinners(uint256 _roomId) internal {
        Room storage room = rooms[_roomId];

        room.state = RoomState.COMPLETED;

        uint256 totalWinners = room.totalWinners;
        room.rewardPerWinner = room.rewardPool / totalWinners;

        address[] memory tempParticipants = room.participants;
        uint256 availableParticipants = tempParticipants.length;
        address[] memory winners = new address[](totalWinners);

        // Algoritma Pengundian
        for (uint256 i = 0; i < totalWinners; i++) {
            uint256 randomIndex = uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.prevrandao,
                        i,
                        _roomId
                    )
                )
            ) % availableParticipants;

            address winner = tempParticipants[randomIndex];
            winners[i] = winner;

            isWinner[_roomId][winner] = true;

            // Swap elemen agar tidak terpilih dua kali
            tempParticipants[randomIndex] = tempParticipants[
                availableParticipants - 1
            ];
            availableParticipants--;
        }

        emit GiveawayCompleted(_roomId, winners, room.rewardPerWinner);
    }

    function claimReward(uint256 _roomId) external nonReentrant {
        require(_roomId < roomCount, "Room tidak ditemukan");
        Room storage room = rooms[_roomId];

        require(room.state == RoomState.COMPLETED, "Pengundian belum selesai");
        require(
            isWinner[_roomId][msg.sender],
            "Anda bukan pemenang di room ini"
        );
        require(
            !isRewardClaimed[_roomId][msg.sender],
            "Hadiah sudah diklaim sebelumnya"
        );

        isRewardClaimed[_roomId][msg.sender] = true;

        uint256 amount = room.rewardPerWinner;
        address token = room.rewardToken;

        if (token == address(0)) {
            (bool success, ) = payable(msg.sender).call{value: amount}("");
            require(success, "Gagal klaim ETH");
        } else {
            IERC20(token).safeTransfer(msg.sender, amount);
        }

        emit RewardClaimed(_roomId, msg.sender, amount, token);
    }

    function getParticipants(
        uint256 _roomId
    ) external view returns (address[] memory) {
        return rooms[_roomId].participants;
    }
}
