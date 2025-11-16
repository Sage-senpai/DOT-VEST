// FILE: app/dashboard/page.tsx (WITH UNIFIED STATE)
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Wallet, Zap, Target, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useProfile } from "@/hooks/use-profile"
import { useDashboardState } from "@/hooks/use-dashboard-state"

const colors = ["#E6007A", "#a855f7", "#06b6d4", "#8b5cf6"]

export default function Dashboard() {
  const { profile, mounted } = useProfile()
  const { 
    isWalletConnected,
    walletAddress,
    totalPortfolioValue,
    totalStrategies,
    totalVaults,
    totalEarnings,
    avgAPY,
    strategies,
    vaults,
    isLoading
  } = useDashboardState()
  
  const { theme } = useTheme()
  const [mounted2, setMounted2] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted2(true)
  }, [])

  // Calculate portfolio growth data from real strategies
  const portfolioData = strategies.length > 0 
    ? strategies.slice(-6).map((s, idx) => ({
        month: new Date(s.executedAt).toLocaleDateString('en-US', { month: 'short' }),
        value: strategies
          .slice(0, idx + 1)
          .reduce((sum, strat) => sum + (strat.amount * (1 + parseFloat(strat.apy) / 100)), 0)
      }))
    : []

  // Asset allocation from strategies
  const assetAllocation = strategies.length > 0
    ? strategies.map((strategy, idx) => ({
        name: strategy.tokenName.replace(" POOL", ""),
        value: Number(strategy.amount) || 0,
        color: colors[idx % colors.length],
      }))
    : []

  const isDark = theme === 'dark'
  
  const chartColors = {
    text: isDark ? '#ffffff' : '#1a1a1a',
    grid: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    line: '#E6007A',
    tooltipBg: isDark ? '#1a1a2e' : '#ffffff',
    tooltipBorder: isDark ? 'rgba(230,0,122,0.3)' : 'rgba(0,0,0,0.1)',
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {mounted && mounted2 && profile && (
        <div className="backdrop-blur-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden flex-shrink-0">
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-primary-foreground">
                  {(profile?.name ?? "DotVester").charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Welcome,{" "}
                <span className="text-foreground">{profile.name}</span>
              </h1>
              <p className="text-muted-foreground mt-2">
                {isWalletConnected 
                  ? `Your Polkadot yield opportunities are looking stellar.`
                  : `Connect your wallet to start earning yield.`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Connection Alert */}
      {!isWalletConnected && (
        <Card className="backdrop-blur-xl bg-primary/10 border border-primary/50 p-6 rounded-lg">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground mb-4">
                Connect your Polkadot wallet to view your real portfolio data and start earning yields.
              </p>
              <Button 
                onClick={() => router.push('/connect-wallet')}
                className="bg-primary hover:bg-primary/90"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          onClick={() => router.push("/dashboard/vaults")}
          className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Portfolio</p>
              <p className="text-2xl font-bold">
                ${totalPortfolioValue.toFixed(2)}
              </p>
              <p className="text-xs text-accent mt-1">
                {isWalletConnected ? `${totalStrategies + totalVaults} positions` : "Connect wallet"}
              </p>
            </div>
            <Wallet className="w-8 h-8 text-primary opacity-50" />
          </div>
        </Card>

        <Card
          onClick={() => router.push("/dashboard/analytics")}
          className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Yield</p>
              <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
              <p className="text-xs text-accent mt-1">
                {strategies.length > 0 ? "Earned to date" : "Start earning"}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-accent opacity-50" />
          </div>
        </Card>

        <Card
          onClick={() => router.push("/dashboard/aggregator")}
          className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active Strategies</p>
              <p className="text-2xl font-bold">{totalStrategies}</p>
              <p className="text-xs text-secondary mt-1">
                {totalStrategies > 0 ? "All performing well" : "Create your first"}
              </p>
            </div>
            <Zap className="w-8 h-8 text-secondary opacity-50" />
          </div>
        </Card>

        <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">APY Average</p>
              <p className="text-2xl font-bold">{avgAPY.toFixed(1)}%</p>
              <p className="text-xs text-primary mt-1">
                {strategies.length > 0 ? "Across all positions" : "Market average"}
              </p>
            </div>
            <Target className="w-8 h-8 text-primary opacity-50" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Growth */}
        <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Portfolio Growth</h3>
          {portfolioData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={portfolioData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis 
                  dataKey="month" 
                  stroke={chartColors.text}
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke={chartColors.text}
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.tooltipBg,
                    border: `1px solid ${chartColors.tooltipBorder}`,
                    borderRadius: '8px',
                    color: chartColors.text,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={chartColors.line}
                  strokeWidth={3}
                  dot={{ fill: chartColors.line, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="mb-2">No portfolio data yet</p>
                <p className="text-sm">Create strategies to see your growth</p>
              </div>
            </div>
          )}
        </Card>

        {/* Asset Allocation */}
        <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Asset Allocation</h3>
          {assetAllocation.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assetAllocation}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => entry.name}
                  labelLine={{ stroke: chartColors.text }}
                >
                  {assetAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.tooltipBg,
                    border: `1px solid ${chartColors.tooltipBorder}`,
                    borderRadius: '8px',
                    color: chartColors.text,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="mb-2">No assets yet</p>
                <p className="text-sm">Deposit into vaults to diversify</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Activity */}
      {strategies.length > 0 && (
        <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {strategies.slice(0, 5).map((strategy) => (
              <div
                key={strategy.id}
                className="flex items-center justify-between p-3 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">
                    {strategy.tokenName} via {strategy.protocol}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${strategy.amount.toFixed(2)} • {strategy.duration} months • {strategy.status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-accent">{strategy.apy}% APY</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(strategy.executedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}