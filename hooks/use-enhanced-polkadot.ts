// FILE: hooks/use-enhanced-polkadot.ts (FIXED - Proper State Persistence)
"use client"

import { useState, useEffect, useCallback } from 'react'

export interface WalletAccount {
  address: string
  name: string
  source: string
  customName?: string
}

export interface WalletExtension {
  name: string
  version: string
  logo?: string
  installed: boolean
}

const SUPPORTED_WALLETS = {
  'polkadot-js': {
    name: 'Polkadot{.js}',
    logo: '🔴',
    downloadUrl: 'https://polkadot.js.org/extension/'
  },
  'subwallet-js': {
    name: 'SubWallet',
    logo: '🦊',
    downloadUrl: 'https://subwallet.app/'
  },
  'talisman': {
    name: 'Talisman',
    logo: '🌟',
    downloadUrl: 'https://talisman.xyz/'
  },
  'nova': {
    name: 'Nova Wallet',
    logo: '⭐',
    downloadUrl: 'https://novawallet.io/'
  }
}

// STORAGE KEYS
const STORAGE_KEYS = {
  CONNECTED_ACCOUNTS: 'dotvest_connected_accounts',
  SELECTED_ADDRESS: 'dotvest_selected_address',
  CUSTOM_NAMES: 'dotvest_custom_names',
  WALLET_CONNECTED: 'dotvest_wallet_connected'
}

export function useEnhancedPolkadot() {
  const [isReady, setIsReady] = useState(false)
  const [availableExtensions, setAvailableExtensions] = useState<WalletExtension[]>([])
  const [connectedAccounts, setConnectedAccounts] = useState<WalletAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState<WalletAccount | null>(null)
  const [selectedExtension, setSelectedExtension] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Load from storage
  const loadFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return null

    try {
      const connected = localStorage.getItem(STORAGE_KEYS.WALLET_CONNECTED)
      if (connected !== 'true') return null

      const accountsJson = localStorage.getItem(STORAGE_KEYS.CONNECTED_ACCOUNTS)
      const selectedAddr = localStorage.getItem(STORAGE_KEYS.SELECTED_ADDRESS)
      const customNames = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_NAMES) || '{}')

      if (accountsJson) {
        const accounts = JSON.parse(accountsJson).map((acc: WalletAccount) => ({
          ...acc,
          customName: customNames[acc.address]
        }))
        
        const selected = accounts.find((acc: WalletAccount) => acc.address === selectedAddr)
        
        return { accounts, selected }
      }
    } catch (err) {
      console.error('[DotVest] Storage load error:', err)
    }
    return null
  }, [])

  // Save to storage
  const saveToStorage = useCallback((accounts: WalletAccount[], selected: WalletAccount | null) => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEYS.CONNECTED_ACCOUNTS, JSON.stringify(accounts))
      localStorage.setItem(STORAGE_KEYS.WALLET_CONNECTED, 'true')
      if (selected) {
        localStorage.setItem(STORAGE_KEYS.SELECTED_ADDRESS, selected.address)
      }
    } catch (err) {
      console.error('[DotVest] Storage save error:', err)
    }
  }, [])

  const loadCustomNames = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_NAMES)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  }, [])

  const saveCustomName = useCallback((address: string, customName: string) => {
    try {
      const names = loadCustomNames()
      names[address] = customName
      localStorage.setItem(STORAGE_KEYS.CUSTOM_NAMES, JSON.stringify(names))
      
      setConnectedAccounts(prev => 
        prev.map(acc => 
          acc.address === address ? { ...acc, customName } : acc
        )
      )
      
      if (selectedAccount?.address === address) {
        setSelectedAccount(prev => prev ? { ...prev, customName } : null)
      }
    } catch (err) {
      console.error('Failed to save custom name:', err)
    }
  }, [selectedAccount, loadCustomNames])

  const detectExtensions = useCallback(async () => {
    if (typeof window === 'undefined') return []

    await new Promise(resolve => setTimeout(resolve, 100))

    const detected: WalletExtension[] = []
    const injectedWeb3 = (window as any).injectedWeb3

    if (injectedWeb3) {
      Object.entries(SUPPORTED_WALLETS).forEach(([key, wallet]) => {
        const installed = !!injectedWeb3[key]
        detected.push({
          name: wallet.name,
          version: injectedWeb3[key]?.version || 'unknown',
          logo: wallet.logo,
          installed
        })
      })
    }

    return detected
  }, [])

  // Initialize on mount
  useEffect(() => {
    setMounted(true)
    
    const init = async () => {
      // Check for stored connection
      const stored = loadFromStorage()
      
      if (stored && stored.accounts.length > 0) {
        console.log('[DotVest] 🔄 Restoring connection from storage')
        setConnectedAccounts(stored.accounts)
        setSelectedAccount(stored.selected)
        setIsReady(true)
      }

      // Detect extensions
      const extensions = await detectExtensions()
      setAvailableExtensions(extensions)
      
      const hasInstalled = extensions.some(ext => ext.installed)
      setIsReady(hasInstalled)
    }

    init()
  }, [detectExtensions, loadFromStorage])

  // Connect wallet - ALWAYS fetch fresh accounts
  const connectWallet = useCallback(async (walletName?: string) => {
    setIsConnecting(true)
    setError(null)

    try {
      console.log('[DotVest] 🔌 Connecting wallet...')
      
      const { web3Accounts, web3Enable } = await import('@polkadot/extension-dapp')
      
      // Request authorization
      const extensions = await web3Enable('DotVest')
      
      if (extensions.length === 0) {
        throw new Error('No wallet extension found or permission denied')
      }

      console.log('[DotVest] ✅ Extensions enabled:', extensions.length)
      
      // Fetch accounts
      const allAccounts = await web3Accounts()
      
      if (allAccounts.length === 0) {
        throw new Error('No accounts found. Please create an account in your wallet.')
      }

      const customNames = loadCustomNames()

      const formattedAccounts: WalletAccount[] = allAccounts.map(acc => ({
        address: acc.address,
        name: acc.meta.name || 'Unnamed Account',
        source: acc.meta.source,
        customName: customNames[acc.address] || undefined
      }))

      console.log(`[DotVest] 🎉 Found ${formattedAccounts.length} accounts`)

      setConnectedAccounts(formattedAccounts)
      
      // Auto-select first account if none selected
      const storedAddress = localStorage.getItem(STORAGE_KEYS.SELECTED_ADDRESS)
      const toSelect = formattedAccounts.find(acc => acc.address === storedAddress) || formattedAccounts[0]
      
      setSelectedAccount(toSelect)
      saveToStorage(formattedAccounts, toSelect)
      setIsReady(true)
      setError(null)

      console.log(`[DotVest] ✅ Auto-selected: ${toSelect.address.slice(0, 10)}...`)

    } catch (err: any) {
      console.error('[DotVest] ❌ Connection failed:', err)
      setError(err.message || 'Failed to connect wallet')
      setIsReady(false)
      // Clear storage on error
      localStorage.removeItem(STORAGE_KEYS.WALLET_CONNECTED)
    } finally {
      setIsConnecting(false)
    }
  }, [loadCustomNames, saveToStorage])

  const switchAccount = useCallback((address: string) => {
    const account = connectedAccounts.find(acc => acc.address === address)
    if (account) {
      setSelectedAccount(account)
      localStorage.setItem(STORAGE_KEYS.SELECTED_ADDRESS, address)
      console.log(`[DotVest] 🔄 Switched to: ${address.slice(0, 10)}...`)
    }
  }, [connectedAccounts])

  const disconnectWallet = useCallback(() => {
    setSelectedAccount(null)
    setConnectedAccounts([])
    setSelectedExtension(null)
    setIsReady(false)
    
    // Clear all storage
    localStorage.removeItem(STORAGE_KEYS.CONNECTED_ACCOUNTS)
    localStorage.removeItem(STORAGE_KEYS.SELECTED_ADDRESS)
    localStorage.removeItem(STORAGE_KEYS.WALLET_CONNECTED)
    
    console.log('[DotVest] 🔌 Wallet disconnected')
  }, [])

  const getAccountsByExtension = useCallback((extensionName: string) => {
    return connectedAccounts.filter(acc => acc.source === extensionName)
  }, [connectedAccounts])

  return {
    isReady,
    availableExtensions,
    connectedAccounts,
    selectedAccount,
    selectedExtension,
    error,
    isConnecting,
    mounted,
    connectWallet,
    switchAccount,
    disconnectWallet,
    saveCustomName,
    getAccountsByExtension,
    supportedWallets: SUPPORTED_WALLETS
  }
}

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