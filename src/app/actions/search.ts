'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import type { Post, CaseStudy, Tool } from '@/lib/types'

export interface SearchItem {
  id: string
  title: string
  description: string
  href: string
  type: 'tool' | 'post' | 'case-study' | 'page'
  category?: string
  tags?: string[]
}

export async function getSearchData(): Promise<SearchItem[]> {
  try {
    const payload = await getPayload({ config })

    // Fetch all content in parallel
    const [postsResult, caseStudiesResult, toolsResult] = await Promise.all([
      payload.find({
        collection: 'posts',
        limit: 100,
        depth: 0,
        sort: '-publishedDate',
      }),
      payload.find({
        collection: 'case-studies',
        limit: 100,
        depth: 0,
        sort: '-score',
      }),
      payload.find({
        collection: 'tools',
        limit: 50,
        depth: 0,
        sort: '-rating',
      }),
    ])

    const searchItems: SearchItem[] = []

    // Add posts
    for (const post of postsResult.docs as Post[]) {
      searchItems.push({
        id: `post-${post.id}`,
        title: post.title,
        description: post.excerpt || '',
        href: `/blog/${post.slug}`,
        type: 'post',
        category: post.category || undefined,
        tags: post.tags || undefined,
      })
    }

    // Add case studies
    for (const caseStudy of caseStudiesResult.docs as CaseStudy[]) {
      searchItems.push({
        id: `case-study-${caseStudy.id}`,
        title: caseStudy.title,
        description: caseStudy.summary || '',
        href: `/gallery/${caseStudy.slug}`,
        type: 'case-study',
        category: caseStudy.category || undefined,
      })
    }

    // Add tools
    for (const tool of toolsResult.docs as Tool[]) {
      searchItems.push({
        id: `tool-${tool.id}`,
        title: tool.name,
        description: tool.description || '',
        href: `/tools/${tool.slug}`,
        type: 'tool',
        category: tool.category || undefined,
      })
    }

    // Add static pages
    const staticPages: SearchItem[] = [
      {
        id: 'page-tools',
        title: 'All Tools',
        description: 'Browse all free campaign marketing tools',
        href: '/tools',
        type: 'page',
      },
      {
        id: 'page-gallery',
        title: 'Gallery',
        description: 'Real-world landing page case studies and examples',
        href: '/gallery',
        type: 'page',
      },
      {
        id: 'page-blog',
        title: 'Blog',
        description: 'Marketing insights, tips, and strategies',
        href: '/blog',
        type: 'page',
      },
      {
        id: 'page-about',
        title: 'About',
        description: 'Learn about CampaignSites.net',
        href: '/about',
        type: 'page',
      },
    ]

    searchItems.push(...staticPages)

    return searchItems
  } catch (error) {
    console.error('Error fetching search data:', error)
    // Return minimal static data as fallback
    return [
      {
        id: 'page-tools',
        title: 'All Tools',
        description: 'Browse all free campaign marketing tools',
        href: '/tools',
        type: 'page',
      },
      {
        id: 'page-gallery',
        title: 'Gallery',
        description: 'Real-world landing page case studies',
        href: '/gallery',
        type: 'page',
      },
      {
        id: 'page-blog',
        title: 'Blog',
        description: 'Marketing insights and strategies',
        href: '/blog',
        type: 'page',
      },
    ]
  }
}
