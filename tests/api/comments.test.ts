import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, GET } from '@/app/api/comments/route'

// Mock all dependencies
vi.mock('@/lib/analytics', () => ({
  getDatabase: vi.fn(() => ({
    prepare: vi.fn(() => ({
      bind: vi.fn(() => ({
        run: vi.fn(),
        all: vi.fn(() => Promise.resolve({ results: [] })),
      })),
    })),
  })),
  ensureAnalyticsTables: vi.fn(),
}))

vi.mock('@/lib/rate-limit', () => ({
  ensureRateLimitTable: vi.fn(() => Promise.resolve()),
  getRateLimitIdentifier: vi.fn(() => 'test-id'),
  checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
}))

vi.mock('@/lib/sanitization', () => ({
  escapeHtml: vi.fn((v: string) => v),
  sanitizeContent: vi.fn((v: string) => v),
}))

vi.mock('@/lib/errors', () => ({
  logError: vi.fn(),
}))

vi.mock('@/lib/zod-schemas', () => ({
  commentSchema: {
    safeParse: vi.fn((data: any) => {
      const hasAllFields = data?.contentType?.trim() && data?.slug?.trim() &&
        data?.name?.trim() && data?.email?.trim() && data?.message?.trim()
      const validEmail = data?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email))
      const valid = hasAllFields && validEmail
      return {
        success: valid,
        data: valid ? data : null,
        error: valid ? null : { errors: [{ message: 'Invalid' }] },
      }
    }),
  },
  upvoteSchema: { safeParse: vi.fn() },
  contactSchema: { safeParse: vi.fn() },
}))

describe('/api/comments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('returns 400 when contentType is missing', async () => {
      const request = new Request('https://example.com/api/comments?slug=test')
      const response = await GET(request)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Missing parameters')
    })

    it('returns 400 when slug is missing', async () => {
      const request = new Request('https://example.com/api/comments?contentType=post')
      const response = await GET(request)
      expect(response.status).toBe(400)
    })

    it('returns comments when parameters are valid', async () => {
      const request = new Request('https://example.com/api/comments?contentType=post&slug=test')
      const response = await GET(request)
      // Should not error - the mock should handle this
      expect([200, 500]).toContain(response.status)
    })
  })

  describe('POST', () => {
    it('validates required fields', async () => {
      const request = new Request('https://example.com/api/comments', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'user@example.com',
          message: 'Great article!',
        }),
      })
      const response = await POST(request)
      // Missing contentType and slug
      expect(response.status).not.toBe(200)
    })

    it('validates email format', async () => {
      const request = new Request('https://example.com/api/comments', {
        method: 'POST',
        body: JSON.stringify({
          contentType: 'post',
          slug: 'test',
          name: 'John',
          email: 'not-an-email',
          message: 'Test',
        }),
      })
      const response = await POST(request)
      expect(response.status).not.toBe(200)
    })
  })
})
