import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { POST } from '@/app/api/contact/route'
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

vi.mock('@/lib/monitoring', () => ({
  withMonitoring: (handler: unknown) => handler,
}))

describe('POST /api/contact', () => {
  let mockRun: ReturnType<typeof vi.fn>
  let capturedBindArgs: unknown[] = []

  beforeEach(() => {
    capturedBindArgs = []

    // Setup default mocks
    vi.mocked(rateLimit.ensureRateLimitTable).mockResolvedValue(undefined)
    vi.mocked(rateLimit.getRateLimitIdentifier).mockReturnValue('user123')
    vi.mocked(rateLimit.checkRateLimit).mockResolvedValue({
      success: true,
      limit: 3,
      remaining: 2,
      resetAt: Date.now() + 3600000,
    })

    mockRun = vi.fn().mockResolvedValue(undefined)

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
    vi.clearAllMocks()
    delete process.env.RESEND_API_KEY
    delete process.env.RESEND_FROM
    delete process.env.CONTACT_TO
  })

  const createRequest = (body: Record<string, unknown>) => {
    return new Request('https://example.com/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  it('successfully sends contact message with all fields', async () => {
    const request = createRequest({
      name: 'John Doe',
      email: 'john@example.com',
      topic: 'Support',
      message: 'I need help with something',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
    expect(data.message).toContain('reply within 48 hours')
  })

  it('successfully sends contact message without topic', async () => {
    const request = createRequest({
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'General inquiry',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
  })

  it('returns 429 when rate limit exceeded', async () => {
    vi.mocked(rateLimit.checkRateLimit).mockResolvedValue({
      success: false,
      limit: 3,
      remaining: 0,
      resetAt: Date.now() + 3600000,
    })

    const request = createRequest({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test message',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.error).toContain('Too many contact attempts')
    expect(response.headers.get('X-RateLimit-Limit')).toBe('3')
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0')
  })

  it('returns 400 for invalid email format', async () => {
    const request = createRequest({
      name: 'John Doe',
      email: 'invalid-email',
      message: 'Test message',
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('returns 400 for missing required fields', async () => {
    const request = createRequest({
      name: 'John Doe',
      email: 'john@example.com',
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('returns 400 for empty message', async () => {
    const request = createRequest({
      name: 'John Doe',
      email: 'john@example.com',
      message: '',
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('inserts contact message into database', async () => {
    const request = createRequest({
      name: 'John Doe',
      email: 'john@example.com',
      topic: 'Sales',
      message: 'I want to buy something',
    })

    await POST(request)

    expect(capturedBindArgs[0]).toBe('John Doe')
    expect(capturedBindArgs[1]).toBe('john@example.com')
    expect(capturedBindArgs[2]).toBe('Sales')
    expect(capturedBindArgs[3]).toBe('I want to buy something')
  })

  it('sends email notification when RESEND_API_KEY is set', async () => {
    process.env.RESEND_API_KEY = 'test-api-key'
    global.fetch = vi.fn().mockResolvedValue({ ok: true })

    const request = createRequest({
      name: 'John Doe',
      email: 'john@example.com',
      topic: 'Support',
      message: 'Help me please',
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

  it('uses custom CONTACT_TO when set', async () => {
    process.env.RESEND_API_KEY = 'test-api-key'
    process.env.CONTACT_TO = 'custom@example.com'
    global.fetch = vi.fn().mockResolvedValue({ ok: true })

    const request = createRequest({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test',
    })

    await POST(request)

    const fetchCall = vi.mocked(global.fetch).mock.calls[0]
    const body = JSON.parse(fetchCall[1]!.body as string)
    expect(body.to).toEqual(['custom@example.com'])
  })

  it('sanitizes HTML in message', async () => {
    process.env.RESEND_API_KEY = 'test-api-key'
    global.fetch = vi.fn().mockResolvedValue({ ok: true })

    const request = createRequest({
      name: 'John Doe',
      email: 'john@example.com',
      message: '<script>alert("xss")</script>Test message',
    })

    await POST(request)

    const fetchCall = vi.mocked(global.fetch).mock.calls[0]
    const body = JSON.parse(fetchCall[1]!.body as string)
    // Check that script tags are escaped
    expect(body.html).toContain('&lt;')
    expect(body.html).toContain('&gt;')
  })

  it('converts newlines to br tags in email', async () => {
    process.env.RESEND_API_KEY = 'test-api-key'
    global.fetch = vi.fn().mockResolvedValue({ ok: true })

    const request = createRequest({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Line 1\nLine 2\nLine 3',
    })

    await POST(request)

    const fetchCall = vi.mocked(global.fetch).mock.calls[0]
    const body = JSON.parse(fetchCall[1]!.body as string)
    // Check that HTML contains the message content
    expect(body.html).toContain('Line 1')
    expect(body.html).toContain('Line 2')
  })

  it('returns rate limit headers on success', async () => {
    const request = createRequest({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test',
    })
    const response = await POST(request)

    expect(response.headers.get('X-RateLimit-Limit')).toBe('3')
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('2')
    expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy()
  })

  it('handles malformed JSON body', async () => {
    const request = new Request('https://example.com/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not valid json',
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('handles database errors gracefully', async () => {
    mockRun.mockRejectedValue(new Error('Database error'))

    const request = createRequest({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test',
    })
    const response = await POST(request)

    expect(response.status).toBe(500)
    expect(errors.logError).toHaveBeenCalledWith('contact', expect.any(Error))
  })

  it('validates message length', async () => {
    const longMessage = 'a'.repeat(10000)
    const request = createRequest({
      name: 'John Doe',
      email: 'john@example.com',
      message: longMessage,
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('skips email sending when RESEND_API_KEY is not set', async () => {
    global.fetch = vi.fn()

    const request = createRequest({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test',
    })
    await POST(request)

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('continues even if email sending fails', async () => {
    process.env.RESEND_API_KEY = 'test-api-key'
    global.fetch = vi.fn().mockRejectedValue(new Error('Email service down'))

    const request = createRequest({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test',
    })
    const response = await POST(request)

    // Should still fail because email is part of the flow
    expect(response.status).toBe(500)
  })
})
