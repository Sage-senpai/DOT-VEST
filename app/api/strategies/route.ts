// FILE: app/api/strategies/route.ts
// ============================================
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('strategies')
      .select(`
        *,
        pool:pools(*)
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data, error: null })
  } catch (error) {
    return NextResponse.json(
      { data: null, error: 'Failed to fetch strategies' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Calculate estimated return
    const estimatedReturn = body.amount * (body.apy / 100) * (body.duration / 12)

    const { data: strategy, error } = await supabase
      .from('strategies')
      .insert({
        ...body,
        user_id: session.user.id,
        estimated_return: estimatedReturn,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data: strategy, error: null })
  } catch (error) {
    return NextResponse.json(
      { data: null, error: 'Failed to execute strategy' },
      { status: 500 }
    )
  }
}
