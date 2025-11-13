// FILE: app/dashboard/page.tsx
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
import { TrendingUp, Wallet, Zap, Target } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useProfile } from "@/hooks/use-profile"
import { useStrategyVaults } from "@/hooks/use-strategy-vaults"
import { useEnhancedPolkadot } from "@/hooks/use-enhanced-polkadot"

const portfolioData = [
  { month: "Jan", value: 4000 },
  { month: "Feb", value: 5200 },
  { month: "Mar", value: 4800 },
  { month: "Apr", value: 6100 },
  { month: "May", value: 7200 },
  { month: "Jun", value: 8900 },
]

const colors = ["#E6007A", "#a855f7", "#06b6d4", "#8b5cf6"]

export default function Dashboard() {
  const { profile, mounted } = useProfile()
  const { strategies, mounted: strategiesMounted } = useStrategyVaults()
  const { selectedAccount } = useEnhancedPolkadot()
  const { theme } = useTheme()
  const [mounted2, setMounted2] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted2(true)
  }, [])

  const walletStrategies = selectedAccount
    ? strategies.filter((s) => s.wallet_address === selectedAccount.address)
    : strategies

  const totalStrategies = walletStrategies.length

  // === FIXED THEME-BASED COLORS ===
  const isDark = theme === 'dark'
  
  const chartColors = {
    text: isDark ? '#ffffff' : '#1a1a1a',
    grid: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    line: '#E6007A', // Always pink primary
    tooltipBg: isDark ? '#1a1a2e' : '#ffffff',
    tooltipBorder: isDark ? 'rgba(230,0,122,0.3)' : 'rgba(0,0,0,0.1)',
  }

  const assetAllocation =
    strategiesMounted && walletStrategies && walletStrategies.length > 0
      ? walletStrategies.map((strategy, idx) => ({
          name: strategy.tokenName.replace(" POOL", ""),
          value: Number(strategy.amount) || 0,
          color: colors[idx % colors.length],
        }))
      : [
          { name: "Acala (ACA)", value: 35, color: "#E6007A" },
          { name: "Hydration (HDX)", value: 25, color: "#a855f7" },
          { name: "Polkadot (DOT)", value: 20, color: "#06b6d4" },
          { name: "Other", value: 20, color: "#8b5cf6" },
        ]

  return (
    <div className="space-y-8">
      {mounted && mounted2 && profile && (
        <div className="backdrop-blur-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden flex-shrink-0">
              {profile.profileImage ? (
                <img
                  src={profile.profileImage || "/placeholder.svg"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-primary-foreground">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Welcome,{" "}
                <span className="text-foreground">{profile.name}</span>
              </h1>
              <p className="text-muted-foreground mt-2">
                Your Polkadot yield opportunities are looking stellar.
              </p>
            </div>
          </div>
        </div>
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
              <p className="text-2xl font-bold">$124,580</p>
              <p className="text-xs text-accent mt-1">+12.5% this month</p>
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
              <p className="text-2xl font-bold">$8,234</p>
              <p className="text-xs text-accent mt-1">+2.3% vs last month</p>
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
              <p className="text-xs text-secondary mt-1">All performing well</p>
            </div>
            <Zap className="w-8 h-8 text-secondary opacity-50" />
          </div>
        </Card>

        <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">APY Average</p>
              <p className="text-2xl font-bold">18.5%</p>
              <p className="text-xs text-primary mt-1">Across all positions</p>
            </div>
            <Target className="w-8 h-8 text-primary opacity-50" />
          </div>
        </Card>
      </div>

      {/* Charts with Fixed Colors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Growth */}
        <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Portfolio Growth</h3>
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
                labelStyle={{ color: chartColors.text }}
                itemStyle={{ color: chartColors.text }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={chartColors.line}
                strokeWidth={3}
                dot={{ fill: chartColors.line, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Asset Allocation */}
        <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Asset Allocation</h3>
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
                labelStyle={{ color: chartColors.text }}
                itemStyle={{ color: chartColors.text }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}