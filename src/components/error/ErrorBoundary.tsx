import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  AlertTriangle,
  RefreshCw,
  Bug,
  Home,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink
} from 'lucide-react'
import { errorHandler, AppError } from '@/lib/error-handler'
import { ERROR_CODES } from '@/types/errors'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showErrorDetails?: boolean
  level?: 'page' | 'component' | 'critical'
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  showDetails: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Log error
    const appError = error instanceof AppError
      ? error
      : errorHandler.handleBusinessError({
          code: ERROR_CODES.INTERNAL_ERROR,
          message: error.message,
          stack: error.stack
        })

    errorHandler.handleError(appError, {
      showToast: false,
      logError: true,
      context: {
        componentStack: errorInfo.componentStack,
        level: this.props.level || 'component'
      }
    })

    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  copyErrorToClipboard = () => {
    const errorText = `
Error: ${this.state.error?.message}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
Time: ${new Date().toISOString()}
    `.trim()

    navigator.clipboard.writeText(errorText).then(() => {
      alert('Error details copied to clipboard')
    })
  }

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }))
  }

  getSeverityColor = () => {
    if (this.state.error instanceof AppError) {
      switch (this.state.error.severity) {
        case 'critical': return 'bg-red-100 text-red-800 border-red-200'
        case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
        case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
        default: return 'bg-gray-100 text-gray-800 border-gray-200'
      }
    }
    return 'bg-red-100 text-red-800 border-red-200'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { level = 'component' } = this.props
      const error = this.state.error
      const isAppError = error instanceof AppError
      const isRetryable = isAppError ? error.retryable : true

      // Critical level errors take over the entire screen
      if (level === 'critical') {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
              <Card className="border-red-200">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  <CardTitle className="text-red-800">Critical Error</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-center text-gray-600">
                    A critical error has occurred. Please reload the page or contact support if the issue persists.
                  </p>

                  <div className="flex flex-col space-y-2">
                    <Button onClick={this.handleReload} className="w-full">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reload Page
                    </Button>
                    <Button variant="outline" onClick={this.handleGoHome} className="w-full">
                      <Home className="w-4 h-4 mr-2" />
                      Go Home
                    </Button>
                  </div>

                  {this.props.showErrorDetails !== false && (
                    <div className="mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={this.toggleDetails}
                        className="w-full"
                      >
                        {this.state.showDetails ? <ChevronUp /> : <ChevronDown />}
                        {this.state.showDetails ? 'Hide' : 'Show'} Error Details
                      </Button>

                      {this.state.showDetails && (
                        <div className="mt-2 space-y-2">
                          <Alert>
                            <Bug className="h-4 w-4" />
                            <AlertTitle>Error Details</AlertTitle>
                            <AlertDescription className="mt-2 text-xs font-mono bg-gray-100 p-2 rounded">
                              {error?.message}
                            </AlertDescription>
                          </Alert>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={this.copyErrorToClipboard}
                            className="w-full"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Error Details
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )
      }

      // Component level errors
      return (
        <Card className={`m-4 ${this.getSeverityColor()}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <CardTitle className="text-base">
                  {level === 'page' ? 'Page Error' : 'Component Error'}
                </CardTitle>
                {isAppError && (
                  <Badge variant="outline" className="text-xs">
                    {error.severity}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <p className="text-sm">
              {isAppError
                ? error.message
                : 'An unexpected error occurred. Please try again.'}
            </p>

            <div className="flex flex-wrap gap-2">
              {isRetryable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.handleRetry}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}

              {level === 'page' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.handleReload}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
              )}
            </div>

            {this.props.showErrorDetails !== false && (
              <div className="border-t pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={this.toggleDetails}
                  className="text-xs"
                >
                  {this.state.showDetails ? <ChevronUp /> : <ChevronDown />}
                  {this.state.showDetails ? 'Hide' : 'Show'} Technical Details
                </Button>

                {this.state.showDetails && (
                  <div className="mt-2 text-xs font-mono bg-gray-50 p-2 rounded border max-h-32 overflow-y-auto">
                    <div><strong>Error:</strong> {error?.message}</div>
                    {isAppError && <div><strong>Code:</strong> {error.code}</div>}
                    {error?.stack && (
                      <div className="mt-1">
                        <strong>Stack:</strong>
                        <pre className="whitespace-pre-wrap">{error.stack}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Specific error boundary for critical application errors
export function CriticalErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary level="critical" showErrorDetails={true}>
      {children}
    </ErrorBoundary>
  )
}

// Specific error boundary for page-level errors
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary level="page" showErrorDetails={false}>
      {children}
    </ErrorBoundary>
  )
}