import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/services/api.service'
import {
  Expense,
  ExpenseCategory,
  ExpenseReport,
  ExpensePolicy,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  CreateExpenseCategoryRequest,
  CreateApprovalRequest,
  ExpenseFilters,
  ExpenseReportFilters,
  ExpenseAnalytics,
  ExpenseAttachment
} from '@/types/expenses'

// Query Keys
export const expenseQueryKeys = {
  all: ['expenses'] as const,
  expenses: (filters?: ExpenseFilters) => [...expenseQueryKeys.all, 'list', filters] as const,
  expense: (id: string) => [...expenseQueryKeys.all, 'detail', id] as const,
  categories: () => [...expenseQueryKeys.all, 'categories'] as const,
  category: (id: string) => [...expenseQueryKeys.all, 'category', id] as const,
  reports: (filters?: ExpenseReportFilters) => [...expenseQueryKeys.all, 'reports', filters] as const,
  report: (id: string) => [...expenseQueryKeys.all, 'report', id] as const,
  policies: () => [...expenseQueryKeys.all, 'policies'] as const,
  policy: (id: string) => [...expenseQueryKeys.all, 'policy', id] as const,
  analytics: (filters?: ExpenseFilters) => [...expenseQueryKeys.all, 'analytics', filters] as const,
  myExpenses: (filters?: ExpenseFilters) => [...expenseQueryKeys.all, 'my-expenses', filters] as const,
  pendingApprovals: () => [...expenseQueryKeys.all, 'pending-approvals'] as const,
}

// Expense CRUD hooks
export function useExpenses(filters?: ExpenseFilters) {
  return useQuery({
    queryKey: expenseQueryKeys.expenses(filters),
    queryFn: () => apiService.findExpenses(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: expenseQueryKeys.expense(id),
    queryFn: () => apiService.getExpense(id),
    enabled: !!id,
  })
}

export function useMyExpenses(filters?: ExpenseFilters) {
  return useQuery({
    queryKey: expenseQueryKeys.myExpenses(filters),
    queryFn: () => apiService.getMyExpenses(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export function usePendingApprovals() {
  return useQuery({
    queryKey: expenseQueryKeys.pendingApprovals(),
    queryFn: () => apiService.getPendingExpenseApprovals(),
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateExpenseRequest) => apiService.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.all })
    },
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseRequest }) =>
      apiService.updateExpense(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.expense(id) })
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.expenses() })
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.myExpenses() })
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.all })
    },
  })
}

export function useSubmitExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiService.submitExpense(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.expense(id) })
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.expenses() })
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.myExpenses() })
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.pendingApprovals() })
    },
  })
}

// Expense Category hooks
export function useExpenseCategories() {
  return useQuery({
    queryKey: expenseQueryKeys.categories(),
    queryFn: () => apiService.getExpenseCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useExpenseCategory(id: string) {
  return useQuery({
    queryKey: expenseQueryKeys.category(id),
    queryFn: () => apiService.getExpenseCategory(id),
    enabled: !!id,
  })
}

export function useCreateExpenseCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateExpenseCategoryRequest) => apiService.createExpenseCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.categories() })
    },
  })
}

export function useUpdateExpenseCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateExpenseCategoryRequest> }) =>
      apiService.updateExpenseCategory(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.category(id) })
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.categories() })
    },
  })
}

export function useDeleteExpenseCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiService.deleteExpenseCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.categories() })
    },
  })
}

// Approval workflow hooks
export function useApproveExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateApprovalRequest }) =>
      apiService.approveExpense(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.expense(id) })
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.expenses() })
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.pendingApprovals() })
    },
  })
}

export function useRejectExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateApprovalRequest }) =>
      apiService.rejectExpense(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.expense(id) })
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.expenses() })
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.pendingApprovals() })
    },
  })
}

// Expense Report hooks
export function useExpenseReports(filters?: ExpenseReportFilters) {
  return useQuery({
    queryKey: expenseQueryKeys.reports(filters),
    queryFn: () => apiService.getExpenseReports(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useExpenseReport(id: string) {
  return useQuery({
    queryKey: expenseQueryKeys.report(id),
    queryFn: () => apiService.getExpenseReport(id),
    enabled: !!id,
  })
}

export function useCreateExpenseReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { title: string; description?: string; expenseIds: string[] }) =>
      apiService.createExpenseReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.reports() })
    },
  })
}

// Expense Policy hooks
export function useExpensePolicies() {
  return useQuery({
    queryKey: expenseQueryKeys.policies(),
    queryFn: () => apiService.getExpensePolicies(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

export function useExpensePolicy(id: string) {
  return useQuery({
    queryKey: expenseQueryKeys.policy(id),
    queryFn: () => apiService.getExpensePolicy(id),
    enabled: !!id,
  })
}

// Analytics hooks
export function useExpenseAnalytics(filters?: ExpenseFilters) {
  return useQuery({
    queryKey: expenseQueryKeys.analytics(filters),
    queryFn: () => apiService.getExpenseAnalytics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// File upload hooks
export function useUploadExpenseAttachment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ expenseId, file }: { expenseId: string; file: File }) =>
      apiService.uploadExpenseAttachment(expenseId, file),
    onSuccess: (_, { expenseId }) => {
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.expense(expenseId) })
    },
  })
}

export function useDeleteExpenseAttachment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ expenseId, attachmentId }: { expenseId: string; attachmentId: string }) =>
      apiService.deleteExpenseAttachment(expenseId, attachmentId),
    onSuccess: (_, { expenseId }) => {
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.expense(expenseId) })
    },
  })
}

// Bulk operations
export function useBulkApproveExpenses() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ expenseIds, data }: { expenseIds: string[]; data: CreateApprovalRequest }) =>
      apiService.bulkApproveExpenses(expenseIds, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.all })
    },
  })
}

export function useBulkRejectExpenses() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ expenseIds, data }: { expenseIds: string[]; data: CreateApprovalRequest }) =>
      apiService.bulkRejectExpenses(expenseIds, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.all })
    },
  })
}

// Export hooks
export function useExportExpenses() {
  return useMutation({
    mutationFn: (data: { format: 'CSV' | 'EXCEL' | 'PDF'; filters?: ExpenseFilters }) =>
      apiService.exportExpenses(data),
  })
}

// Reimbursement hooks
export function useProcessReimbursement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ expenseId, amount, reference }: { expenseId: string; amount: number; reference?: string }) =>
      apiService.processExpenseReimbursement(expenseId, amount, reference),
    onSuccess: (_, { expenseId }) => {
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.expense(expenseId) })
      queryClient.invalidateQueries({ queryKey: expenseQueryKeys.expenses() })
    },
  })
}