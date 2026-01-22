import { ensureAnalyticsTables, getDatabase } from '@/lib/analytics'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Analytics Dashboard',
  description: 'Track UTM attribution, affiliate clicks, and tool usage.',
}

type UTMRow = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  count?: number
}

type CountRow = {
  tool_slug?: string
  count?: number
}

export default async function AnalyticsPage() {
  try {
    const db = await getDatabase()
    await ensureAnalyticsTables(db)

    const utmStats = await db
      .prepare(
        `SELECT utm_source, utm_medium, utm_campaign, COUNT(*) as count
         FROM analytics_events
         WHERE event_type = 'utm_visit'
         GROUP BY utm_source, utm_medium, utm_campaign
         ORDER BY count DESC
         LIMIT 10`
      )
      .all()

    const affiliateStats = await db
      .prepare(
        `SELECT tool_slug, COUNT(*) as count
         FROM analytics_events
         WHERE event_type = 'affiliate_click'
         GROUP BY tool_slug
         ORDER BY count DESC
         LIMIT 10`
      )
      .all()

    const toolUsage = await db
      .prepare(
        `SELECT tool_slug, COUNT(*) as count
         FROM analytics_events
         WHERE event_type = 'tool_usage'
         GROUP BY tool_slug
         ORDER BY count DESC
         LIMIT 10`
      )
      .all()

    return (
      <main className="min-h-screen">
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <p className="section-kicker">Analytics</p>
            <h1 className="mt-3 text-3xl font-semibold text-ink-900">Campaign performance dashboard</h1>
            <p className="mt-3 text-sm text-ink-600">
              Track UTM attribution, affiliate clicks, and tool usage across CampaignSites.
            </p>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              <div className="glass-panel p-6">
                <h2 className="text-lg font-semibold text-ink-900">Top UTM sources</h2>
                <div className="mt-4 space-y-2 text-sm text-ink-600">
                  {(utmStats.results as UTMRow[]).length > 0 ? (
                    (utmStats.results as UTMRow[]).map((row, index) => (
                      <div key={index} className="flex justify-between gap-4">
                        <span>
                          {row.utm_source || 'direct'} / {row.utm_medium || 'n/a'} /{' '}
                          {row.utm_campaign || 'n/a'}
                        </span>
                        <span className="font-semibold text-ink-900">{row.count}</span>
                      </div>
                    ))
                  ) : (
                    <p>No UTM traffic recorded yet.</p>
                  )}
                </div>
              </div>

              <div className="glass-panel p-6">
                <h2 className="text-lg font-semibold text-ink-900">Affiliate clicks</h2>
                <div className="mt-4 space-y-2 text-sm text-ink-600">
                  {(affiliateStats.results as CountRow[]).length > 0 ? (
                    (affiliateStats.results as CountRow[]).map((row, index) => (
                      <div key={index} className="flex justify-between gap-4">
                        <span>{row.tool_slug || 'unknown'}</span>
                        <span className="font-semibold text-ink-900">{row.count}</span>
                      </div>
                    ))
                  ) : (
                    <p>No affiliate clicks yet.</p>
                  )}
                </div>
              </div>

              <div className="glass-panel p-6">
                <h2 className="text-lg font-semibold text-ink-900">Tool usage</h2>
                <div className="mt-4 space-y-2 text-sm text-ink-600">
                  {(toolUsage.results as CountRow[]).length > 0 ? (
                    (toolUsage.results as CountRow[]).map((row, index) => (
                      <div key={index} className="flex justify-between gap-4">
                        <span>{row.tool_slug || 'unknown'}</span>
                        <span className="font-semibold text-ink-900">{row.count}</span>
                      </div>
                    ))
                  ) : (
                    <p>No tool usage recorded yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    )
  } catch {
    return (
      <main className="min-h-screen">
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-6">
            <div className="glass-panel p-8 text-sm text-ink-600">
              Analytics data is not available yet. Make sure Cloudflare D1 bindings are configured.
            </div>
          </div>
        </section>
      </main>
    )
  }
}
