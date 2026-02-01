import type { Metadata } from 'next'
import { JsonLd } from '@/components'
import CopyOptimizerClient from './CopyOptimizerClient'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const popularUseCases = [
  { title: 'Headlines', href: '/tools/copy-optimizer/for-headlines', description: 'Analyze and score headlines' },
  { title: 'CTA Buttons', href: '/tools/copy-optimizer/for-ctas', description: 'Optimize call-to-action copy' },
  { title: 'Email Subject Lines', href: '/tools/copy-optimizer/for-email-subject-lines', description: 'Improve open rates' },
  { title: 'Ad Copy', href: '/tools/copy-optimizer/for-ad-copy', description: 'Boost Quality Score and CTR' },
  { title: 'Landing Pages', href: '/tools/copy-optimizer/for-landing-pages', description: 'Conversion-focused copy analysis' },
  { title: 'Product Descriptions', href: '/tools/copy-optimizer/for-product-descriptions', description: 'E-commerce copy optimization' },
  { title: 'Social Media', href: '/tools/copy-optimizer/for-social-media', description: 'Platform-specific engagement' },
  { title: 'Blog Titles', href: '/tools/copy-optimizer/for-blog-titles', description: 'SEO and click-through optimization' },
]

export const metadata: Metadata = {
  title: 'AI Copy Optimizer | CampaignSites.net',
  description: 'Score headlines and CTAs, generate AI-powered variants, and get actionable suggestions to improve your conversion copy. Boost landing page performance with data-driven copywriting insights and A/B test ideas.',
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
  '@graph': [
    {
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
    },
    {
      '@type': 'HowTo',
      name: 'How to Optimize Your Headlines and CTAs for Better Conversions',
      description: 'Step-by-step guide to analyzing and improving your landing page copy using AI-powered insights.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Select Copy Type',
          text: 'Choose whether you are analyzing a headline or a CTA button. Headlines need to grab attention and create curiosity, while CTAs should be action-oriented and benefit-focused.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Enter Your Copy',
          text: 'Type or paste your current headline or CTA text into the input field. Be honest—enter what you are actually using now, not what you think sounds good.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Get Your Score',
          text: 'Click Analyze to receive an instant score from 0-100. The AI evaluates your copy against proven conversion frameworks including specificity, emotional impact, and clarity.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Review Suggestions',
          text: 'Read the specific suggestions for improvement. These might include making your claim more specific, adding urgency, or using first-person language.',
        },
        {
          '@type': 'HowToStep',
          position: 5,
          name: 'Test AI Variants',
          text: 'Use the AI-generated variants as inspiration or click to copy them directly. These alternatives are optimized based on patterns from high-performing campaigns.',
        },
        {
          '@type': 'HowToStep',
          position: 6,
          name: 'A/B Test and Iterate',
          text: 'Implement your improved copy and run A/B tests to confirm performance. Even small changes to headlines can increase conversions by 50% or more.',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What makes a good landing page headline?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Great headlines are specific, benefit-focused, and create curiosity. They speak directly to your target audience, promise a clear outcome, and use concrete numbers or timeframes when possible. Avoid vague claims like "best solution" and instead focus on the specific problem you solve.',
          },
        },
        {
          '@type': 'Question',
          name: 'How long should my landing page headline be?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Aim for 6-12 words or 50-70 characters. This length is long enough to communicate value but short enough to scan quickly. Mobile users especially need concise headlines that fit on smaller screens without truncation.',
          },
        },
        {
          '@type': 'Question',
          name: 'Should I use first-person or second-person language in CTAs?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'First-person CTAs like "Start My Free Trial" typically outperform second-person alternatives like "Start Your Free Trial" by 90% or more. First-person language creates ownership and makes the action feel more personal and immediate.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I write CTAs that convert better?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Effective CTAs are specific, action-oriented, and benefit-focused. Replace generic words like "Submit" or "Click Here" with specific outcomes like "Get My Free Guide" or "Start Saving Money Today". Include what users get and remove friction words like "buy" or "purchase".',
          },
        },
        {
          '@type': 'Question',
          name: 'How often should I test new headlines and CTAs?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Test continuously, but one element at a time. Run each A/B test until you reach statistical significance (typically 100+ conversions per variant). Once you have a winner, implement it and test the next element. Top-performing teams run 2-4 tests per month.',
          },
        },
      ],
    },
  ],
}

export default function CopyOptimizerPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <CopyOptimizerClient />

      <section className="border-t border-mist-200 bg-mist-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-bold text-ink-900">Popular Use Cases</h2>
          <p className="mt-2 text-ink-600">
            Explore copy optimization tools for specific content types and marketing channels.
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
