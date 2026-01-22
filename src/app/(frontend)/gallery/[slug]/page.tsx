import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, ExternalLink, Lightbulb, Star } from 'lucide-react'
import { AffiliateCTA, CaseStudyCard, JsonLd, ShareBar, UpvoteButton } from '@/components'
import { renderLexicalHtml } from '@/lib/richtext'
import type { CaseStudy, Tool } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'case-studies',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })

  const study = docs[0] as CaseStudy | undefined
  if (!study) return {}

  const title = study.metaTitle || study.title
  const description =
    study.metaDescription || study.summary || 'Campaign landing page case study.'
  const imageUrl =
    typeof study.heroImage === 'string'
      ? study.heroImage
      : typeof study.heroImage === 'object' && study.heroImage?.url
        ? study.heroImage.url
        : undefined

  const ogImage = imageUrl
    ? imageUrl
    : `/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent('Campaign case study')}`

  return {
    title,
    description,
    alternates: {
      canonical: `/gallery/${study.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'case-studies',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })

  const study = docs[0] as CaseStudy
  if (!study) notFound()

  const analysisHtml = renderLexicalHtml(study.analysis)

  // Fetch related case studies by category
  const related = await payload.find({
    collection: 'case-studies',
    limit: 3,
    sort: '-score',
    depth: 1,
    where: {
      and: [
        { slug: { not_equals: study.slug } },
        ...(study.category ? [{ category: { equals: study.category } }] : []),
      ],
    },
  })

  const heroImageUrl =
    typeof study.heroImage === 'string'
      ? study.heroImage
      : typeof study.heroImage === 'object' && study.heroImage?.url
        ? study.heroImage.url
        : undefined

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CreativeWork',
        '@id': `https://campaignsites.net/gallery/${study.slug}#casestudy`,
        name: study.title,
        description: study.summary,
        url: `https://campaignsites.net/gallery/${study.slug}`,
        image: heroImageUrl || `https://campaignsites.net/og?title=${encodeURIComponent(study.title)}`,
        author: {
          '@type': 'Organization',
          '@id': 'https://campaignsites.net/#organization',
          name: 'CampaignSites.net',
        },
        publisher: {
          '@type': 'Organization',
          '@id': 'https://campaignsites.net/#organization',
          name: 'CampaignSites.net',
          logo: {
            '@type': 'ImageObject',
            url: 'https://campaignsites.net/og?title=CampaignSites.net',
          },
        },
        inLanguage: 'en-US',
        about: study.category,
        ...(study.brand && { brand: { '@type': 'Brand', name: study.brand } }),
        ...(study.score && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: study.score,
            bestRating: '10',
            worstRating: '1',
            ratingCount: '1',
            name: 'Campaign Quality Score',
          },
        }),
        ...(study.conversionRate && {
          metrics: [
            {
              '@type': 'PropertyValue',
              name: 'Conversion Rate',
              value: study.conversionRate,
            },
          ],
        }),
      },
      {
        '@type': 'Review',
        itemReviewed: {
          '@type': 'Campaign',
          name: study.title,
          ...(study.brand && { brand: study.brand }),
        },
        reviewRating: study.score
          ? {
              '@type': 'Rating',
              ratingValue: study.score,
              bestRating: '10',
              worstRating: '1',
            }
          : undefined,
        author: {
          '@type': 'Organization',
          name: 'CampaignSites.net',
        },
        reviewBody: study.summary,
        publisher: {
          '@type': 'Organization',
          name: 'CampaignSites.net',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://campaignsites.net',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Gallery',
            item: 'https://campaignsites.net/gallery',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: study.title,
            item: `https://campaignsites.net/gallery/${study.slug}`,
          },
        ],
      },
    ].filter((item) => item !== undefined),
  }

  return (
    <main className="min-h-screen">
      <JsonLd data={structuredData} />

      <div className="border-b border-white/70 bg-white/80">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <Link href="/gallery" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-500 hover:text-primary-600">
            <ArrowLeft className="h-4 w-4" /> Back to Gallery
          </Link>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          <article>
            <div className="flex flex-wrap items-center gap-3">
              {study.category && (
                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">
                  {study.category}
                </span>
              )}
              {study.score && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <Star className="h-3 w-3 fill-current" /> {study.score}/10
                </span>
              )}
            </div>
            <h1 className="mt-4 text-4xl font-semibold text-ink-900 sm:text-5xl">{study.title}</h1>
            {study.brand && <p className="mt-2 text-lg text-ink-600">by {study.brand}</p>}

            {study.heroImage && (
              <div className="mt-8 overflow-hidden rounded-2xl border border-white/70 bg-white/70">
                <div className="relative aspect-[16/9]">
                  <Image
                    src={typeof study.heroImage === 'string' ? study.heroImage : typeof study.heroImage === 'object' && study.heroImage.url ? study.heroImage.url : ''}
                    alt={study.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {study.summary && (
              <div className="mt-8 rounded-2xl border border-primary-100 bg-primary-50 px-6 py-5">
                <h2 className="text-lg font-semibold text-primary-900">Quick summary</h2>
                <p className="mt-2 text-primary-800">{study.summary}</p>
              </div>
            )}

            {(study.conversionRate || study.budget || study.duration) && (
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {study.conversionRate && (
                  <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Conversion rate</p>
                    <p className="mt-2 text-2xl font-semibold text-ink-900">{study.conversionRate}</p>
                  </div>
                )}
                {study.budget && (
                  <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Est. budget</p>
                    <p className="mt-2 text-2xl font-semibold text-ink-900">{study.budget}</p>
                  </div>
                )}
                {study.duration && (
                  <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Duration</p>
                    <p className="mt-2 text-2xl font-semibold text-ink-900">{study.duration}</p>
                  </div>
                )}
              </div>
            )}

            {study.highlights && study.highlights.length > 0 && (
              <div className="mt-10">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-ink-900">
                  <Lightbulb className="h-6 w-6 text-amber-500" />
                  Key highlights
                </h2>
                <ul className="mt-4 space-y-3">
                  {study.highlights.map((h: { point?: string | null }, index: number) => (
                    <li key={index} className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                        {index + 1}
                      </span>
                      <span className="text-sm text-ink-700">{h.point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysisHtml && (
              <div
                className="prose prose-slate mt-10 max-w-none text-ink-700 prose-headings:text-ink-900"
                dangerouslySetInnerHTML={{ __html: analysisHtml }}
              />
            )}

            {study.platform && study.platform.length > 0 && (
              <div className="mt-10">
                <h2 className="text-2xl font-semibold text-ink-900">Platforms used</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {study.platform.map((platform: string) => (
                    <span key={platform} className="rounded-full border border-ink-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {study.externalUrl && (
              <div className="mt-10">
                <a
                  href={study.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-ink-800"
                >
                  View campaign <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}

            <div className="mt-10">
              <ShareBar title={study.title} />
            </div>
            <div className="mt-6">
              <UpvoteButton contentType="case-study" slug={study.slug} />
            </div>
          </article>

          <aside className="space-y-6">
            {study.affiliateTools && study.affiliateTools.length > 0 && (
              <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Tools used</p>
                <div className="mt-4 space-y-3">
                  {study.affiliateTools
                    .filter((t: Tool | string): t is Tool => typeof t === 'object')
                    .map((tool: Tool) => (
                    <div key={tool.id || tool.slug} className="rounded-xl border border-mist-200 bg-white p-4">
                      <p className="font-semibold text-ink-900">{tool.name}</p>
                      {tool.category && <p className="text-xs text-ink-500">{tool.category}</p>}
                      <AffiliateCTA
                        href={tool.affiliateUrl || undefined}
                        toolSlug={tool.slug}
                        context="case-study-sidebar"
                        className="mt-3 inline-flex items-center rounded-full bg-primary-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-primary-700"
                      >
                        Try {tool.name}
                      </AffiliateCTA>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-[11px] text-ink-500">
                  Contains affiliate links. We may earn a commission at no extra cost to you.
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>

      {related.docs.length > 0 && (
        <section className="border-t border-white/70 bg-mist-50/50 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-2xl font-semibold text-ink-900">Related case studies</h2>
            <p className="mt-2 text-ink-600">
              Explore more {study.category ? study.category.toLowerCase() : 'campaign'} examples
            </p>
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {(related.docs as CaseStudy[]).map((item) => (
                <CaseStudyCard key={item.id || item.slug} study={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
