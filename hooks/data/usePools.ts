// FILE: hooks/data/usePools.ts
// ========================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { poolQueries } from '@/lib/supabase/queries/pools'

export function usePools() {
  return useQuery({
    queryKey: ['pools'],
    queryFn: async () => {
      const { data, error } = await poolQueries.getAll()
      if (error) throw error
      return data
    },
  })
}

export function usePool(id: string) {
  return useQuery({
    queryKey: ['pool', id],
    queryFn: async () => {
      const { data, error } = await poolQueries.getById(id)
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useSearchPools(query: string) {
  return useQuery({
    queryKey: ['pools', 'search', query],
    queryFn: async () => {
      if (!query) return []
      const { data, error } = await poolQueries.search(query)
      if (error) throw error
      return data
    },
    enabled: query.length > 0,
  })
}
