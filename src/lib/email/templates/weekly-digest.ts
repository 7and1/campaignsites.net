export interface WeeklyDigestData {
  name?: string
  weekNumber: number
  featuredCaseStudy?: {
    title: string
    slug: string
    summary: string
    score: number
  }
  newTools?: Array<{
    name: string
    slug: string
    description: string
  }>
  tips?: Array<{
    title: string
    content: string
  }>
}

export const getWeeklyDigestSubject = (data: WeeklyDigestData): string => {
  const subjects = [
    `This week's campaign teardown: ${data.featuredCaseStudy?.title || 'Fresh insights'}`,
    `Week ${data.weekNumber}: Tools and tactics that convert`,
    'Your weekly dose of campaign inspiration',
    'New in the gallery: High-converting campaigns analyzed',
  ]
  return subjects[data.weekNumber % subjects.length] || subjects[0]
}

export const getWeeklyDigestHtml = (data: WeeklyDigestData): string => {
  const greeting = data.name ? `Hi ${data.name},` : 'Hi there,'

  const featuredSection = data.featuredCaseStudy
    ? `
    <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <span style="background: #7c3aed; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">Featured Case Study</span>
        <span style="background: #ecfdf5; color: #059669; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">${data.featuredCaseStudy.score}/10</span>
      </div>
      <h3 style="margin: 0 0 8px 0; color: #0f172a; font-size: 20px;">${data.featuredCaseStudy.title}</h3>
      <p style="margin: 0 0 16px 0; color: #4b5563;">${data.featuredCaseStudy.summary}</p>
      <a href="https://campaignsites.net/gallery/${data.featuredCaseStudy.slug}" 
         style="display: inline-block; color: #7c3aed; text-decoration: none; font-weight: 600;">
        Read the full teardown →
      </a>
    </div>
  `
    : ''

  const toolsSection = data.newTools?.length
    ? `
    <div style="margin: 32px 0;">
      <h3 style="color: #0f172a; font-size: 18px; margin-bottom: 16px;">New Tools to Try</h3>
      <div style="display: grid; gap: 12px;">
        ${data.newTools
          .map(
            (tool) => `
          <a href="https://campaignsites.net/tools/${tool.slug}" 
             style="display: block; background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-decoration: none;">
            <h4 style="margin: 0 0 4px 0; color: #0f172a; font-size: 16px;">${tool.name}</h4>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">${tool.description}</p>
          </a>
        `
          )
          .join('')}
      </div>
    </div>
  `
    : ''

  const tipsSection = data.tips?.length
    ? `
    <div style="margin: 32px 0;">
      <h3 style="color: #0f172a; font-size: 18px; margin-bottom: 16px;">Quick Tips</h3>
      <div style="display: grid; gap: 16px;">
        ${data.tips
          .map(
            (tip) => `
          <div style="border-left: 3px solid #7c3aed; padding-left: 16px;">
            <h4 style="margin: 0 0 4px 0; color: #0f172a; font-size: 15px;">${tip.title}</h4>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">${tip.content}</p>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `
    : ''

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Digest - Week ${data.weekNumber}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; padding: 24px 0; border-bottom: 1px solid #e5e7eb;">
    <h1 style="margin: 0; color: #0f172a; font-size: 28px; font-weight: 700;">CampaignSites Weekly</h1>
    <p style="margin: 8px 0 0 0; color: #6b7280;">Week ${data.weekNumber} — Tools, teardowns, and tactics</p>
  </div>

  <div style="padding: 32px 0;">
    <p style="font-size: 16px; margin-bottom: 24px;">${greeting}</p>

    <p>Here is your weekly roundup of campaign insights, new tools, and proven tactics to help you launch better marketing.</p>

    ${featuredSection}
    ${toolsSection}
    ${tipsSection}

    <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; border-radius: 12px; padding: 24px; margin: 32px 0; text-align: center;">
      <h3 style="margin: 0 0 8px 0; font-size: 20px;">Need campaign inspiration?</h3>
      <p style="margin: 0 0 16px 0; opacity: 0.9;">Browse our gallery of high-converting landing pages and campaign teardowns.</p>
      <a href="https://campaignsites.net/gallery" 
         style="display: inline-block; background: white; color: #7c3aed; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
        Explore the Gallery
      </a>
    </div>
  </div>

  <div style="border-top: 1px solid #e5e7eb; padding: 24px 0; text-align: center; color: #9ca3af; font-size: 12px;">
    <p>CampaignSites.net — Tools for teams that ship</p>
    <p style="margin-top: 8px;">
      <a href="https://campaignsites.net/unsubscribe" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a> |
      <a href="https://campaignsites.net/privacy" style="color: #9ca3af; text-decoration: underline;">Privacy Policy</a>
    </p>
  </div>
</body>
</html>
  `.trim()
}

export const getWeeklyDigestText = (data: WeeklyDigestData): string => {
  const greeting = data.name ? `Hi ${data.name},` : 'Hi there,'

  let text = `${greeting}

Here is your weekly roundup of campaign insights, new tools, and proven tactics to help you launch better marketing.

`

  if (data.featuredCaseStudy) {
    text += `FEATURED CASE STUDY: ${data.featuredCaseStudy.title} (${data.featuredCaseStudy.score}/10)

${data.featuredCaseStudy.summary}

Read the full teardown: https://campaignsites.net/gallery/${data.featuredCaseStudy.slug}

`
  }

  if (data.newTools?.length) {
    text += `NEW TOOLS TO TRY:

${data.newTools.map((t) => `- ${t.name}: ${t.description}
  https://campaignsites.net/tools/${t.slug}`).join('\n\n')}

`
  }

  if (data.tips?.length) {
    text += `QUICK TIPS:

${data.tips.map((t) => `• ${t.title}
${t.content}`).join('\n\n')}

`
  }

  text += `---
Need campaign inspiration? Browse our gallery:
https://campaignsites.net/gallery

CampaignSites.net
Unsubscribe: https://campaignsites.net/unsubscribe
`

  return text
}
