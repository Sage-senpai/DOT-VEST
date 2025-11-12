// FILE: hooks/data/useAnalytics.ts
// ========================================
import { useQuery } from '@tanstack/react-query'
import { analyticsQueries } from '@/lib/supabase/queries/analytics'
import { useAuth } from '../auth/useAuth'

export function useAnalytics(days: number = 7) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['analytics', user?.id, days],
    queryFn: async () => {
      if (!user?.id) return []
      const { data, error } = await analyticsQueries.getUserAnalytics(user.id, days)
      if (error) throw error
      return data
    },
    enabled: !!user?.id,
    refetchInterval: 60000, // Refetch every minute
  })
}

export function useTotalStats() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['analytics', 'total', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      const { data, error } = await analyticsQueries.getTotalStats(user.id)
      if (error) throw error
      return data
    },
    enabled: !!user?.id,
  })
}

export function useChainPerformance() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['analytics', 'chains', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const { data, error } = await analyticsQueries.getChainPerformance(user.id)
      if (error) throw error
      return data
    },
    enabled: !!user?.id,
  })
}