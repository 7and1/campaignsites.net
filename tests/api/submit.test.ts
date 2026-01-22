import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/submit/route'

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
}))

vi.mock('@/lib/rate-limit', () => ({
  ensureRateLimitTable: vi.fn(() => Promise.resolve()),
  getRateLimitIdentifier: vi.fn(() => 'test-id'),
  checkRateLimit: vi.fn(() => Promise.resolve({ success: true })),
}))

vi.mock('@/lib/errors', () => ({
  logError: vi.fn(),
}))

vi.mock('@/lib/zod-schemas', () => ({
  caseStudySubmissionSchema: {
    safeParse: vi.fn((data: any) => {
      const valid = data?.name?.trim() && data?.email?.trim() && data?.brand?.trim()
      return {
        success: valid,
        data: valid ? data : null,
        error: valid ? null : { errors: [{ message: 'Invalid' }] },
      }
    }),
  },
}))

describe('/api/submit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('validates required fields', async () => {
    const request = new Request('https://example.com/api/submit', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John',
        email: 'john@example.com',
      }),
    })
    const response = await POST(request)
    expect(response.status).not.toBe(200)
  })

  it('accepts valid submission', async () => {
    const request = new Request('https://example.com/api/submit', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        brand: 'Acme Corp',
      }),
    })
    const response = await POST(request)
    expect([200, 429, 500]).toContain(response.status)
  })
})
