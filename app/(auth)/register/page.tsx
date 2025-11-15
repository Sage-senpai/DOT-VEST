// FILE: app/(auth)/register/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Mail, Lock, User, CheckCircle2, Wallet, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/auth/useAuth'
import { Button } from '@/components/ui/button'
import styles from './styles.module.css'

export default function RegisterPage() {
  const router = useRouter()
  const { signUp, loading } = useAuth()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [pendingWallet, setPendingWallet] = useState<string | null>(null)

  useEffect(() => {
    // Check if there's a pending wallet from onboarding
    const pending = localStorage.getItem('pending_wallet_address')
    if (pending) {
      setPendingWallet(pending)
    }
  }, [])

  // === Validation ===
  const validatePassword = (password: string) => {
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter'
    if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter'
    if (!/[0-9]/.test(password)) return 'Password must contain a number'
    return null
  }

  // === Email Registration ===
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    try {
      const { data, error: signUpError } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        auth_method: 'email',
        wallet_address: pendingWallet || undefined,
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      if (data?.user) {
        setSuccess(true)
        // Redirect back to onboarding if there was a pending wallet
        setTimeout(() => {
          if (pendingWallet) {
            router.push('/onboarding')
          } else {
            router.push('/dashboard')
          }
        }, 1500)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration')
    }
  }

  // === Success State ===
  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.gradientBg} />
        <div className={styles.successCard}>
          <CheckCircle2 className={styles.successIcon} />
          <h2 className={styles.successTitle}>Account Created!</h2>
          <p className={styles.successText}>
            {pendingWallet 
              ? 'Redirecting to complete your profile...'
              : 'Redirecting to your dashboard...'
            }
          </p>
        </div>
      </div>
    )
  }

  // === UI ===
  return (
    <div className={styles.container}>
      <div className={styles.gradientBg} />

      <div className={styles.content}>
        <Link href="/" className={styles.logo}>
          <Zap className={styles.logoIcon} />
          <span className={styles.logoText}>DOTVEST</span>
        </Link>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.title}>Create Account</h1>
            <p className={styles.subtitle}>Start optimizing your DeFi yields today</p>
          </div>

          {error && (
            <div className={styles.error}>
              <span>{error}</span>
            </div>
          )}

          {pendingWallet && (
            <div className="mb-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold">Wallet Connected</p>
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                {pendingWallet.slice(0, 8)}...{pendingWallet.slice(-6)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Creating an account to link with this wallet
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="fullName" className={styles.label}>
                Full Name
              </label>
              <div className={styles.inputWrapper}>
                <User className={styles.inputIcon} />
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="John Doe"
                  className={styles.input}
                  required
                  disabled={loading}
                />
              </div>
            </div>

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
              <p className={styles.passwordHint}>
                Min 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirm Password
              </label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} />
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  placeholder="••••••••"
                  className={styles.input}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <p className={styles.signupPrompt}>
            Already have an account?{' '}
            <Link href="/login" className={styles.signupLink}>
              Sign In
            </Link>
          </p>
        </div>

        <p className={styles.footer}>
          By continuing, you agree to our{' '}
          <Link href="/terms">Terms of Service</Link> and{' '}
          <Link href="/privacy">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}