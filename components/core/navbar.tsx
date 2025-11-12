// FILE: components/core/navbar.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { useAuth } from "@/hooks/auth/useAuth"
import { useProfile } from "@/hooks/use-profile"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { profile } = useProfile()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-card/40 border border-border/50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Zap className="w-6 h-6 text-primary group-hover:text-accent transition-colors" />
              <div className="absolute inset-0 bg-primary/20 blur-lg group-hover:bg-accent/20 transition-colors" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              DOTVEST
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#chains" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Parachains
            </Link>
            <Link href="#analytics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Analytics
            </Link>
            <Link href="#docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button size="sm" variant="outline">
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={handleSignOut}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-card rounded-lg transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="#features" className="block px-4 py-2 text-sm hover:bg-card rounded-lg transition-colors">
              Features
            </Link>
            <Link href="#chains" className="block px-4 py-2 text-sm hover:bg-card rounded-lg transition-colors">
              Parachains
            </Link>
            <Link href="#analytics" className="block px-4 py-2 text-sm hover:bg-card rounded-lg transition-colors">
              Analytics
            </Link>
            <div className="flex items-center gap-2 px-4 pt-2">
              <ThemeToggle />
            </div>
            <div className="flex gap-2 px-4 pt-2">
              {user ? (
                <>
                  <Link href="/dashboard" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Dashboard
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={handleSignOut}
                    className="flex-1 text-destructive"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" className="flex-1">
                    <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                      Start
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}