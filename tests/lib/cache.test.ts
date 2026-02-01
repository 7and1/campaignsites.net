import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  memoryCache,
  generateCacheKey,
  getStaleWhileRevalidateHeader,
  CACHE_DURATIONS,
  CACHE_TAGS,
} from '@/lib/cache'

describe('memoryCache', () => {
  beforeEach(() => {
    memoryCache.clear()
  })

  afterEach(() => {
    memoryCache.clear()
  })

  it('stores and retrieves values', () => {
    memoryCache.set('test-key', 'test-value', 60)
    const value = memoryCache.get('test-key')
    expect(value).toBe('test-value')
  })

  it('returns undefined for non-existent keys', () => {
    const value = memoryCache.get('non-existent')
    expect(value).toBeUndefined()
  })

  it('expires values after TTL', () => {
    vi.useFakeTimers()
    memoryCache.set('test-key', 'test-value', 1) // 1 second TTL

    // Value should exist immediately
    expect(memoryCache.get('test-key')).toBe('test-value')

    // Advance time by 2 seconds
    vi.advanceTimersByTime(2000)

    // Value should be expired
    expect(memoryCache.get('test-key')).toBeUndefined()

    vi.useRealTimers()
  })

  it('deletes specific keys', () => {
    memoryCache.set('key1', 'value1', 60)
    memoryCache.set('key2', 'value2', 60)

    memoryCache.delete('key1')

    expect(memoryCache.get('key1')).toBeUndefined()
    expect(memoryCache.get('key2')).toBe('value2')
  })

  it('clears all values', () => {
    memoryCache.set('key1', 'value1', 60)
    memoryCache.set('key2', 'value2', 60)

    memoryCache.clear()

    expect(memoryCache.get('key1')).toBeUndefined()
    expect(memoryCache.get('key2')).toBeUndefined()
  })

  it('cleans up expired entries', () => {
    vi.useFakeTimers()

    memoryCache.set('key1', 'value1', 1) // 1 second TTL
    memoryCache.set('key2', 'value2', 60) // 60 seconds TTL

    // Advance time by 2 seconds
    vi.advanceTimersByTime(2000)

    // Run cleanup
    memoryCache.cleanup()

    // key1 should be removed, key2 should remain
    expect(memoryCache.get('key1')).toBeUndefined()
    expect(memoryCache.get('key2')).toBe('value2')

    vi.useRealTimers()
  })

  it('handles different data types', () => {
    const objectValue = { name: 'test', count: 42 }
    const arrayValue = [1, 2, 3]
    const numberValue = 123

    memoryCache.set('object', objectValue, 60)
    memoryCache.set('array', arrayValue, 60)
    memoryCache.set('number', numberValue, 60)

    expect(memoryCache.get('object')).toEqual(objectValue)
    expect(memoryCache.get('array')).toEqual(arrayValue)
    expect(memoryCache.get('number')).toBe(numberValue)
  })
})

describe('generateCacheKey', () => {
  it('generates consistent cache keys', () => {
    const key1 = generateCacheKey('posts', 'slug', 'test-post')
    const key2 = generateCacheKey('posts', 'slug', 'test-post')
    expect(key1).toBe(key2)
  })

  it('generates unique keys for different inputs', () => {
    const key1 = generateCacheKey('posts', 'slug', 'post-1')
    const key2 = generateCacheKey('posts', 'slug', 'post-2')
    expect(key1).not.toBe(key2)
  })

  it('handles numeric parts', () => {
    const key = generateCacheKey('posts', 'id', 123)
    expect(key).toBe('posts:id:123')
  })

  it('handles multiple parts', () => {
    const key = generateCacheKey('posts', 'category', 'marketing', 'page', 1)
    expect(key).toBe('posts:category:marketing:page:1')
  })

  it('handles empty parts', () => {
    const key = generateCacheKey('posts')
    expect(key).toBe('posts:')
  })
})

describe('getStaleWhileRevalidateHeader', () => {
  it('generates correct cache control header', () => {
    const header = getStaleWhileRevalidateHeader(60, 3600)
    expect(header).toBe('public, max-age=60, stale-while-revalidate=3600')
  })

  it('uses default stale-while-revalidate value', () => {
    const header = getStaleWhileRevalidateHeader(60)
    expect(header).toBe('public, max-age=60, stale-while-revalidate=86400')
  })

  it('handles zero max-age', () => {
    const header = getStaleWhileRevalidateHeader(0, 60)
    expect(header).toBe('public, max-age=0, stale-while-revalidate=60')
  })

  it('handles large values', () => {
    const header = getStaleWhileRevalidateHeader(86400, 604800)
    expect(header).toBe('public, max-age=86400, stale-while-revalidate=604800')
  })
})

describe('CACHE_DURATIONS', () => {
  it('defines static cache duration', () => {
    expect(CACHE_DURATIONS.static).toBe(86400) // 24 hours
  })

  it('defines content cache duration', () => {
    expect(CACHE_DURATIONS.content).toBe(3600) // 1 hour
  })

  it('defines dynamic cache duration', () => {
    expect(CACHE_DURATIONS.dynamic).toBe(60) // 1 minute
  })

  it('defines realtime cache duration', () => {
    expect(CACHE_DURATIONS.realtime).toBe(0) // no caching
  })
})

describe('CACHE_TAGS', () => {
  it('defines all required cache tags', () => {
    expect(CACHE_TAGS.posts).toBe('posts')
    expect(CACHE_TAGS.caseStudies).toBe('case-studies')
    expect(CACHE_TAGS.tools).toBe('tools')
    expect(CACHE_TAGS.pages).toBe('pages')
    expect(CACHE_TAGS.gallery).toBe('gallery')
  })
})
