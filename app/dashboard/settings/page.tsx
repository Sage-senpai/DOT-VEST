"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Lock, Palette, Zap } from "lucide-react"

export default function Settings() {
  const [notifications, setNotifications] = useState({
    yields: true,
    alerts: true,
    updates: false,
  })

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-3xl font-bold mb-2">Settings</h2>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

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
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-card/50">
              <div>
                <p className="font-medium text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={notifications[item.key]}
                onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                className="w-5 h-5 rounded cursor-pointer"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Security */}
      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-5 h-5 text-secondary" />
          <h3 className="text-lg font-semibold">Security</h3>
        </div>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start bg-transparent">
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent">
            Enable 2FA
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent">
            Connected Wallets
          </Button>
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
            <select className="w-full px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50">
              <option>Dark (Default)</option>
              <option>Light</option>
              <option>Auto</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Currency</label>
            <select className="w-full px-4 py-2 bg-card/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-primary/50">
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="backdrop-blur-xl bg-card/40 border border-border/50 p-6 rounded-lg border-destructive/50">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-5 h-5 text-destructive" />
          <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
        </div>
        <Button
          variant="outline"
          className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 bg-transparent"
        >
          Delete Account
        </Button>
      </Card>
    </div>
  )
}
