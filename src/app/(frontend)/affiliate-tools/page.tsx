import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { JsonLd, ToolComparisonTable, AffiliateCTA } from '@/components'
import { Star, ExternalLink, Filter } from 'lucide-react'
import Link from 'next/link'
import type { Tool } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Affiliate Tools Directory | CampaignSites.net',
  description: 'Discover the best marketing tools we recommend. Compare landing page builders, email platforms, analytics tools, and more.',
  keywords: ['marketing tools', 'landing page builders', 'email marketing tools', 'analytics tools', 'affiliate recommendations'],
  openGraph: {
    title: 'Affiliate Tools Directory | CampaignSites.net',
    description: 'Discover the best marketing tools we recommend for building high-converting campaigns.',
    url: 'https://campaignsites.net/affiliate-tools',
    type: 'website',
  },
  alternates: {
    canonical: 'https://campaignsites.net/affiliate-tools',
  },
}

const categories = [
  { id: 'all', label: 'All Tools' },
  { id: 'Landing Page Builder', label: 'Landing Pages' },
  { id: 'Email Marketing', label: 'Email' },
  { id: 'Analytics', label: 'Analytics' },
  { id: 'A/B Testing', label: 'A/B Testing' },
  { id: 'CRM', label: 'CRM' },
]

async function getTools(): Promise<Tool[]> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'tools',
      limit: 100,
      sort: '-rating',
    })
    return (result.docs as Tool[]) || []
  } catch {
    return []
  }
}

export default async function AffiliateToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const tools = await getTools()
  const selectedCategory = params.category || 'all'

  const filteredTools =
    selectedCategory === 'all'
      ? tools
      : tools.filter((tool) => tool.category === selectedCategory)

  const featuredTools = tools.filter((tool) => (tool.rating || 0) >= 4.5).slice(0, 3)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Marketing Tools Directory',
    description: 'Curated marketing tools for campaign optimization',
    itemListElement: tools.map((tool, index) => ({
      '@type': 'SoftwareApplication',
      position: index + 1,
      name: tool.name,
      description: tool.description,
      url: `https://campaignsites.net/affiliate-tools#${tool.slug}`,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      aggregateRating: tool.rating
        ? {
            '@type': 'AggregateRating',
            ratingValue: tool.rating,
            bestRating: 5,
          }
        : undefined,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    })),
  }

  return (
    <>
      <JsonLd data={structuredData} />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary-50 to-white py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold text-ink-900 md:text-5xl">
                Tools We Recommend
              </h1>
              <p className="mt-4 text-lg text-ink-600">
                Discover the marketing tools we use and recommend for building high-converting campaigns.
                Every tool is vetted by our team.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Tools */}
        {featuredTools.length > 0 && (
          <section className="py-12">
            <div className="mx-auto max-w-6xl px-6">
              <h2 className="text-xl font-semibold text-ink-900">Featured Recommendations</h2>
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                {featuredTools.map((tool) => (
                  <FeaturedToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Comparison Table */}
        <section className="py-12">
          <div className="mx-auto max-w-6xl px-6">
            <ToolComparisonTable
              tools={filteredTools}
              title="Compare Marketing Tools"
              context="affiliate-directory"
            />
          </div>
        </section>

        {/* Filter & Grid */}
        <section className="py-12">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-wrap items-center gap-3">
              <Filter className="h-5 w-5 text-ink-400" />
              <span className="text-sm font-medium text-ink-500">Filter by category:</span>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/affiliate-tools?category=${cat.id}`}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    selectedCategory === cat.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-ink-700 hover:bg-mist-100'
                  }`}
                >
                  {cat.label}
                </Link>
              ))}
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>

            {filteredTools.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-ink-500">No tools found in this category.</p>
                <Link
                  href="/affiliate-tools"
                  className="mt-4 inline-block text-primary-600 hover:underline"
                >
                  View all tools
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Disclosure */}
        <section className="border-t border-mist-200 py-12">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <p className="text-sm text-ink-500">
              <strong>Affiliate Disclosure:</strong> Some links on this page are affiliate links.
              We may earn a commission if you make a purchase, at no additional cost to you.
              We only recommend tools we have personally used and believe will add value to your marketing.
            </p>
          </div>
        </section>
      </main>
    </>
  )
}

function FeaturedToolCard({ tool }: { tool: Tool }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 to-white p-6 shadow-sm">
      <div className="absolute right-4 top-4">
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
          <Star className="h-3.5 w-3.5 fill-current" />
          {tool.rating}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-ink-900">{tool.name}</h3>
      <p className="mt-2 text-sm text-ink-600">{tool.description}</p>

      {tool.pricing && (
        <p className="mt-3 text-sm font-medium text-ink-500">{tool.pricing}</p>
      )}

      <AffiliateCTA
        href={tool.affiliateUrl || '#'}
        toolSlug={tool.slug}
        context="featured-card"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
      >
        Try {tool.name}
        <ExternalLink className="h-4 w-4" />
      </AffiliateCTA>
    </div>
  )
}

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <div className="group rounded-2xl border border-white/70 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-ink-900 group-hover:text-primary-600">
            {tool.name}
          </h3>
          {tool.category && (
            <span className="mt-1 inline-block rounded-full bg-mist-100 px-2.5 py-0.5 text-xs font-medium text-ink-600">
              {tool.category}
            </span>
          )}
        </div>
        {tool.rating && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-1 text-xs font-semibold text-primary-600">
            <Star className="h-3.5 w-3.5 fill-current" />
            {tool.rating}
          </span>
        )}
      </div>

      <p className="mt-3 text-sm text-ink-600">{tool.description}</p>

      <div className="mt-4 flex items-center justify-between">
        {tool.pricing ? (
          <span className="text-sm text-ink-500">{tool.pricing}</span>
        ) : (
          <span />
        )}
        <AffiliateCTA
          href={tool.affiliateUrl || '#'}
          toolSlug={tool.slug}
          context="tool-card"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 transition hover:text-primary-700"
        >
          Learn more
          <ExternalLink className="h-4 w-4" />
        </AffiliateCTA>
      </div>
    </div>
  )
}
