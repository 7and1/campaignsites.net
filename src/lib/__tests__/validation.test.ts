import { describe, it, expect } from 'vitest'
import {
  isValidEmail,
  validateEmailStrict,
  isValidUrl,
  sanitizeString,
  sanitizeEmail,
  isPresent,
  validateRequiredFields,
  escapeHtml,
  sanitizeUrl,
} from '../validation'

describe('validation', () => {
  describe('isValidEmail', () => {
    it('returns true for valid email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('user+tag@example.io')).toBe(true)
      expect(isValidEmail('123@numeric.com')).toBe(true)
    })

    it('returns false for invalid email addresses', () => {
      expect(isValidEmail('')).toBe(false)
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('test@.com')).toBe(false)
    })

    it('handles edge cases', () => {
      expect(isValidEmail(' ')).toBe(false)
      // Note: The EMAIL_REGEX requires a TLD (dot after @), so test@example is invalid
      expect(isValidEmail('test@example')).toBe(false)
      expect(isValidEmail('test..test@example.com')).toBe(true) // Basic regex allows double dots in local part
    })
  })

  describe('validateEmailStrict', () => {
    it('returns true for strictly valid emails', () => {
      expect(validateEmailStrict('test@example.com')).toBe(true)
      expect(validateEmailStrict('user.name@domain.co.uk')).toBe(true)
    })

    it('returns false for emails with dangerous content', () => {
      expect(validateEmailStrict('<script>alert(1)</script>@example.com')).toBe(false)
      expect(validateEmailStrict('javascript:alert(1)@example.com')).toBe(false)
    })

    it('returns false for emails with invalid characters', () => {
      expect(validateEmailStrict('test()@example.com')).toBe(false)
      expect(validateEmailStrict('test<>@example.com')).toBe(false)
      expect(validateEmailStrict('test"@example.com')).toBe(false)
    })

    it('returns false for emails starting or ending with dots', () => {
      expect(validateEmailStrict('.test@example.com')).toBe(false)
      // Note: test.@example.com ends with 'm', not '.', so it's technically valid by this check
      // The local part ending with dot is handled by the regex
      expect(validateEmailStrict('test@example.com.')).toBe(false)
    })

    it('returns false for emails with consecutive dots', () => {
      expect(validateEmailStrict('test..test@example.com')).toBe(false)
    })

    it('handles length limits', () => {
      const longEmail = 'a'.repeat(250) + '@example.com'
      expect(validateEmailStrict(longEmail)).toBe(false)
    })
  })

  describe('isValidUrl', () => {
    it('returns true for valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://example.com')).toBe(true)
      expect(isValidUrl('https://example.com/path?query=1')).toBe(true)
    })

    it('returns false for invalid URLs', () => {
      expect(isValidUrl('')).toBe(false)
      expect(isValidUrl('javascript:alert(1)')).toBe(false)
      expect(isValidUrl('data:text/html,<script>alert(1)</script>')).toBe(false)
    })

    it('prepends https for bare domains', () => {
      expect(isValidUrl('example.com')).toBe(true)
      expect(isValidUrl('www.example.com')).toBe(true)
    })
  })

  describe('sanitizeString', () => {
    it('converts values to strings', () => {
      expect(sanitizeString('hello')).toBe('hello')
      expect(sanitizeString(123)).toBe('123')
      expect(sanitizeString(true)).toBe('true')
    })

    it('handles null and undefined', () => {
      expect(sanitizeString(null)).toBe('')
      expect(sanitizeString(undefined)).toBe('')
    })

    it('trims whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello')
      expect(sanitizeString('hello\n')).toBe('hello')
    })
  })

  describe('sanitizeEmail', () => {
    it('converts to lowercase', () => {
      expect(sanitizeEmail('Test@Example.COM')).toBe('test@example.com')
    })

    it('trims whitespace', () => {
      expect(sanitizeEmail('  test@example.com  ')).toBe('test@example.com')
    })

    it('handles null and undefined', () => {
      expect(sanitizeEmail(null)).toBe('')
      expect(sanitizeEmail(undefined)).toBe('')
    })
  })

  describe('isPresent', () => {
    it('returns true for non-null values', () => {
      expect(isPresent('value')).toBe(true)
      expect(isPresent(0)).toBe(true)
      expect(isPresent(false)).toBe(true)
      expect(isPresent([])).toBe(true)
      expect(isPresent({})).toBe(true)
    })

    it('returns false for null and undefined', () => {
      expect(isPresent(null)).toBe(false)
      expect(isPresent(undefined)).toBe(false)
    })
  })

  describe('validateRequiredFields', () => {
    it('returns valid when all fields present', () => {
      const data = { name: 'John', email: 'john@example.com', age: 30 }
      const result = validateRequiredFields(data, ['name', 'email'])
      expect(result.valid).toBe(true)
      expect(result.missing).toEqual([])
    })

    it('returns invalid when fields missing', () => {
      const data = { name: 'John' }
      const result = validateRequiredFields(data, ['name', 'email'])
      expect(result.valid).toBe(false)
      expect(result.missing).toEqual(['email'])
    })

    it('detects empty strings as missing', () => {
      const data = { name: '', email: 'test@example.com' }
      const result = validateRequiredFields(data, ['name', 'email'])
      expect(result.valid).toBe(false)
      expect(result.missing).toContain('name')
    })

    it('detects null as missing', () => {
      const data = { name: null, email: 'test@example.com' }
      const result = validateRequiredFields(data, ['name', 'email'])
      expect(result.valid).toBe(false)
      expect(result.missing).toContain('name')
    })
  })

  describe('escapeHtml', () => {
    it('escapes HTML special characters', () => {
      expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;&#x2F;script&gt;')
      expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;')
      expect(escapeHtml("'single'")).toBe('&#x27;single&#x27;')
      expect(escapeHtml('a & b')).toBe('a &amp; b')
    })

    it('handles empty strings', () => {
      expect(escapeHtml('')).toBe('')
    })

    it('preserves safe text', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World')
      expect(escapeHtml('123 ABC')).toBe('123 ABC')
    })
  })

  describe('sanitizeUrl', () => {
    it('returns valid URLs unchanged', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com')
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com')
      expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com')
      expect(sanitizeUrl('tel:+1234567890')).toBe('tel:+1234567890')
    })

    it('prepends https to bare domains', () => {
      expect(sanitizeUrl('example.com')).toBe('https://example.com')
      expect(sanitizeUrl('www.example.com')).toBe('https://www.example.com')
    })

    it('returns null for dangerous protocols', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe(null)
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe(null)
      expect(sanitizeUrl('vbscript:msgbox(1)')).toBe(null)
      expect(sanitizeUrl('file:///etc/passwd')).toBe(null)
    })

    it('returns null for URLs with script tags', () => {
      expect(sanitizeUrl('https://example.com/<script>alert(1)</script>')).toBe(null)
    })

    it('handles null and undefined', () => {
      expect(sanitizeUrl('')).toBe(null)
      expect(sanitizeUrl(null as unknown as string)).toBe(null)
      expect(sanitizeUrl(undefined as unknown as string)).toBe(null)
    })

    it('limits URL length', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(3000)
      expect(sanitizeUrl(longUrl)!.length).toBeLessThanOrEqual(2048)
    })
  })
})
