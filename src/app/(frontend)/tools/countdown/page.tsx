import type { Metadata } from 'next'
import { JsonLd } from '@/components'
import CountdownClient from './CountdownClient'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const popularUseCases = [
  { title: 'Black Friday', href: '/tools/countdown/for-black-friday', description: 'Holiday sale countdown timers' },
  { title: 'Product Launches', href: '/tools/countdown/for-product-launches', description: 'Build pre-launch anticipation' },
  { title: 'Webinars', href: '/tools/countdown/for-webinars', description: 'Increase event attendance' },
  { title: 'Flash Sales', href: '/tools/countdown/for-flash-sales', description: 'Create urgent buying pressure' },
  { title: 'Course Enrollment', href: '/tools/countdown/for-course-enrollment', description: 'Drive registration deadlines' },
  { title: 'Event Registration', href: '/tools/countdown/for-event-registration', description: 'Boost early-bird ticket sales' },
  { title: 'Limited Offers', href: '/tools/countdown/for-limited-offers', description: 'Authentic deadline pressure' },
  { title: 'Seasonal Sales', href: '/tools/countdown/for-seasonal-sales', description: 'Quarterly campaign timers' },
]

export const metadata: Metadata = {
  title: 'Countdown Timer Generator | CampaignSites.net',
  description: 'Create embed-ready countdown timers with custom colors, animations, and timezone support. Perfect for product launches, flash sales, and event campaigns. Generate urgency and boost conversions with professional countdown timers in minutes.',
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
  '@graph': [
    {
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
    },
    {
      '@type': 'HowTo',
      name: 'How to Add a Countdown Timer to Your Landing Page',
      description: 'Step-by-step guide to creating and embedding a countdown timer for your campaign landing page.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Set Your End Date',
          text: 'Choose the date and time when your offer expires or event starts. Be specific to create authentic urgency.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Customize the Design',
          text: 'Select background and text colors that match your brand. Use the color picker or choose from quick presets.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Add Your Title',
          text: 'Write a clear, urgency-driven title like "Sale Ends In" or "Limited Time Offer" to set expectations.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Copy the Embed Code',
          text: 'Click the Copy button to save the generated HTML and JavaScript code to your clipboard.',
        },
        {
          '@type': 'HowToStep',
          position: 5,
          name: 'Paste Into Your Page',
          text: 'Paste the embed code into your landing page HTML where you want the timer to appear. Works with any page builder.',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Do countdown timers really increase conversions?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, countdown timers can increase conversions by 8-15% when used authentically. They leverage loss aversion psychology, making visitors more likely to act before time runs out. However, fake or constantly resetting timers damage trust and hurt long-term conversion rates.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the best placement for a countdown timer on a landing page?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Place countdown timers above the fold near your main call-to-action for maximum impact. For long-form pages, consider adding a sticky timer that follows users as they scroll. Test different positions to see what works best for your specific audience and offer.',
          },
        },
        {
          '@type': 'Question',
          name: 'Should countdown timers show days, hours, minutes, or seconds?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Show the time units that create appropriate urgency for your offer. For sales ending in days, show days and hours. For flash sales or webinar starts within 24 hours, show hours, minutes, and seconds. Avoid showing seconds for events days away as it can feel manipulative.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I make my countdown timer work across different timezones?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Set your countdown to a specific date and time in UTC, then let the timer automatically convert to each visitor\'s local timezone using JavaScript. This ensures everyone sees accurate time remaining regardless of their location. Our countdown generator handles timezone conversion automatically.',
          },
        },
        {
          '@type': 'Question',
          name: 'What happens when the countdown timer reaches zero?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'When the timer hits zero, you should either redirect visitors to a different page, hide the CTA button, or display an "offer expired" message. Never let the timer reset or continue into negative numbers, as this destroys credibility and trains visitors to ignore your deadlines.',
          },
        },
      ],
    },
  ],
}

export default function CountdownPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <CountdownClient />

      <section className="border-t border-mist-200 bg-mist-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-bold text-ink-900">Popular Use Cases</h2>
          <p className="mt-2 text-ink-600">
            Explore countdown timers optimized for specific campaigns and events.
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
