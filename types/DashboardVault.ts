export interface DashboardVault {
  id: string
  strategyName: string
  apy: number
  amount: number
  duration: number
  createdAt: string | Date
  status: "active" | "completed" | "pending" | "demo"
  isDemo?: boolean            // <-- ADD THIS LINE
}
