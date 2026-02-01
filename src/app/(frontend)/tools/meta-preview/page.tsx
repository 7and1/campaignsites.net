import type { Metadata } from 'next'
import { JsonLd } from '@/components'
import MetaPreviewClient from './MetaPreviewClient'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const popularUseCases = [
  { title: 'Blog Posts', href: '/tools/meta-preview/for-blog-posts', description: 'Optimize content for search and social' },
  { title: 'Landing Pages', href: '/tools/meta-preview/for-landing-pages', description: 'Preview paid traffic pages' },
  { title: 'E-commerce', href: '/tools/meta-preview/for-ecommerce', description: 'Product page social previews' },
  { title: 'Social Sharing', href: '/tools/meta-preview/for-social-sharing', description: 'Multi-platform optimization' },
  { title: 'News Articles', href: '/tools/meta-preview/for-news-articles', description: 'Google News and aggregators' },
  { title: 'Portfolios', href: '/tools/meta-preview/for-portfolios', description: 'Showcase work and case studies' },
]

export const metadata: Metadata = {
  title: 'Meta Tag Preview | CampaignSites.net',
  description: 'Preview how your content appears on Google Search, Facebook, Twitter/X, and LinkedIn. Optimize titles, descriptions, and images for maximum engagement and click-through rates. Test your meta tags before publishing.',
  keywords: ['meta tag preview', 'social preview', 'og tag generator', 'open graph', 'twitter card', 'seo preview'],
  openGraph: {
    title: 'Meta Tag Preview | CampaignSites.net',
    description: 'Preview how your content appears on Google Search, Facebook, Twitter/X, and LinkedIn.',
    url: 'https://campaignsites.net/tools/meta-preview',
    type: 'website',
    images: [
      {
        url: '/og?title=Meta%20Tag%20Preview&subtitle=Optimize%20your%20social%20shares',
        width: 1200,
        height: 630,
        alt: 'Meta Tag Preview Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meta Tag Preview | CampaignSites.net',
    description: 'Preview how your content appears on Google Search, Facebook, Twitter/X, and LinkedIn.',
    images: ['/og?title=Meta%20Tag%20Preview&subtitle=Optimize%20your%20social%20shares'],
  },
  alternates: {
    canonical: 'https://campaignsites.net/tools/meta-preview',
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Meta Tag Preview',
      description: 'Preview how your content appears on Google Search, Facebook, Twitter/X, and LinkedIn. Optimize titles, descriptions, and images for maximum engagement.',
      url: 'https://campaignsites.net/tools/meta-preview',
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
        'Google SERP preview',
        'Facebook Open Graph preview',
        'Twitter/X Card preview',
        'LinkedIn preview',
        'Character count warnings',
        'Meta tag generator',
        'Export preview images',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What are Open Graph meta tags?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Open Graph meta tags control how your content appears when shared on social media platforms like Facebook, LinkedIn, and Twitter. They specify the title, description, image, and other details that show up in social previews. Without proper OG tags, platforms use default content that may not represent your page well.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the ideal length for meta descriptions?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Meta descriptions should be 150-160 characters for optimal display in Google search results. Descriptions longer than 160 characters get truncated with an ellipsis. Make sure your key message and call-to-action appear within the first 150 characters.',
          },
        },
        {
          '@type': 'Question',
          name: 'What image size should I use for social media previews?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Use 1200x630 pixels for Facebook and LinkedIn Open Graph images. Twitter recommends 1200x675 pixels for summary cards with large images. These dimensions ensure your images display properly without cropping across all major platforms.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do meta tags affect SEO rankings?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Meta descriptions do not directly impact search rankings, but they significantly affect click-through rates. A compelling meta description can increase clicks by 30% or more, which indirectly improves rankings through higher engagement signals. Title tags do directly influence SEO.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I test if my meta tags are working correctly?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Use our Meta Tag Preview tool to see how your tags render before publishing. After publishing, test with Facebook Sharing Debugger, Twitter Card Validator, and LinkedIn Post Inspector. These tools show exactly how your content appears and identify any issues with your meta tags.',
          },
        },
      ],
    },
  ],
}

export default function MetaPreviewPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <MetaPreviewClient />

      <section className="border-t border-mist-200 bg-mist-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-bold text-ink-900">Popular Use Cases</h2>
          <p className="mt-2 text-ink-600">
            Explore meta tag preview tools optimized for specific content types and platforms.
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
    </>
  )
}
