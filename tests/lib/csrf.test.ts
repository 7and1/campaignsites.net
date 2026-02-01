import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateCsrfToken, validateCsrfToken } from '@/lib/csrf'

// Mock next/headers
const mockGet = vi.fn()
const mockSet = vi.fn()
const mockDelete = vi.fn()

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve({
    get: mockGet,
    set: mockSet,
    delete: mockDelete,
  })),
}))

describe('CSRF Protection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockReturnValue(undefined)
  })

  describe('generateCsrfToken', () => {
    it('generates a token of correct length', () => {
      const token = generateCsrfToken()
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      // 32 bytes = 64 hex characters
      expect(token.length).toBe(64)
    })

    it('generates unique tokens', () => {
      const token1 = generateCsrfToken()
      const token2 = generateCsrfToken()
      expect(token1).not.toBe(token2)
    })

    it('generates hex-only tokens', () => {
      const token = generateCsrfToken()
      expect(/^[0-9a-f]+$/i.test(token)).toBe(true)
    })
  })

  describe('validateCsrfToken', () => {
    it('throws error when request token is null', async () => {
      await expect(validateCsrfToken(null)).rejects.toThrow('CSRF token is missing')
    })

    it('throws error when cookie token is missing', async () => {
      mockGet.mockReturnValue(undefined)
      await expect(validateCsrfToken('a'.repeat(64))).rejects.toThrow('CSRF cookie is missing')
    })

    it('throws error when request token is invalid format', async () => {
      mockGet.mockReturnValue({
        name: 'csrf_token',
        value: 'a'.repeat(64)
      })

      await expect(validateCsrfToken('invalid-token!')).rejects.toThrow('Invalid CSRF token format')
    })

    it('throws error when tokens have different lengths', async () => {
      mockGet.mockReturnValue({
        name: 'csrf_token',
        value: 'a'.repeat(64)
      })

      await expect(validateCsrfToken('b'.repeat(32))).rejects.toThrow('Invalid CSRF token')
    })

    it('throws error when tokens do not match', async () => {
      mockGet.mockReturnValue({
        name: 'csrf_token',
        value: 'a'.repeat(64)
      })

      await expect(validateCsrfToken('b'.repeat(64))).rejects.toThrow('Invalid CSRF token')
    })
  })
})
