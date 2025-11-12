// FILE: lib/supabase/queries/pools.ts
// ============================================
import { supabase } from '../client'

export const poolQueries = {
  async getAll() {
    const { data, error } = await supabase
      .from('pools')
      .select('*')
      .order('tvl', { ascending: false })
    
    return { data, error }
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('pools')
      .select('*')
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  async search(query: string) {
    const { data, error } = await supabase
      .from('pools')
      .select('*')
      .or(`name.ilike.%${query}%,symbol.ilike.%${query}%`)
      .order('tvl', { ascending: false })
    
    return { data, error }
  },

  async filterByRisk(riskLevel: 'Low' | 'Medium' | 'High') {
    const { data, error } = await supabase
      .from('pools')
      .select('*')
      .eq('risk_level', riskLevel)
      .order('tvl', { ascending: false })
    
    return { data, error }
  },
}