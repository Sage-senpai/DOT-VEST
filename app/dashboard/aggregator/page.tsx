"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowRightLeft, Zap, RotateCw, Layers, Target } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useStrategyVaults } from "@/hooks/use-strategy-vaults"

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
  const [showStrategyModal, setShowStrategyModal] = useState(false)
  const [selectedToken, setSelectedToken] = useState<number | null>(null)
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null)
  const [depositAmount, setDepositAmount] = useState("")
  const [durationMonths, setDurationMonths] = useState(1)
  const [isExecuting, setIsExecuting] = useState(false)
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
  }, []);

  const currentTokenPool = selectedToken !== null ? tokenPools[selectedToken] : null
  const availableProtocols = currentTokenPool?.protocols || []

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
    if (!selectedToken || !selectedProtocol || !depositAmount) return

    setIsExecuting(true)

    const strategy = {
      id: Date.now().toString(),
      tokenName: tokenPools[selectedToken].name,
      amount: Number.parseFloat(depositAmount),
      duration: durationMonths,
      protocol: selectedProtocol,
      apy: protocolAPYs[tokenPools[selectedToken].name][selectedProtocol].toString(),
      executedAt: new Date(),
    }

    addStrategy(strategy)

    // Redirect after a brief delay to ensure state is updated
    await new Promise((resolve) => setTimeout(resolve, 200))
    router.push("/dashboard/vaults")
  }

  const openStrategyBuilder = () => {
    setSelectedToken(null)
    setSelectedProtocol(null)
    setDepositAmount("")
    setDurationMonths(1)
    setShowStrategyModal(true)
  }

  const [riskFilter, setRiskFilter] = useState<"all" | "high" | "medium" | "low">("all")

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2">DeFi Aggregator</h2>
          <p className="text-muted-foreground">Optimize your yield across multiple pools.</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            <RotateCw className="w-4 h-4" />
            Refresh
          </button>
          <p className="text-xs text-muted-foreground">Last updated: {currentTime}</p>
        </div>
      </div>

      {/* Stats Grid - solid cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-solid p-6 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Pools</p>
              <p className="text-2xl font-bold">31</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Layers className="w-4 h-4 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="card-solid p-6 animate-fade-in-up delay-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Avg. APY</p>
              <p className="text-2xl font-bold">2.65%</p>
            </div>
            <Target className="w-8 h-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="card-solid p-6 animate-fade-in-up delay-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total TVL</p>
              <p className="text-2xl font-bold">$5.7M</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
              <span className="text-success font-bold text-lg">$</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Search + Find Optimal */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Pools"
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button onClick={openStrategyBuilder} className="bg-primary hover:bg-primary/90 text-primary-foreground hover-glow-primary">
          <Zap className="w-4 h-4 mr-2" />
          Find Optimal
        </Button>
      </div>

      {/* Risk Filter - pills, All Risk active = pink */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "high", "medium", "low"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setRiskFilter(key)}
            className={`px-6 py-2 rounded-[4px] text-sm font-medium transition-colors ${
              riskFilter === key
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {key === "all" ? "All Risk" : key === "high" ? "High Risk" : key === "medium" ? "Medium Risk" : "Low Risk"}
          </button>
        ))}
      </div>

      {/* Pool List - solid card */}
      <Card className="card-solid p-6 animate-fade-in-up delay-300">
        <div className="space-y-3">
          {tokenPools.map((pool, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg bg-muted/30 border border-border hover:border-primary/30 row-hover cursor-pointer flex items-center justify-between flex-wrap gap-4"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-base">{pool.name.replace(" POOL", "")}</h4>
                  <p className="text-xs text-muted-foreground">{pool.symbol}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-[4px] bg-[#fbcfe8] text-[#be185d] text-xs font-semibold ml-2">Polkadot</span>
                <Zap className="w-4 h-4 text-[#0d9488] ml-1" />
              </div>

              <div className="flex items-center gap-8 flex-wrap">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">APY</p>
                  <p className="font-semibold text-success">12.20%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">TVL</p>
                  <p className="font-semibold">${pool.tvl.slice(1)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground uppercase mb-1">Risk Score</p>
                  <p className="font-semibold text-primary">40/100</p>
                </div>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 h-9 rounded-[4px] font-semibold hover-glow-primary" onClick={openStrategyBuilder}>
                  Stake
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Build Your Strategy Modal - Figma: white, two columns, pink CTA */}
      {showStrategyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowStrategyModal(false)}>
          <Card className="bg-card border border-border shadow-xl p-8 w-full max-w-2xl animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
              <h3 className="text-lg font-medium">Build Your Strategy</h3>
              <button
                onClick={() => setShowStrategyModal(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded"
                aria-label="Close"
              >
                <span className="text-2xl leading-none">×</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Amount, Duration, Execute */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Amount</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 px-4 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <select className="px-4 py-2 bg-background border border-input rounded-lg text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                      <option>SOL</option>
                    </select>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">= $0 USD</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Duration</label>
                  <select
                    value={`${durationMonths} Month${durationMonths === 1 ? "" : "s"}`}
                    onChange={(e) => {
                      const monthMap: { [key: string]: number } = {
                        "1 Month": 1,
                        "3 Months": 3,
                        "6 Months": 6,
                        "1 Year": 12,
                      }
                      setDurationMonths(monthMap[e.target.value] || 1)
                    }}
                    className="w-full px-4 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option>1 Month</option>
                    <option>3 Months</option>
                    <option>6 Months</option>
                    <option>1 Year</option>
                  </select>
                </div>

                <Button
                  onClick={() => {
                    handleExecuteStrategy()
                    setShowStrategyModal(false)
                  }}
                  disabled={!depositAmount || isExecuting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 mt-4 hover-glow-primary"
                >
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  {isExecuting ? "Executing..." : "Execute Strategy"}
                </Button>
              </div>

              {/* Right: Selected Pool, Chain, APY, etc. */}
              <div className="space-y-6 pt-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Selected Pool</span>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span className="font-medium">DOTVEST</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Chain</span>
                  <span className="inline-flex px-2 py-0.5 rounded-[4px] bg-[#fbcfe8] text-[#be185d] font-semibold text-xs">Polkadot</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">APY</span>
                  <span className="font-medium text-[#0d9488]">12.14%</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Estimated Return</span>
                  <span className="font-medium text-[#0d9488]">0.000 SOL</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Risk Score</span>
                  <span className="font-medium text-primary">40/100</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">TVL</span>
                  <span className="font-medium">$2.20M</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
