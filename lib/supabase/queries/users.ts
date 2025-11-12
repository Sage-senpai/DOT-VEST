// FILE: lib/supabase/queries/users.ts
// ============================================
import { supabase } from '../client'

export const userQueries = {
  async getOrCreateProfile(userId: string, email: string) {
    const { data: existing, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (existing) return { data: existing, error: null }

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username: email.split('@')[0],
        full_name: '',
        avatar_url: '',
        wallet_address: null,
      })
      .select()
      .single()

    return { data, error }
  },

  async updateWalletAddress(userId: string, walletAddress: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        wallet_address: walletAddress,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    return { data, error }
  },
}