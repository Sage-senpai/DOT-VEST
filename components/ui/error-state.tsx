// FILE: components/ui/error-state.tsx
// LOCATION: /components/ui/error-state.tsx
// ============================================
import { AlertCircle } from "lucide-react"
import { Button } from "./button"
import { Card } from "./card"

interface ErrorStateProps {
  error: string | Error
  onRetry?: () => void
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const message = error instanceof Error ? error.message : error

  return (
    <Card className="backdrop-blur-xl bg-destructive/10 border border-destructive/50 p-8 rounded-lg">
      <div className="flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
        <p className="text-sm text-muted-foreground mb-4">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} className="bg-primary hover:bg-primary/90">
            Try Again
          </Button>
        )}
      </div>
    </Card>
  )
}
