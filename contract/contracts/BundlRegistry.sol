// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BundlExecutor.sol";

contract BundlRegistry {
    event AccountCreated(
        address account,
        address implementation,
        uint256 chainId,
        address tokenContract,
        uint256 tokenId,
        uint256 salt
    );

    function account(
        address implementation,
        uint256 chainId,
        address tokenContract,
        uint256 tokenId,
        uint256 salt
    ) public view returns (address) {
        bytes32 codeHash = keccak256(
            _accountBytecode(implementation, tokenContract, tokenId)
        );
        return
            address(
                uint160(
                    uint(
                        keccak256(
                            abi.encodePacked(
                                bytes1(0xff),
                                address(this),
                                keccak256(
                                    abi.encode(
                                        implementation,
                                        chainId,
                                        tokenContract,
                                        tokenId,
                                        salt
                                    )
                                ),
                                codeHash
                            )
                        )
                    )
                )
            );
    }

    function createAccount(
        address implementation,
        uint256 chainId,
        address tokenContract,
        uint256 tokenId,
        uint256 salt
    ) external returns (address) {
        address predicted = account(
            implementation,
            chainId,
            tokenContract,
            tokenId,
            salt
        );
        bytes memory bytecode = _accountBytecode(
            implementation,
            tokenContract,
            tokenId
        );
        bytes32 saltHash = keccak256(
            abi.encode(implementation, chainId, tokenContract, tokenId, salt)
        );

        address deployed;
        assembly {
            deployed := create2(0, add(bytecode, 32), mload(bytecode), saltHash)
        }

        require(deployed != address(0), "Deployment failed");
        require(deployed == predicted, "Address mismatch");
        emit AccountCreated(
            deployed,
            implementation,
            chainId,
            tokenContract,
            tokenId,
            salt
        );
        return deployed;
    }

    function _accountBytecode(
        address /* implementation */,
        address tokenContract,
        uint256 tokenId
    ) internal pure returns (bytes memory) {
        return
            abi.encodePacked(
                type(BundlExecutor).creationCode,
                abi.encode(tokenContract, tokenId)
            );
    }
}
