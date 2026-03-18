'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { formatEther } from 'viem'
import { getPublicClient, hasEvmProvider } from '@/lib/contracts/client'
import { activeChain } from '@/lib/contracts/config'

interface EvmWalletState {
  evmAddress: `0x${string}` | null
  isEvmConnected: boolean
  evmBalance: string
  isConnecting: boolean
  error: string | null
  chainId: number | null
  isCorrectChain: boolean
}

const DISCONNECTED_KEY = 'evm-disconnected'

function isDisconnected(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(DISCONNECTED_KEY) === 'true'
}

const emptyState: EvmWalletState = {
  evmAddress: null,
  isEvmConnected: false,
  evmBalance: '0',
  isConnecting: false,
  error: null,
  chainId: null,
  isCorrectChain: false,
}

export function useEvmWallet() {
  const [state, setState] = useState<EvmWalletState>(emptyState)
  // Use a ref so event listeners always see the latest value
  const disconnectedRef = useRef(false)

  // Sync ref on mount
  useEffect(() => {
    disconnectedRef.current = isDisconnected()
  }, [])

  // Set up listeners once — they check disconnectedRef on every event
  useEffect(() => {
    if (!hasEvmProvider()) return

    // Auto-connect on mount if not disconnected
    if (!disconnectedRef.current) {
      ;(async () => {
        try {
          const accounts = await window.ethereum!.request({ method: 'eth_accounts' }) as string[]
          if (accounts.length > 0 && !disconnectedRef.current) {
            const address = accounts[0] as `0x${string}`
            const chainId = Number(await window.ethereum!.request({ method: 'eth_chainId' }))
            setState(prev => ({
              ...prev,
              evmAddress: address,
              isEvmConnected: true,
              chainId,
              isCorrectChain: chainId === activeChain.id,
            }))
          }
        } catch {
          // Silently fail
        }
      })()
    }

    const handleAccountsChanged = (...args: unknown[]) => {
      // If user manually disconnected, ignore all wallet events
      if (disconnectedRef.current) return

      const accounts = args[0] as string[]
      if (accounts.length === 0) {
        setState(prev => ({
          ...prev,
          evmAddress: null,
          isEvmConnected: false,
          evmBalance: '0',
          chainId: null,
          isCorrectChain: false,
        }))
      } else {
        setState(prev => ({
          ...prev,
          evmAddress: accounts[0] as `0x${string}`,
          isEvmConnected: true,
        }))
      }
    }

    const handleChainChanged = (...args: unknown[]) => {
      if (disconnectedRef.current) return

      const chainIdHex = args[0] as string
      const chainId = Number(chainIdHex)
      setState(prev => ({
        ...prev,
        chainId,
        isCorrectChain: chainId === activeChain.id,
      }))
    }

    window.ethereum!.on('accountsChanged', handleAccountsChanged)
    window.ethereum!.on('chainChanged', handleChainChanged)

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum?.removeListener('chainChanged', handleChainChanged)
    }
  }, [])

  // Fetch balance when address or chain changes
  useEffect(() => {
    if (!state.evmAddress || !state.isCorrectChain) return

    const fetchBalance = async () => {
      try {
        const client = getPublicClient()
        const balance = await client.getBalance({ address: state.evmAddress! })
        setState(prev => ({ ...prev, evmBalance: formatEther(balance) }))
      } catch {
        // Balance fetch failed
      }
    }

    fetchBalance()
    const interval = setInterval(fetchBalance, 15000)
    return () => clearInterval(interval)
  }, [state.evmAddress, state.isCorrectChain])

  const connectEvmWallet = useCallback(async () => {
    if (!hasEvmProvider()) {
      setState(prev => ({ ...prev, error: 'No EVM wallet found. Please install MetaMask.' }))
      return
    }

    // Clear disconnected flag
    disconnectedRef.current = false
    sessionStorage.removeItem(DISCONNECTED_KEY)

    setState(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      // Force account picker on every connect
      await window.ethereum!.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      })

      const accounts = await window.ethereum!.request({ method: 'eth_accounts' }) as string[]

      if (accounts.length > 0) {
        const address = accounts[0] as `0x${string}`
        const chainId = Number(await window.ethereum!.request({ method: 'eth_chainId' }))

        setState(prev => ({
          ...prev,
          evmAddress: address,
          isEvmConnected: true,
          isConnecting: false,
          chainId,
          isCorrectChain: chainId === activeChain.id,
        }))
      }
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: err.message || 'Failed to connect wallet',
      }))
    }
  }, [])

  const switchToPolkadotHub = useCallback(async () => {
    if (!hasEvmProvider()) return

    try {
      await window.ethereum!.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${activeChain.id.toString(16)}` }],
      })
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum!.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${activeChain.id.toString(16)}`,
                chainName: activeChain.name,
                nativeCurrency: activeChain.nativeCurrency,
                rpcUrls: activeChain.rpcUrls.default.http,
                blockExplorerUrls: [activeChain.blockExplorers.default.url],
              },
            ],
          })
        } catch (addError: any) {
          setState(prev => ({ ...prev, error: addError.message || 'Failed to add network' }))
        }
      }
    }
  }, [])

  const disconnectEvmWallet = useCallback(async () => {
    // Set disconnected flag FIRST so listeners ignore any subsequent events
    disconnectedRef.current = true
    sessionStorage.setItem(DISCONNECTED_KEY, 'true')

    // Try to revoke permissions (MetaMask supports this)
    if (hasEvmProvider()) {
      try {
        await window.ethereum!.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }],
        })
      } catch {
        // Not all wallets support this — that's OK, we have the ref guard
      }
    }

    setState({ ...emptyState })
  }, [])

  return {
    ...state,
    hasEvmProvider: hasEvmProvider(),
    connectEvmWallet,
    switchToPolkadotHub,
    disconnectEvmWallet,
  }
}
