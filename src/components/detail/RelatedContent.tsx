import { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Post, CaseStudy, Tool } from '@/lib/types'
import { Target, Timer, Calculator, Sparkles, Wand2 } from 'lucide-react'

type ContentItem = Post | CaseStudy

interface RelatedContentProps {
  items: ContentItem[]
  type: 'post' | 'case-study'
  title?: string
  description?: string
  relatedTools?: Tool[]
  showToolsOnCaseStudy?: boolean
  currentItem?: ContentItem
  allItems?: ContentItem[]
}

const isPost = (item: ContentItem): item is Post => {
  return 'excerpt' in item && 'featuredImage' in item
}

const isCaseStudy = (item: ContentItem): item is CaseStudy => {
  return 'summary' in item && 'heroImage' in item
}

// Calculate similarity score between two content items
const calculateSimilarity = (item1: ContentItem, item2: ContentItem): number => {
  let score = 0

  // Category match (highest weight)
  const cat1 = isPost(item1) ? item1.category : isCaseStudy(item1) ? item1.category : undefined
  const cat2 = isPost(item2) ? item2.category : isCaseStudy(item2) ? item2.category : undefined
  if (cat1 && cat2 && cat1 === cat2) {
    score += 50
  }

  // Tag overlap (medium weight)
  if (isPost(item1) && isPost(item2)) {
    const tags1 = item1.tags || []
    const tags2 = item2.tags || []
    const commonTags = tags1.filter((tag) => tags2.includes(tag))
    score += commonTags.length * 10
  }

  // Tool overlap (medium weight)
  if (isPost(item1) && isPost(item2)) {
    const tools1 = (item1.relatedTools || []).map((t: Tool | number) =>
      typeof t === 'object' ? t.id : t
    )
    const tools2 = (item2.relatedTools || []).map((t: Tool | number) =>
      typeof t === 'object' ? t.id : t
    )
    const commonTools = tools1.filter((id) => tools2.includes(id))
    score += commonTools.length * 15
  }

  if (isCaseStudy(item1) && isCaseStudy(item2)) {
    const tools1 = (item1.affiliateTools || []).map((t: Tool | number) =>
      typeof t === 'object' ? t.id : t
    )
    const tools2 = (item2.affiliateTools || []).map((t: Tool | number) =>
      typeof t === 'object' ? t.id : t
    )
    const commonTools = tools1.filter((id) => tools2.includes(id))
    score += commonTools.length * 15
  }

  // Recency bonus (lower weight)
  const date1 = isPost(item1) ? item1.publishedDate : isCaseStudy(item1) ? item1.updatedAt : undefined
  const date2 = isPost(item2) ? item2.publishedDate : isCaseStudy(item2) ? item2.updatedAt : undefined
  if (date1 && date2) {
    const daysDiff = Math.abs(new Date(date1).getTime() - new Date(date2).getTime()) / (1000 * 60 * 60 * 24)
    if (daysDiff < 30) score += 5
  }

  return score
}

// Get smart recommendations based on similarity
const getSmartRecommendations = (
  currentItem: ContentItem,
  allItems: ContentItem[],
  limit: number = 3
): ContentItem[] => {
  const scored = allItems
    .filter((item) => item.slug !== currentItem.slug)
    .map((item) => ({
      item,
      score: calculateSimilarity(currentItem, item),
    }))
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map((s) => s.item)
}

const toolIcons: Record<string, typeof Target> = {
  'utm-builder': Target,
  countdown: Timer,
  'budget-calc': Calculator,
  'copy-optimizer': Sparkles,
  'ai-lab': Wand2,
}

export const RelatedContent = memo(function RelatedContent({
  items,
  type,
  title,
  description,
  relatedTools,
  showToolsOnCaseStudy = true,
  currentItem,
  allItems,
}: RelatedContentProps) {
  // Use smart recommendations if current item and all items are provided
  const displayItems = currentItem && allItems && allItems.length > 0
    ? getSmartRecommendations(currentItem, allItems, 3)
    : items

  if (displayItems.length === 0 && (!relatedTools || relatedTools.length === 0)) return null

  const basePath = type === 'post' ? '/blog' : '/gallery'
  const defaultTitle = type === 'post' ? 'Related guides' : 'Related case studies'

  return (
    <section className="border-t border-white/70 bg-mist-50/50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-2xl font-semibold text-ink-900">{title || defaultTitle}</h2>
        {description && <p className="mt-2 text-ink-600">{description}</p>}

        {relatedTools && relatedTools.length > 0 && showToolsOnCaseStudy && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-500">
              Tools Used in This Campaign
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {relatedTools.map((tool) => {
                const Icon = toolIcons[tool.slug] || Target
                return (
                  <Link
                    key={tool.id || tool.slug}
                    href={`/tools/${tool.slug}`}
                    className="group flex items-center gap-3 rounded-xl border border-white/70 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100">
                      <Icon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink-900 group-hover:text-primary-600">
                        {tool.name}
                      </h4>
                      {tool.pricing && (
                        <p className="text-xs text-ink-500">{tool.pricing}</p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {displayItems.map((item) => {
            const imageUrl = isPost(item)
              ? (typeof item.featuredImage === 'string'
                  ? item.featuredImage
                  : item.featuredImage && typeof item.featuredImage !== 'number'
                    ? item.featuredImage.url
                    : undefined)
              : isCaseStudy(item)
                ? (typeof item.heroImage === 'string'
                    ? item.heroImage
                    : item.heroImage && typeof item.heroImage !== 'number'
                      ? item.heroImage.url
                      : undefined)
                : undefined

            const subtitle = isPost(item)
              ? item.excerpt
              : isCaseStudy(item)
                ? item.summary
                : undefined

            const category = isPost(item) ? item.category : isCaseStudy(item) ? item.category : undefined
            const score = isCaseStudy(item) ? item.score : undefined

            return (
              <Link
                key={item.id || item.slug}
                href={`${basePath}/${item.slug}`}
                className="group overflow-hidden rounded-2xl border border-white/80 bg-white/70 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                {imageUrl && (
                  <div className="relative aspect-[16/9] overflow-hidden bg-mist-100">
                    <Image
                      src={imageUrl}
                      alt={item.title}
                      fill
                      loading="lazy"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between text-xs text-ink-500">
                    {category && (
                      <span className="rounded-full bg-primary-50 px-2.5 py-1 font-semibold uppercase tracking-[0.2em] text-primary-600">
                        {category}
                      </span>
                    )}
                    {score !== undefined && (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                        {score}/10
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-ink-900 group-hover:text-primary-600">
                    {item.title}
                  </h3>
                  {subtitle && <p className="mt-2 text-sm text-ink-600 line-clamp-2">{subtitle}</p>}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
})
