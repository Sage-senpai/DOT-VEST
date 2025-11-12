// FILE: lib/supabase/queries/strategies.ts
// ============================================
import { supabase } from '../client'

export const strategyQueries = {
  async getUserStrategies(userId: string) {
    const { data, error } = await supabase
      .from('strategies')
      .select(`
        *,
        pool:pools(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  async createStrategy(strategyData: any) {
    const { data, error } = await supabase
      .from('strategies')
      .insert(strategyData)
      .select()
      .single()
    
    return { data, error }
  },

  async updateStrategy(id: string, updates: any) {
    const { data, error } = await supabase
      .from('strategies')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  async getActiveStrategies(userId: string) {
    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    
    return { data, error }
  },
}
