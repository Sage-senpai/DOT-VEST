// FILE: app/api/strategies/[id]/route.ts (FIXED)
// LOCATION: /app/api/strategies/[id]/route.ts
// ============================================
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'  // ← Fixed

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()  // ← Fixed
    const body = await request.json()
    const { id } = await context.params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: strategy, error } = await supabase
      .from('strategies')
      .update(body)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data: strategy })
  } catch (error) {
    console.error('Strategy update error:', error)
    return NextResponse.json(
      { error: 'Failed to update strategy' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()  // ← Fixed
    const { id } = await context.params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('strategies')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Strategy delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete strategy' },
      { status: 500 }
    )
  }
}