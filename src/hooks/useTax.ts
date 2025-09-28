import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/services/api.service'
import {
  TaxJurisdiction,
  TaxRate,
  TaxReturn,
  TaxLiability,
  TaxPayment,
  TaxNotice,
  TaxComplianceStatus,
  TaxComplianceRequirement,
  TaxAnalytics,
  TaxCalculationRequest,
  TaxCalculationResult,
  CreateTaxJurisdictionRequest,
  CreateTaxRateRequest,
  CreateTaxReturnRequest,
  CreateTaxPaymentRequest,
  CreateTaxNoticeRequest,
  TaxFilters,
  TaxComplianceFilters
} from '@/types/tax'

// Query Keys
export const taxQueryKeys = {
  all: ['tax'] as const,
  jurisdictions: () => [...taxQueryKeys.all, 'jurisdictions'] as const,
  jurisdiction: (id: string) => [...taxQueryKeys.all, 'jurisdiction', id] as const,
  rates: (filters?: any) => [...taxQueryKeys.all, 'rates', filters] as const,
  rate: (id: string) => [...taxQueryKeys.all, 'rate', id] as const,
  returns: (filters?: TaxFilters) => [...taxQueryKeys.all, 'returns', filters] as const,
  return: (id: string) => [...taxQueryKeys.all, 'return', id] as const,
  liabilities: (filters?: TaxFilters) => [...taxQueryKeys.all, 'liabilities', filters] as const,
  liability: (id: string) => [...taxQueryKeys.all, 'liability', id] as const,
  payments: (filters?: TaxFilters) => [...taxQueryKeys.all, 'payments', filters] as const,
  payment: (id: string) => [...taxQueryKeys.all, 'payment', id] as const,
  notices: (filters?: any) => [...taxQueryKeys.all, 'notices', filters] as const,
  notice: (id: string) => [...taxQueryKeys.all, 'notice', id] as const,
  compliance: (filters?: TaxComplianceFilters) => [...taxQueryKeys.all, 'compliance', filters] as const,
  requirements: () => [...taxQueryKeys.all, 'requirements'] as const,
  analytics: (filters?: TaxFilters) => [...taxQueryKeys.all, 'analytics', filters] as const,
  calendar: (year: number) => [...taxQueryKeys.all, 'calendar', year] as const,
}

// Tax Jurisdiction hooks
export function useTaxJurisdictions() {
  return useQuery({
    queryKey: taxQueryKeys.jurisdictions(),
    queryFn: () => apiService.getTaxJurisdictions(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useTaxJurisdiction(id: string) {
  return useQuery({
    queryKey: taxQueryKeys.jurisdiction(id),
    queryFn: () => apiService.getTaxJurisdiction(id),
    enabled: !!id,
  })
}

export function useCreateTaxJurisdiction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTaxJurisdictionRequest) => apiService.createTaxJurisdiction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.jurisdictions() })
    },
  })
}

export function useUpdateTaxJurisdiction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTaxJurisdictionRequest> }) =>
      apiService.updateTaxJurisdiction(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.jurisdiction(id) })
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.jurisdictions() })
    },
  })
}

export function useDeleteTaxJurisdiction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiService.deleteTaxJurisdiction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.jurisdictions() })
    },
  })
}

// Tax Rate hooks
export function useTaxRates(filters?: any) {
  return useQuery({
    queryKey: taxQueryKeys.rates(filters),
    queryFn: () => apiService.getTaxRates(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useTaxRate(id: string) {
  return useQuery({
    queryKey: taxQueryKeys.rate(id),
    queryFn: () => apiService.getTaxRate(id),
    enabled: !!id,
  })
}

export function useCreateTaxRate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTaxRateRequest) => apiService.createTaxRate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.rates() })
    },
  })
}

export function useUpdateTaxRate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTaxRateRequest> }) =>
      apiService.updateTaxRate(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.rate(id) })
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.rates() })
    },
  })
}

export function useDeleteTaxRate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiService.deleteTaxRate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.rates() })
    },
  })
}

// Tax Return hooks
export function useTaxReturns(filters?: TaxFilters) {
  return useQuery({
    queryKey: taxQueryKeys.returns(filters),
    queryFn: () => apiService.getTaxReturns(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useTaxReturn(id: string) {
  return useQuery({
    queryKey: taxQueryKeys.return(id),
    queryFn: () => apiService.getTaxReturn(id),
    enabled: !!id,
  })
}

export function useCreateTaxReturn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTaxReturnRequest) => apiService.createTaxReturn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.returns() })
    },
  })
}

export function useUpdateTaxReturn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTaxReturnRequest> }) =>
      apiService.updateTaxReturn(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.return(id) })
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.returns() })
    },
  })
}

export function useSubmitTaxReturn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiService.submitTaxReturn(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.return(id) })
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.returns() })
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.compliance() })
    },
  })
}

export function useAmendTaxReturn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { reason: string; changes: any } }) =>
      apiService.amendTaxReturn(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.return(id) })
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.returns() })
    },
  })
}

// Tax Liability hooks
export function useTaxLiabilities(filters?: TaxFilters) {
  return useQuery({
    queryKey: taxQueryKeys.liabilities(filters),
    queryFn: () => apiService.getTaxLiabilities(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useTaxLiability(id: string) {
  return useQuery({
    queryKey: taxQueryKeys.liability(id),
    queryFn: () => apiService.getTaxLiability(id),
    enabled: !!id,
  })
}

// Tax Payment hooks
export function useTaxPayments(filters?: TaxFilters) {
  return useQuery({
    queryKey: taxQueryKeys.payments(filters),
    queryFn: () => apiService.getTaxPayments(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useTaxPayment(id: string) {
  return useQuery({
    queryKey: taxQueryKeys.payment(id),
    queryFn: () => apiService.getTaxPayment(id),
    enabled: !!id,
  })
}

export function useCreateTaxPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTaxPaymentRequest) => apiService.createTaxPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.payments() })
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.liabilities() })
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.analytics() })
    },
  })
}

export function useUpdateTaxPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTaxPaymentRequest> }) =>
      apiService.updateTaxPayment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.payment(id) })
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.payments() })
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.analytics() })
    },
  })
}

export function useDeleteTaxPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiService.deleteTaxPayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.payments() })
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.liabilities() })
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.analytics() })
    },
  })
}

// Tax Notice hooks
export function useTaxNotices(filters?: any) {
  return useQuery({
    queryKey: taxQueryKeys.notices(filters),
    queryFn: () => apiService.getTaxNotices(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useTaxNotice(id: string) {
  return useQuery({
    queryKey: taxQueryKeys.notice(id),
    queryFn: () => apiService.getTaxNotice(id),
    enabled: !!id,
  })
}

export function useCreateTaxNotice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTaxNoticeRequest) => apiService.createTaxNotice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.notices() })
    },
  })
}

export function useUpdateTaxNotice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTaxNoticeRequest> }) =>
      apiService.updateTaxNotice(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.notice(id) })
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.notices() })
    },
  })
}

export function useRespondToTaxNotice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { response: string; documents?: File[] } }) =>
      apiService.respondToTaxNotice(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.notice(id) })
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.notices() })
    },
  })
}

// Tax Compliance hooks
export function useTaxCompliance(filters?: TaxComplianceFilters) {
  return useQuery({
    queryKey: taxQueryKeys.compliance(filters),
    queryFn: () => apiService.getTaxCompliance(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export function useTaxComplianceRequirements() {
  return useQuery({
    queryKey: taxQueryKeys.requirements(),
    queryFn: () => apiService.getTaxComplianceRequirements(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useUpdateComplianceStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; notes?: string } }) =>
      apiService.updateTaxComplianceStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.compliance() })
    },
  })
}

// Tax Calculation hooks
export function useCalculateTax() {
  return useMutation({
    mutationFn: (data: TaxCalculationRequest) => apiService.calculateTax(data),
  })
}

export function useBulkCalculateTax() {
  return useMutation({
    mutationFn: (data: TaxCalculationRequest[]) => apiService.bulkCalculateTax(data),
  })
}

// Tax Analytics hooks
export function useTaxAnalytics(filters?: TaxFilters) {
  return useQuery({
    queryKey: taxQueryKeys.analytics(filters),
    queryFn: () => apiService.getTaxAnalytics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useTaxCalendar(year: number) {
  return useQuery({
    queryKey: taxQueryKeys.calendar(year),
    queryFn: () => apiService.getTaxCalendar(year),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    enabled: !!year,
  })
}

// File upload hooks
export function useUploadTaxDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ returnId, file, documentType }: { returnId: string; file: File; documentType: string }) =>
      apiService.uploadTaxDocument(returnId, file, documentType),
    onSuccess: (_, { returnId }) => {
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.return(returnId) })
    },
  })
}

export function useDeleteTaxDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ returnId, documentId }: { returnId: string; documentId: string }) =>
      apiService.deleteTaxDocument(returnId, documentId),
    onSuccess: (_, { returnId }) => {
      queryClient.invalidateQueries({ queryKey: taxQueryKeys.return(returnId) })
    },
  })
}

// Export hooks
export function useExportTaxReturns() {
  return useMutation({
    mutationFn: (data: { format: 'PDF' | 'XML' | 'CSV'; filters?: TaxFilters }) =>
      apiService.exportTaxReturns(data),
  })
}

export function useExportTaxReports() {
  return useMutation({
    mutationFn: (data: { reportType: string; format: 'PDF' | 'EXCEL' | 'CSV'; filters?: TaxFilters }) =>
      apiService.exportTaxReports(data),
  })
}

// Tax Registration hooks
export function useTaxRegistrations() {
  return useQuery({
    queryKey: [...taxQueryKeys.all, 'registrations'],
    queryFn: () => apiService.getTaxRegistrations(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

export function useCreateTaxRegistration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => apiService.createTaxRegistration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...taxQueryKeys.all, 'registrations'] })
    },
  })
}

// Tax Audit hooks
export function useTaxAudits() {
  return useQuery({
    queryKey: [...taxQueryKeys.all, 'audits'],
    queryFn: () => apiService.getTaxAudits(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateTaxAuditResponse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ auditId, data }: { auditId: string; data: any }) =>
      apiService.createTaxAuditResponse(auditId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...taxQueryKeys.all, 'audits'] })
    },
  })
}