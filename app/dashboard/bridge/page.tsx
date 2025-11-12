// FILE: app/dashboard/bridge/page.tsx
"use client"

import { useState } from "react"
import { ArrowRightLeft, Lock } from "lucide-react"
import { Card } from "@/components/ui/card"

const chains = ["Polkadot", "Acala", "Hydration", "Bifrost", "Astar", "Moonbeam", "Subsquid"]
const tokens = ["DOT", "aUSD", "LDOT", "BNC", "ASTR"]

export default function Bridge() {
  const [fromChain, setFromChain] = useState("Polkadot")
  const [toChain, setToChain] = useState("Acala")
  const [amount, setAmount] = useState("")

  const handleSwapChains = () => {
    setFromChain(toChain)
    setToChain(fromChain)
  }

  return (
    <div className="space-y-8 flex flex-col items-center justify-center min-h-[calc(100vh-180px)]">
      {/* Bridge Interface */}
      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-12 rounded-lg max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Coming Soon
        </h2>
        <p className="text-muted-foreground mb-2">
          Cross-chain bridge functionality is being developed to bring you seamless asset transfers across the Polkadot
          ecosystem.
        </p>
        <p className="text-sm text-muted-foreground/70">Check back soon for updates on this exciting feature!</p>
      </Card>

      {/* Recent Bridges */}
      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Recent Bridges</h3>
        <div className="space-y-3">
          {[
            { from: "Polkadot", to: "Acala", amount: "10 DOT", status: "Completed", time: "2 hours ago" },
            { from: "Acala", to: "Hydration", amount: "100 aUSD", status: "Completed", time: "1 day ago" },
            { from: "Bifrost", to: "Astar", amount: "50 BNC", status: "Completed", time: "2 days ago" },
          ].map((bridge, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {bridge.from} → {bridge.to}
                  </p>
                  <p className="text-xs text-muted-foreground">{bridge.amount}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-accent">{bridge.status}</p>
                <p className="text-xs text-muted-foreground">{bridge.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
