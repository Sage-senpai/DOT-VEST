// FILE: components/core/wallet-manager.tsx (FIXED)
import { useState, useEffect, useRef } from 'react'
import { Wallet, ChevronDown, Check, X, LogOut, Edit2, Save, Plus, ExternalLink } from 'lucide-react'
import { useEnhancedPolkadot } from '@/hooks/use-enhanced-polkadot'

export default function WalletManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [showExtensions, setShowExtensions] = useState(false)
  const [editingAddress, setEditingAddress] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const {
    selectedAccount,
    connectedAccounts,
    availableExtensions,
    isConnecting,
    connectWallet,
    switchAccount,
    disconnectWallet,
    saveCustomName,
    supportedWallets
  } = useEnhancedPolkadot()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowExtensions(false)
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

  const handleConnectExtension = async (extensionKey: string) => {
    await connectWallet(extensionKey)
    setShowExtensions(false)
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

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-[600px] overflow-y-auto backdrop-blur-xl bg-card/95 dark:bg-card/90 border border-border/50 rounded-xl shadow-2xl shadow-black/20 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Header */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Wallet Manager</h3>
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
              {connectedAccounts.length} account{connectedAccounts.length !== 1 ? 's' : ''} connected
            </p>
          </div>

          {/* Extension Selection View */}
          {showExtensions ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-sm">Select Wallet Extension</h4>
                <button
                  onClick={() => setShowExtensions(false)}
                  className="p-1 hover:bg-card/50 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {Object.entries(supportedWallets).map(([key, wallet]) => {
                  const extension = availableExtensions.find(ext => 
                    ext.name.toLowerCase().includes(key.replace('-js', '').replace('subwallet-js', 'subwallet'))
                  )
                  const isInstalled = extension?.installed

                  return (
                    <div
                      key={key}
                      className={`p-3 rounded-lg border transition-all ${
                        isInstalled
                          ? 'border-primary/30 hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
                          : 'border-border/30 bg-muted/30'
                      }`}
                      onClick={() => isInstalled && handleConnectExtension(key)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{wallet.logo}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{wallet.name}</p>
                          {isInstalled ? (
                            <p className="text-xs text-accent">Installed • Click to connect</p>
                          ) : (
                            <p className="text-xs text-muted-foreground">Not installed</p>
                          )}
                        </div>
                        {!isInstalled && (
                          <a
                            href={wallet.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 hover:bg-card/50 rounded transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 p-3 bg-accent/5 border border-accent/20 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  💡 <span className="font-medium">Tip:</span> Install an extension, then click it here to connect new accounts
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Account List */}
              <div className="p-2 space-y-2">
                {connectedAccounts.map((account, index) => {
                  const isActive = account.address === selectedAccount.address
                  const isEditing = editingAddress === account.address
                  // Use index as backup to ensure uniqueness
                  const uniqueKey = `${account.address}-${account.source}-${index}`

                  return (
                    <div
                      key={uniqueKey}
                      className={`p-3 rounded-lg border transition-all duration-300 ${
                        isActive
                          ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/10'
                          : 'bg-card/50 border-border/30 hover:border-primary/20 hover:bg-card/70'
                      }`}
                    >
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
                                className="p-1 hover:bg-accent/10 rounded transition-colors"
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

                      <div className="flex items-center justify-between">
                        <code className="text-xs font-mono text-muted-foreground break-all">
                          {account.address.slice(0, 20)}...{account.address.slice(-20)}
                        </code>
                      </div>

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

              {/* Add New Account Button */}
              <div className="p-4 border-t border-border/50">
                <button
                  onClick={() => setShowExtensions(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-all duration-300 border border-primary/20 hover:border-primary/30"
                >
                  <Plus className="w-4 h-4" />
                  Connect New Wallet
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}