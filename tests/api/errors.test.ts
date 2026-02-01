import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/errors/route'

vi.mock('@/lib/monitoring', () => ({
  logger: {
    error: vi.fn(),
  },
}))

describe('POST /api/errors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createRequest = (body: Record<string, unknown>) => {
    return new Request('https://example.com/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  it('successfully logs valid error report', async () => {
    const { logger } = await import('@/lib/monitoring')

    const request = createRequest({
      message: 'Something went wrong',
      name: 'TypeError',
      stack: 'Error: Something went wrong\n  at Component.tsx:10',
      timestamp: new Date().toISOString(),
      environment: 'production',
      context: {
        url: 'https://example.com/page',
        userAgent: 'Mozilla/5.0',
        component: 'MyComponent',
      },
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
    expect(logger.error).toHaveBeenCalledWith(
      'Client-side error reported',
      undefined,
      expect.objectContaining({
        message: 'Something went wrong',
        name: 'TypeError',
        stack: expect.any(String),
      })
    )
  })

  it('logs error with minimal information', async () => {
    const { logger } = await import('@/lib/monitoring')

    const request = createRequest({
      message: 'Error occurred',
      name: 'Error',
    })
    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(logger.error).toHaveBeenCalled()
  })

  it('returns 400 for missing message', async () => {
    const request = createRequest({
      name: 'Error',
      stack: 'some stack trace',
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid error report')
  })

  it('returns 400 for missing name', async () => {
    const request = createRequest({
      message: 'Something went wrong',
      stack: 'some stack trace',
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('logs error with full context', async () => {
    const { logger } = await import('@/lib/monitoring')

    const request = createRequest({
      message: 'Network request failed',
      name: 'NetworkError',
      stack: 'NetworkError: Failed to fetch',
      context: {
        url: 'https://example.com/api/data',
        userAgent: 'Chrome/90.0',
        component: 'DataFetcher',
        requestId: '12345',
        userId: 'user-abc',
      },
    })
    await POST(request)

    expect(logger.error).toHaveBeenCalledWith(
      'Client-side error reported',
      undefined,
      expect.objectContaining({
        context: expect.objectContaining({
          requestId: '12345',
          userId: 'user-abc',
        }),
      })
    )
  })

  it('handles error without stack trace', async () => {
    const { logger } = await import('@/lib/monitoring')

    const request = createRequest({
      message: 'Error without stack',
      name: 'CustomError',
    })
    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(logger.error).toHaveBeenCalled()
  })

  it('handles error without context', async () => {
    const { logger } = await import('@/lib/monitoring')

    const request = createRequest({
      message: 'Simple error',
      name: 'Error',
    })
    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(logger.error).toHaveBeenCalled()
  })

  it('handles malformed JSON', async () => {
    const request = new Request('https://example.com/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not valid json',
    })
    const response = await POST(request)

    expect(response.status).toBe(500)
  })

  it('handles processing errors gracefully', async () => {
    const { logger } = await import('@/lib/monitoring')
    vi.mocked(logger.error).mockImplementation(() => {
      throw new Error('Logging failed')
    })

    const request = createRequest({
      message: 'Test error',
      name: 'Error',
    })
    const response = await POST(request)

    expect(response.status).toBe(500)
  })

  it('logs different error types', async () => {
    const { logger } = await import('@/lib/monitoring')

    const errorTypes = ['TypeError', 'ReferenceError', 'SyntaxError', 'RangeError']

    for (const errorType of errorTypes) {
      const request = createRequest({
        message: `${errorType} occurred`,
        name: errorType,
      })
      await POST(request)
    }

    expect(logger.error).toHaveBeenCalledTimes(errorTypes.length)
  })

  it('handles very long error messages', async () => {
    const { logger } = await import('@/lib/monitoring')

    const longMessage = 'Error: ' + 'a'.repeat(10000)
    const request = createRequest({
      message: longMessage,
      name: 'Error',
    })
    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(logger.error).toHaveBeenCalled()
  })

  it('handles very long stack traces', async () => {
    const { logger } = await import('@/lib/monitoring')

    const longStack = 'Error\n' + '  at function\n'.repeat(1000)
    const request = createRequest({
      message: 'Error with long stack',
      name: 'Error',
      stack: longStack,
    })
    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(logger.error).toHaveBeenCalled()
  })

  it('extracts url from context', async () => {
    const { logger } = await import('@/lib/monitoring')

    const request = createRequest({
      message: 'Page error',
      name: 'Error',
      context: {
        url: 'https://example.com/specific-page',
      },
    })
    await POST(request)

    expect(logger.error).toHaveBeenCalledWith(
      'Client-side error reported',
      undefined,
      expect.objectContaining({
        url: 'https://example.com/specific-page',
      })
    )
  })

  it('extracts userAgent from context', async () => {
    const { logger } = await import('@/lib/monitoring')

    const request = createRequest({
      message: 'Browser error',
      name: 'Error',
      context: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    })
    await POST(request)

    expect(logger.error).toHaveBeenCalledWith(
      'Client-side error reported',
      undefined,
      expect.objectContaining({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      })
    )
  })

  it('extracts component from context', async () => {
    const { logger } = await import('@/lib/monitoring')

    const request = createRequest({
      message: 'Component error',
      name: 'Error',
      context: {
        component: 'HeaderComponent',
      },
    })
    await POST(request)

    expect(logger.error).toHaveBeenCalledWith(
      'Client-side error reported',
      undefined,
      expect.objectContaining({
        component: 'HeaderComponent',
      })
    )
  })
})
