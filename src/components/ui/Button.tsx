import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase tracking-[0.2em] transition-all disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-300 focus:ring-offset-2',
      secondary: 'bg-ink-900 text-white hover:bg-ink-800 focus:ring-2 focus:ring-ink-300 focus:ring-offset-2',
      outline: 'border border-ink-200 text-ink-700 hover:border-primary-300 hover:bg-primary-50 focus:ring-2 focus:ring-primary-300 focus:ring-offset-2',
      ghost: 'text-ink-600 hover:bg-mist-100 focus:ring-2 focus:ring-mist-300 focus:ring-offset-2',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2.5 text-xs',
      lg: 'px-6 py-3 text-sm',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
