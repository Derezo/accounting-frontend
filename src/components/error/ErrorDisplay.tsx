import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertTriangle,
  XCircle,
  AlertCircle,
  Info,
  RefreshCw,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import { AppError } from '@/lib/error-handler'
import { ERROR_CODES } from '@/types/errors'

interface ErrorDisplayProps {
  error: AppError | Error | null
  showRetry?: boolean
  onRetry?: () => void
  showDetails?: boolean
  compact?: boolean
  className?: string
}

export function ErrorDisplay({
  error,
  showRetry = false,
  onRetry,
  showDetails = false,
  compact = false,
  className = ''
}: ErrorDisplayProps) {
  if (!error) return null

  const isAppError = error instanceof AppError
  const severity = isAppError ? error.severity : 'medium'
  const retryable = isAppError ? error.retryable : true

  const getIcon = () => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4" />
      case 'high':
        return <AlertTriangle className="h-4 w-4" />
      case 'medium':
        return <AlertCircle className="h-4 w-4" />
      case 'low':
        return <Info className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getVariant = () => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const getSuggestion = () => {
    if (!isAppError) return null

    switch (error.code) {
      case ERROR_CODES.NETWORK_ERROR:
        return 'Check your internet connection and try again.'
      case ERROR_CODES.UNAUTHORIZED:
        return 'Please log in again to continue.'
      case ERROR_CODES.FORBIDDEN:
        return 'Contact your administrator for access.'
      case ERROR_CODES.NOT_FOUND:
        return 'The item you\'re looking for may have been moved or deleted.'
      case ERROR_CODES.VALIDATION_ERROR:
        return 'Please check your input and correct any errors.'
      case ERROR_CODES.RATE_LIMITED:
        return 'Please wait a moment before trying again.'
      case ERROR_CODES.SERVICE_UNAVAILABLE:
        return 'Our service is temporarily unavailable. Please try again later.'
      default:
        return retryable ? 'Please try again.' : 'Please contact support if this issue persists.'
    }
  }

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 text-sm ${className}`}>
        {getIcon()}
        <span className="text-destructive">{error.message}</span>
        {showRetry && retryable && onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-6 px-2"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <Alert variant={getVariant()} className={className}>
      {getIcon()}
      <AlertTitle className="flex items-center justify-between">
        <span>
          {severity === 'critical' ? 'Critical Error' :
           severity === 'high' ? 'Error' :
           severity === 'medium' ? 'Warning' : 'Notice'}
        </span>
        {isAppError && (
          <Badge variant="outline" className="text-xs">
            {error.code}
          </Badge>
        )}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-3">
          <p>{error.message}</p>

          {getSuggestion() && (
            <p className="text-sm text-muted-foreground">
              <strong>Suggestion:</strong> {getSuggestion()}
            </p>
          )}

          {showDetails && isAppError && error.context && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Technical Details
              </summary>
              <div className="mt-2 bg-muted p-2 rounded font-mono">
                <pre>{JSON.stringify(error.context, null, 2)}</pre>
              </div>
            </details>
          )}

          {(showRetry && retryable && onRetry) && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}

// Specialized error displays
export function NetworkErrorDisplay({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorDisplay
      error={new AppError(ERROR_CODES.NETWORK_ERROR)}
      showRetry={true}
      onRetry={onRetry}
      className="border-orange-200 bg-orange-50"
    />
  )
}

export function UnauthorizedErrorDisplay() {
  return (
    <ErrorDisplay
      error={new AppError(ERROR_CODES.UNAUTHORIZED)}
      className="border-red-200 bg-red-50"
    />
  )
}

export function NotFoundErrorDisplay({ itemType = 'item' }: { itemType?: string }) {
  return (
    <ErrorDisplay
      error={new AppError(ERROR_CODES.NOT_FOUND, `The ${itemType} you're looking for could not be found.`)}
      className="border-yellow-200 bg-yellow-50"
    />
  )
}

export function LoadingErrorDisplay({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="h-12 w-12 text-orange-500 mb-4" />
      <h3 className="text-lg font-semibold mb-2">Failed to load</h3>
      <p className="text-muted-foreground mb-4">
        We couldn't load the data you requested.
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  )
}

// Empty state with error context
export function EmptyStateWithError({
  title,
  description,
  error,
  onRetry,
  children
}: {
  title: string
  description: string
  error?: AppError | Error | null
  onRetry?: () => void
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        {error ? (
          <AlertTriangle className="h-8 w-8 text-orange-500" />
        ) : (
          <Info className="h-8 w-8 text-muted-foreground" />
        )}
      </div>

      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-md">{description}</p>

      {error && (
        <div className="w-full max-w-md mb-4">
          <ErrorDisplay
            error={error}
            showRetry={!!onRetry}
            onRetry={onRetry}
            compact={true}
          />
        </div>
      )}

      {children}
    </div>
  )
}

// Inline error for form fields
export function FieldError({ error }: { error?: string }) {
  if (!error) return null

  return (
    <div className="flex items-center space-x-1 text-sm text-destructive mt-1">
      <AlertCircle className="h-3 w-3" />
      <span>{error}</span>
    </div>
  )
}

// Error summary for multiple validation errors
export function ValidationErrorSummary({ errors }: { errors: Record<string, string> }) {
  const errorEntries = Object.entries(errors)

  if (errorEntries.length === 0) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Please fix the following errors:</AlertTitle>
      <AlertDescription>
        <ul className="mt-2 space-y-1">
          {errorEntries.map(([field, message]) => (
            <li key={field} className="flex items-center space-x-2">
              <ChevronRight className="h-3 w-3" />
              <span className="capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}:</span>
              <span>{message}</span>
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}