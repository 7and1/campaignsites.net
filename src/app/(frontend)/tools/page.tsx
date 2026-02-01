import type { Metadata } from 'next'
import { Calculator, Sparkles, Target, Timer, Wand2, Image } from 'lucide-react'
import { JsonLd, SectionHeading, ToolCard } from '@/components'

export const metadata: Metadata = {
  title: 'Free Campaign Tools | Countdown, UTM Builder, Budget Calculator',
  description: 'Free marketing tools: countdown timer generator, UTM link builder, budget calculator, AI copy optimizer, meta tag preview, and campaign lab. No sign-up required.',
  keywords: ['campaign tools', 'marketing tools', 'countdown timer', 'utm builder', 'budget calculator', 'copy optimizer', 'meta tag preview'],
  openGraph: {
    title: 'Free Campaign Tools | CampaignSites.net',
    description: 'Free marketing tools: countdown timer generator, UTM link builder, budget calculator, AI copy optimizer, meta tag preview, and campaign lab.',
    url: 'https://campaignsites.net/tools',
    type: 'website',
    images: [
      {
        url: '/og?title=Free%20Campaign%20Tools&subtitle=6%20tools%20to%20launch%20faster',
        width: 1200,
        height: 630,
        alt: 'Campaign Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Campaign Tools | CampaignSites.net',
    description: 'Free marketing tools: countdown timer generator, UTM link builder, budget calculator, AI copy optimizer, meta tag preview, and campaign lab.',
    images: ['/og?title=Free%20Campaign%20Tools&subtitle=6%20tools%20to%20launch%20faster'],
  },
  alternates: {
    canonical: 'https://campaignsites.net/tools',
  },
}

const tools = [
  {
    name: 'Countdown Generator',
    description: 'Launch on-brand urgency timers with embed-ready code.',
    href: '/tools/countdown',
    icon: Timer,
    accent: 'bg-primary-600',
    tag: 'Urgency',
  },
  {
    name: 'UTM Builder',
    description: 'Create consistent tracking links and save channel presets.',
    href: '/tools/utm-builder',
    icon: Target,
    accent: 'bg-ink-900',
    tag: 'Tracking',
  },
  {
    name: 'Budget Calculator',
    description: 'Model clicks, conversions, and CPA with benchmark data.',
    href: '/tools/budget-calc',
    icon: Calculator,
    accent: 'bg-emerald-600',
    tag: 'Planning',
  },
  {
    name: 'Copy Optimizer',
    description: 'Score headlines and CTAs with AI-driven suggestions.',
    href: '/tools/copy-optimizer',
    icon: Sparkles,
    accent: 'bg-teal-600',
    tag: 'AI',
  },
  {
    name: 'Meta Tag Preview',
    description: 'Preview how your content appears on Google, Facebook, Twitter, and LinkedIn.',
    href: '/tools/meta-preview',
    icon: Image,
    accent: 'bg-violet-600',
    tag: 'New',
  },
  {
    name: 'AI Campaign Lab',
    description: 'Generate campaign names, landing page critiques, and A/B ideas.',
    href: '/tools/ai-lab',
    icon: Wand2,
    accent: 'bg-primary-700',
    tag: 'AI',
  },
]

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Campaign Marketing Tools',
  description: 'Free marketing tools for campaign optimization including countdown timers, UTM builder, budget calculator, and copy optimizer.',
  itemListElement: tools.map((tool, index) => ({
    '@type': 'SoftwareApplication',
    position: index + 1,
    name: tool.name,
    description: tool.description,
    url: `https://campaignsites.net${tool.href}`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  })),
}

export default function ToolsPage() {
  return (
    <main className="min-h-screen">
      <JsonLd data={structuredData} />

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            kicker="Toolbox"
            title="Free tools to ship smarter campaigns"
            description="Every tool is built for speed: run the workflow, export assets, and share with your team."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <ToolCard key={tool.name} {...tool} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
