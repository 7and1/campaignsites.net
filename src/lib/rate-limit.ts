/**
 * Rate limiting utility for API routes
 * Uses in-memory Map with D1 as persistent backing when available
 */

import { getDatabase } from './analytics'

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory storage for rate limits (fallback when D1 unavailable)
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
    const db = await getDatabase()

    // Try to use D1 for persistent rate limiting
    const { results } = await db
      .prepare(
        `SELECT count, reset_at FROM rate_limits WHERE key = ?`
      )
      .bind(key)
      .all()

    const entry = results[0] as { count: number; reset_at: string } | undefined

    if (entry) {
      const entryResetAt = parseInt(entry.reset_at)
      if (entryResetAt < now) {
        // Window expired, reset count
        await db
          .prepare(
            `UPDATE rate_limits SET count = 1, reset_at = ? WHERE key = ?`
          )
          .bind(String(resetAt), key)
          .run()
        return { success: true, limit, remaining: limit - 1, resetAt }
      }

      const newCount = entry.count + 1
      if (newCount > limit) {
        return { success: false, limit, remaining: 0, resetAt: entryResetAt }
      }

      await db
        .prepare(
          `UPDATE rate_limits SET count = ? WHERE key = ?`
        )
        .bind(newCount, key)
        .run()

      return { success: true, limit, remaining: limit - newCount, resetAt: entryResetAt }
    } else {
      // Create new entry
      await db
        .prepare(
          `INSERT INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?)`
        )
        .bind(key, String(resetAt))
        .run()
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

/**
 * Ensure rate limit table exists in D1
 */
export async function ensureRateLimitTable(): Promise<void> {
  try {
    const db = await getDatabase()
    await db.exec(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        key TEXT PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 1,
        reset_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON rate_limits(reset_at);
    `)
  } catch {
    // Silently fail if D1 unavailable
  }
}
