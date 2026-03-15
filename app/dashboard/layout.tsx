"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { LayoutDashboard, Layers, BarChart3, User, LogOut, Menu, X, Zap, Lock } from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ProfileModal } from "@/components/core/profile-modal"
import { ThemeToggle } from "@/components/core/theme-toggle"
import { useProfile } from "@/hooks/use-profile"
import { usePolkadotExtension } from "@/hooks/use-polkadot-extension"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Layers, label: "Pools", href: "/dashboard/aggregator" },
  { icon: Lock, label: "Vault", href: "/dashboard/vaults" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: User, label: "Profile", href: "/dashboard/settings" },
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
  const pathname = usePathname()

  const getHeaderTitle = () => {
    if (pathname === "/dashboard") return "Dashboard"
    if (pathname === "/dashboard/aggregator") return "Pools"
    if (pathname === "/dashboard/vaults") return "Vault"
    if (pathname === "/dashboard/analytics") return "Analytics"
    if (pathname === "/dashboard/settings") return "Profile"
    return "Dashboard"
  }

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
      {/* Sidebar - solid card style per Figma */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-20"} bg-card border-r border-border transition-all duration-300 flex flex-col shadow-sm`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            {sidebarOpen && <span className="font-bold text-sm">DOTVEST</span>}
          </Link>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-card rounded transition-colors">
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation - active = gradient bar + light green bg */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 pl-3 pr-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "sidebar-item-active text-primary font-medium bg-[#eafbf6]"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Log Out */}
        <div className="p-4 border-t border-border">
          <Button variant="outline" size="sm" className="w-full justify-center gap-2">
            <LogOut className="w-4 h-4" />
            {sidebarOpen && "Log Out"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar - solid, wallet + theme + avatar */}
        <div className="h-16 bg-card border-b border-border flex items-center justify-between px-8 shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">{getHeaderTitle()}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Wallet Connected</span>
              <span className="inline-flex items-center gap-1.5 bg-muted/30 px-3 py-1.5 rounded-lg">
                <span className="text-primary font-semibold">
                  {selectedAccount ? selectedAccount.address.slice(0, 6) + "..." + selectedAccount.address.slice(-4) : "Not connected"}
                </span>
                <span className="size-2 rounded-full bg-success" aria-hidden />
              </span>
            </div>
            <ThemeToggle />
            <button
              onClick={() => setProfileModalOpen(true)}
              className="w-10 h-10 rounded-full bg-[#0d9488] text-white hover:opacity-90 transition-opacity flex items-center justify-center font-semibold"
              title="Edit profile"
            >
              {profile ? (
                <span className="text-sm font-bold">
                  {profile.name?.charAt(0)?.toUpperCase() ?? "?"}
                </span>
              ) : (
                <User className="w-5 h-5" />
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
