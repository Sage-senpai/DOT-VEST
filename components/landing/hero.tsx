"use client"

import { ArrowRight, Zap, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Polkadot DeFi Operating System</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Aggregate. Optimize. Maximize.
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          DOTVEST is the premium Polkadot DeFi aggregator that combines intelligent strategy optimization, real-time
          analytics, and AI-powered insights across the entire parachain ecosystem.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/onboarding">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              Launch App <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline">
            View Documentation
          </Button>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="backdrop-blur-xl bg-card/40 border border-border/50 p-4 rounded-lg flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-accent flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-semibold">Polkadot Native</p>
              <p className="text-xs text-muted-foreground">10+ Parachains</p>
            </div>
          </div>
          <div className="backdrop-blur-xl bg-card/40 border border-border/50 p-4 rounded-lg flex items-center gap-3">
            <Zap className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-semibold">AI Copilot</p>
              <p className="text-xs text-muted-foreground">Smart Strategies</p>
            </div>
          </div>
          <div className="backdrop-blur-xl bg-card/40 border border-border/50 p-4 rounded-lg flex items-center gap-3">
            <Shield className="w-5 h-5 text-secondary flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-semibold">Secure</p>
              <p className="text-xs text-muted-foreground">Audited Smart Contracts</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
