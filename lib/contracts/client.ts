'use client'

import { createPublicClient, createWalletClient, http, custom, type PublicClient, type WalletClient } from 'viem'
import { activeChain } from './config'

// ─── Public Client (read-only, no wallet needed) ─────────────────────

let _publicClient: PublicClient | null = null

export function getPublicClient(): PublicClient {
  if (!_publicClient) {
    _publicClient = createPublicClient({
      chain: activeChain,
      transport: http(activeChain.rpcUrls.default.http[0]),
    })
  }
  return _publicClient
}

// ─── Wallet Client (requires MetaMask/injected provider) ─────────────

export function getWalletClient(): WalletClient | null {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null
  }

  return createWalletClient({
    chain: activeChain,
    transport: custom(window.ethereum),
  })
}

// ─── Utility: Check if EVM wallet is available ───────────────────────

export function hasEvmProvider(): boolean {
  return typeof window !== 'undefined' && !!window.ethereum
}

// ─── Type augmentation for window.ethereum ───────────────────────────

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      on: (event: string, handler: (...args: unknown[]) => void) => void
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void
      isMetaMask?: boolean
    }
  }
}
