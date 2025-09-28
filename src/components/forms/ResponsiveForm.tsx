import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ResponsiveContainer, ResponsiveGrid, ResponsiveStack } from '@/components/layout/ResponsiveContainer'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { cn } from '@/lib/utils'
import { Loader2, Save, X } from 'lucide-react'

export interface ResponsiveFormProps {
  title?: string
  description?: string
  children: ReactNode
  onSubmit?: (e: React.FormEvent) => void
  isLoading?: boolean
  isValid?: boolean
  submitLabel?: string
  cancelLabel?: string
  onCancel?: () => void
  showCancel?: boolean
  className?: string
  formLayout?: 'single-column' | 'two-column' | 'auto'
  stickyButtons?: boolean
  compactMode?: boolean
}

export interface FormSectionProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export interface FormFieldGroupProps {
  children: ReactNode
  columns?: 1 | 2 | 3
  className?: string
}

export function ResponsiveForm({
  title,
  description,
  children,
  onSubmit,
  isLoading = false,
  isValid = true,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  onCancel,
  showCancel = true,
  className,
  formLayout = 'auto',
  stickyButtons = true,
  compactMode = false
}: ResponsiveFormProps) {
  const { isMobile, isTablet } = useBreakpoint()

  const actualLayout = formLayout === 'auto'
    ? (isMobile ? 'single-column' : 'two-column')
    : formLayout

  const isCompact = compactMode || isMobile

  return (
    <ResponsiveContainer maxWidth="full" padding={isCompact ? 'sm' : 'md'}>
      <form onSubmit={onSubmit} className={cn('space-y-4 md:space-y-6', className)}>
        <Card>
          {(title || description) && (
            <CardHeader className={isCompact ? 'p-4 pb-2' : ''}>
              {title && (
                <CardTitle className={isCompact ? 'text-lg' : 'text-xl'}>
                  {title}
                </CardTitle>
              )}
              {description && (
                <CardDescription className={isCompact ? 'text-xs' : 'text-sm'}>
                  {description}
                </CardDescription>
              )}
            </CardHeader>
          )}

          <CardContent className={isCompact ? 'p-4 pt-2' : 'p-6'}>
            <div className={cn(
              'space-y-4',
              actualLayout === 'two-column' && !isMobile && 'md:space-y-6'
            )}>
              {children}
            </div>
          </CardContent>

          {/* Form Actions */}
          <div className={cn(
            'border-t px-4 py-3 md:px-6 md:py-4',
            stickyButtons && isMobile && 'sticky bottom-0 bg-card z-10 shadow-lg'
          )}>
            <ResponsiveStack
              direction={{ mobile: 'horizontal', tablet: 'horizontal', desktop: 'horizontal' }}
              justify={isMobile ? 'center' : 'end'}
              spacing="sm"
              className={isMobile ? 'w-full' : ''}
            >
              {showCancel && onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                  className={isMobile ? 'flex-1' : ''}
                  size={isMobile ? 'default' : 'default'}
                >
                  <X className="h-4 w-4 mr-2" />
                  {cancelLabel}
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading || !isValid}
                className={cn(
                  isMobile ? 'flex-1' : '',
                  'touch-manipulation' // Better touch targets
                )}
                size={isMobile ? 'default' : 'default'}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Saving...' : submitLabel}
              </Button>
            </ResponsiveStack>
          </div>
        </Card>
      </form>
    </ResponsiveContainer>
  )
}

export function FormSection({
  title,
  description,
  children,
  className,
  collapsible = false,
  defaultCollapsed = false
}: FormSectionProps) {
  const { isMobile } = useBreakpoint()

  return (
    <div className={cn('space-y-3 md:space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className={cn(
              'font-medium',
              isMobile ? 'text-sm' : 'text-base'
            )}>
              {title}
            </h3>
          )}
          {description && (
            <p className={cn(
              'text-muted-foreground',
              isMobile ? 'text-xs' : 'text-sm'
            )}>
              {description}
            </p>
          )}
        </div>
      )}
      <div className={cn(
        'space-y-3 md:space-y-4',
        title && 'pl-0 md:pl-4 border-l-0 md:border-l-2 border-muted'
      )}>
        {children}
      </div>
    </div>
  )
}

export function FormFieldGroup({
  children,
  columns = 1,
  className
}: FormFieldGroupProps) {
  const { isMobile } = useBreakpoint()

  // Always single column on mobile
  const actualColumns = isMobile ? 1 : columns

  return (
    <ResponsiveGrid
      cols={{
        xs: 1,
        sm: actualColumns >= 2 ? 2 : 1,
        md: actualColumns >= 2 ? 2 : 1,
        lg: actualColumns,
        xl: actualColumns
      }}
      gap="md"
      className={className}
    >
      {children}
    </ResponsiveGrid>
  )
}

// Enhanced form field wrapper with mobile optimizations
export function FormField({
  label,
  description,
  error,
  required = false,
  children,
  className
}: {
  label?: string
  description?: string
  error?: string
  required?: boolean
  children: ReactNode
  className?: string
}) {
  const { isMobile } = useBreakpoint()

  return (
    <div className={cn('space-y-1.5 md:space-y-2', className)}>
      {label && (
        <label className={cn(
          'block font-medium',
          isMobile ? 'text-sm' : 'text-sm',
          error && 'text-destructive',
          required && "after:content-['*'] after:ml-0.5 after:text-destructive"
        )}>
          {label}
        </label>
      )}

      <div className={cn(
        // Mobile-specific styling for better touch targets
        isMobile && '[&_input]:h-11 [&_textarea]:min-h-[44px] [&_button]:h-11',
        // Better spacing on mobile
        isMobile && '[&_select]:h-11'
      )}>
        {children}
      </div>

      {description && !error && (
        <p className={cn(
          'text-muted-foreground',
          isMobile ? 'text-xs' : 'text-sm'
        )}>
          {description}
        </p>
      )}

      {error && (
        <p className={cn(
          'text-destructive',
          isMobile ? 'text-xs' : 'text-sm'
        )}>
          {error}
        </p>
      )}
    </div>
  )
}

// Mobile-optimized input components
export function MobileOptimizedInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const { isMobile } = useBreakpoint()

  return (
    <input
      className={cn(
        'flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        // Mobile optimizations
        isMobile && 'h-11 text-base', // Larger touch targets and prevent zoom on iOS
        className
      )}
      {...props}
    />
  )
}

export function MobileOptimizedTextarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { isMobile } = useBreakpoint()

  return (
    <textarea
      className={cn(
        'flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        // Mobile optimizations
        isMobile && 'min-h-[80px] text-base', // Better mobile experience
        className
      )}
      {...props}
    />
  )
}