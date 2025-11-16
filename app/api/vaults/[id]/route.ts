// FILE: app/api/vaults/[id]/route.ts
// ============================================
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: fetch a single vault by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Next.js 16 requires params as a Promise
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('vaults')
      .select(`
        *,
        pool:pools(*)
      `)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()

    if (error) throw error

    return NextResponse.json({ data, error: null })
  } catch (error) {
    return NextResponse.json(
      { data: null, error: 'Failed to fetch vault' },
      { status: 500 }
    )
  }
}

// PATCH: update vault by ID
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from('vaults')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data, error: null })
  } catch (error) {
    return NextResponse.json(
      { data: null, error: 'Failed to update vault' },
      { status: 500 }
    )
  }
}

// DELETE: remove vault by ID
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('vaults')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete vault' },
      { status: 500 }
    )
  }
}
