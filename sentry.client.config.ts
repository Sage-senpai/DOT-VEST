// LOCATION: /sentry.client.config.ts
// PURPOSE: Sentry error tracking configuration
// ============================================
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions
  // In production, reduce this to save costs
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Set profilesSampleRate for performance profiling
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Configure which errors to ignore
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    // Random plugins/extensions
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    // Network errors
    'NetworkError',
    'Failed to fetch',
  ],
  
  // Add custom tags
  initialScope: {
    tags: {
      environment: process.env.NODE_ENV,
      app_version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
    },
  },
  
  // Configure release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  
  // Before sending events, allow filtering
  beforeSend(event, hint) {
    // Filter out localhost errors in development
    if (process.env.NODE_ENV === 'development') {
      return null
    }
    
    // Add custom context
    if (event.request) {
      event.request.headers = {
        ...event.request.headers,
        'user-agent': navigator.userAgent,
      }
    }
    
    return event
  },
})
