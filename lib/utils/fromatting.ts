// FILE: lib/utils/formatting.ts
// ========================================
export const formatting = {
  /**
   * Format number as currency
   */
  formatCurrency(
    amount: number,
    currency: string = 'USD',
    decimals: number = 2
  ): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount)
  },

  /**
   * Format number with commas
   */
  formatNumber(amount: number, decimals: number = 2): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount)
  },

  /**
   * Format percentage
   */
  formatPercentage(value: number, decimals: number = 2): string {
    return `${value.toFixed(decimals)}%`
  },

  /**
   * Format large numbers with K, M, B suffixes
   */
  formatCompact(amount: number): string {
    if (amount >= 1_000_000_000) {
      return `$${(amount / 1_000_000_000).toFixed(2)}B`
    }
    if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(2)}M`
    }
    if (amount >= 1_000) {
      return `$${(amount / 1_000).toFixed(2)}K`
    }
    return `$${amount.toFixed(2)}`
  },

  /**
   * Format wallet address
   */
  formatAddress(address: string, start: number = 6, end: number = 4): string {
    if (address.length <= start + end) return address
    return `${address.slice(0, start)}...${address.slice(-end)}`
  },

  /**
   * Format date
   */
  formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
    const d = typeof date === 'string' ? new Date(date) : date

    if (format === 'long') {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d)
    }

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d)
  },

  /**
   * Format duration
   */
  formatDuration(months: number): string {
    if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''}`
    }
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    
    if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`
    }
    
    return `${years}y ${remainingMonths}m`
  },

  /**
   * Format token amount
   */
  formatTokenAmount(amount: number, symbol: string, decimals: number = 4): string {
    return `${amount.toFixed(decimals)} ${symbol}`
  },
}
