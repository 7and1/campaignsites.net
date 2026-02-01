export interface WelcomeEmailData {
  name?: string
  leadMagnetTitle?: string
  leadMagnetUrl?: string
  unsubscribeUrl?: string
  preferencesUrl?: string
}

export const getWelcomeEmailSubject = (data: WelcomeEmailData): string => {
  return data.leadMagnetTitle
    ? `Your ${data.leadMagnetTitle} is ready`
    : 'Welcome to CampaignSites'
}

export const getWelcomeEmailHtml = (data: WelcomeEmailData): string => {
  const greeting = data.name ? `Hi ${data.name},` : 'Hi there,'
  const downloadSection = data.leadMagnetUrl
    ? `
    <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 24px 0;">
      <h3 style="margin: 0 0 12px 0; color: #166534; font-size: 18px;">Your download is ready</h3>
      <p style="margin: 0 0 16px 0; color: #374151;">
        ${data.leadMagnetTitle || 'Your resource'} is ready for download.
      </p>
      <a href="${data.leadMagnetUrl}" 
         style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
        Download Now
      </a>
    </div>
  `
    : ''

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to CampaignSites</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; padding: 24px 0; border-bottom: 1px solid #e5e7eb;">
    <h1 style="margin: 0; color: #0f172a; font-size: 28px; font-weight: 700;">CampaignSites.net</h1>
    <p style="margin: 8px 0 0 0; color: #6b7280;">Tools and resources for marketing teams</p>
  </div>

  <div style="padding: 32px 0;">
    <p style="font-size: 18px; margin-bottom: 16px;">${greeting}</p>
    
    <p>Welcome to CampaignSites! You are now part of a community of 5,000+ marketers who use our tools to launch better campaigns.</p>

    ${downloadSection}

    <h2 style="color: #0f172a; font-size: 20px; margin-top: 32px;">Here is what you can do next:</h2>
    
    <div style="margin: 24px 0;">
      <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px;">
        <div style="background: #ede9fe; color: #7c3aed; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0;">1</div>
        <div>
          <h3 style="margin: 0 0 4px 0; color: #1f2937; font-size: 16px;">Try our free tools</h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Build UTM links, create countdown timers, and optimize your copy with our 
            <a href="https://campaignsites.net/tools" style="color: #7c3aed; text-decoration: none;">free marketing tools</a>.
          </p>
        </div>
      </div>

      <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px;">
        <div style="background: #ede9fe; color: #7c3aed; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0;">2</div>
        <div>
          <h3 style="margin: 0 0 4px 0; color: #1f2937; font-size: 16px;">Browse case studies</h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Get inspired by real campaign teardowns and high-converting landing pages in our 
            <a href="https://campaignsites.net/gallery" style="color: #7c3aed; text-decoration: none;">gallery</a>.
          </p>
        </div>
      </div>

      <div style="display: flex; align-items: flex-start; gap: 16px;">
        <div style="background: #ede9fe; color: #7c3aed; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; flex-shrink: 0;">3</div>
        <div>
          <h3 style="margin: 0 0 4px 0; color: #1f2937; font-size: 16px;">Read our guides</h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Learn proven strategies in our 
            <a href="https://campaignsites.net/blog" style="color: #7c3aed; text-decoration: none;">blog</a> 
            with actionable tips you can implement today.
          </p>
        </div>
      </div>
    </div>

    <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 32px 0;">
      <p style="margin: 0; color: #475569; font-size: 14px;">
        <strong>What to expect:</strong> Every Friday, you will receive one actionable campaign teardown, tool recommendation, or strategy guide. No fluff, just value.
      </p>
    </div>

    <p style="margin-top: 32px;">
      Have questions? Just reply to this email. I read every response personally.<br>
      — The CampaignSites Team
    </p>
  </div>

  <div style="border-top: 1px solid #e5e7eb; padding: 24px 0; text-align: center; color: #9ca3af; font-size: 12px;">
    <p>CampaignSites.net — Tools for teams that ship</p>
    <p style="margin-top: 8px;">
      <a href="${data.unsubscribeUrl || 'https://campaignsites.net/api/v1/unsubscribe'}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a> |
      <a href="${data.preferencesUrl || 'https://campaignsites.net/preferences'}" style="color: #9ca3af; text-decoration: underline;">Manage Preferences</a> |
      <a href="https://campaignsites.net/privacy" style="color: #9ca3af; text-decoration: underline;">Privacy Policy</a>
    </p>
  </div>
</body>
</html>
  `.trim()
}

export const getWelcomeEmailText = (data: WelcomeEmailData): string => {
  const greeting = data.name ? `Hi ${data.name},` : 'Hi there,'
  const downloadSection = data.leadMagnetUrl
    ? `
Your download is ready:
${data.leadMagnetTitle || 'Your resource'}: ${data.leadMagnetUrl}
`
    : ''

  return `
${greeting}

Welcome to CampaignSites! You are now part of a community of 5,000+ marketers who use our tools to launch better campaigns.

${downloadSection}
Here is what you can do next:

1. Try our free tools
   Build UTM links, create countdown timers, and optimize your copy:
   https://campaignsites.net/tools

2. Browse case studies
   Get inspired by real campaign teardowns:
   https://campaignsites.net/gallery

3. Read our guides
   Learn proven strategies in our blog:
   https://campaignsites.net/blog

What to expect: Every Friday, you will receive one actionable campaign teardown, tool recommendation, or strategy guide. No fluff, just value.

Have questions? Just reply to this email.

— The CampaignSites Team

---
CampaignSites.net
Unsubscribe: ${data.unsubscribeUrl || 'https://campaignsites.net/api/v1/unsubscribe'}
Manage Preferences: ${data.preferencesUrl || 'https://campaignsites.net/preferences'}
  `.trim()
}
