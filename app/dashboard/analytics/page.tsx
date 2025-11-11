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

const performanceData = [
  { date: "Mon", yield: 120, fees: 20, net: 100 },
  { date: "Tue", yield: 150, fees: 25, net: 125 },
  { date: "Wed", yield: 180, fees: 30, net: 150 },
  { date: "Thu", yield: 160, fees: 28, net: 132 },
  { date: "Fri", yield: 200, fees: 35, net: 165 },
  { date: "Sat", yield: 220, fees: 38, net: 182 },
  { date: "Sun", yield: 240, fees: 40, net: 200 },
]

const chainPerformance = [
  { chain: "Acala", apy: 14.5, tvl: 45000 },
  { chain: "Hydration", apy: 16.8, tvl: 32000 },
  { chain: "Bifrost", apy: 13.2, tvl: 28000 },
  { chain: "Astar", apy: 12.1, tvl: 20000 },
]

export default function Analytics() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Analytics & Insights</h2>
        <p className="text-muted-foreground">Monitor your portfolio performance and market trends</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">7-Day Yield</p>
              <p className="text-2xl font-bold">$1,254</p>
            </div>
            <TrendingUp className="w-8 h-8 text-accent opacity-50" />
          </div>
        </Card>

        <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Fees Paid</p>
              <p className="text-2xl font-bold">$186</p>
            </div>
            <TrendingDown className="w-8 h-8 text-secondary opacity-50" />
          </div>
        </Card>

        <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
              <p className="text-2xl font-bold">$1,068</p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary opacity-50" />
          </div>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Weekly Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip
              contentStyle={{ backgroundColor: "rgba(20,20,40,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <Legend />
            <Area type="monotone" dataKey="yield" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
            <Area type="monotone" dataKey="fees" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Chain Performance */}
      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Performance by Chain</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chainPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="chain" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip
              contentStyle={{ backgroundColor: "rgba(20,20,40,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <Legend />
            <Bar dataKey="apy" fill="#3b82f6" name="APY %" />
            <Bar dataKey="tvl" fill="#06b6d4" name="TVL ($)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Performers */}
      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Top Performing Strategies</h3>
        <div className="space-y-3">
          {[
            { name: "Acala Lending", apy: "14.5%", tvl: "$45,000", status: "Active" },
            { name: "Hydration Staking", apy: "16.8%", tvl: "$32,000", status: "Active" },
            { name: "Bifrost Farming", apy: "13.2%", tvl: "$28,000", status: "Active" },
          ].map((strategy, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
            >
              <div>
                <p className="font-medium text-sm">{strategy.name}</p>
                <p className="text-xs text-muted-foreground">TVL: {strategy.tvl}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-accent">{strategy.apy}</p>
                <p className="text-xs text-muted-foreground">{strategy.status}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
