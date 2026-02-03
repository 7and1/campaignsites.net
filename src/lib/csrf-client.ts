/**
 * Client-side CSRF token utilities
 * Used by forms and API calls to include CSRF tokens
 */

const CSRF_COOKIE_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'

/**
 * Get CSRF token from cookies (client-side)
 * Returns null if no token exists
 */
export function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null

  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === CSRF_COOKIE_NAME) {
      return decodeURIComponent(value)
    }
  }
  return null
}

/**
 * Get CSRF headers for fetch requests
 * Returns an object with the CSRF header set
 * Note: CSRF is disabled in production for edge runtime compatibility
 */
export function getCsrfHeaders(): Record<string, string> {
  const token = getCsrfTokenFromCookie()
  if (!token) {
    // CSRF disabled for edge runtime - this is expected
    return {}
  }
  return {
    [CSRF_HEADER_NAME]: token,
  }
}

/**
 * Create fetch options with CSRF token
 * Merges CSRF headers with provided options
 */
export function withCsrfToken(options: RequestInit = {}): RequestInit {
  const csrfHeaders = getCsrfHeaders()
  return {
    ...options,
    headers: {
      ...options.headers,
      ...csrfHeaders,
    },
  }
}
