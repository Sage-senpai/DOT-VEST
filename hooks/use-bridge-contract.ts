'use client'

import { useState, useCallback } from 'react'
import { parseEther } from 'viem'
import { getPublicClient, getWalletClient } from '@/lib/contracts/client'
import { CONTRACTS, activeChain, getExplorerTxUrl } from '@/lib/contracts/config'
import { bridgeAbi } from '@/lib/contracts/abis'

interface XcmWeight {
  refTime: bigint
  proofSize: bigint
}

interface TransferRecord {
  sender: `0x${string}`
  destination: `0x${string}`
  amount: bigint
  timestamp: bigint
  executed: boolean
}

export function useBridgeContract() {
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const estimateXcmWeight = useCallback(async (message: `0x${string}`): Promise<XcmWeight | null> => {
    try {
      if (!CONTRACTS.bridge) return null
      const publicClient = getPublicClient()

      const [refTime, proofSize] = await publicClient.readContract({
        address: CONTRACTS.bridge,
        abi: bridgeAbi,
        functionName: 'estimateXcmWeight',
        args: [message],
      }) as [bigint, bigint]

      return { refTime, proofSize }
    } catch {
      return null
    }
  }, [])

  const sendXcmTransfer = useCallback(async (
    destination: `0x${string}`,
    message: `0x${string}`,
    amountEth: string
  ) => {
    setLoading(true)
    setError(null)
    setTxHash(null)

    try {
      const walletClient = getWalletClient()
      if (!walletClient) throw new Error('EVM wallet not connected')
      if (!CONTRACTS.bridge) throw new Error('Bridge contract not deployed')

      const [account] = await walletClient.requestAddresses()
      const hash = await walletClient.writeContract({
        address: CONTRACTS.bridge,
        abi: bridgeAbi,
        functionName: 'sendXcmTransfer',
        args: [destination, message],
        value: parseEther(amountEth),
        account,
        chain: activeChain,
      })

      setTxHash(hash)

      const publicClient = getPublicClient()
      await publicClient.waitForTransactionReceipt({ hash })

      return hash
    } catch (err: any) {
      setError(err.shortMessage || err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getUserTransfers = useCallback(async (address: `0x${string}`): Promise<number[]> => {
    try {
      if (!CONTRACTS.bridge) return []
      const publicClient = getPublicClient()

      const result = await publicClient.readContract({
        address: CONTRACTS.bridge,
        abi: bridgeAbi,
        functionName: 'getUserTransfers',
        args: [address],
      })

      return (result as bigint[]).map(Number)
    } catch {
      return []
    }
  }, [])

  const getTransfer = useCallback(async (id: number): Promise<TransferRecord | null> => {
    try {
      if (!CONTRACTS.bridge) return null
      const publicClient = getPublicClient()

      const result = await publicClient.readContract({
        address: CONTRACTS.bridge,
        abi: bridgeAbi,
        functionName: 'getTransfer',
        args: [BigInt(id)],
      }) as any

      return {
        sender: result.sender,
        destination: result.destination,
        amount: result.amount,
        timestamp: result.timestamp,
        executed: result.executed,
      }
    } catch {
      return null
    }
  }, [])

  const getTotalTransfers = useCallback(async (): Promise<number> => {
    try {
      if (!CONTRACTS.bridge) return 0
      const publicClient = getPublicClient()

      const result = await publicClient.readContract({
        address: CONTRACTS.bridge,
        abi: bridgeAbi,
        functionName: 'totalTransfers',
      })

      return Number(result)
    } catch {
      return 0
    }
  }, [])

  const getRemainingWeight = useCallback(async (): Promise<XcmWeight | null> => {
    try {
      if (!CONTRACTS.bridge) return null
      const publicClient = getPublicClient()

      const [refTime, proofSize] = await publicClient.readContract({
        address: CONTRACTS.bridge,
        abi: bridgeAbi,
        functionName: 'getRemainingWeight',
      }) as [bigint, bigint]

      return { refTime, proofSize }
    } catch {
      return null
    }
  }, [])

  return {
    estimateXcmWeight,
    sendXcmTransfer,
    getUserTransfers,
    getTransfer,
    getTotalTransfers,
    getRemainingWeight,
    loading,
    txHash,
    txUrl: txHash ? getExplorerTxUrl(txHash) : null,
    error,
  }
}
