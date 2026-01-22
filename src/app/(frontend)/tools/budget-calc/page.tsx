import type { Metadata } from 'next'
import { JsonLd } from '@/components'
import dynamic from 'next/dynamic'

const BudgetCalcClient = dynamic(() => import('./BudgetCalcClient'), {
  loading: () => (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
    </div>
  ),
  ssr: true,
})

export const metadata: Metadata = {
  title: 'Campaign Budget Calculator | CampaignSites.net',
  description: 'Estimate clicks, conversions, and CPA using real industry benchmarks. Plan your paid media budget with accurate forecasting.',
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
}

export default function BudgetCalcPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <BudgetCalcClient />
    </>
  )
}
