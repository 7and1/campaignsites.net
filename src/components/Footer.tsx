import Link from 'next/link'
import { Timer, Target, Calculator, Sparkles, HeartHandshake, Mail } from 'lucide-react'
import { memo } from 'react'

const tools = [
  { name: 'Countdown Generator', href: '/tools/countdown', icon: Timer },
  { name: 'UTM Builder', href: '/tools/utm-builder', icon: Target },
  { name: 'Budget Calculator', href: '/tools/budget-calc', icon: Calculator },
  { name: 'Copy Optimizer', href: '/tools/copy-optimizer', icon: Sparkles },
]

const resources = [
  { name: 'Case Study Gallery', href: '/gallery' },
  { name: 'Blog & Guides', href: '/blog' },
  { name: 'Resource Library', href: '/resources' },
  { name: 'Submit a Campaign', href: '/submit' },
]

const company = [
  { name: 'About', href: '/about' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
]

export const Footer = memo(function Footer() {
  return (
    <footer className="soft-divider bg-ink-900 text-mist-100">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link href="/" className="text-xl font-semibold text-white">
              Campaign<span className="text-primary-300">Sites</span>
            </Link>
            <p className="mt-4 text-sm text-mist-200">
              Free tools, case studies, and playbooks for teams building high-converting campaign
              landing pages.
            </p>
            <a
              href="mailto:hello@campaignsites.net"
              className="mt-4 inline-flex items-center gap-2 text-sm text-mist-200 hover:text-white transition"
            >
              <Mail className="h-4 w-4" />
              hello@campaignsites.net
            </a>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-mist-100">
              <HeartHandshake className="h-4 w-4 text-primary-300" />
              Built for marketers who ship fast.
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-mist-100">Free Tools</h3>
            <ul className="mt-4 space-y-2">
              {tools.map((tool) => (
                <li key={tool.name}>
                  <Link
                    href={tool.href}
                    className="inline-flex items-center gap-2 text-sm text-mist-200 hover:text-white"
                  >
                    <tool.icon className="h-4 w-4" />
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-mist-100">Resources</h3>
            <ul className="mt-4 space-y-2">
              {resources.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm text-mist-200 hover:text-white">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-mist-100">Company</h3>
            <ul className="mt-4 space-y-2">
              {company.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm text-mist-200 hover:text-white">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-4 text-xs text-mist-300 md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} CampaignSites. All rights reserved.</p>
            <p>
              Some links on this site are affiliate links. We may earn a commission at no extra cost to you.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
})
