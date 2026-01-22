import type { Metadata } from 'next'
import { JsonLd } from '@/components'
import dynamic from 'next/dynamic'

const UTMBuilderClient = dynamic(() => import('./UTMBuilderClient'), {
  loading: () => (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
    </div>
  ),
  ssr: true,
})

export const metadata: Metadata = {
  title: 'UTM Builder | CampaignSites.net',
  description: 'Build trackable campaign URLs with UTM parameters, save presets for each channel, and validate your links. Free tool for marketing teams.',
  keywords: ['utm builder', 'utm generator', 'campaign url builder', 'tracking parameters', 'marketing analytics', 'google analytics'],
  openGraph: {
    title: 'UTM Builder | CampaignSites.net',
    description: 'Build trackable campaign URLs with UTM parameters, save presets for each channel, and validate your links.',
    url: 'https://campaignsites.net/tools/utm-builder',
    type: 'website',
    images: [
      {
        url: '/og?title=UTM%20Builder&subtitle=Track%20every%20campaign%20link',
        width: 1200,
        height: 630,
        alt: 'UTM Builder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UTM Builder | CampaignSites.net',
    description: 'Build trackable campaign URLs with UTM parameters, save presets for each channel, and validate your links.',
    images: ['/og?title=UTM%20Builder&subtitle=Track%20every%20campaign%20link'],
  },
  alternates: {
    canonical: 'https://campaignsites.net/tools/utm-builder',
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'UTM Builder',
  description: 'Build trackable campaign URLs with UTM parameters, save presets for each channel, and validate your links. Free tool for marketing teams.',
  url: 'https://campaignsites.net/tools/utm-builder',
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
    'UTM parameter builder',
    'Channel presets',
    'URL validation',
    'One-click copy',
    'QR code generation',
    'Link history',
  ],
}

export default function UTMBuilderPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <UTMBuilderClient />
    </>
  )
}
