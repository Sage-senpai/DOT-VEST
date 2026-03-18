"use client"

import { useState } from "react"
import { ArrowRightLeft, ExternalLink, Shield, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEvmWallet } from "@/hooks/use-evm-wallet"
import { useBridgeContract } from "@/hooks/use-bridge-contract"
import { CONTRACTS, getExplorerTxUrl } from "@/lib/contracts/config"

const parachains = [
  { name: "Polkadot Relay", paraId: 0 },
  { name: "Acala", paraId: 2000 },
  { name: "Moonbeam", paraId: 2004 },
  { name: "Astar", paraId: 2006 },
  { name: "Hydration", paraId: 2034 },
  { name: "Bifrost", paraId: 2030 },
  { name: "Interlay", paraId: 2032 },
]

export default function Bridge() {
  const { isEvmConnected, isCorrectChain } = useEvmWallet()
  const { sendXcmTransfer, estimateXcmWeight, loading, txHash, txUrl, error } = useBridgeContract()

  const [toChain, setToChain] = useState(parachains[1].name)
  const [amount, setAmount] = useState("")
  const [weightEstimate, setWeightEstimate] = useState<{ refTime: string; proofSize: string } | null>(null)
  const [estimating, setEstimating] = useState(false)

  // Build a minimal SCALE-encoded XCM destination placeholder
  const selectedChain = parachains.find(c => c.name === toChain)

  const handleEstimate = async () => {
    setEstimating(true)
    try {
      const weight = await estimateXcmWeight("0x00" as `0x${string}`)
      if (weight) {
        setWeightEstimate({
          refTime: weight.refTime.toString(),
          proofSize: weight.proofSize.toString(),
        })
      }
    } catch {
      setWeightEstimate({ refTime: "N/A", proofSize: "N/A" })
    }
    setEstimating(false)
  }

  const handleSend = async () => {
    if (!amount || !selectedChain) return
    try {
      await sendXcmTransfer(
        "0x00" as `0x${string}`, // destination placeholder
        "0x00" as `0x${string}`, // message placeholder
        amount
      )
    } catch {
      // error handled by hook
    }
  }

  const canInteract = isEvmConnected && isCorrectChain && !!CONTRACTS.bridge

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <ArrowRightLeft className="w-8 h-8 text-primary" />
          XCM Cross-Chain Bridge
        </h2>
        <p className="text-muted-foreground">
          Transfer assets across Polkadot parachains using the XCM Precompile (Track 2, Category 3).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bridge Form */}
        <Card className="card-solid p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Send XCM Transfer
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">From</label>
              <div className="px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm font-medium">
                Polkadot Hub (Current Chain)
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">To</label>
              <select
                value={toChain}
                onChange={(e) => setToChain(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {parachains.filter(c => c.paraId !== 0).map((chain) => (
                  <option key={chain.paraId} value={chain.name}>
                    {chain.name} (Para ID: {chain.paraId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Amount (DOT)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleEstimate}
                disabled={estimating || !canInteract}
                variant="outline"
                className="flex-1 gap-2"
              >
                <Shield className="w-4 h-4" />
                {estimating ? "Estimating..." : "Estimate Weight"}
              </Button>
              <Button
                onClick={handleSend}
                disabled={loading || !amount || !canInteract}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <ArrowRightLeft className="w-4 h-4" />
                {loading ? "Sending..." : "Send Transfer"}
              </Button>
            </div>

            {!canInteract && (
              <p className="text-xs text-yellow-600">
                {!isEvmConnected ? "Connect EVM wallet to use bridge." :
                 !isCorrectChain ? "Switch to Polkadot Hub Testnet." :
                 "Bridge contract not deployed yet."}
              </p>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                {error}
              </div>
            )}

            {txHash && (
              <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                <p className="text-xs text-success font-medium mb-1">Transfer initiated!</p>
                <a
                  href={txUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View on Blockscout <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </Card>

        {/* Weight Estimate & Info */}
        <div className="space-y-6">
          {weightEstimate && (
            <Card className="card-solid p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-secondary" />
                XCM Weight Estimate
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Ref Time</span>
                  <span className="text-sm font-mono font-semibold">{weightEstimate.refTime}</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Proof Size</span>
                  <span className="text-sm font-mono font-semibold">{weightEstimate.proofSize}</span>
                </div>
              </div>
            </Card>
          )}

          <Card className="card-solid p-6">
            <h3 className="text-lg font-semibold mb-4">How XCM Bridge Works</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                This bridge uses the <strong className="text-foreground">XCM Precompile</strong> at{" "}
                <code className="text-primary text-xs">0x...0A0000</code> to send cross-chain messages.
              </p>
              <ol className="list-decimal list-inside space-y-1.5">
                <li>Your transfer request is sent to the DotVestBridge contract</li>
                <li>The contract calls <code className="text-primary">weighMessage()</code> to estimate cost</li>
                <li>Then calls <code className="text-primary">send()</code> to dispatch the XCM message</li>
                <li>The message is routed to the destination parachain via Polkadot relay</li>
              </ol>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
