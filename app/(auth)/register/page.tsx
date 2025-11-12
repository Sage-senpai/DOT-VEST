// FILE: app/(auth)/register/page.tsx
// ============================================
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Mail, Lock, User, Loader2, CheckCircle2 } from 'lucide-react'
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

  const validatePassword = (password: string) => {
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter'
    if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter'
    if (!/[0-9]/.test(password)) return 'Password must contain a number'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    const { error: signUpError } = await signUp(
      formData.email,
      formData.password,
      { full_name: formData.fullName }
    )

    if (signUpError) {
      setError(signUpError.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    }
  }

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.gradientBg} />
        <div className={styles.successCard}>
          <CheckCircle2 className={styles.successIcon} />
          <h2 className={styles.successTitle}>Account Created!</h2>
          <p className={styles.successText}>
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    )
  }

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

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.error}>
                <span>{error}</span>
              </div>
            )}

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
                  placeholder="Davi Sage"
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
                  placeholder="davisage@example.com"
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
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className={styles.input}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? (
                <>
                  <Loader2 className={styles.spinner} />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <p className={styles.signupPrompt}>
            Already have an account?{' '}
            <Link href="/login" className={styles.signupLink}>
              Sign in
            </Link>
          </p>
        </div>

        <p className={styles.footer}>
          By creating an account, you agree to our{' '}
          <Link href="/terms">Terms of Service</Link> and{' '}
          <Link href="/privacy">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
