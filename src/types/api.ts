// Base API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Common types
export type CustomerType = 'PERSON' | 'BUSINESS'
export type CustomerTier = 'PERSONAL' | 'SMALL_BUSINESS' | 'ENTERPRISE' | 'EMERGENCY'
export type CustomerStatus = 'PROSPECT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
export type BusinessType = 'SOLE_PROPRIETORSHIP' | 'PARTNERSHIP' | 'CORPORATION' | 'LLC' | 'NON_PROFIT' | 'GOVERNMENT'

export type QuoteStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'PAID' | 'OVERDUE' | 'CANCELLED'
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
export type PaymentMethod = 'CREDIT_CARD' | 'BANK_TRANSFER' | 'PAYPAL' | 'STRIPE' | 'CASH' | 'CHECK' | 'OTHER'
export type ProjectStatus = 'PLANNED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED'

// Customer interfaces
export interface Address {
  street: string
  city: string
  province: string
  postalCode: string
  country: string
}

export interface Person {
  firstName: string
  lastName: string
  dateOfBirth?: string
}

export interface Business {
  businessName: string
  legalName?: string
  businessNumber?: string
  taxNumber?: string
  businessType: BusinessType
}

export interface Customer {
  id: string
  type: CustomerType
  tier: CustomerTier
  status: CustomerStatus
  email?: string
  phone?: string
  website?: string

  // Contact information
  person?: Person
  business?: Business
  address?: Address

  // Financial settings
  creditLimit?: number
  paymentTerms: number
  taxExempt: boolean

  // Metadata
  notes?: string
  tags: string[]
  organizationId: string
  createdAt: string
  updatedAt: string
}

// Quote interfaces
export interface QuoteLineItem {
  id?: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  total?: number
}

export interface Quote {
  id: string
  quoteNumber: string
  customerId: string
  customer?: Customer
  status: QuoteStatus

  validUntil: string
  items: QuoteLineItem[]

  // Calculated totals
  subtotal: number
  taxAmount: number
  total: number

  // Metadata
  notes?: string
  terms?: string
  organizationId: string
  createdAt: string
  updatedAt: string
}

// Invoice interfaces
export interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customer?: Customer
  quoteId?: string
  quote?: Quote
  status: InvoiceStatus

  issueDate: string
  dueDate: string
  items: QuoteLineItem[]

  // Calculated totals
  subtotal: number
  taxAmount: number
  total: number
  amountPaid: number
  amountDue: number

  // Metadata
  notes?: string
  terms?: string
  organizationId: string
  createdAt: string
  updatedAt: string
}

// Payment interfaces
export interface Payment {
  id: string
  paymentNumber: string
  customerId: string
  customer?: Customer
  invoiceId?: string
  invoice?: Invoice

  amount: number
  method: PaymentMethod
  status: PaymentStatus
  paymentDate: string

  // Payment details
  reference?: string
  transactionId?: string
  fees: number

  // Payment processing
  stripePaymentIntentId?: string
  stripePaymentMethodId?: string
  eTransferDetails?: {
    recipientEmail: string
    securityQuestion: string
    securityAnswer: string
    referenceNumber?: string
  }

  // Metadata
  notes?: string
  processedAt?: string
  organizationId: string
  createdAt: string
  updatedAt: string
}

// Project interfaces
export interface Project {
  id: string
  customerId: string
  customer?: Customer
  quoteId?: string
  quote?: Quote
  invoiceId?: string
  invoice?: Invoice

  title: string
  description?: string
  status: ProjectStatus

  startDate?: string
  endDate?: string
  estimatedHours?: number
  actualHours?: number

  // Metadata
  notes?: string
  organizationId: string
  createdAt: string
  updatedAt: string
}

// Analytics interfaces
export interface RevenueAnalytics {
  period: string
  totalRevenue: number
  paidInvoices: number
  pendingRevenue: number
  overdue: number
  growth: number
}

export interface CustomerAnalytics {
  totalCustomers: number
  newCustomers: number
  activeCustomers: number
  customersByTier: Record<CustomerTier, number>
  customersByType: Record<CustomerType, number>
}

export interface PaymentAnalytics {
  totalPayments: number
  successfulPayments: number
  failedPayments: number
  paymentsByMethod: Record<PaymentMethod, number>
  averagePaymentTime: number
}

// Filter and search interfaces
export interface CustomerFilters {
  type?: CustomerType
  tier?: CustomerTier
  status?: CustomerStatus
  search?: string
  tags?: string[]
}

export interface QuoteFilters {
  status?: QuoteStatus
  customerId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

export interface InvoiceFilters {
  status?: InvoiceStatus
  customerId?: string
  dateFrom?: string
  dateTo?: string
  overdue?: boolean
  search?: string
}

export interface PaymentFilters {
  status?: PaymentStatus
  method?: PaymentMethod
  customerId?: string
  invoiceId?: string
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
  search?: string
}

// Form data interfaces
export interface CreateCustomerRequest {
  type: CustomerType
  tier?: CustomerTier
  email?: string
  phone?: string
  website?: string
  person?: Partial<Person>
  business?: Partial<Business>
  address?: Partial<Address>
  creditLimit?: number
  paymentTerms?: number
  taxExempt?: boolean
  notes?: string
  tags?: string[]
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {
  status?: CustomerStatus
}

export interface CreateQuoteRequest {
  customerId: string
  validUntil: string
  items: Omit<QuoteLineItem, 'id' | 'total'>[]
  notes?: string
  terms?: string
}

export interface UpdateQuoteRequest extends Partial<CreateQuoteRequest> {
  status?: QuoteStatus
}

export interface CreateInvoiceRequest {
  customerId: string
  quoteId?: string
  dueDate: string
  items?: Omit<QuoteLineItem, 'id' | 'total'>[]
  notes?: string
  terms?: string
}

export interface CreatePaymentRequest {
  customerId: string
  invoiceId?: string
  amount: number
  method: PaymentMethod
  paymentDate: string
  reference?: string
  transactionId?: string
  fees?: number
  stripePaymentMethodId?: string
  eTransferDetails?: {
    recipientEmail: string
    securityQuestion: string
    securityAnswer: string
  }
  notes?: string
}

// Organization and Template interfaces
export interface OrganizationSettings {
  id: string
  companyName: string
  legalName?: string
  email: string
  phone?: string
  website?: string

  // Address
  address: Address

  // Branding
  logo?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string

  // Business details
  businessNumber?: string
  taxNumber?: string

  // Banking details for payments
  bankingDetails?: {
    bankName: string
    accountName: string
    accountNumber: string
    routingNumber: string
    swiftCode?: string
  }

  // Invoice settings
  invoiceSettings: InvoiceSettings

  // Metadata
  createdAt: string
  updatedAt: string
}

export interface InvoiceSettings {
  // Numbering
  invoicePrefix: string
  invoiceNumberFormat: string // e.g., "INV-{YYYY}-{MM}-{###}"
  nextInvoiceNumber: number

  // Default terms
  defaultPaymentTerms: number // days
  defaultNotes?: string
  defaultTermsAndConditions?: string

  // Template settings
  template: InvoiceTemplate

  // Email settings
  emailSubject: string
  emailTemplate: string

  // Footer
  footerText?: string
  showBankingDetails: boolean
}

export interface InvoiceTemplate {
  id: string
  name: string
  layout: 'classic' | 'modern' | 'minimal' | 'creative'

  // Header section
  showLogo: boolean
  logoPosition: 'left' | 'center' | 'right'
  headerLayout: 'horizontal' | 'vertical'

  // Colors and styling
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  fontSize: number

  // Sections to show/hide
  sections: {
    customerDetails: boolean
    invoiceDetails: boolean
    lineItems: boolean
    subtotals: boolean
    taxBreakdown: boolean
    paymentTerms: boolean
    notes: boolean
    termsAndConditions: boolean
    bankingDetails: boolean
    footer: boolean
  }

  // Line items configuration
  lineItemColumns: {
    description: boolean
    quantity: boolean
    unitPrice: boolean
    taxRate: boolean
    total: boolean
  }

  // Custom fields
  customFields: Array<{
    id: string
    name: string
    value: string
    position: 'header' | 'footer' | 'beforeItems' | 'afterItems'
  }>

  // Watermark
  watermark?: {
    text: string
    opacity: number
    position: 'center' | 'diagonal'
  }

  // Metadata
  isDefault: boolean
  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface InvoicePdfOptions {
  template: InvoiceTemplate
  invoice: Invoice
  organization: OrganizationSettings
  watermark?: string
  language?: 'en' | 'fr' | 'es' // Extensible for i18n
}