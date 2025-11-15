// FILE: app/onboarding/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, ArrowLeft, Wallet, Shield, Zap, CheckCircle, User, ExternalLink, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEnhancedPolkadot } from "@/hooks/use-enhanced-polkadot"
import { useProfile } from "@/hooks/use-profile"
import { useAuth } from "@/hooks/auth/useAuth"
import Link from "next/link"

const WALLET_OPTIONS = [
  {
    id: "polkadot-js",
    name: "Polkadot{.js}",
    icon: "🔴",
    downloadUrl: "https://polkadot.js.org/extension/",
  },
  {
    id: "subwallet",
    name: "SubWallet",
    icon: "🦊",
    downloadUrl: "https://subwallet.app/",
  },
  {
    id: "talisman",
    name: "Talisman",
    icon: "🌟",
    downloadUrl: "https://talisman.xyz/",
  },
  {
    id: "nova",
    name: "Nova Wallet",
    icon: "⭐",
    downloadUrl: "https://novawallet.io/",
  },
]

const steps = [
  {
    id: 1,
    title: "Connect Wallet",
    description: "Link your Polkadot wallet",
    icon: Wallet,
  },
  {
    id: 2,
    title: "Profile Setup",
    description: "Complete your profile",
    icon: Shield,
  },
  {
    id: 3,
    title: "Ready to Go",
    description: "Start earning yield",
    icon: Zap,
  },
]

export default function Onboarding() {
  const router = useRouter()
  const { user } = useAuth()
  const { selectedAccount, connectedAccounts, connectWallet, disconnectWallet, isReady, switchAccount } = useEnhancedPolkadot()
  const { profile, updateProfile } = useProfile()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [connecting, setConnecting] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    avatarChoice: "default-1",
  })
  const [customWalletNames, setCustomWalletNames] = useState<{[key: string]: string}>({})

  // Check if user needs to register/login
  useEffect(() => {
    if (selectedAccount && !user && currentStep === 1) {
      // Wallet connected but no user account - need to register
      const walletAddress = selectedAccount.address
      localStorage.setItem('pending_wallet_address', walletAddress)
      // Stay on step 1 and show message to register
    }
  }, [selectedAccount, user, currentStep])

  const handleConnectWallet = async () => {
    setConnecting(true)
    try {
      await connectWallet()
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnectWallet = () => {
    disconnectWallet()
  }

  const handleSelectAccount = (address: string) => {
    switchAccount(address)
  }

  const handleWalletNameChange = (address: string, name: string) => {
    setCustomWalletNames(prev => ({ ...prev, [address]: name }))
  }

  const handleNext = () => {
    if (currentStep === 1) {
      if (!selectedAccount) {
        return // Can't proceed without wallet
      }
      if (!user) {
        // Wallet connected but no user - redirect to register
        localStorage.setItem('pending_wallet_address', selectedAccount.address)
        router.push('/register')
        return
      }
    }
    
    if (currentStep === 2 && !formData.username.trim()) {
      return // Can't proceed without username
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    if (!selectedAccount) {
      console.error('No wallet selected')
      return
    }

    if (!user) {
      console.error('User not authenticated')
      router.push('/register')
      return
    }

    try {
      await updateProfile({
        name: formData.username,
        bio: formData.bio,
        profile_image: `/avatars/${formData.avatarChoice}.png`,
        wallet_address: selectedAccount.address,
      })

      // Save custom wallet name if provided
      const customName = customWalletNames[selectedAccount.address]
      if (customName) {
        const savedNames = JSON.parse(localStorage.getItem('wallet_custom_names') || '{}')
        savedNames[selectedAccount.address] = customName
        localStorage.setItem('wallet_custom_names', JSON.stringify(savedNames))
      }

      // Clear pending wallet address
      localStorage.removeItem('pending_wallet_address')

      router.push("/dashboard")
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
    }
  }

  const avatarOptions = [
    { id: "default-1", emoji: "👤" },
    { id: "default-2", emoji: "🦸" },
    { id: "default-3", emoji: "🧑‍🚀" },
    { id: "default-4", emoji: "🦄" },
    { id: "default-5", emoji: "🐉" },
    { id: "default-6", emoji: "🎭" },
  ]

  const canProceed = () => {
    if (currentStep === 1) return selectedAccount !== null && user !== null
    if (currentStep === 2) return formData.username.trim().length > 0
    return true
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to DOTVEST</h1>
          <p className="text-lg text-muted-foreground">
            {currentStep === 1 && "Connect your Polkadot wallet to get started"}
            {currentStep === 2 && "Tell us about yourself"}
            {currentStep === 3 && "You're all set! Start optimizing your yields"}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex gap-4 mb-12">
          {steps.map((step) => (
            <div key={step.id} className="flex-1">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  step.id < currentStep
                    ? "bg-accent"
                    : step.id === currentStep
                    ? "bg-primary"
                    : "bg-border"
                }`}
              />
              <p className={`text-xs mt-2 text-center transition-colors ${
                step.id === currentStep ? "text-foreground font-medium" : "text-muted-foreground"
              }`}>
                {step.title}
              </p>
            </div>
          ))}
        </div>

        {/* Content Card */}
        <div className="backdrop-blur-xl bg-card/40 border border-border/50 p-8 rounded-lg mb-8">
          {/* Step 1: Connect Wallet */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Wallet className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-bold mb-2">Connect Your Polkadot Wallet</h2>
                <p className="text-muted-foreground">
                  Install and connect a Polkadot-compatible wallet extension
                </p>
              </div>

              {!isReady ? (
                <div className="space-y-4">
                  <Button
                    onClick={handleConnectWallet}
                    disabled={connecting}
                    className="w-full p-6 bg-primary hover:bg-primary/90 text-lg"
                  >
                    {connecting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wallet className="w-5 h-5 mr-2" />
                        Connect Wallet
                      </>
                    )}
                  </Button>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-center text-muted-foreground">
                      Supported Wallets:
                    </p>
                    {WALLET_OPTIONS.map((wallet) => (
                      <a
                        key={wallet.id}
                        href={wallet.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-card/50 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{wallet.icon}</span>
                          <span className="font-medium">{wallet.name}</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </a>
                    ))}
                  </div>

                  <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      💡 <strong>Tip:</strong> After installing, refresh this page and click "Connect Wallet"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Wallet Extension Detected</p>
                      <p className="text-xs text-muted-foreground">
                        {connectedAccounts.length} account(s) available
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDisconnectWallet}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Disconnect
                    </Button>
                  </div>

                  {!user && selectedAccount && (
                    <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                      <p className="text-sm font-semibold mb-2">⚠️ Account Required</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Please create an account or sign in to continue with this wallet.
                      </p>
                      <div className="flex gap-2">
                        <Link href="/register" className="flex-1">
                          <Button className="w-full bg-primary hover:bg-primary/90" size="sm">
                            Create Account
                          </Button>
                        </Link>
                        <Link href="/login" className="flex-1">
                          <Button variant="outline" className="w-full" size="sm">
                            Sign In
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}

                  {connectedAccounts.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Select an Account:</p>
                      {connectedAccounts.map((account) => (
                        <div key={account.address} className="space-y-2">
                          <button
                            onClick={() => handleSelectAccount(account.address)}
                            className={`w-full p-4 rounded-lg border transition-all ${
                              selectedAccount?.address === account.address
                                ? "bg-primary/20 border-primary shadow-lg shadow-primary/20"
                                : "bg-card/50 border-border/50 hover:border-primary/50 hover:bg-card/70"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground">
                                {account.name?.charAt(0).toUpperCase() || "?"}
                              </div>
                              <div className="flex-1 text-left">
                                <p className="font-medium text-sm">
                                  {account.customName || account.name || "Unnamed Account"}
                                </p>
                                <p className="text-xs text-muted-foreground font-mono">
                                  {account.address.slice(0, 8)}...{account.address.slice(-6)}
                                </p>
                              </div>
                              {selectedAccount?.address === account.address && (
                                <CheckCircle className="w-5 h-5 text-accent" />
                              )}
                            </div>
                          </button>

                          {selectedAccount?.address === account.address && (
                            <div className="pl-4 animate-in slide-in-from-top-2 duration-300">
                              <label className="text-xs font-medium mb-1 block text-muted-foreground">
                                Give this account a friendly name (optional):
                              </label>
                              <input
                                type="text"
                                placeholder={account.name || "e.g., My Main Wallet"}
                                value={customWalletNames[account.address] || ""}
                                onChange={(e) => handleWalletNameChange(account.address, e.target.value)}
                                className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Profile Setup */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Shield className="w-16 h-16 text-secondary mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
                <p className="text-muted-foreground">Choose your username and customize your profile</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Username <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Choose a unique username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-background/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This will be your display name across DotVest
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Bio (optional)</label>
                  <textarea
                    placeholder="Tell us about yourself..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-background/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Choose Avatar</label>
                  <div className="grid grid-cols-3 gap-3">
                    {avatarOptions.map((avatar) => (
                      <button
                        key={avatar.id}
                        onClick={() => setFormData({ ...formData, avatarChoice: avatar.id })}
                        className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                          formData.avatarChoice === avatar.id
                            ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                            : "border-border/50 bg-card/50 hover:border-primary/30"
                        }`}
                      >
                        <span className="text-4xl">{avatar.emoji}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedAccount && (
                  <div className="p-4 bg-card/50 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Connected Wallet</p>
                    <p className="text-sm font-semibold mb-1">
                      {customWalletNames[selectedAccount.address] || selectedAccount.customName || selectedAccount.name || "Account"}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground break-all">
                      {selectedAccount.address}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Ready to Go */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Zap className="w-16 h-16 text-accent mx-auto mb-4 opacity-50 animate-pulse" />
                <h2 className="text-2xl font-bold mb-2">You're All Set!</h2>
                <p className="text-muted-foreground">Ready to optimize your Polkadot DeFi yields</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    What's Next?
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Explore high-yield token pools and strategies
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Deposit into automated vaults
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Track your portfolio performance in real-time
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Earn rewards across multiple parachains
                    </li>
                  </ul>
                </div>

                {selectedAccount && (
                  <div className="p-4 bg-card/50 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl">
                        {avatarOptions.find((a) => a.id === formData.avatarChoice)?.emoji || "👤"}
                      </div>
                      <div>
                        <p className="font-semibold">{formData.username}</p>
                        {formData.bio && (
                          <p className="text-xs text-muted-foreground">{formData.bio}</p>
                        )}
                      </div>
                    </div>
                    <div className="pt-3 border-t border-border/30">
                      <p className="text-xs text-muted-foreground mb-1">Wallet</p>
                      <p className="text-sm font-medium">
                        {customWalletNames[selectedAccount.address] || selectedAccount.name || "Account"}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {selectedAccount.address.slice(0, 8)}...{selectedAccount.address.slice(-6)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          {currentStep > 1 && (
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}

          {currentStep < 3 ? (
            <Button
              className={`${currentStep === 1 ? 'flex-1' : 'flex-1'} bg-primary hover:bg-primary/90`}
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleComplete}
            >
              <Zap className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          )}
        </div>

        {/* Skip Link */}
        {user && (
          <div className="text-center mt-6">
            <Link href="/dashboard">
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Skip for now →
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}