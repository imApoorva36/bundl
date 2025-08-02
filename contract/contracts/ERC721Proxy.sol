// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ImmutableOwner
 * @dev Base contract that provides immutable owner functionality
 */
abstract contract ImmutableOwner {
    error NotAnOwner();
    
    address public immutable OWNER;

    modifier onlyOwner() {
        if (msg.sender != OWNER) revert NotAnOwner();
        _;
    }

    constructor(address _immutableOwner) {
        OWNER = _immutableOwner;
    }
}

/**
 * @title ERC721Proxy
 * @dev 1inch's ERC721 Proxy contract for handling NFT transfers in limit orders
 */
contract ERC721Proxy is ImmutableOwner {
    error ERC721ProxyBadSelector();

    constructor(address _immutableOwner) ImmutableOwner(_immutableOwner) {
        if (ERC721Proxy.func_60iHVgK.selector != IERC20.transferFrom.selector) revert ERC721ProxyBadSelector();
    }

    /// @notice Proxy transfer method for `IERC721.transferFrom`. Selector must match `IERC20.transferFrom`.
    /// Note that `amount` is unused for security reasons to prevent unintended ERC-721 token sale via partial fill
    // keccak256("func_60iHVgK(address,address,uint256,uint256,address)") == 0x23b872dd (IERC20.transferFrom)
    function func_60iHVgK(address from, address to, uint256 /* amount */, uint256 tokenId, IERC721 token) external onlyOwner {
        token.transferFrom(from, to, tokenId);
    }
}