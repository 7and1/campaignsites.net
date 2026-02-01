/**
 * Query optimization utilities for Payload CMS
 * Adds caching and optimizes N+1 queries
 */

import { cache } from 'react'
import type { Payload, Where } from 'payload'

/**
 * Cache configuration
 */
const CACHE_TTL = {
  posts: 60 * 5, // 5 minutes
  caseStudies: 60 * 5, // 5 minutes
  tools: 60 * 10, // 10 minutes
  media: 60 * 30, // 30 minutes
}

/**
 * Cached query for posts with optimized fields
 */
export const getCachedPosts = cache(async (payload: Payload, options?: {
  limit?: number
  page?: number
  where?: Where
}) => {
  return await payload.find({
    collection: 'posts',
    limit: options?.limit || 10,
    page: options?.page || 1,
    where: options?.where,
    sort: '-publishedDate',
    // Optimize: Only fetch needed fields
    select: {
      title: true,
      slug: true,
      excerpt: true,
      publishedDate: true,
      category: true,
      tags: true,
      featuredImage: true,
      metaTitle: true,
      metaDescription: true,
    },
    // Optimize: Populate relationships in single query
    depth: 1,
  })
})

/**
 * Cached query for single post with full content
 */
export const getCachedPost = cache(async (payload: Payload, slug: string) => {
  const result = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2, // Include related tools
  })

  return result.docs[0] || null
})

/**
 * Cached query for case studies with optimized fields
 */
export const getCachedCaseStudies = cache(async (payload: Payload, options?: {
  limit?: number
  page?: number
  where?: Where
}) => {
  return await payload.find({
    collection: 'case-studies',
    limit: options?.limit || 12,
    page: options?.page || 1,
    where: options?.where,
    sort: '-score',
    select: {
      title: true,
      slug: true,
      brand: true,
      category: true,
      score: true,
      summary: true,
      heroImage: true,
      metaTitle: true,
      metaDescription: true,
    },
    depth: 1,
  })
})

/**
 * Cached query for single case study
 */
export const getCachedCaseStudy = cache(async (payload: Payload, slug: string) => {
  const result = await payload.find({
    collection: 'case-studies',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })

  return result.docs[0] || null
})

/**
 * Cached query for tools
 */
export const getCachedTools = cache(async (payload: Payload, options?: {
  limit?: number
  where?: Where
}) => {
  return await payload.find({
    collection: 'tools',
    limit: options?.limit || 50,
    where: options?.where,
    sort: '-rating',
    select: {
      name: true,
      slug: true,
      description: true,
      category: true,
      pricing: true,
      rating: true,
      logo: true,
      affiliateUrl: true,
    },
    depth: 1,
  })
})

/**
 * Cached query for single tool
 */
export const getCachedTool = cache(async (payload: Payload, slug: string) => {
  const result = await payload.find({
    collection: 'tools',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })

  return result.docs[0] || null
})

/**
 * Batch fetch related content to avoid N+1 queries
 */
export const batchFetchRelatedContent = cache(async (
  payload: Payload,
  collection: 'posts' | 'case-studies' | 'tools',
  ids: (string | number)[]
) => {
  if (ids.length === 0) return []

  const result = await payload.find({
    collection,
    where: {
      id: { in: ids },
    },
    limit: ids.length,
    depth: 0, // Don't populate nested relationships
  })

  return result.docs
})

/**
 * Get related posts for a post (by tags)
 */
export const getRelatedPosts = cache(async (
  payload: Payload,
  currentSlug: string,
  tags: string[],
  limit = 3
) => {
  if (tags.length === 0) return []

  return await payload.find({
    collection: 'posts',
    where: {
      slug: { not_equals: currentSlug },
      tags: { in: tags },
    },
    limit,
    sort: '-publishedDate',
    select: {
      title: true,
      slug: true,
      excerpt: true,
      publishedDate: true,
      featuredImage: true,
    },
    depth: 1,
  })
})

/**
 * Get related case studies (by category)
 */
export const getRelatedCaseStudies = cache(async (
  payload: Payload,
  currentSlug: string,
  category: string,
  limit = 3
) => {
  return await payload.find({
    collection: 'case-studies',
    where: {
      slug: { not_equals: currentSlug },
      category: { equals: category },
    },
    limit,
    sort: '-score',
    select: {
      title: true,
      slug: true,
      brand: true,
      category: true,
      score: true,
      summary: true,
      heroImage: true,
    },
    depth: 1,
  })
})

/**
 * Get popular content (by upvotes)
 */
export const getPopularContent = cache(async (
  payload: Payload,
  collection: 'posts' | 'case-studies',
  limit = 5
) => {
  // This would need to join with upvotes table
  // For now, use score/publishedDate as proxy
  const sortField = collection === 'posts' ? '-publishedDate' : '-score'

  return await payload.find({
    collection,
    limit,
    sort: sortField,
    select: {
      title: true,
      slug: true,
      ...(collection === 'posts' ? { excerpt: true, publishedDate: true } : { brand: true, score: true }),
    },
    depth: 0,
  })
})

/**
 * Prefetch related content for a page
 * Useful for optimizing page loads
 */
export async function prefetchPageContent(
  payload: Payload,
  type: 'post' | 'case-study',
  slug: string
) {
  if (type === 'post') {
    const post = await getCachedPost(payload, slug)
    if (post && Array.isArray(post.tags)) {
      await getRelatedPosts(payload, slug, post.tags as string[], 3)
    }
  } else {
    const caseStudy = await getCachedCaseStudy(payload, slug)
    if (caseStudy && typeof caseStudy.category === 'string') {
      await getRelatedCaseStudies(payload, slug, caseStudy.category, 3)
    }
  }
}

/**
 * Invalidate cache for a collection
 * Call this from webhooks when content is updated
 */
export function invalidateCollectionCache(collection: string) {
  // React cache is automatically invalidated on revalidation
  // This is a placeholder for additional cache invalidation logic
  console.log(`Cache invalidated for collection: ${collection}`)
}
