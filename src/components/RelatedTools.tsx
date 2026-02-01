'use client'

import { memo } from 'react'
import Link from 'next/link'
import { Target, Timer, Calculator, Sparkles, Wand2, ArrowRight } from 'lucide-react'

interface Tool {
  slug: string
  name: string
  description: string
  href: string
  icon: typeof Target
  accent: string
}

const allTools: Tool[] = [
  {
    slug: 'utm-builder',
    name: 'UTM Builder',
    description: 'Create consistent tracking links and save channel presets.',
    href: '/tools/utm-builder',
    icon: Target,
    accent: 'bg-ink-900',
  },
  {
    slug: 'countdown',
    name: 'Countdown Generator',
    description: 'Launch on-brand urgency timers with embed-ready code.',
    href: '/tools/countdown',
    icon: Timer,
    accent: 'bg-primary-600',
  },
  {
    slug: 'budget-calc',
    name: 'Budget Calculator',
    description: 'Model clicks, conversions, and CPA with benchmark data.',
    href: '/tools/budget-calc',
    icon: Calculator,
    accent: 'bg-emerald-600',
  },
  {
    slug: 'copy-optimizer',
    name: 'Copy Optimizer',
    description: 'Score headlines and CTAs with AI-driven suggestions.',
    href: '/tools/copy-optimizer',
    icon: Sparkles,
    accent: 'bg-teal-600',
  },
  {
    slug: 'ai-lab',
    name: 'AI Campaign Lab',
    description: 'Generate campaign names, landing page critiques, and A/B ideas.',
    href: '/tools/ai-lab',
    icon: Wand2,
    accent: 'bg-primary-700',
  },
]

interface RelatedToolsProps {
  currentTool?: string
  limit?: number
  title?: string
  showVariants?: boolean
}

const toolVariants: Record<string, { name: string; href: string }[]> = {
  'utm-builder': [
    { name: 'For Google Ads', href: '/tools/utm-builder/for-google-ads' },
    { name: 'For Facebook', href: '/tools/utm-builder/for-facebook' },
    { name: 'For Email', href: '/tools/utm-builder/for-email' },
    { name: 'For LinkedIn', href: '/tools/utm-builder/for-linkedin' },
  ],
  countdown: [
    { name: 'Black Friday', href: '/tools/countdown/for-black-friday' },
    { name: 'Product Launch', href: '/tools/countdown/for-product-launch' },
    { name: 'Webinars', href: '/tools/countdown/for-webinars' },
  ],
  'budget-calc': [
    { name: 'E-commerce', href: '/tools/budget-calc/for-ecommerce' },
    { name: 'SaaS', href: '/tools/budget-calc/for-saas' },
    { name: 'Lead Gen', href: '/tools/budget-calc/for-lead-gen' },
  ],
  'copy-optimizer': [
    { name: 'Headlines', href: '/tools/copy-optimizer/for-headlines' },
    { name: 'CTA Buttons', href: '/tools/copy-optimizer/for-cta-buttons' },
    { name: 'Email Subject', href: '/tools/copy-optimizer/for-email-subject' },
  ],
  'ai-lab': [
    { name: 'Campaign Names', href: '/tools/ai-lab/campaign-names' },
    { name: 'A/B Test Ideas', href: '/tools/ai-lab/ab-test-ideas' },
    { name: 'Landing Critique', href: '/tools/ai-lab/landing-critique' },
  ],
}

export const RelatedTools = memo(function RelatedTools({
  currentTool,
  limit = 3,
  title = 'Related Tools',
  showVariants = true,
}: RelatedToolsProps) {
  const relatedTools = currentTool
    ? allTools.filter((tool) => tool.slug !== currentTool).slice(0, limit)
    : allTools.slice(0, limit)

  const currentVariants = currentTool && showVariants ? toolVariants[currentTool] : null

  return (
    <section className="border-t border-white/70 bg-mist-50/50 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-2xl font-semibold text-ink-900">{title}</h2>

        {currentVariants && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-500">
              Specialized Versions
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {currentVariants.map((variant) => (
                <Link
                  key={variant.href}
                  href={variant.href}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink-700 shadow-sm transition hover:bg-primary-50 hover:text-primary-600"
                >
                  {variant.name}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {relatedTools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.slug}
                href={tool.href}
                className="group flex items-start gap-4 rounded-xl border border-white/70 bg-white/80 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tool.accent}`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-ink-900 group-hover:text-primary-600">
                    {tool.name}
                  </h3>
                  <p className="mt-1 text-sm text-ink-600">{tool.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
})
