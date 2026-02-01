import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { checkRateLimit, getRateLimitIdentifier, ensureRateLimitTable } from '../rate-limit'
import * as analytics from '../analytics'

// Mock the analytics module
vi.mock('../analytics', () => ({
  getDatabase: vi.fn(),
}))

describe('rate-limit', () => {
  let mockDb: {
    prepare: ReturnType<typeof vi.fn>
    exec: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.useFakeTimers()
    mockDb = {
      prepare: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue(undefined),
    }
    vi.mocked(analytics.getDatabase).mockResolvedValue(mockDb as unknown as ReturnType<typeof analytics.getDatabase>)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('checkRateLimit', () => {
    it('allows first request and creates new entry', async () => {
      mockDb.prepare.mockReturnValueOnce({
        bind: vi.fn().mockReturnThis(),
        all: vi.fn().mockResolvedValue({ results: [] }),
      })
      mockDb.prepare.mockReturnValueOnce({
        bind: vi.fn().mockReturnThis(),
        run: vi.fn().mockResolvedValue(undefined),
      })

      const result = await checkRateLimit('user123', { limit: 5, window: 60000 })

      expect(result.success).toBe(true)
      expect(result.limit).toBe(5)
      expect(result.remaining).toBe(4)
    })

    it('increments count for subsequent requests', async () => {
      const now = Date.now()
      vi.setSystemTime(now)

      mockDb.prepare.mockReturnValueOnce({
        bind: vi.fn().mockReturnThis(),
        all: vi.fn().mockResolvedValue({
          results: [{ count: 2, reset_at: String(now + 60000) }],
        }),
      })
      mockDb.prepare.mockReturnValueOnce({
        bind: vi.fn().mockReturnThis(),
        run: vi.fn().mockResolvedValue(undefined),
      })

      const result = await checkRateLimit('user123', { limit: 5, window: 60000 })

      expect(result.success).toBe(true)
      expect(result.remaining).toBe(2)
    })

    it('blocks requests when limit exceeded', async () => {
      const now = Date.now()
      vi.setSystemTime(now)

      mockDb.prepare.mockReturnValueOnce({
        bind: vi.fn().mockReturnThis(),
        all: vi.fn().mockResolvedValue({
          results: [{ count: 5, reset_at: String(now + 60000) }],
        }),
      })

      const result = await checkRateLimit('user123', { limit: 5, window: 60000 })

      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('resets count when window expires', async () => {
      const now = Date.now()
      vi.setSystemTime(now)

      mockDb.prepare.mockReturnValueOnce({
        bind: vi.fn().mockReturnThis(),
        all: vi.fn().mockResolvedValue({
          results: [{ count: 5, reset_at: String(now - 1000) }], // Expired
        }),
      })
      mockDb.prepare.mockReturnValueOnce({
        bind: vi.fn().mockReturnThis(),
        run: vi.fn().mockResolvedValue(undefined),
      })

      const result = await checkRateLimit('user123', { limit: 5, window: 60000 })

      expect(result.success).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('uses custom identifier in key', async () => {
      const mockBind = vi.fn().mockReturnThis()
      mockDb.prepare.mockReturnValueOnce({
        bind: mockBind,
        all: vi.fn().mockResolvedValue({ results: [] }),
      })
      mockDb.prepare.mockReturnValueOnce({
        bind: vi.fn().mockReturnThis(),
        run: vi.fn().mockResolvedValue(undefined),
      })

      await checkRateLimit('user123', { limit: 5, window: 60000, identifier: 'api' })

      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('SELECT count, reset_at FROM rate_limits WHERE key = ?')
      )
      expect(mockBind).toHaveBeenCalledWith('ratelimit:api:user123')
    })

    it('falls back to in-memory storage when D1 fails', async () => {
      vi.mocked(analytics.getDatabase).mockRejectedValue(new Error('D1 unavailable'))

      const result = await checkRateLimit('user123', { limit: 5, window: 60000 })

      expect(result.success).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('tracks in-memory rate limits correctly', async () => {
      vi.mocked(analytics.getDatabase).mockRejectedValue(new Error('D1 unavailable'))

      // First request
      const result1 = await checkRateLimit('user456', { limit: 2, window: 60000 })
      expect(result1.success).toBe(true)
      expect(result1.remaining).toBe(1)

      // Second request
      const result2 = await checkRateLimit('user456', { limit: 2, window: 60000 })
      expect(result2.success).toBe(true)
      expect(result2.remaining).toBe(0)

      // Third request - should be blocked
      const result3 = await checkRateLimit('user456', { limit: 2, window: 60000 })
      expect(result3.success).toBe(false)
      expect(result3.remaining).toBe(0)
    })

    it('resets in-memory rate limit after window expires', async () => {
      vi.mocked(analytics.getDatabase).mockRejectedValue(new Error('D1 unavailable'))

      const now = Date.now()
      vi.setSystemTime(now)

      // Exhaust the limit
      await checkRateLimit('user789', { limit: 1, window: 60000 })
      const blocked = await checkRateLimit('user789', { limit: 1, window: 60000 })
      expect(blocked.success).toBe(false)

      // Move time forward past the window
      vi.setSystemTime(now + 61000)

      // Should be allowed again
      const result = await checkRateLimit('user789', { limit: 1, window: 60000 })
      expect(result.success).toBe(true)
    })

    it('returns correct resetAt timestamp', async () => {
      const now = Date.now()
      vi.setSystemTime(now)

      mockDb.prepare.mockReturnValueOnce({
        bind: vi.fn().mockReturnThis(),
        all: vi.fn().mockResolvedValue({ results: [] }),
      })
      mockDb.prepare.mockReturnValueOnce({
        bind: vi.fn().mockReturnThis(),
        run: vi.fn().mockResolvedValue(undefined),
      })

      const result = await checkRateLimit('user123', { limit: 5, window: 60000 })

      expect(result.resetAt).toBe(now + 60000)
    })
  })

  describe('getRateLimitIdentifier', () => {
    it('extracts IP from cf-connecting-ip header', () => {
      const request = new Request('https://example.com', {
        headers: { 'cf-connecting-ip': '1.2.3.4' },
      })

      const identifier = getRateLimitIdentifier(request)
      expect(identifier).toBeTruthy()
      expect(typeof identifier).toBe('string')
    })

    it('falls back to x-forwarded-for header', () => {
      const request = new Request('https://example.com', {
        headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
      })

      const identifier = getRateLimitIdentifier(request)
      expect(identifier).toBeTruthy()
    })

    it('falls back to x-real-ip header', () => {
      const request = new Request('https://example.com', {
        headers: { 'x-real-ip': '1.2.3.4' },
      })

      const identifier = getRateLimitIdentifier(request)
      expect(identifier).toBeTruthy()
    })

    it('returns anonymous when no IP headers present', () => {
      const request = new Request('https://example.com')

      const identifier = getRateLimitIdentifier(request)
      expect(identifier).toBeTruthy()
    })

    it('returns consistent hash for same IP', () => {
      const request1 = new Request('https://example.com', {
        headers: { 'cf-connecting-ip': '1.2.3.4' },
      })
      const request2 = new Request('https://example.com', {
        headers: { 'cf-connecting-ip': '1.2.3.4' },
      })

      const identifier1 = getRateLimitIdentifier(request1)
      const identifier2 = getRateLimitIdentifier(request2)

      expect(identifier1).toBe(identifier2)
    })

    it('returns different hashes for different IPs', () => {
      const request1 = new Request('https://example.com', {
        headers: { 'cf-connecting-ip': '1.2.3.4' },
      })
      const request2 = new Request('https://example.com', {
        headers: { 'cf-connecting-ip': '5.6.7.8' },
      })

      const identifier1 = getRateLimitIdentifier(request1)
      const identifier2 = getRateLimitIdentifier(request2)

      expect(identifier1).not.toBe(identifier2)
    })

    it('uses first IP from x-forwarded-for list', () => {
      const request = new Request('https://example.com', {
        headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8, 9.10.11.12' },
      })

      const identifier = getRateLimitIdentifier(request)
      expect(identifier).toBeTruthy()
    })
  })

  describe('ensureRateLimitTable', () => {
    it('creates rate_limits table', async () => {
      mockDb.exec.mockResolvedValue(undefined)

      await ensureRateLimitTable()

      expect(mockDb.exec).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS rate_limits'))
    })

    it('creates index on reset_at', async () => {
      mockDb.exec.mockResolvedValue(undefined)

      await ensureRateLimitTable()

      expect(mockDb.exec).toHaveBeenCalledWith(expect.stringContaining('CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at'))
    })

    it('silently fails when D1 unavailable', async () => {
      vi.mocked(analytics.getDatabase).mockRejectedValue(new Error('D1 unavailable'))

      await expect(ensureRateLimitTable()).resolves.not.toThrow()
    })
  })
})
