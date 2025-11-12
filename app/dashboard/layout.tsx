// FILE: app/dashboard/layout.tsx
"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, TrendingUp, BarChart3, Settings, LogOut, Menu, X, Zap, Lock, User, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProfileModal } from "@/components/core/profile-modal"
import { ThemeToggle } from "@/components/core/theme-toggle"
import { useProfile } from "@/hooks/use-profile"
import { usePolkadotExtension } from "@/hooks/use-polkadot-extension"
import { cn } from "@/lib/utils"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: TrendingUp, label: "Pools", href: "/dashboard/aggregator" },
  { icon: Lock, label: "Vaults", href: "/dashboard/vaults" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  { icon: User, label: "Profile", href: "/dashboard/profile"}
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { profile, mounted: profileMounted } = useProfile()
  const { selectedAccount, connectWallet, isReady, error } = usePolkadotExtension()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (profileMounted && !profile) {
      setProfileModalOpen(true)
    }
  }, [profileMounted, profile])

  useEffect(() => {
    if (!isReady && !error) {
      connectWallet().catch((err) => console.log("[DotVest] Wallet connection failed:", err))
    }
  }, [isReady, error, connectWallet])

  const currentPage = navItems.find(item => item.href === pathname)
  const pageTitle = currentPage?.label || "Dashboard"

  const showSidebar = sidebarOpen || sidebarHovered

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Backdrop overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        className={cn(
          "fixed lg:relative h-full z-40 transition-all duration-300 ease-in-out",
          "backdrop-blur-xl bg-card/95 dark:bg-card/80 border-r border-border/50",
          "flex flex-col",
          showSidebar ? "w-64" : "w-20",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo & Toggle */}
        <div className={cn(
          "h-16 flex items-center border-b border-border/50 px-4 transition-all duration-300",
          showSidebar ? "justify-between" : "justify-center"
        )}>
          {showSidebar && (
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <Zap className="w-5 h-5 text-primary group-hover:text-accent transition-colors duration-300" />
                <div className="absolute inset-0 bg-primary/20 blur-lg group-hover:bg-accent/30 transition-all duration-300" />
              </div>
              <span className="font-bold text-sm bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                DOTVEST
              </span>
            </Link>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className={cn(
              "p-2 hover:bg-accent/10 rounded-lg transition-all duration-300",
              "hover:scale-110 active:scale-95"
            )}
          >
            {showSidebar ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all duration-300",
                  "group relative overflow-hidden",
                  isActive 
                    ? "bg-primary/10 text-primary dark:bg-primary/20 shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:bg-accent/10 hover:text-foreground",
                  !showSidebar && "justify-center"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-lg shadow-primary/50" />
                )}
                
                {/* Icon with animation */}
                <div className={cn(
                  "relative transition-all duration-300",
                  "group-hover:scale-110 group-hover:rotate-3",
                  "group-active:scale-95",
                  isActive && "animate-pulse"
                )}>
                  <Icon className={cn(
                    "w-5 h-5 flex-shrink-0 transition-all duration-300",
                    isActive && "drop-shadow-[0_0_8px_rgba(230,0,122,0.5)]"
                  )} />
                </div>

                {/* Label with slide animation */}
                {showSidebar && (
                  <span className="animate-in fade-in slide-in-from-left-2 duration-300">
                    {item.label}
                  </span>
                )}

                {/* Hover chevron */}
                {!showSidebar && (
                  <ChevronRight className={cn(
                    "absolute right-0 w-4 h-4 opacity-0 -translate-x-2",
                    "group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                  )} />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className={cn(
          "p-4 border-t border-border/50",
          !showSidebar && "flex justify-center"
        )}>
          
         <Button 
  variant="outline" 
  size={showSidebar ? "sm" : "icon"}
  className={cn(
    "transition-all duration-300 hover:scale-105 active:scale-95",
    "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50",
    showSidebar ? "w-full justify-center gap-2" : ""
  )}
  onClick={() => {
    // Optional: clear any auth/session here
    router.push("/") // <-- routes to your app's landing page
  }}
>
  <LogOut className="w-4 h-4" />
  {showSidebar && "Logout"}
</Button>
          
          
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Top Bar - Dynamic based on current page */}
        <div className="h-16 backdrop-blur-xl bg-card/95 dark:bg-card/80 border-b border-border dark:border-border/70 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-20">
          {/* Page Title */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="lg:hidden p-2 hover:bg-accent/10 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {pageTitle}
            </h1>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Wallet Status */}
            <div className={cn(
              "hidden sm:flex px-4 py-2 rounded-lg text-sm transition-all duration-300",
              "bg-card dark:bg-card/50 border border-border dark:border-border/70",
              "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
            )}>
              {selectedAccount ? (
                <>
                  <span className="text-muted-foreground">Wallet: </span>
                  <span className="text-primary dark:text-primary/90 font-semibold ml-1">
                    {selectedAccount.address.slice(0, 6)}...{selectedAccount.address.slice(-4)}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-muted-foreground">Polkadot:</span>
                  <span className="text-accent dark:text-accent/90 font-semibold ml-1">Not connected</span>
                </>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Profile Button */}
            {mounted && (
              <button
                onClick={() => setProfileModalOpen(true)}
                className={cn(
                  "w-10 h-10 rounded-full transition-all duration-300",
                  "bg-gradient-to-br from-primary to-accent",
                  "hover:shadow-xl hover:shadow-primary/30 hover:scale-110",
                  "active:scale-95",
                  "flex items-center justify-center border-2 border-transparent hover:border-primary/20"
                )}
                title="Edit profile"
              >
                {profile ? (
                  profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-xs font-bold text-primary-foreground">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  )
                ) : (
                  <User className="w-5 h-5 text-primary-foreground" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </div>
      </main>

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        walletAddress={selectedAccount?.address || undefined}
      />
    </div>
  )
}