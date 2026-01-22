/**
 * Input sanitization utilities
 * Prevents XSS and injection attacks
 */

/**
 * HTML entity encode for safe display in HTML context
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Sanitize content for display - removes HTML and dangerous content
 * Used for user-generated content like comments
 */
export function sanitizeContent(content: string): string {
  if (typeof content !== 'string') return ''

  return content
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove other potentially dangerous tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    // Remove all remaining HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove on* event handlers
    .replace(/\son\w+\s*=/gi, '')
    // Remove data URLs that could execute scripts
    .replace(/data:text\/html/gi, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Sanitize UTM parameters
 * Prevents injection via tracking parameters
 */
export function sanitizeUtm(params: Record<string, string | null | undefined>): Record<string, string | null> {
  const sanitized: Record<string, string | null> = {}

  for (const [key, value] of Object.entries(params)) {
    if (!value || typeof value !== 'string') {
      sanitized[key] = null
      continue
    }

    // Remove any HTML, script tags, or dangerous patterns
    sanitized[key] = value
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100) // Limit length
  }

  return sanitized
}

/**
 * Validate and sanitize URL
 * Returns null if URL is dangerous
 */
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null

  const trimmed = url.trim().substring(0, 2048)

  // Block dangerous protocols
  const lower = trimmed.toLowerCase()
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return null
  }

  // Block script tags in URL
  if (/<script/i.test(trimmed)) {
    return null
  }

  // Only allow http, https, mailto, tel
  if (
    !lower.startsWith('http://') &&
    !lower.startsWith('https://') &&
    !lower.startsWith('mailto:') &&
    !lower.startsWith('tel:')
  ) {
    // Try to prepend https for bare domains
    if (/^[a-z0-9-]+(\.[a-z0-9-]+)+/.test(trimmed)) {
      return `https://${trimmed}`
    }
    return null
  }

  return trimmed
}

/**
 * Validate email format more strictly than basic regex
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false

  const trimmed = email.trim().toLowerCase()

  // Basic checks
  if (trimmed.length > 254) return false
  if (trimmed.length < 3) return false
  if (!trimmed.includes('@')) return false
  if (trimmed.startsWith('.') || trimmed.endsWith('.')) return false
  if (trimmed.includes('..')) return false
  if (/[()<>,;:"[\]]/.test(trimmed)) return false

  // Check for dangerous patterns
  if (/<script/i.test(trimmed)) return false
  if (/javascript:/i.test(trimmed)) return false

  // RFC 5322 compliant basic pattern
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return emailRegex.test(trimmed)
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Safe JSON stringify that handles circular references
 */
export function safeJsonStringify(obj: unknown, space?: number): string {
  try {
    return JSON.stringify(
      obj,
      (_, value) => {
        if (typeof value === 'function') return '[Function]'
        if (value instanceof Error) return value.message
        return value
      },
      space
    )
  } catch {
    return '{}'
  }
}
