import { EMAIL_REGEX } from './constants'
import { escapeHtml, sanitizeUrl, validateEmail as strictValidateEmail } from './sanitization'

/**
 * Validate email address using simple regex
 * For stricter validation, use validateEmail from sanitization
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

/**
 * Validate email address with stricter checks
 * Wrapper for the comprehensive validateEmail in sanitization
 */
export { strictValidateEmail as validateEmailStrict }

/**
 * Validate URL
 */
export function isValidUrl(value: string): boolean {
  return sanitizeUrl(value) !== null
}

/**
 * Sanitize string input
 */
export function sanitizeString(value: unknown): string {
  return String(value || '').trim()
}

/**
 * Sanitize email (lowercase and trim)
 */
export function sanitizeEmail(value: unknown): string {
  return String(value || '').trim().toLowerCase()
}

/**
 * Type guard for non-null/undefined
 */
export function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

/**
 * Validate that all required fields are present
 */
export function validateRequiredFields(
  data: Record<string, unknown>,
  requiredFields: string[]
): { valid: boolean; missing: string[] } {
  const missing = requiredFields.filter((field) => !data[field])
  return {
    valid: missing.length === 0,
    missing,
  }
}

// Re-export sanitization functions for convenience
export { escapeHtml, sanitizeUrl }
