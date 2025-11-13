// FILE: app/(auth)/register/page.tsx
// ============================================
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Mail, Lock, User, CheckCircle2, Wallet, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/auth/useAuth'
import { Button } from '@/components/ui/button'
import { usePolkadotExtension } from '@/hooks/use-polkadot-extension'
import styles from './styles.module.css'

export default function RegisterPage() {
  const router = useRouter()
  const { signUp, loading } = useAuth()
  const { connectWallet, selectedAccount } = usePolkadotExtension()

  const [registrationMode, setRegistrationMode] = useState<'email' | 'wallet'>('email')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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

    const { error: signUpError } = await signUp(formData.email, formData.password, {
      full_name: formData.fullName,
      auth_method: 'email',
    })

    if (signUpError) {
      setError(signUpError.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    }
  }

  // === Wallet Connect ===
  const handleWalletConnect = async () => {
    try {
      await connectWallet()
    } catch (err) {
      console.error(err)
      setError('Failed to connect wallet')
    }
  }

  // === Wallet Registration ===
  const handleWalletRegister = async () => {
    if (!selectedAccount) {
      setError('Please connect wallet first')
      return
    }

    const { error: signUpError } = await signUp(
      `${selectedAccount.address}@wallet.dotvest.app`, // unique email
      crypto.randomUUID(), // random password for Supabase
      {
        full_name: formData.fullName || 'Wallet User',
        wallet_address: selectedAccount.address,
        auth_method: 'wallet',
      }
    )

    if (signUpError) {
      setError(signUpError.message)
    } else {
      router.push('/onboarding')
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
          <p className={styles.successText}>Redirecting to your dashboard...</p>
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

          {/* === WALLET MODE === */}
          {registrationMode === 'wallet' ? (
            <div className="space-y-4">
              <Button
                onClick={handleWalletConnect}
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wallet className="w-4 h-4 mr-2" />
                )}
                Connect Wallet to Register
              </Button>

              {selectedAccount && (
                <>
                  <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
                    <p className="text-sm font-semibold mb-1">Wallet Connected</p>
                    <p className="text-xs font-mono break-all">{selectedAccount.address}</p>
                  </div>
                  <Button
                    onClick={handleWalletRegister}
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Wallet className="w-4 h-4 mr-2" />
                    )}
                    Register with This Wallet
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                onClick={() => setRegistrationMode('email')}
                className="w-full bg-transparent"
              >
                Use Email Instead
              </Button>
            </div>
          ) : (
            // === EMAIL MODE ===
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Create Account
              </Button>

              <Button
                variant="outline"
                onClick={() => setRegistrationMode('wallet')}
                className="w-full bg-transparent mt-4"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Register with Wallet Instead
              </Button>
            </form>
          )}

          <p className={styles.footerText}>
            Already have an account?{' '}
            <Link href="/login" className={styles.link}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
