// FILE: hooks/data/useVaults.ts
// ========================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vaultQueries } from '@/lib/supabase/queries/vaults'
import { useAuth } from '../auth/useAuth'

export function useVaults() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['vaults', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const { data, error } = await vaultQueries.getUserVaults(user.id)
      if (error) throw error
      return data
    },
    enabled: !!user?.id,
  })
}

export function useVault(id: string) {
  return useQuery({
    queryKey: ['vault', id],
    queryFn: async () => {
      const { data, error } = await vaultQueries.getVaultById(id)
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useCreateVault() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (vaultData: any) => {
      const { data, error } = await vaultQueries.createVault({
        ...vaultData,
        user_id: user?.id,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaults'] })
    },
  })
}

export function useUpdateVault() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await vaultQueries.updateVault(id, updates)
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vaults'] })
      queryClient.invalidateQueries({ queryKey: ['vault', data.id] })
    },
  })
}

export function useDeleteVault() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await vaultQueries.deleteVault(id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaults'] })
    },
  })
}
