//app/dashboard/page.tsx
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
import { TrendingUp, Wallet, Zap, Target, AlertCircle, Maximize2, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useProfile } from "@/hooks/use-profile"
import { useDashboardState } from "@/hooks/use-dashboard-state"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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
    isLoading,
    overviewStats,
    allWalletAddresses
  } = useDashboardState()
  
  const { theme } = useTheme()
  const [mounted2, setMounted2] = useState(false)
  const [showChartModal, setShowChartModal] = useState(false)
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

  // Asset allocation from strategies with proper distribution
  const assetAllocation = strategies.length > 0
    ? strategies.reduce((acc: any[], strategy, idx) => {
        const existing = acc.find(item => item.name === strategy.tokenName.replace(" POOL", ""))
        if (existing) {
          existing.value += strategy.amount
        } else {
          acc.push({
            name: strategy.tokenName.replace(" POOL", ""),
            value: strategy.amount,
            color: colors[acc.length % colors.length],
          })
        }
        return acc
      }, [])
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

  const AssetAllocationChart = ({ fullscreen = false }: { fullscreen?: boolean }) => (
    <div className={fullscreen ? "h-[600px]" : "h-[300px]"}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={assetAllocation}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={fullscreen ? 200 : 100}
            label={(entry) => `${entry.name}: $${entry.value.toFixed(2)}`}
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
            formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Value']}
          />
        </PieChart>
      </ResponsiveContainer>
      {fullscreen && assetAllocation.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          {assetAllocation.map((asset, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-card/50 border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: asset.color }} />
                <span className="font-semibold">{asset.name}</span>
              </div>
              <p className="text-2xl font-bold">${asset.value.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                {((asset.value / totalPortfolioValue) * 100).toFixed(1)}% of portfolio
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )

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

            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Welcome,{" "}
                <span className="text-foreground">{profile.name}</span>
              </h1>
              <p className="text-muted-foreground mt-2">
                {isWalletConnected 
                  ? `Managing ${allWalletAddresses.length} wallet${allWalletAddresses.length !== 1 ? 's' : ''} with ${totalStrategies} active positions`
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

      {/* Multi-Wallet Overview */}
      {allWalletAddresses.length > 1 && (
        <Card className="backdrop-blur-xl bg-accent/10 border border-accent/30 p-6 rounded-lg">
          <h3 className="font-semibold text-lg mb-4">Portfolio Overview (All Wallets)</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div>
    <p className="text-sm text-muted-foreground">Total Value</p>
    <p className="text-2xl font-bold">
      ${overviewStats().totalAcrossAllWallets.toFixed(2)}
    </p>
  </div>
  <div>
    <p className="text-sm text-muted-foreground">Total Strategies</p>
    <p className="text-2xl font-bold">
      {overviewStats().totalStrategiesAllWallets}
    </p>
  </div>
  <div>
    <p className="text-sm text-muted-foreground">Active Wallets</p>
    <p className="text-2xl font-bold">{allWalletAddresses.length}</p>
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
              <p className="text-sm text-muted-foreground mb-1">Current Wallet</p>
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
              <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
              <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
              <p className="text-xs text-accent mt-1">
                {strategies.length > 0 ? "From active positions" : "Start earning"}
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
              <p className="text-sm text-muted-foreground mb-1">Avg APY</p>
              <p className="text-2xl font-bold">{avgAPY.toFixed(1)}%</p>
              <p className="text-xs text-primary mt-1">
                {strategies.length > 0 ? "Portfolio weighted" : "Market average"}
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

        {/* Asset Allocation with Expand Button */}
        <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Asset Allocation</h3>
            {assetAllocation.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowChartModal(true)}
                className="flex items-center gap-2"
              >
                <Maximize2 className="w-4 h-4" />
                Expand
              </Button>
            )}
          </div>
          {assetAllocation.length > 0 ? (
            <AssetAllocationChart />
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

      {/* Expanded Chart Modal */}
      <Dialog open={showChartModal} onOpenChange={setShowChartModal}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Asset Allocation - Detailed View</DialogTitle>
          </DialogHeader>
          <AssetAllocationChart fullscreen />
        </DialogContent>
      </Dialog>

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