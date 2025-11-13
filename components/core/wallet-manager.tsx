import { useState, useEffect, useRef } from 'react'
import { Wallet, ChevronDown, Check, X, LogOut, Edit2, Save } from 'lucide-react'
import { useEnhancedPolkadot } from '@/hooks/use-enhanced-polkadot'

export default function WalletManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const {
    selectedAccount,
    connectedAccounts,
    isConnecting,
    connectWallet,
    switchAccount,
    disconnectWallet,
    saveCustomName
  } = useEnhancedPolkadot()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setEditingAddress(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleEditName = (address: string, currentName: string) => {
    setEditingAddress(address)
    setEditName(currentName)
  }

  const handleSaveName = (address: string) => {
    if (editName.trim()) {
      saveCustomName(address, editName.trim())
    }
    setEditingAddress(null)
    setEditName('')
  }

  const handleCancelEdit = () => {
    setEditingAddress(null)
    setEditName('')
  }

  const displayName = (account: any) => {
    return account.customName || account.name || 'Unnamed Account'
  }

  if (!selectedAccount) {
    return (
      <button
        onClick={() => connectWallet()}
        disabled={isConnecting}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting ? (
          <>
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </>
        )}
      </button>
    )
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 bg-card dark:bg-card/50 border border-border dark:border-border/70 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
      >
        <Wallet className="w-4 h-4 text-primary" />
        <div className="flex flex-col items-start">
          <span className="text-xs text-muted-foreground">Wallet</span>
          <span className="font-semibold text-primary">
            {selectedAccount.address.slice(0, 6)}...{selectedAccount.address.slice(-4)}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-[500px] overflow-y-auto backdrop-blur-xl bg-card/95 dark:bg-card/90 border border-border/50 rounded-xl shadow-2xl shadow-black/20 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Header */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Connected Wallets</h3>
              <button
                onClick={() => {
                  disconnectWallet()
                  setIsOpen(false)
                }}
                className="p-2 hover:bg-destructive/10 rounded-lg transition-colors group"
                title="Disconnect All"
              >
                <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {connectedAccounts.length} account{connectedAccounts.length !== 1 ? 's' : ''} available
            </p>
          </div>

          {/* Account List */}
          <div className="p-2 space-y-2">
            {connectedAccounts.map((account) => {
              const isActive = account.address === selectedAccount.address
              const isEditing = editingAddress === account.address

              return (
                <div
                  key={account.address}
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    isActive
                      ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/10'
                      : 'bg-card/50 border-border/30 hover:border-primary/20 hover:bg-card/70'
                  }`}
                >
                  {/* Account Name */}
                  <div className="flex items-center justify-between mb-2">
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveName(account.address)
                            if (e.key === 'Escape') handleCancelEdit()
                          }}
                          className="flex-1 px-2 py-1 text-sm bg-background/50 border border-primary/30 rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveName(account.address)}
                          className="p-1 hover:bg-accent/10 rounded transition-colors"
                        >
                          <Save className="w-4 h-4 text-accent" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 hover:bg-destructive/10 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {displayName(account)}
                          </span>
                          <button
                            onClick={() => handleEditName(account.address, displayName(account))}
                            className="p-1 hover:bg-accent/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Edit2 className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                        {isActive && (
                          <span className="flex items-center gap-1 text-xs font-medium text-primary">
                            <Check className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Account Address */}
                  <div className="flex items-center justify-between">
                    <code className="text-xs font-mono text-muted-foreground break-all">
                      {account.address}
                    </code>
                  </div>

                  {/* Source & Actions */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                    <span className="text-xs text-muted-foreground">
                      via {account.source}
                    </span>
                    {!isActive && (
                      <button
                        onClick={() => {
                          switchAccount(account.address)
                          setIsOpen(false)
                        }}
                        className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        Switch
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border/50 bg-card/30">
            <button
              onClick={() => {
                connectWallet()
                setIsOpen(false)
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-all duration-300 border border-primary/20 hover:border-primary/30"
            >
              <Wallet className="w-4 h-4" />
              Connect Another Wallet
            </button>
          </div>

          {/* Info Tip */}
          <div className="p-4 bg-accent/5 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              💡 <span className="font-medium">Tip:</span> Your strategies are wallet-specific. Switch accounts to view different portfolios.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}