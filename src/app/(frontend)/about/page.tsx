import { SectionHeading } from '@/components'

export const metadata = {
  title: 'About CampaignSites',
  description: 'Learn how CampaignSites helps teams ship better campaigns faster.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <SectionHeading
            kicker="About"
            title="CampaignSites is the launch toolkit for growth teams"
            description="We distill what actually moves conversion into tools, templates, and case studies you can use immediately."
          />
          <div className="mt-10 grid gap-8 text-sm text-ink-600">
            <div className="glass-panel p-6">
              <h2 className="text-lg font-semibold text-ink-900">Our mission</h2>
              <p className="mt-3">
                Every campaign should ship with clarity, urgency, and proof. We help marketers get there faster
                by bundling proven playbooks, free utilities, and real-world teardowns in one place.
              </p>
            </div>
            <div className="glass-panel p-6">
              <h2 className="text-lg font-semibold text-ink-900">What we publish</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Weekly campaign tear-downs with copy and layout notes.</li>
                <li>Benchmarks for paid media, conversion rate, and lead capture.</li>
                <li>Templates and checklists to ship landing pages faster.</li>
              </ul>
            </div>
            <div className="glass-panel p-6">
              <h2 className="text-lg font-semibold text-ink-900">Built for teams who ship</h2>
              <p className="mt-3">
                CampaignSites is designed for founders, agencies, and in-house growth teams who need to
                move from idea to launch without reinventing the playbook every time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
