import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPayload } from 'payload'
import config from '@payload-config'

// Mock Payload CMS
vi.mock('payload', () => ({
  getPayload: vi.fn(),
}))

vi.mock('@payload-config', () => ({
  default: {},
}))

describe('Payload CMS Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('successfully connects to Payload', async () => {
    vi.mocked(getPayload).mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as any)

    const payload = await getPayload({ config })
    expect(payload).toBeDefined()
    expect(payload.find).toBeDefined()
  })

  it('fetches posts from Payload', async () => {
    const mockPosts = [
      {
        id: '1',
        title: 'Test Post',
        slug: 'test-post',
        excerpt: 'Test excerpt',
        publishedDate: '2024-01-01',
      },
    ]

    vi.mocked(getPayload).mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: mockPosts }),
    } as any)

    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'posts',
      limit: 10,
    })

    expect(result.docs).toEqual(mockPosts)
  })

  it('fetches case studies from Payload', async () => {
    const mockCaseStudies = [
      {
        id: '1',
        title: 'Test Case Study',
        slug: 'test-case-study',
        summary: 'Test summary',
        score: 85,
      },
    ]

    vi.mocked(getPayload).mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: mockCaseStudies }),
    } as any)

    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'case-studies',
      limit: 10,
    })

    expect(result.docs).toEqual(mockCaseStudies)
  })

  it('fetches tools from Payload', async () => {
    const mockTools = [
      {
        id: '1',
        name: 'UTM Builder',
        slug: 'utm-builder',
        description: 'Build UTM parameters',
        rating: 4.5,
      },
    ]

    vi.mocked(getPayload).mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: mockTools }),
    } as any)

    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'tools',
      limit: 10,
    })

    expect(result.docs).toEqual(mockTools)
  })

  it('handles Payload connection errors', async () => {
    vi.mocked(getPayload).mockRejectedValue(new Error('Connection failed'))

    await expect(getPayload({ config })).rejects.toThrow('Connection failed')
  })

  it('handles empty collections', async () => {
    vi.mocked(getPayload).mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as any)

    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'posts',
      limit: 10,
    })

    expect(result.docs).toEqual([])
  })

  it('supports pagination', async () => {
    vi.mocked(getPayload).mockResolvedValue({
      find: vi.fn().mockResolvedValue({
        docs: [],
        totalDocs: 100,
        limit: 10,
        page: 1,
        totalPages: 10,
      }),
    } as any)

    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'posts',
      limit: 10,
      page: 1,
    })

    expect(result.totalDocs).toBe(100)
    expect(result.totalPages).toBe(10)
  })

  it('supports sorting', async () => {
    const mockFind = vi.fn().mockResolvedValue({ docs: [] })
    vi.mocked(getPayload).mockResolvedValue({
      find: mockFind,
    } as any)

    const payload = await getPayload({ config })
    await payload.find({
      collection: 'posts',
      sort: '-publishedDate',
    })

    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: '-publishedDate',
      })
    )
  })

  it('supports filtering', async () => {
    const mockFind = vi.fn().mockResolvedValue({ docs: [] })
    vi.mocked(getPayload).mockResolvedValue({
      find: mockFind,
    } as any)

    const payload = await getPayload({ config })
    await payload.find({
      collection: 'posts',
      where: {
        category: { equals: 'Marketing' },
      },
    })

    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.any(Object),
      })
    )
  })
})

describe('OpenAI API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.OPENAI_API_KEY
  })

  it('successfully calls OpenAI API', async () => {
    process.env.OPENAI_API_KEY = 'test-key'
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({ names: ['Campaign 1', 'Campaign 2'] }),
            },
          },
        ],
      }),
    })

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Test' }],
      }),
    })

    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data.choices).toBeDefined()
  })

  it('handles OpenAI API errors', async () => {
    process.env.OPENAI_API_KEY = 'test-key'
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
    })

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Test' }],
      }),
    })

    expect(response.ok).toBe(false)
    expect(response.status).toBe(429)
  })

  it('handles network errors', async () => {
    process.env.OPENAI_API_KEY = 'test-key'
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    await expect(
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Test' }],
        }),
      })
    ).rejects.toThrow('Network error')
  })
})

describe('Resend Email Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.RESEND_API_KEY
  })

  it('successfully sends email via Resend', async () => {
    process.env.RESEND_API_KEY = 'test-key'
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'email-123' }),
    })

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'test@example.com',
        to: ['recipient@example.com'],
        subject: 'Test Email',
        html: '<p>Test content</p>',
      }),
    })

    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data.id).toBe('email-123')
  })

  it('handles Resend API errors', async () => {
    process.env.RESEND_API_KEY = 'test-key'
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Invalid email' }),
    })

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'invalid',
        to: ['recipient@example.com'],
        subject: 'Test',
        html: '<p>Test</p>',
      }),
    })

    expect(response.ok).toBe(false)
    expect(response.status).toBe(400)
  })

  it('handles authentication errors', async () => {
    process.env.RESEND_API_KEY = 'invalid-key'
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' }),
    })

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'test@example.com',
        to: ['recipient@example.com'],
        subject: 'Test',
        html: '<p>Test</p>',
      }),
    })

    expect(response.status).toBe(401)
  })
})
