// FILE: app/(auth)/register/page.tsx (WITH WALLET SELECTION)
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Mail, Lock, User, CheckCircle2, Wallet, Loader2, ExternalLink, RefreshCw, X } from 'lucide-react'
import { useAuth } from '@/hooks/auth/useAuth'
import { useEnhancedPolkadot } from '@/hooks/use-enhanced-polkadot'
import { Button } from '@/components/ui/button'
import styles from './styles.module.css'

export default function RegisterPage() {
  const router = useRouter()
  const { signUp, loading: authLoading } = useAuth()
  const { 
    selectedAccount, 
    connectedAccounts,
    connectWallet, 
    disconnectWallet,
    isReady, 
    error: walletError,
    isConnecting,
    availableExtensions,
    supportedWallets
  } = useEnhancedPolkadot()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showWalletSelector, setShowWalletSelector] = useState(false)

  // Check for pending wallet on mount
  useEffect(() => {
    const pending = localStorage.getItem('pending_wallet_address')
    if (pending && !selectedAccount) {
      // Try to auto-connect
      connectWallet().catch(err => console.log('[Register] Auto-connect failed:', err))
    }
  }, [])

  const validatePassword = (password: string) => {
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter'
    if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter'
    if (!/[0-9]/.test(password)) return 'Password must contain a number'
    return null
  }

  const handleWalletConnect = async (walletName?: string) => {
    setError('')
    try {
      await connectWallet(walletName)
      setShowWalletSelector(false)
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
    }
  }

  const handleWalletDisconnect = () => {
    disconnectWallet()
    localStorage.removeItem('pending_wallet_address')
    setError('')
  }

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
        wallet_address: selectedAccount?.address || undefined,
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      if (data?.user) {
        setSuccess(true)
        
        // Clear pending wallet
        localStorage.removeItem('pending_wallet_address')
        
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration')
    }
  }

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

          {/* Wallet Connection Section */}
          <div className="mb-6">
            {!isReady || !selectedAccount ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Optional: Connect your wallet
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowWalletSelector(!showWalletSelector)}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      {showWalletSelector ? 'Cancel' : 'Connect Wallet'}
                    </>
                  )}
                </Button>

                {showWalletSelector && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    {availableExtensions.filter(ext => ext.installed).length > 0 ? (
                      availableExtensions
                        .filter(ext => ext.installed)
                        .map((ext) => (
                          <button
                            key={ext.name}
                            onClick={() => {
                              const walletKey = Object.entries(supportedWallets)
                                .find(([_, w]) => w.name === ext.name)?.[0]
                              if (walletKey) handleWalletConnect(walletKey)
                            }}
                            className="w-full p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-card/50 transition-all flex items-center gap-3"
                          >
                            <span className="text-2xl">{ext.logo}</span>
                            <span className="font-medium">{ext.name}</span>
                          </button>
                        ))
                    ) : (
                      <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
                        <p className="text-sm font-semibold mb-2">No wallet extensions detected</p>
                        <p className="text-xs text-muted-foreground mb-3">
                          Install a Polkadot wallet to connect:
                        </p>
                        {Object.entries(supportedWallets).map(([key, wallet]) => (
                          <a
                            key={key}
                            href={wallet.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 rounded hover:bg-accent/20 transition-colors mb-1"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{wallet.logo}</span>
                              <span className="text-sm">{wallet.name}</span>
                            </div>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold">Wallet Connected</p>
                  </div>
                  <button
                    onClick={handleWalletDisconnect}
                    className="p-1 hover:bg-destructive/10 rounded transition-colors"
                    title="Disconnect wallet"
                  >
                    <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  {selectedAccount.customName || selectedAccount.name}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {selectedAccount.address.slice(0, 8)}...{selectedAccount.address.slice(-6)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  from {selectedAccount.source}
                </p>
              </div>
            )}
          </div>

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
                  disabled={authLoading}
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
                  disabled={authLoading}
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
                  disabled={authLoading}
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
                  disabled={authLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={authLoading}
            >
              {authLoading ? (
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