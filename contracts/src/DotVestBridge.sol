// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IXcm, XCM_PRECOMPILE} from "./interfaces/IXcm.sol";
import {ISystem, SYSTEM_PRECOMPILE} from "./interfaces/ISystem.sol";

/// @title DotVestBridge - Cross-Chain XCM Transfer Helper
/// @notice Track 2, Category 3: Accessing Polkadot native functionality via precompiles
/// @dev Uses the XCM precompile to estimate weights and send cross-chain messages.
///      Demonstrates Polkadot's native XCM interoperability from Solidity contracts.

contract DotVestBridge {
    // ─── State ───────────────────────────────────────────────────────────

    IXcm private constant xcm = IXcm(XCM_PRECOMPILE);
    ISystem private constant system = ISystem(SYSTEM_PRECOMPILE);

    address public immutable owner;

    struct TransferRecord {
        address sender;
        bytes destination;
        uint256 amount;
        uint256 timestamp;
        bool executed;
    }

    TransferRecord[] public transfers;
    mapping(address => uint256[]) public userTransfers;

    uint256 public totalTransfers;

    // ─── Events ──────────────────────────────────────────────────────────

    event XcmTransferInitiated(
        uint256 indexed transferId,
        address indexed sender,
        uint256 amount,
        uint64 estimatedRefTime,
        uint64 estimatedProofSize
    );

    event XcmWeightEstimated(
        uint64 refTime,
        uint64 proofSize
    );

    // ─── Errors ──────────────────────────────────────────────────────────

    error ZeroAmount();
    error EmptyDestination();
    error InsufficientValue();
    error XcmSendFailed();

    // ─── Constructor ─────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }

    // ─── Core Functions ──────────────────────────────────────────────────

    /// @notice Estimate the XCM execution weight for a transfer message
    /// @param message SCALE-encoded XCM message
    /// @return refTime Estimated computation time
    /// @return proofSize Estimated proof size
    function estimateXcmWeight(bytes calldata message)
        external
        view
        returns (uint64 refTime, uint64 proofSize)
    {
        try xcm.weighMessage(message) returns (IXcm.Weight memory weight) {
            return (weight.refTime, weight.proofSize);
        } catch {
            // Return zero weights if precompile unavailable
            return (0, 0);
        }
    }

    /// @notice Send an XCM transfer to another parachain
    /// @param destination SCALE-encoded destination location
    /// @param message SCALE-encoded XCM message
    function sendXcmTransfer(
        bytes calldata destination,
        bytes calldata message
    ) external payable {
        if (msg.value == 0) revert ZeroAmount();
        if (destination.length == 0) revert EmptyDestination();

        // Estimate weight before sending
        uint64 estRefTime;
        uint64 estProofSize;
        try xcm.weighMessage(message) returns (IXcm.Weight memory weight) {
            estRefTime = weight.refTime;
            estProofSize = weight.proofSize;
        } catch {
            // Continue without weight estimate
        }

        // Record the transfer
        uint256 transferId = transfers.length;
        transfers.push(TransferRecord({
            sender: msg.sender,
            destination: destination,
            amount: msg.value,
            timestamp: block.timestamp,
            executed: false
        }));
        userTransfers[msg.sender].push(transferId);
        totalTransfers++;

        // Attempt to send via XCM precompile
        try xcm.send(destination, message) {
            transfers[transferId].executed = true;
        } catch {
            // Record failed but don't revert — funds stay in contract for retry
        }

        emit XcmTransferInitiated(transferId, msg.sender, msg.value, estRefTime, estProofSize);
    }

    /// @notice Execute an XCM message locally
    /// @param message SCALE-encoded XCM message
    function executeXcmLocal(bytes calldata message) external {
        IXcm.Weight memory weight;
        try xcm.weighMessage(message) returns (IXcm.Weight memory w) {
            weight = w;
        } catch {
            weight = IXcm.Weight({refTime: 1_000_000_000, proofSize: 65536});
        }

        xcm.execute(message, weight);
    }

    // ─── View Functions ──────────────────────────────────────────────────

    /// @notice Get a transfer record
    function getTransfer(uint256 id) external view returns (TransferRecord memory) {
        return transfers[id];
    }

    /// @notice Get all transfer IDs for a user
    function getUserTransfers(address user) external view returns (uint256[] memory) {
        return userTransfers[user];
    }

    /// @notice Get the remaining weight available for execution
    function getRemainingWeight() external view returns (uint64 refTime, uint64 proofSize) {
        try system.weightLeft() returns (uint64 rt, uint64 ps) {
            return (rt, ps);
        } catch {
            return (0, 0);
        }
    }

    /// @notice Check if the caller is the original transaction origin
    function isDirectCaller() external view returns (bool) {
        try system.callerIsOrigin() returns (bool result) {
            return result;
        } catch {
            return false;
        }
    }

    receive() external payable {}
}
