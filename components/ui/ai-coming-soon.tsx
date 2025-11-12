// FILE: components/ui/ai-coming-soon.tsx
"use client"

import { Sparkles, Zap, Brain, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AIComingSoon() {
  return (
    <Card className="backdrop-blur-xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-primary/30 p-8 rounded-2xl relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}} />
      </div>

      <div className="relative z-10">
        {/* Icon row */}
        <div className="flex justify-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/50 flex items-center justify-center animate-bounce">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary/20 border border-secondary/50 flex items-center justify-center animate-bounce" style={{animationDelay: '0.15s'}}>
            <Sparkles className="w-6 h-6 text-secondary" />
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/50 flex items-center justify-center animate-bounce" style={{animationDelay: '0.3s'}}>
            <Zap className="w-6 h-6 text-accent" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-4 mb-8">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            AI-Powered Optimization
          </h3>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our intelligent yield optimizer is being trained to analyze market conditions, predict trends, and
            automatically rebalance your portfolio for maximum returns.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-lg bg-card/40 border border-border/50 backdrop-blur-sm hover:border-primary/50 transition-all">
            <TrendingUp className="w-6 h-6 text-primary mb-2" />
            <h4 className="font-semibold text-sm mb-1">Smart Rebalancing</h4>
            <p className="text-xs text-muted-foreground">
              Automatic portfolio optimization based on market conditions
            </p>
          </div>

          <div className="p-4 rounded-lg bg-card/40 border border-border/50 backdrop-blur-sm hover:border-secondary/50 transition-all">
            <Brain className="w-6 h-6 text-secondary mb-2" />
            <h4 className="font-semibold text-sm mb-1">Predictive Analytics</h4>
            <p className="text-xs text-muted-foreground">AI-driven yield predictions and risk assessment</p>
          </div>

          <div className="p-4 rounded-lg bg-card/40 border border-border/50 backdrop-blur-sm hover:border-accent/50 transition-all">
            <Zap className="w-6 h-6 text-accent mb-2" />
            <h4 className="font-semibold text-sm mb-1">Gas Optimization</h4>
            <p className="text-xs text-muted-foreground">Intelligent transaction timing to minimize fees</p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30">
            <Sparkles className="w-4 h-4 mr-2" />
            Join Waitlist
          </Button>
          <Button variant="outline" className="bg-transparent border-primary/50 hover:bg-primary/10">
            Learn More
          </Button>
        </div>

        {/* Timeline */}
        <div className="mt-8 pt-8 border-t border-border/50">
          <p className="text-center text-sm text-muted-foreground">
            <span className="font-semibold text-primary">Launching Q1 2025</span> • Powered by advanced machine
            learning models
          </p>
        </div>
      </div>
    </Card>
  )
}