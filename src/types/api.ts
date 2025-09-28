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
export type CustomerTier = 'PERSONAL' | 'BUSINESS' | 'ENTERPRISE' | 'EMERGENCY'
export type CustomerStatus = 'PROSPECT' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED'
export type BusinessType = 'SOLE_PROPRIETORSHIP' | 'PARTNERSHIP' | 'CORPORATION' | 'LLC' | 'NON_PROFIT' | 'GOVERNMENT'

export type QuoteStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'REVISED'
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED'
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
export type PaymentMethod = 'STRIPE_CARD' | 'INTERAC_ETRANSFER' | 'BANK_TRANSFER' | 'CASH' | 'CHEQUE' | 'OTHER'
export type ProjectStatus = 'QUOTED' | 'APPROVED' | 'SCHEDULED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED'
export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
export type AppointmentType = 'CONSULTATION' | 'SITE_VISIT' | 'FOLLOW_UP' | 'EMERGENCY'
export type AppointmentPriority = 'LOW' | 'MEDIUM' | 'HIGH'
export type ProjectType = 'CONSULTING' | 'DEVELOPMENT' | 'MAINTENANCE' | 'AUDIT' | 'TRAINING' | 'SUPPORT'
export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH'
export type ETransferStatus = 'PENDING' | 'SENT' | 'RECEIVED' | 'EXPIRED' | 'CANCELLED'
export type PaymentPlanStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'DEFAULTED'

// User role types to match backend
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'ACCOUNTANT' | 'EMPLOYEE' | 'VIEWER'

// Organization types
export type OrganizationType = 'SINGLE_BUSINESS' | 'MULTI_LOCATION' | 'FRANCHISE' | 'ENTERPRISE'

// Audit types
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'IMPORT' | 'REFUND' | 'AUTHORIZE'
export type AuditCategory = 'AUTH' | 'DATA' | 'SYSTEM' | 'SECURITY' | 'FINANCIAL'
export type AuditSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

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

// Appointment Management interfaces
export interface Appointment {
  id: string
  customerId: string
  customer?: Customer
  projectId?: string
  project?: Project

  title: string
  description?: string
  type: AppointmentType
  status: AppointmentStatus

  // Scheduling
  startTime: string
  endTime: string
  duration: number // minutes
  timezone: string

  // Location (virtual or physical)
  location?: {
    type: 'virtual' | 'physical' | 'phone'
    address?: Address
    meetingUrl?: string
    phone?: string
    instructions?: string
  }

  // Participants
  attendees: Array<{
    id: string
    name: string
    email: string
    role: 'organizer' | 'required' | 'optional'
    status: 'pending' | 'accepted' | 'declined' | 'tentative'
  }>

  // Preparation and follow-up
  agenda?: string
  requirements?: string[]
  notes?: string
  followUpRequired: boolean
  followUpDate?: string

  // Billing
  billable: boolean
  hourlyRate?: number
  estimatedCost?: number

  // Notifications
  reminders: Array<{
    id: string
    type: 'email' | 'sms' | 'push'
    timing: number // minutes before
    sent: boolean
  }>

  // Metadata
  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface CreateAppointmentRequest {
  customerId: string
  projectId?: string
  title: string
  description?: string
  type: AppointmentType
  startTime: string
  endTime: string
  timezone: string
  location?: Appointment['location']
  attendees?: Omit<Appointment['attendees'][0], 'id' | 'status'>[]
  agenda?: string
  requirements?: string[]
  billable?: boolean
  hourlyRate?: number
  reminders?: Omit<Appointment['reminders'][0], 'id' | 'sent'>[]
}

export interface UpdateAppointmentRequest extends Partial<CreateAppointmentRequest> {
  status?: AppointmentStatus
  notes?: string
  followUpRequired?: boolean
  followUpDate?: string
}

export interface AppointmentFilters {
  customerId?: string
  projectId?: string
  type?: AppointmentType
  status?: AppointmentStatus
  dateFrom?: string
  dateTo?: string
  billable?: boolean
  search?: string
}

// Project Management interfaces
export interface Project {
  id: string
  customerId: string
  customer?: Customer

  name: string
  description?: string
  status: ProjectStatus
  priority: 'low' | 'medium' | 'high' | 'critical'

  // Timeline
  startDate?: string
  endDate?: string
  estimatedHours?: number
  actualHours?: number

  // Financial
  budget?: number
  totalCost?: number
  hourlyRate?: number
  fixedPrice?: boolean

  // Team and assignments
  assignedUsers: Array<{
    userId: string
    role: string
    hourlyRate?: number
    allocation?: number // percentage
  }>

  // Progress tracking
  progress: number // 0-100
  milestones: Array<{
    id: string
    name: string
    description?: string
    dueDate: string
    completed: boolean
    completedAt?: string
  }>

  // Resources and deliverables
  deliverables: Array<{
    id: string
    name: string
    description?: string
    type: 'document' | 'software' | 'service' | 'other'
    status: 'pending' | 'in_progress' | 'completed' | 'delivered'
    dueDate?: string
    deliveredAt?: string
  }>

  // Documentation
  requirements?: string
  notes?: string
  riskAssessment?: string

  // Related entities
  quoteId?: string
  invoiceIds?: string[]

  // Metadata
  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface CreateProjectRequest {
  customerId: string
  name: string
  description?: string
  priority?: Project['priority']
  startDate?: string
  endDate?: string
  estimatedHours?: number
  budget?: number
  hourlyRate?: number
  fixedPrice?: boolean
  assignedUsers?: Project['assignedUsers']
  requirements?: string
  quoteId?: string
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  status?: ProjectStatus
  actualHours?: number
  totalCost?: number
  progress?: number
  notes?: string
  riskAssessment?: string
}

export interface ProjectFilters {
  customerId?: string
  status?: ProjectStatus
  priority?: Project['priority']
  assignedUserId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

// Enhanced Payment interfaces
export interface ETransfer {
  id: string
  customerId: string
  customer?: Customer
  invoiceId?: string
  invoice?: Invoice

  amount: number
  currency: string

  status: ETransferStatus
  referenceNumber: string

  // e-Transfer details
  recipientEmail: string
  securityQuestion: string
  securityAnswer: string // encrypted

  // Processing
  sentAt?: string
  receivedAt?: string
  expiresAt: string

  // Banking
  bankReference?: string
  fees: number

  // Notifications
  emailSent: boolean
  confirmationSent: boolean

  // Metadata
  notes?: string
  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface CreateETransferRequest {
  customerId: string
  invoiceId?: string
  amount: number
  recipientEmail: string
  securityQuestion: string
  securityAnswer: string
  expiresAt?: string
  notes?: string
}

export interface ETransferFilters {
  customerId?: string
  invoiceId?: string
  status?: ETransferStatus
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
  search?: string
}

export interface PaymentPlan {
  id: string
  customerId: string
  customer?: Customer
  invoiceId?: string
  invoice?: Invoice

  totalAmount: number
  remainingAmount: number
  currency: string

  status: PaymentPlanStatus

  // Schedule
  installments: Array<{
    id: string
    sequenceNumber: number
    amount: number
    dueDate: string
    status: 'pending' | 'paid' | 'overdue' | 'skipped'
    paidAt?: string
    paymentId?: string
  }>

  // Terms
  interestRate?: number
  lateFeeAmount?: number
  lateFeePercentage?: number

  // Metadata
  notes?: string
  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface CreatePaymentPlanRequest {
  customerId: string
  invoiceId?: string
  totalAmount: number
  installments: Array<{
    amount: number
    dueDate: string
  }>
  interestRate?: number
  lateFeeAmount?: number
  lateFeePercentage?: number
  notes?: string
}

// User Management interfaces
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  organizationId: string
  organizationName?: string
  isActive: boolean
  emailVerified?: boolean
  phone?: string
  avatar?: string
  lastLoginAt?: string
  lastLoginIp?: string
  failedAttempts?: number
  lockedUntil?: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserRequest {
  email: string
  firstName: string
  lastName: string
  role: UserRole
  phone?: string
  isActive?: boolean
  password: string
  sendInvite?: boolean
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  isActive?: boolean
}

export interface UserFilters {
  role?: UserRole
  isActive?: boolean
  search?: string
  emailVerified?: boolean
}