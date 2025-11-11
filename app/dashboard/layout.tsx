"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { LayoutDashboard, TrendingUp, BarChart3, Settings, LogOut, Menu, X, Zap, Lock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProfileModal } from "@/components/core/profile-modal"
import { ThemeToggle } from "@/components/core/theme-toggle"
import { useProfile } from "@/hooks/use-profile"
import { usePolkadotExtension } from "@/hooks/use-polkadot-extension"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: TrendingUp, label: "Pools", href: "/dashboard/aggregator" }, // renamed Aggregator to Pools
  { icon: Lock, label: "Vaults", href: "/dashboard/vaults" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const { profile, mounted } = useProfile()
  const { selectedAccount, connectWallet, isReady, error } = usePolkadotExtension()

  useEffect(() => {
    if (mounted && !profile) {
      setProfileModalOpen(true)
    }
  }, [mounted, profile])

  useEffect(() => {
    if (!isReady && !error) {
      connectWallet().catch((err) => console.log("[v0] Wallet connection failed:", err))
    }
  }, [isReady, error, connectWallet])

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-20"} backdrop-blur-xl bg-card/40 border border-border/50 border-r transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/50">
          {sidebarOpen && (
            <Link href="/" className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="font-bold text-sm">DOTVEST</span>
            </Link>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-card rounded transition-colors">
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border/50">
          <Button variant="outline" size="sm" className="w-full justify-center gap-2 bg-transparent">
            <LogOut className="w-4 h-4" />
            {sidebarOpen && "Logout"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="h-16 backdrop-blur-xl bg-card/40 border border-border/50 border-b flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-lg bg-card/50 text-sm">
              {selectedAccount ? (
                <>
                  <span className="text-muted-foreground">Wallet: </span>
                  <span className="text-primary font-semibold">{selectedAccount.address.slice(0, 10)}...</span>
                </>
              ) : (
                <>
                  <span className="text-muted-foreground">Polkadot:</span>
                  <span className="text-accent font-semibold ml-1">Not connected</span>
                </>
              )}
            </div>
            <ThemeToggle />
            <button
              onClick={() => setProfileModalOpen(true)}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent hover:shadow-lg hover:shadow-primary/50 transition-all flex items-center justify-center"
              title="Edit profile"
            >
              {profile ? (
                <span className="text-xs font-bold text-primary-foreground">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-5 h-5 text-primary-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-8">{children}</div>
      </main>

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        walletAddress={selectedAccount?.address || undefined}
      />
    </div>
  )
}
