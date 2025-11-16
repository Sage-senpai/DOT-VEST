// FILE: app/api/pools/route.ts (FIXED)
// LOCATION: /app/api/pools/route.ts
// ============================================
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'  // ← Fixed

export async function GET() {
  try {
    const supabase = await createClient()  // ← Fixed

    const { data: pools, error } = await supabase
      .from('pools')
      .select('*')
      .order('apy', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data: pools })
  } catch (error) {
    console.error('Pools API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pools' },
      { status: 500 }
    )
  }
}
