import { Navbar } from "@/components/core/navbar"
import { Footer } from "@/components/core/footer"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { Chains } from "@/components/landing/chains"
import { CTA } from "@/components/landing/cta"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <Chains />
      <CTA />
      <Footer />
    </main>
  )
}
