import Link from 'next/link'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { CaseStudyCard, JsonLd, Pagination, SectionHeading } from '@/components'
import type { CaseStudy } from '@/lib/types'

export const dynamic = 'force-dynamic'

const CASE_STUDIES_PER_PAGE = 12

export async function generateMetadata({ searchParams }: GalleryPageProps): Promise<Metadata> {
  const params = await searchParams
  const page = Number(params?.page) || 1
  const category = params?.category

  const title = page > 1
    ? `Campaign Case Studies Gallery - Page ${page} | CampaignSites.net`
    : 'Campaign Case Studies Gallery | CampaignSites.net'

  const description = 'Curated landing page case studies with conversion analysis. Real campaigns with annotated teardowns and performance metrics. Learn from winning campaigns and apply proven tactics to your next launch.'

  const canonical = category
    ? `https://campaignsites.net/gallery?category=${encodeURIComponent(category)}${page > 1 ? `&page=${page}` : ''}`
    : `https://campaignsites.net/gallery${page > 1 ? `?page=${page}` : ''}`

  return {
    title,
    description,
    keywords: ['case studies', 'landing page examples', 'campaign teardowns', 'conversion rate optimization'],
    openGraph: {
      title,
      description: 'Curated landing page case studies with conversion analysis. Real campaigns with annotated teardowns.',
      url: canonical,
      type: 'website',
      images: [
        {
          url: '/og?title=Case%20Study%20Gallery&subtitle=Real%20campaigns%20that%20convert',
          width: 1200,
          height: 630,
          alt: 'Campaign Case Studies',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: 'Curated landing page case studies with conversion analysis. Real campaigns with annotated teardowns.',
      images: ['/og?title=Case%20Study%20Gallery&subtitle=Real%20campaigns%20that%20convert'],
    },
    alternates: {
      canonical,
    },
  }
}

interface GalleryPageProps {
  searchParams?: Promise<{ category?: string; page?: string }>
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const payload = await getPayload({ config })
  const params = await searchParams
  const category = params?.category
  const page = Number(params?.page) || 1

  const { docs, totalDocs } = await payload.find({
    collection: 'case-studies',
    limit: CASE_STUDIES_PER_PAGE,
    page,
    sort: '-score',
    depth: 1,
    where: category ? { category: { equals: category } } : undefined,
  })
  const caseStudies = docs as CaseStudy[]
  const totalPages = Math.ceil(totalDocs / CASE_STUDIES_PER_PAGE)

  const categories = Array.from(
    new Set(caseStudies.map((study) => study.category).filter(Boolean))
  ) as string[]

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Campaign Case Studies',
    url: 'https://campaignsites.net/gallery',
    description: 'Curated landing page case studies with conversion-focused analysis.',
  }

  return (
    <main className="min-h-screen">
      <JsonLd data={structuredData} />

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            kicker="Case studies"
            title="Winning landing pages, annotated"
            description="Explore what worked, why it worked, and the exact tool stacks behind each campaign."
          />
          {categories.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/gallery"
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                  !category
                    ? 'border-primary-300 bg-primary-50 text-primary-600'
                    : 'border-ink-200 text-ink-500 hover:border-primary-200'
                }`}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/gallery?category=${encodeURIComponent(cat)}`}
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                    category === cat
                      ? 'border-primary-300 bg-primary-50 text-primary-600'
                      : 'border-ink-200 text-ink-500 hover:border-primary-200'
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-6">
          {caseStudies.length === 0 ? (
            <div className="glass-panel p-10 text-center text-sm text-ink-600">
              No case studies yet. Check back soon.
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {caseStudies.map((study) => (
                  <CaseStudyCard key={study.id || study.slug} study={study} />
                ))}
              </div>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                basePath="/gallery"
                searchParams={category ? { category } : {}}
              />
            </>
          )}
        </div>
      </section>
    </main>
  )
}
