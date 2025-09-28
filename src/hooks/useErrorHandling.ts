import { useMutation, useQuery, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { errorHandler, AppError, withRetry, extractFormErrors } from '@/lib/error-handler'
import { ERROR_CODES } from '@/types/errors'

interface UseErrorHandledQueryOptions<TData, TError = AppError> extends Omit<UseQueryOptions<TData, TError>, 'onError'> {
  showErrorToast?: boolean
  customErrorMessage?: string
  retryOnError?: boolean
  maxRetries?: number
  onError?: (error: TError) => void
}

interface UseErrorHandledMutationOptions<TData, TError = AppError, TVariables = void, TContext = unknown>
  extends Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'onError'> {
  showErrorToast?: boolean
  showSuccessToast?: boolean
  customErrorMessage?: string
  customSuccessMessage?: string
  retryOnError?: boolean
  maxRetries?: number
  onError?: (error: TError, variables: TVariables, context: TContext | undefined) => void
  onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void
}

// Enhanced query hook with error handling
export function useErrorHandledQuery<TData = unknown, TError = AppError>(
  options: UseErrorHandledQueryOptions<TData, TError>
) {
  const {
    showErrorToast = true,
    customErrorMessage,
    retryOnError = true,
    maxRetries = 3,
    onError,
    queryFn,
    ...queryOptions
  } = options

  return useQuery<TData, TError>({
    ...queryOptions,
    queryFn: retryOnError && queryFn
      ? () => withRetry(
          () => queryFn(queryOptions.queryKey!),
          maxRetries,
          1000,
          { queryKey: queryOptions.queryKey }
        )
      : queryFn,
    onError: (error: TError) => {
      if (showErrorToast) {
        const appError = error instanceof AppError ? error : errorHandler.handleBusinessError(error)
        errorHandler.handleError(appError, {
          showToast: true,
          customMessage: customErrorMessage
        })
      }
      onError?.(error)
    },
    retry: (failureCount, error) => {
      // Don't retry for certain error types
      if (error instanceof AppError) {
        if ([ERROR_CODES.UNAUTHORIZED, ERROR_CODES.FORBIDDEN, ERROR_CODES.NOT_FOUND].includes(error.code)) {
          return false
        }
        return error.retryable && failureCount < maxRetries
      }
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Enhanced mutation hook with error handling
export function useErrorHandledMutation<TData = unknown, TError = AppError, TVariables = void, TContext = unknown>(
  options: UseErrorHandledMutationOptions<TData, TError, TVariables, TContext>
) {
  const {
    showErrorToast = true,
    showSuccessToast = false,
    customErrorMessage,
    customSuccessMessage,
    retryOnError = false,
    maxRetries = 3,
    onError,
    onSuccess,
    mutationFn,
    ...mutationOptions
  } = options

  return useMutation<TData, TError, TVariables, TContext>({
    ...mutationOptions,
    mutationFn: retryOnError && mutationFn
      ? (variables: TVariables) => withRetry(
          () => mutationFn(variables),
          maxRetries,
          1000,
          { variables }
        )
      : mutationFn,
    onError: (error: TError, variables: TVariables, context: TContext | undefined) => {
      if (showErrorToast) {
        const appError = error instanceof AppError ? error : errorHandler.handleBusinessError(error)
        errorHandler.handleError(appError, {
          showToast: true,
          customMessage: customErrorMessage
        })
      }
      onError?.(error, variables, context)
    },
    onSuccess: (data: TData, variables: TVariables, context: TContext | undefined) => {
      if (showSuccessToast && customSuccessMessage) {
        toast.success(customSuccessMessage)
      }
      onSuccess?.(data, variables, context)
    },
    retry: (failureCount, error) => {
      if (!retryOnError) return false

      if (error instanceof AppError) {
        return error.retryable && failureCount < maxRetries
      }
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Hook for form-specific error handling
export function useFormErrorHandling() {
  const extractErrors = (error: any) => {
    if (error instanceof AppError) {
      return extractFormErrors(error)
    }
    return {}
  }

  const handleSubmissionError = (error: any, customMessage?: string) => {
    const appError = error instanceof AppError ? error : errorHandler.handleBusinessError(error)

    errorHandler.handleError(appError, {
      showToast: true,
      customMessage: customMessage || 'Please check your input and try again.'
    })

    return extractErrors(appError)
  }

  return {
    extractErrors,
    handleSubmissionError
  }
}

// Hook for monitoring errors
export function useErrorMonitoring() {
  const getRecentErrors = () => errorHandler.getRecentErrors()
  const clearErrors = () => errorHandler.clearErrors()

  return {
    getRecentErrors,
    clearErrors
  }
}

// Hook for checking error states
export function useErrorState() {
  const isRetryableError = (error: any): boolean => {
    if (error instanceof AppError) {
      return error.retryable
    }
    return false
  }

  const getErrorSeverity = (error: any): string => {
    if (error instanceof AppError) {
      return error.severity
    }
    return 'medium'
  }

  const shouldShowRetryButton = (error: any): boolean => {
    return isRetryableError(error) && getErrorSeverity(error) !== 'critical'
  }

  return {
    isRetryableError,
    getErrorSeverity,
    shouldShowRetryButton
  }
}