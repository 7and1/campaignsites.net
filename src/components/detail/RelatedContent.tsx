import { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Post, CaseStudy } from '@/lib/types'

type ContentItem = Post | CaseStudy

interface RelatedContentProps {
  items: ContentItem[]
  type: 'post' | 'case-study'
  title?: string
  description?: string
}

const isPost = (item: ContentItem): item is Post => {
  return 'excerpt' in item && 'featuredImage' in item
}

const isCaseStudy = (item: ContentItem): item is CaseStudy => {
  return 'summary' in item && 'heroImage' in item
}

export const RelatedContent = memo(function RelatedContent({
  items,
  type,
  title,
  description,
}: RelatedContentProps) {
  if (items.length === 0) return null

  const basePath = type === 'post' ? '/blog' : '/gallery'
  const defaultTitle = type === 'post' ? 'Related guides' : 'Related case studies'

  return (
    <section className="border-t border-white/70 bg-mist-50/50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-2xl font-semibold text-ink-900">{title || defaultTitle}</h2>
        {description && <p className="mt-2 text-ink-600">{description}</p>}
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
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
