// FILE: app/dashboard/aggregator/page.tsx
"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowRightLeft, Zap, AlertCircle, CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useStrategyVaults } from "@/hooks/use-strategy-vaults"
import { usePolkadotExtension } from "@/hooks/use-polkadot-extension"
import { AIComingSoon } from "@/components/ui/ai-coming-soon"

const tokenPools = [
  { name: "DOT POOL", symbol: "DOT", tvl: "$245M", risk: "Low", protocols: ["Bifrost", "Hydration", "Astar"] },
  { name: "USDC POOL", symbol: "USDC", tvl: "$182M", risk: "Low", protocols: ["Hydration", "Astar", "Moonbeam"] },
  { name: "USDT POOL", symbol: "USDT", tvl: "$156M", risk: "Low", protocols: ["Acala", "Astar", "Moonbeam"] },
  { name: "aUSD POOL", symbol: "aUSD", tvl: "$98M", risk: "Low", protocols: ["Acala", "Bifrost"] },
  { name: "HDX POOL", symbol: "HDX", tvl: "$67M", risk: "Medium", protocols: ["Hydration", "Astar"] },
  { name: "BNC POOL", symbol: "BNC", tvl: "$43M", risk: "Medium", protocols: ["Bifrost", "Acala"] },
]

const protocolAPYs: { [key: string]: { [key: string]: number } } = {
  "DOT POOL": { Bifrost: 12.5, Hydration: 14.2, Astar: 11.8 },
  "USDC POOL": { Hydration: 8.3, Astar: 7.5, Moonbeam: 6.9 },
  "USDT POOL": { Acala: 9.2, Astar: 8.1, Moonbeam: 7.4 },
  "aUSD POOL": { Acala: 14.3, Bifrost: 13.1 },
  "HDX POOL": { Hydration: 18.7, Astar: 16.2 },
  "BNC POOL": { Bifrost: 15.2, Acala: 14.8 },
}

const calculateReturn = (depositAmount: number, durationMonths: number, apyPercent: number) => {
  if (!depositAmount || depositAmount <= 0) return 0
  const apyDecimal = apyPercent / 100
  const durationYears = durationMonths / 12
  const totalReturn = depositAmount * (Math.pow(1 + apyDecimal, durationYears) - 1)
  return totalReturn
}

export default function Aggregator() {
  const router = useRouter()
  const { addStrategy } = useStrategyVaults()
  const { selectedAccount, isReady } = usePolkadotExtension()
  const [selectedToken, setSelectedToken] = useState<number | null>(null)
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null)
  const [depositAmount, setDepositAmount] = useState("")
  const [durationMonths, setDurationMonths] = useState(1)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionStatus, setExecutionStatus] = useState<{type: 'idle' | 'success' | 'error', message: string}>({
    type: 'idle',
    message: ''
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [showAISection, setShowAISection] = useState(false)

  const currentTokenPool = selectedToken !== null ? tokenPools[selectedToken] : null
  const availableProtocols = currentTokenPool?.protocols || []

  const filteredPools = useMemo(() => {
    if (!searchQuery) return tokenPools
    return tokenPools.filter(pool => 
      pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pool.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const estimatedReturn = useMemo(() => {
    if (selectedToken === null || !selectedProtocol) return 0
    const poolName = tokenPools[selectedToken].name
    const apy = protocolAPYs[poolName]?.[selectedProtocol] || 0
    const amount = Number.parseFloat(depositAmount) || 0
    return calculateReturn(amount, durationMonths, apy)
  }, [selectedToken, selectedProtocol, depositAmount, durationMonths])

  const handleDurationChange = (duration: string) => {
    const monthMap: { [key: string]: number } = {
      "1 Month": 1,
      "3 Months": 3,
      "6 Months": 6,
      "1 Year": 12,
    }
    setDurationMonths(monthMap[duration] || 1)
  }

  const handleExecuteStrategy = async () => {
    if (!selectedToken || !selectedProtocol || !depositAmount) {
      setExecutionStatus({
        type: 'error',
        message: 'Please select a pool, protocol, and enter an amount'
      })
      return
    }

    if (!isReady) {
      setExecutionStatus({
        type: 'error',
        message: 'Please connect your Polkadot wallet first'
      })
      return
    }

    setIsExecuting(true)
    setExecutionStatus({type: 'idle', message: ''})

    try {
      // Simulate blockchain transaction
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const strategy = {
        id: Date.now().toString(),
        tokenName: tokenPools[selectedToken].name,
        amount: Number.parseFloat(depositAmount),
        duration: durationMonths,
        protocol: selectedProtocol,
        apy: protocolAPYs[tokenPools[selectedToken].name][selectedProtocol].toString(),
        executedAt: new Date().toISOString(),
      }

      addStrategy(strategy)

      setExecutionStatus({
        type: 'success',
        message: `Successfully deployed strategy to ${selectedProtocol}! Redirecting to vaults...`
      })

      // Redirect after showing success message
      setTimeout(() => {
        router.push("/dashboard/vaults")
      }, 2000)
    } catch (error) {
      setExecutionStatus({
        type: 'error',
        message: 'Strategy execution failed. Please try again.'
      })
      setIsExecuting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">POOL AGGREGATOR</h2>
        <p className="text-muted-foreground">Select a token pool and optimize your yield strategy</p>
      </div>

      {/* Wallet Connection Alert */}
      {!isReady && (
        <Card className="backdrop-blur-xl bg-destructive/10 border border-destructive/50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-sm text-destructive">
              Please connect your Polkadot wallet to execute strategies
            </p>
          </div>
        </Card>
      )}

      {/* Execution Status */}
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

      {/* Search & Filter */}
      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => setShowAISection(!showAISection)}
          >
            <Zap className="w-4 h-4 mr-2" />
            AI Recommendation
          </Button>
        </div>

        <div className="space-y-3">
          {filteredPools.map((pool, idx) => {
            const originalIdx = tokenPools.findIndex(p => p.name === pool.name)
            return (
              <div
                key={originalIdx}
                onClick={() => {
                  setSelectedToken(originalIdx)
                  setSelectedProtocol(null)
                  setDepositAmount("")
                  setExecutionStatus({type: 'idle', message: ''})
                }}
                className={`p-4 rounded-lg cursor-pointer transition-all border flex items-center justify-between ${
                  selectedToken === originalIdx
                    ? "bg-primary/20 border-primary backdrop-blur-xl"
                    : "bg-card/50 border-border/50 hover:border-primary/50 backdrop-blur-xl hover:bg-card/60"
                }`}
              >
                <div className="flex items-center gap-6 flex-1">
                  <div className="min-w-fit">
                    <h4 className="font-semibold text-base">{pool.name}</h4>
                    <p className="text-xs text-muted-foreground">{pool.symbol}</p>
                  </div>
                  <div className="flex items-center gap-8 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">TVL</span>
                      <span className="font-semibold text-sm">{pool.tvl}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">RISK</span>
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium ${
                          pool.risk === "Low" ? "bg-accent/20 text-accent" : "bg-secondary/20 text-secondary"
                        }`}
                      >
                        {pool.risk}
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowRightLeft className="w-5 h-5 text-muted-foreground" />
              </div>
            )
          })}
        </div>
      </Card>

      {/* AI Section */}
      {showAISection && (
        <AIComingSoon />
      )}

      {selectedToken !== null && (
        <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Build Your Strategy</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Strategy Pool (Protocol)</label>
              <select
                value={selectedProtocol || ""}
                onChange={(e) => setSelectedProtocol(e.target.value)}
                className="w-full px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50"
              >
                <option value="">Select a protocol...</option>
                {availableProtocols.map((protocol) => (
                  <option key={protocol} value={protocol}>
                    {protocol} - {protocolAPYs[tokenPools[selectedToken].name][protocol]}% APY
                  </option>
                ))}
              </select>
            </div>

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
                <select className="px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50">
                  <option>{tokenPools[selectedToken].symbol}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Strategy Duration</label>
              <select
                onChange={(e) => handleDurationChange(e.target.value)}
                className="w-full px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50"
              >
                <option>1 Month</option>
                <option>3 Months</option>
                <option>6 Months</option>
                <option>1 Year</option>
              </select>
            </div>

            <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <p className="text-sm mb-2">
                <span className="font-semibold">Estimated Return:</span>{" "}
                <span className="text-primary font-bold">${estimatedReturn.toFixed(2)}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {depositAmount && selectedProtocol
                  ? `Based on ${protocolAPYs[tokenPools[selectedToken].name][selectedProtocol]}% APY over ${durationMonths} month${durationMonths !== 1 ? "s" : ""}`
                  : "Select protocol and enter amount to calculate"}
              </p>
            </div>

            <Button
              onClick={handleExecuteStrategy}
              disabled={!selectedProtocol || !depositAmount || isExecuting || !isReady}
              className="w-full bg-primary hover:bg-primary/90 gap-2 disabled:opacity-50"
            >
              <ArrowRightLeft className="w-4 h-4" />
              {isExecuting ? "Executing..." : "Execute Strategy"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}