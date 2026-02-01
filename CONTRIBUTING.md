# Contributing Guide

Thank you for your interest in contributing to CampaignSites.net! This document provides guidelines and workflows for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Code Review](#code-review)

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Respect differing viewpoints

## Development Setup

### Prerequisites

- Node.js 18.20.2+ or 20.9.0+
- pnpm 9+ or 10+
- Git

### Initial Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/campaignsites.net.git
cd campaignsites.net

# Install dependencies
pnpm install

# Set up environment
cp .env.example .dev.vars

# Generate secrets and add to .dev.vars
openssl rand -hex 32  # PAYLOAD_SECRET
openssl rand -hex 16  # IP_HASH_SALT

# Generate types
pnpm run generate:types
pnpm run generate:importmap

# Start development
pnpm dev
```

## Development Workflow

### Branch Naming

Format: `type/description`

Types:
- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `test/` - Tests
- `refactor/` - Code refactoring
- `chore/` - Maintenance

Examples:
```
feat/ai-copy-optimizer
fix/rate-limit-calculation
docs/deployment-guide
test/api-subscribe-route
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting (no code change)
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance tasks

Examples:
```
feat(tools): add countdown timer widget

fix(api): handle null email in subscribe route

docs(readme): update deployment instructions

test(lib): add validation unit tests

refactor(components): simplify Button props
```

### Writing Good Commits

1. **Subject line**: 50 chars or less, imperative mood
2. **Body**: Explain what and why, not how
3. **Reference issues**: `Fixes #123`, `Relates to #456`

## Code Standards

### TypeScript

- Use strict mode
- Explicit return types on exported functions
- Avoid `any` type
- Use interfaces for object shapes

```typescript
// Good
interface User {
  id: string
  email: string
  name?: string
}

export function getUser(id: string): Promise<User | null> {
  // ...
}

// Bad
export function getUser(id) {
  // ...
}
```

### React Components

- Use functional components
- Props interface with JSDoc
- Forward refs when needed
- Extract complex logic to hooks

```typescript
interface ButtonProps {
  /** Button variant style */
  variant?: 'primary' | 'secondary'
  /** Click handler */
  onClick?: () => void
  /** Button content */
  children: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', onClick, children }, ref) => {
    // Component logic
  }
)

Button.displayName = 'Button'
```

### File Organization

```
src/
├── app/                    # Next.js routes
│   ├── (frontend)/         # Public pages
│   ├── (payload)/          # CMS routes
│   ├── api/                # API routes
│   └── actions/            # Server actions
├── collections/            # Payload collections
├── components/             # React components
│   ├── ui/                 # UI primitives
│   └── [feature]/          # Feature components
├── lib/                    # Utilities
│   ├── __tests__/          # Co-located tests
│   └── [module].ts
└── hooks/                  # Custom hooks
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `Button.tsx` |
| Hooks | camelCase with `use` | `useAuth.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Constants | UPPER_SNAKE_CASE | `API_URLS` |
| Types/Interfaces | PascalCase | `UserProfile` |
| Test files | `.test.ts` | `Button.test.tsx` |

### Styling (Tailwind)

- Use custom design tokens
- Group related classes
- Extract repeated patterns to components

```tsx
// Good
const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-full'
const variantStyles = 'bg-primary-600 text-white hover:bg-primary-700'

return (
  <button className={cn(baseStyles, variantStyles, className)}>
    {children}
  </button>
)

// Avoid
<button className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 text-white hover:bg-primary-700">
```

## Testing

### Test Structure

Co-locate tests with source files:

```
src/
├── lib/
│   ├── validation.ts
│   └── __tests__/
│       └── validation.test.ts
└── components/
    ├── Button.tsx
    └── __tests__/
        └── Button.test.tsx
```

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### Test Coverage

Minimum coverage requirements:

| Category | Threshold |
|----------|-----------|
| Statements | 80% |
| Branches | 70% |
| Functions | 80% |
| Lines | 80% |

Run coverage:
```bash
pnpm test:coverage
```

### Testing Guidelines

1. Test behavior, not implementation
2. Use descriptive test names
3. Arrange-Act-Assert pattern
4. Mock external dependencies
5. Test edge cases and errors

## Submitting Changes

### Pull Request Process

1. **Create a branch**:
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Make changes**:
   - Write code
   - Add tests
   - Update documentation

3. **Run checks**:
   ```bash
   pnpm lint
   pnpm test
   pnpm build
   ```

4. **Commit**:
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

5. **Push and create PR**:
   ```bash
   git push origin feat/my-feature
   ```

### PR Template

```markdown
## Summary
Brief description of changes

## Changes
- Change 1
- Change 2

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing performed
- [ ] All tests pass

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

## Related Issues
Fixes #123
Relates to #456
```

### PR Guidelines

- Keep PRs focused and small
- One logical change per PR
- Include tests for new features
- Update relevant documentation
- Respond to review comments promptly

## Code Review

### Reviewer Responsibilities

- Check code quality and standards
- Verify tests are adequate
- Ensure documentation is updated
- Test changes locally if needed
- Provide constructive feedback

### Review Checklist

- [ ] Code follows project conventions
- [ ] No obvious bugs or issues
- [ ] Tests cover new functionality
- [ ] Error handling is appropriate
- [ ] Performance considerations addressed
- [ ] Security implications reviewed

### Responding to Reviews

- Address all comments
- Ask questions if unclear
- Make requested changes
- Re-request review when ready

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release PR
4. Merge to main
5. Tag release: `git tag v1.2.3`
6. Push tags: `git push --tags`

## Questions?

- Open an issue for discussion
- Check existing documentation
- Reach out to maintainers

Thank you for contributing!
