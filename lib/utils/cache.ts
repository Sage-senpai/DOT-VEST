// FILE: lib/utils/cache.ts
// LOCATION: /lib/utils/cache.ts
// PURPOSE: Client-side caching utility
// ============================================
interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresIn: number
}

class ClientCache {
  private cache: Map<string, CacheEntry<any>> = new Map()

  set<T>(key: string, data: T, expiresIn: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    const isExpired = Date.now() - entry.timestamp > entry.expiresIn
    
    if (isExpired) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    const isExpired = Date.now() - entry.timestamp > entry.expiresIn
    if (isExpired) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

export const clientCache = new ClientCache()