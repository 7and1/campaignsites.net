import type { Metadata } from 'next'
import { JsonLd } from '@/components'
import BudgetCalcClient from './BudgetCalcClient'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const popularUseCases = [
  { title: 'E-commerce', href: '/tools/budget-calc/for-ecommerce', description: 'ROAS and profit margin planning' },
  { title: 'SaaS', href: '/tools/budget-calc/for-saas', description: 'CAC and LTV optimization' },
  { title: 'Local Business', href: '/tools/budget-calc/for-local-business', description: 'Geo-targeted campaign budgets' },
  { title: 'Startups', href: '/tools/budget-calc/for-startups', description: 'Runway-aware growth planning' },
  { title: 'Agencies', href: '/tools/budget-calc/for-agencies', description: 'Client budget allocation' },
  { title: 'B2B', href: '/tools/budget-calc/for-b2b', description: 'Pipeline-based forecasting' },
  { title: 'Lead Generation', href: '/tools/budget-calc/for-lead-generation', description: 'Cost per lead optimization' },
  { title: 'Brand Awareness', href: '/tools/budget-calc/for-brand-awareness', description: 'Reach and frequency planning' },
]

export const metadata: Metadata = {
  title: 'Campaign Budget Calculator | CampaignSites.net',
  description: 'Estimate clicks, conversions, and CPA using real industry benchmarks. Plan your paid media budget with accurate forecasting. Calculate ROI and optimize your ad spend across channels with data-driven insights.',
  keywords: ['budget calculator', 'campaign calculator', 'CPA calculator', 'ad spend calculator', 'marketing budget', 'paid media forecasting'],
  openGraph: {
    title: 'Campaign Budget Calculator | CampaignSites.net',
    description: 'Estimate clicks, conversions, and CPA using real industry benchmarks. Plan your paid media budget with accurate forecasting.',
    url: 'https://campaignsites.net/tools/budget-calc',
    type: 'website',
    images: [
      {
        url: '/og?title=Budget%20Calculator&subtitle=Forecast%20conversions%20and%20CPA',
        width: 1200,
        height: 630,
        alt: 'Campaign Budget Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Campaign Budget Calculator | CampaignSites.net',
    description: 'Estimate clicks, conversions, and CPA using real industry benchmarks.',
    images: ['/og?title=Budget%20Calculator&subtitle=Forecast%20conversions%20and%20CPA'],
  },
  alternates: {
    canonical: 'https://campaignsites.net/tools/budget-calc',
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Campaign Budget Calculator',
      description: 'Estimate clicks, conversions, and CPA using real industry benchmarks. Plan your paid media budget with accurate forecasting.',
      url: 'https://campaignsites.net/tools/budget-calc',
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
        'Budget forecasting',
        'CPA estimation',
        'Industry benchmarks',
        'Channel comparison',
        'ROI projections',
        'Scenario planning',
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Calculate Your Campaign Budget and Forecast Results',
      description: 'Step-by-step guide to planning your paid media budget with accurate conversion and CPA forecasting.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Select Your Industry',
          text: 'Choose your industry from the dropdown to load relevant benchmark data for CPC, CTR, and conversion rates. This ensures your forecasts are based on realistic expectations for your market.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Enter Your Monthly Budget',
          text: 'Input the total amount you plan to spend on your campaign. Use the slider to quickly adjust and see how different budget levels impact your expected results.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Review Industry Benchmarks',
          text: 'Check the benchmark data displayed below the inputs. This shows average CPC, CTR, and conversion rates for your selected industry, giving you context for the estimates.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Customize with Your Data (Optional)',
          text: 'If you have historical data, override the benchmark CPC and conversion rate with your actual numbers for more accurate forecasting specific to your campaigns.',
        },
        {
          '@type': 'HowToStep',
          position: 5,
          name: 'Analyze Your Results',
          text: 'Review the estimated clicks, conversions, CPA, and impressions. Use these numbers to evaluate if your budget aligns with your goals, and adjust accordingly before launching.',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How accurate are campaign budget calculators?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Budget calculators provide estimates based on industry benchmarks, typically accurate within 20-30% for established markets. Your actual results depend on factors like ad quality, landing page conversion rate, targeting precision, and competitive landscape. Use calculators for planning, then refine with real campaign data.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is a good cost per acquisition (CPA) for my industry?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Good CPA varies by industry and customer lifetime value. E-commerce typically sees $10-50 CPA, B2B SaaS ranges from $100-500, and professional services can justify $500-2000+ CPA. The key metric is whether your CPA is lower than your customer lifetime value with enough margin for profitability.',
          },
        },
        {
          '@type': 'Question',
          name: 'How much should I budget for my first campaign?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Start with enough budget to generate at least 100 conversions for statistical significance. If your estimated CPA is $50, budget at least $5,000. For expensive products with high CPA, aim for 30-50 conversions minimum. This gives you reliable data to optimize before scaling spend.',
          },
        },
        {
          '@type': 'Question',
          name: 'Should I split my budget across multiple channels or focus on one?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Start with one channel until you achieve consistent profitability, then expand. Splitting budget too early prevents you from gathering enough data to optimize effectively. Once you master one channel and hit diminishing returns, diversify to reach new audiences and reduce platform risk.',
          },
        },
        {
          '@type': 'Question',
          name: 'How often should I adjust my campaign budget?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Review performance weekly and make budget adjustments bi-weekly or monthly. Avoid daily changes as they prevent algorithms from learning and stabilizing. Increase budget by 20-30% at a time for winning campaigns, and pause or reduce spend on campaigns with CPA above your target for 2+ weeks.',
          },
        },
      ],
    },
  ],
}

export default function BudgetCalcPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <BudgetCalcClient />

      <section className="border-t border-mist-200 bg-mist-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-bold text-ink-900">Popular Use Cases</h2>
          <p className="mt-2 text-ink-600">
            Explore budget calculators tailored for specific industries and business models.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
    </>
  )
}
