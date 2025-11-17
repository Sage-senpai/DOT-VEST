// FILE: app/dashboard/profile/page.tsx (REAL ACHIEVEMENTS ONLY)
"use client"

import { useState, useEffect } from "react"
import { User, Wallet, TrendingUp, Award, Calendar, Edit2, Copy, Check, GraduationCap } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useProfile } from "@/hooks/use-profile"
import { usePolkadotExtension } from "@/hooks/use-polkadot-extension"
import { useWalletBalance } from "@/hooks/use-wallet-balance"
import { useStrategyVaults } from "@/hooks/use-strategy-vaults"

export default function Profile() {
  const { profile, updateProfile } = useProfile()
  const { selectedAccount, accounts } = usePolkadotExtension()
  const { balances, totalPortfolioValue, loading: balancesLoading } = useWalletBalance()
  const { strategies, getRealStats, getDemoStrategies } = useStrategyVaults()
  
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    email: "",
  })
  const [copiedAddress, setCopiedAddress] = useState(false)

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        bio: profile.bio || "",
        email: profile.email || "",
      })
    }
  }, [profile])

  const handleSave = async () => {
    await updateProfile(formData)
    setEditing(false)
  }

  const handleCopyAddress = () => {
    if (selectedAccount) {
      navigator.clipboard.writeText(selectedAccount.address)
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    }
  }

  // Get real stats (excluding demos)
  const realStats = getRealStats()
  const demoStrategies = getDemoStrategies()

  const memberSince = profile?.created_at 
    ? new Date(profile.created_at).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })
    : 'Recently'

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold mb-2">Profile</h2>
        <p className="text-muted-foreground">Manage your account and view your DeFi journey</p>
      </div>

      <Card className="backdrop-blur-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-8 rounded-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
              {profile?.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-primary-foreground">
                  {(profile?.name || 'U').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center transition-colors">
              <Edit2 className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>

          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50"
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50"
                />
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={2}
                  className="w-full px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditing(false)}
                    className="bg-transparent"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold">{profile?.name || "Anonymous User"}</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(true)}
                    className="bg-transparent"
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </div>
                <p className="text-muted-foreground mb-3">
                  {profile?.bio || "No bio yet. Click edit to add one!"}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Member since {memberSince}
                    </span>
                  </div>
                  {profile?.email && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{profile.email}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{realStats.count}</p>
              <p className="text-xs text-muted-foreground">Active Strategies</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{realStats.avgAPY.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Avg APY</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Demo Strategies Notice */}
      {demoStrategies.length > 0 && (
        <Card className="backdrop-blur-xl bg-secondary/10 border border-secondary/30 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-secondary" />
            <div>
              <p className="text-sm font-semibold text-secondary">
                You have {demoStrategies.length} demo strateg{demoStrategies.length === 1 ? 'y' : 'ies'}
              </p>
              <p className="text-xs text-muted-foreground">
                Demo strategies are for learning only and don't count toward achievements
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-6">
          <Wallet className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Connected Wallet</h3>
        </div>

        {selectedAccount ? (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Primary Account</p>
                  <p className="font-semibold">{selectedAccount.meta?.name || "Unnamed Account"}</p>
                </div>
                <button
                  onClick={handleCopyAddress}
                  className="p-2 hover:bg-card/50 rounded-lg transition-colors"
                  title="Copy address"
                >
                  {copiedAddress ? (
                    <Check className="w-4 h-4 text-accent" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground font-mono break-all">
                {selectedAccount.address}
              </p>
            </div>

            {balancesLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading balances...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-card/50">
                  <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
                  <p className="text-2xl font-bold text-accent">
                    ${totalPortfolioValue.toFixed(2)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-card/50">
                  <p className="text-sm text-muted-foreground mb-1">Chains Connected</p>
                  <p className="text-2xl font-bold">{balances.length}</p>
                </div>
              </div>
            )}

            {balances.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Balances by Chain</p>
                {balances.map((chainBalance) => (
                  <div
                    key={chainBalance.chain}
                    className="p-3 rounded-lg bg-card/50 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-sm">{chainBalance.chain}</p>
                      <p className="text-xs text-muted-foreground">
                        {chainBalance.tokens.map(t => t.formatted).join(", ")}
                      </p>
                    </div>
                    <p className="font-semibold text-accent">
                      ${chainBalance.totalUsdValue.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {accounts && accounts.length > 1 && (
              <div className="pt-4 border-t border-border/50">
                <p className="text-sm font-medium mb-3">Other Accounts</p>
                <div className="space-y-2">
                  {accounts
                    .filter(acc => acc.address !== selectedAccount.address)
                    .map((account) => (
                      <div
                        key={account.address}
                        className="p-3 rounded-lg bg-card/50 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-sm">{account.meta?.name || "Unnamed"}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {account.address.slice(0, 10)}...{account.address.slice(-8)}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" className="bg-transparent">
                          Switch
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground mb-4">No wallet connected</p>
            <p className="text-sm text-muted-foreground mb-4">
              Use the Wallet Manager in the top navigation bar to connect your wallet
            </p>
          </div>
        )}
      </Card>

      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-semibold">Activity Summary (Real Funds Only)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Total Deposited</p>
            <p className="text-3xl font-bold">${realStats.totalDeposited.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">Across {realStats.count} vaults</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Total Earned</p>
            <p className="text-3xl font-bold text-accent">${realStats.totalEarned.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">To date</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Average APY</p>
            <p className="text-3xl font-bold text-primary">{realStats.avgAPY.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground mt-1">Portfolio average</p>
          </div>
        </div>

        {strategies.filter(s => !s.isDemo && s.status !== 'demo').length > 0 && (
          <div className="mt-6 pt-6 border-t border-border/50">
            <p className="text-sm font-medium mb-3">Recent Real Strategies</p>
            <div className="space-y-2">
              {strategies
                .filter(s => !s.isDemo && s.status !== 'demo')
                .sort((a, b) => new Date(b.executedAt || 0).getTime() - new Date(a.executedAt || 0).getTime())
                .slice(0, 3)
                .map((strategy) => (
                  <div
                    key={strategy.id}
                    className="p-3 rounded-lg bg-card/50 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {strategy.tokenName} via {strategy.protocol}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${strategy.amount.toFixed(2)} • {strategy.duration} months
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-accent">{strategy.apy}% APY</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </Card>

      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-5 h-5 text-secondary" />
          <h3 className="text-lg font-semibold">Achievements (Real Activities Only)</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "First Stake", earned: realStats.count >= 1, icon: "🎯" },
            { name: "Early Adopter", earned: profile?.created_at ? true : false, icon: "🌟" },
            { name: "Yield Master", earned: realStats.count >= 5, icon: "💎" },
            { name: "Diversified", earned: balances.length >= 3, icon: "🌈" },
            { name: "Big Player", earned: realStats.totalDeposited >= 1000, icon: "🐋" },
            { name: "Consistent", earned: realStats.count >= 3 && realStats.avgAPY > 10, icon: "⭐" },
          ].map((achievement) => (
            <div
              key={achievement.name}
              className={`p-4 rounded-lg text-center transition-all ${
                achievement.earned
                  ? "bg-primary/10 border border-primary/30"
                  : "bg-card/50 border border-border/50 opacity-50 grayscale"
              }`}
            >
              <span className="text-3xl mb-2 block">{achievement.icon}</span>
              <p className="text-xs font-medium">{achievement.name}</p>
              {!achievement.earned && (
                <p className="text-xs text-muted-foreground mt-1">Locked</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 <span className="font-medium text-accent">Note:</span> Achievements are based on real strategies only. Demo strategies don't count toward your progress.
          </p>
        </div>
      </Card>
    </div>
  )
}