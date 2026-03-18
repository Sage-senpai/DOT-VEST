// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ISystem, SYSTEM_PRECOMPILE} from "./interfaces/ISystem.sol";

/// @title DotVestStrategy - On-Chain Strategy Registry with PVM Blake2
/// @notice Track 2, Category 1: PVM-experiments (calling Rust native code from Solidity)
/// @dev Uses the System precompile's hashBlake256() to generate deterministic strategy IDs.
///      Blake2 is a Rust-native hashing algorithm executed via PVM — this is the core
///      PVM-experiment: calling Rust code from Solidity smart contracts.

contract DotVestStrategy {
    // ─── Types ───────────────────────────────────────────────────────────

    enum RiskLevel { LOW, MEDIUM, HIGH }

    struct Strategy {
        bytes32 id;
        address creator;
        string name;
        uint256 targetApy;     // basis points (e.g., 1200 = 12%)
        RiskLevel riskLevel;
        uint256 createdAt;
        bool active;
        bytes32 creatorAccountId; // Polkadot AccountId32 derived via precompile
    }

    // ─── State ───────────────────────────────────────────────────────────

    ISystem private constant system = ISystem(SYSTEM_PRECOMPILE);

    mapping(bytes32 => Strategy) public strategies;
    bytes32[] public strategyIds;
    mapping(address => bytes32[]) public userStrategies;

    uint256 public totalStrategies;

    // ─── Events ──────────────────────────────────────────────────────────

    event StrategyCreated(
        bytes32 indexed id,
        address indexed creator,
        string name,
        uint256 targetApy,
        RiskLevel riskLevel,
        bytes32 creatorAccountId
    );

    event StrategyDeactivated(bytes32 indexed id);

    // ─── Errors ──────────────────────────────────────────────────────────

    error EmptyName();
    error StrategyNotFound(bytes32 id);
    error NotStrategyOwner();

    // ─── Core Functions ──────────────────────────────────────────────────

    /// @notice Create a new strategy with a Blake2-generated ID
    /// @dev The strategy ID is generated using the PVM System precompile's hashBlake256(),
    ///      which executes Rust-native Blake2 hashing — demonstrating PVM-experiments.
    /// @param name Strategy name
    /// @param targetApy Target APY in basis points (1200 = 12%)
    /// @param riskLevel Risk level (0=LOW, 1=MEDIUM, 2=HIGH)
    function createStrategy(
        string calldata name,
        uint256 targetApy,
        uint8 riskLevel
    ) external returns (bytes32 strategyId) {
        if (bytes(name).length == 0) revert EmptyName();

        // PVM-experiment: Generate strategy ID using Rust-native Blake2 hash
        // This calls into the PVM System precompile which executes Rust's Blake2 implementation
        strategyId = _generateBlake2Id(msg.sender, name, block.timestamp);

        // PVM-experiment: Convert EVM address to Polkadot AccountId32
        bytes32 accountId = _getAccountId(msg.sender);

        Strategy memory strat = Strategy({
            id: strategyId,
            creator: msg.sender,
            name: name,
            targetApy: targetApy,
            riskLevel: RiskLevel(riskLevel),
            createdAt: block.timestamp,
            active: true,
            creatorAccountId: accountId
        });

        strategies[strategyId] = strat;
        strategyIds.push(strategyId);
        userStrategies[msg.sender].push(strategyId);
        totalStrategies++;

        emit StrategyCreated(strategyId, msg.sender, name, targetApy, RiskLevel(riskLevel), accountId);

        return strategyId;
    }

    /// @notice Deactivate a strategy
    function deactivateStrategy(bytes32 id) external {
        Strategy storage strat = strategies[id];
        if (strat.creator == address(0)) revert StrategyNotFound(id);
        if (strat.creator != msg.sender) revert NotStrategyOwner();

        strat.active = false;
        emit StrategyDeactivated(id);
    }

    // ─── View Functions ──────────────────────────────────────────────────

    /// @notice Get a strategy by ID
    function getStrategy(bytes32 id) external view returns (Strategy memory) {
        Strategy memory strat = strategies[id];
        if (strat.creator == address(0)) revert StrategyNotFound(id);
        return strat;
    }

    /// @notice Get all strategy IDs for a user
    function getUserStrategies(address user) external view returns (bytes32[] memory) {
        return userStrategies[user];
    }

    /// @notice Get total number of strategies
    function getStrategyCount() external view returns (uint256) {
        return totalStrategies;
    }

    /// @notice Compute Blake2-256 hash of arbitrary data via PVM System precompile
    /// @dev Public function for the demo page — lets users hash any input
    function computeBlake2Hash(bytes calldata data) external view returns (bytes32) {
        return _hashBlake256(data);
    }

    /// @notice Convert an EVM address to Polkadot AccountId32 via PVM System precompile
    /// @dev Public function for the demo page — address conversion tool
    function getPolkadotAccountId(address evmAddr) external view returns (bytes32) {
        return _getAccountId(evmAddr);
    }

    // ─── Internal ────────────────────────────────────────────────────────

    /// @dev Generate deterministic strategy ID using Blake2-256 (Rust native via PVM)
    function _generateBlake2Id(
        address creator,
        string calldata name,
        uint256 timestamp
    ) internal view returns (bytes32) {
        bytes memory payload = abi.encodePacked(creator, name, timestamp);
        return _hashBlake256(payload);
    }

    /// @dev Call System precompile Blake2-256 hash with fallback
    function _hashBlake256(bytes memory data) internal view returns (bytes32) {
        try system.hashBlake256(data) returns (bytes32 hash) {
            return hash;
        } catch {
            // Fallback for local testing (keccak256 as substitute)
            return keccak256(data);
        }
    }

    /// @dev Convert EVM address to Polkadot AccountId32 with fallback
    function _getAccountId(address evmAddr) internal view returns (bytes32) {
        try system.toAccountId(evmAddr) returns (bytes memory accountId) {
            if (accountId.length >= 32) {
                return bytes32(accountId);
            }
            return bytes32(uint256(uint160(evmAddr)));
        } catch {
            // Fallback: pad the EVM address to 32 bytes
            return bytes32(uint256(uint160(evmAddr)));
        }
    }
}
