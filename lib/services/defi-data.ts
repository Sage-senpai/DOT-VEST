// FILE: lib/services/defi-data.ts (FIXED with PoolData type)
// LOCATION: /lib/services/defi-data.ts
// ============================================

// Type Definitions
export interface PoolData {
  id: string
  name: string
  protocol: string
  chain: string
  apy: number
  tvl: number
  tvlUsd: number
  token: string
  symbol: string
  project: string
  riskScore: number
  audited: boolean
  lastUpdated: string
}

// Simple client cache
const clientCache = {
  store: new Map<string, { value: any; expires: number }>(),

  has(key: string) {
    const item = this.store.get(key)
    if (!item) return false
    if (Date.now() > item.expires) {
      this.store.delete(key)
      return false
    }
    return true
  },

  get<T>(key: string): T | undefined {
    const item = this.store.get(key)
    if (!item) return undefined
    if (Date.now() > item.expires) {
      this.store.delete(key)
      return undefined
    }
    return item.value
  },

  set(key: string, value: any, ttl: number) {
    this.store.set(key, { value, expires: Date.now() + ttl })
  },
}

export class DefiDataService {
  private static DEFILLAMA_API = 'https://yields.llama.fi/pools'
  private static SUBSCAN_API = 'https://polkadot.api.subscan.io/api/scan'

  static async fetchPolkadotPools(): Promise<PoolData[]> {
    try {
      const response = await fetch(this.DEFILLAMA_API)
      const data = await response.json()

      const polkadotChains = [
        'Polkadot',
        'Acala',
        'Moonbeam',
        'Astar',
        'Parallel',
        'Bifrost',
        'HydraDX',
        'Interlay'
      ]

      const pools: PoolData[] = data.data
        .filter(
          (pool: any) =>
            polkadotChains.includes(pool.chain) &&
            pool.apy > 0 &&
            pool.tvlUsd > 10000
        )
        .map((pool: any) => ({
          id: pool.pool,
          name: pool.symbol || pool.project,
          protocol: pool.project,
          chain: pool.chain,
          apy: parseFloat(pool.apy.toFixed(2)),
          tvl: pool.tvlUsd,
          tvlUsd: pool.tvlUsd,
          token: pool.symbol,
          symbol: pool.symbol,
          project: pool.project,
          riskScore: this.calculateRiskScore(pool),
          audited: pool.audits?.length > 0 || false,
          lastUpdated: new Date().toISOString()
        }))
        .sort((a: PoolData, b: PoolData) => b.apy - a.apy)

      return pools
    } catch (error) {
      console.error('Error fetching DeFi data:', error)
      return []
    }
  }

  static async fetchPolkadotPoolsWithCache(): Promise<PoolData[]> {
    const cacheKey = 'polkadot-pools'

    if (clientCache.has(cacheKey)) {
      console.log('[DefiData] Using cached pools')
      return clientCache.get<PoolData[]>(cacheKey)!
    }

    const pools = await this.fetchPolkadotPools()
    clientCache.set(cacheKey, pools, 300000) // cache 5 min
    return pools
  }

  private static calculateRiskScore(pool: any): number {
    let score = 100

    if (pool.tvlUsd < 100000) score -= 20
    else if (pool.tvlUsd < 1000000) score -= 10
    else if (pool.tvlUsd < 10000000) score -= 5

    if (pool.apy > 100) score -= 30
    else if (pool.apy > 50) score -= 15
    else if (pool.apy > 30) score -= 5

    if (!pool.audits || pool.audits.length === 0) score -= 25

    const poolAge = pool.poolMeta?.inception
    if (poolAge) {
      const ageInDays =
        (Date.now() - new Date(poolAge).getTime()) / (1000 * 60 * 60 * 24)
      if (ageInDays < 30) score -= 20
      else if (ageInDays < 90) score -= 10
    }

    return Math.max(0, Math.min(100, score))
  }

  static async fetchStakingData(): Promise<PoolData[]> {
    try {
      const response = await fetch(`${this.SUBSCAN_API}/staking_pools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row: 50, page: 0 })
      })
      const data = await response.json()

      if (!data || !data.data || !data.data.pools) return []

      const stakingPools: PoolData[] = data.data.pools.map((pool: any) => ({
        id: pool.id,
        name: pool.name,
        protocol: pool.protocol,
        chain: 'Polkadot',
        apy: parseFloat(pool.apy?.toFixed(2)) || 0,
        tvl: pool.tvl || 0,
        tvlUsd: pool.tvl || 0,
        token: pool.token || '',
        symbol: pool.token || '',
        project: pool.protocol,
        riskScore: pool.riskScore || 50,
        audited: pool.audited || false,
        lastUpdated: new Date().toISOString()
      }))

      return stakingPools
    } catch (error) {
      console.error('[DefiData] Error fetching staking pools:', error)
      return []
    }
  }

  static categorizeByRisk(pools: PoolData[]): Record<'low' | 'medium' | 'high', PoolData[]> {
    const categories = { 
      low: [] as PoolData[], 
      medium: [] as PoolData[], 
      high: [] as PoolData[] 
    }

    for (const pool of pools) {
      if (pool.riskScore >= 70) categories.low.push(pool)
      else if (pool.riskScore >= 40) categories.medium.push(pool)
      else categories.high.push(pool)
    }

    return categories
  }

  static async findOptimalPool(params: {
    amount: number
    duration: number
    riskTolerance: 'low' | 'medium' | 'high'
  }): Promise<PoolData | null> {
    const polkadotPools = await this.fetchPolkadotPoolsWithCache()
    const stakingPools = await this.fetchStakingData()
    const allPools = [...polkadotPools, ...stakingPools]

    if (!allPools.length) return null

    const categorized = this.categorizeByRisk(allPools)
    let selectedPools: PoolData[] = []

    switch (params.riskTolerance) {
      case 'low':
        selectedPools = categorized.low
        break
      case 'medium':
        selectedPools = categorized.medium
        break
      case 'high':
        selectedPools = categorized.high
        break
    }

    if (!selectedPools.length) return null

    selectedPools.sort((a, b) => b.apy - a.apy)
    return selectedPools[0]
  }
}

// Export singleton instance
export const defiData = DefiDataService