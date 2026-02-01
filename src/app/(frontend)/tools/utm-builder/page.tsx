import type { Metadata } from 'next'
import { JsonLd } from '@/components'
import UTMBuilderClient from './UTMBuilderClient'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const popularUseCases = [
  { title: 'Google Ads', href: '/tools/utm-builder/for-google-ads', description: 'Track PPC campaigns and keywords' },
  { title: 'Facebook Ads', href: '/tools/utm-builder/for-facebook-ads', description: 'Monitor Meta ad performance' },
  { title: 'Email Campaigns', href: '/tools/utm-builder/for-email-campaigns', description: 'Track newsletter clicks and ROI' },
  { title: 'Influencer Marketing', href: '/tools/utm-builder/for-influencer-marketing', description: 'Measure creator partnerships' },
  { title: 'Affiliate Links', href: '/tools/utm-builder/for-affiliate-links', description: 'Track partner performance' },
  { title: 'QR Codes', href: '/tools/utm-builder/for-qr-codes', description: 'Bridge offline to online' },
  { title: 'Print Ads', href: '/tools/utm-builder/for-print-ads', description: 'Measure print advertising ROI' },
  { title: 'Events', href: '/tools/utm-builder/for-events', description: 'Track conference and trade shows' },
]

export const metadata: Metadata = {
  title: 'UTM Builder | CampaignSites.net',
  description: 'Build trackable campaign URLs with UTM parameters, save presets for each channel, and validate your links instantly. Free UTM builder for marketing teams. Track every campaign link with precision and improve your analytics today.',
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
  '@graph': [
    {
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
    },
    {
      '@type': 'HowTo',
      name: 'How to Create UTM Tracking Links for Your Campaigns',
      description: 'Step-by-step guide to building UTM-tagged URLs for accurate campaign tracking in Google Analytics.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Enter Your Landing Page URL',
          text: 'Start by entering the full URL of the page you want to track, including https://. This is where visitors will land after clicking your link.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Specify the Traffic Source',
          text: 'Enter the source where your traffic comes from, such as google, facebook, linkedin, or newsletter. Use lowercase and be consistent with naming.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Select the Marketing Medium',
          text: 'Choose the medium that describes your marketing channel: cpc for paid search, email for newsletters, social for organic posts, or display for banner ads.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Name Your Campaign',
          text: 'Create a descriptive campaign name like spring-launch-2025 or black-friday-sale. Use hyphens instead of spaces for better readability in reports.',
        },
        {
          '@type': 'HowToStep',
          position: 5,
          name: 'Add Optional Parameters',
          text: 'Optionally add utm_term for paid search keywords or utm_content to differentiate between multiple ads or links in the same campaign.',
        },
        {
          '@type': 'HowToStep',
          position: 6,
          name: 'Copy and Use Your Link',
          text: 'Click the Copy button to save your UTM-tagged URL. Use this link in your ads, emails, or social posts. The tracking data will appear in Google Analytics.',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What are UTM parameters and why do I need them?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'UTM parameters are tags added to URLs that help you track where your website traffic comes from. They tell Google Analytics which campaign, source, and medium drove each visitor. Without UTM parameters, all your traffic looks the same in reports, making it impossible to know which marketing efforts actually work.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the difference between utm_source and utm_medium?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'utm_source identifies where the traffic originates (like google, facebook, or newsletter), while utm_medium describes the marketing channel type (like cpc, email, or social). Think of source as the specific platform and medium as the category of marketing activity.',
          },
        },
        {
          '@type': 'Question',
          name: 'Should I use uppercase or lowercase in UTM parameters?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Always use lowercase for UTM parameters. Google Analytics treats "Facebook" and "facebook" as different sources, which fragments your data. Stick to lowercase letters, numbers, and hyphens for consistency across your entire team.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I track UTM links in Google Analytics?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'In Google Analytics 4, go to Reports > Acquisition > Traffic acquisition to see your UTM data. You can filter by source, medium, or campaign name. In Universal Analytics, check Acquisition > Campaigns > All Campaigns. The data appears automatically once visitors click your UTM-tagged links.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I use UTM parameters for internal links?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No, avoid using UTM parameters on internal links within your own website. They will reset the session and overwrite the original traffic source, making your analytics inaccurate. Only use UTM tags on external links that bring traffic to your site from other platforms.',
          },
        },
      ],
    },
  ],
}

export default function UTMBuilderPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <UTMBuilderClient />

      <section className="border-t border-mist-200 bg-mist-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-bold text-ink-900">Popular Use Cases</h2>
          <p className="mt-2 text-ink-600">
            Explore specialized UTM builders optimized for specific marketing channels and campaigns.
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
