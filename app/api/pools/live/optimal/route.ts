// FILE: app/api/pools/live/optimal/route.ts (FIXED)
// LOCATION: /app/api/pools/live/optimal/route.ts
// ============================================
import { NextRequest, NextResponse } from 'next/server'
import { DefiDataService } from '@/lib/services/defi-data'  // ← Fixed: DefiDataService

export const revalidate = 300

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    const { amount, duration, riskTolerance } = body
    
    if (!amount || !duration || !riskTolerance) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: amount, duration, riskTolerance'
      }, { status: 400 })
    }
    
    console.log('[API] Finding optimal pools:', { amount, duration, riskTolerance })
    
    const optimal = await DefiDataService.findOptimalPool({
  amount,
  duration,
  riskTolerance
})
  // ← Fixed
    
    const duration_ms = Date.now() - startTime
    console.log(`[API] Found optimal pool in ${duration_ms}ms`)
    
    return NextResponse.json({
      success: true,
      data: optimal,
      metadata: {
        duration: `${duration_ms}ms`,
        fetchedAt: new Date().toISOString()
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      }
    })
    
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('[API] Error finding optimal pool:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to find optimal pool',
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