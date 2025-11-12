// FILE: lib/utils/constants.ts
// ========================================
export const CHAINS = {
  POLKADOT: 'Polkadot',
  ACALA: 'Acala',
  HYDRATION: 'Hydration',
  BIFROST: 'Bifrost',
  ASTAR: 'Astar',
  MOONBEAM: 'Moonbeam',
} as const

export const RISK_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
} as const

export const STRATEGY_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const

export const VAULT_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
} as const

export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw',
  CLAIM: 'claim',
  REBALANCE: 'rebalance',
} as const

export const DURATIONS = [
  { label: '1 Month', value: 1 },
  { label: '3 Months', value: 3 },
  { label: '6 Months', value: 6 },
  { label: '1 Year', value: 12 },
  { label: '2 Years', value: 24 },
] as const

export const APY_RANGES = {
  LOW: { min: 0, max: 10 },
  MEDIUM: { min: 10, max: 20 },
  HIGH: { min: 20, max: 100 },
} as const