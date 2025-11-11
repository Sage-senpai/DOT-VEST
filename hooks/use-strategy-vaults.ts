"use client"

import { useState, useEffect } from "react"

export interface ExecutedStrategy {
  id: string
  tokenName: string
  amount: number
  duration: number
  protocol: string
  apy: string
  executedAt: Date
}

export function useStrategyVaults() {
  const [strategies, setStrategies] = useState<ExecutedStrategy[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("dotvest-strategies")
    if (saved) {
      setStrategies(JSON.parse(saved))
    }
  }, [])

  const addStrategy = (strategy: ExecutedStrategy) => {
    const updated = [...strategies, strategy]
    setStrategies(updated)
    localStorage.setItem("dotvest-strategies", JSON.stringify(updated))
  }

  return { strategies, addStrategy, mounted }
}
