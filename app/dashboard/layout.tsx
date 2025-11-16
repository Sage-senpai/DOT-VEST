// FILE: app/dashboard/layout.tsx (FIXED - No Auto Profile Modal)
"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, TrendingUp, BarChart3, Settings, LogOut, Menu, X, Zap, Lock, User, ChevronRight, Wallet as WalletIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProfileModal } from "@/components/core/profile-modal"
import { ThemeToggle } from "@/components/core/theme-toggle"
import { useProfile } from "@/hooks/use-profile"
import { useEnhancedPolkadot } from "@/hooks/use-enhanced-polkadot"
import { useAuth } from "@/hooks/auth/useAuth"
import { DashboardProvider, useDashboardState } from "@/hooks/use-dashboard-state"
import { cn } from "@/lib/utils"
import WalletManager from "@/components/core/wallet-manager"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: TrendingUp, label: "Pools", href: "/dashboard/aggregator" },
  { icon: Lock, label: "Vaults", href: "/dashboard/vaults" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  { icon: User, label: "Profile", href: "/dashboard/profile"}
]

function DashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const { profile, mounted: profileMounted } = useProfile()
  const { selectedAccount, isReady } = useEnhancedPolkadot()
  const { signOut } = useAuth()
  const { isWalletConnected, totalStrategies, totalVaults, isSyncing } = useDashboardState()

  useEffect(() => {
    setMounted(true)
  }, [])

  // REMOVED: Auto-open profile modal check
  // Users can manually open it via avatar button or Profile page

  const currentPage = navItems.find(item => item.href === pathname)
  const pageTitle = currentPage?.label || "Dashboard"

  const showSidebar = sidebarOpen || sidebarHovered

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

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

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            let badge: number | null = null
            if (item.href === '/dashboard/aggregator') badge = totalStrategies
            if (item.href === '/dashboard/vaults') badge = totalVaults
            
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
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-lg shadow-primary/50" />
                )}
                
                <div className={cn(
                  "relative transition-all duration-300",
                  "group-hover:scale-110 group-hover:rotate-3",
                  "group-active:scale-95",
                  isActive && "animate-pulse"
                )}>
                  <Icon className={cn(
                    "w-5 h-5 shrink-0 transition-all duration-300",
                    isActive && "drop-shadow-[0_0_8px_rgba(230,0,122,0.5)]"
                  )} />
                </div>

                {showSidebar && (
                  <>
                    <span className="flex-1 animate-in fade-in slide-in-from-left-2 duration-300">
                      {item.label}
                    </span>
                    {badge !== null && badge > 0 && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-primary/20 text-primary rounded-full">
                        {badge}
                      </span>
                    )}
                  </>
                )}

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

        {showSidebar && (
          <div className="px-4 py-3 border-t border-border/50">
            <div className={cn(
              "flex items-center gap-2 p-2 rounded-lg text-xs",
              isWalletConnected ? "bg-accent/10 text-accent" : "bg-muted"
            )}>
              <WalletIcon className="w-3 h-3" />
              <span className="flex-1">
                {isWalletConnected ? 'Wallet Connected' : 'No Wallet'}
              </span>
              {isSyncing && (
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              )}
            </div>
          </div>
        )}

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
            onClick={async () => {
              await signOut()
              router.push("/")
            }}
          >
            <LogOut className="w-4 h-4" />
            {showSidebar && "Logout"}
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto flex flex-col">
        <div className="h-16 backdrop-blur-xl bg-card/95 dark:bg-card/80 border-b border-border dark:border-border/70 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-20">
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
            {isSyncing && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Syncing...
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <WalletManager />
            <ThemeToggle />

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
                      {(profile.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  )
                ) : (
                  <User className="w-5 h-5 text-primary-foreground" />
                )}
              </button>
            )}
          </div>
        </div>

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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardProvider>
      <DashboardContent>{children}</DashboardContent>
    </DashboardProvider>
  )
}