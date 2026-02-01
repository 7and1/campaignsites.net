import type { Metadata } from 'next'
import { AiLabClient, JsonLd, ToolUsageTracker } from '@/components'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const popularUseCases = [
  { title: 'Campaign Naming', href: '/tools/ai-lab/for-campaign-naming', description: 'Generate creative campaign names' },
  { title: 'Landing Page Analysis', href: '/tools/ai-lab/for-landing-page-analysis', description: 'Get AI-powered page critiques' },
  { title: 'A/B Testing', href: '/tools/ai-lab/for-ab-testing', description: 'Generate high-impact test ideas' },
  { title: 'Conversion Optimization', href: '/tools/ai-lab/for-conversion-optimization', description: 'Reduce friction and boost conversions' },
  { title: 'Content Strategy', href: '/tools/ai-lab/for-content-strategy', description: 'Plan data-driven content calendars' },
  { title: 'Marketing Automation', href: '/tools/ai-lab/for-marketing-automation', description: 'Design workflow strategies' },
]

export const metadata: Metadata = {
  title: 'AI Campaign Lab | CampaignSites.net',
  description: 'Generate campaign names, analyze landing page structure, and create A/B test ideas with AI-powered tools. Get instant insights to optimize your marketing campaigns and improve conversion rates with artificial intelligence.',
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
  '@graph': [
    {
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
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How does AI help with campaign naming?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'AI analyzes patterns from thousands of successful campaigns to generate memorable, descriptive names that align with your brand and goals. It considers factors like target audience, campaign type, and industry conventions to suggest names that are both creative and strategically sound.',
          },
        },
        {
          '@type': 'Question',
          name: 'What does the landing page analyzer check for?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The AI analyzer evaluates your landing page structure, headline effectiveness, CTA placement, social proof usage, form length, and mobile optimization. It compares your page against conversion best practices and provides specific recommendations to improve performance.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I prioritize which A/B tests to run first?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Start with high-impact, low-effort tests like headlines, CTAs, and hero images. These elements typically drive the biggest conversion lifts. Avoid testing minor details like button colors until you have optimized the fundamentals. Our AI prioritizes test ideas based on potential impact.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can AI replace human copywriters for campaigns?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'AI is a powerful tool for generating ideas and first drafts, but human creativity, brand understanding, and strategic thinking remain essential. Use AI to overcome writer\'s block, generate variants for testing, and speed up your workflow, but always review and refine the output.',
          },
        },
        {
          '@type': 'Question',
          name: 'How accurate are AI-generated campaign insights?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'AI insights are based on patterns from successful campaigns and conversion best practices, making them directionally accurate 70-80% of the time. However, every audience is unique. Always validate AI recommendations with real A/B tests on your specific traffic before making major decisions.',
          },
        },
      ],
    },
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

      <section className="border-t border-mist-200 bg-mist-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-bold text-ink-900">Popular Use Cases</h2>
          <p className="mt-2 text-ink-600">
            Explore AI-powered tools for specific marketing workflows and optimization tasks.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularUseCases.map((useCase) => (
              <Link
                key={useCase.href}
                href={useCase.href}
                className="group rounded-lg border border-mist-200 bg-white p-4 transition hover:border-primary-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-ink-900 group-hover:text-primary-600">
                    {useCase.title}
                  </h3>
                  <ArrowRight className="h-4 w-4 text-ink-400 transition group-hover:translate-x-1 group-hover:text-primary-600" />
                </div>
                <p className="mt-1 text-sm text-ink-600">{useCase.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
