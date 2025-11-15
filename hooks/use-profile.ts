// FILE: hooks/use-profile.ts
"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/auth/useAuth'

export interface Profile {
  id: string
  name: string | null
  bio: string | null
  email: string | null
  profile_image: string | null
  profileImage?: string | null // alias for compatibility
  wallet_address: string | null
  auth_method: string | null
  created_at: string
  updated_at: string
}

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          // If profile doesn't exist, create it
          if (error.code === 'PGRST116') {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                name: user.user_metadata?.full_name || user.email?.split('@')[0],
                auth_method: user.user_metadata?.auth_method || 'email',
                wallet_address: user.user_metadata?.wallet_address || null,
              })
              .select()
              .single()

            if (createError) {
              console.error('Error creating profile:', createError)
            } else {
              setProfile({
                ...newProfile,
                profileImage: newProfile.profile_image,
              })
            }
          } else {
            console.error('Error fetching profile:', error)
          }
        } else {
          setProfile({
            ...data,
            profileImage: data.profile_image, // Add alias
          })
        }
      } catch (error) {
        console.error('Profile fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, supabase])

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') }

    try {
      setLoading(true)
      
      // Map profileImage to profile_image for database
      const dbUpdates = {
        ...updates,
        profile_image: updates.profileImage || updates.profile_image,
        updated_at: new Date().toISOString(),
      }
      
      // Remove the alias before sending to database
      delete dbUpdates.profileImage

      const { data, error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setProfile({
        ...data,
        profileImage: data.profile_image,
      })

      return { data, error: null }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  return {
    profile,
    loading,
    mounted,
    updateProfile,
  }
}