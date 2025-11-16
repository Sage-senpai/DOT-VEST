// FILE: hooks/use-live-pools.ts (FIXED)
// LOCATION: /hooks/use-live-pools.ts
// ============================================
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

export function useLivePools() {
  const [pools, setPools] = useState<LivePool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchPools = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/pools/live', {
        next: { revalidate: 300 }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result: PoolsResponse = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch pools')
      }
      
      setPools(result.data)
      setLastFetch(new Date())
      
      console.log(`✅ Loaded ${result.data.length} pools from ${result.metadata?.chains.length} chains`)
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('❌ Failed to fetch pools:', message)
      
      if (pools.length > 0) {
        console.log('ℹ️  Using cached pool data')
      }
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [pools.length])

  useEffect(() => {
    fetchPools()
    const interval = setInterval(fetchPools, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchPools])

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
    totalTVL
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