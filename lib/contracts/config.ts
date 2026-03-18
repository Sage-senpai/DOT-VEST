import { defineChain } from 'viem'

// ─── Polkadot Hub Chain Definitions ──────────────────────────────────

export const polkadotHubTestnet = defineChain({
  id: 420420417,
  name: 'Polkadot Hub Testnet',
  nativeCurrency: {
    name: 'PAS',
    symbol: 'PAS',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://services.polkadothub-rpc.com/testnet'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://blockscout-testnet.polkadot.io',
    },
  },
  testnet: true,
})

export const polkadotHubMainnet = defineChain({
  id: 420420419,
  name: 'Polkadot Hub',
  nativeCurrency: {
    name: 'DOT',
    symbol: 'DOT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://services.polkadothub-rpc.com/mainnet'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://blockscout.polkadot.io',
    },
  },
})

// ─── Active Chain (switch for deployment) ────────────────────────────

export const activeChain = polkadotHubTestnet

// ─── Deployed Contract Addresses ─────────────────────────────────────
// Update these after deploying with:
//   forge script script/Deploy.s.sol:DeployAll --chain polkadot-testnet --broadcast

export const CONTRACTS = {
  vault: '0xd5bA77a0Db0fd2A784513D705A23Ce20C998C61d' as `0x${string}`,
  strategy: '0xd5005F670E5BeC7558c018eB7CE485EB41621F38' as `0x${string}`,
  bridge: '0xA7deCb55d84a42D5057f4b88eD511EFabC4B7F43' as `0x${string}`,
} as const

// ─── Precompile Addresses ────────────────────────────────────────────

export const PRECOMPILES = {
  system: '0x0000000000000000000000000000000000000900' as `0x${string}`,
  xcm: '0x00000000000000000000000000000000000a0000' as `0x${string}`,
} as const

// ─── Explorer URLs ───────────────────────────────────────────────────

export function getExplorerTxUrl(txHash: string): string {
  return `${activeChain.blockExplorers.default.url}/tx/${txHash}`
}

export function getExplorerAddressUrl(address: string): string {
  return `${activeChain.blockExplorers.default.url}/address/${address}`
}

export const FAUCET_URL = 'https://faucet.polkadot.io/'
