// FILE: components/ui/loading-skeleton.tsx
// LOCATION: /components/ui/loading-skeleton.tsx
// ============================================
import { Card } from "./card"

export function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
            <div className="h-4 bg-muted rounded w-24 mb-2" />
            <div className="h-8 bg-muted rounded w-32 mb-1" />
            <div className="h-3 bg-muted rounded w-20" />
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
            <div className="h-6 bg-muted rounded w-48 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-24 bg-muted rounded" />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}