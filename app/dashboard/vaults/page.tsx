"use client"

import { useState, useEffect } from "react"
import { Lock, TrendingUp, Users, Zap, Search, Eye, Target } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useStrategyVaults } from "@/hooks/use-strategy-vaults"

const vaults = [
  {
    name: "DOT Staking Vault",
    chain: "Polkadot",
    apy: "12.5%",
    tvl: "$45.2M",
    deposited: "100 DOT",
    earned: "12.5 DOT",
    risk: "Low",
    strategy: "Native Staking + Liquid DOT",
  },
  {
    name: "Acala Yield Vault",
    chain: "Acala",
    apy: "14.3%",
    tvl: "$32.1M",
    deposited: "1000 aUSD",
    earned: "143 aUSD",
    risk: "Low",
    strategy: "aUSD Lending + Homa",
  },
  {
    name: "Hydration Farming",
    chain: "Hydration",
    apy: "18.7%",
    tvl: "$28.5M",
    deposited: "5000 HDX",
    earned: "935 HDX",
    risk: "Medium",
    strategy: "Omnipool + LM",
  },
  {
    name: "Bifrost Vault",
    chain: "Bifrost",
    apy: "15.2%",
    tvl: "$18.3M",
    deposited: "500 BNC",
    earned: "76 BNC",
    risk: "Medium",
    strategy: "vsToken + Farming",
  },
]

export default function Vaults() {
  const { strategies } = useStrategyVaults()
  const [selectedVault, setSelectedVault] = useState<number | null>(null)
  const [depositAmount, setDepositAmount] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  const allVaults = [
    ...vaults,
    ...strategies.map((s) => ({
      name: `${s.tokenName} - ${s.protocol}`,
      chain: s.protocol,
      apy: `${s.apy}%`,
      tvl: `$${(Number.parseFloat(s.apy) * 1000).toFixed(1)}K`,
      deposited: `${s.amount} ${s.tokenName.replace(" POOL", "")}`,
      earned: `${((s.amount * Number.parseFloat(s.apy) * (s.duration / 12)) / 100).toFixed(2)} ${s.tokenName.replace(" POOL", "")}`,
      risk: "Medium",
      strategy: `${s.duration}-month strategy via ${s.protocol}`,
    })),
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2">Vault</h2>
          <p className="text-muted-foreground">Secure your assets with automated yield strategies</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 h-10 rounded-[4px] hover-glow-primary">
          + New Vault
        </Button>
      </div>

      {/* Summary Stats - solid cards, Figma icons */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-solid p-6 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active Vault</p>
              <p className="text-2xl font-bold">{allVaults.length}</p>
            </div>
            <Lock className="w-8 h-8 text-primary opacity-50" />
          </div>
        </Card>
        <Card className="card-solid p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Deposited</p>
              <p className="text-2xl font-bold">$4K</p>
            </div>
            <Eye className="w-8 h-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="card-solid p-6 animate-fade-in-up delay-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Earned</p>
              <p className="text-2xl font-bold">$9K</p>
            </div>
            <TrendingUp className="w-8 h-8 text-success opacity-50" />
          </div>
        </Card>
        <Card className="card-solid p-6 animate-fade-in-up delay-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Avg. APY</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <Target className="w-8 h-8 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Search Vault + Search button + All Chains */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Vault"
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button variant="outline" size="default">Search</Button>
        <select className="px-4 py-2.5 bg-background border border-input rounded-lg text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          <option>All Chains</option>
          <option>Polkadot</option>
          <option>Acala</option>
          <option>Hydration</option>
        </select>
      </div>

      {/* Expandable sections - POLKADOT, USDC etc. with Total Stake, Avg. APY (green), Portfolio % (pink) */}
      <div className="space-y-4">
        {allVaults.reduce((acc: any[], vault, idx) => {
          const lastItem = acc[acc.length - 1]
          if (lastItem && lastItem.chain === vault.chain) {
            lastItem.vaults.push({ vault, idx })
          } else {
            acc.push({ chain: vault.chain, vaults: [{ vault, idx }] })
          }
          return acc
        }, []).map((group: any, groupIdx: number) => {
          const totalStake = group.vaults.reduce((s: number, { vault }: any) => s + Number.parseFloat(String(vault.deposited).split(" ")[0] || "0"), 0)
          const avgApy = group.vaults.length ? group.vaults.reduce((s: number, { vault }: any) => s + Number.parseFloat(String(vault.apy).replace("%", "")) || 0, 0) / group.vaults.length : 0
          const portfolioPct = 43
          return (
            <Card key={groupIdx} className="card-solid overflow-hidden animate-fade-in-up delay-300">
              <button
                onClick={() => setSelectedVault(selectedVault === groupIdx ? null : groupIdx)}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors text-left"
              >
                <h3 className="text-base font-bold uppercase">{group.chain}</h3>
                <div className="flex items-center gap-6">
                  <span className="text-xs text-muted-foreground mr-4">Total Stake<br/><span className="font-semibold text-foreground text-sm">${totalStake.toLocaleString()}</span></span>
                  <span className="text-xs text-muted-foreground mr-4">Avg. APY<br/><span className="text-success font-semibold text-sm">{avgApy.toFixed(1)}%</span></span>
                  <div className="flex flex-col gap-1 w-32">
                    <span className="text-[10px] text-muted-foreground uppercase flex justify-between">Portfolio % <span className="text-primary font-bold">{portfolioPct}%</span></span>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: mounted ? `${portfolioPct}%` : '0%' }} />
                    </div>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${selectedVault === groupIdx ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              {selectedVault === groupIdx && (
                <div className="border-t border-border p-4 bg-muted/20 space-y-2">
                  {group.vaults.map(({ vault, idx }: any) => (
                    <div key={idx} className="p-3 bg-background border border-border rounded-lg flex items-center justify-between flex-wrap gap-3 row-hover cursor-pointer transition-all">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded bg-muted" />
                        <div>
                          <p className="font-semibold text-sm">{vault.name.replace(` - ${vault.chain}`, "")}</p>
                          <div className="flex gap-8 text-xs">
                            <div className="flex flex-col gap-0.5"><span className="text-muted-foreground">APY</span> <span className="font-semibold text-[#0d9488] flex items-center gap-1">{vault.apy} <span className="text-muted-foreground/50 w-3 h-3 inline-block rounded-full border border-current text-center text-[8px] leading-3">i</span></span></div>
                            <div className="flex flex-col gap-0.5"><span className="text-muted-foreground">Liquidity Share</span> <span className="font-semibold">0.08%</span></div>
                            <div className="flex flex-col gap-0.5"><span className="text-muted-foreground">Position</span> <span className="font-semibold">{vault.deposited}</span></div>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-[4px] h-8 px-6 border-border font-semibold hover-glow-primary hover:border-primary hover:text-primary transition-all">Manage</Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Deposit/Withdraw Modal */}
      {selectedVault !== null && (
        <Card className="card-solid p-8 animate-fade-in-up">
          <h3 className="text-2xl font-bold mb-6">{allVaults[selectedVault].name}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Deposit Section */}
            <div>
              <h4 className="font-semibold mb-4">Deposit</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Amount</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="flex-1 px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50"
                    />
                    <Button variant="outline" size="sm" className="bg-transparent">
                      Max
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">You will receive</span>
                    <span className="font-semibold">
                      {depositAmount ? (Number.parseFloat(depositAmount) * 1.05).toFixed(4) : "0.00"} shares
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Est. Annual Yield</span>
                    <span className="font-semibold text-accent">
                      {depositAmount ? (Number.parseFloat(depositAmount) * 0.137).toFixed(2) : "0.00"} tokens
                    </span>
                  </div>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90 hover-glow-primary">Deposit Now</Button>
              </div>
            </div>

            {/* Withdraw Section */}
            <div>
              <h4 className="font-semibold mb-4">Withdraw</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Amount</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="0.00"
                      className="flex-1 px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50"
                    />
                    <Button variant="outline" size="sm" className="bg-transparent">
                      Max
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-card/50 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Your Shares</span>
                    <span className="font-semibold">{allVaults[selectedVault].deposited}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pending Rewards</span>
                    <span className="font-semibold text-accent">{allVaults[selectedVault].earned}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full bg-transparent">
                  Withdraw
                </Button>
              </div>
            </div>
          </div>

          {/* Claim Rewards */}
          <div className="mt-8 p-4 bg-muted/20 border border-border rounded-lg flex items-center justify-between">
            <div>
              <p className="font-semibold">Unclaimed Rewards</p>
              <p className="text-sm text-muted-foreground">{allVaults[selectedVault].earned}</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-[4px] hover-glow-primary">Claim Rewards</Button>
          </div>
        </Card>
      )}

      {/* Staking Opportunities */}
      <Card className="card-solid p-6 animate-fade-in-up delay-200">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Staking Opportunities</h3>
        </div>

        <div className="space-y-3">
          {[
            { token: "DOT", apy: "12.5%", validators: "500K+", minStake: "1 DOT" },
            { token: "aUSD", apy: "14.3%", validators: "1.2M+", minStake: "10 aUSD" },
            { token: "BNC", apy: "13.8%", validators: "800K+", minStake: "0.1 BNC" },
          ].map((stake, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all row-hover cursor-pointer"
            >
              <div>
                <p className="font-semibold">{stake.token} Staking</p>
                <p className="text-xs text-muted-foreground">Min: {stake.minStake}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-success">{stake.apy}</p>
                <p className="text-xs text-muted-foreground">{stake.validators} validators</p>
              </div>
              <Button size="sm" className="bg-primary hover:bg-primary/90 hover-glow-primary">
                Stake
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
