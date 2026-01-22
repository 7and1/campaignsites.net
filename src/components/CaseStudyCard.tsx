import Link from 'next/link'
import Image from 'next/image'
import type { CaseStudy } from '@/lib/types'
import { memo } from 'react'

interface CaseStudyCardProps {
  study: CaseStudy
}

export const CaseStudyCard = memo(function CaseStudyCard({ study }: CaseStudyCardProps) {
  const imageUrl =
    typeof study.heroImage === 'string'
      ? study.heroImage
      : typeof study.heroImage === 'object' && study.heroImage?.url
        ? study.heroImage.url
        : undefined

  return (
    <Link
      href={`/gallery/${study.slug}`}
      className="group overflow-hidden rounded-2xl border border-white/80 bg-white/70 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-mist-100">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={study.title}
            fill
            loading="lazy"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between text-xs text-ink-500">
          <span className="rounded-full bg-primary-50 px-2.5 py-1 font-semibold uppercase tracking-[0.2em] text-primary-600">
            {study.category || 'Campaign'}
          </span>
          {study.score && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
              {study.score}/10
            </span>
          )}
        </div>
        <h3 className="mt-4 text-lg font-semibold text-ink-900 group-hover:text-primary-600">
          {study.title}
        </h3>
        {study.summary && <p className="mt-2 text-sm text-ink-600 line-clamp-2">{study.summary}</p>}
      </div>
    </Link>
  )
})
