export type ExecutedStrategy = {
  id: string
  tokenName: string
  amount: number
  duration: number
  protocol: string
  apy: string
  executedAt: Date
  wallet_address: string
  status: "active" | "demo" | "completed" | "withdrawn"
}
