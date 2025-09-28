// Chart of Accounts and Accounting-specific types

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE'
export type AccountSubType =
  // Assets
  | 'CURRENT_ASSET' | 'FIXED_ASSET' | 'OTHER_ASSET'
  // Liabilities
  | 'CURRENT_LIABILITY' | 'LONG_TERM_LIABILITY' | 'OTHER_LIABILITY'
  // Equity
  | 'OWNERS_EQUITY' | 'RETAINED_EARNINGS' | 'CAPITAL'
  // Revenue
  | 'OPERATING_REVENUE' | 'OTHER_REVENUE'
  // Expenses
  | 'OPERATING_EXPENSE' | 'OTHER_EXPENSE' | 'COST_OF_GOODS_SOLD'

export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
export type FinancialStatementType = 'BALANCE_SHEET' | 'INCOME_STATEMENT' | 'CASH_FLOW'

// Chart of Accounts interfaces
export interface Account {
  id: string
  code: string
  name: string
  description?: string
  type: AccountType
  subType: AccountSubType
  status: AccountStatus

  // Hierarchy
  parentAccountId?: string
  parentAccount?: Account
  childAccounts?: Account[]
  level: number

  // Financial statement mapping
  statementType: FinancialStatementType
  statementSection?: string

  // Balance tracking
  currentBalance: number
  debitBalance: number
  creditBalance: number

  // Configuration
  allowTransactions: boolean
  requireSubAccounts: boolean
  taxDeductible?: boolean

  // Metadata
  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface CreateAccountRequest {
  code: string
  name: string
  description?: string
  type: AccountType
  subType: AccountSubType
  parentAccountId?: string
  statementSection?: string
  allowTransactions?: boolean
  requireSubAccounts?: boolean
  taxDeductible?: boolean
}

export interface UpdateAccountRequest extends Partial<CreateAccountRequest> {
  status?: AccountStatus
}

export interface AccountFilters {
  type?: AccountType
  subType?: AccountSubType
  status?: AccountStatus
  parentAccountId?: string
  statementType?: FinancialStatementType
  search?: string
  includeInactive?: boolean
}

// Journal Entry interfaces
export type JournalEntryType = 'STANDARD' | 'ADJUSTING' | 'CLOSING' | 'REVERSING'
export type JournalEntryStatus = 'DRAFT' | 'POSTED' | 'REVERSED'

export interface JournalEntryLine {
  id?: string
  accountId: string
  account?: Account
  description: string
  debitAmount: number
  creditAmount: number
  reference?: string
}

export interface JournalEntry {
  id: string
  entryNumber: string
  date: string
  type: JournalEntryType
  status: JournalEntryStatus
  description: string
  reference?: string

  // Lines (must balance)
  lines: JournalEntryLine[]
  totalDebits: number
  totalCredits: number

  // Source tracking
  sourceType?: string // 'INVOICE', 'PAYMENT', 'MANUAL', etc.
  sourceId?: string

  // Approval workflow
  createdBy: string
  approvedBy?: string
  approvedAt?: string
  reversedBy?: string
  reversedAt?: string
  reversalEntryId?: string

  // Metadata
  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface CreateJournalEntryRequest {
  date: string
  type: JournalEntryType
  description: string
  reference?: string
  lines: Omit<JournalEntryLine, 'id' | 'account'>[]
  sourceType?: string
  sourceId?: string
}

export interface UpdateJournalEntryRequest extends Partial<CreateJournalEntryRequest> {
  status?: JournalEntryStatus
}

export interface JournalEntryFilters {
  type?: JournalEntryType
  status?: JournalEntryStatus
  accountId?: string
  dateFrom?: string
  dateTo?: string
  sourceType?: string
  search?: string
}

// General Ledger interfaces
export interface GeneralLedgerEntry {
  id: string
  accountId: string
  account?: Account
  journalEntryId: string
  journalEntry?: JournalEntry

  date: string
  description: string
  reference?: string

  debitAmount: number
  creditAmount: number
  runningBalance: number

  // Source tracking
  sourceType?: string
  sourceId?: string

  organizationId: string
  createdAt: string
}

export interface GeneralLedgerFilters {
  accountId?: string
  dateFrom?: string
  dateTo?: string
  sourceType?: string
  search?: string
}

// Trial Balance interfaces
export interface TrialBalanceEntry {
  accountId: string
  account: Account
  debitBalance: number
  creditBalance: number
  netBalance: number
}

export interface TrialBalanceAccount {
  id: string
  code: string
  name: string
  description?: string
  type: AccountType
  debitBalance: number
  creditBalance: number
  netBalance: number
  isActive?: boolean
}

export interface TrialBalance {
  asOfDate: string
  entries: TrialBalanceEntry[]
  accounts: TrialBalanceAccount[]
  totalDebits: number
  totalCredits: number
  isBalanced: boolean
  organizationId: string
  generatedAt: string
}

// Bank Reconciliation interfaces
export type ReconciliationStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DISCREPANCY'
export type BankTransactionStatus = 'UNMATCHED' | 'MATCHED' | 'VERIFIED' | 'DISPUTED'

export interface BankTransaction {
  id: string
  accountId: string
  account?: Account

  transactionDate: string
  description: string
  amount: number
  type: 'DEBIT' | 'CREDIT'

  // Bank details
  bankReference: string
  checkNumber?: string
  counterparty?: string

  // Matching
  status: BankTransactionStatus
  matchedJournalEntryId?: string
  matchedJournalEntry?: JournalEntry

  // Reconciliation
  reconciliationId?: string

  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface BankReconciliation {
  id: string
  accountId: string
  account?: Account

  reconciliationDate: string
  startingBalance: number
  endingBalance: number
  statementBalance: number

  status: ReconciliationStatus

  // Matched transactions
  matchedTransactions: BankTransaction[]
  unmatchedBankTransactions: BankTransaction[]
  unmatchedBookTransactions: GeneralLedgerEntry[]

  // Adjustments
  adjustmentEntries: JournalEntry[]

  // Summary
  reconciledAmount: number
  discrepancyAmount: number

  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface CreateBankReconciliationRequest {
  accountId: string
  reconciliationDate: string
  statementBalance: number
  bankTransactions: Omit<BankTransaction, 'id' | 'account' | 'organizationId' | 'createdAt' | 'updatedAt'>[]
}

// Financial Statement interfaces
export interface FinancialStatementLine {
  accountId?: string
  account?: Account
  label: string
  amount: number
  level: number
  isTotal: boolean
  children?: FinancialStatementLine[]
}

export interface BalanceSheet {
  asOfDate: string

  // Assets
  currentAssets: FinancialStatementLine[]
  fixedAssets: FinancialStatementLine[]
  otherAssets: FinancialStatementLine[]
  totalAssets: number

  // Liabilities
  currentLiabilities: FinancialStatementLine[]
  longTermLiabilities: FinancialStatementLine[]
  totalLiabilities: number

  // Equity
  equity: FinancialStatementLine[]
  totalEquity: number

  // Verification
  totalLiabilitiesAndEquity: number
  isBalanced: boolean

  organizationId: string
  generatedAt: string
}

export interface IncomeStatement {
  periodStart: string
  periodEnd: string

  // Revenue
  operatingRevenue: FinancialStatementLine[]
  otherRevenue: FinancialStatementLine[]
  totalRevenue: number

  // Expenses
  costOfGoodsSold: FinancialStatementLine[]
  operatingExpenses: FinancialStatementLine[]
  otherExpenses: FinancialStatementLine[]
  totalExpenses: number

  // Calculations
  grossProfit: number
  operatingIncome: number
  netIncome: number

  organizationId: string
  generatedAt: string
}

export interface CashFlowStatement {
  periodStart: string
  periodEnd: string

  // Operating Activities
  operatingActivities: FinancialStatementLine[]
  netCashFromOperating: number

  // Investing Activities
  investingActivities: FinancialStatementLine[]
  netCashFromInvesting: number

  // Financing Activities
  financingActivities: FinancialStatementLine[]
  netCashFromFinancing: number

  // Summary
  netChangeInCash: number
  beginningCash: number
  endingCash: number

  organizationId: string
  generatedAt: string
}

// Report generation interfaces
export interface FinancialReportRequest {
  type: 'BALANCE_SHEET' | 'INCOME_STATEMENT' | 'CASH_FLOW' | 'TRIAL_BALANCE' | 'GENERAL_LEDGER'
  asOfDate?: string
  periodStart?: string
  periodEnd?: string
  accountIds?: string[]
  includeInactive?: boolean
  format?: 'JSON' | 'PDF' | 'EXCEL' | 'CSV'
}

// Account hierarchy utilities
export interface AccountHierarchy {
  account: Account
  children: AccountHierarchy[]
  depth: number
  path: string[]
}

// Validation interfaces for accounting rules
export interface AccountingValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface JournalEntryValidation extends AccountingValidation {
  isBalanced: boolean
  debitTotal: number
  creditTotal: number
  difference: number
}