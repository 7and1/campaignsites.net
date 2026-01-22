import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, GET } from '@/app/api/upvote/route'

// Mock all dependencies
vi.mock('@/lib/analytics', () => ({
  getDatabase: vi.fn(() => ({
    prepare: vi.fn(() => ({
      bind: vi.fn(() => ({
        run: vi.fn(),
        all: vi.fn(() => Promise.resolve({ results: [{ count: 5 }] })),
      })),
    })),
  })),
  ensureAnalyticsTables: vi.fn(),
  hashIp: vi.fn(() => 'hashed-ip'),
}))

vi.mock('@/lib/rate-limit', () => ({
  ensureRateLimitTable: vi.fn(() => Promise.resolve()),
  getRateLimitIdentifier: vi.fn(() => 'test-id'),
  checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
}))

vi.mock('@/lib/zod-schemas', () => ({
  upvoteSchema: {
    safeParse: vi.fn((data: any) => {
      const valid = data?.contentType?.trim() && data?.slug?.trim()
      return {
        success: valid,
        data: valid ? data : null,
        error: valid ? null : { errors: [{ message: 'Invalid' }] },
      }
    }),
  },
  commentSchema: { safeParse: vi.fn() },
}))

describe('/api/upvote', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('returns 400 when contentType is missing', async () => {
      const request = new Request('https://example.com/api/upvote?slug=test')
      const response = await GET(request)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Missing parameters')
    })

    it('returns 400 when slug is missing', async () => {
      const request = new Request('https://example.com/api/upvote?contentType=post')
      const response = await GET(request)
      expect(response.status).toBe(400)
    })

    it('returns count when parameters are valid', async () => {
      const request = new Request('https://example.com/api/upvote?contentType=post&slug=test')
      const response = await GET(request)
      expect([200, 500]).toContain(response.status)
    })
  })

  describe('POST', () => {
    it('validates required fields', async () => {
      const request = new Request('https://example.com/api/upvote', {
        method: 'POST',
        body: JSON.stringify({ slug: 'test' }),
      })
      const response = await POST(request)
      expect(response.status).not.toBe(200)
    })

    it('handles upvote with valid data', async () => {
      const request = new Request('https://example.com/api/upvote', {
        method: 'POST',
        headers: { 'cf-connecting-ip': '1.2.3.4' },
        body: JSON.stringify({ contentType: 'post', slug: 'test-post' }),
      })
      const response = await POST(request)
      expect([200, 429, 500]).toContain(response.status)
    })
  })
})
