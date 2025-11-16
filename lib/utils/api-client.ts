// FILE: lib/utils/api-client.ts (FIXED)
// LOCATION: /lib/utils/api-client.ts
// ============================================
import { clientCache } from './cache'

interface CustomRequestOptions {
  useCache?: boolean
  cacheTime?: number
  retries?: number
  retryDelay?: number
  headers?: HeadersInit
  body?: BodyInit
}

class APIClient {
  private baseURL: string

  constructor(baseURL: string = '') {
    this.baseURL = baseURL
  }

  private async fetchWithRetry(
    url: string,
    options: CustomRequestOptions & RequestInit = {},
    attempt: number = 1
  ): Promise<Response> {
    const { retries = 3, retryDelay = 1000, ...fetchOptions } = options

    try {
      const response = await fetch(url, fetchOptions)
      
      if (!response.ok && attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
        return this.fetchWithRetry(url, options, attempt + 1)
      }
      
      return response
    } catch (error) {
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
        return this.fetchWithRetry(url, options, attempt + 1)
      }
      throw error
    }
  }

  async get<T>(endpoint: string, options: CustomRequestOptions = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const cacheKey = `GET:${url}`

    if (options.useCache !== false && clientCache.has(cacheKey)) {
      console.log(`[Cache] Hit: ${cacheKey}`)
      return clientCache.get<T>(cacheKey)!
    }

    const response = await this.fetchWithRetry(url, {
      ...options,
      method: 'GET',
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    if (options.useCache !== false) {
      clientCache.set(cacheKey, data, options.cacheTime || 300000)
    }

    return data
  }

  async post<T>(endpoint: string, body: any, options: CustomRequestOptions = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const response = await this.fetchWithRetry(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }
}

export const apiClient = new APIClient()