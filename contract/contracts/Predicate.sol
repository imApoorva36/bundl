// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address);
}

contract Predicate {
    function isReadyToTransfer(
        address nftContract,
        uint256 tokenId,
        address expectedCurrentOwner,
        uint256 validAfter
    ) external view returns (bool) {
        if (block.timestamp < validAfter) return false;

        try IERC721(nftContract).ownerOf(tokenId) returns (address currentOwner) {
            return currentOwner == expectedCurrentOwner;
        } catch {
            return false;
        }
    }
}