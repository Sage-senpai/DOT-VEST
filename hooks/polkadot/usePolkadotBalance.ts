import { useState, useEffect } from 'react'
import { usePolkadotExtension } from '../use-polkadot-extension'
import { ApiPromise, WsProvider } from '@polkadot/api'

export function usePolkadotBalance() {
  const { selectedAccount } = usePolkadotExtension()
  const [balance, setBalance] = useState<string>('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedAccount?.address) return

    let unsubscribe: (() => void) | undefined

    const fetchBalance = async () => {
      setLoading(true)
      setError(null)

      try {
        const wsProvider = new WsProvider(process.env.NEXT_PUBLIC_POLKADOT_RPC_URL)
        const api = await ApiPromise.create({ provider: wsProvider })

        // Subscribe to balance changes - no destructuring
        unsubscribe = await api.query.system.account(
          selectedAccount.address,
          (accountInfo: any) => {
            setBalance(accountInfo.data.free.toString())
            setLoading(false)
          }
        ) as any

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch balance')
        setLoading(false)
      }
    }

    fetchBalance()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [selectedAccount?.address])

  return { balance, loading, error }
}