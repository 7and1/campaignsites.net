import type { Metadata } from 'next'
import { JsonLd } from '@/components'
import dynamic from 'next/dynamic'

const CountdownClient = dynamic(() => import('./CountdownClient'), {
  loading: () => (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
    </div>
  ),
  ssr: true,
})

export const metadata: Metadata = {
  title: 'Countdown Timer Generator | CampaignSites.net',
  description: 'Create embed-ready countdown timers with custom colors, animations, and timezone support. Perfect for product launches, flash sales, and event campaigns.',
  keywords: ['countdown timer', 'launch timer', 'urgency timer', 'campaign countdown', 'embed timer'],
  openGraph: {
    title: 'Countdown Timer Generator | CampaignSites.net',
    description: 'Create embed-ready countdown timers with custom colors, animations, and timezone support.',
    url: 'https://campaignsites.net/tools/countdown',
    type: 'website',
    images: [
      {
        url: '/og?title=Countdown%20Timer%20Generator&subtitle=Create%20urgency%20for%20your%20campaigns',
        width: 1200,
        height: 630,
        alt: 'Countdown Timer Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Countdown Timer Generator | CampaignSites.net',
    description: 'Create embed-ready countdown timers with custom colors, animations, and timezone support.',
    images: ['/og?title=Countdown%20Timer%20Generator&subtitle=Create%20urgency%20for%20your%20campaigns'],
  },
  alternates: {
    canonical: 'https://campaignsites.net/tools/countdown',
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Countdown Timer Generator',
  description: 'Create embed-ready countdown timers with custom colors, animations, and timezone support. Perfect for product launches, flash sales, and event campaigns.',
  url: 'https://campaignsites.net/tools/countdown',
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
    'Customizable countdown timers',
    'Multiple color themes',
    'Embed code generator',
    'Timezone support',
    'Animated transitions',
    'Responsive design',
  ],
}

export default function CountdownPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <CountdownClient />
    </>
  )
}
