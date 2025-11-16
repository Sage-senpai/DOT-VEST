// FILE: hooks/use-dashboard-state.ts (UNIFIED STATE MANAGEMENT)
"use client"

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { useEnhancedPolkadot } from './use-enhanced-polkadot'
import { useWalletBalance } from './use-wallet-balance'
import { useAuth } from './auth/useAuth'

export interface DashboardStrategy {
  id: string
  tokenName: string
  amount: number
  duration: number
  protocol: string
  apy: string
  executedAt: Date
  wallet_address: string
  user_id?: string
  status: 'pending' | 'active' | 'completed'
}

export interface DashboardVault {
  id: string
  name: string
  deposited: number
  earned: number
  apy: number
  chain: string
  status: 'active' | 'paused'
}

interface DashboardState {
  // Wallet state
  isWalletConnected: boolean
  walletAddress: string | null
  walletBalance: number
  
  // Portfolio state
  totalPortfolioValue: number
  totalStrategies: number
  totalVaults: number
  totalEarnings: number
  avgAPY: number
  
  // Strategies
  strategies: DashboardStrategy[]
  
  // Vaults
  vaults: DashboardVault[]
  
  // Loading states
  isLoading: boolean
  isSyncing: boolean
  
  // Actions
  addStrategy: (strategy: Omit<DashboardStrategy, 'id' | 'wallet_address' | 'user_id'>) => Promise<void>
  addVault: (vault: Omit<DashboardVault, 'id'>) => Promise<void>
  refreshData: () => Promise<void>
}

const DashboardContext = createContext<DashboardState | null>(null)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { selectedAccount, isReady } = useEnhancedPolkadot()
  const { totalPortfolioValue, balances, refreshBalances } = useWalletBalance()
  
  const [strategies, setStrategies] = useState<DashboardStrategy[]>([])
  const [vaults, setVaults] = useState<DashboardVault[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  // Load data from localStorage and sync
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Load strategies
      const savedStrategies = localStorage.getItem('dotvest-strategies')
      if (savedStrategies) {
        const parsed = JSON.parse(savedStrategies)
        // Filter by current wallet if connected
        const filtered = selectedAccount 
          ? parsed.filter((s: DashboardStrategy) => s.wallet_address === selectedAccount.address)
          : parsed
        setStrategies(filtered)
      }
      
      // Load vaults
      const savedVaults = localStorage.getItem('dotvest-vaults')
      if (savedVaults) {
        const parsed = JSON.parse(savedVaults)
        const filtered = selectedAccount
          ? parsed.filter((v: any) => v.wallet_address === selectedAccount.address)
          : parsed
        setVaults(filtered)
      }
      
    } catch (error) {
      console.error('[Dashboard] Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedAccount])

  // Refresh all data
  const refreshData = useCallback(async () => {
    setIsSyncing(true)
    try {
      await Promise.all([
        loadData(),
        refreshBalances()
      ])
      console.log('[Dashboard] Data refreshed successfully')
    } catch (error) {
      console.error('[Dashboard] Error refreshing data:', error)
    } finally {
      setIsSyncing(false)
    }
  }, [loadData, refreshBalances])

  // Add strategy
  const addStrategy = useCallback(async (
    strategyData: Omit<DashboardStrategy, 'id' | 'wallet_address' | 'user_id'>
  ) => {
    if (!selectedAccount) {
      throw new Error('Wallet not connected')
    }

    const newStrategy: DashboardStrategy = {
      ...strategyData,
      id: Date.now().toString(),
      wallet_address: selectedAccount.address,
      user_id: user?.id || undefined,
      status: 'active'
    }

    const updated = [...strategies, newStrategy]
    setStrategies(updated)
    
    // Save to localStorage
    const allStrategies = localStorage.getItem('dotvest-strategies')
    const all = allStrategies ? JSON.parse(allStrategies) : []
    localStorage.setItem('dotvest-strategies', JSON.stringify([...all, newStrategy]))
    
    console.log('[Dashboard] Strategy added:', newStrategy.tokenName)
    
    // Trigger sync
    setTimeout(() => refreshData(), 100)
  }, [selectedAccount, user, strategies, refreshData])

  // Add vault
  const addVault = useCallback(async (
    vaultData: Omit<DashboardVault, 'id'>
  ) => {
    if (!selectedAccount) {
      throw new Error('Wallet not connected')
    }

    const newVault: DashboardVault = {
      ...vaultData,
      id: Date.now().toString()
    }

    const updated = [...vaults, newVault]
    setVaults(updated)
    
    // Save to localStorage with wallet address
    const allVaults = localStorage.getItem('dotvest-vaults')
    const all = allVaults ? JSON.parse(allVaults) : []
    const vaultWithWallet = { ...newVault, wallet_address: selectedAccount.address }
    localStorage.setItem('dotvest-vaults', JSON.stringify([...all, vaultWithWallet]))
    
    console.log('[Dashboard] Vault added:', newVault.name)
    
    // Trigger sync
    setTimeout(() => refreshData(), 100)
  }, [selectedAccount, vaults, refreshData])

  // Calculate derived values
  const totalStrategies = strategies.filter(s => s.status === 'active').length
  const totalVaults = vaults.filter(v => v.status === 'active').length
  
  const totalEarnings = strategies.reduce((sum, s) => {
    const monthsElapsed = Math.min(s.duration, 6)
    return sum + (s.amount * parseFloat(s.apy) / 100 * monthsElapsed / 12)
  }, 0) + vaults.reduce((sum, v) => sum + v.earned, 0)
  
  const avgAPY = strategies.length > 0
    ? strategies.reduce((sum, s) => sum + parseFloat(s.apy), 0) / strategies.length
    : vaults.length > 0
      ? vaults.reduce((sum, v) => sum + v.apy, 0) / vaults.length
      : 0

  // Load data on mount and when wallet changes
  useEffect(() => {
    loadData()
  }, [loadData])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isReady || !selectedAccount) return

    const interval = setInterval(() => {
      refreshData()
    }, 30000)

    return () => clearInterval(interval)
  }, [isReady, selectedAccount, refreshData])

  const state: DashboardState = {
    isWalletConnected: isReady && !!selectedAccount,
    walletAddress: selectedAccount?.address || null,
    walletBalance: totalPortfolioValue,
    totalPortfolioValue,
    totalStrategies,
    totalVaults,
    totalEarnings,
    avgAPY,
    strategies,
    vaults,
    isLoading,
    isSyncing,
    addStrategy,
    addVault,
    refreshData
  }

  return (
    <DashboardContext.Provider value={state}>
      {children}
    </DashboardContext.Provider>
  )
  
}

export function useDashboardState() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboardState must be used within DashboardProvider')
  }
  return context
}