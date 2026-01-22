export const metadata = {
  title: 'Privacy Policy',
  description: 'How CampaignSites collects and uses your data.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <p className="section-kicker">Privacy</p>
          <h1 className="mt-3 text-3xl font-semibold text-ink-900">Privacy Policy</h1>
          <div className="prose prose-slate mt-6 max-w-none text-ink-600">
            <p>
              CampaignSites.net respects your privacy. This policy explains what we collect, why we collect it,
              and how you can control your information.
            </p>
            <h2>Information we collect</h2>
            <ul>
              <li>Email address and name when you subscribe or submit a form.</li>
              <li>Usage data such as pages visited and tool interactions.</li>
              <li>UTM parameters to understand campaign attribution.</li>
            </ul>
            <h2>How we use your information</h2>
            <ul>
              <li>Deliver the resources you requested (checklists, templates).</li>
              <li>Improve the site, tools, and content based on usage trends.</li>
              <li>Respond to inquiries and case study submissions.</li>
            </ul>
            <h2>Cookies and analytics</h2>
            <p>
              We use cookies to remember preferences and understand how visitors use the site. Analytics data helps
              us improve performance and content relevance. You can opt out by disabling cookies in your browser.
            </p>
            <h2>Affiliate links</h2>
            <p>
              Some pages include affiliate links. If you click and purchase, we may earn a commission at no extra
              cost to you. This helps fund the free tools and resources.
            </p>
            <h2>Data retention</h2>
            <p>
              We retain data only as long as necessary to provide the service or comply with legal obligations. You
              can request deletion of your data at any time.
            </p>
            <h2>Contact</h2>
            <p>
              Questions about privacy? Email us at hello@campaignsites.net.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
