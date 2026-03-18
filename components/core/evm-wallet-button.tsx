'use client'

import { useState, useRef, useEffect } from 'react'
import { useEvmWallet } from '@/hooks/use-evm-wallet'
import { Button } from '@/components/ui/button'
import { Wallet, AlertTriangle, LogOut, RefreshCw, ChevronDown } from 'lucide-react'
import { activeChain } from '@/lib/contracts/config'

export function EvmWalletButton() {
  const {
    evmAddress,
    isEvmConnected,
    isConnecting,
    isCorrectChain,
    evmBalance,
    hasEvmProvider,
    connectEvmWallet,
    switchToPolkadotHub,
    disconnectEvmWallet,
  } = useEvmWallet()

  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!hasEvmProvider) {
    return (
      <Button variant="outline" size="sm" className="text-xs gap-1.5 opacity-60" disabled>
        <Wallet className="w-3.5 h-3.5" />
        No EVM Wallet
      </Button>
    )
  }

  if (!isEvmConnected) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="text-xs gap-1.5 border-primary/30 hover:border-primary"
        onClick={connectEvmWallet}
        disabled={isConnecting}
      >
        <Wallet className="w-3.5 h-3.5 text-primary" />
        {isConnecting ? 'Connecting...' : 'Connect EVM'}
      </Button>
    )
  }

  // Connected state — show button with dropdown
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors ${
          !isCorrectChain
            ? 'border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10'
            : 'border-border bg-muted/30 hover:bg-muted/50'
        }`}
      >
        {!isCorrectChain ? (
          <AlertTriangle className="w-3.5 h-3.5" />
        ) : (
          <Wallet className="w-3.5 h-3.5 text-accent" />
        )}
        <span className={`font-semibold text-xs ${isCorrectChain ? 'text-accent' : ''}`}>
          {!isCorrectChain ? 'Wrong Network' : `${evmAddress!.slice(0, 6)}...${evmAddress!.slice(-4)}`}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Wallet info */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">EVM Wallet</p>
            <p className="text-xs font-mono font-medium text-foreground truncate">{evmAddress}</p>
            {isCorrectChain && (
              <p className="text-xs text-muted-foreground mt-1">
                {Number(evmBalance).toFixed(4)} {activeChain.nativeCurrency.symbol}
              </p>
            )}
          </div>

          {/* Network status */}
          <div className="px-4 py-2.5 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Network</span>
              <span className={`text-xs font-medium ${isCorrectChain ? 'text-success' : 'text-yellow-500'}`}>
                {isCorrectChain ? activeChain.name : 'Wrong Network'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-2 space-y-1">
            {!isCorrectChain && (
              <button
                onClick={() => { switchToPolkadotHub(); setOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-yellow-500 hover:bg-yellow-500/10 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Switch to {activeChain.name}
              </button>
            )}
            <button
              onClick={() => { connectEvmWallet(); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Switch Account
            </button>
            <button
              onClick={() => { disconnectEvmWallet(); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Disconnect EVM Wallet
            </button>
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2 border-t border-border bg-muted/20">
            <p className="text-[10px] text-muted-foreground">MetaMask recommended. Phantom is not supported.</p>
          </div>
        </div>
      )}
    </div>
  )
}
