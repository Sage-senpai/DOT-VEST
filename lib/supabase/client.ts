// FILE: lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: {
          getItem: (key) => {
            if (typeof window === 'undefined') return null
            try {
              const item = window.localStorage.getItem(key)
              if (!item) return null
              // Try to parse as JSON, if it fails, return the raw value
              try {
                return JSON.parse(item)
              } catch {
                // If it's a base64 string or malformed, clear it
                window.localStorage.removeItem(key)
                return null
              }
            } catch {
              return null
            }
          },
          setItem: (key, value) => {
            if (typeof window === 'undefined') return
            try {
              window.localStorage.setItem(key, JSON.stringify(value))
            } catch (error) {
              console.error('Error setting localStorage:', error)
            }
          },
          removeItem: (key) => {
            if (typeof window === 'undefined') return
            try {
              window.localStorage.removeItem(key)
            } catch (error) {
              console.error('Error removing localStorage:', error)
            }
          },
        },
      },
    }
  )
}

// Singleton instance
let clientInstance: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseClient() {
  if (!clientInstance) {
    clientInstance = createClient()
  }
  return clientInstance
}

// Clear corrupted session helper
export function clearSupabaseSession() {
  if (typeof window === 'undefined') return
  
  const keys = [
    'sb-khnjetfjwdntxnomcoku-auth-token',
    'supabase.auth.token',
    'sb-auth-token',
  ]
  
  keys.forEach(key => {
    try {
      window.localStorage.removeItem(key)
    } catch (e) {
      console.error('Error clearing session:', e)
    }
  })
}

export const supabase = getSupabaseClient()