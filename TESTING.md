# Testing Documentation

## Overview

CampaignSites.net has comprehensive testing infrastructure covering unit tests, integration tests, E2E tests, visual regression tests, performance tests, and security tests.

## Test Structure

```
tests/
├── actions/           # Server action tests
├── api/              # API route tests
├── components/       # Component tests
├── integration/      # Integration tests
├── lib/              # Utility function tests
└── security/         # Security tests

e2e/                  # End-to-end tests
├── blog.spec.ts
├── budget-calc.spec.ts
├── case-studies.spec.ts
├── copy-optimizer.spec.ts
├── countdown.spec.ts
├── newsletter.spec.ts
├── search.spec.ts
├── utm-builder.spec.ts
└── visual-regression.spec.ts

src/
├── app/api/__tests__/     # API route co-located tests
├── components/__tests__/  # Component co-located tests
└── lib/__tests__/         # Library co-located tests
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

### E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Debug E2E tests
pnpm test:e2e:debug

# Run specific test file
npx playwright test e2e/utm-builder.spec.ts
```

### Integration Tests

```bash
# Run integration tests
pnpm test:integration
```

### Security Tests

```bash
# Run security tests
pnpm test:security
```

### Performance Tests

```bash
# Run Lighthouse CI
pnpm lighthouse
```

## Coverage Requirements

Current coverage thresholds (defined in `vitest.config.ts`):

- **Overall**: 25% (statements, branches, functions, lines)
- **High-priority files**: 80-100% coverage
  - `src/lib/budget.ts`: 100%
  - `src/lib/utm.ts`: 80%
  - `src/lib/richtext.ts`: 90%
  - `src/lib/validation.ts`: 90%
  - `src/lib/sanitization.ts`: 90%
  - `src/lib/rate-limit.ts`: 80%

## Test Types

### 1. Unit Tests

Test individual functions and components in isolation.

**Location**: `tests/` and `src/**/__tests__/`

**Example**:
```typescript
import { describe, it, expect } from 'vitest'
import { calculateReadingTime } from '@/lib/reading-time'

describe('calculateReadingTime', () => {
  it('calculates reading time correctly', () => {
    const text = 'word '.repeat(200)
    const time = calculateReadingTime(text)
    expect(time).toBe(1)
  })
})
```

### 2. Integration Tests

Test interactions between multiple components or external services.

**Location**: `tests/integration/`

**Example**:
```typescript
import { describe, it, expect } from 'vitest'
import { getPayload } from 'payload'

describe('Payload CMS Integration', () => {
  it('fetches posts from Payload', async () => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'posts',
      limit: 10,
    })
    expect(result.docs).toBeDefined()
  })
})
```

### 3. E2E Tests

Test complete user flows from start to finish.

**Location**: `e2e/`

**Example**:
```typescript
import { test, expect } from '@playwright/test'

test('should generate UTM parameters', async ({ page }) => {
  await page.goto('/tools/utm-builder')
  await page.fill('input[name="url"]', 'https://example.com')
  await page.fill('input[name="source"]', 'facebook')
  await page.fill('input[name="medium"]', 'social')

  const generatedUrl = page.locator('text=/utm_source=facebook/i')
  await expect(generatedUrl).toBeVisible()
})
```

### 4. Visual Regression Tests

Test visual appearance of pages across different viewports.

**Location**: `e2e/visual-regression.spec.ts`

**Example**:
```typescript
test('homepage desktop view', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveScreenshot('homepage-desktop.png', {
    fullPage: true,
    maxDiffPixels: 100,
  })
})
```

### 5. Security Tests

Test security measures like input validation, rate limiting, and CSRF protection.

**Location**: `tests/security/`

**Example**:
```typescript
it('blocks SQL injection attempts', async () => {
  const request = createRequest({
    email: "test@example.com'; DROP TABLE users; --",
  })
  const response = await POST(request)
  expect(response.status).toBe(400)
})
```

### 6. Performance Tests

Test Core Web Vitals and performance metrics using Lighthouse CI.

**Configuration**: `lighthouserc.json`

**Thresholds**:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 95+
- FCP: < 2000ms
- LCP: < 2500ms
- CLS: < 0.1
- TBT: < 300ms

## CI/CD Integration

Tests run automatically on every push and pull request via GitHub Actions.

### CI Pipeline

1. **Test & Lint** - Runs unit tests, linting, and type checking
2. **E2E Tests** - Runs Playwright E2E tests
3. **Build Verification** - Verifies production build
4. **Security Audit** - Runs security tests and dependency audit

### Coverage Reports

Coverage reports are uploaded as artifacts and can be viewed in the GitHub Actions UI.

## Writing Tests

### Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what the code does, not how it does it
   - Test user-facing behavior

2. **Use Descriptive Test Names**
   ```typescript
   // Good
   it('returns 400 for invalid email format', () => {})

   // Bad
   it('test email validation', () => {})
   ```

3. **Arrange-Act-Assert Pattern**
   ```typescript
   it('calculates total correctly', () => {
     // Arrange
     const items = [10, 20, 30]

     // Act
     const total = calculateTotal(items)

     // Assert
     expect(total).toBe(60)
   })
   ```

4. **Mock External Dependencies**
   ```typescript
   vi.mock('openai', () => ({
     default: vi.fn().mockImplementation(() => ({
       chat: { completions: { create: vi.fn() } }
     }))
   }))
   ```

5. **Clean Up After Tests**
   ```typescript
   afterEach(() => {
     vi.clearAllMocks()
     delete process.env.TEST_VAR
   })
   ```

### Common Patterns

#### Testing API Routes

```typescript
const createRequest = (body: Record<string, unknown>) => {
  return new Request('https://example.com/api/endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

it('handles valid request', async () => {
  const request = createRequest({ email: 'test@example.com' })
  const response = await POST(request)
  expect(response.status).toBe(200)
})
```

#### Testing Server Actions

```typescript
it('validates input', async () => {
  await expect(
    serverAction({ invalid: 'data' })
  ).rejects.toThrow('Invalid input')
})
```

#### Testing Components

```typescript
import { render, screen } from '@testing-library/react'

it('renders button with text', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByText('Click me')).toBeInTheDocument()
})
```

## Debugging Tests

### Unit Tests

```bash
# Run specific test file
pnpm test tests/lib/utm.test.ts

# Run tests matching pattern
pnpm test -- --grep "UTM"

# Run with debugger
node --inspect-brk node_modules/.bin/vitest
```

### E2E Tests

```bash
# Run in headed mode
npx playwright test --headed

# Run with debugger
npx playwright test --debug

# Run specific test
npx playwright test e2e/utm-builder.spec.ts

# Generate test code
npx playwright codegen http://localhost:3000
```

## Troubleshooting

### Common Issues

1. **Tests timing out**
   - Increase timeout in test or config
   - Check for unresolved promises
   - Verify mocks are properly configured

2. **Flaky tests**
   - Add proper wait conditions
   - Use `waitFor` instead of fixed delays
   - Check for race conditions

3. **Coverage not updating**
   - Clear coverage directory: `rm -rf coverage`
   - Ensure files are included in coverage config
   - Check file paths in `vitest.config.ts`

4. **E2E tests failing in CI**
   - Verify base URL is correct
   - Check for timing issues
   - Review CI logs for specific errors

## Continuous Improvement

### Adding New Tests

1. Create test file in appropriate directory
2. Follow naming convention: `*.test.ts` or `*.spec.ts`
3. Add to CI pipeline if needed
4. Update coverage thresholds if applicable

### Maintaining Tests

1. Keep tests up to date with code changes
2. Remove obsolete tests
3. Refactor duplicated test code
4. Monitor test execution time
5. Review and update coverage thresholds quarterly

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
