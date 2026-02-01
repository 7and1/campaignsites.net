/**
 * Payload CMS Query Caching Layer
 * Provides KV-based caching for Payload queries with automatic invalidation
 */

import { getPayload, Where } from 'payload'
import config from '@payload-config'
import { cachedQuery, CACHE_DURATIONS, CACHE_TAGS, invalidateCacheByTag } from './cache'
import type { Post, CaseStudy, Tool } from './types'

/**
 * Get all posts with caching
 */
export async function getCachedPosts(options: {
  limit?: number
  sort?: string
  where?: Where
} = {}) {
  const { limit = 10, sort = '-publishedDate', where = {} } = options
  const cacheKey = `${CACHE_TAGS.posts}:list:${JSON.stringify({ limit, sort, where })}`

  return cachedQuery(
    cacheKey,
    async () => {
      const payload = await getPayload({ config })
      const result = await payload.find({
        collection: 'posts',
        limit,
        sort,
        where,
        depth: 1,
      })
      return result.docs as Post[]
    },
    { ttl: CACHE_DURATIONS.content, tags: [CACHE_TAGS.posts] }
  )
}

/**
 * Get single post by slug with caching
 */
export async function getCachedPost(slug: string) {
  const cacheKey = `${CACHE_TAGS.posts}:${slug}`

  return cachedQuery(
    cacheKey,
    async () => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'posts',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 1,
      })
      return docs[0] as Post | undefined
    },
    { ttl: CACHE_DURATIONS.content, tags: [CACHE_TAGS.posts] }
  )
}

/**
 * Get all case studies with caching
 */
export async function getCachedCaseStudies(options: {
  limit?: number
  sort?: string
  where?: Where
} = {}) {
  const { limit = 10, sort = '-score', where = {} } = options
  const cacheKey = `${CACHE_TAGS.caseStudies}:list:${JSON.stringify({ limit, sort, where })}`

  return cachedQuery(
    cacheKey,
    async () => {
      const payload = await getPayload({ config })
      const result = await payload.find({
        collection: 'case-studies',
        limit,
        sort,
        where,
        depth: 1,
      })
      return result.docs as CaseStudy[]
    },
    { ttl: CACHE_DURATIONS.content, tags: [CACHE_TAGS.caseStudies] }
  )
}

/**
 * Get single case study by slug with caching
 */
export async function getCachedCaseStudy(slug: string) {
  const cacheKey = `${CACHE_TAGS.caseStudies}:${slug}`

  return cachedQuery(
    cacheKey,
    async () => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'case-studies',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 1,
      })
      return docs[0] as CaseStudy | undefined
    },
    { ttl: CACHE_DURATIONS.content, tags: [CACHE_TAGS.caseStudies] }
  )
}

/**
 * Get all tools with caching
 */
export async function getCachedTools(options: {
  limit?: number
  sort?: string
  where?: Where
} = {}) {
  const { limit = 100, sort = 'name', where = {} } = options
  const cacheKey = `${CACHE_TAGS.tools}:list:${JSON.stringify({ limit, sort, where })}`

  return cachedQuery(
    cacheKey,
    async () => {
      const payload = await getPayload({ config })
      const result = await payload.find({
        collection: 'tools',
        limit,
        sort,
        where,
        depth: 1,
      })
      return result.docs as Tool[]
    },
    { ttl: CACHE_DURATIONS.content, tags: [CACHE_TAGS.tools] }
  )
}

/**
 * Get single tool by slug with caching
 */
export async function getCachedTool(slug: string) {
  const cacheKey = `${CACHE_TAGS.tools}:${slug}`

  return cachedQuery(
    cacheKey,
    async () => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'tools',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 1,
      })
      return docs[0] as Tool | undefined
    },
    { ttl: CACHE_DURATIONS.content, tags: [CACHE_TAGS.tools] }
  )
}

/**
 * Invalidate cache for a specific collection
 */
export async function invalidateCollectionCache(collection: 'posts' | 'case-studies' | 'tools') {
  const tagMap = {
    posts: CACHE_TAGS.posts,
    'case-studies': CACHE_TAGS.caseStudies,
    tools: CACHE_TAGS.tools,
  }

  await invalidateCacheByTag(tagMap[collection])
}

/**
 * Invalidate all content caches
 */
export async function invalidateAllContentCache() {
  await Promise.all([
    invalidateCacheByTag(CACHE_TAGS.posts),
    invalidateCacheByTag(CACHE_TAGS.caseStudies),
    invalidateCacheByTag(CACHE_TAGS.tools),
  ])
}
