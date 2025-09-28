export interface APIError {
  code: string
  message: string
  details?: Record<string, any>
  statusCode?: number
  timestamp?: string
  path?: string
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface FormError {
  field: string
  message: string
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface ErrorDetails {
  message: string
  severity: ErrorSeverity
  code: string
  context?: Record<string, any>
  timestamp: string
  retryable: boolean
  userMessage: string
}

// Common error codes
export const ERROR_CODES = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  OFFLINE_ERROR: 'OFFLINE_ERROR',

  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  PRECONDITION_FAILED: 'PRECONDITION_FAILED',

  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMITED: 'RATE_LIMITED',

  // Business logic errors
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  INVALID_OPERATION: 'INVALID_OPERATION',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',

  // Payment errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  PAYMENT_DECLINED: 'PAYMENT_DECLINED',

  // File upload errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

// User-friendly error messages
export const ERROR_MESSAGES: Record<ErrorCode, { message: string; severity: ErrorSeverity; retryable: boolean }> = {
  [ERROR_CODES.NETWORK_ERROR]: {
    message: 'Unable to connect to the server. Please check your internet connection.',
    severity: 'high',
    retryable: true,
  },
  [ERROR_CODES.TIMEOUT_ERROR]: {
    message: 'The request took too long to complete. Please try again.',
    severity: 'medium',
    retryable: true,
  },
  [ERROR_CODES.OFFLINE_ERROR]: {
    message: 'You appear to be offline. Please check your internet connection.',
    severity: 'high',
    retryable: true,
  },
  [ERROR_CODES.UNAUTHORIZED]: {
    message: 'Your session has expired. Please log in again.',
    severity: 'high',
    retryable: false,
  },
  [ERROR_CODES.FORBIDDEN]: {
    message: 'You do not have permission to perform this action.',
    severity: 'medium',
    retryable: false,
  },
  [ERROR_CODES.TOKEN_EXPIRED]: {
    message: 'Your session has expired. Please log in again.',
    severity: 'high',
    retryable: false,
  },
  [ERROR_CODES.VALIDATION_ERROR]: {
    message: 'Please check your input and try again.',
    severity: 'low',
    retryable: false,
  },
  [ERROR_CODES.REQUIRED_FIELD]: {
    message: 'This field is required.',
    severity: 'low',
    retryable: false,
  },
  [ERROR_CODES.INVALID_FORMAT]: {
    message: 'Please enter a valid value.',
    severity: 'low',
    retryable: false,
  },
  [ERROR_CODES.DUPLICATE_ENTRY]: {
    message: 'This entry already exists.',
    severity: 'medium',
    retryable: false,
  },
  [ERROR_CODES.NOT_FOUND]: {
    message: 'The requested item could not be found.',
    severity: 'medium',
    retryable: false,
  },
  [ERROR_CODES.CONFLICT]: {
    message: 'This action conflicts with existing data.',
    severity: 'medium',
    retryable: false,
  },
  [ERROR_CODES.PRECONDITION_FAILED]: {
    message: 'The operation cannot be completed due to a conflict.',
    severity: 'medium',
    retryable: false,
  },
  [ERROR_CODES.INTERNAL_ERROR]: {
    message: 'An unexpected error occurred. Please try again later.',
    severity: 'critical',
    retryable: true,
  },
  [ERROR_CODES.SERVICE_UNAVAILABLE]: {
    message: 'The service is temporarily unavailable. Please try again later.',
    severity: 'high',
    retryable: true,
  },
  [ERROR_CODES.RATE_LIMITED]: {
    message: 'Too many requests. Please wait a moment before trying again.',
    severity: 'medium',
    retryable: true,
  },
  [ERROR_CODES.INSUFFICIENT_PERMISSIONS]: {
    message: 'You do not have sufficient permissions for this action.',
    severity: 'medium',
    retryable: false,
  },
  [ERROR_CODES.INVALID_OPERATION]: {
    message: 'This operation is not allowed in the current state.',
    severity: 'medium',
    retryable: false,
  },
  [ERROR_CODES.QUOTA_EXCEEDED]: {
    message: 'You have exceeded your quota limit.',
    severity: 'medium',
    retryable: false,
  },
  [ERROR_CODES.PAYMENT_FAILED]: {
    message: 'Payment processing failed. Please try again or use a different payment method.',
    severity: 'high',
    retryable: true,
  },
  [ERROR_CODES.INSUFFICIENT_FUNDS]: {
    message: 'Insufficient funds for this transaction.',
    severity: 'medium',
    retryable: false,
  },
  [ERROR_CODES.PAYMENT_DECLINED]: {
    message: 'Payment was declined. Please contact your bank or use a different payment method.',
    severity: 'medium',
    retryable: false,
  },
  [ERROR_CODES.FILE_TOO_LARGE]: {
    message: 'File size is too large. Please select a smaller file.',
    severity: 'low',
    retryable: false,
  },
  [ERROR_CODES.INVALID_FILE_TYPE]: {
    message: 'Invalid file type. Please select a supported file format.',
    severity: 'low',
    retryable: false,
  },
  [ERROR_CODES.UPLOAD_FAILED]: {
    message: 'File upload failed. Please try again.',
    severity: 'medium',
    retryable: true,
  },
}