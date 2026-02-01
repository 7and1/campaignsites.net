import crypto from 'crypto'
import { cookies } from 'next/headers'

const CSRF_COOKIE_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'
const CSRF_TOKEN_LENGTH = 32
const CSRF_COOKIE_MAX_AGE = 60 * 60 * 24 // 24 hours

/**
 * Export constants for client-side usage
 */
export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME }

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex')
}

/**
 * Set CSRF token cookie
 * Should be called when generating a form or at session start
 */
export async function setCsrfCookie(): Promise<string> {
  const token = generateCsrfToken()
  const cookieStore = await cookies()

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: CSRF_COOKIE_MAX_AGE,
    path: '/',
  })

  return token
}

/**
 * Get the current CSRF token from cookies
 * Returns null if no token exists
 */
export async function getCsrfToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(CSRF_COOKIE_NAME)
  return token?.value ?? null
}

/**
 * Validate CSRF token from request
 * Checks against the token stored in the cookie
 * @throws Error if token is missing or invalid
 */
export async function validateCsrfToken(requestToken: string | null): Promise<void> {
  if (!requestToken) {
    throw new Error('CSRF token is missing')
  }

  const cookieToken = await getCsrfToken()

  if (!cookieToken) {
    throw new Error('CSRF cookie is missing')
  }

  // Validate token format (should be hex string)
  if (!/^[0-9a-f]+$/i.test(requestToken) || !/^[0-9a-f]+$/i.test(cookieToken)) {
    throw new Error('Invalid CSRF token format')
  }

  // Ensure both tokens are the same length for timing-safe comparison
  if (requestToken.length !== cookieToken.length) {
    throw new Error('Invalid CSRF token')
  }

  try {
    // Use timing-safe comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(requestToken, 'hex'),
      Buffer.from(cookieToken, 'hex')
    )

    if (!isValid) {
      throw new Error('Invalid CSRF token')
    }
  } catch (error) {
    // Handle any errors from timingSafeEqual (e.g., buffer length mismatch)
    throw new Error('Invalid CSRF token')
  }
}

/**
 * Get the CSRF token header name for client-side usage
 */
export function getCsrfHeaderName(): string {
  return CSRF_HEADER_NAME
}

/**
 * Clear the CSRF cookie (e.g., on logout)
 */
export async function clearCsrfCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(CSRF_COOKIE_NAME)
}

/**
 * Rotate CSRF token (generate new token and update cookie)
 * Should be called on sensitive operations or periodically
 */
export async function rotateCsrfToken(): Promise<string> {
  await clearCsrfCookie()
  return setCsrfCookie()
}
