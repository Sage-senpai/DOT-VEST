// FILE: hooks/polkadot/usePolkadotTransaction.ts
// ========================================
import { useState } from 'react'
import { usePolkadotExtension } from '../use-polkadot-extension'
import { ApiPromise, WsProvider } from '@polkadot/api'

export function usePolkadotTransaction() {
  const { selectedAccount, injector } = usePolkadotExtension()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  const sendTransaction = async (
    chain: string,
    amount: string,
    recipient: string
  ) => {
    if (!selectedAccount || !injector) {
      throw new Error('Wallet not connected')
    }

    setLoading(true)
    setError(null)
    setTxHash(null)

    try {
      // Get RPC URL based on chain
      const rpcUrl = getRpcUrl(chain)
      const wsProvider = new WsProvider(rpcUrl)
      const api = await ApiPromise.create({ provider: wsProvider })

      // Create transfer transaction
      const transfer = api.tx.balances.transfer(recipient, amount)

      // Sign and send transaction
      const hash = await transfer.signAndSend(
        selectedAccount.address,
        { signer: injector.signer },
        ({ status, events }) => {
          if (status.isInBlock) {
            console.log(`Transaction included in block: ${status.asInBlock}`)
          } else if (status.isFinalized) {
            console.log(`Transaction finalized: ${status.asFinalized}`)
            setTxHash(hash.toString())
            setLoading(false)
          }
        }
      )

      return hash.toString()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed'
      setError(errorMessage)
      setLoading(false)
      throw new Error(errorMessage)
    }
  }

  return {
    sendTransaction,
    loading,
    error,
    txHash,
  }
}

function getRpcUrl(chain: string): string {
  const urls: Record<string, string> = {
    Polkadot: process.env.NEXT_PUBLIC_POLKADOT_RPC_URL!,
    Acala: process.env.NEXT_PUBLIC_ACALA_RPC_URL!,
    Hydration: process.env.NEXT_PUBLIC_HYDRATION_RPC_URL!,
    Bifrost: process.env.NEXT_PUBLIC_BIFROST_RPC_URL!,
    Astar: process.env.NEXT_PUBLIC_ASTAR_RPC_URL!,
  }
  return urls[chain] || urls.Polkadot
}
