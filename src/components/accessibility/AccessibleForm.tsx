import React, { ReactNode } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScreenReaderOnly, AriaAnnouncement } from './ScreenReaderUtils'
import { useAccessibility } from './AccessibilityProvider'
import { cn } from '@/lib/utils'
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react'

interface AccessibleFormFieldProps {
  id: string
  label: string
  children: ReactNode
  description?: string
  error?: string
  required?: boolean
  className?: string
  helpText?: string
}

export function AccessibleFormField({
  id,
  label,
  children,
  description,
  error,
  required = false,
  className,
  helpText
}: AccessibleFormFieldProps) {
  const { announceMessage } = useAccessibility()
  const [hasAnnouncedError, setHasAnnouncedError] = React.useState(false)

  const describedByIds = []
  if (description) describedByIds.push(`${id}-description`)
  if (error) describedByIds.push(`${id}-error`)
  if (helpText) describedByIds.push(`${id}-help`)

  // Announce errors to screen readers
  React.useEffect(() => {
    if (error && !hasAnnouncedError) {
      announceMessage(`Error in ${label}: ${error}`, 'assertive')
      setHasAnnouncedError(true)
    } else if (!error && hasAnnouncedError) {
      setHasAnnouncedError(false)
    }
  }, [error, label, announceMessage, hasAnnouncedError])

  return (
    <div className={cn('space-y-2', className)}>
      <Label
        htmlFor={id}
        className={cn(
          'block text-sm font-medium',
          error && 'text-destructive',
          required && "after:content-['*'] after:ml-0.5 after:text-destructive after:font-bold"
        )}
      >
        {label}
        {required && (
          <ScreenReaderOnly>
            (required)
          </ScreenReaderOnly>
        )}
      </Label>

      {description && (
        <p
          id={`${id}-description`}
          className="text-sm text-muted-foreground"
        >
          {description}
        </p>
      )}

      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          id,
          'aria-describedby': describedByIds.length > 0 ? describedByIds.join(' ') : undefined,
          'aria-invalid': error ? 'true' : 'false',
          'aria-required': required,
          className: cn(
            (children as React.ReactElement).props.className,
            error && 'border-destructive focus:ring-destructive'
          )
        })}

        {error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <AlertTriangle
              className="h-4 w-4 text-destructive"
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive" id={`${id}-error`} role="alert">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {helpText && !error && (
        <p
          id={`${id}-help`}
          className="text-xs text-muted-foreground"
        >
          {helpText}
        </p>
      )}
    </div>
  )
}

interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  description?: string
  error?: string
  helpText?: string
}

export function AccessibleInput({
  label,
  description,
  error,
  helpText,
  id,
  required,
  className,
  ...props
}: AccessibleInputProps) {
  const generatedId = React.useId()
  const fieldId = id || `input-${generatedId}`

  return (
    <AccessibleFormField
      id={fieldId}
      label={label}
      description={description}
      error={error}
      required={required}
      helpText={helpText}
      className={className}
    >
      <Input {...props} />
    </AccessibleFormField>
  )
}

interface AccessibleTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  description?: string
  error?: string
  helpText?: string
}

export function AccessibleTextarea({
  label,
  description,
  error,
  helpText,
  id,
  required,
  className,
  ...props
}: AccessibleTextareaProps) {
  const generatedId = React.useId()
  const fieldId = id || `textarea-${generatedId}`

  return (
    <AccessibleFormField
      id={fieldId}
      label={label}
      description={description}
      error={error}
      required={required}
      helpText={helpText}
      className={className}
    >
      <Textarea {...props} />
    </AccessibleFormField>
  )
}

interface AccessibleSelectProps {
  label: string
  description?: string
  error?: string
  helpText?: string
  id?: string
  required?: boolean
  className?: string
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  children: ReactNode
}

export function AccessibleSelect({
  label,
  description,
  error,
  helpText,
  id,
  required,
  className,
  placeholder,
  value,
  onValueChange,
  children
}: AccessibleSelectProps) {
  const generatedId = React.useId()
  const fieldId = id || `select-${generatedId}`

  return (
    <AccessibleFormField
      id={fieldId}
      label={label}
      description={description}
      error={error}
      required={required}
      helpText={helpText}
      className={className}
    >
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {children}
        </SelectContent>
      </Select>
    </AccessibleFormField>
  )
}

interface AccessibleCheckboxProps {
  label: string
  description?: string
  error?: string
  helpText?: string
  id?: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  required?: boolean
  className?: string
}

export function AccessibleCheckbox({
  label,
  description,
  error,
  helpText,
  id,
  checked,
  onCheckedChange,
  required,
  className
}: AccessibleCheckboxProps) {
  const generatedId = React.useId()
  const fieldId = id || `checkbox-${generatedId}`

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-start space-x-2">
        <Checkbox
          id={fieldId}
          checked={checked}
          onCheckedChange={onCheckedChange}
          aria-required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            [description && `${fieldId}-description`, error && `${fieldId}-error`, helpText && `${fieldId}-help`]
              .filter(Boolean)
              .join(' ') || undefined
          }
          className={cn(error && 'border-destructive')}
        />
        <div className="space-y-1 flex-1">
          <Label
            htmlFor={fieldId}
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              error && 'text-destructive',
              required && "after:content-['*'] after:ml-0.5 after:text-destructive"
            )}
          >
            {label}
            {required && (
              <ScreenReaderOnly>
                (required)
              </ScreenReaderOnly>
            )}
          </Label>

          {description && (
            <p
              id={`${fieldId}-description`}
              className="text-xs text-muted-foreground"
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" id={`${fieldId}-error`} role="alert">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {helpText && !error && (
        <p
          id={`${fieldId}-help`}
          className="text-xs text-muted-foreground ml-6"
        >
          {helpText}
        </p>
      )}
    </div>
  )
}

interface FormErrorSummaryProps {
  errors: Record<string, string>
  title?: string
  className?: string
}

export function FormErrorSummary({
  errors,
  title = 'Please correct the following errors:',
  className
}: FormErrorSummaryProps) {
  const { announceMessage } = useAccessibility()
  const errorEntries = Object.entries(errors)

  React.useEffect(() => {
    if (errorEntries.length > 0) {
      const errorCount = errorEntries.length
      const message = `Form has ${errorCount} error${errorCount > 1 ? 's' : ''}. Please review and correct.`
      announceMessage(message, 'assertive')
    }
  }, [errorEntries.length, announceMessage])

  if (errorEntries.length === 0) return null

  return (
    <Alert variant="destructive" className={className} role="alert" aria-live="assertive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="font-medium">{title}</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {errorEntries.map(([field, error]) => (
              <li key={field}>
                <button
                  type="button"
                  className="text-left underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-ring rounded"
                  onClick={() => {
                    const element = document.getElementById(field) ||
                                  document.querySelector(`[name="${field}"]`) ||
                                  document.querySelector(`label[for="${field}"]`)?.getAttribute('for') &&
                                  document.getElementById(document.querySelector(`label[for="${field}"]`)?.getAttribute('for') || '')

                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                      ;(element as HTMLElement).focus()
                    }
                  }}
                >
                  {error}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  )
}

interface AccessibleSubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  loadingText?: string
  children: ReactNode
}

export function AccessibleSubmitButton({
  isLoading = false,
  loadingText = 'Submitting...',
  children,
  disabled,
  className,
  ...props
}: AccessibleSubmitButtonProps) {
  return (
    <>
      <Button
        type="submit"
        disabled={disabled || isLoading}
        aria-describedby={isLoading ? 'submit-status' : undefined}
        className={cn('touch-manipulation', className)}
        {...props}
      >
        {isLoading ? loadingText : children}
      </Button>

      {isLoading && (
        <ScreenReaderOnly>
          <div id="submit-status" aria-live="polite">
            Form is being submitted, please wait.
          </div>
        </ScreenReaderOnly>
      )}
    </>
  )
}