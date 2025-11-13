"use client"

import { useEffect, useState, useCallback } from "react"
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types"

interface UsePolkadotExtensionReturn {
  isReady: boolean
  accounts: InjectedAccountWithMeta[]
  selectedAccount: InjectedAccountWithMeta | null
  selectAccount: (account: InjectedAccountWithMeta) => void
  injector: any
  error: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  isLoading: boolean
}

export function usePolkadotExtension(): UsePolkadotExtensionReturn {
  const [isReady, setIsReady] = useState(false)
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([])
  const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta | null>(null)
  const [injector, setInjector] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Check if extension is available on mount
  useEffect(() => {
    const checkExtension = async () => {
      try {
        // Skip auto-connect if user previously disconnected
        const wasDisconnected = sessionStorage.getItem("wallet_disconnected")
        if (wasDisconnected === "true") {
          console.log("[DOTVEST] Wallet auto-connect skipped (user disconnected)")
          return
        }

        const { web3Accounts, web3Enable, web3FromSource } = await import("@polkadot/extension-dapp")
        const extensions = await web3Enable("DOTVEST")

        if (extensions.length > 0) {
          setIsReady(true)

          // Load accounts
          const accs = await web3Accounts()
          setAccounts(accs)

          // Restore previously selected account
          const savedAccountAddress = localStorage.getItem("selectedPolkadotAccount")
          if (savedAccountAddress && accs.length > 0) {
            const saved = accs.find((acc) => acc.address === savedAccountAddress)
            if (saved) {
              setSelectedAccount(saved)
              const injectedExt = await web3FromSource(saved.meta.source)
              setInjector(injectedExt)
            }
          }
        } else {
          setError("Polkadot.js extension not found")
          setIsReady(false)
        }
      } catch (err) {
        console.log("[DOTVEST] Extension check error:", err)
        setError("Polkadot.js extension not available")
        setIsReady(false)
      }
    }

    checkExtension()
  }, [])

  const connectWallet = useCallback(async () => {
    setIsLoading(true)
    try {
      const { web3Accounts, web3Enable, web3FromSource } = await import("@polkadot/extension-dapp")

      const extensions = await web3Enable("DOTVEST")
      if (extensions.length === 0) throw new Error("No Polkadot.js extension found")

      const accs = await web3Accounts()
      if (accs.length === 0) throw new Error("No accounts found in extension")

      const account = accs[0]
      setSelectedAccount(account)
      setAccounts(accs)
      localStorage.setItem("selectedPolkadotAccount", account.address)

      const injectedExt = await web3FromSource(account.meta.source)
      setInjector(injectedExt)

      // Clear disconnection flag
      sessionStorage.removeItem("wallet_disconnected")

      setError(null)
      setIsReady(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect wallet"
      console.log("[DOTVEST] Wallet connection error:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const selectAccount = useCallback((account: InjectedAccountWithMeta) => {
    setSelectedAccount(account)
    localStorage.setItem("selectedPolkadotAccount", account.address)
  }, [])

  const disconnectWallet = useCallback(() => {
    setSelectedAccount(null)
    localStorage.removeItem("selectedPolkadotAccount")
    sessionStorage.setItem("wallet_disconnected", "true")
    console.log("[DOTVEST] Wallet manually disconnected.")
  }, [])

  return {
    isReady,
    accounts,
    selectedAccount,
    selectAccount,
    injector,
    error,
    connectWallet,
    disconnectWallet,
    isLoading,
  }
}
