/**
 * Rate limiting utility for API routes
 * Uses Cloudflare KV for edge-optimized rate limiting (10x faster than D1)
 */

import { getCloudflareEnv } from './cloudflare'

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory storage for rate limits (fallback when KV unavailable)
const inMemoryStore = new Map<string, RateLimitEntry>()

// Clean up expired entries from in-memory store periodically
const CLEANUP_INTERVAL = 60_000 // 1 minute

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of inMemoryStore.entries()) {
    if (entry.resetAt < now) {
      inMemoryStore.delete(key)
    }
  }
}, CLEANUP_INTERVAL)

export interface RateLimitConfig {
  /** Maximum number of requests allowed */
  limit: number
  /** Time window in milliseconds */
  window: number
  /** Custom identifier for the rate limit key */
  identifier?: string
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetAt: number
}

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier for the requester (e.g., IP hash)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { limit, window } = config
  const now = Date.now()
  const resetAt = now + window
  const key = `ratelimit:${config.identifier || 'default'}:${identifier}`

  try {
    const env = await getCloudflareEnv()
    const kv = env?.RATE_LIMIT_KV as KVNamespace | undefined

    if (!kv) {
      throw new Error('KV not available')
    }

    // Try to use Cloudflare KV for edge-optimized rate limiting
    const stored = await kv.get(key, 'json') as RateLimitEntry | null

    if (stored) {
      const entryResetAt = stored.resetAt
      if (entryResetAt < now) {
        // Window expired, reset count
        const newEntry: RateLimitEntry = { count: 1, resetAt }
        await kv.put(key, JSON.stringify(newEntry), {
          expirationTtl: Math.ceil(window / 1000),
        })
        return { success: true, limit, remaining: limit - 1, resetAt }
      }

      const newCount = stored.count + 1
      if (newCount > limit) {
        return { success: false, limit, remaining: 0, resetAt: entryResetAt }
      }

      const updatedEntry: RateLimitEntry = { count: newCount, resetAt: entryResetAt }
      await kv.put(key, JSON.stringify(updatedEntry), {
        expirationTtl: Math.ceil((entryResetAt - now) / 1000),
      })

      return { success: true, limit, remaining: limit - newCount, resetAt: entryResetAt }
    } else {
      // Create new entry
      const newEntry: RateLimitEntry = { count: 1, resetAt }
      await kv.put(key, JSON.stringify(newEntry), {
        expirationTtl: Math.ceil(window / 1000),
      })
      return { success: true, limit, remaining: limit - 1, resetAt }
    }
  } catch {
    // Fall back to in-memory rate limiting
    const entry = inMemoryStore.get(key)

    if (!entry || entry.resetAt < now) {
      inMemoryStore.set(key, { count: 1, resetAt })
      return { success: true, limit, remaining: limit - 1, resetAt }
    }

    const newCount = entry.count + 1
    if (newCount > limit) {
      return { success: false, limit, remaining: 0, resetAt: entry.resetAt }
    }

    entry.count = newCount
    inMemoryStore.set(key, entry)
    return { success: true, limit, remaining: limit - newCount, resetAt: entry.resetAt }
  }
}

/**
 * Extract and hash IP from request headers for rate limiting
 */
export function getRateLimitIdentifier(request: Request): string {
  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'anonymous'

  // Simple hash for in-memory use
  let hash = 0
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}
