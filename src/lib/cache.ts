/**
 * Cache configuration and utilities for CampaignSites.net
 * Provides caching strategies for different data types
 */

import { logger } from './monitoring/logger'
import { getCloudflareEnv } from './cloudflare'

// Cache durations in seconds
export const CACHE_DURATIONS = {
  // Static content - rarely changes
  static: 86400, // 24 hours

  // Content pages - change occasionally
  content: 3600, // 1 hour

  // Dynamic data - may change frequently
  dynamic: 60, // 1 minute

  // Real-time data - no caching
  realtime: 0,
} as const

// Cache tags for invalidation
export const CACHE_TAGS = {
  posts: 'posts',
  caseStudies: 'case-studies',
  tools: 'tools',
  pages: 'pages',
  gallery: 'gallery',
} as const

type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]

/**
 * Generate cache headers for Next.js fetch requests
 */
export function getCacheHeaders(
  duration: keyof typeof CACHE_DURATIONS = 'content',
  tags?: CacheTag[]
) {
  const seconds = CACHE_DURATIONS[duration]

  return {
    next: {
      revalidate: seconds,
      tags: tags || [],
    },
  }
}

/**
 * Cache configuration for different page types
 */
export const pageCacheConfig = {
  // Blog post pages
  blogPost: {
    revalidate: CACHE_DURATIONS.content,
    tags: [CACHE_TAGS.posts],
  },

  // Gallery/case study pages
  galleryPost: {
    revalidate: CACHE_DURATIONS.content,
    tags: [CACHE_TAGS.caseStudies, CACHE_TAGS.gallery],
  },

  // Static pages (home, about, etc.)
  staticPage: {
    revalidate: CACHE_DURATIONS.static,
    tags: [CACHE_TAGS.pages],
  },

  // Tool listings
  toolsPage: {
    revalidate: CACHE_DURATIONS.dynamic,
    tags: [CACHE_TAGS.tools],
  },
} as const

/**
 * In-memory cache for server-side data (use with caution)
 * Only for data that can be safely cached in memory
 */
class MemoryCache<T> {
  private cache = new Map<string, { value: T; expires: number }>()

  get(key: string): T | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined

    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return undefined
    }

    return entry.value
  }

  set(key: string, value: T, ttlSeconds: number): void {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttlSeconds * 1000,
    })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key)
      }
    }
  }
}

// Global memory cache instance
export const memoryCache = new MemoryCache<unknown>()

// Periodic cleanup every 5 minutes
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    memoryCache.cleanup()
    logger.debug('Memory cache cleanup completed')
  }, 5 * 60 * 1000)
}

/**
 * Cache key generator for consistent cache keys
 */
export function generateCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `${prefix}:${parts.join(':')}`
}

/**
 * Stale-while-revalidate cache control header
 */
export function getStaleWhileRevalidateHeader(maxAge: number, staleWhileRevalidate = 86400): string {
  return `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
}

/**
 * Cache middleware helper for API routes
 */
export function withCacheControl(
  handler: (req: Request) => Promise<Response>,
  options: {
    maxAge?: number
    staleWhileRevalidate?: number
    private?: boolean
  } = {}
) {
  return async (req: Request): Promise<Response> => {
    const response = await handler(req)

    const { maxAge = 60, staleWhileRevalidate = 3600, private: isPrivate = false } = options

    const cacheControl = isPrivate
      ? 'private, no-store'
      : getStaleWhileRevalidateHeader(maxAge, staleWhileRevalidate)

    response.headers.set('Cache-Control', cacheControl)

    return response
  }
}

/**
 * Cloudflare KV Cache Layer
 * Provides edge-optimized caching for Payload CMS queries
 */

export interface KVCacheOptions {
  ttl?: number // TTL in seconds
  tags?: string[]
}

/**
 * Get data from KV cache
 */
export async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    const env = await getCloudflareEnv()
    const kv = env?.CACHE_KV as KVNamespace | undefined

    if (!kv) {
      logger.debug('KV cache not available')
      return null
    }

    const cached = await kv.get(key, 'json')
    if (cached) {
      logger.debug(`Cache hit: ${key}`)
      return cached as T
    }

    logger.debug(`Cache miss: ${key}`)
    return null
  } catch (error) {
    logger.error('Cache get error', { key, error })
    return null
  }
}

/**
 * Set data in KV cache
 */
export async function setInCache<T>(
  key: string,
  value: T,
  options: KVCacheOptions = {}
): Promise<void> {
  try {
    const env = await getCloudflareEnv()
    const kv = env?.CACHE_KV as KVNamespace | undefined

    if (!kv) {
      logger.debug('KV cache not available')
      return
    }

    const ttl = options.ttl || CACHE_DURATIONS.content
    await kv.put(key, JSON.stringify(value), {
      expirationTtl: ttl,
      metadata: options.tags ? { tags: options.tags } : undefined,
    })

    logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`)
  } catch (error) {
    logger.error('Cache set error', { key, error })
  }
}

/**
 * Delete data from KV cache
 */
export async function deleteFromCache(key: string): Promise<void> {
  try {
    const env = await getCloudflareEnv()
    const kv = env?.CACHE_KV as KVNamespace | undefined

    if (!kv) {
      return
    }

    await kv.delete(key)
    logger.debug(`Cache deleted: ${key}`)
  } catch (error) {
    logger.error('Cache delete error', { key, error })
  }
}

/**
 * Invalidate cache by tag pattern
 * Note: KV doesn't support native tag-based invalidation,
 * so we use key prefixes for bulk invalidation
 */
export async function invalidateCacheByTag(tag: string): Promise<void> {
  try {
    const env = await getCloudflareEnv()
    const kv = env?.CACHE_KV as KVNamespace | undefined

    if (!kv) {
      return
    }

    // List all keys with the tag prefix and delete them
    const prefix = `${tag}:`
    const list = await kv.list({ prefix })

    const deletePromises = list.keys.map((key) => kv.delete(key.name))
    await Promise.all(deletePromises)

    logger.info(`Cache invalidated for tag: ${tag} (${list.keys.length} keys)`)
  } catch (error) {
    logger.error('Cache invalidation error', { tag, error })
  }
}

/**
 * Cached query wrapper for Payload CMS
 * Automatically caches query results with proper invalidation
 */
export async function cachedQuery<T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  options: KVCacheOptions = {}
): Promise<T> {
  // Try to get from cache first
  const cached = await getFromCache<T>(cacheKey)
  if (cached !== null) {
    return cached
  }

  // Execute query
  const result = await queryFn()

  // Store in cache
  await setInCache(cacheKey, result, options)

  return result
}
