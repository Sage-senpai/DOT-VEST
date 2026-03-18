'use client'

import { useState, useCallback } from 'react'
import { parseEther, formatEther } from 'viem'
import { getPublicClient, getWalletClient } from '@/lib/contracts/client'
import { CONTRACTS, activeChain, getExplorerTxUrl } from '@/lib/contracts/config'
import { vaultAbi } from '@/lib/contracts/abis'

interface VaultPosition {
  shares: bigint
  depositTimestamp: bigint
  totalDeposited: bigint
  currentValue: bigint
}

interface VaultStats {
  tvl: bigint
  depositorCount: bigint
  totalDeposited: bigint
  depositCount: bigint
  minimumDeposit: bigint
}

export function useVaultContract() {
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const deposit = useCallback(async (amountEth: string) => {
    setLoading(true)
    setError(null)
    setTxHash(null)

    try {
      const walletClient = getWalletClient()
      if (!walletClient) throw new Error('EVM wallet not connected')
      if (!CONTRACTS.vault) throw new Error('Vault contract not deployed')

      const [account] = await walletClient.requestAddresses()
      const hash = await walletClient.writeContract({
        address: CONTRACTS.vault,
        abi: vaultAbi,
        functionName: 'deposit',
        value: parseEther(amountEth),
        account,
        chain: activeChain,
      })

      setTxHash(hash)

      // Wait for confirmation
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

  const withdraw = useCallback(async (sharesEth: string) => {
    setLoading(true)
    setError(null)
    setTxHash(null)

    try {
      const walletClient = getWalletClient()
      if (!walletClient) throw new Error('EVM wallet not connected')
      if (!CONTRACTS.vault) throw new Error('Vault contract not deployed')

      const [account] = await walletClient.requestAddresses()
      const hash = await walletClient.writeContract({
        address: CONTRACTS.vault,
        abi: vaultAbi,
        functionName: 'withdraw',
        args: [parseEther(sharesEth)],
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

  const getPosition = useCallback(async (address: `0x${string}`): Promise<VaultPosition | null> => {
    try {
      if (!CONTRACTS.vault) return null
      const publicClient = getPublicClient()

      const result = await publicClient.readContract({
        address: CONTRACTS.vault,
        abi: vaultAbi,
        functionName: 'getPosition',
        args: [address],
      })

      const [shares, depositTimestamp, totalDeposited, currentValue] = result as [bigint, bigint, bigint, bigint]
      return { shares, depositTimestamp, totalDeposited, currentValue }
    } catch {
      return null
    }
  }, [])

  const getVaultStats = useCallback(async (): Promise<VaultStats | null> => {
    try {
      if (!CONTRACTS.vault) return null
      const publicClient = getPublicClient()

      const [tvl, depositorCount, totalDeposited, depositCount, minimumDeposit] = await Promise.all([
        publicClient.readContract({ address: CONTRACTS.vault, abi: vaultAbi, functionName: 'getTVL' }),
        publicClient.readContract({ address: CONTRACTS.vault, abi: vaultAbi, functionName: 'getDepositorCount' }),
        publicClient.readContract({ address: CONTRACTS.vault, abi: vaultAbi, functionName: 'totalDeposited' }),
        publicClient.readContract({ address: CONTRACTS.vault, abi: vaultAbi, functionName: 'depositCount' }),
        publicClient.readContract({ address: CONTRACTS.vault, abi: vaultAbi, functionName: 'getMinimumDeposit' }),
      ])

      return {
        tvl: tvl as bigint,
        depositorCount: depositorCount as bigint,
        totalDeposited: totalDeposited as bigint,
        depositCount: depositCount as bigint,
        minimumDeposit: minimumDeposit as bigint,
      }
    } catch {
      return null
    }
  }, [])

  return {
    deposit,
    withdraw,
    getPosition,
    getVaultStats,
    loading,
    txHash,
    txUrl: txHash ? getExplorerTxUrl(txHash) : null,
    error,
    formatEther,
  }
}
