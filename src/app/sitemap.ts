import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { CaseStudy, Post } from '@/lib/types'

const baseUrl = 'https://campaignsites.net'

interface SitemapEntry {
  url: string
  lastModified?: Date | string
  changeFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'always'
  priority?: number
}

const staticRoutes: SitemapEntry[] = [
  { url: '', changeFrequency: 'weekly', priority: 1.0 },
  { url: '/tools', changeFrequency: 'weekly', priority: 0.9 },
  { url: '/tools/countdown', changeFrequency: 'monthly', priority: 0.8 },
  { url: '/tools/utm-builder', changeFrequency: 'monthly', priority: 0.8 },
  { url: '/tools/budget-calc', changeFrequency: 'monthly', priority: 0.8 },
  { url: '/tools/copy-optimizer', changeFrequency: 'monthly', priority: 0.8 },
  { url: '/tools/ai-lab', changeFrequency: 'monthly', priority: 0.8 },
  { url: '/gallery', changeFrequency: 'weekly', priority: 0.9 },
  { url: '/blog', changeFrequency: 'daily', priority: 0.9 },
  { url: '/resources', changeFrequency: 'weekly', priority: 0.7 },
  { url: '/submit', changeFrequency: 'monthly', priority: 0.6 },
  { url: '/about', changeFrequency: 'yearly', priority: 0.5 },
  { url: '/contact', changeFrequency: 'yearly', priority: 0.5 },
  { url: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { url: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  { url: '/analytics', changeFrequency: 'monthly', priority: 0.4 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const payload = await getPayload({ config })
    const [posts, caseStudies] = await Promise.all([
      payload.find({ collection: 'posts', limit: 1000, sort: '-publishedDate' }),
      payload.find({ collection: 'case-studies', limit: 1000, sort: '-updatedAt' }),
    ])

    const dynamicRoutes: SitemapEntry[] = [
      ...(posts.docs as Post[]).map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt || post.publishedDate || new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
      ...(caseStudies.docs as CaseStudy[]).map((study) => ({
        url: `${baseUrl}/gallery/${study.slug}`,
        lastModified: study.updatedAt || new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
    ]

    return [
      ...staticRoutes.map((route) => ({
        url: `${baseUrl}${route.url}`,
        lastModified: route.lastModified || new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      })),
      ...dynamicRoutes,
    ]
  } catch {
    return staticRoutes.map((route) => ({
      url: `${baseUrl}${route.url}`,
      lastModified: route.lastModified || new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }))
  }
}
