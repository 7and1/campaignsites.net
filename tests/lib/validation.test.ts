import { describe, it, expect } from 'vitest'

describe('Validation Utilities', () => {
  describe('Email Validation', () => {
    const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email)

    it('accepts valid email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true)
      expect(isValidEmail('user.name@example.com')).toBe(true)
      expect(isValidEmail('user+tag@example.com')).toBe(true)
      expect(isValidEmail('user@subdomain.example.com')).toBe(true)
      expect(isValidEmail('test@test.co.uk')).toBe(true)
    })

    it('rejects invalid email addresses', () => {
      expect(isValidEmail('')).toBe(false)
      expect(isValidEmail('notanemail')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('user@')).toBe(false)
      expect(isValidEmail('user@.com')).toBe(false)
      expect(isValidEmail('user example.com')).toBe(false)
    })

    it('handles edge cases', () => {
      expect(isValidEmail('a@b.c')).toBe(true)
      expect(isValidEmail('123@456.789')).toBe(true)
      expect(isValidEmail('USER@EXAMPLE.COM')).toBe(true)
    })
  })

  describe('URL Validation (basic)', () => {
    it('accepts valid URLs', () => {
      expect(() => new URL('https://example.com')).not.toThrow()
      expect(() => new URL('http://example.com')).not.toThrow()
    })

    it('rejects invalid URLs', () => {
      expect(() => new URL('not a url')).toThrow()
      expect(() => new URL('ht!tp://example.com')).toThrow()
    })
  })

  describe('String Sanitization', () => {
    const sanitize = (value: string) => String(value).trim()

    it('trims whitespace', () => {
      expect(sanitize('  test  ')).toBe('test')
      expect(sanitize('\tvalue\n')).toBe('value')
    })

    it('converts to string', () => {
      expect(sanitize(123 as unknown as string)).toBe('123')
    })
  })

  describe('Required Field Validation', () => {
    const hasRequiredFields = (
      obj: Record<string, unknown>,
      required: string[]
    ): boolean => {
      return required.every((field) => {
        const value = obj[field]
        return value !== null && value !== undefined && String(value).trim() !== ''
      })
    }

    it('validates all required fields are present', () => {
      expect(
        hasRequiredFields(
          { name: 'John', email: 'john@example.com' },
          ['name', 'email']
        )
      ).toBe(true)

      expect(
        hasRequiredFields(
          { name: '  ', email: 'john@example.com' },
          ['name', 'email']
        )
      ).toBe(false)

      expect(
        hasRequiredFields({ name: 'John' }, ['name', 'email'])
      ).toBe(false)
    })
  })
})
