// FILE: app/connect-wallet/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Wallet, CheckCircle2, AlertCircle, Loader2, ExternalLink, Shield } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { usePolkadotExtension } from "@/hooks/use-polkadot-extension"
import { useWalletBalance } from "@/hooks/use-wallet-balance"
import Link from "next/link"

const WALLET_OPTIONS = [
  {
    id: "polkadot-js",
    name: "Polkadot{.js}",
    icon: "🔴",
    description: "Official Polkadot extension",
    downloadUrl: "https://polkadot.js.org/extension/",
  },
  {
    id: "talisman",
    name: "Talisman",
    icon: "🌟",
    description: "Multi-chain wallet for Polkadot & Ethereum",
    downloadUrl: "https://talisman.xyz/",
  },
  {
    id: "subwallet",
    name: "SubWallet",
    icon: "🦊",
    description: "Comprehensive Polkadot ecosystem wallet",
    downloadUrl: "https://subwallet.app/",
  },
]

export default function ConnectWallet() {
  const router = useRouter()
  const { 
    accounts, 
    selectedAccount, 
    selectAccount, 
    connectWallet, 
    isReady, 
    error: walletError 
  } = usePolkadotExtension()
  
  const { 
    balances, 
    totalPortfolioValue, 
    loading: balancesLoading 
  } = useWalletBalance()

  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Auto-connect if extension is available
    if (!isReady && !walletError) {
      handleConnect()
    }
  }, [])

  const handleConnect = async () => {
    setConnecting(true)
    setError(null)

    try {
      await connectWallet()
      // Connection successful - accounts should now be available
    } catch (err) {
      console.error("Connection error:", err)
      setError(err instanceof Error ? err.message : "Failed to connect wallet")
    } finally {
      setConnecting(false)
    }
  }

  const handleSelectAccount = (address: string) => {
    selectAccount(address)
  }

  const handleContinue = () => {
    if (selectedAccount) {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Connect Your Wallet</h1>
          <p className="text-muted-foreground text-lg">
            Connect your Polkadot wallet to access DotVest's yield optimization features
          </p>
        </div>

        {/* Connection Status */}
        {!isReady && !connecting && (
          <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg mb-6">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">No Wallet Extension Detected</h3>
            </div>

            <p className="text-muted-foreground mb-6">
              To use DotVest, you'll need a Polkadot-compatible wallet extension. Choose one below:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {WALLET_OPTIONS.map((wallet) => (
                <a
                  key={wallet.id}
                  href={wallet.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-card/50 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{wallet.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold group-hover:text-primary transition-colors">
                        {wallet.name}
                      </h4>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">{wallet.description}</p>
                </a>
              ))}
            </div>

            <div className="mt-6 p-4 bg-accent/10 border border-accent/30 rounded-lg">
              <p className="text-sm text-accent flex items-center gap-2">
                <Shield className="w-4 h-4" />
                After installing, refresh this page to connect your wallet
              </p>
            </div>
          </Card>
        )}

        {/* Connecting State */}
        {connecting && (
          <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-8 rounded-lg mb-6">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold mb-2">Connecting to Wallet...</h3>
              <p className="text-muted-foreground">
                Please approve the connection request in your wallet extension
              </p>
            </div>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="backdrop-blur-xl bg-destructive/10 border border-destructive/50 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-destructive">Connection Failed</p>
                <p className="text-xs text-destructive/80">{error}</p>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleConnect}
                className="bg-transparent border-destructive/50 text-destructive"
              >
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Connected State - Account Selection */}
        {isReady && accounts && accounts.length > 0 && (
          <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg mb-6">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-semibold">Wallet Connected</h3>
            </div>

            <p className="text-muted-foreground mb-4">
              Select an account to continue:
            </p>

            <div className="space-y-3 mb-6">
              {accounts.map((account) => {
                const isSelected = selectedAccount?.address === account.address
                const accountBalance = balances.find(b => 
                  b.tokens.some(t => t.chain === "Polkadot")
                )
                
                return (
                  <div
                    key={account.address}
                    onClick={() => handleSelectAccount(account.address)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-primary/20 border-primary"
                        : "bg-card/50 border-border/50 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <span className="text-sm font-bold text-primary-foreground">
                              {account.name?.charAt(0).toUpperCase() || "?"}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold">{account.name || "Unnamed Account"}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {account.address.slice(0, 10)}...{account.address.slice(-8)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Balance Info */}
                        {balancesLoading ? (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Loading balances...
                          </div>
                        ) : accountBalance ? (
                          <div className="flex gap-4 text-xs">
                            {accountBalance.tokens.map((token) => (
                              <div key={token.symbol}>
                                <span className="text-muted-foreground">{token.symbol}: </span>
                                <span className="font-semibold">{token.formatted}</span>
                                {token.usdValue && (
                                  <span className="text-muted-foreground ml-1">
                                    (${token.usdValue.toFixed(2)})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Portfolio Summary */}
            {selectedAccount && !balancesLoading && (
              <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
                    <p className="text-2xl font-bold text-accent">
                      ${totalPortfolioValue.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Chains Connected</p>
                    <p className="text-xl font-bold">{balances.length}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleContinue}
                disabled={!selectedAccount}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Continue to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={handleConnect}
                className="bg-transparent"
              >
                Refresh
              </Button>
            </div>
          </Card>
        )}

        {/* Security Notice */}
        <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-2">Security Notice</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• DotVest never stores your private keys</li>
                <li>• All transactions require your explicit approval</li>
                <li>• Your wallet remains in your full control</li>
                <li>• We use industry-standard encryption for all data</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link 
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}