// Expense Management types

export type ExpenseStatus = 'DRAFT' | 'SUBMITTED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PAID' | 'CANCELLED'
export type ExpenseType = 'BUSINESS_MEAL' | 'TRAVEL' | 'OFFICE_SUPPLIES' | 'EQUIPMENT' | 'SOFTWARE' | 'TRAINING' | 'MARKETING' | 'UTILITIES' | 'RENT' | 'OTHER'
export type PaymentMethod = 'PERSONAL_CREDIT_CARD' | 'CORPORATE_CARD' | 'CASH' | 'CHECK' | 'BANK_TRANSFER'
export type ReimbursementStatus = 'NOT_REQUIRED' | 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED'
export type ApprovalAction = 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES'

// Expense Category interfaces
export interface ExpenseCategory {
  id: string
  name: string
  description?: string
  code: string
  accountId: string
  account?: any // Account from accounting types

  // Approval settings
  requiresApproval: boolean
  approvalLimit?: number
  defaultApproverId?: string

  // Policy settings
  allowAttachments: boolean
  requiresReceipt: boolean
  maxAmount?: number

  // Tax settings
  taxDeductible: boolean
  taxCategory?: string

  isActive: boolean
  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface CreateExpenseCategoryRequest {
  name: string
  description?: string
  code: string
  accountId: string
  requiresApproval?: boolean
  approvalLimit?: number
  defaultApproverId?: string
  allowAttachments?: boolean
  requiresReceipt?: boolean
  maxAmount?: number
  taxDeductible?: boolean
  taxCategory?: string
}

// Expense interfaces
export interface ExpenseLineItem {
  id?: string
  description: string
  categoryId: string
  category?: ExpenseCategory
  amount: number
  quantity?: number
  unitPrice?: number
  taxAmount?: number
  notes?: string
}

export interface ExpenseAttachment {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  uploadedAt: string
}

export interface Expense {
  id: string
  expenseNumber: string
  title: string
  description?: string

  // Submitter details
  submittedBy: string
  submittedByUser?: any // User type
  submittedAt: string

  // Expense details
  expenseDate: string
  paymentMethod: PaymentMethod
  currency: string
  exchangeRate?: number

  // Line items
  lineItems: ExpenseLineItem[]
  subtotal: number
  taxTotal: number
  total: number

  // Approval workflow
  status: ExpenseStatus
  currentApproverId?: string
  currentApprover?: any // User type
  approvalChain: ExpenseApproval[]

  // Reimbursement
  reimbursementStatus: ReimbursementStatus
  reimbursementAmount?: number
  reimbursementDate?: string
  reimbursementReference?: string

  // Attachments
  attachments: ExpenseAttachment[]
  hasReceipts: boolean

  // Project/Client assignment
  projectId?: string
  project?: any // Project type
  clientId?: string
  client?: any // Customer type
  billable: boolean

  // Journal entry reference (when posted to accounting)
  journalEntryId?: string
  journalEntry?: any // JournalEntry type

  // Metadata
  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface CreateExpenseRequest {
  title: string
  description?: string
  expenseDate: string
  paymentMethod: PaymentMethod
  currency?: string
  exchangeRate?: number
  lineItems: Omit<ExpenseLineItem, 'id' | 'category'>[]
  projectId?: string
  clientId?: string
  billable?: boolean
}

export interface UpdateExpenseRequest extends Partial<CreateExpenseRequest> {
  status?: ExpenseStatus
}

// Approval workflow interfaces
export interface ExpenseApproval {
  id: string
  expenseId: string
  approverId: string
  approver?: any // User type

  // Approval details
  level: number
  action?: ApprovalAction
  comments?: string
  approvedAt?: string

  // Amount approved (can be different from requested)
  requestedAmount: number
  approvedAmount?: number

  // Notifications
  notifiedAt?: string
  reminderCount: number

  createdAt: string
  updatedAt: string
}

export interface CreateApprovalRequest {
  action: ApprovalAction
  comments?: string
  approvedAmount?: number
}

// Expense Report interfaces
export interface ExpenseReport {
  id: string
  reportNumber: string
  title: string
  description?: string

  // Period
  periodStart: string
  periodEnd: string

  // Submitter
  submittedBy: string
  submittedByUser?: any // User type
  submittedAt: string

  // Expenses included
  expenseIds: string[]
  expenses: Expense[]

  // Totals
  subtotal: number
  taxTotal: number
  total: number
  reimbursableAmount: number

  // Status
  status: ExpenseStatus
  approvalChain: ExpenseApproval[]

  organizationId: string
  createdAt: string
  updatedAt: string
}

// Expense Policy interfaces
export interface ExpensePolicy {
  id: string
  name: string
  description: string

  // Policy rules
  rules: ExpensePolicyRule[]

  // Applicability
  appliesToRoles: string[]
  appliesToUsers: string[]
  appliesToDepartments: string[]

  // Approval workflow
  approvalWorkflow: ExpenseApprovalWorkflow

  isActive: boolean
  effectiveDate: string
  expiryDate?: string

  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface ExpensePolicyRule {
  id: string
  type: 'MAX_AMOUNT' | 'CATEGORY_LIMIT' | 'REQUIRE_RECEIPT' | 'REQUIRE_APPROVAL' | 'ALLOWED_CATEGORIES'
  categoryId?: string
  maxAmount?: number
  requiresReceipt?: boolean
  requiresApproval?: boolean
  allowedCategories?: string[]
  description: string
}

export interface ExpenseApprovalWorkflow {
  id: string
  name: string
  steps: ExpenseApprovalStep[]
}

export interface ExpenseApprovalStep {
  level: number
  name: string
  approverId?: string
  approverRole?: string
  condition?: string // e.g., "amount > 1000"
  required: boolean
}

// Filter and search interfaces
export interface ExpenseFilters {
  status?: ExpenseStatus[]
  submittedBy?: string
  categoryId?: string
  paymentMethod?: PaymentMethod
  reimbursementStatus?: ReimbursementStatus
  projectId?: string
  clientId?: string
  billable?: boolean
  dateFrom?: string
  dateTo?: string
  amountMin?: number
  amountMax?: number
  search?: string
}

export interface ExpenseReportFilters {
  status?: ExpenseStatus[]
  submittedBy?: string
  periodStart?: string
  periodEnd?: string
  search?: string
}

// Analytics interfaces
export interface ExpenseAnalytics {
  totalExpenses: number
  totalAmount: number
  averageExpense: number
  pendingApprovals: number

  byCategory: {
    categoryId: string
    categoryName: string
    count: number
    amount: number
    percentage: number
  }[]

  byStatus: {
    status: ExpenseStatus
    count: number
    amount: number
  }[]

  byMonth: {
    month: string
    count: number
    amount: number
  }[]

  topSpenders: {
    userId: string
    userName: string
    count: number
    amount: number
  }[]

  reimbursementSummary: {
    pending: number
    processing: number
    paid: number
    totalOwed: number
  }
}

// Mileage tracking (for travel expenses)
export interface MileageEntry {
  id: string
  expenseId: string

  fromLocation: string
  toLocation: string
  distance: number
  purpose: string

  rate: number
  amount: number

  vehicleInfo?: string

  createdAt: string
}

// Expense import/export interfaces
export interface ExpenseImportMapping {
  dateColumn: string
  descriptionColumn: string
  amountColumn: string
  categoryColumn?: string
  projectColumn?: string
}

export interface ExpenseExportRequest {
  format: 'CSV' | 'EXCEL' | 'PDF'
  filters?: ExpenseFilters
  includeAttachments?: boolean
  groupBy?: 'category' | 'status' | 'submitter' | 'month'
}