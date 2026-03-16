'use client'

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Search, DollarSign, Clock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OptimalPoolForm() {
  const [amount, setAmount] = useState(1000)
  const [duration, setDuration] = useState(6)
  const [riskTolerance, setRiskTolerance] = useState('medium')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pools/live/optimal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, duration, riskTolerance }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Optimal pool found!',
          description: `Best pool: ${data.data[0]?.name || 'N/A'}`,
          variant: 'success',
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
      </div>
    </section>
  )
}
