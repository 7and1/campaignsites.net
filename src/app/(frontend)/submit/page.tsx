import { SubmissionForm } from '@/components'

export const metadata = {
  title: 'Submit a Case Study',
  description: 'Share a campaign case study with the CampaignSites community.',
}

export default function SubmitPage() {
  return (
    <main className="min-h-screen">
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="glass-panel p-8 md:p-10">
            <p className="section-kicker">Community submissions</p>
            <h1 className="mt-3 text-3xl font-semibold text-ink-900">Submit a campaign case study</h1>
            <p className="mt-4 text-sm text-ink-600">
              Share a campaign that drove meaningful results. We review every submission and feature the
              most actionable takeaways with attribution.
            </p>
            <div className="mt-8">
              <SubmissionForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
