export const metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using CampaignSites.',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen">
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <p className="section-kicker">Terms</p>
          <h1 className="mt-3 text-3xl font-semibold text-ink-900">Terms of Service</h1>
          <div className="prose prose-slate mt-6 max-w-none text-ink-600">
            <p>
              By using CampaignSites.net, you agree to these terms. Please read them carefully.
            </p>
            <h2>Use of the service</h2>
            <p>
              You may use the tools and resources for your own campaigns or client work. You may not copy,
              redistribute, or resell the content without permission.
            </p>
            <h2>Content accuracy</h2>
            <p>
              We strive to keep information accurate and up to date, but we cannot guarantee results or outcomes.
              You are responsible for how you apply the advice.
            </p>
            <h2>Affiliate relationships</h2>
            <p>
              Some links are affiliate links. If you click and purchase, we may earn a commission. This does not
              influence our editorial standards.
            </p>
            <h2>Limitations</h2>
            <p>
              CampaignSites.net is provided “as is.” We are not liable for damages resulting from use of the site
              or tools.
            </p>
            <h2>Changes</h2>
            <p>
              We may update these terms from time to time. Continued use of the site means you accept the updated
              terms.
            </p>
            <h2>Contact</h2>
            <p>
              Questions about these terms? Email us at hello@campaignsites.net.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
