/**
 * Email unsubscribe utilities
 * Generates secure unsubscribe tokens and links
 */

/**
 * Generate secure unsubscribe token for an email address
 */
export async function generateUnsubscribeToken(email: string): Promise<string> {
  const secret = process.env.PAYLOAD_SECRET || 'fallback-secret'
  const encoder = new TextEncoder()
  const data = encoder.encode(`${email}:${secret}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Generate secure preferences token for an email address
 */
export async function generatePreferencesToken(email: string): Promise<string> {
  const secret = process.env.PAYLOAD_SECRET || 'fallback-secret'
  const encoder = new TextEncoder()
  const data = encoder.encode(`${email}:preferences:${secret}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Generate one-click unsubscribe link (RFC 8058 compliant)
 */
export async function generateUnsubscribeLink(email: string, baseUrl?: string): Promise<string> {
  const token = await generateUnsubscribeToken(email)
  const base = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://campaignsites.net'
  return `${base}/api/v1/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`
}

/**
 * Generate preference center link
 */
export async function generatePreferencesLink(email: string, baseUrl?: string): Promise<string> {
  const token = await generatePreferencesToken(email)
  const base = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://campaignsites.net'
  return `${base}/preferences?email=${encodeURIComponent(email)}&token=${token}`
}

/**
 * Generate List-Unsubscribe header value (RFC 8058)
 * Returns both mailto and https methods
 */
export async function generateListUnsubscribeHeader(email: string): Promise<string> {
  const unsubscribeLink = await generateUnsubscribeLink(email)
  const mailtoLink = `mailto:unsubscribe@campaignsites.net?subject=Unsubscribe%20${encodeURIComponent(email)}`
  return `<${unsubscribeLink}>, <${mailtoLink}>`
}

/**
 * Generate List-Unsubscribe-Post header value (RFC 8058)
 * Enables one-click unsubscribe in email clients
 */
export function generateListUnsubscribePostHeader(): string {
  return 'List-Unsubscribe=One-Click'
}
