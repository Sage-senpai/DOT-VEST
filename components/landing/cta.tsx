"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="backdrop-blur-xl bg-card/40 border border-border/50 p-12 rounded-2xl text-center border-2 border-primary/30 relative overflow-hidden">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Master DeFi?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of traders and investors using DOTVEST to optimize their DeFi strategies on Polkadot
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                Launch App Now <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
