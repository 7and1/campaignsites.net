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

// Tool variant configurations for programmatic SEO pages
const toolVariantRoutes: SitemapEntry[] = [
  // UTM Builder variants (8)
  { url: '/tools/utm-builder/for-google-ads', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/utm-builder/for-facebook-ads', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/utm-builder/for-email-campaigns', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/utm-builder/for-influencer-marketing', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/utm-builder/for-affiliate-links', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/utm-builder/for-qr-codes', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/utm-builder/for-print-ads', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/utm-builder/for-events', changeFrequency: 'monthly', priority: 0.7 },
  // Countdown variants (8)
  { url: '/tools/countdown/for-black-friday', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/countdown/for-product-launches', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/countdown/for-webinars', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/countdown/for-flash-sales', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/countdown/for-course-enrollment', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/countdown/for-event-registration', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/countdown/for-limited-offers', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/countdown/for-seasonal-sales', changeFrequency: 'monthly', priority: 0.7 },
  // Budget Calc variants (8)
  { url: '/tools/budget-calc/for-ecommerce', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/budget-calc/for-saas', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/budget-calc/for-local-business', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/budget-calc/for-startups', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/budget-calc/for-agencies', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/budget-calc/for-b2b', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/budget-calc/for-lead-generation', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/budget-calc/for-brand-awareness', changeFrequency: 'monthly', priority: 0.7 },
  // Copy Optimizer variants (8)
  { url: '/tools/copy-optimizer/for-headlines', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/copy-optimizer/for-ctas', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/copy-optimizer/for-email-subject-lines', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/copy-optimizer/for-ad-copy', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/copy-optimizer/for-landing-pages', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/copy-optimizer/for-product-descriptions', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/copy-optimizer/for-social-media', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/copy-optimizer/for-blog-titles', changeFrequency: 'monthly', priority: 0.7 },
  // AI Lab variants (6)
  { url: '/tools/ai-lab/for-campaign-naming', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/ai-lab/for-landing-page-analysis', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/ai-lab/for-ab-testing', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/ai-lab/for-conversion-optimization', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/ai-lab/for-content-strategy', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/ai-lab/for-marketing-automation', changeFrequency: 'monthly', priority: 0.7 },
  // Meta Preview variants (6)
  { url: '/tools/meta-preview/for-blog-posts', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/meta-preview/for-landing-pages', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/meta-preview/for-ecommerce', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/meta-preview/for-social-sharing', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/meta-preview/for-news-articles', changeFrequency: 'monthly', priority: 0.7 },
  { url: '/tools/meta-preview/for-portfolios', changeFrequency: 'monthly', priority: 0.7 },
]

const staticRoutes: SitemapEntry[] = [
  { url: '', changeFrequency: 'weekly', priority: 1.0 },
  { url: '/tools', changeFrequency: 'weekly', priority: 0.9 },
  { url: '/tools/countdown', changeFrequency: 'monthly', priority: 0.8 },
  { url: '/tools/utm-builder', changeFrequency: 'monthly', priority: 0.8 },
  { url: '/tools/budget-calc', changeFrequency: 'monthly', priority: 0.8 },
  { url: '/tools/copy-optimizer', changeFrequency: 'monthly', priority: 0.8 },
  { url: '/tools/ai-lab', changeFrequency: 'monthly', priority: 0.8 },
  { url: '/tools/meta-preview', changeFrequency: 'monthly', priority: 0.8 },
  { url: '/gallery', changeFrequency: 'weekly', priority: 0.9 },
  { url: '/blog', changeFrequency: 'daily', priority: 0.9 },
  { url: '/resources', changeFrequency: 'weekly', priority: 0.7 },
  { url: '/submit', changeFrequency: 'monthly', priority: 0.6 },
  { url: '/about', changeFrequency: 'yearly', priority: 0.5 },
  { url: '/contact', changeFrequency: 'yearly', priority: 0.5 },
  { url: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { url: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  { url: '/analytics', changeFrequency: 'monthly', priority: 0.4 },
  { url: '/affiliate-tools', changeFrequency: 'weekly', priority: 0.7 },
  ...toolVariantRoutes,
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const payload = await getPayload({ config })
    const [posts, caseStudies] = await Promise.all([
      payload.find({ collection: 'posts', limit: 1000, sort: '-publishedDate' }),
      payload.find({ collection: 'case-studies', limit: 1000, sort: '-updatedAt' }),
    ])

    const POSTS_PER_PAGE = 12
    const CASE_STUDIES_PER_PAGE = 12
    const totalPostPages = Math.ceil(posts.totalDocs / POSTS_PER_PAGE)
    const totalCaseStudyPages = Math.ceil(caseStudies.totalDocs / CASE_STUDIES_PER_PAGE)

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

    // Add paginated blog pages
    for (let page = 2; page <= totalPostPages; page++) {
      dynamicRoutes.push({
        url: `${baseUrl}/blog?page=${page}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.6,
      })
    }

    // Add paginated gallery pages
    for (let page = 2; page <= totalCaseStudyPages; page++) {
      dynamicRoutes.push({
        url: `${baseUrl}/gallery?page=${page}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })
    }

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
