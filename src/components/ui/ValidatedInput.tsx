'use client'

import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ValidationRule<T = string> {
  validate: (value: T) => boolean
  message: string
}

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  rules?: ValidationRule[]
  onValidChange?: (value: string, isValid: boolean) => void
  showValidation?: boolean
}

export function ValidatedInput({
  label,
  rules = [],
  onValidChange,
  showValidation = true,
  className,
  ...props
}: ValidatedInputProps) {
  const [value, setValue] = useState(props.value?.toString() || '')
  const [touched, setTouched] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (!touched) return

    const newErrors: string[] = []
    for (const rule of rules) {
      if (!rule.validate(value)) {
        newErrors.push(rule.message)
      }
    }
    setErrors(newErrors)
    onValidChange?.(value, newErrors.length === 0)
  }, [value, touched, rules, onValidChange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    props.onChange?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true)
    props.onBlur?.(e)
  }

  const hasError = touched && errors.length > 0

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-ink-900">
        {label}
        {props.required && <span className="ml-1 text-rose-600">*</span>}
      </label>
      <div className="relative">
        <input
          {...props}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            'w-full rounded-lg border px-4 py-2 text-ink-900 transition focus:outline-none focus:ring-2',
            hasError
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
              : 'border-mist-300 focus:border-blue-500 focus:ring-blue-200',
            className
          )}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${props.id}-error` : undefined}
        />
        {hasError && showValidation && (
          <AlertCircle className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-rose-600" />
        )}
      </div>
      {hasError && showValidation && (
        <div id={`${props.id}-error`} className="space-y-1" role="alert">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-rose-600">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
