import type { Metadata } from 'next'
import { AiLabClient, JsonLd, ToolUsageTracker } from '@/components'

export const metadata: Metadata = {
  title: 'AI Campaign Lab | CampaignSites.net',
  description: 'Generate campaign names, analyze landing page structure, and create A/B test ideas with AI-powered tools.',
  keywords: ['ai marketing tools', 'campaign name generator', 'landing page analyzer', 'ab test ideas', 'marketing ai'],
  openGraph: {
    title: 'AI Campaign Lab | CampaignSites.net',
    description: 'Generate campaign names, analyze landing page structure, and create A/B test ideas with AI.',
    url: 'https://campaignsites.net/tools/ai-lab',
    type: 'website',
    images: [
      {
        url: '/og?title=AI%20Campaign%20Lab&subtitle=AI-powered%20marketing%20tools',
        width: 1200,
        height: 630,
        alt: 'AI Campaign Lab',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Campaign Lab | CampaignSites.net',
    description: 'Generate campaign names, analyze landing pages, and create A/B test ideas with AI.',
    images: ['/og?title=AI%20Campaign%20Lab&subtitle=AI-powered%20marketing%20tools'],
  },
  alternates: {
    canonical: 'https://campaignsites.net/tools/ai-lab',
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AI Campaign Lab',
  description: 'Generate campaign names, analyze landing page structure, and create A/B test ideas with AI-powered tools.',
  url: 'https://campaignsites.net/tools/ai-lab',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  creator: {
    '@type': 'Organization',
    name: 'CampaignSites.net',
    url: 'https://campaignsites.net',
  },
  featureList: [
    'Campaign name generator',
    'Landing page analyzer',
    'A/B test idea generator',
    'Structure recommendations',
    'AI-powered insights',
  ],
}

export default function AiLabPage() {
  return (
    <main className="min-h-screen">
      <JsonLd data={structuredData} />
      <ToolUsageTracker tool="ai-lab" />

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="glass-panel p-8 md:p-10">
            <p className="section-kicker">AI lab</p>
            <h1 className="mt-3 text-3xl font-semibold text-ink-900">Campaign AI Toolkit</h1>
            <p className="mt-3 text-sm text-ink-600">
              Three AI workflows to help you name campaigns, audit landing pages, and brainstorm tests.
            </p>
            <div className="mt-10">
              <AiLabClient />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
