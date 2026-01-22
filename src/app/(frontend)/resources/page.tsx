import Link from 'next/link'
import { Download, FileText, Sparkles } from 'lucide-react'
import { NewsletterForm, SectionHeading } from '@/components'

export const metadata = {
  title: 'Resources',
  description: 'Download campaign checklists, templates, and swipe files.',
}

const resources = [
  {
    title: 'Landing Page Launch Checklist',
    description: '15-point checklist to run before every campaign goes live.',
    href: '/lead-magnets/landing-page-checklist.txt',
    tag: 'Checklist',
  },
  {
    title: 'UTM Naming Guide',
    description: 'Keep every channel naming convention consistent across your team.',
    href: '/lead-magnets/utm-naming-guide.txt',
    tag: 'Template',
  },
  {
    title: 'CTA Swipe File',
    description: 'Proven call-to-action phrases for high-intent landing pages.',
    href: '/lead-magnets/cta-swipe-file.txt',
    tag: 'Swipe File',
  },
]

export default function ResourcesPage() {
  return (
    <main className="min-h-screen">
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            kicker="Resources"
            title="Lead magnets you can deploy today"
            description="Download checklists, templates, and swipe files used in our campaign teardowns."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {resources.map((resource) => (
              <div key={resource.title} className="glass-panel p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">{resource.tag}</p>
                <h3 className="mt-4 text-lg font-semibold text-ink-900">{resource.title}</h3>
                <p className="mt-2 text-sm text-ink-600">{resource.description}</p>
                <Link
                  href={resource.href}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-primary-700"
                >
                  <Download className="h-4 w-4" /> Download
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="glass-panel p-8 md:p-10">
            <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">
                  <Sparkles className="h-4 w-4" /> Weekly resource drop
                </div>
                <h2 className="mt-4 text-3xl font-semibold text-ink-900">Want the next playbook first?</h2>
                <p className="mt-3 text-sm text-ink-600">
                  Subscribe to get new campaign templates, benchmarks, and teardown notes as soon as
                  they land.
                </p>
                <div className="mt-6 flex items-center gap-3 text-xs text-ink-500">
                  <FileText className="h-4 w-4" /> New resource pack every Friday.
                </div>
              </div>
              <NewsletterForm source="resources" />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
