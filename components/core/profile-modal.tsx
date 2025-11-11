"use client"

import type React from "react"
import { useState } from "react"
import { X, Camera, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProfile } from "@/hooks/use-profile"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  walletAddress?: string
}

export function ProfileModal({ isOpen, onClose, walletAddress }: ProfileModalProps) {
  const { profile, updateProfile } = useProfile()
  const [name, setName] = useState(profile?.name || "")
  const [profileImage, setProfileImage] = useState(profile?.profileImage || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewImage, setPreviewImage] = useState(profileImage)
  const [copied, setCopied] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setPreviewImage(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCopyWallet = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      setIsSubmitting(true)
      setTimeout(() => {
        updateProfile({
          name: name.trim(),
          profileImage: previewImage,
        })
        setIsSubmitting(false)
        onClose()
      }, 300)
    }
  }

  if (!isOpen) return null

  if (profile?.name && isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-md mx-4 backdrop-blur-xl bg-card/80 border border-border/50 rounded-2xl p-8 shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-card/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {profile.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">Your DOTVEST Profile</p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage || "/placeholder.svg"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary-foreground">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {walletAddress && (
              <div className="p-4 bg-card/50 border border-border/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Connected Polkadot Wallet</p>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs break-all">{walletAddress}</p>
                  </div>
                  <button
                    onClick={handleCopyWallet}
                    className="p-2 hover:bg-card rounded transition-colors flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-accent" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <Button
              onClick={() => {
                setName(profile.name)
                setPreviewImage(profile.profileImage || "")
              }}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Edit Profile
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4 backdrop-blur-xl bg-card/80 border border-border/50 rounded-2xl p-8 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-card/60 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {profile?.name ? "Update Profile" : "Create Your Profile"}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">Personalize your DOTVEST experience</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                  {previewImage ? (
                    <img
                      src={previewImage || "/placeholder.svg"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-primary-foreground">
                      {name ? name.charAt(0).toUpperCase() : "?"}
                    </span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 rounded-full bg-primary hover:bg-primary/90 cursor-pointer transition-colors">
                  <Camera className="w-4 h-4 text-primary-foreground" />
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">Click camera icon to upload photo</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Sparkle"
                className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/50 focus:border-primary/50 focus:outline-none transition-colors placeholder:text-muted-foreground/50"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all"
            >
              {isSubmitting ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
