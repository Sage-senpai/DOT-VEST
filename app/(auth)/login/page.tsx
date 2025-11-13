// FILE: app/(auth)/login/page.tsx
// ============================================
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Mail, Lock, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/auth/useAuth'
import { Button } from '@/components/ui/button'
import styles from './styles.module.css'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, loading } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { error: signInError } = await signIn(formData.email, formData.password)

    if (signInError) {
      setError(signInError.message)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.gradientBg} />
      
      <div className={styles.content}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <Zap className={styles.logoIcon} />
          <span className={styles.logoText}>DOTVEST</span>
        </Link>

        {/* Login Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.subtitle}>Sign in to access your DeFi portfolio</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.error}>
                <span>{error}</span>
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email Address
              </label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className={styles.input}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} />
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className={styles.input}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.forgotPassword}>
              <Link href="/forgot-password">Forgot password?</Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? (
                <>
                  <Loader2 className={styles.spinner} />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <p className={styles.signupPrompt}>
            Don't have an account?{' '}
            <Link href="/register" className={styles.signupLink}>
              Sign up
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className={styles.footer}>
          By continuing, you agree to our{' '}
          <Link href="/terms">Terms of Service</Link> and{' '}
          <Link href="/privacy">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}