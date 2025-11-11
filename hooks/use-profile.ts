"use client"

import { useState, useEffect } from "react"

export interface Profile {
  name: string
  profileImage?: string
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("dotvest-profile")
    if (saved) {
      setProfile(JSON.parse(saved))
    }
  }, [])

  const updateProfile = (newProfile: Profile) => {
    setProfile(newProfile)
    localStorage.setItem("dotvest-profile", JSON.stringify(newProfile))
  }

  return { profile, updateProfile, mounted }
}
