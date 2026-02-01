# API Documentation

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
- [Webhooks](#webhooks)
- [Versioning](#versioning)

## Overview

CampaignSites.net provides a RESTful API for newsletter subscriptions, contact forms, analytics tracking, and content interactions.

### Base URL

```
Production: https://campaignsites.net/api
Development: http://localhost:3000/api
```

### Content Type

All requests and responses use `application/json` unless otherwise specified.

### CSRF Protection

All state-changing requests (POST, PUT, DELETE, PATCH) require a CSRF token in the `X-CSRF-Token` header.

```javascript
// Get CSRF token from cookie
const csrfToken = document.cookie
  .split('; ')
  .find(row => row.startsWith('csrf-token='))
  ?.split('=')[1]

// Include in request
fetch('/api/subscribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify(data)
})
```

## Authentication

### Public Endpoints

Most API endpoints are public and do not require authentication:
- `/api/subscribe` - Newsletter subscription
- `/api/contact` - Contact form
- `/api/submit` - Case study submission
- `/api/upvote` - Content upvoting
- `/api/track` - Analytics tracking
- `/api/health` - Health check

### Admin Endpoints

Admin endpoints require authentication via Payload CMS session:
- `/api/v1/admin/*` - Administrative operations

## Rate Limiting

All endpoints are rate-limited to prevent abuse. Rate limit information is included in response headers.

### Rate Limit Headers

```
X-RateLimit-Limit: 10          # Maximum requests allowed
X-RateLimit-Remaining: 7       # Requests remaining in window
X-RateLimit-Reset: 1706825400  # Unix timestamp when limit resets
```

### Rate Limits by Endpoint

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/subscribe` | 5 requests | 1 hour |
| `/api/contact` | 3 requests | 1 hour |
| `/api/submit` | 5 requests | 1 hour |
| `/api/track` | 100 requests | 1 minute |
| `/api/upvote` | 10 requests | 1 hour |
| Server Actions (AI) | 10 requests | 1 hour |

### Rate Limit Response

When rate limit is exceeded:

```json
{
  "error": "Too many requests. Please try again later."
}
```

**Status Code**: `429 Too Many Requests`

## Error Handling

### Error Response Format

```json
{
  "ok": false,
  "error": "Error message describing what went wrong",
  "statusCode": 400
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 400 | Bad Request | Invalid input or validation error |
| 403 | Forbidden | CSRF token invalid or missing |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error occurred |

### Common Error Messages

```json
// Validation Error
{
  "ok": false,
  "error": "Invalid email address"
}

// CSRF Error
{
  "ok": false,
  "error": "Invalid or missing CSRF token"
}

// Rate Limit Error
{
  "ok": false,
  "error": "Too many subscription attempts. Please try again later."
}
```

## Endpoints

### Newsletter Subscription

Subscribe to the newsletter and receive a lead magnet.

**Endpoint**: `POST /api/subscribe`

**Request Body**:

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "leadMagnet": "landing-page-checklist",
  "source": "homepage"
}
```

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Valid email address |
| `name` | string | No | Subscriber's name |
| `leadMagnet` | string | No | Lead magnet ID (default: `landing-page-checklist`) |
| `source` | string | No | Signup source (default: `site`) |

**Lead Magnet Options**:
- `landing-page-checklist` - Landing Page Launch Checklist
- `utm-naming-guide` - UTM Naming Convention Guide
- `cta-swipe-file` - High-Intent CTA Swipe File

**Success Response**:

```json
{
  "ok": true,
  "message": "You are subscribed. Check your inbox for the download link."
}
```

**Status Code**: `200 OK`

**Error Responses**:

```json
// Invalid email
{
  "ok": false,
  "error": "Invalid email address"
}

// Rate limit exceeded
{
  "ok": false,
  "error": "Too many subscription attempts. Please try again later."
}
```

**Example**:

```javascript
const response = await fetch('/api/subscribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe',
    leadMagnet: 'landing-page-checklist',
    source: 'homepage'
  })
})

const data = await response.json()
if (data.ok) {
  console.log('Subscribed successfully!')
}
```

---

### Contact Form

Submit a contact form message.

**Endpoint**: `POST /api/contact`

**Request Body**:

```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "topic": "General Inquiry",
  "message": "I have a question about your tools."
}
```

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Sender's name (2-100 chars) |
| `email` | string | Yes | Valid email address |
| `topic` | string | No | Message topic |
| `message` | string | Yes | Message content (10-2000 chars) |

**Success Response**:

```json
{
  "ok": true,
  "message": "Message sent successfully"
}
```

**Status Code**: `200 OK`

**Example**:

```javascript
const response = await fetch('/api/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'user@example.com',
    topic: 'General Inquiry',
    message: 'I have a question about your tools.'
  })
})
```

---

### Case Study Submission

Submit a case study for review.

**Endpoint**: `POST /api/submit`

**Request Body**:

```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "brand": "Acme Corp",
  "category": "E-commerce",
  "url": "https://example.com/case-study",
  "summary": "How we increased conversions by 150%",
  "metrics": "{\"conversion_rate\": \"150%\", \"revenue\": \"$50k\"}",
  "tools": "[\"Google Ads\", \"Unbounce\", \"Hotjar\"]"
}
```

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Submitter's name |
| `email` | string | Yes | Valid email address |
| `brand` | string | Yes | Brand/company name |
| `category` | string | No | Industry category |
| `url` | string | No | Case study URL |
| `summary` | string | No | Brief summary |
| `metrics` | string | No | JSON string of metrics |
| `tools` | string | No | JSON array of tools used |

**Success Response**:

```json
{
  "ok": true,
  "message": "Case study submitted successfully"
}
```

**Status Code**: `200 OK`

---

### Content Upvote

Upvote a piece of content (post, case study, or tool).

**Endpoint**: `POST /api/upvote`

**Request Body**:

```json
{
  "contentType": "post",
  "slug": "how-to-optimize-landing-pages"
}
```

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `contentType` | string | Yes | Type: `post`, `case_study`, or `tool` |
| `slug` | string | Yes | Content slug |

**Success Response**:

```json
{
  "ok": true,
  "upvotes": 42
}
```

**Status Code**: `200 OK`

**Note**: One upvote per IP address per content item.

---

### Analytics Tracking

Track analytics events (page views, tool usage, etc.).

**Endpoint**: `POST /api/track`

**Request Body**:

```json
{
  "eventType": "tool_use",
  "toolSlug": "utm-builder",
  "context": "generated_utm",
  "url": "https://campaignsites.net/tools/utm-builder",
  "utm": {
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "summer-sale"
  },
  "metadata": {
    "custom_field": "value"
  }
}
```

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `eventType` | string | Yes | Event type (e.g., `page_view`, `tool_use`) |
| `toolSlug` | string | No | Tool identifier |
| `context` | string | No | Event context |
| `url` | string | No | Page URL |
| `utm` | object | No | UTM parameters |
| `metadata` | object | No | Additional metadata |

**Success Response**:

```json
{
  "ok": true
}
```

**Status Code**: `200 OK`

---

### Health Check

Check API health status.

**Endpoint**: `GET /api/health`

**Response**:

```json
{
  "status": "healthy",
  "timestamp": "2026-02-01T12:00:00.000Z",
  "version": "0.1.0",
  "services": {
    "database": "connected",
    "storage": "connected"
  }
}
```

**Status Code**: `200 OK`

---

### Web Vitals Reporting

Report Core Web Vitals metrics.

**Endpoint**: `POST /api/vitals`

**Request Body**:

```json
{
  "name": "CLS",
  "value": 0.05,
  "rating": "good",
  "id": "v3-1706825400000-1234567890",
  "navigationType": "navigate"
}
```

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Metric name (CLS, FID, LCP, FCP, TTFB, INP) |
| `value` | number | Yes | Metric value |
| `rating` | string | Yes | Rating: `good`, `needs-improvement`, `poor` |
| `id` | string | Yes | Unique metric ID |
| `navigationType` | string | No | Navigation type |

**Success Response**:

```json
{
  "ok": true
}
```

**Status Code**: `200 OK`

---

### Error Logging

Log client-side errors.

**Endpoint**: `POST /api/errors`

**Request Body**:

```json
{
  "message": "TypeError: Cannot read property 'x' of undefined",
  "stack": "Error: ...\n    at Component ...",
  "url": "https://campaignsites.net/tools/utm-builder",
  "userAgent": "Mozilla/5.0 ..."
}
```

**Success Response**:

```json
{
  "ok": true
}
```

**Status Code**: `200 OK`

---

## Versioned API (v1)

### Unsubscribe

Unsubscribe from newsletter.

**Endpoint**: `POST /api/v1/unsubscribe`

**Request Body**:

```json
{
  "email": "user@example.com",
  "token": "unsubscribe-token-here",
  "reason": "too_frequent",
  "feedback": "I receive too many emails"
}
```

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Email address |
| `token` | string | Yes | Unsubscribe token |
| `reason` | string | No | Unsubscribe reason |
| `feedback` | string | No | Additional feedback |

**Success Response**:

```json
{
  "ok": true,
  "message": "You have been unsubscribed"
}
```

---

### Email Preferences

Update email preferences.

**Endpoint**: `POST /api/v1/preferences`

**Request Body**:

```json
{
  "email": "user@example.com",
  "token": "preferences-token-here",
  "preferences": {
    "newsletter": true,
    "product_updates": false,
    "marketing": false
  }
}
```

**Success Response**:

```json
{
  "ok": true,
  "message": "Preferences updated"
}
```

---

### Email Open Tracking

Track email opens (pixel tracking).

**Endpoint**: `GET /api/v1/email/track/open?id={tracking_id}`

**Response**: 1x1 transparent GIF

---

### Email Click Tracking

Track email link clicks.

**Endpoint**: `GET /api/v1/email/track/click?id={tracking_id}&url={destination_url}`

**Response**: Redirect to destination URL

---

### Email Analytics

Get email campaign analytics.

**Endpoint**: `GET /api/v1/email/analytics?campaign={campaign_id}`

**Response**:

```json
{
  "ok": true,
  "data": {
    "sent": 1000,
    "opened": 350,
    "clicked": 120,
    "openRate": 0.35,
    "clickRate": 0.12
  }
}
```

---

## Webhooks

### Resend Webhooks

Handle email delivery events from Resend.

**Endpoint**: `POST /api/v1/webhooks`

**Request Body** (from Resend):

```json
{
  "type": "email.delivered",
  "created_at": "2026-02-01T12:00:00.000Z",
  "data": {
    "email_id": "abc123",
    "to": "user@example.com",
    "subject": "Welcome to CampaignSites"
  }
}
```

**Event Types**:
- `email.sent` - Email sent successfully
- `email.delivered` - Email delivered to recipient
- `email.bounced` - Email bounced
- `email.complained` - Spam complaint received
- `email.opened` - Email opened (if tracking enabled)
- `email.clicked` - Link clicked (if tracking enabled)

---

## Server Actions

Server Actions are type-safe RPC-style endpoints for client-server communication.

### AI Lab (Headline Generation)

**Action**: `generateHeadlines`

**Location**: `src/app/actions/ai-lab.ts`

**Usage**:

```typescript
import { generateHeadlines } from '@/app/actions/ai-lab'

const result = await generateHeadlines({
  topic: 'Landing Page Optimization',
  tone: 'professional',
  count: 5
})
```

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | string | Yes | Headline topic |
| `tone` | string | Yes | Tone: `professional`, `casual`, `urgent` |
| `count` | number | No | Number of headlines (default: 5) |

**Response**:

```typescript
{
  ok: true,
  headlines: [
    "10 Proven Strategies to Optimize Your Landing Pages",
    "The Ultimate Guide to Landing Page Conversion",
    // ...
  ]
}
```

---

### Copy Analyzer

**Action**: `analyzeCopy`

**Location**: `src/app/actions/analyze-copy.ts`

**Usage**:

```typescript
import { analyzeCopy } from '@/app/actions/analyze-copy'

const result = await analyzeCopy({
  copy: "Buy now and save 50%!",
  type: "cta"
})
```

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `copy` | string | Yes | Copy to analyze |
| `type` | string | Yes | Type: `headline`, `cta`, `body` |

**Response**:

```typescript
{
  ok: true,
  score: 85,
  suggestions: [
    "Add urgency with a deadline",
    "Include social proof"
  ],
  variants: [
    "Save 50% Today - Limited Time Offer!",
    "Join 10,000+ Happy Customers - Save 50%"
  ]
}
```

---

### Global Search

**Action**: `searchContent`

**Location**: `src/app/actions/search.ts`

**Usage**:

```typescript
import { searchContent } from '@/app/actions/search'

const results = await searchContent({
  query: "utm tracking",
  limit: 10
})
```

**Response**:

```typescript
{
  ok: true,
  results: [
    {
      type: "post",
      title: "Complete Guide to UTM Tracking",
      slug: "utm-tracking-guide",
      excerpt: "Learn how to track your campaigns...",
      score: 0.95
    }
    // ...
  ]
}
```

---

## Best Practices

### Error Handling

Always check the `ok` field in responses:

```javascript
const response = await fetch('/api/subscribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify(data)
})

const result = await response.json()

if (result.ok) {
  // Success
  console.log(result.message)
} else {
  // Error
  console.error(result.error)
}
```

### Rate Limit Handling

Check rate limit headers and implement backoff:

```javascript
const response = await fetch('/api/subscribe', options)

const remaining = response.headers.get('X-RateLimit-Remaining')
const reset = response.headers.get('X-RateLimit-Reset')

if (response.status === 429) {
  const resetDate = new Date(parseInt(reset) * 1000)
  console.log(`Rate limited. Try again at ${resetDate}`)
}
```

### CSRF Token Management

Get CSRF token on page load:

```javascript
// Get token from cookie
function getCsrfToken() {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('csrf-token='))
    ?.split('=')[1]
}

// Use in all state-changing requests
const csrfToken = getCsrfToken()
```

### Retry Logic

Implement exponential backoff for failed requests:

```javascript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options)
      if (response.ok) return response

      if (response.status === 429) {
        // Rate limited - wait and retry
        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, i) * 1000)
        )
        continue
      }

      return response
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, i) * 1000)
      )
    }
  }
}
```

## Versioning

The API uses URL-based versioning for breaking changes:

- **Current**: `/api/*` (unversioned, stable)
- **v1**: `/api/v1/*` (versioned endpoints)

Breaking changes will be introduced in new versions (v2, v3, etc.) while maintaining backward compatibility for at least 6 months.

## Support

For API support:
- Documentation: This file
- Issues: GitHub Issues
- Email: hello@campaignsites.net
