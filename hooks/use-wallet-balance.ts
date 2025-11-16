// FILE: hooks/use-wallet-balance.ts (FIXED - Asset Hub Support)
"use client"

import { useState, useEffect, useCallback } from 'react'
import { useEnhancedPolkadot } from './use-enhanced-polkadot'
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
  coingeckoId: string
  isAssetHub?: boolean
}

type ChainKey = 'polkadot' | 'assethub' | 'acala' | 'hydration' | 'bifrost'

const CHAIN_CONFIGS: Record<ChainKey, ChainConfig> = {
  polkadot: {
    name: 'Polkadot Relay',
    rpcUrl: process.env.NEXT_PUBLIC_POLKADOT_RPC_URL || 'wss://rpc.polkadot.io',
    symbol: 'DOT',
    decimals: 10,
    coingeckoId: 'polkadot'
  },
  assethub: {
    name: 'Asset Hub',
    rpcUrl: 'wss://polkadot-asset-hub-rpc.polkadot.io',
    symbol: 'DOT',
    decimals: 10,
    coingeckoId: 'polkadot',
    isAssetHub: true
  },
  acala: {
    name: 'Acala',
    rpcUrl: process.env.NEXT_PUBLIC_ACALA_RPC_URL || 'wss://acala-rpc.dwellir.com',
    symbol: 'ACA',
    decimals: 12,
    coingeckoId: 'acala'
  },
  hydration: {
    name: 'Hydration',
    rpcUrl: process.env.NEXT_PUBLIC_HYDRATION_RPC_URL || 'wss://rpc.hydradx.cloud',
    symbol: 'HDX',
    decimals: 12,
    coingeckoId: 'hydration'
  },
  bifrost: {
    name: 'Bifrost',
    rpcUrl: process.env.NEXT_PUBLIC_BIFROST_RPC_URL || 'wss://bifrost-rpc.dwellir.com',
    symbol: 'BNC',
    decimals: 12,
    coingeckoId: 'bifrost-native-coin'
  },
}

let priceCache: { [key: string]: { price: number; timestamp: number } } = {}
const PRICE_CACHE_TTL = 5 * 60 * 1000

async function fetchRealPrices(): Promise<{ [key: string]: number }> {
  try {
    const now = Date.now()
    const cachedPrices: { [key: string]: number } = {}
    let needsFetch = false
    
    Object.entries(CHAIN_CONFIGS).forEach(([key, config]) => {
      const cached = priceCache[config.coingeckoId]
      if (cached && now - cached.timestamp < PRICE_CACHE_TTL) {
        cachedPrices[config.symbol] = cached.price
      } else {
        needsFetch = true
      }
    })
    
    if (!needsFetch && Object.keys(cachedPrices).length > 0) {
      return cachedPrices
    }
    
    const ids = [...new Set(Object.values(CHAIN_CONFIGS).map(c => c.coingeckoId))].join(',')
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      { next: { revalidate: 300 } }
    )
    
    if (!response.ok) throw new Error('Failed to fetch prices')
    
    const data = await response.json()
    const prices: { [key: string]: number } = {}
    
    Object.entries(CHAIN_CONFIGS).forEach(([key, config]) => {
      const price = data[config.coingeckoId]?.usd || 0
      prices[config.symbol] = price
      priceCache[config.coingeckoId] = { price, timestamp: now }
    })
    
    console.log('[Wallet] Fetched real prices:', prices)
    return prices
    
  } catch (error) {
    console.error('[Wallet] Error fetching prices:', error)
    return {
      DOT: 7.5,
      ACA: 0.08,
      HDX: 0.02,
      BNC: 0.5
    }
  }
}

export function useWalletBalance() {
  const { selectedAccount, isReady } = useEnhancedPolkadot()
  const [balances, setBalances] = useState<ChainBalance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0)
  const [prices, setPrices] = useState<{ [key: string]: number }>({})
  const [viewMode, setViewMode] = useState<'relay' | 'assethub' | 'both'>('both')

  const fetchChainBalance = useCallback(async (
    chainKey: ChainKey,
    address: string,
    tokenPrices: { [key: string]: number }
  ): Promise<ChainBalance | null> => {
    const config = CHAIN_CONFIGS[chainKey]
    if (!config) return null

    try {
      const provider = new WsProvider(config.rpcUrl)
      const api = await ApiPromise.create({ provider })

      const accountInfo: any = await api.query.system.account(address)
      const balance = accountInfo.data
      
      formatBalance.setDefaults({ 
        decimals: config.decimals, 
        unit: config.symbol 
      })

      const free = balance.free.toString()
      const formatted = formatBalance(free, { 
        withSi: true, 
        decimals: config.decimals 
      })

      const balanceNumber = Number(free) / Math.pow(10, config.decimals)
      const price = tokenPrices[config.symbol] || 0
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
      const tokenPrices = await fetchRealPrices()
      setPrices(tokenPrices)
      
      let chainKeys: ChainKey[]
      
      if (viewMode === 'relay') {
        chainKeys = ['polkadot', 'acala', 'hydration', 'bifrost']
      } else if (viewMode === 'assethub') {
        chainKeys = ['assethub', 'acala', 'hydration', 'bifrost']
      } else {
        chainKeys = ['polkadot', 'assethub', 'acala', 'hydration', 'bifrost']
      }

      const balancePromises = chainKeys.map(key => 
        fetchChainBalance(key, selectedAccount.address, tokenPrices)
      )

      const results = await Promise.all(balancePromises)
      const validBalances = results.filter((b): b is ChainBalance => b !== null)

      setBalances(validBalances)

      const total = validBalances.reduce((sum, chain) => sum + chain.totalUsdValue, 0)
      setTotalPortfolioValue(total)
      
      console.log(`[Wallet] Updated balances (${viewMode}). Total: $${total.toFixed(2)}`)
    } catch (err) {
      console.error('Error refreshing balances:', err)
      setError('Failed to fetch wallet balances')
    } finally {
      setLoading(false)
    }
  }, [selectedAccount, isReady, fetchChainBalance, viewMode])

  useEffect(() => {
    refreshBalances()
  }, [refreshBalances])

  useEffect(() => {
    if (!selectedAccount || !isReady) return

    const interval = setInterval(() => {
      refreshBalances()
    }, 30000)

    return () => clearInterval(interval)
  }, [selectedAccount, isReady, refreshBalances])

  const switchViewMode = useCallback((mode: 'relay' | 'assethub' | 'both') => {
    setViewMode(mode)
  }, [])

  return {
    balances,
    totalPortfolioValue,
    loading,
    error,
    refreshBalances,
    isReady: isReady && selectedAccount !== null,
    prices,
    viewMode,
    switchViewMode,
  }
}