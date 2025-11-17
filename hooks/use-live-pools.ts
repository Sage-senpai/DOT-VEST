// FILE: hooks/use-live-pools.ts (FIXED WITH ERROR HANDLING)
"use client"
import { useState, useEffect, useCallback } from 'react'

export interface LivePool {
  chain: string
  project: string
  symbol: string
  tvlUsd: number
  apy: number
  apyBase: number
  apyReward: number
  il7d: number | null
  poolMeta: string | null
  riskScore: number
}

interface PoolsMetadata {
  count: number
  chains: string[]
  fetchedAt: string | null
  avgAPY: number
  totalTVL: number
  lastUpdated: string
  total: number
}

interface PoolsResponse {
  success: boolean
  data: LivePool[]
  metadata?: PoolsMetadata
  error?: string
}

// Mock data fallback
const MOCK_POOLS: LivePool[] = [
  {
    chain: 'Acala',
    project: 'Acala Swap',
    symbol: 'ACA-AUSD',
    tvlUsd: 1500000,
    apy: 12.5,
    apyBase: 8.0,
    apyReward: 4.5,
    il7d: -0.5,
    poolMeta: 'Stable pair',
    riskScore: 75
  },
  {
    chain: 'Hydration',
    project: 'Omnipool',
    symbol: 'DOT-HDX',
    tvlUsd: 3200000,
    apy: 18.2,
    apyBase: 12.0,
    apyReward: 6.2,
    il7d: -1.2,
    poolMeta: 'High liquidity',
    riskScore: 68
  },
  {
    chain: 'Bifrost',
    project: 'Zenlink',
    symbol: 'BNC-vDOT',
    tvlUsd: 980000,
    apy: 22.8,
    apyBase: 15.0,
    apyReward: 7.8,
    il7d: -2.1,
    poolMeta: 'Liquid staking',
    riskScore: 62
  }
]

export function useLivePools() {
  const [pools, setPools] = useState<LivePool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [useMockData, setUseMockData] = useState(false)

  const fetchPools = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('[useLivePools] Fetching from API...')
      
      const response = await fetch('/api/pools/live', {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`)
      }
      
      const result: PoolsResponse = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch pools')
      }
      
      if (!result.data || result.data.length === 0) {
        console.warn('[useLivePools] API returned no pools, using mock data')
        setPools(MOCK_POOLS)
        setUseMockData(true)
      } else {
        setPools(result.data)
        setUseMockData(false)
        console.log(`✅ Loaded ${result.data.length} pools from API`)
      }
      
      setLastFetch(new Date())
      setError(null)
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ Failed to fetch pools:', message)
      setError(message)
      
      // Fallback to mock data
      if (pools.length === 0) {
        console.log('[useLivePools] Using mock data as fallback')
        setPools(MOCK_POOLS)
        setUseMockData(true)
      }
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [pools.length])

  useEffect(() => {
    // Only fetch once on mount
    let mounted = true
    
    const loadPools = async () => {
      if (mounted) {
        await fetchPools()
      }
    }
    
    loadPools()
    
    // Refresh every 5 minutes
    const interval = setInterval(() => {
      if (mounted) {
        fetchPools()
      }
    }, 5 * 60 * 1000)
    
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, []) // Empty dependency array - only run once

  const refresh = useCallback(() => {
    setIsRefreshing(true)
    fetchPools()
  }, [fetchPools])

  const getPoolsByChain = useCallback((chain: string) => {
    return pools.filter(p => p.chain.toLowerCase() === chain.toLowerCase())
  }, [pools])

  const getTopPoolsByAPY = useCallback((limit: number = 10) => {
    return [...pools].sort((a, b) => b.apy - a.apy).slice(0, limit)
  }, [pools])

  const getPoolsByRisk = useCallback((maxRisk: number) => {
    return pools.filter(p => p.riskScore >= maxRisk)
  }, [pools])

  const avgAPY = pools.length > 0 ? pools.reduce((s, p) => s + p.apy, 0) / pools.length : 0
  const totalTVL = pools.reduce((s, p) => s + p.tvlUsd, 0)

  const metadata: PoolsMetadata = {
    count: pools.length,
    chains: [...new Set(pools.map(p => p.chain))],
    fetchedAt: lastFetch?.toISOString() || null,
    avgAPY,
    totalTVL,
    lastUpdated: lastFetch?.toISOString() || new Date().toISOString(),
    total: pools.length
  }

  return {
    pools,
    loading,
    error,
    lastFetch,
    refresh,
    isRefreshing,
    getPoolsByChain,
    getTopPoolsByAPY,
    getPoolsByRisk,
    metadata,
    chains: [...new Set(pools.map(p => p.chain))],
    avgAPY,
    totalTVL,
    useMockData
  }
}

// Helper hook for optimal pool finding
export function useOptimalPool(pools: LivePool[] = []) {
  const findOptimal = useCallback(async (options?: { 
    amount?: number
    duration?: number
    riskTolerance?: string 
  }) => {
    if (pools.length === 0) return { success: false, data: null }
    
    const filtered = options?.riskTolerance 
      ? pools.filter(p => {
          if (options.riskTolerance === 'low') return p.riskScore >= 70
          if (options.riskTolerance === 'medium') return p.riskScore >= 40
          return p.riskScore >= 0
        })
      : pools

    if (filtered.length === 0) return { success: false, data: null }

    const optimal = filtered.reduce((prev, curr) => (curr.apy > prev.apy ? curr : prev))
    
    return {
      success: true,
      data: {
        pool: optimal,
        apy: optimal.apy,
        name: `${optimal.symbol} ${optimal.project}`
      }
    }
  }, [pools])

  const isLoading = pools.length === 0

  return { findOptimal, isLoading }
}

// Helper hook for pool categories
export function usePoolCategories() {
  const [categories] = useState({
    low: [],
    medium: [],
    high: []
  })

  return { categories }
}