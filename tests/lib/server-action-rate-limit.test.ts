import { describe, it, expect, vi, beforeEach } from 'vitest'
import { withServerActionRateLimit, isRateLimitError, RateLimitError } from '@/lib/server-action-rate-limit'

// Mock dependencies
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
  ensureRateLimitTable: vi.fn(),
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn((key: string) => {
      if (key === 'cf-connecting-ip') return '192.168.1.1'
      return null
    }),
  })),
}))

describe('Server Action Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.PAYLOAD_SECRET = 'test-secret'
  })

  describe('withServerActionRateLimit', () => {
    it('allows request when rate limit not exceeded', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limit')
      vi.mocked(checkRateLimit).mockResolvedValue({
        success: true,
        limit: 10,
        remaining: 9,
        resetAt: Date.now() + 3600000,
      })

      await expect(
        withServerActionRateLimit({
          limit: 10,
          window: 3600000,
          identifier: 'test-action',
        })
      ).resolves.toBeUndefined()
    })

    it('throws RateLimitError when rate limit exceeded', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limit')
      const resetAt = Date.now() + 3600000
      vi.mocked(checkRateLimit).mockResolvedValue({
        success: false,
        limit: 10,
        remaining: 0,
        resetAt,
      })

      await expect(
        withServerActionRateLimit({
          limit: 10,
          window: 3600000,
          identifier: 'test-action',
        })
      ).rejects.toThrow(RateLimitError)
    })

    it('includes reset time in error message', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limit')
      const resetAt = Date.now() + 3600000
      vi.mocked(checkRateLimit).mockResolvedValue({
        success: false,
        limit: 10,
        remaining: 0,
        resetAt,
      })

      try {
        await withServerActionRateLimit({
          limit: 10,
          window: 3600000,
          identifier: 'test-action',
        })
        expect.fail('Should have thrown RateLimitError')
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError)
        if (error instanceof RateLimitError) {
          expect(error.resetAt).toBe(resetAt)
          expect(error.limit).toBe(10)
          expect(error.remaining).toBe(0)
        }
      }
    })
  })

  describe('isRateLimitError', () => {
    it('returns true for RateLimitError instances', () => {
      const error = new RateLimitError('Rate limit exceeded', Date.now(), 10, 0)
      expect(isRateLimitError(error)).toBe(true)
    })

    it('returns false for regular errors', () => {
      const error = new Error('Regular error')
      expect(isRateLimitError(error)).toBe(false)
    })

    it('returns false for non-error values', () => {
      expect(isRateLimitError('string')).toBe(false)
      expect(isRateLimitError(null)).toBe(false)
      expect(isRateLimitError(undefined)).toBe(false)
      expect(isRateLimitError({})).toBe(false)
    })
  })

  describe('RateLimitError', () => {
    it('contains all required properties', () => {
      const resetAt = Date.now() + 3600000
      const error = new RateLimitError('Test message', resetAt, 10, 0)

      expect(error.message).toBe('Test message')
      expect(error.resetAt).toBe(resetAt)
      expect(error.limit).toBe(10)
      expect(error.remaining).toBe(0)
      expect(error.name).toBe('RateLimitError')
    })

    it('is an instance of Error', () => {
      const error = new RateLimitError('Test', Date.now(), 10, 0)
      expect(error).toBeInstanceOf(Error)
    })
  })
})
