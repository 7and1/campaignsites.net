/**
 * Rate limiting for Next.js Server Actions
 * Provides per-IP rate limiting for expensive operations like OpenAI API calls
 */

import { headers } from 'next/headers'
import { checkRateLimit } from './rate-limit'

/**
 * Rate limit configuration for server actions
 */
export interface ServerActionRateLimitConfig {
  /** Maximum number of requests allowed */
  limit: number
  /** Time window in milliseconds */
  window: number
  /** Identifier for this rate limit (e.g., 'openai-calls') */
  identifier: string
}

/**
 * Error thrown when rate limit is exceeded
 */
export class RateLimitError extends Error {
  constructor(
    message: string,
    public resetAt: number,
    public limit: number,
    public remaining: number
  ) {
    super(message)
    this.name = 'RateLimitError'
  }
}

/**
 * Get IP address from server action context
 * Uses Web Crypto API for secure hashing
 * Returns a fallback identifier in test/development environments
 */
async function getServerActionIdentifier(): Promise<string> {
  try {
    const headersList = await headers()
    const ip =
      headersList.get('cf-connecting-ip') ||
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headersList.get('x-real-ip') ||
      'anonymous'

    // Use Web Crypto API for secure IP hashing
    const secret = process.env.PAYLOAD_SECRET || 'fallback-secret'
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(ip))
    return Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2, '0')).join('')
  } catch (error) {
    // In test/development environments where headers() is not available,
    // return a consistent test identifier
    if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
      return 'test-identifier'
    }
    throw error
  }
}

/**
 * Rate limit wrapper for server actions
 * Throws RateLimitError if limit is exceeded
 *
 * @example
 * ```ts
 * export async function myServerAction(input: string) {
 *   await withServerActionRateLimit({
 *     limit: 10,
 *     window: 60 * 60 * 1000, // 1 hour
 *     identifier: 'my-action',
 *   })
 *
 *   // Your action logic here
 * }
 * ```
 */
export async function withServerActionRateLimit(
  config: ServerActionRateLimitConfig
): Promise<void> {
  const identifier = await getServerActionIdentifier()

  const result = await checkRateLimit(identifier, config)

  if (!result.success) {
    throw new RateLimitError(
      `Rate limit exceeded. Try again after ${new Date(result.resetAt).toISOString()}`,
      result.resetAt,
      result.limit,
      result.remaining
    )
  }
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError
}
