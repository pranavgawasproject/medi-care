'use client'

import {
  forwardRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react'
import { Input, Label, Select, Textarea } from '@/components/ui'
import { cn } from '@/lib/utils'

interface FieldShellProps {
  id: string
  label?: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: ReactNode
}

function FieldShell({
  id,
  label,
  error,
  hint,
  required,
  className,
  children,
}: FieldShellProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
      )}
      {children}
      {hint && !error && (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-[11px] font-medium text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  )
}

interface FormFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string
  label?: string
  error?: string
  hint?: string
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  function FormField(
    { id, label, error, hint, required, className, ...props },
    ref
  ) {
    return (
      <FieldShell
        id={id}
        label={label}
        error={error}
        hint={hint}
        required={required}
      >
        <Input
          id={id}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          required={required}
          className={className}
          {...props}
        />
      </FieldShell>
    )
  }
)

interface FormSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  id: string
  label?: string
  error?: string
  hint?: string
  children: ReactNode
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  function FormSelect(
    { id, label, error, hint, required, className, children, ...props },
    ref
  ) {
    return (
      <FieldShell
        id={id}
        label={label}
        error={error}
        hint={hint}
        required={required}
      >
        <Select
          id={id}
          ref={ref}
          aria-invalid={Boolean(error)}
          required={required}
          className={className}
          {...props}
        >
          {children}
        </Select>
      </FieldShell>
    )
  }
)

interface FormTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  id: string
  label?: string
  error?: string
  hint?: string
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  function FormTextarea(
    { id, label, error, hint, required, className, ...props },
    ref
  ) {
    return (
      <FieldShell
        id={id}
        label={label}
        error={error}
        hint={hint}
        required={required}
      >
        <Textarea
          id={id}
          ref={ref}
          aria-invalid={Boolean(error)}
          required={required}
          className={className}
          {...props}
        />
      </FieldShell>
    )
  }
)
