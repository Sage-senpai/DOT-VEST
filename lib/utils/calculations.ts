// FILE: lib/utils/calculations.ts
// ========================================
import Decimal from 'decimal.js'

export const calculations = {
  /**
   * Calculate compound interest returns
   */
  calculateCompoundReturn(
    principal: number,
    apy: number,
    duration: number // in months
  ): number {
    const rate = apy / 100
    const years = duration / 12
    const amount = principal * Math.pow(1 + rate, years)
    return amount - principal
  },

  /**
   * Calculate simple interest returns
   */
  calculateSimpleReturn(
    principal: number,
    apy: number,
    duration: number // in months
  ): number {
    const rate = apy / 100
    const years = duration / 12
    return principal * rate * years
  },

  /**
   * Calculate APY from APR
   */
  aprToApy(apr: number, compoundingFrequency: number = 365): number {
    return (Math.pow(1 + apr / compoundingFrequency, compoundingFrequency) - 1) * 100
  },

  /**
   * Calculate portfolio allocation percentage
   */
  calculateAllocation(amount: number, total: number): number {
    if (total === 0) return 0
    return (amount / total) * 100
  },

  /**
   * Calculate total portfolio value
   */
  calculatePortfolioValue(vaults: any[]): number {
    return vaults.reduce((total, vault) => {
      const deposited = parseFloat(vault.deposited_amount.toString())
      const earned = parseFloat(vault.earned_amount.toString())
      return total + deposited + earned
    }, 0)
  },

  /**
   * Calculate weighted average APY
   */
  calculateWeightedAPY(vaults: any[]): number {
    if (vaults.length === 0) return 0

    const totalValue = vaults.reduce((sum, v) => 
      sum + parseFloat(v.deposited_amount.toString()), 0
    )

    if (totalValue === 0) return 0

    const weightedSum = vaults.reduce((sum, v) => {
      const amount = parseFloat(v.deposited_amount.toString())
      const apy = parseFloat(v.apy.toString())
      return sum + (amount * apy)
    }, 0)

    return weightedSum / totalValue
  },

  /**
   * Calculate impermanent loss
   */
  calculateImpermanentLoss(
    priceRatio: number // ratio of price change
  ): number {
    const il = 2 * Math.sqrt(priceRatio) / (1 + priceRatio) - 1
    return Math.abs(il) * 100
  },
}
