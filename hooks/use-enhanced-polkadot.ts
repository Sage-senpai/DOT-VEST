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

  // Check for wallet extensions on mount and when requested
  const checkForWallets = useCallback(async () => {
    if (typeof window === 'undefined') return false

    // Wait a bit for extensions to load
    await new Promise(resolve => setTimeout(resolve, 100))

    if (window.injectedWeb3 && Object.keys(window.injectedWeb3).length > 0) {
      setIsReady(true)
      return true
    }
    
    return false
  }, [])

  // Initialize - check for extensions
  useEffect(() => {
    let interval: NodeJS.Timeout

    const init = async () => {
      // Check immediately
      const found = await checkForWallets()
      
      if (!found) {
        // Keep checking every 500ms for up to 5 seconds
        let attempts = 0
        interval = setInterval(async () => {
          attempts++
          const found = await checkForWallets()
          
          if (found || attempts >= 10) {
            clearInterval(interval)
            if (!found) {
              setError('No Polkadot wallet extension detected')
            }
          }
        }, 500)
      }
    }

    init()

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [checkForWallets])

  // Connect to wallet - this triggers the extension popup
  const connectWallet = useCallback(async (walletName?: string) => {
    setIsConnecting(true)
    setError(null)

    try {
      // Ensure extensions are loaded
      const hasWallets = await checkForWallets()
      
      if (!hasWallets) {
        throw new Error('No wallet extensions detected. Please install a Polkadot wallet.')
      }

      const injectedExtensions = window.injectedWeb3
      const availableExtensions = Object.keys(injectedExtensions)

      if (availableExtensions.length === 0) {
        throw new Error('No wallet extensions available')
      }

      // Use specified wallet or first available
      const targetWallet = walletName || availableExtensions[0]
      
      if (!injectedExtensions[targetWallet]) {
        throw new Error(`Wallet ${targetWallet} not found`)
      }

      console.log(`Connecting to ${targetWallet}...`)

      // This triggers the popup from the extension
      const extension = await injectedExtensions[targetWallet].enable('DotVest')
      
      if (!extension || !extension.accounts) {
        throw new Error('Failed to enable wallet extension')
      }

      const accounts = await extension.accounts.get()
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in wallet')
      }

      const customNames = loadCustomNames()

      const formattedAccounts: WalletAccount[] = accounts.map((acc: any) => ({
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
      
      const finalAccount = accountToSelect || formattedAccounts[0]
      setSelectedAccount(finalAccount)
      
      if (finalAccount) {
        localStorage.setItem('selected_wallet_address', finalAccount.address)
      }

      // Detect all available wallets
      const wallets: WalletInfo[] = []
      for (const [key, value] of Object.entries(injectedExtensions)) {
        try {
          const ext = await (value as any).enable('DotVest')
          const accs = await ext.accounts.get()
          
          wallets.push({
            name: key,
            version: value.version || 'unknown',
            accounts: accs.map((acc: any) => ({
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

      console.log(`Successfully connected to ${targetWallet}`)
    } catch (err: any) {
      console.error('Wallet connection failed:', err)
      setError(err.message || 'Failed to connect wallet')
      setIsReady(false)
    } finally {
      setIsConnecting(false)
    }
  }, [checkForWallets, loadCustomNames])

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
    setIsReady(false)
    setAvailableWallets([])
    localStorage.removeItem('selected_wallet_address')
  }, [])

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
    saveCustomName,
    checkForWallets
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