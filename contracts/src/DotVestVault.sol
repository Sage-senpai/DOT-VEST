// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ISystem, SYSTEM_PRECOMPILE} from "./interfaces/ISystem.sol";

/// @title DotVestVault - Native DOT Yield Vault
/// @notice Track 2, Category 2: Applications using Polkadot native Assets
/// @dev A vault that accepts native DOT deposits, tracks shares per user,
///      and uses the System precompile to enforce minimum balance requirements.
///      Deployed on Polkadot Hub via PVM (PolkaVM).

contract DotVestVault {
    // ─── State ───────────────────────────────────────────────────────────

    struct Position {
        uint256 shares;
        uint256 depositTimestamp;
        uint256 totalDeposited;
    }

    address public immutable owner;
    ISystem private constant system = ISystem(SYSTEM_PRECOMPILE);

    mapping(address => Position) public positions;
    address[] public depositors;

    uint256 public totalShares;
    uint256 public totalDeposited;
    uint256 public depositCount;

    // ─── Events ──────────────────────────────────────────────────────────

    event Deposited(address indexed user, uint256 amount, uint256 shares, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 amount, uint256 shares);
    event VaultFunded(address indexed funder, uint256 amount);

    // ─── Errors ──────────────────────────────────────────────────────────

    error BelowMinimumDeposit(uint256 sent, uint256 minimum);
    error InsufficientShares(uint256 requested, uint256 available);
    error TransferFailed();
    error ZeroAmount();

    // ─── Constructor ─────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }

    // ─── Core Functions ──────────────────────────────────────────────────

    /// @notice Deposit native DOT into the vault
    /// @dev Uses System precompile minimumBalance() to enforce existential deposit.
    ///      Shares are minted 1:1 with deposited amount for simplicity.
    function deposit() external payable {
        if (msg.value == 0) revert ZeroAmount();

        // Use PVM System precompile to get minimum balance requirement
        uint256 minBalance = _getMinimumBalance();
        if (msg.value < minBalance) {
            revert BelowMinimumDeposit(msg.value, minBalance);
        }

        uint256 sharesToMint = msg.value; // 1:1 share ratio

        if (positions[msg.sender].shares == 0) {
            depositors.push(msg.sender);
        }

        positions[msg.sender].shares += sharesToMint;
        positions[msg.sender].totalDeposited += msg.value;
        if (positions[msg.sender].depositTimestamp == 0) {
            positions[msg.sender].depositTimestamp = block.timestamp;
        }

        totalShares += sharesToMint;
        totalDeposited += msg.value;
        depositCount++;

        emit Deposited(msg.sender, msg.value, sharesToMint, block.timestamp);
    }

    /// @notice Withdraw DOT by burning shares
    /// @param shares Number of shares to burn
    function withdraw(uint256 shares) external {
        if (shares == 0) revert ZeroAmount();
        if (shares > positions[msg.sender].shares) {
            revert InsufficientShares(shares, positions[msg.sender].shares);
        }

        // Calculate proportional amount
        uint256 amount = (shares * address(this).balance) / totalShares;

        positions[msg.sender].shares -= shares;
        totalShares -= shares;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();

        emit Withdrawn(msg.sender, amount, shares);
    }

    /// @notice Fund the vault with additional yield (owner/protocol rewards)
    function fundVault() external payable {
        if (msg.value == 0) revert ZeroAmount();
        emit VaultFunded(msg.sender, msg.value);
    }

    // ─── View Functions ──────────────────────────────────────────────────

    /// @notice Get a user's vault position
    function getPosition(address user) external view returns (
        uint256 shares,
        uint256 depositTimestamp,
        uint256 totalUserDeposited,
        uint256 currentValue
    ) {
        Position memory pos = positions[user];
        uint256 value = totalShares > 0
            ? (pos.shares * address(this).balance) / totalShares
            : 0;
        return (pos.shares, pos.depositTimestamp, pos.totalDeposited, value);
    }

    /// @notice Get vault TVL (total value locked)
    function getTVL() external view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Get total number of unique depositors
    function getDepositorCount() external view returns (uint256) {
        return depositors.length;
    }

    /// @notice Get the minimum deposit amount from PVM System precompile
    function getMinimumDeposit() external view returns (uint256) {
        return _getMinimumBalance();
    }

    // ─── Internal ────────────────────────────────────────────────────────

    function _getMinimumBalance() internal view returns (uint256) {
        try system.minimumBalance() returns (uint256 minBal) {
            return minBal > 0 ? minBal : 1;
        } catch {
            // Fallback if precompile unavailable (e.g., local testing)
            return 1;
        }
    }

    receive() external payable {
        emit VaultFunded(msg.sender, msg.value);
    }
}
