// FILE: lib/utils/validation.ts
// ========================================
import { z } from 'zod'

export const schemas = {
  email: z.string().email('Invalid email address'),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),

  walletAddress: z
    .string()
    .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, 'Invalid wallet address'),

  amount: z
    .number()
    .positive('Amount must be positive')
    .finite('Amount must be a valid number'),

  duration: z
    .number()
    .int('Duration must be a whole number')
    .min(1, 'Duration must be at least 1 month')
    .max(120, 'Duration cannot exceed 120 months'),

  strategySchema: z.object({
    pool_id: z.string().uuid(),
    token_name: z.string().min(1),
    amount: z.number().positive(),
    duration: z.number().int().min(1).max(120),
    protocol: z.string().min(1),
    apy: z.number().positive(),
  }),

  vaultSchema: z.object({
    pool_id: z.string().uuid().optional(),
    name: z.string().min(1, 'Vault name is required'),
    chain: z.string().min(1, 'Chain is required'),
    apy: z.number().positive(),
    tvl: z.number().positive(),
    deposited_amount: z.number().positive(),
    risk_level: z.enum(['Low', 'Medium', 'High']),
  }),
}