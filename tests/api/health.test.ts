import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, HEAD } from '@/app/api/health/route'

// Mock dependencies
vi.mock('payload', () => ({
  getPayload: vi.fn(),
}))

vi.mock('@payload-config', () => ({
  default: {},
}))

vi.mock('@/lib/monitoring/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.OPENAI_API_KEY
    delete process.env.RESEND_API_KEY
  })

  it('returns healthy status when all checks pass', async () => {
    const { getPayload } = await import('payload')
    vi.mocked(getPayload).mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as any)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('healthy')
    expect(data.checks.database.status).toBe('ok')
    expect(data.checks.payload.status).toBe('ok')
  })

  it('returns degraded status when database is slow', async () => {
    const { getPayload } = await import('payload')
    vi.mocked(getPayload).mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 1500))
      return {
        find: vi.fn().mockResolvedValue({ docs: [] }),
      } as any
    })

    const response = await GET()
    const data = await response.json()

    expect(data.status).toBe('degraded')
    expect(data.checks.database.status).toBe('degraded')
  })

  it('returns unhealthy status when database fails', async () => {
    const { getPayload } = await import('payload')
    vi.mocked(getPayload).mockRejectedValue(new Error('Database connection failed'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.status).toBe('unhealthy')
    expect(data.checks.database.status).toBe('error')
  })

  it('checks OpenAI API when configured', async () => {
    process.env.OPENAI_API_KEY = 'test-key'
    const { getPayload } = await import('payload')
    vi.mocked(getPayload).mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as any)

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    })

    const response = await GET()
    const data = await response.json()

    expect(data.checks.openai.status).toBe('ok')
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/models',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-key',
        }),
      })
    )
  })

  it('marks OpenAI as not configured when key is missing', async () => {
    const { getPayload } = await import('payload')
    vi.mocked(getPayload).mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as any)

    const response = await GET()
    const data = await response.json()

    expect(data.checks.openai.status).toBe('ok')
    expect(data.checks.openai.message).toBe('Not configured')
  })

  it('checks Resend API when configured', async () => {
    process.env.RESEND_API_KEY = 'test-key'
    const { getPayload } = await import('payload')
    vi.mocked(getPayload).mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as any)

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    })

    const response = await GET()
    const data = await response.json()

    expect(data.checks.resend.status).toBe('ok')
  })

  it('handles Resend 401 as ok (auth check)', async () => {
    process.env.RESEND_API_KEY = 'test-key'
    const { getPayload } = await import('payload')
    vi.mocked(getPayload).mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as any)

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
    })

    const response = await GET()
    const data = await response.json()

    expect(data.checks.resend.status).toBe('ok')
  })

  it('includes response time in checks', async () => {
    const { getPayload } = await import('payload')
    vi.mocked(getPayload).mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as any)

    const response = await GET()
    const data = await response.json()

    expect(data.responseTime).toMatch(/\d+ms/)
    expect(data.checks.database.responseTime).toBeTypeOf('number')
  })

  it('includes timestamp and version', async () => {
    const { getPayload } = await import('payload')
    vi.mocked(getPayload).mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as any)

    const response = await GET()
    const data = await response.json()

    expect(data.timestamp).toBeTruthy()
    expect(data.version).toBeTruthy()
    expect(data.environment).toBe('test')
  })

  it('sets no-cache headers', async () => {
    const { getPayload } = await import('payload')
    vi.mocked(getPayload).mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as any)

    const response = await GET()

    expect(response.headers.get('Cache-Control')).toContain('no-store')
  })

  it('handles complete failure gracefully', async () => {
    const { getPayload } = await import('payload')
    vi.mocked(getPayload).mockImplementation(() => {
      throw new Error('Complete failure')
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.status).toBe('unhealthy')
    expect(data.error).toBeTruthy()
  })
})

describe('HEAD /api/health', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 when database is accessible', async () => {
    const { getPayload } = await import('payload')
    vi.mocked(getPayload).mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as any)

    const response = await HEAD()

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
  })

  it('returns 503 when database is not accessible', async () => {
    const { getPayload } = await import('payload')
    vi.mocked(getPayload).mockRejectedValue(new Error('Database error'))

    const response = await HEAD()

    expect(response.status).toBe(503)
  })
})
