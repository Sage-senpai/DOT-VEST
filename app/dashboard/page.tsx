"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from "recharts"
import { TrendingUp, Zap, Target } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useProfile } from "@/hooks/use-profile"
import { useStrategyVaults } from "@/hooks/use-strategy-vaults"

const portfolioData = [
  { month: "Mon", value: 5000 },
  { month: "Tue", value: 8000 },
  { month: "Wed", value: 12000 },
  { month: "Thu", value: 15000 },
  { month: "Fri", value: 18000 },
  { month: "Sat", value: 22000 },
  { month: "Sun", value: 30000 },
]

export default function Dashboard() {
  const { profile, mounted } = useProfile()
  const { strategies, mounted: strategiesMounted } = useStrategyVaults()
  const [mounted2, setMounted2] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted2(true)
  }, [])

  const assetAllocation = [
    { name: "Polkadot", symbol: "DOT", value: 42, color: "#e6007a" },
    { name: "Acala Dollar", symbol: "aUSD", value: 11, color: "#f59e0b" },
    { name: "USDC", symbol: "USDC", value: 22, color: "#38bdf8" },
    { name: "USDT", symbol: "USDT", value: 25, color: "#2dd4bf" },
  ]
  const focusedAsset = assetAllocation[2]

  return (
    <div className="space-y-8">
      {mounted && mounted2 && profile && (
        <div>
          <h1 className="text-3xl font-bold mb-1">
            GM, <span className="text-primary">{profile.name}</span>
          </h1>
        </div>
      )}

      {/* Stats Grid - solid cards per Figma */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          onClick={() => router.push("/dashboard/vaults")}
          className="card-solid p-6 cursor-pointer animate-fade-in-up hover:-translate-y-1 transition-transform duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Wallet Balance</p>
              <p className="text-2xl font-bold">$9k</p>
              <p className="text-xs mt-1 text-primary">
                0 positions
              </p>
            </div>
            <div className="p-2 border-2 border-primary rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary rotate-12"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
            </div>
          </div>
        </Card>

        <Card
          onClick={() => router.push("/dashboard/analytics")}
          className="card-solid p-6 cursor-pointer animate-fade-in-up delay-100 hover:-translate-y-1 transition-transform duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-foreground">$9k</p>
              <p className="text-xs text-success mt-1">Start Earning</p>
            </div>
            <TrendingUp className="w-8 h-8 text-success" />
          </div>
        </Card>

        <Card
          onClick={() => router.push("/dashboard/aggregator")}
          className="card-solid p-6 cursor-pointer animate-fade-in-up delay-200 hover:-translate-y-1 transition-transform duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active Strategy</p>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-[#38bdf8] mt-1">Create your First</p>
            </div>
            <Zap className="w-8 h-8 text-[#38bdf8]" fill="currentColor" fillOpacity={0.2} />
          </div>
        </Card>
      </div>

      {/* Charts - solid cards, light-mode friendly */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Growth */}
        <Card className="card-solid p-6 lg:col-span-2 animate-fade-in-up delay-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Portfolio Growth</h3>
            <span className="text-sm text-muted-foreground">Daily</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={portfolioData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e6007a" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#e6007a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-muted-foreground text-xs" tick={{ fill: "currentColor" }} />
              <YAxis axisLine={false} tickLine={false} className="text-muted-foreground text-xs" tick={{ fill: "currentColor" }} tickFormatter={(value) => `$${value/1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                cursor={{ stroke: '#e6007a', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Area type="monotone" dataKey="value" stroke="#e6007a" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" dot={false} activeDot={{ r: 6, fill: "#e6007a" }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card onClick={() => router.push("/dashboard/vaults")} className="card-solid p-6 cursor-pointer animate-fade-in-up delay-200 hover:-translate-y-1 transition-transform duration-300">
          <h3 className="text-lg font-semibold mb-4">Asset Allocation</h3>
          {assetAllocation.length > 0 ? (
            <>
              <div className="relative h-52 flex items-center justify-center mb-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={assetAllocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      label={false}
                      cornerRadius={10}
                      stroke="none"
                    >
                      {assetAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: focusedAsset.color }}></span>
                    {focusedAsset.symbol}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-light">$1980</p>
                    <p className="text-sm text-foreground/80">(22%)</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-y-4 gap-x-2 pt-6 border-t border-border mt-2">
                {assetAllocation.map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <p className="text-sm text-foreground">{item.name}</p>
                    </div>
                    <p className="text-base font-semibold pl-4">{item.value}%</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <p>No assets allocated yet</p>
            </div>
          )}
        </Card>
      </div>

      {/* Ask Dottiee - Dottiee in pink per Figma */}
      <Card className="card-solid p-6 animate-fade-in-up delay-300">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">
              Ask <span className="text-primary">Dottiee</span>
            </h3>
            <p className="text-sm text-muted-foreground">Get personalized yield optimization recommendations powered by AI</p>
          </div>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover-glow-primary hover:bg-primary/90 transition-all duration-300">
            Ask
          </button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="card-solid p-6 animate-fade-in-up delay-300">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {strategiesMounted && strategies && strategies.length > 0
            ? strategies.slice(-3).map((strategy, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">
                      Executed {strategy.amount} {strategy.tokenName} strategy
                    </p>
                    <p className="text-xs text-muted-foreground">{strategy.protocol}</p>
                  </div>
                  <p className="text-xs text-success">{strategy.apy}% APY</p>
                </div>
              ))
            : [
                { action: "Staked 100 DOT", chain: "Acala", time: "2 hours ago" },
                { action: "Claimed rewards", chain: "Hydration", time: "5 hours ago" },
                { action: "Rebalanced portfolio", chain: "Polkadot", time: "1 day ago" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.chain}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              ))}
        </div>
      </Card>
    </div>
  )
}
