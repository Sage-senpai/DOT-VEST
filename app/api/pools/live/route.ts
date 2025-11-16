// FILE: app/api/pools/live/route.ts (FIXED)
// LOCATION: /app/api/pools/live/route.ts
// ============================================
import { NextRequest, NextResponse } from 'next/server'
import { DefiDataService } from '@/lib/services/defi-data'  // ← Fixed
import { createClient } from '@/lib/supabase/server'  // ← Fixed

export const revalidate = 300

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('[API] Fetching live pools...')
    
    const pools = await DefiDataService.fetchPolkadotPools()  // ← Fixed
    
    const duration = Date.now() - startTime
    console.log(`[API] Fetched ${pools.length} pools in ${duration}ms`)
    
    if (duration > 5000) {
      console.warn(`[API] Slow response: ${duration}ms`)
    }
    
    return NextResponse.json({
      success: true,
      data: pools,
      metadata: {
        count: pools.length,
        chains: [...new Set(pools.map(p => p.chain))],
        fetchedAt: new Date().toISOString(),
        duration: `${duration}ms`
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    })
    
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('[API] Error fetching pools:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch pool data',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration}ms`
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache',
      }
    })
  }
}
