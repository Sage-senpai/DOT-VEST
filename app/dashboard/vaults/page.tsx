// FILE: app/dashboard/vaults/page.tsx (FIXED - Shows Total Deposits)
"use client"

import { useState, useEffect } from 'react'
import { Lock, TrendingUp, Clock, Shield, Plus, Search, Filter, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useDashboardState } from '@/hooks/use-dashboard-state'

interface Vault {
  id: string
  name: string
  deposited: number
  earned: number
  apy: number
  chain: string
  status: 'active' | 'paused'
  wallet_address: string
  isDemo?: boolean
}

export default function VaultsPage() {
  const { vaults, isWalletConnected, walletAddress, addVault, refreshData } = useDashboardState()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterChain, setFilterChain] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  // Demo vaults for non-connected users
  const demoVaults: Vault[] = [
    {
      id: 'demo-1',
      name: 'DOT Staking Vault',
      deposited: 1000,
      earned: 125,
      apy: 12.5,
      chain: 'Polkadot',
      status: 'active',
      wallet_address: 'demo',
      isDemo: true
    },
    {
      id: 'demo-2',
      name: 'ACA Liquid Staking',
      deposited: 5000,
      earned: 450,
      apy: 9.0,
      chain: 'Acala',
      status: 'active',
      wallet_address: 'demo',
      isDemo: true
    }
  ]

  const displayVaults = isWalletConnected ? vaults : demoVaults
  const chains = ['all', ...new Set(displayVaults.map(v => v.chain))]

  const filteredVaults = displayVaults.filter(vault => {
    const matchesSearch = vault.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesChain = filterChain === 'all' || vault.chain === filterChain
    return matchesSearch && matchesChain
  })

  // Calculate totals
  const totalDeposited = displayVaults.reduce((sum, v) => sum + v.deposited, 0)
  const totalEarned = displayVaults.reduce((sum, v) => sum + v.earned, 0)
  const avgAPY = displayVaults.length > 0
    ? displayVaults.reduce((sum, v) => sum + v.apy, 0) / displayVaults.length
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Vaults
          </h1>
          <p className="text-muted-foreground mt-1">
            {isWalletConnected 
              ? 'Secure your assets with automated yield strategies'
              : '(Demo Mode - Connect wallet to access real vaults)'
            }
          </p>
        </div>
        {isWalletConnected && (
          <Button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            New Vault
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 backdrop-blur-xl bg-card/40 border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Vaults</p>
              <p className="text-2xl font-bold">{displayVaults.filter(v => v.status === 'active').length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 backdrop-blur-xl bg-card/40 border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-accent/10">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Deposited</p>
              <p className="text-2xl font-bold">${totalDeposited.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 backdrop-blur-xl bg-card/40 border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-500/10">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Earned</p>
              <p className="text-2xl font-bold text-green-500">${totalEarned.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 backdrop-blur-xl bg-card/40 border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg. APY</p>
              <p className="text-2xl font-bold">{avgAPY.toFixed(2)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 backdrop-blur-xl bg-card/40 border-border/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search vaults..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={filterChain}
              onChange={(e) => setFilterChain(e.target.value)}
              className="px-4 py-2 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {chains.map(chain => (
                <option key={chain} value={chain}>
                  {chain === 'all' ? 'All Chains' : chain}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Vaults Grid */}
      {!isWalletConnected && (
        <Card className="p-4 backdrop-blur-xl bg-accent/10 border-accent/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-accent" />
            <p className="text-sm text-muted-foreground">
              You're viewing demo data. Connect your wallet to access real vaults and start earning.
            </p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVaults.map((vault) => (
          <Card
            key={vault.id}
            className="p-6 backdrop-blur-xl bg-card/40 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-accent">
                  <Lock className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">{vault.name}</h3>
                  <p className="text-xs text-muted-foreground">{vault.chain}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                vault.status === 'active' 
                  ? 'bg-accent/20 text-accent' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {vault.status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Deposited</span>
                <span className="font-semibold">${vault.deposited.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Earned</span>
                <span className="font-semibold text-green-500">${vault.earned.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">APY</span>
                <span className="font-semibold text-primary">{vault.apy.toFixed(2)}%</span>
              </div>
            </div>

            {vault.isDemo && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground text-center">
                  Demo vault - Connect wallet to create real vaults
                </p>
              </div>
            )}

            {!vault.isDemo && (
              <div className="mt-4 pt-4 border-t border-border/50 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Details
                </Button>
                <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
                  Manage
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredVaults.length === 0 && (
        <Card className="p-12 text-center backdrop-blur-xl bg-card/40 border-border/50">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No vaults found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || filterChain !== 'all'
              ? 'Try adjusting your search or filters'
              : isWalletConnected
                ? 'Create your first vault to start earning'
                : 'Connect your wallet to access vaults'
            }
          </p>
          {isWalletConnected && (
            <Button onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Vault
            </Button>
          )}
        </Card>
      )}
    </div>
  )
}