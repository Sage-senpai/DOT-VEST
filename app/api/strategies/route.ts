// FILE: app/api/strategies/route.ts (FIXED)
// LOCATION: /app/api/strategies/route.ts
// ============================================
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'  // ← Fixed

export async function GET(request: Request) {
  try {
    const supabase = await createClient()  // ← Fixed
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: strategies, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data: strategies })
  } catch (error) {
    console.error('Strategies API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch strategies' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()  // ← Fixed
    const body = await request.json()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: strategy, error } = await supabase
      .from('strategies')
      .insert({
        ...body,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data: strategy })
  } catch (error) {
    console.error('Strategy creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create strategy' },
      { status: 500 }
    )
  }
}