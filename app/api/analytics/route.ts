// FILE: app/api/analytics/route.ts (FIXED)
// LOCATION: /app/api/analytics/route.ts
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
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
