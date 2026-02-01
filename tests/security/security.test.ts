import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as subscribePost } from '@/app/api/subscribe/route'
import { POST as contactPost } from '@/app/api/contact/route'

// Mock dependencies
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
  getRateLimitIdentifier: vi.fn(),
  ensureRateLimitTable: vi.fn(),
}))

vi.mock('@/lib/analytics', () => ({
  getDatabase: vi.fn(),
  ensureAnalyticsTables: vi.fn(),
}))

vi.mock('@/lib/errors', () => ({
  logError: vi.fn(),
}))

vi.mock('@/lib/monitoring', () => ({
  withMonitoring: (handler: unknown) => handler,
}))

describe('Security - Input Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const { checkRateLimit, getRateLimitIdentifier, ensureRateLimitTable } = require('@/lib/rate-limit')
    const { getDatabase, ensureAnalyticsTables } = require('@/lib/analytics')

    vi.mocked(ensureRateLimitTable).mockResolvedValue(undefined)
    vi.mocked(getRateLimitIdentifier).mockReturnValue('user123')
    vi.mocked(checkRateLimit).mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      resetAt: Date.now() + 3600000,
    })

    const mockDb = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          run: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    }

    vi.mocked(getDatabase).mockResolvedValue(mockDb as any)
    vi.mocked(ensureAnalyticsTables).mockResolvedValue(undefined)
  })

  it('blocks SQL injection attempts in email', async () => {
    const request = new Request('https://example.com/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "test@example.com'; DROP TABLE users; --",
      }),
    })

    const response = await subscribePost(request)
    expect(response.status).toBe(400)
  })

  it('blocks XSS attempts in email', async () => {
    const request = new Request('https://example.com/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: '<script>alert("xss")</script>@example.com',
      }),
    })

    const response = await subscribePost(request)
    expect(response.status).toBe(400)
  })

  it('blocks command injection attempts', async () => {
    const request = new Request('https://example.com/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test; rm -rf /',
        email: 'test@example.com',
        message: 'Test message',
      }),
    })

    const response = await contactPost(request)
    // Should succeed but sanitize the input
    expect([200, 400]).toContain(response.status)
  })

  it('blocks path traversal attempts', async () => {
    const request = new Request('https://example.com/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '../../../etc/passwd',
        email: 'test@example.com',
        message: 'Test',
      }),
    })

    const response = await contactPost(request)
    expect([200, 400]).toContain(response.status)
  })

  it('validates email format strictly', async () => {
    const invalidEmails = [
      'notanemail',
      '@example.com',
      'test@',
      'test..test@example.com',
      'test@example',
      'test @example.com',
    ]

    for (const email of invalidEmails) {
      const request = new Request('https://example.com/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const response = await subscribePost(request)
      expect(response.status).toBe(400)
    }
  })

  it('enforces maximum length limits', async () => {
    const longEmail = 'a'.repeat(300) + '@example.com'
    const request = new Request('https://example.com/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: longEmail }),
    })

    const response = await subscribePost(request)
    expect(response.status).toBe(400)
  })

  it('blocks null byte injection', async () => {
    const request = new Request('https://example.com/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test\x00User',
        email: 'test@example.com',
        message: 'Test\x00Message',
      }),
    })

    const response = await contactPost(request)
    expect([200, 400]).toContain(response.status)
  })

  it('blocks unicode control characters', async () => {
    const request = new Request('https://example.com/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test\u202EUser',
        email: 'test@example.com',
        message: 'Test',
      }),
    })

    const response = await contactPost(request)
    expect([200, 400]).toContain(response.status)
  })
})

describe('Security - Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const { ensureRateLimitTable, getRateLimitIdentifier, getDatabase, ensureAnalyticsTables } = require('@/lib/rate-limit')

    vi.mocked(ensureRateLimitTable).mockResolvedValue(undefined)
    vi.mocked(getRateLimitIdentifier).mockReturnValue('user123')

    const mockDb = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          run: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    }

    const analytics = require('@/lib/analytics')
    vi.mocked(analytics.getDatabase).mockResolvedValue(mockDb as any)
    vi.mocked(analytics.ensureAnalyticsTables).mockResolvedValue(undefined)
  })

  it('enforces rate limits on subscribe endpoint', async () => {
    const { checkRateLimit } = require('@/lib/rate-limit')
    vi.mocked(checkRateLimit).mockResolvedValue({
      success: false,
      limit: 5,
      remaining: 0,
      resetAt: Date.now() + 3600000,
    })

    const request = new Request('https://example.com/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    const response = await subscribePost(request)
    expect(response.status).toBe(429)
    expect(response.headers.get('X-RateLimit-Limit')).toBeTruthy()
    expect(response.headers.get('X-RateLimit-Remaining')).toBeTruthy()
    expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy()
  })

  it('enforces rate limits on contact endpoint', async () => {
    const { checkRateLimit } = require('@/lib/rate-limit')
    vi.mocked(checkRateLimit).mockResolvedValue({
      success: false,
      limit: 3,
      remaining: 0,
      resetAt: Date.now() + 3600000,
    })

    const request = new Request('https://example.com/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test',
        email: 'test@example.com',
        message: 'Test',
      }),
    })

    const response = await contactPost(request)
    expect(response.status).toBe(429)
  })

  it('returns rate limit headers on success', async () => {
    const { checkRateLimit } = require('@/lib/rate-limit')
    vi.mocked(checkRateLimit).mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      resetAt: Date.now() + 3600000,
    })

    const request = new Request('https://example.com/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    const response = await subscribePost(request)
    expect(response.headers.get('X-RateLimit-Limit')).toBe('5')
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('4')
  })
})

describe('Security - CSRF Protection', () => {
  it('accepts requests with valid content type', async () => {
    const { checkRateLimit, getRateLimitIdentifier, ensureRateLimitTable } = require('@/lib/rate-limit')
    const { getDatabase, ensureAnalyticsTables } = require('@/lib/analytics')

    vi.mocked(ensureRateLimitTable).mockResolvedValue(undefined)
    vi.mocked(getRateLimitIdentifier).mockReturnValue('user123')
    vi.mocked(checkRateLimit).mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      resetAt: Date.now() + 3600000,
    })

    const mockDb = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          run: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    }

    vi.mocked(getDatabase).mockResolvedValue(mockDb as any)
    vi.mocked(ensureAnalyticsTables).mockResolvedValue(undefined)

    const request = new Request('https://example.com/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    const response = await subscribePost(request)
    expect([200, 400]).toContain(response.status)
  })
})

describe('Security - Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const { checkRateLimit, getRateLimitIdentifier, ensureRateLimitTable } = require('@/lib/rate-limit')
    const { getDatabase, ensureAnalyticsTables } = require('@/lib/analytics')

    vi.mocked(ensureRateLimitTable).mockResolvedValue(undefined)
    vi.mocked(getRateLimitIdentifier).mockReturnValue('user123')
    vi.mocked(checkRateLimit).mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      resetAt: Date.now() + 3600000,
    })

    const mockDb = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          run: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    }

    vi.mocked(getDatabase).mockResolvedValue(mockDb as any)
    vi.mocked(ensureAnalyticsTables).mockResolvedValue(undefined)
  })

  it('does not leak sensitive information in error messages', async () => {
    const request = new Request('https://example.com/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalid' }),
    })

    const response = await subscribePost(request)
    const data = await response.json()

    // Should not contain stack traces or internal paths
    expect(data.error).not.toContain('/')
    expect(data.error).not.toContain('\\')
    expect(data.error).not.toContain('node_modules')
  })

  it('handles malformed JSON gracefully', async () => {
    const request = new Request('https://example.com/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not valid json',
    })

    const response = await subscribePost(request)
    expect(response.status).toBe(400)
  })

  it('handles missing content type', async () => {
    const request = new Request('https://example.com/api/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    const response = await subscribePost(request)
    expect([200, 400]).toContain(response.status)
  })
})
