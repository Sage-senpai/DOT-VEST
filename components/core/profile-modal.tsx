// FILE: components/core/profile-modal.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, User, Mail, Wallet, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProfile } from "@/hooks/use-profile"
import { useAuth } from "@/hooks/auth/useAuth"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  walletAddress?: string
}

export function ProfileModal({ isOpen, onClose, walletAddress }: ProfileModalProps) {
  const router = useRouter()
  const { profile } = useProfile()
  const { user } = useAuth()

  if (!isOpen) return null

  const handleEditProfile = () => {
    onClose()
    router.push('/dashboard/profile')
  }

  const handleViewSettings = () => {
    onClose()
    router.push('/dashboard/settings')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 backdrop-blur-xl bg-card/95 border border-border/50 rounded-2xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <h3 className="text-lg font-semibold">Profile Quick View</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
              {profile?.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-primary-foreground">
                  {profile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "?"}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg">
                {profile?.name || "Anonymous User"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {user?.email || "No email set"}
              </p>
            </div>
          </div>

          {/* Bio */}
          {profile?.bio && (
            <div className="p-3 bg-card/50 rounded-lg border border-border/30">
              <p className="text-sm text-muted-foreground">{profile.bio}</p>
            </div>
          )}

          {/* Wallet Info */}
          {walletAddress && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">
                  Connected Wallet
                </span>
              </div>
              <p className="text-xs font-mono text-foreground break-all">
                {walletAddress}
              </p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-card/50 rounded-lg border border-border/30 text-center">
              <p className="text-xs text-muted-foreground mb-1">Account Type</p>
              <p className="text-sm font-semibold">
                {profile?.auth_method === 'wallet' ? 'Wallet' : 'Email'}
              </p>
            </div>
            <div className="p-3 bg-card/50 rounded-lg border border-border/30 text-center">
              <p className="text-xs text-muted-foreground mb-1">Member Since</p>
              <p className="text-sm font-semibold">
                {profile?.created_at 
                  ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  : 'Recently'
                }
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={handleEditProfile}
              className="w-full bg-primary hover:bg-primary/90 justify-center"
            >
              <User className="w-4 h-4 mr-2" />
              Edit Full Profile
            </Button>
            
            <Button
              onClick={handleViewSettings}
              variant="outline"
              className="w-full justify-center"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Account Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}