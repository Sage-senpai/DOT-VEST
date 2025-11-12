// FILE: lib/supabase/queries/vaults.ts
// ============================================
import { supabase } from '../client'

export const vaultQueries = {
  async getUserVaults(userId: string) {
    const { data, error } = await supabase
      .from('vaults')
      .select(`
        *,
        pool:pools(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  async getVaultById(id: string) {
    const { data, error } = await supabase
      .from('vaults')
      .select(`
        *,
        pool:pools(*)
      `)
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  async createVault(vaultData: any) {
    const { data, error } = await supabase
      .from('vaults')
      .insert(vaultData)
      .select()
      .single()
    
    return { data, error }
  },

  async updateVault(id: string, updates: any) {
    const { data, error } = await supabase
      .from('vaults')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  async deleteVault(id: string) {
    const { error } = await supabase
      .from('vaults')
      .delete()
      .eq('id', id)
    
    return { error }
  },
}