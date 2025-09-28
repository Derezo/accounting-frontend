import { AxiosError } from 'axios'
import { toast } from 'react-hot-toast'
import { ErrorDetails, ErrorCode, ERROR_CODES, ERROR_MESSAGES, APIError, ValidationError } from '@/types/errors'

export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly severity: 'low' | 'medium' | 'high' | 'critical'
  public readonly retryable: boolean
  public readonly context?: Record<string, any>
  public readonly statusCode?: number

  constructor(code: ErrorCode, message?: string, context?: Record<string, any>, statusCode?: number) {
    const errorInfo = ERROR_MESSAGES[code]
    super(message || errorInfo.message)

    this.name = 'AppError'
    this.code = code
    this.severity = errorInfo.severity
    this.retryable = errorInfo.retryable
    this.context = context
    this.statusCode = statusCode
  }
}

export class ErrorHandler {
  private static instance: ErrorHandler
  private errorQueue: ErrorDetails[] = []

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  // Convert axios error to AppError
  handleAxiosError(error: AxiosError): AppError {
    const status = error.response?.status
    const responseData = error.response?.data as any

    // Check if it's a network error
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return new AppError(ERROR_CODES.TIMEOUT_ERROR, undefined, { originalError: error.message })
      }
      if (error.message.includes('Network Error')) {
        return new AppError(ERROR_CODES.NETWORK_ERROR, undefined, { originalError: error.message })
      }
      return new AppError(ERROR_CODES.NETWORK_ERROR, undefined, { originalError: error.message })
    }

    // Map HTTP status codes to error codes
    switch (status) {
      case 400:
        if (responseData?.code === 'VALIDATION_ERROR' || responseData?.errors) {
          return new AppError(ERROR_CODES.VALIDATION_ERROR, responseData?.message, {
            validationErrors: responseData?.errors,
            fields: responseData?.fields
          }, status)
        }
        return new AppError(ERROR_CODES.VALIDATION_ERROR, responseData?.message || 'Bad request', undefined, status)

      case 401:
        return new AppError(ERROR_CODES.UNAUTHORIZED, responseData?.message, undefined, status)

      case 403:
        return new AppError(ERROR_CODES.FORBIDDEN, responseData?.message, undefined, status)

      case 404:
        return new AppError(ERROR_CODES.NOT_FOUND, responseData?.message, undefined, status)

      case 409:
        if (responseData?.code === 'DUPLICATE_ENTRY') {
          return new AppError(ERROR_CODES.DUPLICATE_ENTRY, responseData?.message, undefined, status)
        }
        return new AppError(ERROR_CODES.CONFLICT, responseData?.message, undefined, status)

      case 412:
        return new AppError(ERROR_CODES.PRECONDITION_FAILED, responseData?.message, undefined, status)

      case 413:
        return new AppError(ERROR_CODES.FILE_TOO_LARGE, responseData?.message, undefined, status)

      case 415:
        return new AppError(ERROR_CODES.INVALID_FILE_TYPE, responseData?.message, undefined, status)

      case 422:
        return new AppError(ERROR_CODES.VALIDATION_ERROR, responseData?.message, {
          validationErrors: responseData?.errors
        }, status)

      case 429:
        return new AppError(ERROR_CODES.RATE_LIMITED, responseData?.message, {
          retryAfter: error.response?.headers['retry-after']
        }, status)

      case 500:
        return new AppError(ERROR_CODES.INTERNAL_ERROR, responseData?.message, undefined, status)

      case 502:
      case 503:
      case 504:
        return new AppError(ERROR_CODES.SERVICE_UNAVAILABLE, responseData?.message, undefined, status)

      default:
        return new AppError(ERROR_CODES.INTERNAL_ERROR, responseData?.message || 'An unexpected error occurred', undefined, status)
    }
  }

  // Handle business logic errors
  handleBusinessError(error: any): AppError {
    if (error instanceof AppError) {
      return error
    }

    if (error?.code && ERROR_MESSAGES[error.code as ErrorCode]) {
      return new AppError(error.code as ErrorCode, error.message, error.context)
    }

    return new AppError(ERROR_CODES.INTERNAL_ERROR, error.message || 'An unexpected error occurred')
  }

  // Create error details for logging/monitoring
  createErrorDetails(error: AppError, context?: Record<string, any>): ErrorDetails {
    return {
      message: error.message,
      severity: error.severity,
      code: error.code,
      context: { ...error.context, ...context },
      timestamp: new Date().toISOString(),
      retryable: error.retryable,
      userMessage: ERROR_MESSAGES[error.code].message
    }
  }

  // Handle error with appropriate user feedback
  handleError(error: any, options: {
    showToast?: boolean
    logError?: boolean
    context?: Record<string, any>
    customMessage?: string
  } = {}): AppError {
    const {
      showToast = true,
      logError = true,
      context,
      customMessage
    } = options

    let appError: AppError

    if (error.isAxiosError) {
      appError = this.handleAxiosError(error as AxiosError)
    } else {
      appError = this.handleBusinessError(error)
    }

    const errorDetails = this.createErrorDetails(appError, context)

    if (logError) {
      this.logError(errorDetails)
    }

    if (showToast) {
      this.showErrorToast(appError, customMessage)
    }

    return appError
  }

  // Show appropriate toast based on error severity
  private showErrorToast(error: AppError, customMessage?: string): void {
    const message = customMessage || error.message

    switch (error.severity) {
      case 'critical':
        toast.error(message, {
          duration: 8000,
          position: 'top-center',
        })
        break
      case 'high':
        toast.error(message, {
          duration: 6000,
        })
        break
      case 'medium':
        toast.error(message, {
          duration: 4000,
        })
        break
      case 'low':
        toast.error(message, {
          duration: 3000,
        })
        break
    }
  }

  // Log error for monitoring
  private logError(errorDetails: ErrorDetails): void {
    console.error('Application Error:', errorDetails)

    // Add to error queue for potential reporting
    this.errorQueue.push(errorDetails)

    // Keep only last 50 errors
    if (this.errorQueue.length > 50) {
      this.errorQueue = this.errorQueue.slice(-50)
    }

    // In production, you would send this to a monitoring service
    if (import.meta.env.PROD && errorDetails.severity === 'critical') {
      // Example: Send to monitoring service
      // monitoringService.reportError(errorDetails)
    }
  }

  // Get recent errors for debugging
  getRecentErrors(): ErrorDetails[] {
    return [...this.errorQueue]
  }

  // Clear error queue
  clearErrors(): void {
    this.errorQueue = []
  }

  // Retry helper for retryable errors
  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    context?: Record<string, any>
  ): Promise<T> {
    let lastError: AppError | undefined

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = this.handleError(error, {
          showToast: false,
          logError: attempt === maxRetries,
          context: { ...context, attempt, maxRetries }
        })

        // Don't retry if error is not retryable or if this is the last attempt
        if (!lastError.retryable || attempt === maxRetries) {
          throw lastError
        }

        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)))
      }
    }

    throw lastError!
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance()

// Utility functions
export const handleApiError = (error: any, options?: Parameters<typeof errorHandler.handleError>[1]) => {
  return errorHandler.handleError(error, options)
}

export const withRetry = <T>(
  operation: () => Promise<T>,
  maxRetries?: number,
  delay?: number,
  context?: Record<string, any>
) => {
  return errorHandler.withRetry(operation, maxRetries, delay, context)
}

// Form validation error helpers
export const extractFormErrors = (error: AppError): Record<string, string> => {
  const formErrors: Record<string, string> = {}

  if (error.context?.validationErrors) {
    if (Array.isArray(error.context.validationErrors)) {
      // Handle array of validation errors
      error.context.validationErrors.forEach((validationError: ValidationError) => {
        formErrors[validationError.field] = validationError.message
      })
    } else if (typeof error.context.validationErrors === 'object') {
      // Handle object with field keys
      Object.entries(error.context.validationErrors).forEach(([field, message]) => {
        formErrors[field] = Array.isArray(message) ? message[0] : String(message)
      })
    }
  }

  return formErrors
}

// Check if error is retryable
export const isRetryableError = (error: any): boolean => {
  if (error instanceof AppError) {
    return error.retryable
  }
  return false
}