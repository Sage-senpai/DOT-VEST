'use client'

import { useState, useCallback } from 'react'
import { toHex, fromHex } from 'viem'
import { getPublicClient, getWalletClient } from '@/lib/contracts/client'
import { CONTRACTS, activeChain, getExplorerTxUrl } from '@/lib/contracts/config'
import { strategyAbi } from '@/lib/contracts/abis'

interface OnChainStrategy {
  id: `0x${string}`
  creator: `0x${string}`
  name: string
  targetApy: bigint
  riskLevel: number
  createdAt: bigint
  active: boolean
  creatorAccountId: `0x${string}`
}

export function useStrategyContract() {
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const createStrategy = useCallback(async (
    name: string,
    targetApyBps: number, // basis points, e.g. 1200 = 12%
    riskLevel: number     // 0=LOW, 1=MEDIUM, 2=HIGH
  ): Promise<string | null> => {
    setLoading(true)
    setError(null)
    setTxHash(null)

    try {
      const walletClient = getWalletClient()
      if (!walletClient) throw new Error('EVM wallet not connected')
      if (!CONTRACTS.strategy) throw new Error('Strategy contract not deployed')

      const [account] = await walletClient.requestAddresses()
      const hash = await walletClient.writeContract({
        address: CONTRACTS.strategy,
        abi: strategyAbi,
        functionName: 'createStrategy',
        args: [name, BigInt(targetApyBps), riskLevel],
        account,
        chain: activeChain,
      })

      setTxHash(hash)

      const publicClient = getPublicClient()
      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      // Extract strategy ID from StrategyCreated event logs
      const event = receipt.logs.find(log => log.topics[0] !== undefined)
      const strategyId = event?.topics[1] || null

      return strategyId as string | null
    } catch (err: any) {
      setError(err.shortMessage || err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getStrategy = useCallback(async (id: `0x${string}`): Promise<OnChainStrategy | null> => {
    try {
      if (!CONTRACTS.strategy) return null
      const publicClient = getPublicClient()

      const result = await publicClient.readContract({
        address: CONTRACTS.strategy,
        abi: strategyAbi,
        functionName: 'getStrategy',
        args: [id],
      }) as any

      return {
        id: result.id,
        creator: result.creator,
        name: result.name,
        targetApy: result.targetApy,
        riskLevel: result.riskLevel,
        createdAt: result.createdAt,
        active: result.active,
        creatorAccountId: result.creatorAccountId,
      }
    } catch {
      return null
    }
  }, [])

  const getUserStrategies = useCallback(async (address: `0x${string}`): Promise<`0x${string}`[]> => {
    try {
      if (!CONTRACTS.strategy) return []
      const publicClient = getPublicClient()

      const result = await publicClient.readContract({
        address: CONTRACTS.strategy,
        abi: strategyAbi,
        functionName: 'getUserStrategies',
        args: [address],
      })

      return result as `0x${string}`[]
    } catch {
      return []
    }
  }, [])

  const computeBlake2Hash = useCallback(async (data: string): Promise<string | null> => {
    try {
      if (!CONTRACTS.strategy) return null
      const publicClient = getPublicClient()

      const dataHex = toHex(new TextEncoder().encode(data))
      const result = await publicClient.readContract({
        address: CONTRACTS.strategy,
        abi: strategyAbi,
        functionName: 'computeBlake2Hash',
        args: [dataHex],
      })

      return result as string
    } catch {
      return null
    }
  }, [])

  const getPolkadotAccountId = useCallback(async (evmAddress: `0x${string}`): Promise<string | null> => {
    try {
      if (!CONTRACTS.strategy) return null
      const publicClient = getPublicClient()

      const result = await publicClient.readContract({
        address: CONTRACTS.strategy,
        abi: strategyAbi,
        functionName: 'getPolkadotAccountId',
        args: [evmAddress],
      })

      return result as string
    } catch {
      return null
    }
  }, [])

  const getStrategyCount = useCallback(async (): Promise<number> => {
    try {
      if (!CONTRACTS.strategy) return 0
      const publicClient = getPublicClient()

      const result = await publicClient.readContract({
        address: CONTRACTS.strategy,
        abi: strategyAbi,
        functionName: 'getStrategyCount',
      })

      return Number(result)
    } catch {
      return 0
    }
  }, [])

  return {
    createStrategy,
    getStrategy,
    getUserStrategies,
    computeBlake2Hash,
    getPolkadotAccountId,
    getStrategyCount,
    loading,
    txHash,
    txUrl: txHash ? getExplorerTxUrl(txHash) : null,
    error,
  }
}
