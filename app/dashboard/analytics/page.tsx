// FILE: app/dashboard/analytics/page.tsx (Updated)
// LOCATION: /app/dashboard/analytics/page.tsx
// ============================================
"use client"

import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useTheme } from "next-themes"
import { useStrategyVaults } from "@/hooks/use-strategy-vaults"
import { useLivePools } from "@/hooks/use-live-pools"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"

export default function Analytics() {
  const { theme } = useTheme()
  const { strategies } = useStrategyVaults()
  const { pools, loading } = useLivePools()

  // Calculate real performance data from strategies
  const performanceData = strategies.length > 0
    ? strategies.slice(-7).map((s, idx) => {
        const daysSinceExecution = Math.floor(
          (Date.now() - new Date(s.executedAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)
        )
        const dailyYield = (s.amount * parseFloat(s.apy) / 100) / 365
        
        return {
          date: new Date(s.executedAt || Date.now()).toLocaleDateString('en-US', { weekday: 'short' }),
          yield: dailyYield * daysSinceExecution,
          fees: dailyYield * 0.2, // Assume 20% fees
          net: dailyYield * daysSinceExecution * 0.8
        }
      })
    : []

  // Calculate chain performance from live pools
  const chainPerformance = [...new Set(pools.map(p => p.chain))]
    .slice(0, 6)
    .map(chain => {
      const chainPools = pools.filter(p => p.chain === chain)
      return {
        chain,
        apy: chainPools.reduce((s, p) => s + p.apy, 0) / chainPools.length,
        tvl: chainPools.reduce((s, p) => s + p.tvlUsd, 0) / 1000 // in thousands
      }
    })

  // Real metrics
  const weeklyYield = strategies.reduce((sum, s) => {
    const weeklyRate = (parseFloat(s.apy) / 100) / 52
    return sum + (s.amount * weeklyRate)
  }, 0)

  const totalFees = weeklyYield * 0.15 // Assume 15% fees
  const netProfit = weeklyYield - totalFees

  const isDark = theme === 'dark'
  
  const chartColors = {
    text: isDark ? '#ffffff' : '#1a1a1a',
    grid: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    primary: '#E6007A',
    secondary: '#06b6d4',
    accent: '#a855f7',
    tooltipBg: isDark ? '#1a1a2e' : '#ffffff',
    tooltipBorder: isDark ? 'rgba(230,0,122,0.3)' : 'rgba(0,0,0,0.1)',
  }

  if (loading && strategies.length === 0) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Analytics & Insights</h2>
        <p className="text-muted-foreground">Monitor your portfolio performance and market trends</p>
      </div>

      {/* Real Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">7-Day Yield</p>
              <p className="text-2xl font-bold">${weeklyYield.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-accent opacity-50" />
          </div>
        </Card>

        <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Fees Paid</p>
              <p className="text-2xl font-bold">${totalFees.toFixed(2)}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-secondary opacity-50" />
          </div>
        </Card>

        <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
              <p className="text-2xl font-bold">${netProfit.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary opacity-50" />
          </div>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Weekly Performance</h3>
        {performanceData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="date" stroke={chartColors.text} style={{ fontSize: '12px' }} />
              <YAxis stroke={chartColors.text} style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartColors.tooltipBg,
                  border: `1px solid ${chartColors.tooltipBorder}`,
                  borderRadius: '8px',
                  color: chartColors.text,
                }}
              />
              <Legend wrapperStyle={{ color: chartColors.text }} />
              <Area type="monotone" dataKey="yield" stackId="1" stroke={chartColors.secondary} fill={chartColors.secondary} fillOpacity={0.6} name="Yield" />
              <Area type="monotone" dataKey="fees" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Fees" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>No performance data yet. Create strategies to track your progress.</p>
          </div>
        )}
      </Card>

      {/* Chain Performance - Live Data */}
      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Performance by Chain (Live)</h3>
        {chainPerformance.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chainPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="chain" stroke={chartColors.text} style={{ fontSize: '12px' }} />
              <YAxis stroke={chartColors.text} style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartColors.tooltipBg,
                  border: `1px solid ${chartColors.tooltipBorder}`,
                  borderRadius: '8px',
                  color: chartColors.text,
                }}
              />
              <Legend wrapperStyle={{ color: chartColors.text }} />
              <Bar dataKey="apy" fill={chartColors.primary} name="APY %" radius={[8, 8, 0, 0]} />
              <Bar dataKey="tvl" fill={chartColors.secondary} name="TVL (K$)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>Loading live chain performance data...</p>
          </div>
        )}
      </Card>

      {/* Top Performers - Real Strategies */}
      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Top Performing Strategies</h3>
        <div className="space-y-3">
          {strategies.length > 0 ? (
            [...strategies]
              .sort((a, b) => parseFloat(b.apy) - parseFloat(a.apy))
              .slice(0, 3)
              .map((strategy, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{strategy.protocol} - {strategy.tokenName}</p>
                    <p className="text-xs text-muted-foreground">
                      Amount: ${strategy.amount.toFixed(2)} • Duration: {strategy.duration}mo
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-accent">{strategy.apy}%</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                </div>
              ))
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No strategies yet. Visit the aggregator to create your first one!
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}