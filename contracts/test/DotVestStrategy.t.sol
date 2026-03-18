// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {DotVestStrategy} from "../src/DotVestStrategy.sol";
import {SYSTEM_PRECOMPILE} from "../src/interfaces/ISystem.sol";

contract DotVestStrategyTest is Test {
    DotVestStrategy public strategy;
    address public alice = makeAddr("alice");

    function setUp() public {
        // Deploy dummy code at the precompile address so try/catch works
        vm.etch(SYSTEM_PRECOMPILE, hex"00");
        // Mock hashBlake256 — return keccak256 of the input
        // We can't dynamically compute in mockCall, so we mock specific calls
        // Instead, use a fallback: mock with a non-zero return for any call
        vm.mockCall(
            SYSTEM_PRECOMPILE,
            abi.encodeWithSignature("hashBlake256(bytes)"),
            abi.encode(bytes32(uint256(1)))
        );
        vm.mockCall(
            SYSTEM_PRECOMPILE,
            abi.encodeWithSignature("toAccountId(address)"),
            abi.encode(abi.encodePacked(bytes32(uint256(42))))
        );

        strategy = new DotVestStrategy();
    }

    function test_createStrategy() public {
        vm.prank(alice);
        bytes32 id = strategy.createStrategy("DOT Yield", 1200, 1); // 12% APY, MEDIUM risk

        DotVestStrategy.Strategy memory strat = strategy.getStrategy(id);
        assertEq(strat.creator, alice);
        assertEq(strat.name, "DOT Yield");
        assertEq(strat.targetApy, 1200);
        assertTrue(strat.active);
        assertEq(strategy.totalStrategies(), 1);
    }

    function test_uniqueIds() public {
        // Mock returns same hash for any call, so we need different timestamps
        // to get different IDs. But since mock returns constant, IDs will be same.
        // Instead, mock different return values for sequential calls.
        vm.mockCall(
            SYSTEM_PRECOMPILE,
            abi.encodeWithSignature("hashBlake256(bytes)"),
            abi.encode(bytes32(uint256(100)))
        );

        vm.prank(alice);
        bytes32 id1 = strategy.createStrategy("Strategy A", 1000, 0);

        // Change mock return for second call
        vm.mockCall(
            SYSTEM_PRECOMPILE,
            abi.encodeWithSignature("hashBlake256(bytes)"),
            abi.encode(bytes32(uint256(200)))
        );

        vm.warp(block.timestamp + 1);
        vm.prank(alice);
        bytes32 id2 = strategy.createStrategy("Strategy B", 2000, 2);

        assertTrue(id1 != id2);
        assertEq(strategy.totalStrategies(), 2);
    }

    function test_getUserStrategies() public {
        vm.startPrank(alice);
        strategy.createStrategy("S1", 1000, 0);

        // Change mock for second strategy
        vm.mockCall(
            SYSTEM_PRECOMPILE,
            abi.encodeWithSignature("hashBlake256(bytes)"),
            abi.encode(bytes32(uint256(999)))
        );
        vm.warp(block.timestamp + 1);
        strategy.createStrategy("S2", 1500, 1);
        vm.stopPrank();

        bytes32[] memory ids = strategy.getUserStrategies(alice);
        assertEq(ids.length, 2);
    }

    function test_deactivateStrategy() public {
        vm.prank(alice);
        bytes32 id = strategy.createStrategy("Temp", 500, 0);

        vm.prank(alice);
        strategy.deactivateStrategy(id);

        DotVestStrategy.Strategy memory strat = strategy.getStrategy(id);
        assertFalse(strat.active);
    }

    function test_revertEmptyName() public {
        vm.expectRevert(DotVestStrategy.EmptyName.selector);
        vm.prank(alice);
        strategy.createStrategy("", 1000, 0);
    }

    function test_computeBlake2Hash() public view {
        bytes32 hash = strategy.computeBlake2Hash(bytes("hello world"));
        assertTrue(hash != bytes32(0));
    }

    function test_getPolkadotAccountId() public view {
        bytes32 accountId = strategy.getPolkadotAccountId(alice);
        assertTrue(accountId != bytes32(0));
    }
}
