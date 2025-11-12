// FILE: lib/supabase/queries/analytics.ts
// ============================================
import { supabase } from '../client'

export const analyticsQueries = {
  async getUserAnalytics(userId: string, days: number = 7) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true })
    
    return { data, error }
  },

  async getTotalStats(userId: string) {
    const { data: vaults, error: vaultsError } = await supabase
      .from('vaults')
      .select('deposited_amount, earned_amount')
      .eq('user_id', userId)
      .eq('status', 'active')

    if (vaultsError) return { data: null, error: vaultsError }

    const totalDeposited = vaults.reduce((sum, v) => 
      sum + parseFloat(v.deposited_amount.toString()), 0)
    const totalEarned = vaults.reduce((sum, v) => 
      sum + parseFloat(v.earned_amount.toString()), 0)

    return {
      data: {
        totalDeposited,
        totalEarned,
        netProfit: totalEarned,
        portfolioValue: totalDeposited + totalEarned,
      },
      error: null,
    }
  },

  async getChainPerformance(userId: string) {
    const { data, error } = await supabase
      .from('vaults')
      .select('chain, deposited_amount, earned_amount, apy')
      .eq('user_id', userId)
      .eq('status', 'active')

    if (error) return { data: null, error }

    const chainStats = data.reduce((acc: any, vault: any) => {
      if (!acc[vault.chain]) {
        acc[vault.chain] = {
          chain: vault.chain,
          tvl: 0,
          earned: 0,
          apy: 0,
          count: 0,
        }
      }
      acc[vault.chain].tvl += parseFloat(vault.deposited_amount.toString())
      acc[vault.chain].earned += parseFloat(vault.earned_amount.toString())
      acc[vault.chain].apy += parseFloat(vault.apy.toString())
      acc[vault.chain].count += 1
      return acc
    }, {})

    Object.values(chainStats).forEach((stat: any) => {
      stat.apy = stat.apy / stat.count
    })

    return { data: Object.values(chainStats), error: null }
  },
}