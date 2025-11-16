// FILE: app/api/pools/[id]/route.ts (FIXED)
// LOCATION: /app/api/pools/[id]/route.ts
// ============================================
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'  // ← Fixed

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()  // ← Fixed
    const { id } = await context.params

    const { data: pool, error } = await supabase
      .from('pools')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!pool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 })
    }

    return NextResponse.json({ data: pool })
  } catch (error) {
    console.error('Pool fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pool' },
      { status: 500 }
    )
  }
}
