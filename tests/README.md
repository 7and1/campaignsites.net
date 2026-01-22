# Test Suite

This directory contains comprehensive tests for the campaignsites.net project.

## Test Structure

```
tests/
├── setup.ts           # Global test setup (jsdom, mocks)
├── mocks.ts           # Common mock utilities
├── lib/               # Unit tests for utility functions
│   ├── utm.test.ts
│   ├── budget.test.ts
│   ├── richtext.test.ts
│   ├── analytics.test.ts
│   ├── cloudflare.test.ts
│   ├── validation.test.ts
│   └── cn.test.ts
├── api/               # Integration tests for API routes
│   ├── track.test.ts
│   ├── comments.test.ts
│   ├── upvote.test.ts
│   └── submit.test.ts
├── components/        # Component tests
│   ├── ToolCard.test.tsx
│   ├── AffiliateCTA.test.tsx
│   └── ToolUsageTracker.test.tsx
└── actions/           # Server action tests
    └── analyze-copy.test.ts
```

## Running Tests

```bash
# Run all tests once
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# UI mode
pnpm test:ui
```

## Coverage Goals

- **Overall**: 50% statements, 50% functions, 50% lines
- **`src/lib/`**: 70% statements, 70% functions, 70% lines

Coverage excludes:
- `src/payload.config.ts`
- `src/collections/` (PayloadCMS collections)
- `src/app/(payload)/` (admin routes)
- Test files themselves
- Type definition files

## Testing the 4 Main Tools

### 1. UTM Builder (`/tools/utm-builder`)
- `tests/lib/utm.test.ts` - URL building, normalization, validation
- `tests/components/ToolCard.test.tsx` - Tool card rendering

### 2. Budget Calculator (`/tools/budget-calc`)
- `tests/lib/budget.test.ts` - Budget calculations, metrics

### 3. Copy Optimizer (`/tools/copy-optimizer`)
- `tests/actions/analyze-copy.test.ts` - AI copy analysis

### 4. Countdown Timer (`/tools/countdown`)
- (Added to tools index page testing)

## API Route Tests

- `POST /api/track` - Event tracking
- `GET/POST /api/comments` - Comment system
- `GET/POST /api/upvote` - Upvoting system
- `POST /api/submit` - Case study submissions

## Notes

- API route tests use simplified mocking due to complex dependencies
- Component tests focus on rendering behavior, not internal effects
- Utility functions have comprehensive edge case coverage
