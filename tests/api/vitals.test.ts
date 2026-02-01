import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/vitals/route'

vi.mock('@/lib/monitoring', () => ({
  logger: {
    perf: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('POST /api/vitals', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createRequest = (body: Record<string, unknown>) => {
    return new Request('https://example.com/api/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  it('successfully logs valid vital metric', async () => {
    const { logger } = await import('@/lib/monitoring')

    const request = createRequest({
      name: 'CLS',
      value: 0.05,
      rating: 'good',
      timestamp: Date.now(),
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
    expect(logger.perf).toHaveBeenCalledWith('CLS', 0.05, {
      rating: 'good',
      timestamp: expect.any(Number),
    })
  })

  it('logs LCP metric', async () => {
    const { logger } = await import('@/lib/monitoring')

    const request = createRequest({
      name: 'LCP',
      value: 2500,
      rating: 'good',
    })
    await POST(request)

    expect(logger.perf).toHaveBeenCalledWith('LCP', 2500, expect.any(Object))
  })

  it('logs FID metric', async () => {
    const { logger } = await import('@/lib/monitoring')

    const request = createRequest({
      name: 'FID',
      value: 100,
      rating: 'good',
    })
    await POST(request)

    expect(logger.perf).toHaveBeenCalledWith('FID', 100, expect.any(Object))
  })

  it('logs FCP metric', async () => {
    const { logger } = await import('@/lib/monitoring')

    const request = createRequest({
      name: 'FCP',
      value: 1800,
      rating: 'good',
    })
    await POST(request)

    expect(logger.perf).toHaveBeenCalledWith('FCP', 1800, expect.any(Object))
  })

  it('logs TTFB metric', async () => {
    const { logger } = await import('@/lib/monitoring')

    const request = createRequest({
      name: 'TTFB',
      value: 600,
      rating: 'good',
    })
    await POST(request)

    expect(logger.perf).toHaveBeenCalledWith('TTFB', 600, expect.any(Object))
  })

  it('warns on poor performance', async () => {
    const { logger } = await import('@/lib/monitoring')

    const request = createRequest({
      name: 'LCP',
      value: 5000,
      rating: 'poor',
    })
    await POST(request)

    expect(logger.warn).toHaveBeenCalledWith('Poor Web Vital detected', {
      metric: 'LCP',
      value: 5000,
      rating: 'poor',
    })
  })

  it('returns 400 for missing name', async () => {
    const request = createRequest({
      value: 100,
      rating: 'good',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid metric')
  })

  it('returns 400 for missing value', async () => {
    const request = createRequest({
      name: 'CLS',
      rating: 'good',
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('returns 400 for non-numeric value', async () => {
    const request = createRequest({
      name: 'CLS',
      value: 'not a number',
      rating: 'good',
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('handles metric without rating', async () => {
    const { logger } = await import('@/lib/monitoring')

    const request = createRequest({
      name: 'CLS',
      value: 0.1,
    })
    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(logger.perf).toHaveBeenCalled()
  })

  it('handles metric without timestamp', async () => {
    const { logger } = await import('@/lib/monitoring')

    const request = createRequest({
      name: 'LCP',
      value: 2000,
      rating: 'good',
    })
    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(logger.perf).toHaveBeenCalled()
  })

  it('handles malformed JSON', async () => {
    const request = new Request('https://example.com/api/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not valid json',
    })
    const response = await POST(request)

    expect(response.status).toBe(500)
  })

  it('handles processing errors gracefully', async () => {
    const { logger } = await import('@/lib/monitoring')
    vi.mocked(logger.perf).mockImplementation(() => {
      throw new Error('Logging failed')
    })

    const request = createRequest({
      name: 'CLS',
      value: 0.1,
    })
    const response = await POST(request)

    expect(response.status).toBe(500)
    expect(logger.error).toHaveBeenCalled()
  })

  it('accepts needs-improvement rating', async () => {
    const { logger } = await import('@/lib/monitoring')

    const request = createRequest({
      name: 'LCP',
      value: 3000,
      rating: 'needs-improvement',
    })
    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(logger.perf).toHaveBeenCalled()
  })

  it('handles zero value', async () => {
    const { logger } = await import('@/lib/monitoring')

    const request = createRequest({
      name: 'CLS',
      value: 0,
      rating: 'good',
    })
    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(logger.perf).toHaveBeenCalledWith('CLS', 0, expect.any(Object))
  })

  it('handles negative value', async () => {
    const { logger } = await import('@/lib/monitoring')

    const request = createRequest({
      name: 'CLS',
      value: -1,
      rating: 'good',
    })
    const response = await POST(request)

    // Should still accept it (validation is on the client)
    expect(response.status).toBe(200)
  })

  it('handles very large values', async () => {
    const { logger } = await import('@/lib/monitoring')

    const request = createRequest({
      name: 'LCP',
      value: 999999,
      rating: 'poor',
    })
    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(logger.warn).toHaveBeenCalled()
  })
})
