// FILE: hooks/use-strategy-vaults.ts (FIXED WITH DEMO SUPPORT)
"use client"

import { useState, useEffect } from "react"
import { usePolkadotExtension } from "@/hooks/use-polkadot-extension"
import { createClient } from "@/lib/supabase/client"

export interface ExecutedStrategy {
  id: string
  tokenName: string
  amount: number
  duration: number
  protocol: string
  apy: string
  executedAt: Date
  wallet_address?: string | null
  user_id?: string | null
  status?: 'active' | 'demo' | 'completed' | 'withdrawn'
  isDemo?: boolean  // Helper flag for easy filtering
}

export function useStrategyVaults() {
  const [strategies, setStrategies] = useState<ExecutedStrategy[]>([])
  const [mounted, setMounted] = useState(false)
  const { selectedAccount } = usePolkadotExtension()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("dotvest-strategies")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Ensure isDemo flag is set correctly
        const withDemoFlag = parsed.map((s: ExecutedStrategy) => ({
          ...s,
          isDemo: s.status === 'demo',
          executedAt: new Date(s.executedAt) // Ensure Date object
        }))
        setStrategies(withDemoFlag)
      } catch (err) {
        console.error('Failed to parse strategies:', err)
      }
    }
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    getUser()
  }, [supabase])

  const addStrategy = async (strategy: ExecutedStrategy) => {
    const strategyWithWallet = {
      ...strategy,
      wallet_address: selectedAccount?.address || null,
      user_id: user?.id || null,
      isDemo: strategy.status === 'demo',
      executedAt: strategy.executedAt || new Date()
    }

    const updated = [...strategies, strategyWithWallet]
    setStrategies(updated)
    localStorage.setItem("dotvest-strategies", JSON.stringify(updated))

    // Only save non-demo strategies to Supabase
    if (strategy.status !== 'demo') {
      try {
        await supabase.from("strategies").insert(strategyWithWallet)
      } catch (err) {
        console.error("[DotVest] Failed to save strategy:", err)
      }
    }
  }

  const removeStrategy = (id: string) => {
    const updated = strategies.filter(s => s.id !== id)
    setStrategies(updated)
    localStorage.setItem("dotvest-strategies", JSON.stringify(updated))
  }

  const updateStrategyStatus = (id: string, status: 'active' | 'demo' | 'completed' | 'withdrawn') => {
    const updated = strategies.map(s => 
      s.id === id ? { ...s, status, isDemo: status === 'demo' } : s
    )
    setStrategies(updated)
    localStorage.setItem("dotvest-strategies", JSON.stringify(updated))
  }

  // Filter strategies by connected wallet
  const getStrategiesForWallet = (walletAddress: string) => {
    return strategies.filter((s) => s.wallet_address === walletAddress)
  }

  // Get only real (non-demo) strategies
  const getRealStrategies = () => {
    return strategies.filter(s => !s.isDemo && s.status !== 'demo')
  }

  // Get only demo strategies
  const getDemoStrategies = () => {
    return strategies.filter(s => s.isDemo || s.status === 'demo')
  }

  // Stats excluding demos
  const getRealStats = () => {
    const realStrategies = getRealStrategies()
    return {
      totalDeposited: realStrategies.reduce((sum, s) => sum + s.amount, 0),
      totalEarned: realStrategies.reduce((sum, s) => {
        const monthsElapsed = s.duration ? Math.min(s.duration, 6) : 1
        return sum + (s.amount * parseFloat(s.apy) / 100 * monthsElapsed / 12)
      }, 0),
      avgAPY: realStrategies.length > 0
        ? realStrategies.reduce((sum, s) => sum + parseFloat(s.apy), 0) / realStrategies.length
        : 0,
      count: realStrategies.length
    }
  }

  return { 
    strategies, 
    addStrategy, 
    removeStrategy,
    updateStrategyStatus,
    getStrategiesForWallet, 
    getRealStrategies,
    getDemoStrategies,
    getRealStats,
    mounted 
  }
}