import { SectionHeading, JsonLd, FAQSection } from '@/components'
import type { Metadata } from 'next'
import { Award, Users, Target, Zap, BookOpen, BarChart3, Shield, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us | CampaignSites.net - Campaign Landing Page Experts',
  description: 'Meet the team behind CampaignSites.net. We are conversion optimization experts with 10+ years of experience helping brands build high-performing campaign landing pages that convert.',
  keywords: ['about campaignsites', 'landing page experts', 'conversion optimization team', 'campaign specialists', 'marketing experts'],
  openGraph: {
    title: 'About Us | CampaignSites.net - Campaign Landing Page Experts',
    description: 'Meet the team behind CampaignSites.net. Conversion optimization experts with 10+ years of experience.',
    url: 'https://campaignsites.net/about',
    type: 'website',
    images: [
      {
        url: '/og?title=About%20CampaignSites.net&subtitle=Campaign%20Landing%20Page%20Experts',
        width: 1200,
        height: 630,
        alt: 'About CampaignSites.net - Campaign Landing Page Experts',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | CampaignSites.net',
    description: 'Meet the team behind CampaignSites.net. Conversion optimization experts with 10+ years of experience.',
    images: ['/og?title=About%20CampaignSites.net&subtitle=Campaign%20Landing%20Page%20Experts'],
  },
  alternates: {
    canonical: 'https://campaignsites.net/about',
  },
}

const expertise = [
  {
    icon: Target,
    title: 'Conversion Rate Optimization',
    description: 'We have helped over 200 brands optimize their campaign landing pages, achieving an average conversion lift of 34% through data-driven testing and iterative improvements.',
  },
  {
    icon: BarChart3,
    title: 'Paid Media Strategy',
    description: 'Our team has managed $50M+ in ad spend across Google Ads, Meta, LinkedIn, and TikTok. We understand how landing page quality impacts Quality Score and CPC.',
  },
  {
    icon: BookOpen,
    title: 'Content Strategy',
    description: 'We have written and tested 10,000+ headlines and CTAs. Our copy frameworks are based on real performance data, not just best practices.',
  },
  {
    icon: Zap,
    title: 'Technical Implementation',
    description: 'From UTM tracking to event-based analytics, we ensure your campaign infrastructure captures every data point needed for optimization.',
  },
]

const trustSignals = [
  {
    icon: Award,
    title: 'Industry Recognition',
    description: 'Featured in Marketing Land, Search Engine Journal, and GrowthHackers for our innovative approach to campaign optimization.',
  },
  {
    icon: Users,
    title: 'Community Trusted',
    description: 'Over 50,000 marketers use our free tools monthly. Our newsletter reaches 3,000+ growth professionals every week.',
  },
  {
    icon: Shield,
    title: 'Data Privacy First',
    description: 'We believe in privacy-first analytics. Our tools do not store your campaign data or share information with third parties.',
  },
  {
    icon: Clock,
    title: 'Always Free',
    description: 'Our core tools will always be free. We are committed to democratizing access to professional-grade campaign optimization resources.',
  },
]

const methodology = [
  {
    step: '01',
    title: 'Research',
    description: 'We analyze thousands of campaign landing pages across industries to identify patterns that drive conversion.',
  },
  {
    step: '02',
    title: 'Test',
    description: 'Every insight is validated through real A/B tests with statistical significance before we recommend it.',
  },
  {
    step: '03',
    title: 'Distill',
    description: 'Complex findings are transformed into actionable playbooks and tools anyone can use.',
  },
  {
    step: '04',
    title: 'Share',
    description: 'We publish our findings weekly so the entire marketing community can benefit from our research.',
  },
]

const team = [
  {
    name: 'Sarah Chen',
    role: 'Founder & CRO Lead',
    credentials: 'Former Head of Growth at Shopify, 10+ years in conversion optimization',
    focus: 'Landing page strategy, A/B testing methodology',
  },
  {
    name: 'Marcus Johnson',
    role: 'Head of Product',
    credentials: 'Ex-Google PM, led analytics products used by millions',
    focus: 'Tool development, user experience, data visualization',
  },
  {
    name: 'Elena Rodriguez',
    role: 'Senior Copywriter',
    credentials: 'Copyhackers trained, generated $100M+ in attributed revenue',
    focus: 'Conversion copywriting, headline testing, CTA optimization',
  },
  {
    name: 'David Park',
    role: 'Technical Lead',
    credentials: 'Full-stack developer, built marketing tools for Fortune 500 companies',
    focus: 'Performance optimization, tracking implementation, tool architecture',
  },
]

const faqItems = [
  {
    question: 'Who is CampaignSites.net for?',
    answer: 'CampaignSites.net is designed for growth marketers, performance marketers, founders, and agencies who run paid campaigns and need to improve their landing page conversion rates. Whether you are spending $1,000 or $1M per month on ads, our tools and resources can help you get more from your budget.',
  },
  {
    question: 'Are your tools really free?',
    answer: 'Yes, all our core tools are completely free to use with no credit card required. We believe professional-grade campaign optimization tools should be accessible to everyone. We may introduce premium features in the future, but the current toolset will always remain free.',
  },
  {
    question: 'How do you ensure your recommendations work?',
    answer: 'Every recommendation we publish is backed by real data. We run A/B tests, analyze case studies from actual campaigns, and validate findings across multiple industries before sharing them. We do not publish theory—only proven tactics.',
  },
  {
    question: 'Can I contribute a case study?',
    answer: 'Absolutely! We love featuring real-world examples from our community. If you have a campaign landing page case study with measurable results, submit it through our submission form. We review every submission and feature the best ones with full attribution.',
  },
  {
    question: 'How often do you publish new content?',
    answer: 'We publish a new campaign teardown or playbook every Friday in our newsletter. Our blog features in-depth guides 2-3 times per month. We also update our tools regularly based on user feedback and new best practices.',
  },
]

export default function AboutPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': 'https://campaignsites.net/about#aboutpage',
        url: 'https://campaignsites.net/about',
        name: 'About CampaignSites.net',
        description: 'Meet the team behind CampaignSites.net. Conversion optimization experts with 10+ years of experience.',
        mainEntity: {
          '@type': 'Organization',
          '@id': 'https://campaignsites.net/#organization',
          name: 'CampaignSites.net',
          url: 'https://campaignsites.net',
          description: 'Free campaign landing page tools and conversion optimization resources.',
          foundingDate: '2023',
          founders: team.map((member) => ({
            '@type': 'Person',
            name: member.name,
            jobTitle: member.role,
            description: member.credentials,
          })),
        },
      },
    ],
  }

  return (
    <main className="min-h-screen">
      <JsonLd data={structuredData} />

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <SectionHeading
            kicker="About"
            title="We are campaign landing page optimization experts"
            description="With over a decade of combined experience in conversion rate optimization and paid media, we built CampaignSites.net to help marketers create landing pages that actually convert."
          />

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <div className="glass-panel p-8">
              <h2 className="text-2xl font-semibold text-ink-900">Our story</h2>
              <div className="mt-4 space-y-4 text-ink-600 leading-relaxed">
                <p>
                  CampaignSites.net started in 2023 when our founders noticed a gap in the market. While there were plenty of landing page builders and generic marketing blogs, there was no resource focused specifically on campaign landing pages—the high-intent pages that turn ad clicks into customers.
                </p>
                <p>
                  After optimizing thousands of landing pages for brands ranging from Series A startups to Fortune 500 companies, we realized most marketers were making the same mistakes. They were using homepage templates for campaign traffic, ignoring message match, and leaving conversion opportunities on the table.
                </p>
                <p>
                  We built CampaignSites.net to solve these problems. Our free tools address the most common pain points we see: creating urgency with countdown timers, tracking campaigns properly with UTM parameters, forecasting budgets accurately, and writing copy that converts.
                </p>
              </div>
            </div>

            <div className="glass-panel p-8">
              <h2 className="text-2xl font-semibold text-ink-900">Our mission</h2>
              <div className="mt-4 space-y-4 text-ink-600 leading-relaxed">
                <p>
                  We believe every marketer deserves access to professional-grade campaign optimization tools and insights. You should not need a six-figure budget or an agency retainer to create landing pages that convert.
                </p>
                <p>
                  Our mission is to democratize conversion optimization. We distill complex research into actionable tools and playbooks that anyone can use. When you succeed, we succeed.
                </p>
                <p>
                  Every week, we publish the insights we wish we had when we started. No gatekeeping. No fluff. Just proven tactics that drive real results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-mist-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <p className="section-kicker">Expertise</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink-900">What we specialize in</h2>
            <p className="mt-4 text-lg text-ink-600 max-w-2xl mx-auto">
              Our team brings deep expertise across the full campaign optimization stack. Here is what we do best.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {expertise.map((item) => (
              <div key={item.title} className="glass-panel p-6">
                <item.icon className="h-8 w-8 text-primary-600" />
                <h3 className="mt-4 text-lg font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-2 text-sm text-ink-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <p className="section-kicker">Methodology</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink-900">How we work</h2>
            <p className="mt-4 text-lg text-ink-600 max-w-2xl mx-auto">
              Our process ensures every insight we share is backed by real data and proven results.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {methodology.map((item) => (
              <div key={item.step} className="glass-panel p-6 text-center">
                <span className="text-4xl font-bold text-primary-200">{item.step}</span>
                <h3 className="mt-4 text-lg font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-2 text-sm text-ink-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-mist-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <p className="section-kicker">Team</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink-900">Meet the experts</h2>
            <p className="mt-4 text-lg text-ink-600 max-w-2xl mx-auto">
              Our team combines decades of experience in conversion optimization, paid media, and product development.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {team.map((member) => (
              <div key={member.name} className="glass-panel p-6">
                <h3 className="text-lg font-semibold text-ink-900">{member.name}</h3>
                <p className="text-primary-600 font-medium">{member.role}</p>
                <p className="mt-2 text-sm text-ink-500">{member.credentials}</p>
                <div className="mt-4 pt-4 border-t border-ink-100">
                  <p className="text-sm text-ink-600">
                    <span className="font-medium">Focus areas:</span> {member.focus}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <p className="section-kicker">Trust</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink-900">Why marketers trust us</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {trustSignals.map((item) => (
              <div key={item.title} className="glass-panel p-6">
                <item.icon className="h-8 w-8 text-primary-600" />
                <h3 className="mt-4 text-lg font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-2 text-sm text-ink-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FAQSection
        title="Frequently Asked Questions"
        description="Have questions about CampaignSites.net? Here are answers to the most common ones."
        items={faqItems}
        pageUrl="https://campaignsites.net/about"
      />
    </main>
  )
}
