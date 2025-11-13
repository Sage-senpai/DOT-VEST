// FILE: app/onboarding/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Wallet, Shield, Zap, CheckCircle, User, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePolkadotExtension } from "@/hooks/use-polkadot-extension"
import { useProfile } from "@/hooks/use-profile"
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
    id: "metamask",
    name: "MetaMask Snap",
    icon: "🦊",
    downloadUrl: "https://snaps.metamask.io/snap/npm/chainsafe/polkadot-snap/",
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
  const { selectedAccount, accounts, connectWallet, isReady, selectAccount } = usePolkadotExtension()
  const { profile, updateProfile } = useProfile()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [connecting, setConnecting] = useState(false)
  const [accountNames, setAccountNames] = useState<{[key: string]: string}>({})
  const [formData, setFormData] = useState({
    username: "",
    avatarChoice: "default-1",
  })

  useEffect(() => {
    if (profile) {
      if (!selectedAccount && !isReady) {
        setCurrentStep(1)
      } else if (selectedAccount && !profile.username) {
        setCurrentStep(2)
      } else {
        setCurrentStep(3)
      }
    }
  }, [profile, selectedAccount, isReady])

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

  const handleSelectAccount = (address: string) => {
    selectAccount(address)
  }

  const handleAccountNameChange = (address: string, name: string) => {
    setAccountNames(prev => ({ ...prev, [address]: name }))
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleComplete = async () => {
    await updateProfile({
      username: formData.username,
      profileImage: `/avatars/${formData.avatarChoice}.png`,
      walletAddress: selectedAccount?.address,
      walletName: accountNames[selectedAccount?.address || ""] || selectedAccount?.name,
    })
    router.push("/dashboard")
  }

  const avatarOptions = [
    { id: "default-1", emoji: "👤" },
    { id: "default-2", emoji: "🦸" },
    { id: "default-3", emoji: "🧑‍🚀" },
    { id: "default-4", emoji: "🦄" },
    { id: "default-5", emoji: "🐉" },
    { id: "default-6", emoji: "🎭" },
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to DOTVEST</h1>
          <p className="text-lg text-muted-foreground">
            {currentStep === 1 && "Connect your Polkadot wallet to get started"}
            {currentStep === 2 && "Choose your username and avatar"}
            {currentStep === 3 && "You're all set! Start optimizing your yields"}
          </p>
        </div>

        <div className="flex gap-4 mb-12">
          {steps.map((step) => (
            <div key={step.id} className="flex-1">
              <div
                className={`h-2 rounded-full transition-all ${
                  step.id <= currentStep ? "bg-primary" : "bg-border"
                }`}
              />
              <p className="text-xs text-muted-foreground mt-2 text-center">{step.title}</p>
            </div>
          ))}
        </div>

        <div className="backdrop-blur-xl bg-card/40 border border-border/50 p-8 rounded-lg mb-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Wallet className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-bold mb-2">Connect Your Polkadot Wallet</h2>
                <p className="text-muted-foreground">
                  Install and connect a Polkadot-compatible wallet
                </p>
              </div>

              {!isReady ? (
                <div className="space-y-4">
                  <Button
                    onClick={handleConnectWallet}
                    disabled={connecting}
                    className="w-full p-6 bg-primary hover:bg-primary/90 text-lg"
                  >
                    {connecting ? "Connecting..." : "Connect Wallet"}
                  </Button>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-center">Available Wallets:</p>
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
                      After installing, refresh this page and click "Connect Wallet"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Wallet Connected</p>
                      <p className="text-xs text-muted-foreground">Extension detected successfully</p>
                    </div>
                  </div>

                  {accounts && accounts.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Select Account:</p>
                      {accounts.map((account) => (
                        <div key={account.address} className="space-y-2">
                          <button
                            onClick={() => handleSelectAccount(account.address)}
                            className={`w-full p-4 rounded-lg border transition-all ${
                              selectedAccount?.address === account.address
                                ? "bg-primary/20 border-primary"
                                : "bg-card/50 border-border/50 hover:border-primary/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground">
                                {account.name?.charAt(0).toUpperCase() || "?"}
                              </div>
                              <div className="flex-1 text-left">
                                <p className="font-medium text-sm">{account.name || "Unnamed Account"}</p>
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
                            <div className="pl-4">
                              <label className="text-xs font-medium mb-1 block">
                                Name this account (optional):
                              </label>
                              <input
                                type="text"
                                placeholder={account.name || "Enter account name"}
                                value={accountNames[account.address] || ""}
                                onChange={(e) => handleAccountNameChange(account.address, e.target.value)}
                                className="w-full px-3 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50"
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

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Shield className="w-16 h-16 text-secondary mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
                <p className="text-muted-foreground">Choose your username and avatar</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Username</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Choose a unique username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(230,0,122,0.1)]"
                      />
                    </div>
                  </div>
                  {profile?.name && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Full name: {profile.name}
                    </p>
                  )}
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
                            ? "border-primary bg-primary/10"
                            : "border-border/50 bg-card/50"
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
                      {accountNames[selectedAccount.address] || selectedAccount.name || "Account"}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground">
                      {selectedAccount.address}
                    </p>
                  </div>
                )}

                {profile?.email && (
                  <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Profile Information</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>Email: {profile.email}</p>
                      {profile.name && <p>Name: {profile.name}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Zap className="w-16 h-16 text-accent mx-auto mb-4 opacity-50 animate-pulse" />
                <h2 className="text-2xl font-bold mb-2">You're All Set!</h2>
                <p className="text-muted-foreground">Ready to optimize your Polkadot DeFi yields</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <h3 className="font-semibold mb-2">What's Next?</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Explore token pools and strategies</li>
                    <li>• Deposit into high-yield vaults</li>
                    <li>• Track your portfolio performance</li>
                    <li>• Earn rewards across multiple chains</li>
                  </ul>
                </div>

                {selectedAccount && (
                  <div className="p-4 bg-card/50 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl">
                        {avatarOptions.find((a) => a.id === formData.avatarChoice)?.emoji || "👤"}
                      </div>
                      <div>
                        <p className="font-semibold">{formData.username || "User"}</p>
                        <p className="text-xs text-muted-foreground">
                          {accountNames[selectedAccount.address] || selectedAccount.name || "Account"}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {selectedAccount.address.slice(0, 8)}...{selectedAccount.address.slice(-6)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          {currentStep > 1 && currentStep < 3 && (
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Back
            </Button>
          )}

          {currentStep === 1 && selectedAccount && (
            <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleNext}>
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {currentStep === 2 && (
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleNext}
              disabled={!formData.username.trim()}
            >
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {currentStep === 3 && (
            <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleComplete}>
              Go to Dashboard
            </Button>
          )}
        </div>

        <div className="text-center mt-6">
          <Link href="/dashboard">
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Skip for now
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}