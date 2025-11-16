// FILE: app/api/pools/live/route.ts
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 300

interface DefiLlamaPool {
  chain: string
  project: string
  symbol: string
  tvlUsd: number
  apy: number
  apyBase: number
  apyReward: number
  il7d: number | null
  poolMeta: string | null
}

interface LivePool extends DefiLlamaPool {
  riskScore: number
}

const POLKADOT_CHAINS = [
  'Polkadot',
  'Acala',
  'Moonbeam',
  'Astar',
  'Hydration',
  'HydraDX',
  'Bifrost',
  'Parallel',
  'Interlay',
  'Phala',
  'Centrifuge',
  'Moonriver'
]

function calculateRiskScore(pool: DefiLlamaPool): number {
  let score = 50

  // TVL factor (higher TVL = lower risk)
  if (pool.tvlUsd > 10_000_000) score += 20
  else if (pool.tvlUsd > 1_000_000) score += 10
  else if (pool.tvlUsd < 100_000) score -= 10

  // APY factor (extremely high APY = higher risk)
  if (pool.apy > 100) score -= 20
  else if (pool.apy > 50) score -= 10
  else if (pool.apy < 10) score += 10

  // Impermanent loss factor
  if (pool.il7d && pool.il7d < -5) score -= 15

  // Reward-based APY (less stable)
  if (pool.apyReward > pool.apyBase) score -= 5

  return Math.max(0, Math.min(100, score))
}

export async function GET() {
  const startTime = Date.now()
  
  try {
    console.log('[API] Fetching pools from DefiLlama...')
    
    const response = await fetch('https://yields.llama.fi/pools', {
      next: { revalidate: 300 },
      headers: {
        'Accept': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`DefiLlama API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid response format from DefiLlama')
    }
    
    // Filter for Polkadot ecosystem pools
    const polkadotPools: LivePool[] = data.data
      .filter((pool: DefiLlamaPool) => 
        pool.chain && 
        POLKADOT_CHAINS.some(chain => 
          pool.chain.toLowerCase().includes(chain.toLowerCase())
        )
      )
      .map((pool: DefiLlamaPool) => ({
        ...pool,
        riskScore: calculateRiskScore(pool)
      }))
      .sort((a: LivePool, b: LivePool) => b.apy - a.apy)

    const chains = [...new Set(polkadotPools.map(p => p.chain))]
    const avgAPY = polkadotPools.length > 0 
      ? polkadotPools.reduce((sum, p) => sum + p.apy, 0) / polkadotPools.length 
      : 0
    const totalTVL = polkadotPools.reduce((sum, p) => sum + p.tvlUsd, 0)
    
    const duration = Date.now() - startTime

    console.log(`[API] ✅ Fetched ${polkadotPools.length} pools from ${chains.length} chains in ${duration}ms`)

    return NextResponse.json({
      success: true,
      data: polkadotPools,
      metadata: {
        count: polkadotPools.length,
        total: polkadotPools.length,
        chains,
        avgAPY,
        totalTVL,
        fetchedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        duration: `${duration}ms`
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    })

  } catch (error) {
    const duration = Date.now() - startTime
    console.error('[API] ❌ Error fetching pools:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch pools',
      data: [],
      metadata: {
        count: 0,
        total: 0,
        chains: [],
        avgAPY: 0,
        totalTVL: 0,
        fetchedAt: null,
        lastUpdated: new Date().toISOString(),
        duration: `${duration}ms`
      }
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache',
      }
    })
  }
}