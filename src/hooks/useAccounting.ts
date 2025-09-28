import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { apiService } from '@/services/api.service'
import {
  Account,
  CreateAccountRequest,
  UpdateAccountRequest,
  AccountFilters,
  JournalEntry,
  CreateJournalEntryRequest,
  UpdateJournalEntryRequest,
  JournalEntryFilters,
  GeneralLedgerFilters,
  BankReconciliation,
  CreateBankReconciliationRequest,
  FinancialReportRequest,
  AccountHierarchy
} from '@/types/accounting'

// Query keys for caching
export const accountingQueryKeys = {
  accounts: {
    all: ['accounts'] as const,
    lists: () => [...accountingQueryKeys.accounts.all, 'list'] as const,
    list: (filters: AccountFilters) => [...accountingQueryKeys.accounts.lists(), filters] as const,
    detail: (id: string) => [...accountingQueryKeys.accounts.all, 'detail', id] as const,
    hierarchy: () => [...accountingQueryKeys.accounts.all, 'hierarchy'] as const,
    balance: (id: string, asOfDate?: string) => [...accountingQueryKeys.accounts.all, 'balance', id, asOfDate] as const,
  },
  journalEntries: {
    all: ['journal-entries'] as const,
    lists: () => [...accountingQueryKeys.journalEntries.all, 'list'] as const,
    list: (filters: JournalEntryFilters) => [...accountingQueryKeys.journalEntries.lists(), filters] as const,
    detail: (id: string) => [...accountingQueryKeys.journalEntries.all, 'detail', id] as const,
  },
  generalLedger: {
    all: ['general-ledger'] as const,
    lists: () => [...accountingQueryKeys.generalLedger.all, 'list'] as const,
    list: (filters: GeneralLedgerFilters) => [...accountingQueryKeys.generalLedger.lists(), filters] as const,
    accountLedger: (accountId: string, filters: any) => [...accountingQueryKeys.generalLedger.all, 'account', accountId, filters] as const,
  },
  trialBalance: {
    all: ['trial-balance'] as const,
    detail: (asOfDate: string) => [...accountingQueryKeys.trialBalance.all, asOfDate] as const,
  },
  bankReconciliation: {
    all: ['bank-reconciliation'] as const,
    lists: () => [...accountingQueryKeys.bankReconciliation.all, 'list'] as const,
    list: (accountId?: string) => [...accountingQueryKeys.bankReconciliation.lists(), accountId] as const,
    detail: (id: string) => [...accountingQueryKeys.bankReconciliation.all, 'detail', id] as const,
  },
  financialStatements: {
    all: ['financial-statements'] as const,
    balanceSheet: (asOfDate: string) => [...accountingQueryKeys.financialStatements.all, 'balance-sheet', asOfDate] as const,
    incomeStatement: (periodStart: string, periodEnd: string) => [...accountingQueryKeys.financialStatements.all, 'income-statement', periodStart, periodEnd] as const,
    cashFlow: (periodStart: string, periodEnd: string) => [...accountingQueryKeys.financialStatements.all, 'cash-flow', periodStart, periodEnd] as const,
  },
  settings: {
    all: ['accounting-settings'] as const,
    periods: () => [...accountingQueryKeys.settings.all, 'periods'] as const,
    config: () => [...accountingQueryKeys.settings.all, 'config'] as const,
  }
}

// ========================================
// CHART OF ACCOUNTS HOOKS
// ========================================

export function useAccounts(filters: AccountFilters = {}) {
  return useQuery({
    queryKey: accountingQueryKeys.accounts.list(filters),
    queryFn: () => apiService.findAccounts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAccount(accountId: string) {
  return useQuery({
    queryKey: accountingQueryKeys.accounts.detail(accountId),
    queryFn: () => apiService.getAccount(accountId),
    enabled: !!accountId,
  })
}

export function useAccountHierarchy() {
  return useQuery({
    queryKey: accountingQueryKeys.accounts.hierarchy(),
    queryFn: () => apiService.getAccountHierarchy(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useAccountBalance(accountId: string, asOfDate?: string) {
  return useQuery({
    queryKey: accountingQueryKeys.accounts.balance(accountId, asOfDate),
    queryFn: () => apiService.getAccountBalance(accountId, asOfDate),
    enabled: !!accountId,
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAccountRequest) => apiService.createAccount(data),
    onSuccess: (newAccount) => {
      queryClient.invalidateQueries({ queryKey: accountingQueryKeys.accounts.all })
      toast.success(`Account "${newAccount.name}" created successfully`)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create account')
    },
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ accountId, data }: { accountId: string; data: UpdateAccountRequest }) =>
      apiService.updateAccount(accountId, data),
    onSuccess: (updatedAccount, { accountId }) => {
      queryClient.invalidateQueries({ queryKey: accountingQueryKeys.accounts.all })
      queryClient.setQueryData(accountingQueryKeys.accounts.detail(accountId), updatedAccount)
      toast.success('Account updated successfully')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update account')
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (accountId: string) => apiService.deleteAccount(accountId),
    onSuccess: (_, accountId) => {
      queryClient.invalidateQueries({ queryKey: accountingQueryKeys.accounts.all })
      queryClient.removeQueries({ queryKey: accountingQueryKeys.accounts.detail(accountId) })
      toast.success('Account deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete account')
    },
  })
}

// ========================================
// JOURNAL ENTRIES HOOKS
// ========================================

export function useJournalEntries(filters: JournalEntryFilters = {}) {
  return useQuery({
    queryKey: accountingQueryKeys.journalEntries.list(filters),
    queryFn: () => apiService.findJournalEntries(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useJournalEntry(entryId: string) {
  return useQuery({
    queryKey: accountingQueryKeys.journalEntries.detail(entryId),
    queryFn: () => apiService.getJournalEntry(entryId),
    enabled: !!entryId,
  })
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateJournalEntryRequest) => apiService.createJournalEntry(data),
    onSuccess: (newEntry) => {
      queryClient.invalidateQueries({ queryKey: accountingQueryKeys.journalEntries.all })
      queryClient.invalidateQueries({ queryKey: accountingQueryKeys.generalLedger.all })
      queryClient.invalidateQueries({ queryKey: accountingQueryKeys.accounts.all })
      toast.success(`Journal entry "${newEntry.entryNumber}" created successfully`)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create journal entry')
    },
  })
}

export function useUpdateJournalEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ entryId, data }: { entryId: string; data: UpdateJournalEntryRequest }) =>
      apiService.updateJournalEntry(entryId, data),
    onSuccess: (updatedEntry, { entryId }) => {
      queryClient.invalidateQueries({ queryKey: accountingQueryKeys.journalEntries.all })
      queryClient.setQueryData(accountingQueryKeys.journalEntries.detail(entryId), updatedEntry)
      toast.success('Journal entry updated successfully')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update journal entry')
    },
  })
}

export function usePostJournalEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (entryId: string) => apiService.postJournalEntry(entryId),
    onSuccess: (postedEntry, entryId) => {
      queryClient.invalidateQueries({ queryKey: accountingQueryKeys.journalEntries.all })
      queryClient.invalidateQueries({ queryKey: accountingQueryKeys.generalLedger.all })
      queryClient.invalidateQueries({ queryKey: accountingQueryKeys.accounts.all })
      queryClient.setQueryData(accountingQueryKeys.journalEntries.detail(entryId), postedEntry)
      toast.success('Journal entry posted successfully')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to post journal entry')
    },
  })
}

export function useReverseJournalEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ entryId, reversalDate, description }: { entryId: string; reversalDate: string; description?: string }) =>
      apiService.reverseJournalEntry(entryId, reversalDate, description),
    onSuccess: (reversalEntry) => {
      queryClient.invalidateQueries({ queryKey: accountingQueryKeys.journalEntries.all })
      queryClient.invalidateQueries({ queryKey: accountingQueryKeys.generalLedger.all })
      queryClient.invalidateQueries({ queryKey: accountingQueryKeys.accounts.all })
      toast.success(`Reversal entry "${reversalEntry.entryNumber}" created successfully`)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to reverse journal entry')
    },
  })
}

export function useValidateJournalEntry() {
  return useMutation({
    mutationFn: (data: CreateJournalEntryRequest) => apiService.validateJournalEntry(data),
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to validate journal entry')
    },
  })
}

// ========================================
// GENERAL LEDGER HOOKS
// ========================================

export function useGeneralLedger(filters: GeneralLedgerFilters = {}) {
  return useQuery({
    queryKey: accountingQueryKeys.generalLedger.list(filters),
    queryFn: () => apiService.getGeneralLedger(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useAccountLedger(accountId: string, filters: { dateFrom?: string; dateTo?: string } = {}) {
  return useQuery({
    queryKey: accountingQueryKeys.generalLedger.accountLedger(accountId, filters),
    queryFn: () => apiService.getAccountLedger(accountId, filters),
    enabled: !!accountId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// ========================================
// TRIAL BALANCE HOOKS
// ========================================

export function useTrialBalance(asOfDate: string) {
  return useQuery({
    queryKey: accountingQueryKeys.trialBalance.detail(asOfDate),
    queryFn: () => apiService.getTrialBalance(asOfDate),
    enabled: !!asOfDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ========================================
// BANK RECONCILIATION HOOKS
// ========================================

export function useBankReconciliations(accountId?: string) {
  return useQuery({
    queryKey: accountingQueryKeys.bankReconciliation.list(accountId),
    queryFn: () => apiService.getBankReconciliations(accountId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useBankReconciliation(reconciliationId: string) {
  return useQuery({
    queryKey: accountingQueryKeys.bankReconciliation.detail(reconciliationId),
    queryFn: () => apiService.getBankReconciliation(reconciliationId),
    enabled: !!reconciliationId,
  })
}

export function useCreateBankReconciliation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBankReconciliationRequest) => apiService.createBankReconciliation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingQueryKeys.bankReconciliation.all })
      toast.success('Bank reconciliation created successfully')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create bank reconciliation')
    },
  })
}

export function useMatchBankTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reconciliationId, bankTransactionId, journalEntryId }: {
      reconciliationId: string
      bankTransactionId: string
      journalEntryId: string
    }) => apiService.matchBankTransaction(reconciliationId, bankTransactionId, journalEntryId),
    onSuccess: (updatedReconciliation, { reconciliationId }) => {
      queryClient.invalidateQueries({ queryKey: accountingQueryKeys.bankReconciliation.all })
      queryClient.setQueryData(accountingQueryKeys.bankReconciliation.detail(reconciliationId), updatedReconciliation)
      toast.success('Bank transaction matched successfully')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to match bank transaction')
    },
  })
}

export function useCompleteBankReconciliation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reconciliationId: string) => apiService.completeBankReconciliation(reconciliationId),
    onSuccess: (completedReconciliation, reconciliationId) => {
      queryClient.invalidateQueries({ queryKey: accountingQueryKeys.bankReconciliation.all })
      queryClient.setQueryData(accountingQueryKeys.bankReconciliation.detail(reconciliationId), completedReconciliation)
      toast.success('Bank reconciliation completed successfully')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to complete bank reconciliation')
    },
  })
}

// ========================================
// FINANCIAL STATEMENTS HOOKS
// ========================================

export function useBalanceSheet(asOfDate: string) {
  return useQuery({
    queryKey: accountingQueryKeys.financialStatements.balanceSheet(asOfDate),
    queryFn: () => apiService.generateBalanceSheet(asOfDate),
    enabled: !!asOfDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useIncomeStatement(periodStart: string, periodEnd: string) {
  return useQuery({
    queryKey: accountingQueryKeys.financialStatements.incomeStatement(periodStart, periodEnd),
    queryFn: () => apiService.generateIncomeStatement(periodStart, periodEnd),
    enabled: !!periodStart && !!periodEnd,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCashFlowStatement(periodStart: string, periodEnd: string) {
  return useQuery({
    queryKey: accountingQueryKeys.financialStatements.cashFlow(periodStart, periodEnd),
    queryFn: () => apiService.generateCashFlowStatement(periodStart, periodEnd),
    enabled: !!periodStart && !!periodEnd,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useGenerateFinancialReport() {
  return useMutation({
    mutationFn: (request: FinancialReportRequest) => apiService.generateFinancialReport(request),
    onSuccess: () => {
      toast.success('Financial report generated successfully')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to generate financial report')
    },
  })
}

// ========================================
// ACCOUNTING SETTINGS HOOKS
// ========================================

export function useAccountingPeriods() {
  return useQuery({
    queryKey: accountingQueryKeys.settings.periods(),
    queryFn: () => apiService.getAccountingPeriods(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useAccountingSettings() {
  return useQuery({
    queryKey: accountingQueryKeys.settings.config(),
    queryFn: () => apiService.getAccountingSettings(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useUpdateAccountingSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (settings: Parameters<typeof apiService.updateAccountingSettings>[0]) =>
      apiService.updateAccountingSettings(settings),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(accountingQueryKeys.settings.config(), updatedSettings)
      toast.success('Accounting settings updated successfully')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update accounting settings')
    },
  })
}

export function useCloseAccountingPeriod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (periodId: string) => apiService.closeAccountingPeriod(periodId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: accountingQueryKeys.settings.periods() })
      toast.success(result.message || 'Accounting period closed successfully')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to close accounting period')
    },
  })
}