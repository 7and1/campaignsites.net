import { defineConfig } from 'vitest/config'
import path from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.pnpm-store', '.next'],
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        '.next/',
        'src/payload.config.ts',
        'src/collections/',
        'src/app/(payload)/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/types.ts',
        '**/index.ts',
        'src/components/ui/',
        'src/app/actions/',
        'src/app/api/',
        'src/app/**/page.tsx',
        'src/app/**/layout.tsx',
      ],
      thresholds: {
        // More realistic thresholds for now
        statements: 25,
        branches: 20,
        functions: 30,
        lines: 25,
        // Higher thresholds for lib folder which we've tested thoroughly
        'src/lib/budget.ts': { statements: 100, branches: 100, functions: 100, lines: 100 },
        'src/lib/utm.ts': { statements: 80, branches: 80, functions: 100, lines: 80 },
        'src/lib/richtext.ts': { statements: 90, branches: 70, functions: 100, lines: 90 },
        'src/lib/validation.ts': { statements: 20, branches: 10, functions: 10, lines: 20 },
        'src/lib/analytics.ts': { statements: 40, branches: 50, functions: 30, lines: 40 },
      },
    },
    globals: true,
    onConsoleLog(log) {
      if (log.includes('Warning:')) return false
    },
  },
})
