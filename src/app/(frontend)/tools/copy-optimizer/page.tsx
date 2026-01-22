import type { Metadata } from 'next'
import { JsonLd } from '@/components'
import dynamic from 'next/dynamic'

const CopyOptimizerClient = dynamic(() => import('./CopyOptimizerClient'), {
  loading: () => (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
    </div>
  ),
  ssr: true,
})

export const metadata: Metadata = {
  title: 'AI Copy Optimizer | CampaignSites.net',
  description: 'Score headlines and CTAs, generate AI-powered variants, and get actionable suggestions to improve your conversion copy.',
  keywords: ['copy optimizer', 'headline analyzer', 'cta optimizer', 'copywriting tool', 'ai copywriting', 'conversion copy'],
  openGraph: {
    title: 'AI Copy Optimizer | CampaignSites.net',
    description: 'Score headlines and CTAs, generate AI-powered variants, and get actionable suggestions to improve your conversion copy.',
    url: 'https://campaignsites.net/tools/copy-optimizer',
    type: 'website',
    images: [
      {
        url: '/og?title=AI%20Copy%20Optimizer&subtitle=Score%20and%20improve%20your%20copy',
        width: 1200,
        height: 630,
        alt: 'AI Copy Optimizer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Copy Optimizer | CampaignSites.net',
    description: 'Score headlines and CTAs, generate AI-powered variants, and get actionable suggestions.',
    images: ['/og?title=AI%20Copy%20Optimizer&subtitle=Score%20and%20improve%20your%20copy'],
  },
  alternates: {
    canonical: 'https://campaignsites.net/tools/copy-optimizer',
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AI Copy Optimizer',
  description: 'Score headlines and CTAs, generate AI-powered variants, and get actionable suggestions to improve your conversion copy.',
  url: 'https://campaignsites.net/tools/copy-optimizer',
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
    'Headline scoring',
    'CTA analysis',
    'AI-powered variants',
    'Readability assessment',
    'Emotional impact analysis',
    'A/B test suggestions',
  ],
}

export default function CopyOptimizerPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <CopyOptimizerClient />
    </>
  )
}
