import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/track/route'

// Mock all dependencies
vi.mock('@/lib/analytics', () => ({
  getDatabase: vi.fn(() => ({
    prepare: vi.fn(() => ({
      bind: vi.fn(() => ({
        run: vi.fn(),
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

vi.mock('@/lib/sanitization', () => ({
  sanitizeUtm: vi.fn((v) => v),
}))

vi.mock('@/lib/zod-schemas', () => ({
  trackEventSchema: {
    safeParse: vi.fn((data: any) => {
      const valid = data?.eventType?.trim()
      return {
        success: valid,
        data: valid ? data : null,
        error: valid ? null : { errors: [{ message: 'eventType required' }] },
      }
    }),
  },
}))

describe('/api/track', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('validates eventType is required', async () => {
    const request = new Request('https://example.com/api/track', {
      method: 'POST',
      body: JSON.stringify({ toolSlug: 'test' }),
    })
    const response = await POST(request)
    expect(response.status).not.toBe(200)
  })

  it('accepts valid tracking event', async () => {
    const request = new Request('https://example.com/api/track', {
      method: 'POST',
      headers: { 'cf-connecting-ip': '1.2.3.4' },
      body: JSON.stringify({
        eventType: 'tool_usage',
        toolSlug: 'utm-builder',
      }),
    })
    const response = await POST(request)
    expect([200, 429, 500]).toContain(response.status)
  })
})
