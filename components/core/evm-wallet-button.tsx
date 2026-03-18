'use client'

import { useEvmWallet } from '@/hooks/use-evm-wallet'
import { Button } from '@/components/ui/button'
import { Wallet, AlertTriangle } from 'lucide-react'

export function EvmWalletButton() {
  const {
    evmAddress,
    isEvmConnected,
    isConnecting,
    isCorrectChain,
    hasEvmProvider,
    connectEvmWallet,
    switchToPolkadotHub,
  } = useEvmWallet()

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

  if (!isCorrectChain) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="text-xs gap-1.5 border-yellow-500/50 text-yellow-600"
        onClick={switchToPolkadotHub}
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        Switch Network
      </Button>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 bg-muted/30 px-3 py-1.5 rounded-lg text-sm">
      <Wallet className="w-3.5 h-3.5 text-accent" />
      <span className="text-accent font-semibold text-xs">
        {evmAddress!.slice(0, 6)}...{evmAddress!.slice(-4)}
      </span>
      <span className="size-2 rounded-full bg-success" aria-hidden />
    </span>
  )
}
