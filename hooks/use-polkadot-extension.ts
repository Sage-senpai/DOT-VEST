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
  isLoading: boolean
}

export function usePolkadotExtension(): UsePolkadotExtensionReturn {
  const [isReady, setIsReady] = useState(false)
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([])
  const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta | null>(null)
  const [injector, setInjector] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if extension is available on mount
    const checkExtension = async () => {
      try {
        // Dynamically import to avoid SSR issues
        const { web3Accounts, web3Enable } = await import("@polkadot/extension-dapp")

        const extensions = await web3Enable("DOTVEST")

        if (extensions.length > 0) {
          setIsReady(true)
          // Get accounts from localStorage if previously selected
          const savedAccountAddress = localStorage.getItem("selectedPolkadotAccount")
          const accs = await web3Accounts()
          setAccounts(accs)

          if (savedAccountAddress && accs.length > 0) {
            const saved = accs.find((acc) => acc.address === savedAccountAddress)
            if (saved) {
              setSelectedAccount(saved)
              const { web3FromSource } = await import("@polkadot/extension-dapp")
              const injectedExt = await web3FromSource(saved.meta.source)
              setInjector(injectedExt)
            }
          }
        } else {
          setError("Polkadot.js extension not found")
          setIsReady(false)
        }
      } catch (err) {
        console.log("[v0] Extension check error:", err)
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
      if (extensions.length === 0) {
        throw new Error("No Polkadot.js extension found")
      }

      const accs = await web3Accounts()
      if (accs.length === 0) {
        throw new Error("No accounts found in extension")
      }

      // Select first account
      const account = accs[0]
      setSelectedAccount(account)
      setAccounts(accs)

      // Save selected account to localStorage
      localStorage.setItem("selectedPolkadotAccount", account.address)

      // Get injector for signing
      const injectedExt = await web3FromSource(account.meta.source)
      setInjector(injectedExt)
      setError(null)
      setIsReady(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect wallet"
      console.log("[v0] Wallet connection error:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const selectAccount = useCallback((account: InjectedAccountWithMeta) => {
    setSelectedAccount(account)
    localStorage.setItem("selectedPolkadotAccount", account.address)
  }, [])

  return {
    isReady,
    accounts,
    selectedAccount,
    selectAccount,
    injector,
    error,
    connectWallet,
    isLoading,
  }
}
