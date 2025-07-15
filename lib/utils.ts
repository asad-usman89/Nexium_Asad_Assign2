/**
 * Rate limiter utility for API calls
 */
export class RateLimiter {
  private static instances = new Map<string, RateLimiter>()
  private lastCall = 0
  private minInterval: number

  constructor(private key: string, minIntervalMs: number = 1000) {
    this.minInterval = minIntervalMs
  }

  static getInstance(key: string, minIntervalMs: number = 1000): RateLimiter {
    if (!this.instances.has(key)) {
      this.instances.set(key, new RateLimiter(key, minIntervalMs))
    }
    return this.instances.get(key)!
  }

  async throttle<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now()
    const timeSinceLastCall = now - this.lastCall
    
    if (timeSinceLastCall < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastCall
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    
    this.lastCall = Date.now()
    return await fn()
  }
}

/**
 * Retry utility for failed operations
 */
export class RetryHandler {
  static async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        
        if (i === maxRetries) {
          throw lastError
        }
        
        // Exponential backoff
        const delay = delayMs * Math.pow(2, i)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError!
  }
}

/**
 * Response validator for API responses
 */
export class ResponseValidator {
  static validateJson(text: string): any {
    try {
      // Clean common markdown formatting
      const cleanText = text
        .replace(/```json\n?|\n?```/g, '')
        .replace(/```\n?|\n?```/g, '')
        .trim()
      
      return JSON.parse(cleanText)
    } catch (error) {
      throw new Error(`Invalid JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  static validateSummaryResponse(response: any): boolean {
    return (
      response &&
      typeof response === 'object' &&
      typeof response.summary === 'string' &&
      Array.isArray(response.keyPoints)
    )
  }
  
  static validateTranslationResponse(response: any): boolean {
    return (
      response &&
      typeof response === 'object' &&
      typeof response.summaryUrdu === 'string'
    )
  }
}
