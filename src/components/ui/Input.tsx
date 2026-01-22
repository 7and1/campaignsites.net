import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, Check } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: string
  description?: string
  required?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, success, description, required, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const errorId = `${inputId}-error`
    const descriptionId = `${inputId}-description`
    const successId = `${inputId}-success`

    const hasError = Boolean(error)
    const hasSuccess = Boolean(success)

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-[0.2em] text-ink-500"
          >
            {label}
            {required && <span className="text-rose-500" aria-label="required">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            type={type}
            ref={ref}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : hasSuccess ? successId : description ? descriptionId : undefined
            }
            className={cn(
              'w-full rounded-xl border px-4 py-2.5 text-sm transition-colors',
              'placeholder:text-ink-400',
              'focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-0',
              'disabled:cursor-not-allowed disabled:opacity-50',
              hasError && 'border-rose-300 focus:ring-rose-300',
              hasSuccess && 'border-emerald-300 focus:ring-emerald-300',
              !hasError && !hasSuccess && 'border-mist-200',
              className
            )}
            {...props}
          />
          {hasError && (
            <AlertCircle className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-rose-500" aria-hidden="true" />
          )}
          {hasSuccess && (
            <Check className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-500" aria-hidden="true" />
          )}
        </div>
        {description && !error && !success && (
          <p id={descriptionId} className="text-xs text-ink-500">
            {description}
          </p>
        )}
        {error && (
          <p id={errorId} className="flex items-center gap-1 text-xs text-rose-600">
            {error}
          </p>
        )}
        {success && (
          <p id={successId} className="flex items-center gap-1 text-xs text-emerald-600">
            {success}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  success?: string
  description?: string
  required?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, success, description, required, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    const errorId = `${textareaId}-error`
    const descriptionId = `${textareaId}-description`
    const successId = `${textareaId}-success`

    const hasError = Boolean(error)
    const hasSuccess = Boolean(success)

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold uppercase tracking-[0.2em] text-ink-500"
          >
            {label}
            {required && <span className="text-rose-500" aria-label="required">*</span>}
          </label>
        )}
        <div className="relative">
          <textarea
            id={textareaId}
            ref={ref}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : hasSuccess ? successId : description ? descriptionId : undefined
            }
            className={cn(
              'w-full rounded-xl border px-4 py-2.5 text-sm transition-colors',
              'placeholder:text-ink-400',
              'focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-0',
              'disabled:cursor-not-allowed disabled:opacity-50',
              hasError && 'border-rose-300 focus:ring-rose-300',
              hasSuccess && 'border-emerald-300 focus:ring-emerald-300',
              !hasError && !hasSuccess && 'border-mist-200',
              className
            )}
            {...props}
          />
        </div>
        {description && !error && !success && (
          <p id={descriptionId} className="text-xs text-ink-500">
            {description}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-xs text-rose-600">
            {error}
          </p>
        )}
        {success && (
          <p id={successId} className="text-xs text-emerald-600">
            {success}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  description?: string
  required?: boolean
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, description, required, id, options, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`
    const errorId = `${selectId}-error`
    const descriptionId = `${selectId}-description`

    const hasError = Boolean(error)

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-[0.2em] text-ink-500"
          >
            {label}
            {required && <span className="text-rose-500" aria-label="required">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : description ? descriptionId : undefined}
          className={cn(
            'w-full rounded-xl border border-mist-200 px-4 py-2.5 text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-50',
            hasError && 'border-rose-300 focus:ring-rose-300',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {description && !error && (
          <p id={descriptionId} className="text-xs text-ink-500">
            {description}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-xs text-rose-600">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
