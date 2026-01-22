import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff6f0',
          100: '#ffe7d9',
          200: '#ffcdb3',
          300: '#ffb28c',
          400: '#ff9163',
          500: '#ff6b35',
          600: '#e85827',
          700: '#c4471f',
          800: '#9c3718',
          900: '#7a2a12',
          950: '#411306',
        },
        ink: {
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
        },
        mist: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
        },
      },
      fontFamily: {
        sans: ['var(--font-body)', 'IBM Plex Sans', 'sans-serif'],
        display: ['var(--font-display)', 'Fraunces', 'serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('tailwindcss-animate')],
}

export default config
