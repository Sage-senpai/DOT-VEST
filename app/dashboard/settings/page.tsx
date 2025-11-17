// FILE: app/dashboard/settings/page.tsx (FIXED - NO CONNECT BUTTON)
"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useProfile } from "@/hooks/use-profile"
import { useEnhancedPolkadot } from "@/hooks/use-enhanced-polkadot"
import { useAuth } from "@/hooks/auth/useAuth"
import { 
  User, Mail, Bell, Shield, Wallet, 
  Edit2, Save, X, Check, Trash2,
  Lock, AlertCircle
} from "lucide-react"

export default function SettingsPage() {
  const { profile, updateProfile } = useProfile()
  const { user } = useAuth()
  const { connectedAccounts, selectedAccount, switchAccount, saveCustomName } = useEnhancedPolkadot()
  
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    bio: ''
  })
  
  const [editingWallet, setEditingWallet] = useState<string | null>(null)
  const [walletName, setWalletName] = useState('')
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    transactionAlerts: true,
    weeklyReports: true
  })
  
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || '',
        email: user?.email || '',
        bio: profile.bio || ''
      })
    }
  }, [profile, user])

  const handleProfileSave = async () => {
    if (!profile) return
    
    await updateProfile({
      name: profileForm.name,
      bio: profileForm.bio
    })
    
    setIsEditingProfile(false)
  }

  const handleWalletNameSave = (address: string) => {
    if (walletName.trim()) {
      saveCustomName(address, walletName.trim())
    }
    setEditingWallet(null)
    setWalletName('')
  }

  const handlePasswordChange = async () => {
    console.log('Changing password...')
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold mb-2">Settings</h2>
        <p className="text-muted-foreground">Manage your account preferences and security</p>
      </div>

      {/* Profile Settings */}
      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold">Profile Information</h3>
          </div>
          {!isEditingProfile ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditingProfile(true)}
              className="flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditingProfile(false)}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleProfileSave}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90"
              >
                <Save className="w-4 h-4" />
                Save
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Display Name</label>
            {isEditingProfile ? (
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-4 py-2 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            ) : (
              <p className="text-muted-foreground">{profileForm.name || 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Email Address</label>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <p className="text-muted-foreground">{profileForm.email}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Bio</label>
            {isEditingProfile ? (
              <textarea
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-muted-foreground">{profileForm.bio || 'No bio added'}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Wallet Management */}
      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Wallet className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold">Connected Wallets</h3>
        </div>

        {connectedAccounts.length === 0 ? (
          <div className="text-center py-8">
            <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground mb-2">No wallets connected</p>
            <p className="text-sm text-muted-foreground">
              Use the <span className="font-semibold text-primary">Wallet Manager</span> button in the top navigation bar to connect your wallet extensions
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {connectedAccounts.map((account, idx) => {
              const isActive = account.address === selectedAccount?.address
              const isEditing = editingWallet === account.address
              const displayName = account.customName || account.name || 'Unnamed Account'
              const uniqueKey = `${account.address}-${idx}`

              return (
                <div
                  key={uniqueKey}
                  className={`p-4 rounded-lg border transition-all ${
                    isActive
                      ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/10'
                      : 'bg-card/50 border-border/30 hover:border-primary/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={walletName}
                          onChange={(e) => setWalletName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleWalletNameSave(account.address)
                            if (e.key === 'Escape') {
                              setEditingWallet(null)
                              setWalletName('')
                            }
                          }}
                          className="flex-1 px-3 py-1.5 text-sm bg-background/50 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          placeholder="Enter wallet name..."
                          autoFocus
                        />
                        <button
                          onClick={() => handleWalletNameSave(account.address)}
                          className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
                        >
                          <Save className="w-4 h-4 text-accent" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingWallet(null)
                            setWalletName('')
                          }}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{displayName}</span>
                          <button
                            onClick={() => {
                              setEditingWallet(account.address)
                              setWalletName(displayName)
                            }}
                            className="p-1.5 hover:bg-accent/10 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        </div>
                        {isActive && (
                          <span className="flex items-center gap-1 text-xs font-medium text-primary px-2 py-1 bg-primary/10 rounded-full">
                            <Check className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <code className="text-xs font-mono text-muted-foreground block mb-3">
                    {account.address}
                  </code>

                  <div className="flex items-center justify-between pt-3 border-t border-border/30">
                    <span className="text-xs text-muted-foreground">
                      via {account.source}
                    </span>
                    {!isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => switchAccount(account.address)}
                        className="text-xs"
                      >
                        Switch to This Wallet
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {connectedAccounts.length > 0 && (
          <div className="mt-4 p-4 bg-accent/5 border border-accent/20 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-accent">Tip:</span> Your strategies and holdings are wallet-specific. 
                Switch between wallets to manage different portfolios under one account.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Notifications */}
      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold">Notification Preferences</h3>
        </div>

        <div className="space-y-4">
          {Object.entries({
            email: 'Email Notifications',
            push: 'Push Notifications',
            transactionAlerts: 'Transaction Alerts',
            weeklyReports: 'Weekly Performance Reports'
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
              <span className="text-sm">{label}</span>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications[key as keyof typeof notifications]
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications[key as keyof typeof notifications]
                      ? 'translate-x-6'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Security */}
      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold">Security</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Change Password</p>
              <p className="text-sm text-muted-foreground">Update your password regularly</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowChangePassword(!showChangePassword)}
            >
              {showChangePassword ? 'Cancel' : 'Change'}
            </Button>
          </div>

          {showChangePassword && (
            <div className="space-y-3 p-4 bg-background/50 rounded-lg border border-border/50">
              <div>
                <label className="text-sm font-medium mb-1 block">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">New Password</label>
                <input
                  type="password"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button
                onClick={handlePasswordChange}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Lock className="w-4 h-4 mr-2" />
                Update Password
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between py-3 border-t border-border/30">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Button size="sm" variant="outline">
              Enable
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="backdrop-blur-xl bg-destructive/5 border border-destructive/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <h3 className="text-xl font-semibold text-destructive">Danger Zone</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Button
              size="sm"
              variant="destructive"
              className="bg-destructive hover:bg-destructive/90"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}