// FILE: hooks/auth/useAuth.ts
// ============================================
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { authHelpers } from '@/lib/supabase/auth'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initializeAuth = async () => {
      const { session } = await authHelpers.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (event === 'SIGNED_IN') {
          router.push('/dashboard')
        } else if (event === 'SIGNED_OUT') {
          router.push('/')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const result = await authHelpers.signIn(email, password)
    setLoading(false)
    return result
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    setLoading(true)
    const result = await authHelpers.signUp(email, password, metadata)
    setLoading(false)
    return result
  }

  const signOut = async () => {
    setLoading(true)
    await authHelpers.signOut()
    setUser(null)
    setLoading(false)
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  }
}
