// FILE: app/dashboard/aggregator/page.tsx (FIXED)
// LOCATION: /app/dashboard/aggregator/page.tsx
// ============================================
'use client'
import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowRightLeft, Zap, AlertCircle, CheckCircle2, TrendingUp, Shield, DollarSign, RefreshCw } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useStrategyVaults } from "@/hooks/use-strategy-vaults"
import { usePolkadotExtension } from "@/hooks/use-polkadot-extension"
import { useLivePools, useOptimalPool, usePoolCategories, LivePool } from "@/hooks/use-live-pools"

function LastUpdated({ timestamp }: { timestamp?: string }) {
  const [time, setTime] = useState('')

  useEffect(() => {
    if (timestamp) {
      setTime(new Date(timestamp).toLocaleTimeString())
    }
  }, [timestamp])

  return <p className="text-sm font-semibold">{time}</p>
}

export default function RealAggregator() {
  const router = useRouter()
  const { addStrategy } = useStrategyVaults()
  const { selectedAccount, isReady } = usePolkadotExtension()
  
  const { pools, metadata, loading, refresh, isRefreshing } = useLivePools()
  const { categories } = usePoolCategories()
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
    if (!depositAmount || !isReady) return

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
    if (!selectedPool || !depositAmount || !selectedAccount) {
      setExecutionStatus({
        type: 'error',
        message: 'Please select a pool and enter an amount'
      })
      return
    }

    setIsExecuting(true)
    setExecutionStatus({type: 'idle', message: ''})

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const strategy = {
        id: Date.now().toString(),
        tokenName: selectedPool.symbol,
        amount: parseFloat(depositAmount),
        duration: durationMonths,
        protocol: selectedPool.project,
        apy: selectedPool.apy.toString(),
        executedAt: new Date(),
        wallet_address: selectedAccount.address
      }

      addStrategy(strategy)

      setExecutionStatus({
        type: 'success',
        message: `Successfully deployed ${depositAmount} ${selectedPool.symbol} to ${selectedPool.project}`
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
            Real-time opportunities from {metadata.chains?.length || 0} Polkadot parachains
          </p>
        </div>
        <Button
          onClick={refresh}
          disabled={isRefreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Live Stats */}
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
              <LastUpdated timestamp={metadata.lastUpdated || undefined} />
            </div>
            <RefreshCw className="w-8 h-8 text-muted-foreground opacity-50" />
          </div>
        </Card>
      </div>

      {/* Status Messages */}
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

      {/* Search & Filters */}
      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search pools, protocols, or tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
            <Button 
              onClick={handleFindOptimal}
              disabled={findingOptimal || !depositAmount}
              className="bg-primary hover:bg-primary/90"
            >
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
          {filteredPools.map((pool, idx) => (
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
          ))}
        </div>
      </Card>

      {/* Strategy Builder */}
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

              <Button
                onClick={handleExecuteStrategy}
                disabled={!isReady || isExecuting || !depositAmount}
                className="w-full bg-primary hover:bg-primary/90 gap-2 disabled:opacity-50"
              >
                <ArrowRightLeft className="w-4 h-4" />
                {isExecuting ? "Executing..." : "Execute Strategy"}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Selected Pool</span>
                  <span className="font-semibold">{selectedPool.symbol} {selectedPool.project}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">APY</span>
                  <span className="font-semibold text-accent">{selectedPool.apy}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Return</span>
                  <span className="font-bold text-accent">
                    {estimatedReturn.toFixed(2)} {selectedPool.symbol}
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
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
