// FILE: app/dashboard/settings/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Lock, Palette, Zap, Shield, Mail, User, Globe } from "lucide-react"
import { useProfile } from "@/hooks/use-profile"
import { usePolkadotExtension } from "@/hooks/use-polkadot-extension"

export default function Settings() {
  const { profile, updateProfile } = useProfile()
  const { selectedAccount, accounts, selectAccount } = usePolkadotExtension()
  
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

  useEffect(() => {
    if (profile) {
      setEmail(profile.email || "")
    }
  }, [profile])

  const handleSaveNotifications = async () => {
    setSaving(true)
    // Simulate API call
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
              className="w-full px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50"
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
                className="flex-1 px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50"
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

      {/* Connected Wallets */}
      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-semibold">Connected Wallets</h3>
        </div>
        <div className="space-y-3">
          {accounts && accounts.length > 0 ? (
            accounts.map((account) => (
              <div
                key={account.address}
                className={`p-4 rounded-lg border transition-all ${
                  selectedAccount?.address === account.address
                    ? "bg-primary/10 border-primary"
                    : "bg-card/50 border-border/50 hover:border-primary/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{account.name || "Unnamed Account"}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {account.address.slice(0, 10)}...{account.address.slice(-8)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {selectedAccount?.address !== account.address && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => selectAccount(account.address)}
                        className="bg-transparent"
                      >
                        Switch
                      </Button>
                    )}
                    {selectedAccount?.address === account.address && (
                      <span className="text-xs bg-accent/20 text-accent px-3 py-1 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No wallets connected. Please connect a Polkadot wallet.
            </p>
          )}
        </div>
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