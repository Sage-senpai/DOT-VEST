"use client"

import { BarChart3, Zap, GitBranch, Brain, Lock, ZapIcon } from "lucide-react"

const features = [
  {
    icon: BarChart3,
    title: "Smart Aggregator",
    description: "Compare yields across protocols and execute optimal strategies in one click",
    color: "text-accent",
  },
  {
    icon: GitBranch,
    title: "Cross-Chain Bridge",
    description: "Seamlessly move assets across 7 blockchains with minimal slippage",
    color: "text-primary",
  },
  {
    icon: Brain,
    title: "AI Copilot",
    description: "Get intelligent recommendations powered by advanced machine learning",
    color: "text-secondary",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "Audited contracts with multi-sig protection and insurance coverage",
    color: "text-accent",
  },
  {
    icon: ZapIcon,
    title: "Real-Time Analytics",
    description: "Monitor portfolio performance with live market data and insights",
    color: "text-primary",
  },
  {
    icon: Zap,
    title: "Yield Optimization",
    description: "Automatically rebalance and compound your positions for maximum returns",
    color: "text-secondary",
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Powerful Features for <span className="text-primary">DeFi Mastery</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to optimize your DeFi strategy in one unified platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className="backdrop-blur-xl bg-card/40 border border-border/50 transition-all duration-300 hover:bg-card/60 hover:border-primary/50 p-6 rounded-lg group"
              >
                <div className={`${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
