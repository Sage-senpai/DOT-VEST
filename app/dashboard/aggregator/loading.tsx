// FILE: app/dashboard/aggregator/loading.tsx
import { RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-64 bg-muted rounded mb-2" />
          <div className="h-4 w-96 bg-muted rounded" />
        </div>
        <div className="h-10 w-32 bg-muted rounded" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-6 w-16 bg-muted rounded" />
              </div>
              <div className="h-8 w-8 bg-muted rounded-full" />
            </div>
          </Card>
        ))}
      </div>

      {/* Search Card */}
      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 h-10 bg-muted rounded-lg" />
            <div className="h-10 w-32 bg-muted rounded-lg" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-24 bg-muted rounded-lg" />
            ))}
          </div>
        </div>

        {/* Pool Items */}
        <div className="mt-6 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 rounded-lg bg-card/50 border border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-48 bg-muted rounded" />
                  <div className="h-3 w-32 bg-muted rounded" />
                </div>
                <div className="flex items-center gap-6">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="space-y-2">
                      <div className="h-3 w-12 bg-muted rounded" />
                      <div className="h-5 w-16 bg-muted rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Loading Indicator */}
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading DeFi opportunities...</p>
        </div>
      </div>
    </div>
  )
}