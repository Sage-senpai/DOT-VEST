// FILE: hooks/use-wallet-balance.ts (FIXED)
// LOCATION: /hooks/use-wallet-balance.ts
// ============================================
"use client"

import { useState, useEffect, useCallback } from 'react'
import { usePolkadotExtension } from './use-polkadot-extension'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { formatBalance } from '@polkadot/util'

export interface TokenBalance {
  token: string
  symbol: string
  balance: string
  formatted: string
  usdValue?: number
  chain: string
}

export interface ChainBalance {
  chain: string
  rpcUrl: string
  tokens: TokenBalance[]
  totalUsdValue: number
}

interface ChainConfig {
  name: string
  rpcUrl: string
  symbol: string
  decimals: number
}

type ChainKey = 'polkadot' | 'acala' | 'hydration' | 'bifrost'

const CHAIN_CONFIGS: Record<ChainKey, ChainConfig> = {
  polkadot: {
    name: 'Polkadot',
    rpcUrl: process.env.NEXT_PUBLIC_POLKADOT_RPC_URL || 'wss://rpc.polkadot.io',
    symbol: 'DOT',
    decimals: 10,
  },
  acala: {
    name: 'Acala',
    rpcUrl: process.env.NEXT_PUBLIC_ACALA_RPC_URL || 'wss://acala-rpc.dwellir.com',
    symbol: 'ACA',
    decimals: 12,
  },
  hydration: {
    name: 'Hydration',
    rpcUrl: process.env.NEXT_PUBLIC_HYDRATION_RPC_URL || 'wss://rpc.hydradx.cloud',
    symbol: 'HDX',
    decimals: 12,
  },
  bifrost: {
    name: 'Bifrost',
    rpcUrl: process.env.NEXT_PUBLIC_BIFROST_RPC_URL || 'wss://bifrost-rpc.dwellir.com',
    symbol: 'BNC',
    decimals: 12,
  },
}

type MockPrices = {
  [key: string]: number
}

const mockPrices: MockPrices = {
  DOT: 7.5,
  ACA: 0.08,
  HDX: 0.02,
  BNC: 0.5,
}

export function useWalletBalance() {
  const { selectedAccount, isReady } = usePolkadotExtension()
  const [balances, setBalances] = useState<ChainBalance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0)

  const fetchChainBalance = useCallback(async (
    chainKey: ChainKey,
    address: string
  ): Promise<ChainBalance | null> => {
    const config = CHAIN_CONFIGS[chainKey]
    if (!config) return null

    try {
      const provider = new WsProvider(config.rpcUrl)
      const api = await ApiPromise.create({ provider })

      // Get account data with proper typing
      const accountInfo: any = await api.query.system.account(address)
      const balance = accountInfo.data
      
      // Format balance
      formatBalance.setDefaults({ 
        decimals: config.decimals, 
        unit: config.symbol 
      })

      const free = balance.free.toString()
      const formatted = formatBalance(free, { 
        withSi: true, 
        decimals: config.decimals 
      })

      // Calculate USD value
      const balanceNumber = Number(free) / Math.pow(10, config.decimals)
      const price = mockPrices[config.symbol] || 0
      const usdValue = balanceNumber * price

      await api.disconnect()

      return {
        chain: config.name,
        rpcUrl: config.rpcUrl,
        tokens: [{
          token: config.name,
          symbol: config.symbol,
          balance: free,
          formatted,
          usdValue,
          chain: config.name,
        }],
        totalUsdValue: usdValue,
      }
    } catch (err) {
      console.error(`Error fetching ${config.name} balance:`, err)
      return null
    }
  }, [])

  const refreshBalances = useCallback(async () => {
    if (!selectedAccount || !isReady) {
      setBalances([])
      setTotalPortfolioValue(0)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const chainKeys: ChainKey[] = ['polkadot', 'acala', 'hydration', 'bifrost']
      const balancePromises = chainKeys.map(key => 
        fetchChainBalance(key, selectedAccount.address)
      )

      const results = await Promise.all(balancePromises)
      const validBalances = results.filter((b): b is ChainBalance => b !== null)

      setBalances(validBalances)

      // Calculate total portfolio value
      const total = validBalances.reduce((sum, chain) => sum + chain.totalUsdValue, 0)
      setTotalPortfolioValue(total)
    } catch (err) {
      console.error('Error refreshing balances:', err)
      setError('Failed to fetch wallet balances')
    } finally {
      setLoading(false)
    }
  }, [selectedAccount, isReady, fetchChainBalance])

  // Auto-refresh on account change
  useEffect(() => {
    refreshBalances()
  }, [refreshBalances])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!selectedAccount || !isReady) return

    const interval = setInterval(() => {
      refreshBalances()
    }, 30000)

    return () => clearInterval(interval)
  }, [selectedAccount, isReady, refreshBalances])

  return {
    balances,
    totalPortfolioValue,
    loading,
    error,
    refreshBalances,
    isReady: isReady && selectedAccount !== null,
  }
}
