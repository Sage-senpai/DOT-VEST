// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {DotVestVault} from "../src/DotVestVault.sol";
import {DotVestStrategy} from "../src/DotVestStrategy.sol";
import {DotVestBridge} from "../src/DotVestBridge.sol";

/// @notice Deploy all DotVest PVM contracts to Polkadot Hub Testnet
/// Usage: forge script script/Deploy.s.sol:DeployAll --chain polkadot-testnet --broadcast
contract DeployAll is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy Vault (Category 2: Native Assets)
        DotVestVault vault = new DotVestVault();
        console.log("DotVestVault deployed at:", address(vault));

        // Deploy Strategy Registry (Category 1: PVM-experiments)
        DotVestStrategy strategy = new DotVestStrategy();
        console.log("DotVestStrategy deployed at:", address(strategy));

        // Deploy Bridge (Category 3: XCM Precompiles)
        DotVestBridge bridge = new DotVestBridge();
        console.log("DotVestBridge deployed at:", address(bridge));

        vm.stopBroadcast();

        // Log summary
        console.log("---");
        console.log("Deployment complete on Polkadot Hub Testnet (Chain ID: 420420417)");
        console.log("Vault:    ", address(vault));
        console.log("Strategy: ", address(strategy));
        console.log("Bridge:   ", address(bridge));
    }
}
