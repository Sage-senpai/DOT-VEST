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
  wallet_address: string
}

interface DashboardState {
  isWalletConnected: boolean
  walletAddress: string | null
  walletBalance: number
  totalPortfolioValue: number
  totalStrategies: number
  totalVaults: number
  totalEarnings: number
  avgAPY: number
  strategies: DashboardStrategy[]
  vaults: DashboardVault[]
  isLoading: boolean
  isSyncing: boolean
  
  // Multi-wallet overview
  allWalletAddresses: string[]
  overviewStats: () => {
    totalAcrossAllWallets: number
    totalStrategiesAllWallets: number
    totalVaultsAllWallets: number
  }
  
  addStrategy: (strategy: Omit<DashboardStrategy, 'id' | 'wallet_address' | 'user_id'>) => Promise<void>
  addVault: (vault: Omit<DashboardVault, 'id' | 'wallet_address'>) => Promise<void>
  refreshData: () => Promise<void>
  switchWallet: (address: string) => void
}

const DashboardContext = createContext<DashboardState | null>(null)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { selectedAccount, isReady, connectedAccounts } = useEnhancedPolkadot()
  const { totalPortfolioValue, refreshBalances } = useWalletBalance()

  const [strategies, setStrategies] = useState<DashboardStrategy[]>([])
  const [vaults, setVaults] = useState<DashboardVault[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [allWalletAddresses, setAllWalletAddresses] = useState<string[]>([])

  /** Safely compute overview stats client-side */
  const computeOverviewStats = useCallback(() => {
    if (typeof window === 'undefined') return {
      totalAcrossAllWallets: 0,
      totalStrategiesAllWallets: 0,
      totalVaultsAllWallets: 0
    }

    const allStrategies = JSON.parse(localStorage.getItem('dotvest-strategies') || '[]')
    const allVaults = JSON.parse(localStorage.getItem('dotvest-vaults') || '[]')

    const totalStrategiesAllWallets = allStrategies.length
    const totalVaultsAllWallets = allVaults.length
    const totalAcrossAllWallets = allStrategies.reduce((sum: number, s: DashboardStrategy) => sum + s.amount, 0) +
                                   allVaults.reduce((sum: number, v: DashboardVault) => sum + v.deposited, 0)

    return { totalAcrossAllWallets, totalStrategiesAllWallets, totalVaultsAllWallets }
  }, [])

  /** Load strategies & vaults for current wallet */
  const loadData = useCallback(async () => {
    if (typeof window === 'undefined') return

    setIsLoading(true)
    try {
     // Load strategies
const savedStrategies: DashboardStrategy[] = JSON.parse(localStorage.getItem('dotvest-strategies') || '[]')
const filteredStrategies = selectedAccount
  ? savedStrategies.filter((s: DashboardStrategy) => s.wallet_address === selectedAccount.address)
  : savedStrategies
setStrategies(filteredStrategies)

// Track all wallet addresses (type-safe)
const addresses = [
  ...new Set(
    savedStrategies
      .map((s: DashboardStrategy) => s.wallet_address)
      .filter((addr): addr is string => typeof addr === 'string') // type-safe string filter
  )
]
setAllWalletAddresses(addresses)


      // Load vaults
      const savedVaults = JSON.parse(localStorage.getItem('dotvest-vaults') || '[]')
      const filteredVaults = selectedAccount
        ? savedVaults.filter((v: DashboardVault) => v.wallet_address === selectedAccount.address)
        : savedVaults
      setVaults(filteredVaults)

    } catch (error) {
      console.error('[Dashboard] Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedAccount])

  /** Refresh balances and dashboard data */
  const refreshData = useCallback(async () => {
    setIsSyncing(true)
    try {
      await Promise.all([
        loadData(),
        refreshBalances()
      ])
    } catch (error) {
      console.error('[Dashboard] Error refreshing data:', error)
    } finally {
      setIsSyncing(false)
    }
  }, [loadData, refreshBalances])

  /** Add a strategy */
  const addStrategy = useCallback(async (strategyData: Omit<DashboardStrategy, 'id' | 'wallet_address' | 'user_id'>) => {
    if (!selectedAccount) throw new Error('Wallet not connected')
    if (strategyData.amount > totalPortfolioValue) throw new Error(`Insufficient balance`)

    const newStrategy: DashboardStrategy = {
      ...strategyData,
      id: Date.now().toString(),
      wallet_address: selectedAccount.address,
      user_id: user?.id,
      status: 'active'
    }

    const allStrategies = JSON.parse(localStorage.getItem('dotvest-strategies') || '[]')
    localStorage.setItem('dotvest-strategies', JSON.stringify([...allStrategies, newStrategy]))
    setStrategies(prev => [...prev, newStrategy])
    setTimeout(refreshData, 100)
  }, [selectedAccount, user, totalPortfolioValue, refreshData])

  /** Add a vault */
  const addVault = useCallback(async (vaultData: Omit<DashboardVault, 'id' | 'wallet_address'>) => {
    if (!selectedAccount) throw new Error('Wallet not connected')

    const newVault: DashboardVault = {
      ...vaultData,
      id: Date.now().toString(),
      wallet_address: selectedAccount.address
    }

    const allVaults = JSON.parse(localStorage.getItem('dotvest-vaults') || '[]')
    localStorage.setItem('dotvest-vaults', JSON.stringify([...allVaults, newVault]))
    setVaults(prev => [...prev, newVault])
    setTimeout(refreshData, 100)
  }, [selectedAccount, refreshData])

  /** Switch wallet */
  const switchWallet = useCallback((address: string) => {
    if (typeof window === 'undefined') return
    const account = connectedAccounts.find(acc => acc.address === address)
    if (account) {
      localStorage.setItem('selected_wallet_address', address)
      window.location.reload()
    }
  }, [connectedAccounts])

  /** Auto-refresh every 30 seconds */
  useEffect(() => {
    if (!isReady || !selectedAccount) return
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [isReady, selectedAccount, refreshData])

  /** Load data on mount and whenever wallet changes */
  useEffect(() => {
    loadData()
  }, [loadData])

  /** Derived stats for current wallet */
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

  /** Dashboard state to provide */
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
    allWalletAddresses,
    overviewStats: computeOverviewStats,
    addStrategy,
    addVault,
    refreshData,
    switchWallet
  }

  return (
    <DashboardContext.Provider value={state}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboardState() {
  const context = useContext(DashboardContext)
  if (!context) throw new Error('useDashboardState must be used within DashboardProvider')
  return context
}
