# DotVest - Polkadot DeFi Yield Optimizer

**DotVest** is a DeFi yield optimizer built on Polkadot Hub. It aggregates staking and yield opportunities across the Polkadot ecosystem through a unified dashboard, with on-chain smart contracts deployed via PVM (PolkaVM).

**Live Demo:** [dot-vest.vercel.app](https://dot-vest.vercel.app)

---

## Hackathon Track

**Polkadot Solidity Hackathon - Track 2: PVM Smart Contracts**

DotVest covers all 3 Track 2 categories with deployed, tested contracts on Polkadot Hub Testnet:

| Category | Contract | What it does |
|----------|----------|-------------|
| **Cat 1: PVM-experiments** | `DotVestStrategy` | Calls Rust-native `hashBlake256()` and `toAccountId()` from Solidity via the System Precompile |
| **Cat 2: Native Assets** | `DotVestVault` | Accepts native DOT deposits, tracks shares, enforces existential deposit via `minimumBalance()` |
| **Cat 3: Precompiles** | `DotVestBridge` | Uses XCM Precompile's `weighMessage()` and `send()` for cross-chain transfers |

### Deployed Contracts (Polkadot Hub Testnet - Chain ID: 420420417)

| Contract | Address |
|----------|---------|
| DotVestVault | `0xd5bA77a0Db0fd2A784513D705A23Ce20C998C61d` |
| DotVestStrategy | `0xd5005F670E5BeC7558c018eB7CE485EB41621F38` |
| DotVestBridge | `0xA7deCb55d84a42D5057f4b88eD511EFabC4B7F43` |

Verify on [Blockscout Testnet](https://blockscout-testnet.polkadot.io).

---

## Features

- **Yield Aggregator** - Compare pools across Polkadot parachains (Acala, Hydration, Bifrost, Astar, Moonbeam, Subsquid) with real-time APY data from DeFiLlama
- **DOT Vault** - Deposit native DOT on-chain, earn proportional yield, withdraw anytime
- **Strategy Registry** - Create and manage yield strategies with Blake2-hashed IDs (Rust-native via PVM)
- **XCM Bridge** - Estimate weights and send cross-chain messages via XCM Precompile
- **PVM Contracts Dashboard** - Interactive testing page for all 3 contracts with Blake2 hasher, address converter, XCM weight estimator, and vault stats
- **Dual Wallet Support** - MetaMask (EVM) + Polkadot.js extension (native) with proper connect/disconnect/switch
- **Find Optimal Pool** - Search for the best pool by amount, risk tolerance, and chain preference

---

## Tech Stack

### Frontend
- **Next.js 16** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS v4**
- **Viem** - EVM client for contract interactions
- **@polkadot/api** - Native Polkadot chain interaction

### Smart Contracts
- **Solidity 0.8.28** - Contract language
- **Foundry (Forge)** - Build, test, deploy
- **PVM System Precompile** (`0x...0900`) - Blake2 hashing, AccountId conversion, minimumBalance
- **PVM XCM Precompile** (`0x...0a0000`) - Cross-chain messaging

### Backend
- **Supabase** - Auth (email/password) and user profiles
- **DeFiLlama API** - Live pool/protocol data
- **Vercel** - Hosting

---

## Project Structure

```
DOT-FI/
  app/                    # Next.js pages
    dashboard/            # Authenticated dashboard
      aggregator/         # Pool explorer & strategy builder
      vaults/             # Vault deposit/withdraw UI
      bridge/             # XCM bridge interface
      contracts/          # PVM contracts interactive demo
      analytics/          # Portfolio analytics
    (auth)/               # Login, register, reset password
  components/             # UI components
    core/                 # Navbar, footer, logo, wallet manager
    landing/              # Landing page sections
  hooks/                  # React hooks
    use-vault-contract    # Vault read/write via Viem
    use-strategy-contract # Strategy CRUD via Viem
    use-bridge-contract   # XCM bridge via Viem
    use-evm-wallet        # MetaMask connect/disconnect/switch
    use-polkadot-extension # Polkadot.js wallet
  lib/
    contracts/            # ABIs, chain config, Viem clients
    supabase/             # Supabase client
  contracts/              # Foundry project
    src/                  # Solidity contracts
      DotVestVault.sol
      DotVestStrategy.sol
      DotVestBridge.sol
      interfaces/         # ISystem.sol, IXcm.sol
    test/                 # Forge tests (15 tests)
    script/               # Deploy script
    deployments/          # Deployed addresses
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- Foundry (`forge`, `cast`)

### Install & Run Frontend

```bash
git clone <repo-url>
cd DOT-FI
pnpm install
pnpm dev
```

### Build

```bash
pnpm build
```

### Smart Contracts

```bash
cd contracts

# Install dependencies
git clone --depth 1 https://github.com/foundry-rs/forge-std.git lib/forge-std

# Compile
forge build

# Test (15 tests, all pass)
forge test -vvv

# Deploy (requires funded wallet)
source .env
forge create src/DotVestVault.sol:DotVestVault \
  --rpc-url https://services.polkadothub-rpc.com/testnet \
  --private-key $PRIVATE_KEY --broadcast

forge create src/DotVestStrategy.sol:DotVestStrategy \
  --rpc-url https://services.polkadothub-rpc.com/testnet \
  --private-key $PRIVATE_KEY --broadcast

forge create src/DotVestBridge.sol:DotVestBridge \
  --rpc-url https://services.polkadothub-rpc.com/testnet \
  --private-key $PRIVATE_KEY --broadcast
```

After deploying, update the addresses in `lib/contracts/config.ts`.

### EVM Wallet Setup

The app requires **MetaMask** (Phantom does not support custom EVM chains).

When you click "Connect EVM Wallet" or "Switch to Polkadot Hub Testnet", the network is auto-added to MetaMask:

| Field | Value |
|-------|-------|
| Network | Polkadot Hub Testnet |
| Chain ID | 420420417 |
| RPC | `https://services.polkadothub-rpc.com/testnet` |
| Symbol | PAS |
| Explorer | `https://blockscout-testnet.polkadot.io` |

Get testnet tokens from the [Polkadot Faucet](https://faucet.polkadot.io/).

---

## Contract Details

### DotVestVault (Category 2: Native Assets)
Accepts native DOT deposits, mints shares 1:1, distributes yield proportionally. Uses System Precompile `minimumBalance()` to enforce existential deposit.

**Functions:** `deposit()`, `withdraw(shares)`, `fundVault()`, `getPosition(user)`, `getTVL()`, `getMinimumDeposit()`

### DotVestStrategy (Category 1: PVM-experiments)
On-chain strategy registry. Generates deterministic strategy IDs using `hashBlake256()` (Rust-native Blake2 via PVM). Converts EVM addresses to Polkadot AccountId32 via `toAccountId()`.

**Functions:** `createStrategy(name, apy, risk)`, `deactivateStrategy(id)`, `computeBlake2Hash(data)`, `getPolkadotAccountId(addr)`

### DotVestBridge (Category 3: XCM Precompiles)
Cross-chain transfer helper using XCM Precompile. Estimates message weights with `weighMessage()` and dispatches via `send()`. Tracks transfer history on-chain.

**Functions:** `estimateXcmWeight(msg)`, `sendXcmTransfer(dest, msg)`, `executeXcmLocal(msg)`, `getRemainingWeight()`

### Precompile Addresses
- System: `0x0000000000000000000000000000000000000900`
- XCM: `0x00000000000000000000000000000000000a0000`

---

## Tests

15 tests across 2 test suites. Precompiles are mocked locally with `vm.etch` + `vm.mockCall`.

```
DotVestVaultTest (8 tests)
  - deposit, multipleDeposits, withdraw, withdrawAll
  - revertOnZeroDeposit, revertOnInsufficientShares
  - fundVault, proportionalWithdraw

DotVestStrategyTest (7 tests)
  - createStrategy, uniqueIds, getUserStrategies
  - deactivateStrategy, revertEmptyName
  - computeBlake2Hash, getPolkadotAccountId
```

---

## Environment Variables

Create `.env.local` in the root:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

Create `contracts/.env`:

```
PRIVATE_KEY=<deployer-private-key>
```

---

Built for the Polkadot Solidity Hackathon 2026
