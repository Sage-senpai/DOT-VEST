// FILE: types/database.types.ts
// ============================================
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          wallet_address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          wallet_address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          wallet_address?: string | null
          updated_at?: string
        }
      }
      pools: {
        Row: {
          id: string
          name: string
          symbol: string
          tvl: number
          risk_level: string
          protocols: Json
          apy_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          symbol: string
          tvl: number
          risk_level: string
          protocols?: Json
          apy_data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          symbol?: string
          tvl?: number
          risk_level?: string
          protocols?: Json
          apy_data?: Json
          updated_at?: string
        }
      }
      vaults: {
        Row: {
          id: string
          user_id: string
          pool_id: string | null
          name: string
          chain: string
          apy: number
          tvl: number
          deposited_amount: number
          earned_amount: number
          risk_level: string
          strategy_details: Json | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pool_id?: string | null
          name: string
          chain: string
          apy: number
          tvl: number
          deposited_amount: number
          earned_amount?: number
          risk_level: string
          strategy_details?: Json | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          pool_id?: string | null
          name?: string
          chain?: string
          apy?: number
          tvl?: number
          deposited_amount?: number
          earned_amount?: number
          risk_level?: string
          strategy_details?: Json | null
          status?: string
          updated_at?: string
        }
      }
      strategies: {
        Row: {
          id: string
          user_id: string
          pool_id: string | null
          token_name: string
          amount: number
          duration: number
          protocol: string
          apy: number
          estimated_return: number | null
          status: string
          executed_at: string | null
          completed_at: string | null
          transaction_hash: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pool_id?: string | null
          token_name: string
          amount: number
          duration: number
          protocol: string
          apy: number
          estimated_return?: number | null
          status?: string
          executed_at?: string | null
          completed_at?: string | null
          transaction_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          pool_id?: string | null
          token_name?: string
          amount?: number
          duration?: number
          protocol?: string
          apy?: number
          estimated_return?: number | null
          status?: string
          executed_at?: string | null
          completed_at?: string | null
          transaction_hash?: string | null
          updated_at?: string
        }
      }
      analytics: {
        Row: {
          id: string
          user_id: string
          date: string
          total_yield: number
          total_fees: number
          net_profit: number
          portfolio_value: number
          chain_performance: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          total_yield?: number
          total_fees?: number
          net_profit?: number
          portfolio_value?: number
          chain_performance?: Json | null
          created_at?: string
        }
        Update: {
          date?: string
          total_yield?: number
          total_fees?: number
          net_profit?: number
          portfolio_value?: number
          chain_performance?: Json | null
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          vault_id: string | null
          strategy_id: string | null
          type: string
          amount: number
          token: string
          transaction_hash: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vault_id?: string | null
          strategy_id?: string | null
          type: string
          amount: number
          token: string
          transaction_hash?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          vault_id?: string | null
          strategy_id?: string | null
          type?: string
          amount?: number
          token?: string
          transaction_hash?: string | null
          status?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
