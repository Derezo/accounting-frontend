// Tax Management and Compliance types

export type TaxType = 'SALES_TAX' | 'USE_TAX' | 'PAYROLL_TAX' | 'INCOME_TAX' | 'PROPERTY_TAX' | 'EXCISE_TAX' | 'VAT' | 'GST' | 'HST'
export type TaxStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
export type TaxFilingStatus = 'NOT_FILED' | 'DRAFT' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'AMENDED'
export type TaxPaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'REFUNDED'
export type FilingFrequency = 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY' | 'SEMI_ANNUALLY' | 'WEEKLY'
export type ComplianceStatus = 'COMPLIANT' | 'AT_RISK' | 'NON_COMPLIANT' | 'PENDING_REVIEW'

// Tax Jurisdiction interfaces
export interface TaxJurisdiction {
  id: string
  name: string
  code: string
  type: 'FEDERAL' | 'STATE' | 'PROVINCIAL' | 'LOCAL' | 'COUNTY' | 'CITY'
  parentJurisdictionId?: string
  parentJurisdiction?: TaxJurisdiction

  // Contact information
  taxAuthorityName: string
  contactEmail?: string
  contactPhone?: string
  website?: string
  filingAddress?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }

  // Configuration
  isActive: boolean
  effectiveDate: string
  expiryDate?: string

  organizationId: string
  createdAt: string
  updatedAt: string
}

// Tax Rate interfaces
export interface TaxRate {
  id: string
  jurisdictionId: string
  jurisdiction?: TaxJurisdiction

  name: string
  description?: string
  type: TaxType
  rate: number // Percentage (e.g., 8.25 for 8.25%)

  // Rate tiers (for progressive tax systems)
  tiers?: TaxRateTier[]

  // Applicability
  minThreshold?: number
  maxThreshold?: number
  applicableCategories?: string[]
  exemptCategories?: string[]

  // Effective period
  effectiveDate: string
  expiryDate?: string

  isActive: boolean
  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface TaxRateTier {
  id: string
  minAmount: number
  maxAmount?: number
  rate: number
  fixedAmount?: number
}

// Tax Liability interfaces
export interface TaxLiability {
  id: string
  jurisdictionId: string
  jurisdiction?: TaxJurisdiction
  taxRateId: string
  taxRate?: TaxRate

  type: TaxType
  description: string

  // Calculation details
  taxableAmount: number
  taxRate: number
  calculatedTax: number
  adjustments: number
  totalTax: number

  // Period
  periodStart: string
  periodEnd: string
  dueDate: string

  // Source tracking
  sourceType: 'TRANSACTION' | 'PAYROLL' | 'ADJUSTMENT' | 'MANUAL'
  sourceId?: string
  sourceReference?: string

  // Payment tracking
  paymentStatus: TaxPaymentStatus
  paidAmount: number
  paidDate?: string
  paymentReference?: string

  // Filing
  filingStatus: TaxFilingStatus
  filedDate?: string
  filingReference?: string

  organizationId: string
  createdAt: string
  updatedAt: string
}

// Tax Return interfaces
export interface TaxReturn {
  id: string
  returnNumber: string
  jurisdictionId: string
  jurisdiction?: TaxJurisdiction

  type: TaxType
  filingFrequency: FilingFrequency

  // Period
  periodStart: string
  periodEnd: string
  dueDate: string
  extensionDate?: string

  // Financial data
  grossIncome?: number
  deductions?: number
  exemptions?: number
  taxableIncome?: number
  calculatedTax: number
  paymentsApplied: number
  refundAmount?: number
  balanceDue?: number

  // Status
  status: TaxFilingStatus
  paymentStatus: TaxPaymentStatus

  // Filing details
  preparedBy: string
  preparedByUser?: any // User type
  preparedDate?: string
  reviewedBy?: string
  reviewedByUser?: any // User type
  reviewedDate?: string
  submittedDate?: string
  acceptedDate?: string

  // Attachments and supporting documents
  attachments: TaxReturnAttachment[]
  schedules: TaxReturnSchedule[]

  // Amendments
  isAmendment: boolean
  originalReturnId?: string
  amendmentReason?: string

  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface TaxReturnAttachment {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  documentType: 'W2' | '1099' | 'RECEIPT' | 'SUPPORTING_DOCUMENT' | 'FORM' | 'SCHEDULE' | 'OTHER'
  uploadedAt: string
}

export interface TaxReturnSchedule {
  id: string
  scheduleType: string
  name: string
  data: Record<string, any>
  attachments: TaxReturnAttachment[]
}

// Tax Compliance interfaces
export interface TaxComplianceRequirement {
  id: string
  jurisdictionId: string
  jurisdiction?: TaxJurisdiction

  name: string
  description: string
  type: TaxType

  // Requirement details
  filingFrequency: FilingFrequency
  filingDayOfMonth: number
  filingDayOfWeek?: number
  gracePeriodDays: number
  penaltyRate?: number
  interestRate?: number

  // Thresholds
  minimumThreshold?: number
  registrationRequired: boolean

  // Notifications
  reminderDaysBefore: number[]

  isActive: boolean
  effectiveDate: string
  expiryDate?: string

  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface TaxComplianceStatus {
  id: string
  requirementId: string
  requirement?: TaxComplianceRequirement

  periodStart: string
  periodEnd: string
  dueDate: string

  status: ComplianceStatus
  filingStatus: TaxFilingStatus
  paymentStatus: TaxPaymentStatus

  // Risk assessment
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  riskFactors: string[]

  // Actions required
  actionsRequired: TaxAction[]

  // Last review
  lastReviewDate?: string
  lastReviewedBy?: string
  nextReviewDate?: string

  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface TaxAction {
  id: string
  type: 'FILE_RETURN' | 'MAKE_PAYMENT' | 'REGISTER' | 'RENEW_LICENSE' | 'SUBMIT_DOCUMENTS' | 'RESPOND_TO_NOTICE'
  description: string
  dueDate: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE'
  assignedTo?: string
  completedDate?: string
  notes?: string
}

// Tax Payment interfaces
export interface TaxPayment {
  id: string
  paymentNumber: string

  // Tax details
  jurisdictionId: string
  jurisdiction?: TaxJurisdiction
  taxType: TaxType
  taxPeriodStart: string
  taxPeriodEnd: string

  // Payment details
  amount: number
  paymentDate: string
  paymentMethod: 'ACH' | 'CHECK' | 'WIRE' | 'CREDIT_CARD' | 'CASH' | 'EFTPS' | 'ONLINE'
  confirmationNumber?: string

  // Classification
  paymentType: 'ESTIMATED' | 'EXTENSION' | 'BALANCE_DUE' | 'PENALTY' | 'INTEREST' | 'REFUND_OFFSET'

  // References
  taxReturnId?: string
  liabilityId?: string
  journalEntryId?: string

  // Status
  status: 'PENDING' | 'PROCESSED' | 'FAILED' | 'CANCELLED' | 'REFUNDED'

  organizationId: string
  createdAt: string
  updatedAt: string
}

// Tax Notice interfaces
export interface TaxNotice {
  id: string
  noticeNumber: string

  jurisdictionId: string
  jurisdiction?: TaxJurisdiction

  type: 'AUDIT' | 'ASSESSMENT' | 'PENALTY' | 'INTEREST' | 'REFUND' | 'CORRESPONDENCE' | 'LIEN' | 'LEVY'
  subject: string
  description: string

  // Important dates
  receivedDate: string
  responseDeadline?: string
  auditDate?: string

  // Financial impact
  assessedAmount?: number
  penaltyAmount?: number
  interestAmount?: number
  totalAmount?: number

  // Status
  status: 'RECEIVED' | 'UNDER_REVIEW' | 'RESPONDED' | 'RESOLVED' | 'APPEALED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

  // Response tracking
  responseDate?: string
  responseMethod?: string
  responseReference?: string

  // Related records
  relatedReturnIds: string[]
  relatedPaymentIds: string[]

  // Documents
  originalDocument?: TaxReturnAttachment
  responseDocuments: TaxReturnAttachment[]

  // Assignment
  assignedTo?: string
  assignedToUser?: any // User type

  organizationId: string
  createdAt: string
  updatedAt: string
}

// Tax Calculation interfaces
export interface TaxCalculationRequest {
  transactionDate: string
  jurisdictionId: string
  taxType: TaxType
  taxableAmount: number
  customerType?: 'BUSINESS' | 'INDIVIDUAL' | 'NONPROFIT' | 'GOVERNMENT'
  productCategories?: string[]
  exemptionCertificates?: string[]
}

export interface TaxCalculationResult {
  jurisdictionId: string
  jurisdiction: TaxJurisdiction
  taxType: TaxType
  taxRate: number
  taxableAmount: number
  exemptAmount: number
  taxAmount: number
  details: TaxCalculationDetail[]
}

export interface TaxCalculationDetail {
  rateId: string
  rateName: string
  rate: number
  taxableAmount: number
  taxAmount: number
  description?: string
}

// Filter and search interfaces
export interface TaxFilters {
  jurisdictionId?: string
  taxType?: TaxType
  status?: TaxFilingStatus
  paymentStatus?: TaxPaymentStatus
  dateFrom?: string
  dateTo?: string
  dueFrom?: string
  dueTo?: string
  search?: string
}

export interface TaxComplianceFilters {
  jurisdictionId?: string
  status?: ComplianceStatus
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  dateFrom?: string
  dateTo?: string
  search?: string
}

// Analytics interfaces
export interface TaxAnalytics {
  totalTaxLiability: number
  totalTaxPaid: number
  outstandingBalance: number
  overdueAmount: number

  liabilityByType: {
    type: TaxType
    amount: number
    percentage: number
  }[]

  liabilityByJurisdiction: {
    jurisdictionId: string
    jurisdictionName: string
    amount: number
    percentage: number
  }[]

  complianceOverview: {
    compliant: number
    atRisk: number
    nonCompliant: number
    pendingReview: number
  }

  upcomingDeadlines: {
    date: string
    description: string
    amount?: number
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  }[]

  monthlyTrend: {
    month: string
    liability: number
    payments: number
    net: number
  }[]
}

// Create/Update request interfaces
export interface CreateTaxJurisdictionRequest {
  name: string
  code: string
  type: 'FEDERAL' | 'STATE' | 'PROVINCIAL' | 'LOCAL' | 'COUNTY' | 'CITY'
  parentJurisdictionId?: string
  taxAuthorityName: string
  contactEmail?: string
  contactPhone?: string
  website?: string
  filingAddress?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  effectiveDate?: string
}

export interface CreateTaxRateRequest {
  jurisdictionId: string
  name: string
  description?: string
  type: TaxType
  rate: number
  tiers?: Omit<TaxRateTier, 'id'>[]
  minThreshold?: number
  maxThreshold?: number
  applicableCategories?: string[]
  exemptCategories?: string[]
  effectiveDate?: string
  expiryDate?: string
}

export interface CreateTaxReturnRequest {
  jurisdictionId: string
  type: TaxType
  filingFrequency: FilingFrequency
  periodStart: string
  periodEnd: string
  dueDate: string
  extensionDate?: string
  grossIncome?: number
  deductions?: number
  exemptions?: number
  schedules?: Omit<TaxReturnSchedule, 'id' | 'attachments'>[]
}

export interface CreateTaxPaymentRequest {
  jurisdictionId: string
  taxType: TaxType
  taxPeriodStart: string
  taxPeriodEnd: string
  amount: number
  paymentDate: string
  paymentMethod: 'ACH' | 'CHECK' | 'WIRE' | 'CREDIT_CARD' | 'CASH' | 'EFTPS' | 'ONLINE'
  paymentType: 'ESTIMATED' | 'EXTENSION' | 'BALANCE_DUE' | 'PENALTY' | 'INTEREST' | 'REFUND_OFFSET'
  confirmationNumber?: string
  taxReturnId?: string
  liabilityId?: string
}

export interface CreateTaxNoticeRequest {
  jurisdictionId: string
  noticeNumber: string
  type: 'AUDIT' | 'ASSESSMENT' | 'PENALTY' | 'INTEREST' | 'REFUND' | 'CORRESPONDENCE' | 'LIEN' | 'LEVY'
  subject: string
  description: string
  receivedDate: string
  responseDeadline?: string
  assessedAmount?: number
  penaltyAmount?: number
  interestAmount?: number
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
}