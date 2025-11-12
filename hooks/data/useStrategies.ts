// FILE: hooks/data/useStrategies.ts
// ========================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { strategyQueries } from '@/lib/supabase/queries/strategies'
import { useAuth } from '../auth/useAuth'

export function useStrategies() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['strategies', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const { data, error } = await strategyQueries.getUserStrategies(user.id)
      if (error) throw error
      return data
    },
    enabled: !!user?.id,
  })
}

export function useActiveStrategies() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['strategies', 'active', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const { data, error } = await strategyQueries.getActiveStrategies(user.id)
      if (error) throw error
      return data
    },
    enabled: !!user?.id,
  })
}

export function useCreateStrategy() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (strategyData: any) => {
      const { data, error } = await strategyQueries.createStrategy({
        ...strategyData,
        user_id: user?.id,
        status: 'pending',
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] })
    },
  })
}

export function useUpdateStrategy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await strategyQueries.updateStrategy(id, updates)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] })
    },
  })
}