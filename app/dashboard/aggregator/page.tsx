// FILE: app/dashboard/aggregator/page.tsx (FIXED HOOKS)
"use client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const ssr = false;

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowRightLeft, Zap, AlertCircle, CheckCircle2, TrendingUp, Shield, DollarSign, RefreshCw, Wallet } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { ExecutedStrategy } from "@/types/ExecutedStrategy"
import { Button } from "@/components/ui/button"
import { useStrategyVaults } from "@/hooks/use-strategy-vaults"
import { usePolkadotExtension } from "@/hooks/use-polkadot-extension"
import { useLivePools, useOptimalPool, usePoolCategories, LivePool } from "@/hooks/use-live-pools"
import { useWalletBalance } from "@/hooks/use-wallet-balance"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

function LastUpdated({ timestamp }: { timestamp?: string }) {
  const [time, setTime] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (timestamp) {
      setTime(new Date(timestamp).toLocaleTimeString())
    }
  }, [timestamp])

  if (!mounted) return <p className="text-sm font-semibold">Loading...</p>
  return <p className="text-sm font-semibold">{time}</p>
}

export default function RealAggregator() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  
  // All hooks must be called unconditionally at the top level
  const { addStrategy } = useStrategyVaults()
  const { selectedAccount, isReady } = usePolkadotExtension()
  const { totalPortfolioValue, balances } = useWalletBalance()
  const { pools, metadata, loading, refresh, isRefreshing, useMockData } = useLivePools()
  const { findOptimal, isLoading: findingOptimal } = useOptimalPool(pools)
  
  const [selectedPool, setSelectedPool] = useState<LivePool | null>(null)
  const [depositAmount, setDepositAmount] = useState("")
  const [durationMonths, setDurationMonths] = useState(1)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionStatus, setExecutionStatus] = useState<{type: 'idle' | 'success' | 'error', message: string}>({
    type: 'idle',
    message: ''
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [demoMode, setDemoMode] = useState(false)
  const [showBalanceModal, setShowBalanceModal] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredPools = useMemo(() => {
    let filtered = pools

    filtered = filtered.filter(pool =>
      pool.project?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pool.chain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pool.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (riskFilter !== 'all') {
      filtered = filtered.filter(pool => {
        if (riskFilter === 'low') return pool.riskScore >= 70
        if (riskFilter === 'medium') return pool.riskScore >= 40 && pool.riskScore < 70
        return pool.riskScore < 40
      })
    }

    return filtered
  }, [pools, searchQuery, riskFilter])

  const estimatedReturn = useMemo(() => {
    if (!selectedPool || !depositAmount) return 0
    const amount = parseFloat(depositAmount)
    const monthlyRate = selectedPool.apy / 100 / 12
    const total = amount * Math.pow(1 + monthlyRate, durationMonths)
    return total - amount
  }, [selectedPool, depositAmount, durationMonths])

  const handleFindOptimal = async () => {
    if (!depositAmount) return

    try {
      const result = await findOptimal({
        amount: parseFloat(depositAmount),
        duration: durationMonths,
        riskTolerance: riskFilter === 'all' ? 'medium' : riskFilter,
      })

      if (result.success && result.data) {
        setSelectedPool(result.data.pool)
        setExecutionStatus({
          type: 'success',
          message: `Found optimal pool: ${result.data.name} with ${result.data.pool.apy}% APY`
        })
      }
    } catch (error: any) {
      setExecutionStatus({
        type: 'error',
        message: error.message || 'Failed to find optimal pool'
      })
    }
  }

  const handleExecuteStrategy = async () => {
    if (!selectedPool || !depositAmount) {
      setExecutionStatus({
        type: 'error',
        message: 'Please select a pool and enter an amount'
      })
      return
    }

    const amount = parseFloat(depositAmount)

    if (!isReady || !selectedAccount) {
      setExecutionStatus({
        type: 'error',
        message: 'Please connect your wallet first'
      })
      return
    }

    if (amount > totalPortfolioValue && !demoMode) {
      setExecutionStatus({
        type: 'error',
        message: `Insufficient balance. You have $${totalPortfolioValue.toFixed(2)}. Switch to Demo Mode to try without real funds.`
      })
      setShowBalanceModal(true)
      return
    }

    setIsExecuting(true)
    setExecutionStatus({type: 'idle', message: ''})

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const strategy: ExecutedStrategy = {
  id: Date.now().toString(),
  tokenName: selectedPool.symbol,
  amount,
  duration: durationMonths,
  protocol: selectedPool.project,
  apy: selectedPool.apy.toString(),
  executedAt: new Date(),
  wallet_address: selectedAccount.address,
  status: demoMode ? "demo" : "active"
}


      addStrategy(strategy)

      setExecutionStatus({
        type: 'success',
        message: demoMode 
          ? `Demo strategy created! This is for learning only.`
          : `Successfully deployed ${depositAmount} ${selectedPool.symbol}`
      })

      setTimeout(() => {
        router.push("/dashboard/vaults")
      }, 2000)
    } catch (error) {
      setExecutionStatus({
        type: 'error',
        message: 'Strategy execution failed. Please try again.'
      })
    } finally {
      setIsExecuting(false)
    }
  }

  const handleDemoMode = () => {
    setDemoMode(true)
    setShowBalanceModal(false)
    setExecutionStatus({
      type: 'success',
      message: 'Demo Mode enabled. You can now create strategies for learning.'
    })
  }

  // Don't render until mounted
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading aggregator...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading live DeFi opportunities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">DeFi Aggregator</h2>
          <p className="text-muted-foreground">
            {useMockData ? 'Demo data - API temporarily unavailable' : `Real-time opportunities from ${metadata.chains?.length || 0} Polkadot parachains`}
            {demoMode && <span className="ml-2 text-secondary font-semibold">(Demo Mode)</span>}
          </p>
        </div>
        <Button
          onClick={refresh}
          disabled={isRefreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isReady && selectedAccount && (
        <Card className="backdrop-blur-xl bg-accent/10 border border-accent/30 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
              <p className="text-3xl font-bold text-accent">${totalPortfolioValue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Across {balances.length} chains • {demoMode ? 'Demo Mode' : 'Real Funds'}
              </p>
            </div>
            <Wallet className="w-10 h-10 text-accent opacity-50" />
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Pools</p>
              <p className="text-2xl font-bold">{metadata.total || 0}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary opacity-50" />
          </div>
        </Card>

        <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Avg APY</p>
              <p className="text-2xl font-bold text-accent">
                {metadata.avgAPY?.toFixed(2) || 0}%
              </p>
            </div>
            <Zap className="w-8 h-8 text-accent opacity-50" />
          </div>
        </Card>

        <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total TVL</p>
              <p className="text-2xl font-bold">
                ${((metadata.totalTVL || 0) / 1e6).toFixed(1)}M
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-secondary opacity-50" />
          </div>
        </Card>

        <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
              <LastUpdated timestamp={metadata.lastUpdated} />
            </div>
            <RefreshCw className="w-8 h-8 text-muted-foreground opacity-50" />
          </div>
        </Card>
      </div>

      {executionStatus.type !== 'idle' && (
        <Card className={`backdrop-blur-xl border p-4 rounded-lg ${
          executionStatus.type === 'success' 
            ? 'bg-accent/10 border-accent/50' 
            : 'bg-destructive/10 border-destructive/50'
        }`}>
          <div className="flex items-center gap-3">
            {executionStatus.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-accent" />
            ) : (
              <AlertCircle className="w-5 h-5 text-destructive" />
            )}
            <p className={`text-sm ${
              executionStatus.type === 'success' ? 'text-accent' : 'text-destructive'
            }`}>
              {executionStatus.message}
            </p>
          </div>
        </Card>
      )}

      <Dialog open={showBalanceModal} onOpenChange={setShowBalanceModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insufficient Balance</DialogTitle>
            <DialogDescription>
              You're trying to deposit more than your available balance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
              <p className="text-sm">
                Amount: <strong>${parseFloat(depositAmount || "0").toFixed(2)}</strong>
              </p>
              <p className="text-sm">
                Available: <strong>${totalPortfolioValue.toFixed(2)}</strong>
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleDemoMode} className="flex-1">
                <Zap className="w-4 h-4 mr-2" />
                Demo Mode
              </Button>
              <Button variant="outline" onClick={() => setShowBalanceModal(false)} className="flex-1">
                Adjust Amount
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search pools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
            <Button onClick={handleFindOptimal} disabled={!depositAmount || findingOptimal}>
              <Zap className="w-4 h-4 mr-2" />
              {findingOptimal ? 'Finding...' : 'Find Optimal'}
            </Button>
          </div>

          <div className="flex gap-2">
            {['all', 'low', 'medium', 'high'].map((risk) => (
              <button
                key={risk}
                onClick={() => setRiskFilter(risk as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  riskFilter === risk
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card/50 hover:bg-card/80'
                }`}
              >
                {risk === 'all' ? 'All Risks' : `${risk.charAt(0).toUpperCase() + risk.slice(1)} Risk`}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {filteredPools.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No pools found matching your criteria</p>
            </div>
          ) : (
            filteredPools.map((pool, idx) => (
              <div
                key={`${pool.chain}-${pool.project}-${idx}`}
                onClick={() => setSelectedPool(pool)}
                className={`p-4 rounded-lg cursor-pointer transition-all border ${
                  selectedPool?.symbol === pool.symbol && selectedPool?.chain === pool.chain
                    ? "bg-primary/20 border-primary backdrop-blur-xl"
                    : "bg-card/50 border-border/50 hover:border-primary/50 backdrop-blur-xl hover:bg-card/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-base">{pool.symbol} {pool.project}</h4>
                      <span className="text-xs px-2 py-1 rounded bg-secondary/20 text-secondary">
                        {pool.chain}
                      </span>
                      <Shield className="w-4 h-4 text-accent" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{pool.project}</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">APY</p>
                      <p className="text-xl font-bold text-accent">{pool.apy.toFixed(2)}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">TVL</p>
                      <p className="text-sm font-semibold">
                        ${(pool.tvlUsd / 1e6).toFixed(2)}M
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Risk Score</p>
                      <p className={`text-sm font-bold ${
                        pool.riskScore >= 70 ? 'text-accent' :
                        pool.riskScore >= 40 ? 'text-secondary' : 'text-destructive'
                      }`}>
                        {pool.riskScore}/100
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {selectedPool && (
        <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-8 rounded-lg">
          <h3 className="text-2xl font-bold mb-6">Build Your Strategy</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Amount to Deposit</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50"
                  />
                  <span className="px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm">
                    {selectedPool.symbol}
                  </span>
                </div>
                {depositAmount && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ≈ ${(parseFloat(depositAmount) * 1).toFixed(2)} USD
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Duration</label>
                <select
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50"
                >
                  <option value={1}>1 Month</option>
                  <option value={3}>3 Months</option>
                  <option value={6}>6 Months</option>
                  <option value={12}>1 Year</option>
                </select>
              </div>

              {demoMode && (
                <div className="p-3 bg-secondary/10 border border-secondary/30 rounded-lg">
                  <p className="text-xs text-secondary font-semibold">
                    🎓 Demo Mode Active - This strategy is for learning only
                  </p>
                </div>
              )}

              <Button
                onClick={handleExecuteStrategy}
                disabled={!isReady || isExecuting || !depositAmount}
                className="w-full bg-primary hover:bg-primary/90 gap-2 disabled:opacity-50"
              >
                <ArrowRightLeft className="w-4 h-4" />
                {isExecuting ? "Executing..." : demoMode ? "Create Demo Strategy" : "Execute Strategy"}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Selected Pool</span>
                  <span className="font-semibold">{selectedPool.symbol} {selectedPool.project}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Chain</span>
                  <span className="font-semibold">{selectedPool.chain}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">APY</span>
                  <span className="font-semibold text-accent">{selectedPool.apy.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Return</span>
                  <span className="font-bold text-accent">
                    {estimatedReturn.toFixed(4)} {selectedPool.symbol}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Risk Score</span>
                  <span className={`font-bold ${
                    selectedPool.riskScore >= 70 ? 'text-accent' : 'text-secondary'
                  }`}>
                    {selectedPool.riskScore}/100
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TVL</span>
                  <span className="font-semibold">
                    ${(selectedPool.tvlUsd / 1e6).toFixed(2)}M
                  </span>
                </div>
              </div>

              {depositAmount && parseFloat(depositAmount) > totalPortfolioValue && !demoMode && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <p className="text-xs text-destructive font-semibold">
                    ⚠️ Amount exceeds available balance (${totalPortfolioValue.toFixed(2)})
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}