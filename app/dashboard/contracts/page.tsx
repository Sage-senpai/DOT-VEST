"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Hash, ArrowRightLeft, Wallet, ExternalLink, Zap, Shield, Code2, Cpu } from "lucide-react"
import { useEvmWallet } from "@/hooks/use-evm-wallet"
import { useStrategyContract } from "@/hooks/use-strategy-contract"
import { useVaultContract } from "@/hooks/use-vault-contract"
import { useBridgeContract } from "@/hooks/use-bridge-contract"
import { CONTRACTS, PRECOMPILES, getExplorerAddressUrl, FAUCET_URL, activeChain } from "@/lib/contracts/config"

export default function PVMContractsPage() {
  const { evmAddress, isEvmConnected, isCorrectChain, evmBalance } = useEvmWallet()
  const { computeBlake2Hash, getPolkadotAccountId } = useStrategyContract()
  const { getVaultStats } = useVaultContract()
  const { estimateXcmWeight } = useBridgeContract()

  // Blake2 hasher state
  const [blake2Input, setBlake2Input] = useState("")
  const [blake2Output, setBlake2Output] = useState<string | null>(null)
  const [blake2Loading, setBlake2Loading] = useState(false)

  // Address converter state
  const [addrInput, setAddrInput] = useState("")
  const [accountId, setAccountId] = useState<string | null>(null)
  const [addrLoading, setAddrLoading] = useState(false)

  // XCM weight state
  const [xcmMessage, setXcmMessage] = useState("0x00")
  const [xcmWeight, setXcmWeight] = useState<{ refTime: string; proofSize: string } | null>(null)
  const [xcmLoading, setXcmLoading] = useState(false)

  // Vault stats state
  const [vaultStats, setVaultStats] = useState<any>(null)
  const [vaultLoading, setVaultLoading] = useState(false)

  const handleBlake2Hash = async () => {
    if (!blake2Input) return
    setBlake2Loading(true)
    try {
      const hash = await computeBlake2Hash(blake2Input)
      setBlake2Output(hash)
    } catch {
      setBlake2Output("Error: Contract not available")
    }
    setBlake2Loading(false)
  }

  const handleAddressConvert = async () => {
    const addr = (addrInput || evmAddress) as `0x${string}`
    if (!addr) return
    setAddrLoading(true)
    try {
      const id = await getPolkadotAccountId(addr)
      setAccountId(id)
    } catch {
      setAccountId("Error: Contract not available")
    }
    setAddrLoading(false)
  }

  const handleEstimateWeight = async () => {
    setXcmLoading(true)
    try {
      const weight = await estimateXcmWeight(xcmMessage as `0x${string}`)
      if (weight) {
        setXcmWeight({
          refTime: weight.refTime.toString(),
          proofSize: weight.proofSize.toString(),
        })
      } else {
        setXcmWeight({ refTime: "0", proofSize: "0" })
      }
    } catch {
      setXcmWeight({ refTime: "Error", proofSize: "Error" })
    }
    setXcmLoading(false)
  }

  const handleFetchVaultStats = async () => {
    setVaultLoading(true)
    try {
      const stats = await getVaultStats()
      setVaultStats(stats)
    } catch {
      setVaultStats(null)
    }
    setVaultLoading(false)
  }

  const contractsDeployed = CONTRACTS.vault && CONTRACTS.strategy && CONTRACTS.bridge

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Code2 className="w-8 h-8 text-primary" />
          PVM Smart Contracts
        </h2>
        <p className="text-muted-foreground">
          Interactive demo of DotVest&apos;s PVM contracts on Polkadot Hub — covering all 3 Track 2 categories.
        </p>
      </div>

      {/* Connection Status */}
      <Card className="card-solid p-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">EVM Wallet:</span>
            <span className={`text-sm font-semibold ${isEvmConnected ? "text-success" : "text-destructive"}`}>
              {isEvmConnected ? `${evmAddress!.slice(0, 6)}...${evmAddress!.slice(-4)}` : "Not Connected"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Network:</span>
            <span className={`text-sm font-semibold ${isCorrectChain ? "text-success" : "text-yellow-500"}`}>
              {isCorrectChain ? activeChain.name : "Wrong Network"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Balance:</span>
            <span className="text-sm font-semibold">{Number(evmBalance).toFixed(4)} {activeChain.nativeCurrency.symbol}</span>
          </div>
          <a href={FAUCET_URL} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
            Get Testnet Tokens <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </Card>

      {/* Deployed Contracts */}
      <Card className="card-solid p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Deployed Contracts
        </h3>
        <div className="space-y-3">
          {[
            { name: "DotVestVault", addr: CONTRACTS.vault, category: "Cat 2: Native Assets" },
            { name: "DotVestStrategy", addr: CONTRACTS.strategy, category: "Cat 1: PVM-experiments" },
            { name: "DotVestBridge", addr: CONTRACTS.bridge, category: "Cat 3: XCM Precompiles" },
          ].map((c) => (
            <div key={c.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
              <div>
                <span className="font-medium text-sm">{c.name}</span>
                <span className="ml-2 text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">{c.category}</span>
              </div>
              <div className="flex items-center gap-2">
                {c.addr ? (
                  <a
                    href={getExplorerAddressUrl(c.addr)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline font-mono flex items-center gap-1"
                  >
                    {c.addr.slice(0, 10)}...{c.addr.slice(-8)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">Not deployed yet</span>
                )}
              </div>
            </div>
          ))}
          {/* Precompiles */}
          {[
            { name: "System Precompile", addr: PRECOMPILES.system },
            { name: "XCM Precompile", addr: PRECOMPILES.xcm },
          ].map((p) => (
            <div key={p.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50">
              <span className="font-medium text-sm text-muted-foreground">{p.name}</span>
              <span className="text-xs font-mono text-muted-foreground">{p.addr}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Interactive Demos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blake2 Hasher - Category 1: PVM-experiments */}
        <Card className="card-solid p-6">
          <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <Hash className="w-5 h-5 text-primary" />
            Blake2-256 Hasher
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Cat 1: Calls Rust-native Blake2 hashing via PVM System Precompile
          </p>
          <div className="space-y-3">
            <input
              type="text"
              value={blake2Input}
              onChange={(e) => setBlake2Input(e.target.value)}
              placeholder="Enter text to hash..."
              className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button
              onClick={handleBlake2Hash}
              disabled={blake2Loading || !blake2Input || !contractsDeployed}
              size="sm"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {blake2Loading ? "Hashing..." : "Compute Blake2-256 Hash"}
            </Button>
            {blake2Output && (
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Result:</p>
                <p className="text-xs font-mono break-all text-foreground">{blake2Output}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Address Converter - Category 1: PVM-experiments */}
        <Card className="card-solid p-6">
          <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-accent" />
            Address Converter
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Cat 1: Converts EVM H160 to Polkadot AccountId32 via System Precompile
          </p>
          <div className="space-y-3">
            <input
              type="text"
              value={addrInput}
              onChange={(e) => setAddrInput(e.target.value)}
              placeholder={evmAddress || "0x... EVM address"}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button
              onClick={handleAddressConvert}
              disabled={addrLoading || !contractsDeployed}
              size="sm"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {addrLoading ? "Converting..." : "Convert to AccountId32"}
            </Button>
            {accountId && (
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Polkadot AccountId32:</p>
                <p className="text-xs font-mono break-all text-foreground">{accountId}</p>
              </div>
            )}
          </div>
        </Card>

        {/* XCM Weight Estimator - Category 3: Precompiles */}
        <Card className="card-solid p-6">
          <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <Shield className="w-5 h-5 text-secondary" />
            XCM Weight Estimator
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Cat 3: Estimates cross-chain message weight via XCM Precompile
          </p>
          <div className="space-y-3">
            <input
              type="text"
              value={xcmMessage}
              onChange={(e) => setXcmMessage(e.target.value)}
              placeholder="0x... SCALE-encoded XCM message"
              className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button
              onClick={handleEstimateWeight}
              disabled={xcmLoading || !contractsDeployed}
              size="sm"
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              {xcmLoading ? "Estimating..." : "Estimate XCM Weight"}
            </Button>
            {xcmWeight && (
              <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Ref Time:</span>
                  <span className="font-mono">{xcmWeight.refTime}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Proof Size:</span>
                  <span className="font-mono">{xcmWeight.proofSize}</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Vault Stats - Category 2: Native Assets */}
        <Card className="card-solid p-6">
          <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-success" />
            Vault On-Chain Stats
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Cat 2: Reads DotVestVault contract state (native DOT deposits)
          </p>
          <div className="space-y-3">
            <Button
              onClick={handleFetchVaultStats}
              disabled={vaultLoading || !contractsDeployed}
              size="sm"
              className="w-full bg-success hover:bg-success/90 text-success-foreground"
            >
              {vaultLoading ? "Fetching..." : "Fetch Vault Stats"}
            </Button>
            {vaultStats && (
              <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">TVL:</span>
                  <span className="font-semibold">{(Number(vaultStats.tvl) / 1e18).toFixed(4)} {activeChain.nativeCurrency.symbol}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Deposited:</span>
                  <span className="font-semibold">{(Number(vaultStats.totalDeposited) / 1e18).toFixed(4)} {activeChain.nativeCurrency.symbol}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Depositors:</span>
                  <span className="font-semibold">{vaultStats.depositorCount.toString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Deposits:</span>
                  <span className="font-semibold">{vaultStats.depositCount.toString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Min Deposit:</span>
                  <span className="font-semibold">{(Number(vaultStats.minimumDeposit) / 1e18).toFixed(6)} {activeChain.nativeCurrency.symbol}</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Architecture Overview */}
      <Card className="card-solid p-6">
        <h3 className="text-lg font-semibold mb-4">Architecture: Track 2 Coverage</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <h4 className="font-semibold text-sm text-primary mb-2">Category 1: PVM-experiments</h4>
            <p className="text-xs text-muted-foreground">
              DotVestStrategy calls the System Precompile&apos;s <code className="text-primary">hashBlake256()</code> and <code className="text-primary">toAccountId()</code> —
              executing Rust-native Blake2 and address conversion code from Solidity via PolkaVM.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
            <h4 className="font-semibold text-sm text-accent mb-2">Category 2: Native Assets</h4>
            <p className="text-xs text-muted-foreground">
              DotVestVault accepts native DOT deposits, tracks shares, and uses <code className="text-accent">minimumBalance()</code> from
              the System Precompile to enforce the existential deposit requirement.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
            <h4 className="font-semibold text-sm text-secondary mb-2">Category 3: Precompiles</h4>
            <p className="text-xs text-muted-foreground">
              DotVestBridge uses the XCM Precompile&apos;s <code className="text-secondary">weighMessage()</code> and <code className="text-secondary">send()</code> to
              estimate costs and dispatch cross-chain messages natively from Solidity.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
