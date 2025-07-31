// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BundlRegistry.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    function balanceOf(address account) external view returns (uint256);
}

interface IAccount {
    function execute(
        address target,
        uint256 value,
        bytes calldata data
    ) external returns (bytes memory);
}

contract BundlCore is ERC721, Ownable {
    uint256 public nextTokenId;
    BundlRegistry public registry;
    address public walletLogic;

    // Store folder metadata on-chain
    mapping(uint256 => string) public folderNames;
    mapping(uint256 => uint256) public folderCreationTime;
    mapping(address => uint256[]) public userFolders;
    mapping(uint256 => address[]) public folderTokens;
    mapping(uint256 => mapping(address => bool)) public folderHasToken;

    event FolderCreated(
        uint256 indexed tokenId,
        address indexed owner,
        string name,
        address indexed wallet
    );
    event TokensAddedToFolder(
        uint256 indexed tokenId,
        address indexed token,
        uint256 amount,
        address indexed user
    );
    event ETHAddedToFolder(
        uint256 indexed tokenId,
        uint256 amount,
        address indexed user
    );
    event FolderTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to
    );

    constructor(
        address _registry,
        address _walletLogic
    ) ERC721("Bundl Folder", "BNDL") {
        registry = BundlRegistry(_registry);
        walletLogic = _walletLogic;
    }

    function createFolder(
        string memory name
    ) external returns (uint256 tokenId, address wallet) {
        tokenId = nextTokenId++;
        _mint(msg.sender, tokenId);

        // Store folder metadata on-chain
        folderNames[tokenId] = name;
        folderCreationTime[tokenId] = block.timestamp;
        userFolders[msg.sender].push(tokenId);

        wallet = registry.account(
            walletLogic,
            block.chainid,
            address(this),
            tokenId,
            0
        );

        emit FolderCreated(tokenId, msg.sender, name, wallet);
    }

    function getWallet(uint256 tokenId) public view returns (address) {
        return
            registry.account(
                walletLogic,
                block.chainid,
                address(this),
                tokenId,
                0
            );
    }

    // Get all folders owned by a user
    function getUserFolders(
        address user
    ) external view returns (uint256[] memory) {
        uint256[] memory ownedFolders = new uint256[](balanceOf(user));
        uint256 index = 0;

        for (uint256 i = 0; i < nextTokenId; i++) {
            if (_exists(i) && ownerOf(i) == user) {
                ownedFolders[index] = i;
                index++;
            }
        }

        return ownedFolders;
    }

    // Get folder metadata
    function getFolderInfo(
        uint256 tokenId
    )
        external
        view
        returns (
            string memory name,
            address owner,
            address wallet,
            uint256 creationTime,
            uint256 tokenCount
        )
    {
        require(_exists(tokenId), "Folder does not exist");

        return (
            folderNames[tokenId],
            ownerOf(tokenId),
            getWallet(tokenId),
            folderCreationTime[tokenId],
            folderTokens[tokenId].length
        );
    }

    // Update folder name (only owner can do this)
    function updateFolderName(uint256 tokenId, string memory newName) external {
        require(_exists(tokenId), "Folder does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not folder owner");

        folderNames[tokenId] = newName;
    }

    function transferTokens(
        uint256 fromTokenId,
        uint256 toTokenId,
        address token,
        uint256 amount
    ) external {
        address fromWallet = getWallet(fromTokenId);
        address toWallet = getWallet(toTokenId);

        bytes memory data = abi.encodeWithSelector(
            IERC20.transfer.selector,
            toWallet,
            amount
        );
        IAccount(fromWallet).execute(token, 0, data);
    }

    function executeFromFolder(
        uint256 tokenId,
        address target,
        uint256 value,
        bytes calldata data
    ) external {
        require(ownerOf(tokenId) == msg.sender, "Not folder owner");
        address wallet = getWallet(tokenId);
        IAccount(wallet).execute(target, value, data);
    }

    function addTokensToFolder(
        uint256 tokenId,
        address token,
        uint256 amount
    ) external {
        require(_exists(tokenId), "Folder does not exist");

        address folderWallet = getWallet(tokenId);

        IERC20(token).transferFrom(msg.sender, folderWallet, amount);

        if (!folderHasToken[tokenId][token]) {
            folderTokens[tokenId].push(token);
            folderHasToken[tokenId][token] = true;
        }

        emit TokensAddedToFolder(tokenId, token, amount, msg.sender);
    }

    function addETHToFolder(uint256 tokenId) external payable {
        require(_exists(tokenId), "Folder does not exist");
        require(msg.value > 0, "Must send ETH");

        address folderWallet = getWallet(tokenId);

        (bool success, ) = folderWallet.call{value: msg.value}("");
        require(success, "ETH transfer failed");

        if (!folderHasToken[tokenId][address(0)]) {
            folderTokens[tokenId].push(address(0));
            folderHasToken[tokenId][address(0)] = true;
        }

        emit ETHAddedToFolder(tokenId, msg.value, msg.sender);
    }

    function getFolderTokenAddresses(
        uint256 tokenId
    ) external view returns (address[] memory) {
        return folderTokens[tokenId];
    }

    function getFolderTokenBalance(
        uint256 tokenId,
        address token
    ) external view returns (uint256) {
        address folderWallet = getWallet(tokenId);
        return IERC20(token).balanceOf(folderWallet);
    }

    function getFolderETHBalance(
        uint256 tokenId
    ) external view returns (uint256) {
        address folderWallet = getWallet(tokenId);
        return folderWallet.balance;
    }

    // Get total ETH value across all user's folders
    function getUserTotalETHBalance(
        address user
    ) external view returns (uint256 total) {
        uint256[] memory folders = this.getUserFolders(user);
        for (uint256 i = 0; i < folders.length; i++) {
            total += this.getFolderETHBalance(folders[i]);
        }
        return total;
    }

    // Get all token balances for a user across all folders
    function getUserAllTokenBalances(
        address user,
        address token
    ) external view returns (uint256 total) {
        uint256[] memory folders = this.getUserFolders(user);
        for (uint256 i = 0; i < folders.length; i++) {
            total += this.getFolderTokenBalance(folders[i], token);
        }
        return total;
    }

    // Override transferFrom to emit custom event and update tracking
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: caller is not token owner or approved"
        );

        // Call parent implementation
        _transfer(from, to, tokenId);

        // Update user folder tracking
        _removeFromUserFolders(from, tokenId);
        userFolders[to].push(tokenId);

        // Emit our custom event
        emit FolderTransferred(tokenId, from, to);
    }

    // Override safeTransferFrom as well
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: caller is not token owner or approved"
        );

        // Call parent implementation
        _safeTransfer(from, to, tokenId, data);

        // Update user folder tracking
        _removeFromUserFolders(from, tokenId);
        userFolders[to].push(tokenId);

        // Emit our custom event
        emit FolderTransferred(tokenId, from, to);
    }

    // Helper function to remove folder from user's list
    function _removeFromUserFolders(address user, uint256 tokenId) internal {
        uint256[] storage folders = userFolders[user];
        for (uint256 i = 0; i < folders.length; i++) {
            if (folders[i] == tokenId) {
                folders[i] = folders[folders.length - 1];
                folders.pop();
                break;
            }
        }
    }

    // Merge all contents from one folder to another (ETH + all tokens)
}
