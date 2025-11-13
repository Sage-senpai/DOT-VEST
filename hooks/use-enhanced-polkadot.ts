// FILE: hooks/use-enhanced-polkadot.ts
"use client"

import { useState, useEffect, useCallback } from 'react'

export interface WalletAccount {
  address: string
  name: string
  source: string
  customName?: string
}

export interface WalletInfo {
  name: string
  version: string
  accounts: WalletAccount[]
}

export function useEnhancedPolkadot() {
  const [isReady, setIsReady] = useState(false)
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([])
  const [connectedAccounts, setConnectedAccounts] = useState<WalletAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState<WalletAccount | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // Load custom wallet names from localStorage
  const loadCustomNames = useCallback(() => {
    try {
      const saved = localStorage.getItem('wallet_custom_names')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  }, [])

  // Save custom wallet name
  const saveCustomName = useCallback((address: string, customName: string) => {
    try {
      const names = loadCustomNames()
      names[address] = customName
      localStorage.setItem('wallet_custom_names', JSON.stringify(names))
      
      // Update connected accounts with new name
      setConnectedAccounts(prev => 
        prev.map(acc => 
          acc.address === address ? { ...acc, customName } : acc
        )
      )
      
      // Update selected account if it matches
      if (selectedAccount?.address === address) {
        setSelectedAccount(prev => prev ? { ...prev, customName } : null)
      }
    } catch (err) {
      console.error('Failed to save custom name:', err)
    }
  }, [selectedAccount, loadCustomNames])

  // Initialize Polkadot extension
  const initialize = useCallback(async () => {
    if (typeof window === 'undefined') return

    try {
      // Wait for injectedWeb3 to be available
      const checkInjected = () => {
        return new Promise<void>((resolve) => {
          if (window.injectedWeb3) {
            resolve()
          } else {
            const interval = setInterval(() => {
              if (window.injectedWeb3) {
                clearInterval(interval)
                resolve()
              }
            }, 100)
            
            // Timeout after 5 seconds
            setTimeout(() => {
              clearInterval(interval)
              resolve()
            }, 5000)
          }
        })
      }

      await checkInjected()

      if (!window.injectedWeb3) {
        setError('No Polkadot wallet extension detected')
        return
      }

      const wallets: WalletInfo[] = []
      const customNames = loadCustomNames()

      // Detect all available wallets
      for (const [key, value] of Object.entries(window.injectedWeb3)) {
        try {
          const extension = await (value as any).enable('DotVest')
          const accounts = await extension.accounts.get()
          
          wallets.push({
            name: key,
            version: value.version || 'unknown',
            accounts: accounts.map((acc: any) => ({
              address: acc.address,
              name: acc.name || 'Unnamed Account',
              source: key,
              customName: customNames[acc.address] || undefined
            }))
          })
        } catch (err) {
          console.error(`Failed to load ${key}:`, err)
        }
      }

      setAvailableWallets(wallets)
      setIsReady(true)
    } catch (err) {
      console.error('Polkadot initialization failed:', err)
      setError('Failed to initialize Polkadot extension')
    }
  }, [loadCustomNames])

  // Connect to a specific wallet
  const connectWallet = useCallback(async (walletName?: string) => {
    if (!isReady) {
      await initialize()
    }

    setIsConnecting(true)
    setError(null)

    try {
      const targetWallet = walletName || availableWallets[0]?.name
      if (!targetWallet) {
        throw new Error('No wallet available')
      }

      const extension = await window.injectedWeb3[targetWallet].enable('DotVest')
      const accounts = await extension.accounts.get()
      const customNames = loadCustomNames()

      const formattedAccounts = accounts.map((acc: any) => ({
        address: acc.address,
        name: acc.name || 'Unnamed Account',
        source: targetWallet,
        customName: customNames[acc.address] || undefined
      }))

      setConnectedAccounts(formattedAccounts)
      
      // Auto-select first account or restore previous selection
      const savedAddress = localStorage.getItem('selected_wallet_address')
      const accountToSelect = savedAddress 
        ? formattedAccounts.find(acc => acc.address === savedAddress)
        : formattedAccounts[0]
      
      setSelectedAccount(accountToSelect || formattedAccounts[0])
      
      if (accountToSelect || formattedAccounts[0]) {
        localStorage.setItem('selected_wallet_address', (accountToSelect || formattedAccounts[0]).address)
      }
    } catch (err: any) {
      console.error('Wallet connection failed:', err)
      setError(err.message || 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }, [isReady, availableWallets, initialize, loadCustomNames])

  // Switch to a different account
  const switchAccount = useCallback((address: string) => {
    const account = connectedAccounts.find(acc => acc.address === address)
    if (account) {
      setSelectedAccount(account)
      localStorage.setItem('selected_wallet_address', address)
    }
  }, [connectedAccounts])

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setSelectedAccount(null)
    setConnectedAccounts([])
    localStorage.removeItem('selected_wallet_address')
  }, [])

  // Initialize on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  // Auto-connect if previously connected
  useEffect(() => {
    const savedAddress = localStorage.getItem('selected_wallet_address')
    if (savedAddress && isReady && !selectedAccount && availableWallets.length > 0) {
      connectWallet()
    }
  }, [isReady, availableWallets, selectedAccount, connectWallet])

  return {
    isReady,
    availableWallets,
    connectedAccounts,
    selectedAccount,
    error,
    isConnecting,
    connectWallet,
    switchAccount,
    disconnectWallet,
    saveCustomName
  }
}

// Type declarations for window
declare global {
  interface Window {
    injectedWeb3: {
      [key: string]: {
        version: string
        enable: (appName: string) => Promise<any>
      }
    }
  }
}