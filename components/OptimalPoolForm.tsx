'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Search, DollarSign, Clock, Shield, TrendingUp, Layers, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PoolResult {
  name: string
  protocol: string
  chain: string
  apy: number
  tvlUsd: number
  riskScore: number
  symbol: string
}

export default function OptimalPoolForm() {
  const [amount, setAmount] = useState(1000)
  const [duration, setDuration] = useState(6)
  const [riskTolerance, setRiskTolerance] = useState('medium')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PoolResult | null>(null)
  const [noResult, setNoResult] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async () => {
    setLoading(true)
    setResult(null)
    setNoResult(false)
    try {
      const res = await fetch('/api/pools/live/optimal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, duration, riskTolerance }),
      })

      const data = await res.json()

      if (data.success && data.data) {
        setResult(data.data)
      } else if (data.success && !data.data) {
        setNoResult(true)
        toast({
          title: 'No pools found',
          description: 'No pools matched your criteria. Try adjusting risk tolerance.',
          variant: 'error',
        })
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to find optimal pool',
          variant: 'error',
        })
      }
    } catch (err: any) {
      toast({
        title: 'Request failed',
        description: err.message,
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const formatTVL = (tvl: number) => {
    if (tvl >= 1_000_000) return `$${(tvl / 1_000_000).toFixed(2)}M`
    if (tvl >= 1_000) return `$${(tvl / 1_000).toFixed(1)}K`
    return `$${tvl.toFixed(0)}`
  }

  const estimatedReturn = result
    ? amount * (Math.pow(1 + result.apy / 100, duration / 12) - 1)
    : 0

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Find Optimal Pool</h2>
          <p className="text-lg text-muted-foreground">
            Enter your preferences and we&apos;ll find the best yield opportunity for you
          </p>
        </div>

        <div className="backdrop-blur-xl bg-card/40 border border-border/50 p-8 rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Investment Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={0}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="1000"
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Duration (months)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={1}
                max={60}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="6"
              />
            </div>

            {/* Risk Tolerance */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Risk Tolerance
              </label>
              <select
                value={riskTolerance}
                onChange={(e) => setRiskTolerance(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="text-center">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-8"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Searching...' : 'Find Optimal Pool'}
            </Button>
          </div>
        </div>

        {/* Result Card */}
        {result && (
          <div className="mt-8 backdrop-blur-xl bg-card/40 border border-primary/30 p-8 rounded-2xl animate-fade-in-up">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold">Best Match Found</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pool</p>
                <p className="text-lg font-bold">{result.name}</p>
                <p className="text-xs text-muted-foreground">{result.protocol}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">APY</p>
                <p className="text-lg font-bold text-success">{result.apy.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">TVL</p>
                <p className="text-lg font-bold">{formatTVL(result.tvlUsd)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Risk Score</p>
                <p className="text-lg font-bold text-primary">{result.riskScore}/100</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-xs">
                  {result.chain}
                </span>
                <span>
                  Est. return on ${amount.toLocaleString()} over {duration}mo: <strong className="text-success">${estimatedReturn.toFixed(2)}</strong>
                </span>
              </div>
              <Button
                onClick={() => router.push('/dashboard/aggregator')}
                className="sm:ml-auto bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <Layers className="w-4 h-4" />
                Start Earning
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* No result message */}
        {noResult && (
          <div className="mt-8 backdrop-blur-xl bg-card/40 border border-border/50 p-8 rounded-2xl text-center">
            <p className="text-muted-foreground mb-4">No pools found for <strong>{riskTolerance}</strong> risk tolerance. Try a different setting.</p>
            <Button
              onClick={() => router.push('/dashboard/aggregator')}
              variant="outline"
              className="gap-2"
            >
              Browse All Pools
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
