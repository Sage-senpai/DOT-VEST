// FILE: app/dashboard/aggregator/error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console and error reporting service
    console.error('Aggregator page error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[600px] p-4">
      <Card className="max-w-lg w-full p-8 backdrop-blur-xl bg-card/40 border border-border/50">
        <div className="text-center space-y-6">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
          </div>

          {/* Error Title */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Oops! Something went wrong</h2>
            <p className="text-muted-foreground">
              We encountered an error while loading the DeFi Aggregator.
            </p>
          </div>

          {/* Error Details (in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-left">
              <p className="text-xs font-mono text-destructive break-all">
                {error.message || 'Unknown error'}
              </p>
            </div>
          )}

          {/* Common Issues */}
          <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg text-left">
            <p className="text-sm font-semibold mb-3">Common issues:</p>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• Check your internet connection</li>
              <li>• Clear your browser cache and cookies</li>
              <li>• Make sure Polkadot.js extension is installed</li>
              <li>• Try refreshing the page</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={reset} 
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/dashboard'}
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-muted-foreground">
            If this problem persists, please contact support or check our{' '}
            <a href="/docs" className="text-primary hover:underline">
              documentation
            </a>
            .
          </p>
        </div>
      </Card>
    </div>
  )
}