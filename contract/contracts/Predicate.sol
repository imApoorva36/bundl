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
    ) external view returns (uint256) {
        if (block.timestamp < validAfter) return 0;

        try IERC721(nftContract).ownerOf(tokenId) returns (address currentOwner) {
            if(currentOwner == expectedCurrentOwner) return 1;
            else return 0;
        } catch {
            return 0;
        }
    }
}