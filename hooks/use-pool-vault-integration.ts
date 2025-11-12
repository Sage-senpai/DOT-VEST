// FILE: hooks/use-pool-vault-integration.ts
"use client"

import { useState, useCallback } from 'react'
import { useStrategyVaults } from './use-strategy-vaults'
import { usePolkadotExtension } from './use-polkadot-extension'

export interface PoolStrategy {
  poolName: string
  protocol: string
  amount: number
  duration: number
  apy: string
  tokenSymbol: string
}

export interface VaultPosition {
  id: string
  name: string
  chain: string
  apy: string
  tvl: string
  deposited: string
  earned: string
  risk: string
  strategy: string
  poolName?: string
  protocol?: string
  createdAt: string
}

export function usePoolVaultIntegration() {
  const { strategies, addStrategy } = useStrategyVaults()
  const { selectedAccount, isReady } = usePolkadotExtension()
  const [executing, setExecuting] = useState(false)

  // Convert pool strategy to vault position
  const convertPoolToVault = useCallback((poolStrategy: PoolStrategy): VaultPosition => {
    const now = new Date()
    const apyNum = parseFloat(poolStrategy.apy)
    const estimatedEarnings = (poolStrategy.amount * apyNum * (poolStrategy.duration / 12)) / 100
    
    return {
      id: `vault-${Date.now()}`,
      name: `${poolStrategy.poolName} - ${poolStrategy.protocol}`,
      chain: poolStrategy.protocol,
      apy: `${poolStrategy.apy}%`,
      tvl: `$${(apyNum * 1000).toFixed(1)}K`,
      deposited: `${poolStrategy.amount} ${poolStrategy.tokenSymbol}`,
      earned: `${estimatedEarnings.toFixed(2)} ${poolStrategy.tokenSymbol}`,
      risk: poolStrategy.duration <= 3 ? "Low" : "Medium",
      strategy: `${poolStrategy.duration}-month ${poolStrategy.protocol} strategy`,
      poolName: poolStrategy.poolName,
      protocol: poolStrategy.protocol,
      createdAt: now.toISOString(),
    }
  }, [])

  // Execute pool strategy and create vault position
  const executePoolStrategy = useCallback(async (poolStrategy: PoolStrategy) => {
    if (!isReady || !selectedAccount) {
      throw new Error('Wallet not connected')
    }

    if (!poolStrategy.amount || poolStrategy.amount <= 0) {
      throw new Error('Invalid deposit amount')
    }

    setExecuting(true)

    try {
      // Simulate blockchain transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Add strategy to vault system
      const strategy = {
        id: Date.now().toString(),
        tokenName: poolStrategy.poolName,
        amount: poolStrategy.amount,
        duration: poolStrategy.duration,
        protocol: poolStrategy.protocol,
        apy: poolStrategy.apy,
        executedAt: new Date().toISOString(),
      }

      addStrategy(strategy)

      // Return vault position
      return convertPoolToVault(poolStrategy)
    } catch (error) {
      console.error('Strategy execution failed:', error)
      throw error
    } finally {
      setExecuting(false)
    }
  }, [isReady, selectedAccount, addStrategy, convertPoolToVault])

  // Get all vault positions (including from pools)
  const getVaultPositions = useCallback((): VaultPosition[] => {
    return strategies.map(s => {
      const poolStrategy: PoolStrategy = {
        poolName: s.tokenName,
        protocol: s.protocol,
        amount: s.amount,
        duration: s.duration,
        apy: s.apy,
        tokenSymbol: s.tokenName.replace(" POOL", ""),
      }
      return convertPoolToVault(poolStrategy)
    })
  }, [strategies, convertPoolToVault])

  // Get single vault by ID
  const getVaultById = useCallback((id: string): VaultPosition | undefined => {
    const positions = getVaultPositions()
    return positions.find(p => p.id === id)
  }, [getVaultPositions])

  // Calculate total value locked across all vaults
  const getTotalVaultValue = useCallback((): number => {
    return strategies.reduce((total, s) => {
      return total + s.amount
    }, 0)
  }, [strategies])

  // Calculate total earnings
  const getTotalEarnings = useCallback((): number => {
    return strategies.reduce((total, s) => {
      const apy = parseFloat(s.apy) / 100
      const duration = s.duration / 12
      const earnings = s.amount * apy * duration
      return total + earnings
    }, 0)
  }, [strategies])

  // Get vault statistics
  const getVaultStats = useCallback(() => {
    const positions = getVaultPositions()
    const totalValue = getTotalVaultValue()
    const totalEarnings = getTotalEarnings()
    
    const avgApy = strategies.length > 0
      ? strategies.reduce((sum, s) => sum + parseFloat(s.apy), 0) / strategies.length
      : 0

    return {
      totalPositions: positions.length,
      totalValue,
      totalEarnings,
      avgApy: avgApy.toFixed(2),
    }
  }, [getVaultPositions, getTotalVaultValue, getTotalEarnings, strategies])

  return {
    executing,
    executePoolStrategy,
    getVaultPositions,
    getVaultById,
    getTotalVaultValue,
    getTotalEarnings,
    getVaultStats,
    isReady,
  }
}