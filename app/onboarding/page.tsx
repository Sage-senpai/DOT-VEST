"use client"

import { useState } from "react"
import { ArrowRight, Wallet, Shield, Zap, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const steps = [
  {
    id: 1,
    title: "Connect Wallet",
    description: "Link your Web3 wallet to get started",
    icon: Wallet,
  },
  {
    id: 2,
    title: "Verify Identity",
    description: "Complete KYC for enhanced features",
    icon: Shield,
  },
  {
    id: 3,
    title: "Fund Account",
    description: "Deposit assets to start earning",
    icon: Zap,
  },
]

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1)
  const [walletConnected, setWalletConnected] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    country: "",
  })

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSkip = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to DOTVEST</h1>
          <p className="text-lg text-muted-foreground">
            Get started in 3 simple steps and begin optimizing your Polkadot DeFi strategy
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-4 mb-12">
          {steps.map((step) => (
            <div key={step.id} className="flex-1">
              <div
                className={`h-2 rounded-full transition-all ${step.id <= currentStep ? "bg-primary" : "bg-border"}`}
              />
              <p className="text-xs text-muted-foreground mt-2 text-center">{step.title}</p>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="backdrop-blur-xl bg-card/40 border border-border/50 p-8 rounded-lg mb-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Wallet className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
                <p className="text-muted-foreground">Choose your preferred Web3 wallet to connect</p>
              </div>

              <div className="space-y-3">
                {[
                  { name: "MetaMask", icon: "🦊" },
                  { name: "WalletConnect", icon: "🔗" },
                  { name: "Coinbase Wallet", icon: "💙" },
                  { name: "Phantom", icon: "👻" },
                ].map((wallet) => (
                  <button
                    key={wallet.name}
                    onClick={() => setWalletConnected(true)}
                    className="w-full p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-card/50 transition-all flex items-center gap-3"
                  >
                    <span className="text-2xl">{wallet.icon}</span>
                    <span className="font-medium">{wallet.name}</span>
                    <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
                  </button>
                ))}
              </div>

              {walletConnected && (
                <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Wallet Connected</p>
                    <p className="text-xs text-muted-foreground">0x742d...8f2a</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Shield className="w-16 h-16 text-secondary mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-bold mb-2">Verify Your Identity</h2>
                <p className="text-muted-foreground">Complete KYC to unlock all features</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">First Name</label>
                    <input
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Last Name</label>
                    <input
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Country</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50"
                  >
                    <option value="">Select a country</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                  <input type="checkbox" id="terms" className="w-4 h-4 rounded cursor-pointer" />
                  <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Zap className="w-16 h-16 text-accent mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-bold mb-2">Fund Your Account</h2>
                <p className="text-muted-foreground">Deposit assets to start earning yield</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Token</label>
                  <select className="w-full px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50">
                    <option>DOT - Polkadot</option>
                    <option>aUSD - Acala Stablecoin</option>
                    <option>LDOT - Liquid DOT</option>
                    <option>BNC - Bifrost</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Amount</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Network Fee</span>
                    <span className="font-semibold">~$5.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold">~$105.00</span>
                  </div>
                </div>

                <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
                  <p className="text-sm">
                    <span className="font-semibold">Tip:</span> Start with a small amount to test the platform
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {currentStep > 1 && (
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setCurrentStep(currentStep - 1)}>
              Back
            </Button>
          )}
          {currentStep < 3 && (
            <Button variant="outline" className="flex-1 bg-transparent" onClick={handleSkip}>
              Skip
            </Button>
          )}
          {currentStep === 3 ? (
            <Link href="/dashboard" className="flex-1">
              <Button className="w-full bg-primary hover:bg-primary/90">Go to Dashboard</Button>
            </Link>
          ) : (
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleNext}
              disabled={currentStep === 1 && !walletConnected}
            >
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Skip Onboarding */}
        <div className="text-center mt-6">
          <Link href="/dashboard">
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Skip onboarding
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
