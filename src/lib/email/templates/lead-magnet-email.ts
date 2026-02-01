/**
 * Lead magnet delivery email template
 */

export interface LeadMagnetEmailData {
  name?: string
  leadMagnetTitle: string
  leadMagnetUrl: string
  leadMagnetDescription?: string
  unsubscribeUrl?: string
  preferencesUrl?: string
}

export const getLeadMagnetEmailSubject = (data: LeadMagnetEmailData): string => {
  return `Your ${data.leadMagnetTitle} is ready to download`
}

export const getLeadMagnetEmailHtml = (data: LeadMagnetEmailData): string => {
  const greeting = data.name ? `Hi ${data.name},` : 'Hi there,'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.leadMagnetTitle}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; padding: 24px 0; border-bottom: 1px solid #e5e7eb;">
    <h1 style="margin: 0; color: #0f172a; font-size: 28px; font-weight: 700;">CampaignSites.net</h1>
  </div>

  <div style="padding: 32px 0;">
    <p style="font-size: 18px; margin-bottom: 16px;">${greeting}</p>

    <p>Thanks for subscribing! Your ${data.leadMagnetTitle} is ready to download.</p>

    ${data.leadMagnetDescription ? `<p style="color: #6b7280;">${data.leadMagnetDescription}</p>` : ''}

    <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 24px; margin: 32px 0; text-align: center;">
      <h2 style="margin: 0 0 16px 0; color: #166534; font-size: 20px;">Download Your Resource</h2>
      <a href="${data.leadMagnetUrl}"
         style="display: inline-block; background: #16a34a; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Download Now
      </a>
    </div>

    <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 32px 0;">
      <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px;">What's next?</h3>
      <p style="margin: 0; color: #475569; font-size: 14px;">
        Over the next few days, I'll send you practical tips to help you get the most out of this resource.
        Each email is short, actionable, and designed to help you launch better campaigns.
      </p>
    </div>

    <p style="margin-top: 32px;">
      Questions? Just reply to this email.<br>
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

export const getLeadMagnetEmailText = (data: LeadMagnetEmailData): string => {
  const greeting = data.name ? `Hi ${data.name},` : 'Hi there,'

  return `
${greeting}

Thanks for subscribing! Your ${data.leadMagnetTitle} is ready to download.

${data.leadMagnetDescription || ''}

Download here: ${data.leadMagnetUrl}

What's next?
Over the next few days, I'll send you practical tips to help you get the most out of this resource. Each email is short, actionable, and designed to help you launch better campaigns.

Questions? Just reply to this email.

— The CampaignSites Team

---
CampaignSites.net
Unsubscribe: ${data.unsubscribeUrl || 'https://campaignsites.net/api/v1/unsubscribe'}
Manage Preferences: ${data.preferencesUrl || 'https://campaignsites.net/preferences'}
  `.trim()
}
