# Backend P1 Enhancements - API Documentation

## Overview
This document describes the P1 backend enhancements implemented for CampaignSites.net, including API versioning, validation, webhooks, background jobs, email analytics, and database optimizations.

---

## API Versioning

All new API endpoints are versioned under `/api/v1/`. Legacy endpoints remain at `/api/` for backward compatibility.

### Versioned Endpoints

#### Unsubscribe
- **POST/GET** `/api/v1/unsubscribe`
- Handles email unsubscribe requests (RFC 8058 compliant)
- Supports one-click unsubscribe

**Request (POST):**
```json
{
  "email": "user@example.com",
  "token": "secure-token",
  "reason": "too-frequent",
  "feedback": "Optional feedback text"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "You have been unsubscribed successfully."
}
```

#### Preferences
- **GET** `/api/v1/preferences?email=user@example.com&token=token`
- **POST** `/api/v1/preferences`

**Get Preferences Response:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "status": "active",
  "preferences": {
    "weeklyDigest": true,
    "toolTips": true,
    "caseStudies": true,
    "productUpdates": false
  }
}
```

**Update Preferences Request:**
```json
{
  "email": "user@example.com",
  "token": "secure-token",
  "preferences": {
    "weeklyDigest": false,
    "toolTips": true
  }
}
```

#### Webhooks
- **POST** `/api/v1/webhooks`
- Receives Payload CMS content update notifications
- Invalidates cache automatically

**Request:**
```json
{
  "event": "update",
  "collection": "posts",
  "doc": {
    "id": "123",
    "slug": "post-slug"
  },
  "secret": "webhook-secret"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Cache invalidated for posts",
  "event": "update",
  "collection": "posts",
  "docId": "123"
}
```

#### Email Analytics
- **GET** `/api/v1/email/analytics?emailId=xxx&type=email`
- Requires admin authentication

**Query Parameters:**
- `emailId` - Email campaign ID
- `subscriberEmail` - Subscriber email address
- `type` - Analytics type: `email`, `subscriber`, or `links`

**Response:**
```json
{
  "analytics": {
    "emailId": "campaign-123",
    "sent": 1000,
    "delivered": 980,
    "opened": 450,
    "clicked": 120,
    "bounced": 20,
    "complained": 2,
    "openRate": 45.92,
    "clickRate": 12.24,
    "bounceRate": 2.0
  },
  "topLinks": [
    { "url": "https://example.com/cta", "clicks": 85 },
    { "url": "https://example.com/blog", "clicks": 35 }
  ]
}
```

#### Email Tracking
- **GET** `/api/v1/email/track/open?id=xxx&token=xxx`
- Returns 1x1 transparent pixel for open tracking

- **GET** `/api/v1/email/track/click?id=xxx&token=xxx&url=xxx`
- Tracks click and redirects to target URL

#### Background Jobs
- **GET/POST** `/api/v1/cron/jobs`
- Processes pending background jobs
- Requires cron secret authentication

**Response:**
```json
{
  "ok": true,
  "processed": 25,
  "succeeded": 23,
  "failed": 2,
  "timestamp": "2026-02-01T12:00:00.000Z"
}
```

#### Database Optimization
- **GET/POST** `/api/v1/admin/db-optimize?action=stats`
- Requires admin authentication

**Actions:**
- `stats` - Get database statistics
- `indexes` - Add performance indexes
- `vacuum` - Vacuum and analyze database

**Stats Response:**
```json
{
  "ok": true,
  "stats": {
    "tables": [
      { "name": "analytics_events", "rows": 15234 },
      { "name": "newsletter_subscribers", "rows": 5432 }
    ],
    "totalSize": 0
  }
}
```

---

## Request Validation

All API routes and Server Actions now use Zod for comprehensive validation.

### Validation Features
- Type-safe input validation
- Sanitization of user input
- XSS prevention
- SQL injection prevention
- Helpful error messages

### Example Validation Schemas

**Subscribe Schema:**
```typescript
{
  email: z.string().email(),
  name: z.string().max(100).optional(),
  leadMagnet: z.enum(['landing-page-checklist', 'utm-naming-guide', 'cta-swipe-file']).optional(),
  source: z.string().max(50).optional()
}
```

**Contact Schema:**
```typescript
{
  name: z.string().min(1).max(100),
  email: z.string().email(),
  topic: z.string().max(200).optional(),
  message: z.string().min(1).max(5000)
}
```

---

## Email System

### Unsubscribe Flow
1. All emails include RFC 8058 compliant unsubscribe headers
2. One-click unsubscribe via `List-Unsubscribe` header
3. Preference center for granular control
4. Secure token-based authentication

### Email Templates

#### Welcome Email
- Sent immediately on subscription
- Includes lead magnet download link
- Sets expectations for future emails

#### Lead Magnet Delivery
- Dedicated template for resource delivery
- Clear download CTA
- Next steps guidance

#### Tool Tips Drip Campaign
- 5-email series per tool
- Practical, actionable tips
- Scheduled delivery over time

**Available Tool Tip Series:**
- UTM Builder (3 tips)
- Countdown Timer (2 tips)
- Budget Calculator (1 tip)
- Copy Optimizer (1 tip)
- AI Lab (1 tip)

### Email Analytics

**Tracked Events:**
- `sent` - Email sent to provider
- `delivered` - Successfully delivered
- `opened` - Email opened (pixel tracking)
- `clicked` - Link clicked
- `bounced` - Delivery failed
- `complained` - Marked as spam

**Features:**
- Pixel-based open tracking
- Click tracking with redirects
- Per-email analytics
- Per-subscriber history
- Top clicked links report

---

## Background Jobs

### Job Queue System
- Persistent job storage in D1
- Automatic retry with exponential backoff
- Job priority support
- Comprehensive logging

### Job Types
1. **Email** - Send transactional emails
2. **Analytics** - Aggregate analytics data
3. **Cache Invalidation** - Clear stale cache
4. **Data Export** - Generate CSV/JSON exports
5. **Webhook** - Deliver webhook notifications

### Job Processing
```typescript
// Queue a job
await queueJob('email', {
  to: 'user@example.com',
  subject: 'Welcome',
  html: '<p>Welcome!</p>'
}, {
  priority: 1,
  maxAttempts: 3,
  scheduledAt: new Date()
})

// Process jobs (called by cron)
await processJobs(processJob, { limit: 50 })
```

### Cron Configuration
Add to `wrangler.toml`:
```toml
[triggers]
crons = ["*/5 * * * *"]  # Every 5 minutes
```

---

## Database Optimizations

### Indexes Added
- Analytics events: `event_type`, `tool_slug`, `created_at`
- Newsletter subscribers: `status`, `lead_magnet`, `created_at`
- Email queue: `status + scheduled_at`, `template_id + status`
- Job queue: `status + scheduled_at`, `type + status`
- Upvotes: `content_type + slug`, `created_at`

### Query Optimizations
- React cache for Payload queries
- Selective field fetching
- Relationship depth control
- Batch fetching to avoid N+1 queries
- Related content prefetching

### Usage Example
```typescript
// Optimized post query
const posts = await getCachedPosts(payload, {
  limit: 10,
  page: 1,
  where: { category: { equals: 'How-to Guide' } }
})

// Optimized single post with related content
const post = await getCachedPost(payload, 'post-slug')
const related = await getRelatedPosts(payload, 'post-slug', post.tags, 3)
```

---

## Webhook Integration

### Payload CMS Hooks
Add to collection configs:
```typescript
hooks: {
  afterChange: [
    async ({ doc, operation }) => {
      await fetch('https://campaignsites.net/api/v1/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: operation,
          collection: 'posts',
          doc: { id: doc.id, slug: doc.slug },
          secret: process.env.WEBHOOK_SECRET
        })
      })
    }
  ]
}
```

### Cache Invalidation
Webhooks automatically invalidate:
- Collection tags
- Index pages
- Detail pages

---

## Security Features

### Rate Limiting
All endpoints include rate limiting:
- Subscribe: 5 requests/hour
- Contact: 3 requests/hour
- Track: 100 requests/minute
- Upvote: 10 requests/minute
- Submit: 3 requests/day

### Authentication
- Webhook secret verification
- Admin endpoints require bearer token
- Cron endpoints require secret
- Unsubscribe token validation

### Input Sanitization
- HTML tag removal
- Script injection prevention
- SQL injection prevention
- XSS protection

---

## Environment Variables

Required environment variables:
```bash
# Core
PAYLOAD_SECRET=xxx
NEXT_PUBLIC_SITE_URL=https://campaignsites.net

# Email
RESEND_API_KEY=xxx
RESEND_FROM="CampaignSites <hello@campaignsites.net>"

# Optional
WEBHOOK_SECRET=xxx
ADMIN_SECRET=xxx
CRON_SECRET=xxx
SLACK_WEBHOOK_URL=xxx
CONTACT_TO=hello@campaignsites.net
```

---

## Testing

### Manual Testing

**Test Unsubscribe:**
```bash
curl -X POST https://campaignsites.net/api/v1/unsubscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","token":"xxx","reason":"too-frequent"}'
```

**Test Webhook:**
```bash
curl -X POST https://campaignsites.net/api/v1/webhooks \
  -H "Content-Type: application/json" \
  -d '{"event":"update","collection":"posts","doc":{"id":"1","slug":"test"},"secret":"xxx"}'
```

**Test Job Processing:**
```bash
curl -X POST https://campaignsites.net/api/v1/cron/jobs \
  -H "Authorization: Bearer xxx"
```

**Test Database Optimization:**
```bash
curl -X GET "https://campaignsites.net/api/v1/admin/db-optimize?action=stats" \
  -H "Authorization: Bearer xxx"
```

---

## Performance Metrics

### Expected Improvements
- **Query Performance:** 40-60% faster with indexes
- **Cache Hit Rate:** 80%+ for repeated queries
- **Email Delivery:** 99%+ success rate
- **Job Processing:** <1s per job average

### Monitoring
All endpoints wrapped with `withMonitoring()` for:
- Error tracking
- Performance metrics
- Request logging

---

## Migration Guide

### Existing Endpoints
Legacy endpoints remain functional:
- `/api/subscribe` → Use `/api/v1/unsubscribe` for unsubscribe
- `/api/contact` → No changes needed
- `/api/track` → No changes needed
- `/api/upvote` → No changes needed

### Database Migration
Run once to add indexes:
```bash
curl -X POST "https://campaignsites.net/api/v1/admin/db-optimize?action=indexes" \
  -H "Authorization: Bearer xxx"
```

### Email Template Updates
Update existing email sends to include unsubscribe links:
```typescript
const unsubscribeUrl = await generateUnsubscribeLink(email)
const preferencesUrl = await generatePreferencesLink(email)
const listUnsubscribe = await generateListUnsubscribeHeader(email)
```

---

## Support

For issues or questions:
- Check logs in Cloudflare dashboard
- Review error tracking in monitoring
- Test endpoints with provided curl commands
- Verify environment variables are set

---

**Last Updated:** 2026-02-01
**Version:** 1.0.0
