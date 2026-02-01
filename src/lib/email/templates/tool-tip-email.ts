export interface ToolTipEmailData {
  name?: string
  toolName: string
  toolSlug: string
  tipNumber: number
  tipTitle: string
  tipContent: string
  actionUrl: string
  actionText: string
}

export const getToolTipEmailSubject = (data: ToolTipEmailData): string => {
  const subjects = [
    `Quick tip: Get more from ${data.toolName}`,
    `${data.toolName} Pro Tip`,
    `Did you know this about ${data.toolName}?`,
    `Level up your ${data.toolName} skills`,
  ]
  return subjects[(data.tipNumber - 1) % subjects.length] || subjects[0]
}

export const getToolTipEmailText = (data: ToolTipEmailData): string => {
  const greeting = data.name ? `Hi ${data.name},` : 'Hi there,'

  return `${greeting}

PRO TIP #${data.tipNumber}: ${data.tipTitle}

${data.tipContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()}

${data.actionText}: ${data.actionUrl}

---
You're receiving this because you used ${data.toolName} on CampaignSites.net.
Try it again: https://campaignsites.net/tools/${data.toolSlug}

CampaignSites.net
`.trim()
}

export const getToolTipEmailHtml = (data: ToolTipEmailData): string => {
  const greeting = data.name ? `Hi ${data.name},` : 'Hi there,'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.tipTitle}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; padding: 24px 0; border-bottom: 1px solid #e5e7eb;">
    <h1 style="margin: 0; color: #0f172a; font-size: 24px; font-weight: 700;">CampaignSites.net</h1>
  </div>

  <div style="padding: 32px 0;">
    <p style="font-size: 16px; margin-bottom: 24px;">${greeting}</p>

    <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 24px; border-radius: 12px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.9;">Pro Tip #${data.tipNumber}</p>
      <h2 style="margin: 0; font-size: 22px; font-weight: 600;">${data.tipTitle}</h2>
    </div>

    <div style="background: #f8fafc; border-radius: 8px; padding: 24px; margin: 24px 0;">
      ${data.tipContent}
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.actionUrl}" 
         style="display: inline-block; background: #7c3aed; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        ${data.actionText}
      </a>
    </div>

    <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
      <p style="color: #6b7280; font-size: 14px; margin: 0;">
        You are receiving this because you used ${data.toolName} on CampaignSites.net.
        <a href="https://campaignsites.net/tools/${data.toolSlug}" style="color: #7c3aed;">Try it again</a> or 
        <a href="https://campaignsites.net/tools" style="color: #7c3aed;">explore other tools</a>.
      </p>
    </div>
  </div>

  <div style="border-top: 1px solid #e5e7eb; padding: 24px 0; text-align: center; color: #9ca3af; font-size: 12px;">
    <p>CampaignSites.net — Tools for teams that ship</p>
  </div>
</body>
</html>
  `.trim()
}

// Pre-defined tool tips for drip campaigns
export const toolTips: Record<string, Array<Omit<ToolTipEmailData, 'name' | 'toolName' | 'toolSlug'>>> = {
  'utm-builder': [
    {
      tipNumber: 1,
      tipTitle: 'Use Consistent Naming Conventions',
      tipContent: `
        <p style="margin: 0 0 16px 0;">Inconsistent UTM parameters make reporting a nightmare. Here is a simple framework:</p>
        <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
          <li style="margin-bottom: 8px;"><strong>utm_source:</strong> Use lowercase platform names (google, facebook, newsletter)</li>
          <li style="margin-bottom: 8px;"><strong>utm_medium:</strong> Use standard categories (cpc, email, social, display)</li>
          <li style="margin-bottom: 8px;"><strong>utm_campaign:</strong> Use dates for time-bound campaigns (bf2024, launch-jan-2024)</li>
          <li><strong>utm_content:</strong> Use for A/B testing variants (variant-a, blue-cta)</li>
        </ul>
      `,
      actionUrl: 'https://campaignsites.net/tools/utm-builder',
      actionText: 'Build UTM Links',
    },
    {
      tipNumber: 2,
      tipTitle: 'Track Internal Links Too',
      tipContent: `
        <p style="margin: 0 0 16px 0;">UTM parameters are not just for external campaigns. Use them to track:</p>
        <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
          <li style="margin-bottom: 8px;">Banner clicks on your homepage</li>
          <li style="margin-bottom: 8px;">Email signature links</li>
          <li style="margin-bottom: 8px;">PDF downloads and resource links</li>
          <li>Cross-promotions between your own properties</li>
        </ul>
      `,
      actionUrl: 'https://campaignsites.net/tools/utm-builder',
      actionText: 'Create Tracking Links',
    },
    {
      tipNumber: 3,
      tipTitle: 'Shorten Without Losing Data',
      tipContent: `
        <p style="margin: 0 0 16px 0;">Long UTM URLs look messy in ads and social posts. Use a URL shortener that preserves parameters:</p>
        <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
          <li style="margin-bottom: 8px;">Bitly and similar services work great</li>
          <li style="margin-bottom: 8px;">Create branded short links for professional appearance</li>
          <li style="margin-bottom: 8px;">Always test shortened links before launching campaigns</li>
          <li>Document your short link mappings for team reference</li>
        </ul>
      `,
      actionUrl: 'https://campaignsites.net/tools/utm-builder',
      actionText: 'Generate Clean URLs',
    },
  ],
  countdown: [
    {
      tipNumber: 1,
      tipTitle: 'Place Above the Fold',
      tipContent: `
        <p style="margin: 0 0 16px 0;">Your countdown timer should be visible without scrolling. Best practices:</p>
        <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
          <li style="margin-bottom: 8px;">Position near your main CTA</li>
          <li style="margin-bottom: 8px;">Use contrasting colors to draw attention</li>
          <li style="margin-bottom: 8px;">Keep the timer size prominent but not overwhelming</li>
          <li>Test on mobile to ensure visibility</li>
        </ul>
      `,
      actionUrl: 'https://campaignsites.net/tools/countdown',
      actionText: 'Create Timer',
    },
    {
      tipNumber: 2,
      tipTitle: 'Match Timer to Offer Urgency',
      tipContent: `
        <p style="margin: 0 0 16px 0;">Different campaigns need different countdown strategies:</p>
        <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
          <li style="margin-bottom: 8px;"><strong>Flash sales:</strong> 24-48 hours max for maximum urgency</li>
          <li style="margin-bottom: 8px;"><strong>Product launches:</strong> 7-14 days to build anticipation</li>
          <li style="margin-bottom: 8px;"><strong>Webinars:</strong> Count down to start time, then show "Starting Now"</li>
          <li><strong>Seasonal sales:</strong> Start 2-3 weeks before the event</li>
        </ul>
      `,
      actionUrl: 'https://campaignsites.net/tools/countdown',
      actionText: 'Set Up Countdown',
    },
  ],
  'budget-calc': [
    {
      tipNumber: 1,
      tipTitle: 'Start with LTV, Not Budget',
      tipContent: `
        <p style="margin: 0 0 16px 0;">Your allowable CAC determines your budget. Calculate backwards:</p>
        <ol style="margin: 0; padding-left: 20px; color: #4b5563;">
          <li style="margin-bottom: 8px;">Determine your customer Lifetime Value (LTV)</li>
          <li style="margin-bottom: 8px;">Set target LTV:CAC ratio (3:1 is healthy for most businesses)</li>
          <li style="margin-bottom: 8px;">Calculate max allowable CAC</li>
          <li>Work backwards to required traffic and budget</li>
        </ol>
      `,
      actionUrl: 'https://campaignsites.net/tools/budget-calc',
      actionText: 'Calculate Budget',
    },
  ],
  'copy-optimizer': [
    {
      tipNumber: 1,
      tipTitle: 'Test One Element at a Time',
      tipContent: `
        <p style="margin: 0 0 16px 0;">For reliable A/B test results, isolate variables:</p>
        <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
          <li style="margin-bottom: 8px;">Test headline variations on identical pages</li>
          <li style="margin-bottom: 8px;">Keep CTA button color consistent when testing copy</li>
          <li style="margin-bottom: 8px;">Run tests for at least 100 conversions per variant</li>
          <li>Document your learnings in a shared spreadsheet</li>
        </ul>
      `,
      actionUrl: 'https://campaignsites.net/tools/copy-optimizer',
      actionText: 'Optimize Copy',
    },
  ],
  'ai-lab': [
    {
      tipNumber: 1,
      tipTitle: 'Feed AI Better Prompts',
      tipContent: `
        <p style="margin: 0 0 16px 0;">Get better AI results with structured prompts:</p>
        <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
          <li style="margin-bottom: 8px;">Include your target audience description</li>
          <li style="margin-bottom: 8px;">Specify the desired tone (professional, casual, urgent)</li>
          <li style="margin-bottom: 8px;">Mention constraints (character limits, banned words)</li>
          <li>Provide examples of what you like and dislike</li>
        </ul>
      `,
      actionUrl: 'https://campaignsites.net/tools/ai-lab',
      actionText: 'Try AI Lab',
    },
  ],
}

export const getToolTipBySlug = (toolSlug: string, tipNumber: number): ToolTipEmailData | null => {
  const tips = toolTips[toolSlug]
  if (!tips || tipNumber < 1 || tipNumber > tips.length) return null

  const tip = tips[tipNumber - 1]
  const toolNames: Record<string, string> = {
    'utm-builder': 'UTM Builder',
    countdown: 'Countdown Generator',
    'budget-calc': 'Budget Calculator',
    'copy-optimizer': 'Copy Optimizer',
    'ai-lab': 'AI Campaign Lab',
  }

  return {
    name: '',
    toolName: toolNames[toolSlug] || toolSlug,
    toolSlug,
    ...tip,
  }
}
