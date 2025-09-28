// Payment Processing Types for Enhanced Payment Capabilities

export interface PaymentGateway {
  id: string
  name: string
  provider: 'STRIPE' | 'PAYPAL' | 'SQUARE' | 'AUTHORIZE_NET' | 'SAGE' | 'MONERIS' | 'BAMBORA' | 'INTERAC' | 'CUSTOM'
  status: 'ACTIVE' | 'INACTIVE' | 'TESTING'
  configuration: {
    publicKey?: string
    privateKey?: string
    merchantId?: string
    webhookSecret?: string
    environment: 'SANDBOX' | 'PRODUCTION'
    supportedCurrencies: string[]
    supportedPaymentMethods: PaymentMethodType[]
    fees: {
      percentage?: number
      fixedAmount?: number
      perTransactionFee?: number
    }
  }
  isDefault: boolean
  country: string
  createdAt: string
  updatedAt: string
}

export type PaymentMethodType =
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'BANK_TRANSFER'
  | 'ACH'
  | 'WIRE_TRANSFER'
  | 'PAYPAL'
  | 'APPLE_PAY'
  | 'GOOGLE_PAY'
  | 'E_TRANSFER'
  | 'CRYPTOCURRENCY'
  | 'CHECK'
  | 'CASH'

export interface PaymentMethod {
  id: string
  customerId: string
  type: PaymentMethodType
  isDefault: boolean
  billingAddress: {
    street: string
    city: string
    province: string
    postalCode: string
    country: string
  }
  // Card-specific fields
  cardNumber?: string // Masked (e.g., "**** **** **** 1234")
  cardHolderName?: string
  expiryMonth?: number
  expiryYear?: number
  cardBrand?: 'VISA' | 'MASTERCARD' | 'AMEX' | 'DISCOVER' | 'OTHER'
  // Bank account fields
  bankAccountNumber?: string // Masked
  bankRoutingNumber?: string
  bankAccountType?: 'CHECKING' | 'SAVINGS'
  bankName?: string
  // Digital wallet fields
  walletId?: string
  walletProvider?: string
  // Status and metadata
  status: 'ACTIVE' | 'EXPIRED' | 'INVALID' | 'PENDING_VERIFICATION'
  lastVerified?: string
  createdAt: string
  updatedAt: string
}

export interface PaymentProcessingSettings {
  id: string
  organizationId: string
  // Processing settings
  defaultGateway: string
  fallbackGateways: string[]
  processingRules: {
    minAmount?: number
    maxAmount?: number
    requireCVV: boolean
    require3DSecure: boolean
    allowInternational: boolean
    allowedCountries: string[]
    blockedCountries: string[]
  }
  // Retry settings
  retrySettings: {
    enabled: boolean
    maxRetries: number
    retryDelay: number // seconds
    backoffMultiplier: number
  }
  // Fraud detection
  fraudDetection: {
    enabled: boolean
    provider?: 'INTERNAL' | 'KOUNT' | 'SIFT' | 'FORTER'
    riskThreshold: number // 0-100
    autoDeclineThreshold: number // 0-100
    requireManualReview: boolean
  }
  // Security settings
  security: {
    encryptionLevel: 'STANDARD' | 'HIGH' | 'MAXIMUM'
    tokenization: boolean
    pciCompliance: boolean
    dataRetentionDays: number
  }
  // Notification settings
  notifications: {
    successEmails: string[]
    failureEmails: string[]
    webhookUrls: string[]
    smsNotifications: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface PaymentAttempt {
  id: string
  paymentId: string
  attemptNumber: number
  gatewayId: string
  amount: number
  currency: string
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'TIMEOUT'
  gatewayResponse: {
    transactionId?: string
    authCode?: string
    responseCode?: string
    responseMessage?: string
    avsResult?: string
    cvvResult?: string
    riskScore?: number
  }
  processingTime: number // milliseconds
  fees: {
    gatewayFee: number
    processingFee: number
    totalFees: number
  }
  errorCode?: string
  errorMessage?: string
  retryReason?: string
  attemptedAt: string
  completedAt?: string
}

export interface RecurringPayment {
  id: string
  customerId: string
  paymentMethodId: string
  invoiceTemplateId?: string
  amount: number
  currency: string
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY'
  startDate: string
  endDate?: string
  nextPaymentDate: string
  lastPaymentDate?: string
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'COMPLETED' | 'FAILED'
  failureCount: number
  maxFailures: number
  description: string
  metadata: Record<string, any>
  notifications: {
    beforePayment: boolean
    onSuccess: boolean
    onFailure: boolean
    reminderDays: number[]
  }
  createdAt: string
  updatedAt: string
}

export interface PaymentPlan {
  id: string
  customerId: string
  originalAmount: number
  remainingAmount: number
  currency: string
  numberOfInstallments: number
  completedInstallments: number
  installmentAmount: number
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'
  startDate: string
  endDate: string
  nextDueDate: string
  status: 'ACTIVE' | 'COMPLETED' | 'DEFAULTED' | 'CANCELLED'
  lateFee: number
  gracePeriodDays: number
  description: string
  installments: PaymentInstallment[]
  createdAt: string
  updatedAt: string
}

export interface PaymentInstallment {
  id: string
  paymentPlanId: string
  installmentNumber: number
  amount: number
  dueDate: string
  paidDate?: string
  paymentId?: string
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'WAIVED'
  lateFeeApplied: number
  createdAt: string
  updatedAt: string
}

export interface RefundRequest {
  id: string
  paymentId: string
  requestedBy: string
  reason: string
  amount: number
  currency: string
  refundType: 'FULL' | 'PARTIAL'
  status: 'PENDING' | 'APPROVED' | 'DENIED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  approvedBy?: string
  approvedAt?: string
  processedAt?: string
  gatewayRefundId?: string
  refundFee: number
  notes?: string
  attachments: string[]
  createdAt: string
  updatedAt: string
}

export interface ChargebackNotice {
  id: string
  paymentId: string
  chargebackId: string
  amount: number
  currency: string
  reason: string
  reasonCode: string
  disputeDate: string
  responseDeadline: string
  status: 'RECEIVED' | 'UNDER_REVIEW' | 'EVIDENCE_SUBMITTED' | 'WON' | 'LOST' | 'EXPIRED'
  liability: 'MERCHANT' | 'ISSUER' | 'PENDING'
  evidence: {
    description: string
    documents: string[]
    submittedAt?: string
  }
  fees: {
    chargebackFee: number
    representmentFee: number
  }
  createdAt: string
  updatedAt: string
}

export interface PaymentAnalytics {
  period: {
    start: string
    end: string
  }
  totalVolume: {
    amount: number
    currency: string
    transactionCount: number
  }
  successRate: number
  averageTransactionValue: number
  topPaymentMethods: Array<{
    method: PaymentMethodType
    volume: number
    count: number
    percentage: number
  }>
  topGateways: Array<{
    gatewayId: string
    name: string
    volume: number
    count: number
    successRate: number
  }>
  declineReasons: Array<{
    reason: string
    count: number
    percentage: number
  }>
  fraudDetection: {
    flaggedTransactions: number
    blockedTransactions: number
    falsePositives: number
    truePositives: number
  }
  fees: {
    totalFees: number
    averageFeePercentage: number
    feesByGateway: Array<{
      gatewayId: string
      totalFees: number
    }>
  }
  chargebacks: {
    count: number
    amount: number
    rate: number // percentage of total volume
  }
  refunds: {
    count: number
    amount: number
    rate: number // percentage of total volume
  }
}

// Request/Response Types
export interface CreatePaymentGatewayRequest {
  name: string
  provider: PaymentGateway['provider']
  configuration: PaymentGateway['configuration']
  isDefault?: boolean
  country: string
}

export interface UpdatePaymentGatewayRequest {
  name?: string
  configuration?: Partial<PaymentGateway['configuration']>
  status?: PaymentGateway['status']
  isDefault?: boolean
}

export interface CreatePaymentMethodRequest {
  customerId: string
  type: PaymentMethodType
  billingAddress: PaymentMethod['billingAddress']
  // Card fields (for credit/debit cards)
  cardNumber?: string
  cardHolderName?: string
  expiryMonth?: number
  expiryYear?: number
  cvv?: string
  // Bank account fields
  bankAccountNumber?: string
  bankRoutingNumber?: string
  bankAccountType?: 'CHECKING' | 'SAVINGS'
  bankName?: string
  // Digital wallet fields
  walletId?: string
  walletProvider?: string
  isDefault?: boolean
}

export interface CreateRecurringPaymentRequest {
  customerId: string
  paymentMethodId: string
  amount: number
  currency: string
  frequency: RecurringPayment['frequency']
  startDate: string
  endDate?: string
  description: string
  invoiceTemplateId?: string
  notifications?: RecurringPayment['notifications']
  metadata?: Record<string, any>
}

export interface CreatePaymentPlanRequest {
  customerId: string
  totalAmount: number
  currency: string
  numberOfInstallments: number
  frequency: PaymentPlan['frequency']
  startDate: string
  lateFee?: number
  gracePeriodDays?: number
  description: string
}

export interface CreateRefundRequest {
  paymentId: string
  amount?: number // If not provided, full refund
  reason: string
  refundType: 'FULL' | 'PARTIAL'
  notes?: string
}

export interface ProcessPaymentRequest {
  customerId: string
  paymentMethodId?: string
  amount: number
  currency: string
  description: string
  invoiceId?: string
  gatewayId?: string
  // For one-time payment method
  paymentMethod?: {
    type: PaymentMethodType
    cardNumber?: string
    expiryMonth?: number
    expiryYear?: number
    cvv?: string
    cardHolderName?: string
    billingAddress?: PaymentMethod['billingAddress']
  }
  metadata?: Record<string, any>
  idempotencyKey?: string
}

// Filter Types
export interface PaymentGatewayFilters {
  provider?: PaymentGateway['provider']
  status?: PaymentGateway['status']
  country?: string
  isDefault?: boolean
}

export interface PaymentMethodFilters {
  customerId?: string
  type?: PaymentMethodType
  status?: PaymentMethod['status']
  isDefault?: boolean
}

export interface RecurringPaymentFilters {
  customerId?: string
  status?: RecurringPayment['status']
  frequency?: RecurringPayment['frequency']
  nextPaymentDateFrom?: string
  nextPaymentDateTo?: string
}

export interface PaymentPlanFilters {
  customerId?: string
  status?: PaymentPlan['status']
  frequency?: PaymentPlan['frequency']
  nextDueDateFrom?: string
  nextDueDateTo?: string
}

export interface RefundRequestFilters {
  status?: RefundRequest['status']
  refundType?: RefundRequest['refundType']
  requestedDateFrom?: string
  requestedDateTo?: string
  requestedBy?: string
}

export interface ChargebackFilters {
  status?: ChargebackNotice['status']
  disputeDateFrom?: string
  disputeDateTo?: string
  reasonCode?: string
}

export interface PaymentAnalyticsFilters {
  dateFrom: string
  dateTo: string
  gatewayId?: string
  paymentMethod?: PaymentMethodType
  currency?: string
  customerId?: string
}