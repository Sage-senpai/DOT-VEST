'use client'

import { useState, useEffect, useCallback } from 'react'
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

export function useEvmWallet() {
  const [state, setState] = useState<EvmWalletState>({
    evmAddress: null,
    isEvmConnected: false,
    evmBalance: '0',
    isConnecting: false,
    error: null,
    chainId: null,
    isCorrectChain: false,
  })

  // Check if already connected on mount
  useEffect(() => {
    if (!hasEvmProvider()) return

    const checkConnection = async () => {
      try {
        const accounts = await window.ethereum!.request({
          method: 'eth_accounts',
        }) as string[]

        if (accounts.length > 0) {
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
        // Silently fail — user hasn't connected yet
      }
    }

    checkConnection()

    // Listen for account/chain changes
    const handleAccountsChanged = (...args: unknown[]) => {
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
    const interval = setInterval(fetchBalance, 15000) // refresh every 15s
    return () => clearInterval(interval)
  }, [state.evmAddress, state.isCorrectChain])

  const connectEvmWallet = useCallback(async () => {
    if (!hasEvmProvider()) {
      setState(prev => ({ ...prev, error: 'No EVM wallet found. Please install MetaMask.' }))
      return
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      const accounts = await window.ethereum!.request({
        method: 'eth_requestAccounts',
      }) as string[]

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
      // Chain not added — add it
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

  const disconnectEvmWallet = useCallback(() => {
    setState({
      evmAddress: null,
      isEvmConnected: false,
      evmBalance: '0',
      isConnecting: false,
      error: null,
      chainId: null,
      isCorrectChain: false,
    })
  }, [])

  return {
    ...state,
    hasEvmProvider: hasEvmProvider(),
    connectEvmWallet,
    switchToPolkadotHub,
    disconnectEvmWallet,
  }
}
