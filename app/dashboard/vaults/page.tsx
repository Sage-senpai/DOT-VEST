// FILE: app/dashboard/vaults/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Lock, TrendingUp, Users, Zap, AlertCircle, CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useStrategyVaults } from "@/hooks/use-strategy-vaults"
import { usePolkadotExtension } from "@/hooks/use-polkadot-extension"

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
    minStake: "1 DOT",
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
    minStake: "10 aUSD",
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
    minStake: "100 HDX",
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
    minStake: "10 BNC",
  },
]

export default function Vaults() {
  const { strategies } = useStrategyVaults()
  const { selectedAccount, isReady } = usePolkadotExtension()
  const [selectedVault, setSelectedVault] = useState<number | null>(null)
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isStaking, setIsStaking] = useState(false)
  const [stakingStatus, setStakingStatus] = useState<{type: 'idle' | 'success' | 'error', message: string}>({
    type: 'idle',
    message: ''
  })

  // Import the integration hook at the top
  // import { usePoolVaultIntegration } from "@/hooks/use-pool-vault-integration"
  // const { getVaultPositions } = usePoolVaultIntegration()
  // const poolVaults = getVaultPositions()

  const allVaults = [
    ...vaults,
    ...strategies.map((s) => ({
      name: `${s.tokenName} - ${s.protocol}`,
      chain: s.protocol,
      apy: `${s.apy}%`,
      tvl: `${(Number.parseFloat(s.apy) * 1000).toFixed(1)}K`,
      deposited: `${s.amount} ${s.tokenName.replace(" POOL", "")}`,
      earned: `${((s.amount * Number.parseFloat(s.apy) * (s.duration / 12)) / 100).toFixed(2)} ${s.tokenName.replace(" POOL", "")}`,
      risk: s.duration <= 3 ? "Low" : "Medium",
      strategy: `${s.duration}-month strategy via ${s.protocol}`,
      minStake: "0.1",
      isFromPool: true, // Mark as coming from pool
      executedAt: s.executedAt,
    })),
  ]

  const handleStake = async () => {
    if (!selectedAccount || !depositAmount || !selectedVault) {
      setStakingStatus({type: 'error', message: 'Please connect wallet and enter amount'})
      return
    }

    const amount = parseFloat(depositAmount)
    const vault = allVaults[selectedVault]
    const minStake = parseFloat(vault.minStake || "0")

    if (amount < minStake) {
      setStakingStatus({
        type: 'error', 
        message: `Minimum stake is ${vault.minStake}`
      })
      return
    }

    setIsStaking(true)
    setStakingStatus({type: 'idle', message: ''})

    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setStakingStatus({
        type: 'success',
        message: `Successfully staked ${depositAmount} in ${vault.name}`
      })
      setDepositAmount("")
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setStakingStatus({type: 'idle', message: ''})
      }, 5000)
    } catch (error) {
      setStakingStatus({
        type: 'error',
        message: 'Staking failed. Please try again.'
      })
    } finally {
      setIsStaking(false)
    }
  }

  const handleWithdraw = async () => {
    if (!selectedAccount || !withdrawAmount) {
      setStakingStatus({type: 'error', message: 'Please enter withdrawal amount'})
      return
    }

    setIsStaking(true)
    setStakingStatus({type: 'idle', message: ''})

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setStakingStatus({
        type: 'success',
        message: `Successfully withdrew ${withdrawAmount}`
      })
      setWithdrawAmount("")
      
      setTimeout(() => {
        setStakingStatus({type: 'idle', message: ''})
      }, 5000)
    } catch (error) {
      setStakingStatus({
        type: 'error',
        message: 'Withdrawal failed. Please try again.'
      })
    } finally {
      setIsStaking(false)
    }
  }

  const handleClaimRewards = async () => {
    if (!selectedAccount || selectedVault === null) return

    setIsStaking(true)
    setStakingStatus({type: 'idle', message: ''})

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setStakingStatus({
        type: 'success',
        message: `Successfully claimed ${allVaults[selectedVault].earned}`
      })
      
      setTimeout(() => {
        setStakingStatus({type: 'idle', message: ''})
      }, 5000)
    } catch (error) {
      setStakingStatus({
        type: 'error',
        message: 'Claim failed. Please try again.'
      })
    } finally {
      setIsStaking(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Vaults & Staking</h2>
        <p className="text-muted-foreground">Deposit into optimized vaults and earn passive yield</p>
      </div>

      {/* Wallet Connection Alert */}
      {!isReady && (
        <Card className="backdrop-blur-xl bg-destructive/10 border border-destructive/50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-sm text-destructive">
              Please connect your Polkadot wallet to stake and manage vaults
            </p>
          </div>
        </Card>
      )}

      {/* Status Messages */}
      {stakingStatus.type !== 'idle' && (
        <Card className={`backdrop-blur-xl border p-4 rounded-lg ${
          stakingStatus.type === 'success' 
            ? 'bg-accent/10 border-accent/50' 
            : 'bg-destructive/10 border-destructive/50'
        }`}>
          <div className="flex items-center gap-3">
            {stakingStatus.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-accent" />
            ) : (
              <AlertCircle className="w-5 h-5 text-destructive" />
            )}
            <p className={`text-sm ${
              stakingStatus.type === 'success' ? 'text-accent' : 'text-destructive'
            }`}>
              {stakingStatus.message}
            </p>
          </div>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Deposited</p>
              <p className="text-2xl font-bold">$156,234</p>
            </div>
            <Lock className="w-8 h-8 text-primary opacity-50" />
          </div>
        </Card>

        <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Earned</p>
              <p className="text-2xl font-bold">$18,456</p>
            </div>
            <TrendingUp className="w-8 h-8 text-accent opacity-50" />
          </div>
        </Card>

        <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Avg APY</p>
              <p className="text-2xl font-bold">13.7%</p>
            </div>
            <Zap className="w-8 h-8 text-secondary opacity-50" />
          </div>
        </Card>
      </div>

      {/* Vaults Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {allVaults.map((vault, idx) => (
          <Card
            key={idx}
            onClick={() => setSelectedVault(idx)}
            className={`backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg cursor-pointer transition-all ${
              selectedVault === idx ? "ring-2 ring-primary" : "hover:border-primary/50"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{vault.name}</h3>
                <p className="text-sm text-muted-foreground">{vault.chain}</p>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  vault.risk === "Low" ? "bg-accent/20 text-accent" : "bg-secondary/20 text-secondary"
                }`}
              >
                {vault.risk} Risk
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">APY</p>
                <p className="text-xl font-bold text-accent">{vault.apy}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">TVL</p>
                <p className="text-xl font-bold">{vault.tvl}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Your Deposit</p>
                <p className="text-lg font-semibold">{vault.deposited}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Earned</p>
                <p className="text-lg font-semibold text-accent">{vault.earned}</p>
              </div>
            </div>

            <div className="p-3 bg-card/50 rounded-lg mb-4">
              <p className="text-xs text-muted-foreground mb-1">Strategy</p>
              <p className="text-sm font-medium">{vault.strategy}</p>
            </div>

            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-sm"
              disabled={!isReady}
            >
              {selectedVault === idx ? "Manage Vault" : "View Details"}
            </Button>
          </Card>
        ))}
      </div>

      {/* Deposit/Withdraw Modal */}
      {selectedVault !== null && (
        <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-8 rounded-lg">
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
                      placeholder={`Min: ${allVaults[selectedVault].minStake || "0.1"}`}
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      disabled={!isReady || isStaking}
                      className="flex-1 px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50 disabled:opacity-50"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-transparent"
                      disabled={!isReady || isStaking}
                      onClick={() => setDepositAmount("100")}
                    >
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
                      {depositAmount ? (Number.parseFloat(depositAmount) * (parseFloat(allVaults[selectedVault].apy) / 100)).toFixed(2) : "0.00"} tokens
                    </span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={handleStake}
                  disabled={!isReady || isStaking || !depositAmount}
                >
                  {isStaking ? "Processing..." : "Stake Now"}
                </Button>
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
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      disabled={!isReady || isStaking}
                      className="flex-1 px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50 disabled:opacity-50"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-transparent"
                      disabled={!isReady || isStaking}
                      onClick={() => setWithdrawAmount(allVaults[selectedVault].deposited.split(" ")[0])}
                    >
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

                <Button 
                  variant="outline" 
                  className="w-full bg-transparent"
                  onClick={handleWithdraw}
                  disabled={!isReady || isStaking || !withdrawAmount}
                >
                  {isStaking ? "Processing..." : "Withdraw"}
                </Button>
              </div>
            </div>
          </div>

          {/* Claim Rewards */}
          <div className="mt-8 p-4 bg-accent/10 border border-accent/30 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-semibold">Unclaimed Rewards</p>
              <p className="text-sm text-muted-foreground">{allVaults[selectedVault].earned}</p>
            </div>
            <Button 
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleClaimRewards}
              disabled={!isReady || isStaking}
            >
              {isStaking ? "Claiming..." : "Claim Rewards"}
            </Button>
          </div>
        </Card>
      )}

      {/* Staking Opportunities */}
      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
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
              className="flex items-center justify-between p-4 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
            >
              <div>
                <p className="font-semibold">{stake.token} Staking</p>
                <p className="text-xs text-muted-foreground">Min: {stake.minStake}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-accent">{stake.apy}</p>
                <p className="text-xs text-muted-foreground">{stake.validators} validators</p>
              </div>
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90"
                disabled={!isReady}
              >
                Stake
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}