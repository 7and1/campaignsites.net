import { ImageResponse } from 'next/og'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? 'CampaignSites.net'
  const subtitle =
    searchParams.get('subtitle') ?? 'Campaign landing page tools, case studies, and playbooks'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background:
            'radial-gradient(800px 400px at 0% 0%, #ffe7d9 0%, transparent 60%), radial-gradient(700px 400px at 100% 0%, #d1faf4 0%, transparent 60%), #fff9f3',
          color: '#0f172a',
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          {title}
        </div>
        <div style={{ marginTop: 24, fontSize: 30, color: '#475569', maxWidth: 900, lineHeight: 1.4 }}>
          {subtitle}
        </div>
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 22,
            color: '#9c3718',
          }}
        >
          <span>campaignsites.net</span>
          <span>Free tools · Case studies · Playbooks</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
