import Link from 'next/link'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { JsonLd, Pagination, PostCard, SectionHeading } from '@/components'
import type { Post } from '@/lib/types'

export const dynamic = 'force-dynamic'

const POSTS_PER_PAGE = 12

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const params = await searchParams
  const page = Number(params?.page) || 1
  const category = params?.category

  const title = page > 1
    ? `Campaign Guides & Resources - Page ${page} | CampaignSites.net`
    : 'Campaign Guides & Resources | CampaignSites.net'

  const description = 'Campaign playbooks, benchmarks, and teardown guides for growth teams. Learn conversion optimization tactics from real campaigns. Discover proven strategies to boost your landing page performance today.'

  const canonical = category
    ? `https://campaignsites.net/blog?category=${encodeURIComponent(category)}${page > 1 ? `&page=${page}` : ''}`
    : `https://campaignsites.net/blog${page > 1 ? `?page=${page}` : ''}`

  return {
    title,
    description,
    keywords: ['campaign guides', 'marketing playbooks', 'conversion optimization', 'landing page tips'],
    openGraph: {
      title,
      description: 'Campaign playbooks, benchmarks, and teardown guides for growth teams.',
      url: canonical,
      type: 'website',
      images: [
        {
          url: '/og?title=Campaign%20Guides&subtitle=Playbooks%20for%20growth%20teams',
          width: 1200,
          height: 630,
          alt: 'Campaign Guides',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: 'Campaign playbooks, benchmarks, and teardown guides for growth teams.',
      images: ['/og?title=Campaign%20Guides&subtitle=Playbooks%20for%20growth%20teams'],
    },
    alternates: {
      canonical,
    },
  }
}

interface BlogPageProps {
  searchParams?: Promise<{ category?: string; page?: string }>
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const payload = await getPayload({ config })
  const params = await searchParams
  const category = params?.category
  const page = Number(params?.page) || 1

  const { docs, totalDocs } = await payload.find({
    collection: 'posts',
    limit: POSTS_PER_PAGE,
    page,
    sort: '-publishedDate',
    depth: 1,
    where: category ? { category: { equals: category } } : undefined,
  })
  const posts = docs as Post[]
  const totalPages = Math.ceil(totalDocs / POSTS_PER_PAGE)

  const categories = Array.from(
    new Set(posts.map((post) => post.category).filter(Boolean))
  ) as string[]

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'CampaignSites Blog',
    url: 'https://campaignsites.net/blog',
    description: 'Playbooks, tools, and campaign teardown guides for growth teams.',
  }

  return (
    <main className="min-h-screen">
      <JsonLd data={structuredData} />

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            kicker="Campaign playbooks"
            title="Guides built for teams shipping fast"
            description="Tactical breakdowns, benchmarks, and reusable templates for high-performing campaigns."
          />
          {categories.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/blog"
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
                  href={`/blog?category=${encodeURIComponent(cat)}`}
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
          {posts.length === 0 ? (
            <div className="glass-panel p-10 text-center text-sm text-ink-600">
              No posts yet. Check back soon.
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {posts.map((post) => (
                  <PostCard key={post.id || post.slug} post={post} />
                ))}
              </div>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                basePath="/blog"
                searchParams={category ? { category } : {}}
              />
            </>
          )}
        </div>
      </section>
    </main>
  )
}
