// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// IXcm - Polkadot Hub XCM Precompile Interface
// Located at 0x00000000000000000000000000000000000a0000
// Enables cross-chain messaging (XCM) from Solidity contracts on Polkadot Hub.
// Messages must be SCALE-encoded Versioned XCM format.

address constant XCM_PRECOMPILE = 0x00000000000000000000000000000000000a0000;

interface IXcm {
    /// @notice Weight represents computational cost on Polkadot
    struct Weight {
        uint64 refTime;    // Computational time on reference hardware
        uint64 proofSize;  // Size of proof required for execution
    }

    /// @notice Execute an XCM message locally with the caller's origin
    /// @param message SCALE-encoded Versioned XCM message
    /// @param weight Execution weight obtained from weighMessage()
    function execute(bytes calldata message, Weight calldata weight) external;

    /// @notice Send an XCM message to another parachain or consensus system
    /// @param destination SCALE-encoded destination (e.g., parachain ID)
    /// @param message SCALE-encoded XCM message to send
    function send(bytes calldata destination, bytes calldata message) external;

    /// @notice Estimate the computational cost of executing an XCM message
    /// @param message SCALE-encoded Versioned XCM message
    /// @return weight The estimated Weight (refTime + proofSize)
    function weighMessage(bytes calldata message) external view returns (Weight memory weight);
}
