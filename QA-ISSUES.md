# QA Issues & Fixes

**Project:** CampaignSites.net
**Date:** February 1, 2026
**Total Issues:** 9
**Priority 1 (Blocking):** 0
**Priority 2 (High):** 3
**Priority 3 (Medium):** 4
**Priority 4 (Low):** 2

---

## Priority 2 (High) - Fix Before Production

### Issue #1: Rate Limiting Tests Failing
**File:** `/Volumes/SSD/dev/new/campaignsites.net/src/lib/__tests__/rate-limit.test.ts`
**Status:** FAILING
**Tests Affected:** 9/19 tests failing

**Failing Tests:**
- `checkRateLimit > increments count for subsequent requests`
- `checkRateLimit > blocks requests when limit exceeded`
- `checkRateLimit > resets count when window expires`
- `checkRateLimit > uses custom identifier in key`
- `checkRateLimit > falls back to in-memory storage when D1 fails`
- `checkRateLimit > returns correct resetAt timestamp`
- `ensureRateLimitTable > creates rate_limits table`
- `ensureRateLimitTable > creates index on reset_at`
- `ensureRateLimitTable > silently fails when D1 unavailable`

**Root Cause:**
1. Tests expect D1 database but implementation uses Cloudflare KV
2. Tests reference `ensureRateLimitTable()` function that doesn't exist in current implementation
3. Timing issues with async operations

**Current Implementation:**
```typescript
// src/lib/rate-limit.ts
- Uses Cloudflare KV (not D1)
- Falls back to in-memory storage
- No ensureRateLimitTable function
```

**Fix Required:**
```diff
// src/lib/__tests__/rate-limit.test.ts

- Mock D1 database
+ Mock Cloudflare KV namespace

- Test ensureRateLimitTable()
+ Remove tests for non-existent function

- Use synchronous timing
+ Add proper async/await and timing controls
```

**Estimated Time:** 2-3 hours
**Assigned To:** Backend Developer

---

### Issue #2: Security Tests Failing - Module Import Error
**File:** `/Volumes/SSD/dev/new/campaignsites.net/tests/security/security.test.ts`
**Status:** FAILING
**Tests Affected:** 15/15 tests failing

**Error Message:**
```
Cannot find module '@/lib/rate-limit'
Require stack:
- /Volumes/SSD/dev/new/campaignsites.net/tests/security/security.test.ts
```

**Root Cause:**
Test file imports from wrong path or module doesn't exist at expected location

**Current State:**
```typescript
// tests/security/security.test.ts
import { checkRateLimit } from '@/lib/rate-limit' // ✓ Correct path
```

**Actual File Location:**
```
/Volumes/SSD/dev/new/campaignsites.net/src/lib/rate-limit.ts ✓ EXISTS
```

**Fix Required:**
1. Check vitest path alias configuration
2. Verify module resolution in test environment
3. May need to update vitest.config.ts

```typescript
// vitest.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, 'src'), // ✓ Already correct
  },
}
```

**Likely Issue:** Test file needs to be run with proper environment setup

**Fix:**
```bash
# Ensure tests run with proper setup
pnpm test tests/security/security.test.ts
```

**Estimated Time:** 1 hour
**Assigned To:** QA Engineer

---

### Issue #3: AI Action Tests Failing - Rate Limiting
**File:** `/Volumes/SSD/dev/new/campaignsites.net/tests/actions/ai-lab.test.ts`
**Status:** FAILING
**Tests Affected:** 13/20 tests failing

**Failing Tests:**
- `generateCampaignNames > calls OpenAI when API key is set`
- `generateCampaignNames > sanitizes input to prevent prompt injection`
- `analyzeLandingPageStructure > analyzes structure without OpenAI key`
- `analyzeLandingPageStructure > validates required fields`
- `analyzeLandingPageStructure > validates maximum length for structure`
- `analyzeLandingPageStructure > calls OpenAI when API key is set`
- `analyzeLandingPageStructure > sanitizes input`
- And 6 more...

**Error Message:**
```
Rate limit exceeded. Please try again later. Resets at 7:43:23 PM
```

**Root Cause:**
Tests are hitting actual OpenAI API rate limits instead of using mocks

**Current Implementation:**
```typescript
// Tests call real OpenAI API
// No mocking in place
```

**Fix Required:**
```typescript
// tests/actions/ai-lab.test.ts

import { vi } from 'vitest'

// Mock OpenAI module
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'Mocked AI response'
              }
            }
          ]
        })
      }
    }
  }))
}))

// Then run tests
```

**Alternative Fix:**
```typescript
// Use environment variable to skip OpenAI tests
if (!process.env.OPENAI_API_KEY || process.env.CI) {
  test.skip('OpenAI integration tests')
}
```

**Estimated Time:** 2 hours
**Assigned To:** Backend Developer

---

## Priority 3 (Medium) - Fix This Sprint

### Issue #4: Export Tests Failing - JSDOM Limitation
**File:** `/Volumes/SSD/dev/new/campaignsites.net/src/lib/utils/__tests__/export.test.ts`
**Status:** FAILING
**Tests Affected:** 2/7 tests failing

**Failing Tests:**
- `exportToCSV > should generate CSV with headers and data`
- `exportToCSV > should escape commas in values`

**Error Message:**
```
TypeError: URL.createObjectURL is not a function
```

**Root Cause:**
JSDOM doesn't implement `URL.createObjectURL` which is a browser-only API

**Current Implementation:**
```typescript
// src/lib/utils/export.ts
export function exportToCSV(data: any[], filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob) // ❌ Fails in JSDOM
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.click()
}
```

**Fix Option 1: Mock the API**
```typescript
// tests/lib/utils/__tests__/export.test.ts
beforeEach(() => {
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  global.URL.revokeObjectURL = vi.fn()
})
```

**Fix Option 2: Test in Real Browser**
```typescript
// Move to E2E tests
// e2e/export.spec.ts
test('should export CSV', async ({ page }) => {
  // Test in real browser with Playwright
})
```

**Fix Option 3: Refactor for Testability**
```typescript
// src/lib/utils/export.ts
export function generateCSV(data: any[]): string {
  // Pure function - easy to test
  return csvContent
}

export function downloadCSV(csvContent: string, filename: string) {
  // Browser-specific - test in E2E
  const blob = new Blob([csvContent], { type: 'text/csv' })
  // ... download logic
}
```

**Recommended:** Option 3 (Refactor)

**Estimated Time:** 2 hours
**Assigned To:** Frontend Developer

---

### Issue #5: Missing Integration Tests
**File:** `/Volumes/SSD/dev/new/campaignsites.net/tests/integration/external-services.test.ts`
**Status:** EMPTY
**Tests Affected:** 0 tests (should have ~20)

**Current State:**
```typescript
// tests/integration/external-services.test.ts
// Empty file or minimal skeleton
```

**Required Tests:**
1. Payload CMS Integration
   - Create document
   - Read document
   - Update document
   - Delete document
   - Query with filters

2. OpenAI API Integration
   - Generate campaign names
   - Analyze landing page
   - Error handling
   - Rate limiting

3. Resend Email Integration
   - Send welcome email
   - Send notification email
   - Handle failures
   - Verify delivery

4. Cloudflare KV Integration
   - Set value
   - Get value
   - Delete value
   - Expiration

5. Cloudflare Queues Integration
   - Enqueue message
   - Process message
   - Handle failures
   - Retry logic

**Implementation:**
```typescript
// tests/integration/external-services.test.ts
import { describe, it, expect, beforeAll } from 'vitest'

describe('External Services Integration', () => {
  describe('Payload CMS', () => {
    it('should create and retrieve a document', async () => {
      // Test implementation
    })
  })

  describe('OpenAI API', () => {
    it('should generate campaign names', async () => {
      // Test implementation
    })
  })

  // ... more tests
})
```

**Estimated Time:** 8 hours
**Assigned To:** Backend Developer

---

### Issue #6: Lighthouse Configuration Missing
**File:** `/Volumes/SSD/dev/new/campaignsites.net/.lighthouserc.js`
**Status:** MISSING
**Impact:** Cannot run automated performance tests

**Current State:**
```bash
# package.json has script
"lighthouse": "lhci autorun"

# But no configuration file
```

**Required Configuration:**
```javascript
// .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/tools',
        'http://localhost:3000/tools/utm-builder',
        'http://localhost:3000/tools/budget-calc',
        'http://localhost:3000/tools/countdown',
        'http://localhost:3000/tools/copy-optimizer',
        'http://localhost:3000/blog',
        'http://localhost:3000/gallery',
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
      },
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
```

**Estimated Time:** 1 hour
**Assigned To:** DevOps/QA

---

### Issue #7: API Error Tests Failing - Logging Issues
**File:** `/Volumes/SSD/dev/new/campaignsites.net/tests/api/errors.test.ts`
**Status:** FAILING
**Tests Affected:** 7/15 tests failing

**Error Message:**
```
Error: Logging failed
```

**Root Cause:**
Logger mock not properly configured in test environment

**Current Implementation:**
```typescript
// Tests expect logger to work
// But logger mock throws error
```

**Fix Required:**
```typescript
// tests/api/errors.test.ts

vi.mock('@/lib/monitoring/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}))

// Ensure mock is applied before imports
```

**Alternative:**
```typescript
// tests/setup.ts
// Add global logger mock
global.logger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
}
```

**Estimated Time:** 1 hour
**Assigned To:** Backend Developer

---

## Priority 4 (Low) - Fix When Convenient

### Issue #8: Contact API Test Failing - Sanitization Assertion
**File:** `/Volumes/SSD/dev/new/campaignsites.net/tests/api/contact.test.ts`
**Status:** FAILING
**Tests Affected:** 1/17 tests failing

**Failing Test:**
- `POST /api/contact > sanitizes HTML in message`

**Error Message:**
```
expected '\n            <div style="font-family…' to contain '&lt;'
```

**Root Cause:**
Test expects HTML entities but sanitization might be working differently

**Current Test:**
```typescript
it('sanitizes HTML in message', async () => {
  const response = await POST(
    new Request('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        message: '<script>alert("xss")</script>',
      }),
    })
  )

  const data = await response.json()
  expect(data.message).toContain('&lt;') // ❌ Fails
})
```

**Actual Behavior:**
Sanitization removes script tags entirely instead of encoding them

**Fix:**
```typescript
// Update test to match actual behavior
expect(data.message).not.toContain('<script>')
expect(data.message).not.toContain('alert')
```

**Estimated Time:** 30 minutes
**Assigned To:** Backend Developer

---

### Issue #9: Missing E2E Tests for New Tools
**Files:**
- `/Volumes/SSD/dev/new/campaignsites.net/e2e/ai-lab.spec.ts` (missing)
- `/Volumes/SSD/dev/new/campaignsites.net/e2e/meta-preview.spec.ts` (missing)

**Status:** NOT CREATED
**Impact:** Manual testing required for these tools

**Required Tests:**

**AI Lab E2E Tests:**
```typescript
// e2e/ai-lab.spec.ts
import { test, expect } from '@playwright/test'

test.describe('AI Lab Tool', () => {
  test('should load AI lab page', async ({ page }) => {
    await page.goto('/tools/ai-lab')
    await expect(page.locator('h1')).toContainText(/ai lab/i)
  })

  test('should generate campaign names', async ({ page }) => {
    await page.goto('/tools/ai-lab')
    await page.fill('input[name="product"]', 'Marketing Software')
    await page.click('button:has-text("Generate")')
    await expect(page.locator('.results')).toBeVisible({ timeout: 10000 })
  })

  test('should analyze landing page structure', async ({ page }) => {
    await page.goto('/tools/ai-lab')
    await page.fill('textarea[name="structure"]', 'Hero section, Features, CTA')
    await page.click('button:has-text("Analyze")')
    await expect(page.locator('.analysis')).toBeVisible({ timeout: 10000 })
  })
})
```

**Meta Preview E2E Tests:**
```typescript
// e2e/meta-preview.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Meta Preview Tool', () => {
  test('should load meta preview page', async ({ page }) => {
    await page.goto('/tools/meta-preview')
    await expect(page.locator('h1')).toContainText(/meta preview/i)
  })

  test('should preview meta tags', async ({ page }) => {
    await page.goto('/tools/meta-preview')
    await page.fill('input[name="title"]', 'Test Page Title')
    await page.fill('textarea[name="description"]', 'Test description')
    await expect(page.locator('.preview')).toBeVisible()
  })

  test('should show character count', async ({ page }) => {
    await page.goto('/tools/meta-preview')
    await page.fill('input[name="title"]', 'Test')
    await expect(page.locator('.char-count')).toContainText('4')
  })
})
```

**Estimated Time:** 3 hours
**Assigned To:** QA Engineer

---

## Summary by Priority

### Priority 2 (High) - 3 Issues
1. Rate Limiting Tests Failing - 2-3 hours
2. Security Tests Module Import - 1 hour
3. AI Action Tests Rate Limiting - 2 hours

**Total Time:** 5-6 hours

### Priority 3 (Medium) - 4 Issues
4. Export Tests JSDOM Limitation - 2 hours
5. Missing Integration Tests - 8 hours
6. Lighthouse Configuration Missing - 1 hour
7. API Error Tests Logging Issues - 1 hour

**Total Time:** 12 hours

### Priority 4 (Low) - 2 Issues
8. Contact API Test Sanitization - 30 minutes
9. Missing E2E Tests for New Tools - 3 hours

**Total Time:** 3.5 hours

---

## Total Estimated Fix Time: 20.5-21.5 hours

**Recommended Sprint Plan:**
- **Day 1-2:** Fix all Priority 2 issues (6 hours)
- **Day 3-4:** Fix Priority 3 issues (12 hours)
- **Day 5:** Fix Priority 4 issues (3.5 hours)

---

## Issue Tracking

| Issue | Priority | Status | Assigned | ETA |
|-------|----------|--------|----------|-----|
| #1 Rate Limiting Tests | P2 | Open | Backend | 2-3h |
| #2 Security Tests Import | P2 | Open | QA | 1h |
| #3 AI Action Tests | P2 | Open | Backend | 2h |
| #4 Export Tests | P3 | Open | Frontend | 2h |
| #5 Integration Tests | P3 | Open | Backend | 8h |
| #6 Lighthouse Config | P3 | Open | DevOps | 1h |
| #7 API Error Tests | P3 | Open | Backend | 1h |
| #8 Contact API Test | P4 | Open | Backend | 30m |
| #9 Missing E2E Tests | P4 | Open | QA | 3h |

---

**Document Version:** 1.0
**Last Updated:** February 1, 2026
**Next Review:** After fixes are implemented
