// FILE: hooks/use-polkadot-multi-chain.ts
"use client"

import { useState, useEffect } from 'react'
import { useEnhancedPolkadot } from './use-enhanced-polkadot'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { encodeAddress } from '@polkadot/util-crypto'

interface ChainBalance {
  chain: string
  free: string
  reserved: string
  frozen: string
  total: string
  formatted: string
}

interface StakingInfo {
  bonded: string
  unlocking: string
  redeemable: string
  total: string
}

export function usePolkadotMultiChain() {
  const { selectedAccount } = useEnhancedPolkadot()
  const [assetHubBalance, setAssetHubBalance] = useState<ChainBalance | null>(null)
  const [relayBalance, setRelayBalance] = useState<ChainBalance | null>(null)
  const [stakingInfo, setStakingInfo] = useState<StakingInfo | null>(null)
  const [assetHubAddress, setAssetHubAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedAccount?.address) {
      setAssetHubBalance(null)
      setRelayBalance(null)
      setStakingInfo(null)
      setAssetHubAddress(null)
      return
    }

    let assetHubApi: ApiPromise | null = null
    let relayApi: ApiPromise | null = null

    const fetchBalances = async () => {
      setLoading(true)
      setError(null)

      try {
        // Convert address to Asset Hub format (ss58: 0)
        const assetHubAddr = encodeAddress(selectedAccount.address, 0)
        setAssetHubAddress(assetHubAddr)

        // Connect to Asset Hub
        const assetHubProvider = new WsProvider('wss://polkadot-asset-hub-rpc.polkadot.io')
        assetHubApi = await ApiPromise.create({ provider: assetHubProvider })

        // Connect to Relay Chain
        const relayProvider = new WsProvider(process.env.NEXT_PUBLIC_POLKADOT_RPC_URL || 'wss://rpc.polkadot.io')
        relayApi = await ApiPromise.create({ provider: relayProvider })

        // Fetch Asset Hub balance
        const assetHubAccount: any = await assetHubApi.query.system.account(assetHubAddr)
        const assetHubData = assetHubAccount.data

        setAssetHubBalance({
          chain: 'Asset Hub',
          free: assetHubData.free.toString(),
          reserved: assetHubData.reserved.toString(),
          frozen: assetHubData.frozen.toString(),
          total: assetHubData.free.add(assetHubData.reserved).toString(),
          formatted: (Number(assetHubData.free.toString()) / 1e10).toFixed(4) + ' DOT'
        })

        // Fetch Relay Chain balance
        const relayAccount: any = await relayApi.query.system.account(selectedAccount.address)
        const relayData = relayAccount.data

        setRelayBalance({
          chain: 'Relay Chain',
          free: relayData.free.toString(),
          reserved: relayData.reserved.toString(),
          frozen: relayData.frozen.toString(),
          total: relayData.free.add(relayData.reserved).toString(),
          formatted: (Number(relayData.free.toString()) / 1e10).toFixed(4) + ' DOT'
        })

        // Fetch staking info from Relay Chain
        try {
          const stakingLedger: any = await relayApi.query.staking.ledger(selectedAccount.address)
          
          if (stakingLedger.isSome) {
            const ledger = stakingLedger.unwrap()
            const bonded = ledger.active.toString()
            
            // Get unlocking chunks
            const unlocking = ledger.unlocking.reduce((sum: any, chunk: any) => {
              return sum + Number(chunk.value.toString())
            }, 0)

            setStakingInfo({
              bonded: bonded,
              unlocking: unlocking.toString(),
              redeemable: '0', // Would need to check era for redeemable
              total: (Number(bonded) + unlocking).toString()
            })
          } else {
            setStakingInfo(null)
          }
        } catch (stakingErr) {
          console.log('[MultiChain] No staking info:', stakingErr)
          setStakingInfo(null)
        }

        console.log('[MultiChain] ✅ Fetched balances from Asset Hub and Relay Chain')
        
      } catch (err) {
        console.error('[MultiChain] ❌ Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch balances')
      } finally {
        setLoading(false)
        
        // Cleanup
        if (assetHubApi) await assetHubApi.disconnect()
        if (relayApi) await relayApi.disconnect()
      }
    }

    fetchBalances()
  }, [selectedAccount?.address])

  const totalBalance = () => {
    if (!assetHubBalance && !relayBalance) return '0'
    
    const assetHub = Number(assetHubBalance?.total || 0)
    const relay = Number(relayBalance?.total || 0)
    const staking = Number(stakingInfo?.total || 0)
    
    return (assetHub + relay + staking) / 1e10
  }

  return {
    assetHubBalance,
    relayBalance,
    stakingInfo,
    assetHubAddress,
    totalBalance: totalBalance(),
    loading,
    error
  }
}