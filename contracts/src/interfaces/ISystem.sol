// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// ISystem - Polkadot Hub System Precompile Interface
// Located at 0x0000000000000000000000000000000000000900
// Provides access to Polkadot native cryptographic operations, account management,
// and runtime queries from Solidity. These functions execute Rust-native code (e.g., Blake2)
// via PVM, demonstrating the PVM-experiments category.

address constant SYSTEM_PRECOMPILE = 0x0000000000000000000000000000000000000900;

interface ISystem {
    /// @notice Compute BLAKE2 256-bit hash (Rust-native via PVM)
    /// @param data The input bytes to hash
    /// @return digest The 256-bit BLAKE2 hash
    function hashBlake256(bytes memory data) external view returns (bytes32 digest);

    /// @notice Compute BLAKE2 128-bit hash (Rust-native via PVM)
    /// @param data The input bytes to hash
    /// @return digest The 128-bit BLAKE2 hash (left-padded in bytes32)
    function hashBlake128(bytes memory data) external view returns (bytes32 digest);

    /// @notice Verify an SR25519 signature (Polkadot-native signature scheme)
    /// @param signature The 64-byte SR25519 signature
    /// @param message The signed message bytes
    /// @param publicKey The 32-byte SR25519 public key
    /// @return True if the signature is valid
    function sr25519Verify(
        uint8[64] calldata signature,
        bytes calldata message,
        bytes32 publicKey
    ) external view returns (bool);

    /// @notice Derive Ethereum address from compressed ECDSA public key
    /// @param publicKey The 33-byte compressed ECDSA public key
    /// @return The derived 20-byte Ethereum address
    function ecdsaToEthAddress(uint8[33] calldata publicKey) external view returns (bytes20);

    /// @notice Convert H160 EVM address to Polkadot native AccountId32
    /// @param evmAddress The EVM address to convert
    /// @return accountId The 32-byte Polkadot account ID
    function toAccountId(address evmAddress) external view returns (bytes memory accountId);

    /// @notice Check if the caller is the original transaction origin
    /// @return True if caller is the initial origin
    function callerIsOrigin() external view returns (bool);

    /// @notice Check if the caller has root privileges
    /// @return True if caller has root access
    function callerIsRoot() external view returns (bool);

    /// @notice Get the existential deposit (minimum balance) requirement
    /// @return The minimum balance in native currency units
    function minimumBalance() external view returns (uint256);

    /// @notice Get the code hash of the calling contract
    /// @return The code hash
    function ownCodeHash() external view returns (bytes32);

    /// @notice Get remaining computational weight
    /// @return refTime Remaining computation time
    /// @return proofSize Remaining proof size
    function weightLeft() external view returns (uint64 refTime, uint64 proofSize);

    /// @notice Terminate the contract and send remaining balance to beneficiary
    /// @param beneficiary Address to receive remaining funds
    function terminate(address beneficiary) external;
}
