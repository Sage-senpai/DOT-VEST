"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const isDarkMode = document.documentElement.classList.contains("dark")
    setIsDark(isDarkMode)
  }, [])

  const toggleTheme = () => {
    const html = document.documentElement
    if (isDark) {
      html.classList.remove("dark")
      localStorage.setItem("theme", "light")
      setIsDark(false)
    } else {
      html.classList.add("dark")
      localStorage.setItem("theme", "dark")
      setIsDark(true)
    }
  }

  if (!mounted) return null

  return (
    <button
      onClick={toggleTheme}
      className="smooth-transition p-2 rounded-lg border border-border/50 hover:bg-card/60 hover:border-primary/50"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5 text-primary" />}
    </button>
  )
}
