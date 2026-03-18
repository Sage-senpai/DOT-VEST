// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {DotVestVault} from "../src/DotVestVault.sol";
import {SYSTEM_PRECOMPILE} from "../src/interfaces/ISystem.sol";

contract DotVestVaultTest is Test {
    DotVestVault public vault;
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");

    function setUp() public {
        // Deploy dummy code at the precompile address so try/catch works
        vm.etch(SYSTEM_PRECOMPILE, hex"00");
        // Mock minimumBalance() to return 1 wei
        vm.mockCall(
            SYSTEM_PRECOMPILE,
            abi.encodeWithSignature("minimumBalance()"),
            abi.encode(uint256(1))
        );

        vault = new DotVestVault();
        vm.deal(alice, 100 ether);
        vm.deal(bob, 50 ether);
    }

    function test_deposit() public {
        vm.prank(alice);
        vault.deposit{value: 10 ether}();

        (uint256 shares, , uint256 totalDep, uint256 currentVal) = vault.getPosition(alice);
        assertEq(shares, 10 ether);
        assertEq(totalDep, 10 ether);
        assertEq(currentVal, 10 ether);
        assertEq(vault.totalShares(), 10 ether);
        assertEq(vault.getTVL(), 10 ether);
    }

    function test_multipleDeposits() public {
        vm.prank(alice);
        vault.deposit{value: 10 ether}();

        vm.prank(bob);
        vault.deposit{value: 5 ether}();

        assertEq(vault.totalShares(), 15 ether);
        assertEq(vault.getTVL(), 15 ether);
        assertEq(vault.getDepositorCount(), 2);
        assertEq(vault.depositCount(), 2);
    }

    function test_withdraw() public {
        vm.prank(alice);
        vault.deposit{value: 10 ether}();

        uint256 balanceBefore = alice.balance;

        vm.prank(alice);
        vault.withdraw(5 ether);

        assertEq(alice.balance, balanceBefore + 5 ether);
        (uint256 shares, , , ) = vault.getPosition(alice);
        assertEq(shares, 5 ether);
    }

    function test_withdrawAll() public {
        vm.prank(alice);
        vault.deposit{value: 10 ether}();

        vm.prank(alice);
        vault.withdraw(10 ether);

        (uint256 shares, , , ) = vault.getPosition(alice);
        assertEq(shares, 0);
        assertEq(vault.getTVL(), 0);
    }

    function test_revertOnZeroDeposit() public {
        vm.expectRevert(DotVestVault.ZeroAmount.selector);
        vm.prank(alice);
        vault.deposit{value: 0}();
    }

    function test_revertOnInsufficientShares() public {
        vm.prank(alice);
        vault.deposit{value: 5 ether}();

        vm.expectRevert(
            abi.encodeWithSelector(DotVestVault.InsufficientShares.selector, 10 ether, 5 ether)
        );
        vm.prank(alice);
        vault.withdraw(10 ether);
    }

    function test_fundVault() public {
        vm.prank(alice);
        vault.deposit{value: 10 ether}();

        // Simulate yield: fund vault with extra DOT
        vm.prank(bob);
        vault.fundVault{value: 2 ether}();

        // Alice's shares are worth more now
        (, , , uint256 currentVal) = vault.getPosition(alice);
        assertEq(currentVal, 12 ether); // 10 deposited + 2 yield
    }

    function test_proportionalWithdraw() public {
        vm.prank(alice);
        vault.deposit{value: 10 ether}();

        vm.prank(bob);
        vault.deposit{value: 10 ether}();

        // Add yield
        vm.deal(address(this), 4 ether);
        (bool ok, ) = address(vault).call{value: 4 ether}("");
        assertTrue(ok);

        // Each has 10 shares out of 20 total, vault balance is 24 ether
        // Alice withdraws all: 10/20 * 24 = 12 ether
        uint256 balanceBefore = alice.balance;
        vm.prank(alice);
        vault.withdraw(10 ether);

        assertEq(alice.balance, balanceBefore + 12 ether);
    }
}
