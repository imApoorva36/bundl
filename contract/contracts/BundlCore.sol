// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BundlRegistry.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
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

    constructor(
        address _registry,
        address _walletLogic
    ) ERC721("Bundl Folder", "BNDL") {
        registry = BundlRegistry(_registry);
        walletLogic = _walletLogic;
    }

    function createFolder() external returns (uint256 tokenId, address wallet) {
        tokenId = nextTokenId++;
        _mint(msg.sender, tokenId);

        wallet = registry.account(
            walletLogic,
            block.chainid,
            address(this),
            tokenId,
            0
        );
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
        address wallet = getWallet(tokenId);
        IAccount(wallet).execute(target, value, data);
    }
}
