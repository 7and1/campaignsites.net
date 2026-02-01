import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSearchData } from '@/app/actions/search'

// Mock dependencies
vi.mock('payload', () => ({
  getPayload: vi.fn(),
}))

vi.mock('@payload-config', () => ({
  default: {},
}))

describe('getSearchData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns search data from all collections', async () => {
    const { getPayload } = await import('payload')
    vi.mocked(getPayload).mockResolvedValue({
      find: vi.fn()
        .mockResolvedValueOnce({
          docs: [
            {
              id: '1',
              title: 'Test Post',
              excerpt: 'Test excerpt',
              slug: 'test-post',
              category: 'Marketing',
              tags: ['utm', 'tracking'],
            },
          ],
        })
        .mockResolvedValueOnce({
          docs: [
            {
              id: '2',
              title: 'Test Case Study',
              summary: 'Test summary',
              slug: 'test-case-study',
              category: 'E-commerce',
            },
          ],
        })
        .mockResolvedValueOnce({
          docs: [
            {
              id: '3',
              name: 'UTM Builder',
              description: 'Build UTM parameters',
              slug: 'utm-builder',
              category: 'Analytics',
            },
          ],
        }),
    } as any)

    const result = await getSearchData()

    expect(result.length).toBeGreaterThan(3) // Posts + Case Studies + Tools + Static Pages
    expect(result.some(item => item.type === 'post')).toBe(true)
    expect(result.some(item => item.type === 'case-study')).toBe(true)
    expect(result.some(item => item.type === 'tool')).toBe(true)
    expect(result.some(item => item.type === 'page')).toBe(true)
  })

  it('includes static pages', async () => {
    const { getPayload } = await import('payload')
    vi.mocked(getPayload).mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as any)

    const result = await getSearchData()

    const staticPages = result.filter(item => item.type === 'page')
    expect(staticPages.length).toBeGreaterThan(0)
    expect(staticPages.some(page => page.href === '/tools')).toBe(true)
    expect(staticPages.some(page => page.href === '/gallery')).toBe(true)
    expect(staticPages.some(page => page.href === '/blog')).toBe(true)
    expect(staticPages.some(page => page.href === '/about')).toBe(true)
  })

  it('formats post data correctly', async () => {
    const { getPayload } = await import('payload')
    vi.mocked(getPayload).mockResolvedValue({
      find: vi.fn()
        .mockResolvedValueOnce({
          docs: [
            {
              id: '1',
              title: 'How to Use UTM Parameters',
              excerpt: 'Learn about UTM tracking',
              slug: 'utm-parameters-guide',
              category: 'Analytics',
              tags: ['utm', 'tracking', 'analytics'],
            },
          ],
        })
        .mockResolvedValueOnce({ docs: [] })
        .mockResolvedValueOnce({ docs: [] }),
    } as any)

    const result = await getSearchData()
    const post = result.find(item => item.type === 'post')

    expect(post).toBeDefined()
    expect(post?.id).toBe('post-1')
    expect(post?.title).toBe('How to Use UTM Parameters')
    expect(post?.description).toBe('Learn about UTM tracking')
    expect(post?.href).toBe('/blog/utm-parameters-guide')
    expect(post?.category).toBe('Analytics')
    expect(post?.tags).toEqual(['utm', 'tracking', 'analytics'])
  })

  it('formats case study data correctly', async () => {
    const { getPayload } = await import('payload')
    vi.mocked(getPayload).mockResolvedValue({
      find: vi.fn()
        .mockResolvedValueOnce({ docs: [] })
        .mockResolvedValueOnce({
          docs: [
            {
              id: '2',
              title: 'E-commerce Landing Page',
              summary: 'Increased conversions by 45%',
              slug: 'ecommerce-case-study',
              category: 'E-commerce',
            },
          ],
        })
        .mockResolvedValueOnce({ docs: [] }),
    } as any)

    const result = await getSearchData()
    const caseStudy = result.find(item => item.type === 'case-study')

    expect(caseStudy).toBeDefined()
    expect(caseStudy?.id).toBe('case-study-2')
    expect(caseStudy?.title).toBe('E-commerce Landing Page')
    expect(caseStudy?.description).toBe('Increased conversions by 45%')
    expect(caseStudy?.href).toBe('/gallery/ecommerce-case-study')
    expect(caseStudy?.category).toBe('E-commerce')
  })

  it('formats tool data correctly', async () => {
    const { getPayload } = await import('payload')
    vi.mocked(getPayload).mockResolvedValue({
      find: vi.fn()
        .mockResolvedValueOnce({ docs: [] })
        .mockResolvedValueOnce({ docs: [] })
        .mockResolvedValueOnce({
          docs: [
            {
              id: '3',
              name: 'Budget Calculator',
              description: 'Calculate your marketing budget',
              slug: 'budget-calc',
              category: 'Planning',
            },
          ],
        }),
    } as any)

    const result = await getSearchData()
    const tool = result.find(item => item.type === 'tool')

    expect(tool).toBeDefined()
    expect(tool?.id).toBe('tool-3')
    expect(tool?.title).toBe('Budget Calculator')
    expect(tool?.description).toBe('Calculate your marketing budget')
    expect(tool?.href).toBe('/tools/budget-calc')
    expect(tool?.category).toBe('Planning')
  })

  it('handles missing optional fields', async () => {
    const { getPayload } = await import('payload')
    vi.mocked(getPayload).mockResolvedValue({
      find: vi.fn()
        .mockResolvedValueOnce({
          docs: [
            {
              id: '1',
              title: 'Post without extras',
              slug: 'minimal-post',
            },
          ],
        })
        .mockResolvedValueOnce({ docs: [] })
        .mockResolvedValueOnce({ docs: [] }),
    } as any)

    const result = await getSearchData()
    const post = result.find(item => item.type === 'post')

    expect(post).toBeDefined()
    expect(post?.description).toBe('')
    expect(post?.category).toBeUndefined()
    expect(post?.tags).toBeUndefined()
  })

  it('returns fallback data on error', async () => {
    const { getPayload } = await import('payload')
    vi.mocked(getPayload).mockRejectedValue(new Error('Database error'))

    const result = await getSearchData()

    expect(result.length).toBeGreaterThan(0)
    expect(result.every(item => item.type === 'page')).toBe(true)
    expect(result.some(item => item.href === '/tools')).toBe(true)
  })

  it('handles empty collections', async () => {
    const { getPayload } = await import('payload')
    vi.mocked(getPayload).mockResolvedValue({
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as any)

    const result = await getSearchData()

    // Should still have static pages
    expect(result.length).toBeGreaterThan(0)
    expect(result.every(item => item.type === 'page')).toBe(true)
  })

  it('fetches collections in parallel', async () => {
    const { getPayload } = await import('payload')
    const mockFind = vi.fn().mockResolvedValue({ docs: [] })
    vi.mocked(getPayload).mockResolvedValue({
      find: mockFind,
    } as any)

    await getSearchData()

    // Should call find 3 times (posts, case-studies, tools)
    expect(mockFind).toHaveBeenCalledTimes(3)
  })

  it('sorts posts by publishedDate', async () => {
    const { getPayload } = await import('payload')
    const mockFind = vi.fn().mockResolvedValue({ docs: [] })
    vi.mocked(getPayload).mockResolvedValue({
      find: mockFind,
    } as any)

    await getSearchData()

    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'posts',
        sort: '-publishedDate',
      })
    )
  })

  it('sorts case studies by score', async () => {
    const { getPayload } = await import('payload')
    const mockFind = vi.fn().mockResolvedValue({ docs: [] })
    vi.mocked(getPayload).mockResolvedValue({
      find: mockFind,
    } as any)

    await getSearchData()

    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'case-studies',
        sort: '-score',
      })
    )
  })

  it('sorts tools by rating', async () => {
    const { getPayload } = await import('payload')
    const mockFind = vi.fn().mockResolvedValue({ docs: [] })
    vi.mocked(getPayload).mockResolvedValue({
      find: mockFind,
    } as any)

    await getSearchData()

    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'tools',
        sort: '-rating',
      })
    )
  })

  it('limits results appropriately', async () => {
    const { getPayload } = await import('payload')
    const mockFind = vi.fn().mockResolvedValue({ docs: [] })
    vi.mocked(getPayload).mockResolvedValue({
      find: mockFind,
    } as any)

    await getSearchData()

    // Posts and case studies: 100, tools: 50
    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'posts',
        limit: 100,
      })
    )
    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'tools',
        limit: 50,
      })
    )
  })
})
