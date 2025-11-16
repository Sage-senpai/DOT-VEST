// FILE: app/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Toaster } from '@/components/ui/toaster'
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DotVest - Polkadot DeFi Yield Optimizer",
  description: "Maximize your yields across the Polkadot ecosystem",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster/>
          <Analytics/>   
        </Providers>
      </body>
    </html>
  )
}
// NOTE: LunoKit removed as it conflicts with our custom useEnhancedPolkadot hook
// We're using native Polkadot.js extension detection which is more reliable