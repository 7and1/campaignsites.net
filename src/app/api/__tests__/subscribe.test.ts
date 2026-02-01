import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { POST } from '../subscribe/route'
import * as rateLimit from '@/lib/rate-limit'
import * as analytics from '@/lib/analytics'
import * as errors from '@/lib/errors'

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

describe('POST /api/subscribe', () => {
  let mockRun: ReturnType<typeof vi.fn>
  let capturedBindArgs: unknown[] = []

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01'))
    capturedBindArgs = []

    // Setup default mocks
    vi.mocked(rateLimit.ensureRateLimitTable).mockResolvedValue(undefined)
    vi.mocked(rateLimit.getRateLimitIdentifier).mockReturnValue('user123')
    vi.mocked(rateLimit.checkRateLimit).mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      resetAt: Date.now() + 3600000,
    })

    mockRun = vi.fn().mockResolvedValue(undefined)

    // Create a mock that captures bind arguments
    const mockBind = vi.fn().mockImplementation((...args: unknown[]) => {
      capturedBindArgs = args
      return { run: mockRun }
    })

    const mockDb = {
      prepare: vi.fn().mockReturnValue({
        bind: mockBind,
      }),
    }

    vi.mocked(analytics.getDatabase).mockResolvedValue(mockDb as unknown as ReturnType<typeof analytics.getDatabase>)
    vi.mocked(analytics.ensureAnalyticsTables).mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
    delete process.env.RESEND_API_KEY
    delete process.env.RESEND_FROM
  })

  const createRequest = (body: Record<string, unknown>) => {
    return new Request('https://example.com/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  it('successfully subscribes with valid email', async () => {
    const request = createRequest({ email: 'test@example.com' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
    expect(data.message).toContain('subscribed')
  })

  it('successfully subscribes with name and lead magnet', async () => {
    const request = createRequest({
      email: 'test@example.com',
      name: 'John Doe',
      leadMagnet: 'landing-page-checklist',
      source: 'homepage',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
  })

  it('returns 429 when rate limit exceeded', async () => {
    vi.mocked(rateLimit.checkRateLimit).mockResolvedValue({
      success: false,
      limit: 5,
      remaining: 0,
      resetAt: Date.now() + 3600000,
    })

    const request = createRequest({ email: 'test@example.com' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.error).toContain('Too many subscription attempts')
    expect(response.headers.get('X-RateLimit-Limit')).toBe('5')
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
  })

  it('returns 400 for invalid email format', async () => {
    const request = createRequest({ email: 'invalid-email' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeTruthy()
  })

  it('returns 400 for empty email', async () => {
    const request = createRequest({ email: '' })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('returns 400 for email with script tag', async () => {
    const request = createRequest({ email: '<script>alert(1)</script>@example.com' })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('returns 400 for overly long email', async () => {
    const longEmail = 'a'.repeat(300) + '@example.com'
    const request = createRequest({ email: longEmail })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('inserts subscriber into database', async () => {
    const request = createRequest({
      email: 'test@example.com',
      name: 'John Doe',
      leadMagnet: 'utm-naming-guide',
      source: 'blog',
    })

    await POST(request)

    expect(capturedBindArgs[0]).toBe('test@example.com')
    expect(capturedBindArgs[1]).toBe('John Doe')
    expect(capturedBindArgs[2]).toBe('utm-naming-guide')
    expect(capturedBindArgs[3]).toBe('blog')
  })

  it('sends welcome email when RESEND_API_KEY is set', async () => {
    process.env.RESEND_API_KEY = 'test-api-key'
    global.fetch = vi.fn().mockResolvedValue({ ok: true })

    const request = createRequest({
      email: 'test@example.com',
      leadMagnet: 'landing-page-checklist',
    })

    await POST(request)

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-api-key',
        }),
      })
    )
  })

  it('uses custom from address when RESEND_FROM is set', async () => {
    process.env.RESEND_API_KEY = 'test-api-key'
    process.env.RESEND_FROM = 'Custom <custom@example.com>'
    global.fetch = vi.fn().mockResolvedValue({ ok: true })

    const request = createRequest({ email: 'test@example.com' })
    await POST(request)

    const fetchCall = vi.mocked(global.fetch).mock.calls[0]
    const body = JSON.parse(fetchCall[1]!.body as string)
    expect(body.from).toBe('Custom <custom@example.com>')
  })

  it('skips email sending when RESEND_API_KEY is not set', async () => {
    global.fetch = vi.fn()

    const request = createRequest({ email: 'test@example.com' })
    await POST(request)

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('includes correct download link in email', async () => {
    process.env.RESEND_API_KEY = 'test-api-key'
    global.fetch = vi.fn().mockResolvedValue({ ok: true })

    const request = createRequest({
      email: 'test@example.com',
      leadMagnet: 'cta-swipe-file',
    })

    await POST(request)

    const fetchCall = vi.mocked(global.fetch).mock.calls[0]
    const body = JSON.parse(fetchCall[1]!.body as string)
    expect(body.html).toContain('cta-swipe-file.txt')
  })

  it('returns rate limit headers on success', async () => {
    const request = createRequest({ email: 'test@example.com' })
    const response = await POST(request)

    expect(response.headers.get('X-RateLimit-Limit')).toBe('5')
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('4')
    expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy()
  })

  it('handles malformed JSON body', async () => {
    const request = new Request('https://example.com/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not valid json',
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('handles database errors gracefully', async () => {
    mockRun.mockRejectedValue(new Error('Database error'))

    const request = createRequest({ email: 'test@example.com' })
    const response = await POST(request)

    expect(response.status).toBe(500)
    expect(errors.logError).toHaveBeenCalledWith('subscribe', expect.any(Error))
  })

  it('logs errors on failure', async () => {
    mockRun.mockRejectedValue(new Error('Database error'))

    const request = createRequest({ email: 'test@example.com' })
    await POST(request)

    expect(errors.logError).toHaveBeenCalled()
  })

  it('handles missing body', async () => {
    const request = new Request('https://example.com/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('validates leadMagnet enum values', async () => {
    const request = createRequest({
      email: 'test@example.com',
      leadMagnet: 'invalid-magnet',
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('sanitizes email to lowercase', async () => {
    const request = createRequest({ email: 'TEST@EXAMPLE.COM' })

    await POST(request)

    expect(capturedBindArgs[0]).toBe('test@example.com')
  })

  it('returns 500 when email sending fails', async () => {
    process.env.RESEND_API_KEY = 'test-api-key'
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const request = createRequest({ email: 'test@example.com' })
    const response = await POST(request)

    // Email failure causes the whole request to fail
    expect(response.status).toBe(500)
  })

  it('uses default lead magnet when not specified', async () => {
    const request = createRequest({ email: 'test@example.com' })

    await POST(request)

    expect(capturedBindArgs[2]).toBe('landing-page-checklist')
  })

  it('uses default source when not specified', async () => {
    const request = createRequest({ email: 'test@example.com' })

    await POST(request)

    expect(capturedBindArgs[3]).toBe('site')
  })
})
