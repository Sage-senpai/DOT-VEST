"use client"

import { useState, useEffect } from "react"
import { usePolkadotExtension } from "@/hooks/use-polkadot-extension"
import { createClient } from "@/lib/supabase/client" // ✅ Use your existing client

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
}

export function useStrategyVaults() {
  const [strategies, setStrategies] = useState<ExecutedStrategy[]>([])
  const [mounted, setMounted] = useState(false)
  const { selectedAccount } = usePolkadotExtension()
  const supabase = createClient() // ✅ Use the SSR-compatible client
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("dotvest-strategies")
    if (saved) {
      setStrategies(JSON.parse(saved))
    }
  }, [])

  // Load Supabase user (if available)
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    getUser()
  }, [supabase])

  // Add new strategy with wallet + user
  const addStrategy = async (strategy: ExecutedStrategy) => {
    const strategyWithWallet = {
      ...strategy,
      wallet_address: selectedAccount?.address || null,
      user_id: user?.id || null,
    }

    // Save locally
    const updated = [...strategies, strategyWithWallet]
    setStrategies(updated)
    localStorage.setItem("dotvest-strategies", JSON.stringify(updated))

    // Save to Supabase (optional persistence)
    try {
      await supabase.from("strategies").insert(strategyWithWallet)
    } catch (err) {
      console.error("[DotVest] Failed to save strategy:", err)
    }
  }

  // Filter strategies by connected wallet
  const getStrategiesForWallet = (walletAddress: string) => {
    return strategies.filter((s) => s.wallet_address === walletAddress)
  }

  return { strategies, addStrategy, getStrategiesForWallet, mounted }
}