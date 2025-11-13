// FILE: app/dashboard/settings/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Lock, Palette, Zap, Shield, User, Edit2, Save } from "lucide-react"
import { useProfile } from "@/hooks/use-profile"
import { usePolkadotExtension } from "@/hooks/use-polkadot-extension"
import { useAuth } from "@/hooks/auth/useAuth"

export default function Settings() {
  const { profile, updateProfile } = useProfile()
  const { selectedAccount, accounts, selectAccount } = usePolkadotExtension()
  const { user } = useAuth()
  
  const [notifications, setNotifications] = useState({
    yields: true,
    alerts: true,
    updates: false,
    security: true,
  })

  const [preferences, setPreferences] = useState({
    theme: "dark",
    currency: "USD",
    language: "en",
  })

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    emailVerified: false,
    sessionTimeout: "30",
  })

  const [email, setEmail] = useState("")
  const [saving, setSaving] = useState(false)
  
  // Wallet naming state
  const [walletNames, setWalletNames] = useState<{[key: string]: string}>({})
  const [editingWallet, setEditingWallet] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setEmail(profile.email || "")
      // Load saved wallet names from profile or local storage
      const savedNames = localStorage.getItem(`wallet_names_${user?.id}`)
      if (savedNames) {
        setWalletNames(JSON.parse(savedNames))
      }
    }
  }, [profile, user])

  const handleSaveNotifications = async () => {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
  }

  const handleSavePreferences = async () => {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
  }

  const handleUpdateEmail = async () => {
    if (!profile) return
    setSaving(true)
    await updateProfile({ email })
    setSaving(false)
  }

  const handleSaveWalletName = (address: string, name: string) => {
    const updatedNames = { ...walletNames, [address]: name }
    setWalletNames(updatedNames)
    // Save to local storage (or Supabase in production)
    localStorage.setItem(`wallet_names_${user?.id}`, JSON.stringify(updatedNames))
    setEditingWallet(null)
  }

  const getWalletDisplayName = (account: any) => {
    return walletNames[account.address] || account.name || "Unnamed Account"
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold mb-2">Settings</h2>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile Information */}
      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Profile Information</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Display Name</label>
            <input
              type="text"
              value={profile?.name || ""}
              onChange={(e) => profile && updateProfile({ name: e.target.value })}
              className="w-full px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(230,0,122,0.1)]"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Email Address</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(230,0,122,0.1)]"
                placeholder="you@example.com"
              />
              <Button 
                onClick={handleUpdateEmail}
                disabled={saving || email === profile?.email}
                className="bg-primary hover:bg-primary/90"
              >
                {saving ? "Saving..." : "Update"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Connected Wallets with Naming */}
      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-semibold">Connected Wallets</h3>
        </div>
        <div className="space-y-3">
          {accounts && accounts.length > 0 ? (
            accounts.map((account) => {
              const isEditing = editingWallet === account.address
              const displayName = getWalletDisplayName(account)
              
              return (
                <div
                  key={account.address}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedAccount?.address === account.address
                      ? "bg-primary/10 border-primary"
                      : "bg-card/50 border-border/50 hover:border-primary/30"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Wallet Name Section */}
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            defaultValue={displayName}
                            placeholder="Enter wallet name"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveWalletName(account.address, e.currentTarget.value)
                              } else if (e.key === 'Escape') {
                                setEditingWallet(null)
                              }
                            }}
                            className="flex-1 px-3 py-1.5 bg-card/50 border border-primary/50 rounded-lg text-sm focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(230,0,122,0.1)]"
                          />
                          <Button
                            size="sm"
                            onClick={(e) => {
                              const input = e.currentTarget.parentElement?.querySelector('input')
                              if (input) {
                                handleSaveWalletName(account.address, input.value)
                              }
                            }}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Save className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="font-medium text-sm flex-1">{displayName}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingWallet(account.address)}
                            className="h-7 px-2"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Wallet Address */}
                    <p className="text-xs text-muted-foreground font-mono bg-card/30 px-3 py-2 rounded">
                      {account.address}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex gap-2">
                        {selectedAccount?.address !== account.address && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => selectAccount(account.address)}
                            className="bg-transparent"
                          >
                            Switch to This Wallet
                          </Button>
                        )}
                        {selectedAccount?.address === account.address && (
                          <span className="text-xs bg-accent/20 text-accent px-3 py-1.5 rounded-full font-medium">
                            ✓ Active Wallet
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground mb-4">
                No wallets connected. Please connect a Polkadot wallet.
              </p>
              <Button className="bg-primary hover:bg-primary/90">
                Connect Wallet
              </Button>
            </div>
          )}
        </div>

        {accounts && accounts.length > 0 && (
          <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-lg">
            <p className="text-xs text-muted-foreground">
              💡 Tip: Click the edit icon to give your wallets custom names. 
              Your strategies and transactions are linked to each wallet.
            </p>
          </div>
        )}
      </Card>

      {/* Notifications */}
      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Notifications</h3>
        </div>
        <div className="space-y-4">
          {[
            { key: "yields", label: "Yield Updates", desc: "Get notified about yield changes" },
            { key: "alerts", label: "Price Alerts", desc: "Receive alerts for price movements" },
            { key: "updates", label: "Product Updates", desc: "Learn about new features" },
            { key: "security", label: "Security Alerts", desc: "Important security notifications" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-card/50">
              <div>
                <p className="font-medium text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[item.key]}
                  onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </div>
        <Button 
          onClick={handleSaveNotifications}
          disabled={saving}
          className="w-full mt-4 bg-primary hover:bg-primary/90"
        >
          {saving ? "Saving..." : "Save Notification Settings"}
        </Button>
      </Card>

      {/* Security */}
      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-5 h-5 text-secondary" />
          <h3 className="text-lg font-semibold">Security</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-card/50">
            <div>
              <p className="font-medium text-sm">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Button 
              size="sm" 
              variant={security.twoFactorEnabled ? "destructive" : "default"}
              className={security.twoFactorEnabled ? "" : "bg-primary hover:bg-primary/90"}
            >
              {security.twoFactorEnabled ? "Disable" : "Enable"}
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-card/50">
            <div>
              <p className="font-medium text-sm">Email Verification</p>
              <p className="text-xs text-muted-foreground">Verify your email address</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full ${
              security.emailVerified 
                ? "bg-accent/20 text-accent" 
                : "bg-destructive/20 text-destructive"
            }`}>
              {security.emailVerified ? "Verified" : "Not Verified"}
            </span>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Session Timeout (minutes)</label>
            <select
              value={security.sessionTimeout}
              onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
              className="w-full px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-semibold">Preferences</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Theme</label>
            <select 
              value={preferences.theme}
              onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
              className="w-full px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Currency</label>
            <select 
              value={preferences.currency}
              onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
              className="w-full px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="DOT">DOT</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Language</label>
            <select 
              value={preferences.language}
              onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
              className="w-full px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
        <Button 
          onClick={handleSavePreferences}
          disabled={saving}
          className="w-full mt-4 bg-primary hover:bg-primary/90"
        >
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </Card>

      {/* Danger Zone */}
      <Card className="backdrop-blur-xl bg-card/40 border border-destructive/50 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-5 h-5 text-destructive" />
          <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
        </div>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 bg-transparent justify-start"
          >
            Export Account Data
          </Button>
          <Button
            variant="outline"
            className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 bg-transparent justify-start"
          >
            Clear All Cache
          </Button>
          <Button
            variant="outline"
            className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent justify-start"
          >
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  )
}