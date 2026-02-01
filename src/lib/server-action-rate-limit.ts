/**
 * Rate limiting for Next.js Server Actions
 * Provides per-IP rate limiting for expensive operations like OpenAI API calls
 */

import { headers } from 'next/headers'
import { checkRateLimit } from './rate-limit'
import crypto from 'crypto'

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
 * Uses HMAC-SHA256 for secure hashing
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

    // Use HMAC-SHA256 for secure IP hashing
    const secret = process.env.PAYLOAD_SECRET || 'fallback-secret'
    return crypto.createHmac('sha256', secret).update(ip).digest('hex')
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
