// FILE: hooks/use-enhanced-polkadot.ts
"use client"

import { useState, useEffect, useCallback } from 'react'
import type { InjectedExtension } from '@polkadot/extension-inject/types'

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

export function useEnhancedPolkadot() {
  const [isReady, setIsReady] = useState(false)
  const [availableExtensions, setAvailableExtensions] = useState<WalletExtension[]>([])
  const [connectedAccounts, setConnectedAccounts] = useState<WalletAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState<WalletAccount | null>(null)
  const [selectedExtension, setSelectedExtension] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // Load custom names from localStorage
  const loadCustomNames = useCallback(() => {
    try {
      const saved = localStorage.getItem('wallet_custom_names')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  }, [])

  // Save custom name
  const saveCustomName = useCallback((address: string, customName: string) => {
    try {
      const names = loadCustomNames()
      names[address] = customName
      localStorage.setItem('wallet_custom_names', JSON.stringify(names))
      
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

  // Detect installed extensions
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

  // Initialize - detect extensions
  useEffect(() => {
    let interval: NodeJS.Timeout

    const init = async () => {
      const extensions = await detectExtensions()
      setAvailableExtensions(extensions)
      
      const hasInstalled = extensions.some(ext => ext.installed)
      if (hasInstalled) {
        setIsReady(true)
      } else {
        // Keep checking for 5 seconds
        let attempts = 0
        interval = setInterval(async () => {
          attempts++
          const exts = await detectExtensions()
          setAvailableExtensions(exts)
          
          const found = exts.some(ext => ext.installed)
          if (found || attempts >= 10) {
            clearInterval(interval)
            setIsReady(found)
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
  }, [detectExtensions])

  // Connect to specific wallet extension
  const connectWallet = useCallback(async (walletName?: string) => {
    setIsConnecting(true)
    setError(null)

    try {
      const { web3Accounts, web3Enable, web3FromSource } = await import('@polkadot/extension-dapp')
      
      const injectedWeb3 = (window as any).injectedWeb3
      if (!injectedWeb3) {
        throw new Error('No wallet extensions detected')
      }

      // Get available extension keys
      const availableKeys = Object.keys(injectedWeb3).filter(key => 
        Object.keys(SUPPORTED_WALLETS).includes(key)
      )

      if (availableKeys.length === 0) {
        throw new Error('No supported wallet extensions found')
      }

      // Use specified wallet or first available
      const targetWallet = walletName || availableKeys[0]
      
      if (!injectedWeb3[targetWallet]) {
        throw new Error(`${targetWallet} extension not found`)
      }

      console.log(`[DotVest] Connecting to ${targetWallet}...`)

      // Enable the extension
      const extensions = await web3Enable('DotVest')
      
      if (extensions.length === 0) {
        throw new Error('User denied access to wallet extension')
      }

      // Get accounts from ALL extensions (so user can choose)
      const allAccounts = await web3Accounts()
      
      if (allAccounts.length === 0) {
        throw new Error('No accounts found in wallet extensions')
      }

      const customNames = loadCustomNames()

      // Format accounts with their source extension
      const formattedAccounts: WalletAccount[] = allAccounts.map(acc => ({
        address: acc.address,
        name: acc.meta.name || 'Unnamed Account',
        source: acc.meta.source,
        customName: customNames[acc.address] || undefined
      }))

      setConnectedAccounts(formattedAccounts)
      setSelectedExtension(targetWallet)

      // Restore previous selection or use first account
      const savedAddress = localStorage.getItem('selected_wallet_address')
      const accountToSelect = savedAddress 
        ? formattedAccounts.find(acc => acc.address === savedAddress)
        : formattedAccounts.find(acc => acc.source === targetWallet) || formattedAccounts[0]
      
      if (accountToSelect) {
        setSelectedAccount(accountToSelect)
        localStorage.setItem('selected_wallet_address', accountToSelect.address)
      }

      setIsReady(true)
      console.log(`[DotVest] Connected successfully. Found ${formattedAccounts.length} accounts`)

    } catch (err: any) {
      console.error('[DotVest] Wallet connection failed:', err)
      setError(err.message || 'Failed to connect wallet')
      setIsReady(false)
    } finally {
      setIsConnecting(false)
    }
  }, [loadCustomNames])

  // Switch to different account
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
    setSelectedExtension(null)
    setIsReady(false)
    localStorage.removeItem('selected_wallet_address')
    sessionStorage.setItem('wallet_disconnected', 'true')
    console.log('[DotVest] Wallet disconnected')
  }, [])

  // Get accounts by extension
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