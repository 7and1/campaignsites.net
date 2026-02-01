import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ArrowRight, Timer, Target, Calculator, Sparkles, Send, CheckCircle, TrendingUp, Zap, Users } from 'lucide-react'
import { CaseStudyCard, JsonLd, NewsletterForm, PostCard, SectionHeading, ToolCard } from '@/components'
import type { CaseStudy, Post } from '@/lib/types'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Campaign Landing Pages: Free Tools & Case Studies | CampaignSites.net',
  description: 'Free campaign landing page tools, real-world case studies, and actionable playbooks. Build high-converting landing pages with countdown timers, UTM builders, budget calculators, and AI copy optimizers.',
  keywords: ['campaign landing pages', 'landing page tools', 'conversion optimization', 'campaign tools', 'UTM builder', 'countdown timer', 'budget calculator', 'copy optimizer'],
  openGraph: {
    title: 'Campaign Landing Pages: Free Tools & Case Studies | CampaignSites.net',
    description: 'Free campaign landing page tools, real-world case studies, and actionable playbooks. Build high-converting landing pages with our free toolkit.',
    url: 'https://campaignsites.net',
    type: 'website',
    images: [
      {
        url: '/og?title=Campaign%20Landing%20Pages&subtitle=Free%20Tools%20%26%20Case%20Studies',
        width: 1200,
        height: 630,
        alt: 'CampaignSites.net - Campaign Landing Page Tools and Resources',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Campaign Landing Pages: Free Tools & Case Studies | CampaignSites.net',
    description: 'Free campaign landing page tools, real-world case studies, and actionable playbooks.',
    images: ['/og?title=Campaign%20Landing%20Pages&subtitle=Free%20Tools%20%26%20Case%20Studies'],
  },
  alternates: {
    canonical: 'https://campaignsites.net',
  },
}

const tools = [
  {
    name: 'Countdown Generator',
    description: 'Launch urgency timers that match your campaign brand in minutes.',
    href: '/tools/countdown',
    icon: Timer,
    accent: 'bg-primary-600',
    tag: 'Popular',
  },
  {
    name: 'UTM Builder',
    description: 'Build clean campaign links and save channel presets for reuse.',
    href: '/tools/utm-builder',
    icon: Target,
    accent: 'bg-ink-900',
  },
  {
    name: 'Budget Calculator',
    description: 'Forecast clicks, conversions, and CPA using live benchmarks.',
    href: '/tools/budget-calc',
    icon: Calculator,
    accent: 'bg-emerald-600',
  },
  {
    name: 'Copy Optimizer',
    description: 'Get instant scorecards and AI variants for headlines and CTAs.',
    href: '/tools/copy-optimizer',
    icon: Sparkles,
    accent: 'bg-teal-600',
  },
]

const stats = [
  { label: 'Campaign playbooks', value: '40+', note: 'Delivered weekly' },
  { label: 'Average CVR lift', value: '18%', note: 'Across featured studies' },
  { label: 'Tools launched', value: '4', note: 'Free forever' },
]

const whyItMatters = [
  {
    icon: TrendingUp,
    title: 'Conversion rates vary wildly',
    description: 'The average landing page converts at 2.35%, but the top 25% hit 5.31% or higher. Small tweaks compound into massive revenue differences.',
  },
  {
    icon: Zap,
    title: 'Speed kills hesitation',
    description: 'Pages that load in under 2 seconds see 15% higher conversion rates. Every extra second costs you roughly 7% of potential customers.',
  },
  {
    icon: Users,
    title: 'Trust signals matter',
    description: '92% of consumers read reviews before buying. Landing pages with social proof convert 34% better than those without.',
  },
  {
    icon: CheckCircle,
    title: 'Testing beats guessing',
    description: 'Companies that A/B test regularly see 30% higher conversion rates. Yet only 17% of marketers use landing page A/B tests.',
  },
]

export default async function HomePage() {
  const payload = await getPayload({ config })
  const [caseStudies, posts] = await Promise.all([
    payload.find({ collection: 'case-studies', limit: 3, sort: '-score', depth: 1 }),
    payload.find({ collection: 'posts', limit: 3, sort: '-publishedDate', depth: 1 }),
  ])
  const caseStudyDocs = caseStudies.docs as CaseStudy[]
  const postDocs = posts.docs as Post[]

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://campaignsites.net/#website',
        url: 'https://campaignsites.net',
        name: 'CampaignSites.net',
        description: 'Free campaign landing page tools, case studies, and playbooks to build high-converting marketing campaigns.',
        publisher: { '@id': 'https://campaignsites.net/#organization' },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://campaignsites.net/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://campaignsites.net/#organization',
        name: 'CampaignSites.net',
        url: 'https://campaignsites.net',
        logo: {
          '@type': 'ImageObject',
          url: 'https://campaignsites.net/og?title=CampaignSites.net',
          width: 1200,
          height: 630,
        },
        sameAs: [
          'https://twitter.com/campaignsites',
          'https://github.com/campaignsites',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Service',
          email: 'hello@campaignsites.net',
          availableLanguage: 'English',
        },
        areaServed: 'Worldwide',
        foundingDate: '2024',
        knowsAbout: [
          'Landing Page Optimization',
          'Conversion Rate Optimization',
          'Campaign Management',
          'Marketing Analytics',
          'A/B Testing',
          'UTM Tracking',
          'Copywriting',
        ],
        description: 'Free campaign landing page tools, real-world case studies, and actionable playbooks for conversion optimization.',
      },
      {
        '@type': 'ItemList',
        '@id': 'https://campaignsites.net/#tools',
        name: 'Campaign Landing Page Tools',
        description: 'Free marketing tools for campaign landing page optimization',
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
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://campaignsites.net/#faq',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is the difference between a landing page and a campaign landing page?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'A campaign landing page is a specific type of landing page designed for a marketing campaign. While all campaign landing pages are landing pages, not all landing pages are campaign landing pages. Campaign landing pages are tightly integrated with specific ads, emails, or promotions and typically have a shorter lifespan tied to the campaign duration.',
            },
          },
          {
            '@type': 'Question',
            name: 'How long should a campaign landing page be?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The ideal length depends on your offer complexity. Short pages work well for simple, low-commitment offers (free trials, newsletter signups). Long-form pages perform better for high-ticket items or complex services where visitors need more information to make a decision. Test both approaches to see what works for your audience.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is a good conversion rate for campaign landing pages?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The average campaign landing page converts at 2.35%, but top performers achieve 5.31% or higher. E-commerce pages typically see 2-3% conversion rates, while B2B lead generation pages often achieve 5-15%. Your industry, traffic source, and offer quality all impact your benchmark.',
            },
          },
          {
            '@type': 'Question',
            name: 'Should I use video on my campaign landing pages?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Video can increase conversions by 80% when used correctly. Keep it short (60-90 seconds), place it above the fold, and ensure it loads quickly. Product demos and testimonials work particularly well. Always test with and without video to confirm it helps your specific audience.',
            },
          },
          {
            '@type': 'Question',
            name: 'How do I track campaign landing page performance?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Use UTM parameters to track traffic sources, set up conversion goals in Google Analytics, and implement heatmaps (Hotjar, Crazy Egg) to understand user behavior. A/B testing tools like Google Optimize or Unbounce help you continuously improve. Our free UTM Builder tool makes tracking setup easy.',
            },
          },
        ],
      },
    ],
  }

  return (
    <main className="min-h-screen">
      <JsonLd data={structuredData} />

      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="section-kicker">Campaign toolkit</p>
              <h1 className="mt-4 text-4xl font-semibold text-ink-900 sm:text-5xl lg:text-6xl">
                Build campaign landing pages that convert visitors into customers.
              </h1>
              <p className="mt-6 text-lg text-ink-600">
                CampaignSites.net provides free campaign landing page tools, real-world case studies, and weekly playbooks
                to help growth teams create high-converting landing pages, track campaigns with UTM parameters, and optimize copy for better results.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-primary-700"
                >
                  Explore the tools <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/gallery"
                  className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white/70 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink-700 transition hover:border-primary-300"
                >
                  View the gallery
                </Link>
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="glass-panel px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">{stat.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-ink-900">{stat.value}</p>
                    <p className="text-xs text-ink-500">{stat.note}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-panel p-6">
              <div className="rounded-2xl bg-ink-900 px-6 py-8 text-white">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-primary-300" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-primary-200">Weekly brief</p>
                    <p className="text-lg font-semibold">The Campaign Pulse</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-white/80">
                  Get the exact teardown we send to agency partners: winning layouts, copy triggers, and
                  paid media experiments that worked this week.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
                  <Send className="h-4 w-4" /> Delivered Fridays
                </div>
              </div>
              <div className="mt-6">
                <NewsletterForm source="homepage-hero" compact />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            kicker="Free tools"
            title="Free campaign landing page tools to boost conversions"
            description="Our campaign landing page toolkit includes countdown timers, UTM builders, budget calculators, and AI copy optimizers. Each tool is built for speed: start with a template, tweak it to your brand, and share with your team."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {tools.map((tool) => (
              <ToolCard key={tool.name} {...tool} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-mist-50">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            kicker="The data"
            title="Why campaign landing page optimization matters more than ever"
            description="Most marketing teams leave money on the table. Here's what the numbers say about campaign landing page performance and conversion optimization."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {whyItMatters.map((item) => (
              <div key={item.title} className="glass-panel p-6">
                <item.icon className="h-8 w-8 text-primary-600" />
                <h3 className="mt-4 text-lg font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-2 text-sm text-ink-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <article className="prose prose-slate max-w-none">
            <h2 className="text-2xl font-semibold text-ink-900">What Are Campaign Landing Pages?</h2>

            <p className="text-ink-600 leading-relaxed">
              <strong>Campaign landing pages are standalone web pages designed specifically for marketing campaigns.</strong> Unlike your homepage or product pages, campaign landing pages have a single focus: converting visitors who click from ads, emails, or social media into leads or customers. They eliminate navigation distractions, match the messaging from the traffic source, and guide visitors toward one clear call-to-action.
            </p>

            <p className="text-ink-600 leading-relaxed">
              Think of a campaign landing page like a rocket ship. You can have the most powerful engine in the world, but if your navigation system is off by even one degree, you will miss your target by thousands of miles. Campaign landing pages work the same way. Small details compound into massive differences in results.
            </p>

            <p className="text-ink-600 leading-relaxed">
              The average business spends $92 to bring a visitor to their website but only $1 to convert them. That math is backwards. When you flip the ratio and invest in conversion optimization, every dollar you spend on traffic works harder. A landing page that converts at 5% instead of 2% does not just perform 2.5 times better. It fundamentally changes the economics of your entire marketing operation.
            </p>

            <h3 className="text-xl font-semibold text-ink-900 mt-8">What Makes a Campaign Landing Page Convert</h3>

            <p className="text-ink-600 leading-relaxed">
              High-converting campaign landing pages share five characteristics. First, they load fast. Google found that 53% of mobile visitors abandon pages that take longer than 3 seconds to load. Second, they have one clear call to action. Pages with a single CTA convert 266% better than pages with multiple competing options. Third, they use social proof strategically. Testimonials, logos, and review counts reduce perceived risk and build trust.
            </p>

            <p className="text-ink-600 leading-relaxed">
              Fourth, they match the message to the traffic source. When someone clicks an ad about &ldquo;free shipping,&rdquo; the campaign landing page better mention free shipping above the fold. Message match alone can improve conversion rates by 50% or more. Fifth, they remove friction. Every form field you add reduces conversions by roughly 4%. Every extra click between landing and conversion costs you customers.
            </p>

            <h3 className="text-xl font-semibold text-ink-900 mt-8">The Psychology Behind Urgency and Scarcity</h3>

            <p className="text-ink-600 leading-relaxed">
              Countdown timers work because of loss aversion. Humans feel the pain of losing something twice as strongly as the pleasure of gaining something equivalent. When visitors see a timer counting down, their brain shifts from &ldquo;should I buy this?&rdquo; to &ldquo;what will I miss if I don&apos;t?&rdquo; That psychological shift is worth real money.
            </p>

            <p className="text-ink-600 leading-relaxed">
              But urgency only works when it is real. Fake scarcity destroys trust. If your &ldquo;limited time offer&rdquo; resets every time someone visits, you are training customers to ignore your deadlines. The best campaigns use genuine constraints: actual inventory limits, real event dates, or legitimate pricing windows. Authenticity converts better than manipulation.
            </p>

            <h3 className="text-xl font-semibold text-ink-900 mt-8">UTM Tracking: The Foundation of Campaign Intelligence</h3>

            <p className="text-ink-600 leading-relaxed">
              You cannot improve what you cannot measure. UTM parameters let you track exactly where your traffic comes from and which campaigns drive actual results. Without proper tracking, you are flying blind. You might be pouring money into channels that look busy but never convert, while starving the channels that actually drive revenue.
            </p>

            <p className="text-ink-600 leading-relaxed">
              The key is consistency. When every team member uses different naming conventions, your analytics become a mess. &ldquo;facebook&rdquo; and &ldquo;Facebook&rdquo; and &ldquo;fb&rdquo; all look like different sources. Our UTM Builder enforces consistent naming across your entire organization, so your data stays clean and actionable.
            </p>

            <h3 className="text-xl font-semibold text-ink-900 mt-8">Budget Planning: From Guesswork to Forecasting</h3>

            <p className="text-ink-600 leading-relaxed">
              Most marketing budgets are based on gut feelings and last year&apos;s numbers. That approach leaves money on the table. When you understand your cost per click, conversion rate, and customer lifetime value, you can model exactly how much to spend and what return to expect. Our Budget Calculator uses industry benchmarks to help you forecast results before you spend a dollar.
            </p>

            <p className="text-ink-600 leading-relaxed">
              The math is simple but powerful. If you know your average CPC is $2.50, your landing page converts at 3%, and your average order value is $150, you can calculate that every $250 in ad spend should generate roughly $450 in revenue. That clarity transforms marketing from a cost center into a predictable growth engine.
            </p>

            <h3 className="text-xl font-semibold text-ink-900 mt-8">Copy That Converts: Headlines, CTAs, and Value Propositions</h3>

            <p className="text-ink-600 leading-relaxed">
              Your headline has about 8 seconds to convince someone to keep reading. That is not much time. The best headlines do three things: they speak directly to a specific audience, they promise a clear benefit, and they create curiosity. &ldquo;How to Double Your Conversion Rate in 30 Days&rdquo; works better than &ldquo;Marketing Tips&rdquo; because it is specific, beneficial, and intriguing.
            </p>

            <p className="text-ink-600 leading-relaxed">
              Call-to-action buttons matter more than most people realize. Changing a CTA from &ldquo;Submit&rdquo; to &ldquo;Get My Free Guide&rdquo; can increase clicks by 90% or more. The best CTAs are specific, action-oriented, and benefit-focused. They tell visitors exactly what they will get and what they need to do to get it.
            </p>

            <h3 className="text-xl font-semibold text-ink-900 mt-8">Testing: The Only Way to Know What Works</h3>

            <p className="text-ink-600 leading-relaxed">
              Every assumption you make about your audience is probably wrong in some way. The only way to know what actually works is to test. A/B testing lets you compare two versions of a page and see which one performs better. Over time, these small improvements compound into massive gains.
            </p>

            <p className="text-ink-600 leading-relaxed">
              Start with high-impact elements: headlines, CTAs, hero images, and form length. Test one thing at a time so you know what caused the change. Run tests until you reach statistical significance, usually at least 100 conversions per variation. Then implement the winner and test something else. This cycle of continuous improvement is how the best marketing teams stay ahead.
            </p>

            <h3 className="text-xl font-semibold text-ink-900 mt-8">Mobile Optimization: Where Most Campaigns Fail</h3>

            <p className="text-ink-600 leading-relaxed">
              More than 60% of web traffic now comes from mobile devices, but most campaign landing pages are still designed desktop-first. That mismatch costs real money. Mobile users have different needs, different attention spans, and different conversion patterns. A page that works great on desktop might be unusable on a phone.
            </p>

            <p className="text-ink-600 leading-relaxed">
              Mobile optimization means more than responsive design. It means larger tap targets, shorter forms, faster load times, and thumb-friendly layouts. It means testing on actual devices, not just browser simulators. The teams that take mobile seriously consistently outperform those that treat it as an afterthought.
            </p>

            <h3 className="text-xl font-semibold text-ink-900 mt-8">Frequently Asked Questions About Campaign Landing Pages</h3>

            <div className="mt-6 space-y-6">
              <div className="glass-panel p-6">
                <h4 className="font-semibold text-ink-900">What is the difference between a landing page and a campaign landing page?</h4>
                <p className="mt-2 text-ink-600">A campaign landing page is a specific type of landing page designed for a marketing campaign. While all campaign landing pages are landing pages, not all landing pages are campaign landing pages. Campaign landing pages are tightly integrated with specific ads, emails, or promotions and typically have a shorter lifespan tied to the campaign duration.</p>
              </div>

              <div className="glass-panel p-6">
                <h4 className="font-semibold text-ink-900">How long should a campaign landing page be?</h4>
                <p className="mt-2 text-ink-600">The ideal length depends on your offer complexity. Short pages work well for simple, low-commitment offers (free trials, newsletter signups). Long-form pages perform better for high-ticket items or complex services where visitors need more information to make a decision. Test both approaches to see what works for your audience.</p>
              </div>

              <div className="glass-panel p-6">
                <h4 className="font-semibold text-ink-900">What is a good conversion rate for campaign landing pages?</h4>
                <p className="mt-2 text-ink-600">The average campaign landing page converts at 2.35%, but top performers achieve 5.31% or higher. E-commerce pages typically see 2-3% conversion rates, while B2B lead generation pages often achieve 5-15%. Your industry, traffic source, and offer quality all impact your benchmark.</p>
              </div>

              <div className="glass-panel p-6">
                <h4 className="font-semibold text-ink-900">Should I use video on my campaign landing pages?</h4>
                <p className="mt-2 text-ink-600">Video can increase conversions by 80% when used correctly. Keep it short (60-90 seconds), place it above the fold, and ensure it loads quickly. Product demos and testimonials work particularly well. Always test with and without video to confirm it helps your specific audience.</p>
              </div>

              <div className="glass-panel p-6">
                <h4 className="font-semibold text-ink-900">How do I track campaign landing page performance?</h4>
                <p className="mt-2 text-ink-600">Use UTM parameters to track traffic sources, set up conversion goals in Google Analytics, and implement heatmaps (Hotjar, Crazy Egg) to understand user behavior. A/B testing tools like Google Optimize or Unbounce help you continuously improve. Our free UTM Builder tool makes tracking setup easy.</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              kicker="Featured"
              title="Case studies that move conversion"
              description="Deep dives into top-performing landing pages, annotated with the exact tactics that drive lift."
            />
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-600"
            >
              Browse full gallery <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {caseStudyDocs.length > 0 ? (
              caseStudyDocs.map((study) => <CaseStudyCard key={study.id || study.slug} study={study} />)
            ) : (
              <div className="glass-panel p-6 text-sm text-ink-600">
                Add your first case study in Payload to spotlight it here.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              kicker="Latest"
              title="Guides your team can ship this week"
              description="Frameworks, templates, and operator notes from growth teams that test relentlessly."
            />
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-600"
            >
              Read the blog <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {postDocs.length > 0 ? (
              postDocs.map((post) => <PostCard key={post.id || post.slug} post={post} />)
            ) : (
              <div className="glass-panel p-6 text-sm text-ink-600">
                Publish your first post in Payload to feature it here.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="glass-panel p-8 md:p-10">
            <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div>
                <p className="section-kicker">Newsletter</p>
                <h2 className="mt-3 text-3xl font-semibold text-ink-900">
                  Join 3,000+ marketers getting our weekly launch checklist.
                </h2>
                <p className="mt-4 text-base text-ink-600">
                  Every Friday we send one tactical brief: campaign teardown, tested CTA language, and
                  a checklist you can hand to your designer today.
                </p>
                <ul className="mt-6 space-y-2 text-sm text-ink-600">
                  <li>• Landing page QA checklist for every launch.</li>
                  <li>• Paid media benchmarks across 10 industries.</li>
                  <li>• Copy frameworks with real conversion lift.</li>
                </ul>
              </div>
              <NewsletterForm source="homepage-footer" />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
