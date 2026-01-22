import { describe, it, expect, vi, beforeEach } from 'vitest'
import { analyzeCopy } from '@/app/actions/analyze-copy'

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  })),
}))

describe('analyzeCopy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset environment variable
    process.env.OPENAI_API_KEY = ''
  })

  it('returns fallback result when no API key is present', async () => {
    const result = await analyzeCopy('Test headline', 'headline')

    expect(result).toHaveProperty('score')
    expect(result).toHaveProperty('suggestions')
    expect(result).toHaveProperty('variants')
    expect(result.score).toBeGreaterThanOrEqual(60)
    expect(result.score).toBeLessThan(90)
    expect(result.suggestions).toHaveLength(3)
    expect(result.variants).toHaveLength(3)
  })

  it('returns fallback with expected suggestion format', async () => {
    const result = await analyzeCopy('Buy now', 'cta')

    expect(result.suggestions).toEqual(
      expect.arrayContaining([
        expect.stringContaining('specific'),
        expect.any(String),
        expect.any(String),
      ])
    )
  })

  it('returns fallback variants based on input text', async () => {
    const text = 'Amazing Product'
    const result = await analyzeCopy(text, 'headline')

    expect(result.variants).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Exclusive'),
        expect.stringContaining('Limited Time'),
        expect.stringContaining('Proven'),
      ])
    )
  })

  it('handles empty text gracefully', async () => {
    const result = await analyzeCopy('   ', 'headline')

    expect(result).toHaveProperty('score')
    expect(result).toHaveProperty('suggestions')
    expect(result).toHaveProperty('variants')
  })

  it('handles both headline and cta types', async () => {
    const headlineResult = await analyzeCopy('Test', 'headline')
    const ctaResult = await analyzeCopy('Click Here', 'cta')

    expect(headlineResult).toHaveProperty('score')
    expect(ctaResult).toHaveProperty('score')
  })

  it('returns result in correct shape', async () => {
    const result = await analyzeCopy('Test', 'headline')

    expect(Object.keys(result)).toEqual(['score', 'suggestions', 'variants'])
    expect(typeof result.score).toBe('number')
    expect(Array.isArray(result.suggestions)).toBe(true)
    expect(Array.isArray(result.variants)).toBe(true)
  })
})
