// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract BundlExecutor {
    address public immutable tokenContract;
    uint256 public immutable tokenId;

    constructor(address _tokenContract, uint256 _tokenId) {
        tokenContract = _tokenContract;
        tokenId = _tokenId;
    }

    modifier onlyOwner() {
        require(
            msg.sender == IERC721(tokenContract).ownerOf(tokenId),
            "Not folder owner"
        );
        _;
    }

    function execute(
        address target,
        uint256 value,
        bytes calldata data
    ) external onlyOwner returns (bytes memory) {
        (bool success, bytes memory result) = target.call{value: value}(data);
        require(success, "Call failed");
        return result;
    }

    receive() external payable {}
}
