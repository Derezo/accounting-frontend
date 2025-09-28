import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/services/api.service'
import {
  FinancialDashboard,
  FinancialAnalysis,
  FinancialRatios,
  Budget,
  CashFlowForecast,
  CustomReport,
  FinancialAnalysisFilters,
  BudgetFilters,
  ForecastFilters,
  ReportFilters,
  CreateDashboardRequest,
  CreateAnalysisRequest,
  CreateBudgetRequest,
  CreateForecastRequest,
  CreateReportRequest,
  AnalysisPeriod,
  ReportFormat
} from '@/types/financial-analysis'

// Query Keys
export const financialAnalysisQueryKeys = {
  all: ['financial-analysis'] as const,
  dashboards: () => [...financialAnalysisQueryKeys.all, 'dashboards'] as const,
  dashboard: (id: string) => [...financialAnalysisQueryKeys.all, 'dashboard', id] as const,
  analyses: (filters?: FinancialAnalysisFilters) => [...financialAnalysisQueryKeys.all, 'analyses', filters] as const,
  analysis: (id: string) => [...financialAnalysisQueryKeys.all, 'analysis', id] as const,
  ratios: (period?: AnalysisPeriod, date?: string) => [...financialAnalysisQueryKeys.all, 'ratios', period, date] as const,
  budgets: (filters?: BudgetFilters) => [...financialAnalysisQueryKeys.all, 'budgets', filters] as const,
  budget: (id: string) => [...financialAnalysisQueryKeys.all, 'budget', id] as const,
  budgetVariance: (id: string) => [...financialAnalysisQueryKeys.all, 'budget-variance', id] as const,
  forecasts: (filters?: ForecastFilters) => [...financialAnalysisQueryKeys.all, 'forecasts', filters] as const,
  forecast: (id: string) => [...financialAnalysisQueryKeys.all, 'forecast', id] as const,
  reports: (filters?: ReportFilters) => [...financialAnalysisQueryKeys.all, 'reports', filters] as const,
  report: (id: string) => [...financialAnalysisQueryKeys.all, 'report', id] as const,
  reportData: (id: string, params?: any) => [...financialAnalysisQueryKeys.all, 'report-data', id, params] as const,
  kpis: (dateRange?: { start: string; end: string }) => [...financialAnalysisQueryKeys.all, 'kpis', dateRange] as const,
  benchmarks: () => [...financialAnalysisQueryKeys.all, 'benchmarks'] as const,
}

// Financial Dashboard hooks
export function useFinancialDashboards() {
  return useQuery({
    queryKey: financialAnalysisQueryKeys.dashboards(),
    queryFn: () => apiService.getFinancialDashboards(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useFinancialDashboard(id: string) {
  return useQuery({
    queryKey: financialAnalysisQueryKeys.dashboard(id),
    queryFn: () => apiService.getFinancialDashboard(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useCreateFinancialDashboard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDashboardRequest) => apiService.createFinancialDashboard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.dashboards() })
    },
  })
}

export function useUpdateFinancialDashboard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDashboardRequest> }) =>
      apiService.updateFinancialDashboard(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.dashboard(id) })
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.dashboards() })
    },
  })
}

export function useDeleteFinancialDashboard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiService.deleteFinancialDashboard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.dashboards() })
    },
  })
}

export function useCloneFinancialDashboard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      apiService.cloneFinancialDashboard(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.dashboards() })
    },
  })
}

// Financial Analysis hooks
export function useFinancialAnalyses(filters?: FinancialAnalysisFilters) {
  return useQuery({
    queryKey: financialAnalysisQueryKeys.analyses(filters),
    queryFn: () => apiService.getFinancialAnalyses(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useFinancialAnalysis(id: string) {
  return useQuery({
    queryKey: financialAnalysisQueryKeys.analysis(id),
    queryFn: () => apiService.getFinancialAnalysis(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useCreateFinancialAnalysis() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAnalysisRequest) => apiService.createFinancialAnalysis(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.analyses() })
    },
  })
}

export function useRunFinancialAnalysis() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiService.runFinancialAnalysis(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.analysis(id) })
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.analyses() })
    },
  })
}

export function useDeleteFinancialAnalysis() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiService.deleteFinancialAnalysis(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.analyses() })
    },
  })
}

// Financial Ratios hooks
export function useFinancialRatios(period?: AnalysisPeriod, date?: string) {
  return useQuery({
    queryKey: financialAnalysisQueryKeys.ratios(period, date),
    queryFn: () => apiService.getFinancialRatios(period, date),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

export function useCalculateFinancialRatios() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ period, date }: { period: AnalysisPeriod; date?: string }) =>
      apiService.calculateFinancialRatios(period, date),
    onSuccess: (_, { period, date }) => {
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.ratios(period, date) })
    },
  })
}

export function useFinancialRatioTrends() {
  return useQuery({
    queryKey: [...financialAnalysisQueryKeys.all, 'ratio-trends'],
    queryFn: () => apiService.getFinancialRatioTrends(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Budget Management hooks
export function useBudgets(filters?: BudgetFilters) {
  return useQuery({
    queryKey: financialAnalysisQueryKeys.budgets(filters),
    queryFn: () => apiService.getBudgets(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useBudget(id: string) {
  return useQuery({
    queryKey: financialAnalysisQueryKeys.budget(id),
    queryFn: () => apiService.getBudget(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBudgetRequest) => apiService.createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.budgets() })
    },
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBudgetRequest> }) =>
      apiService.updateBudget(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.budget(id) })
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.budgets() })
    },
  })
}

export function useApproveBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) =>
      apiService.approveBudget(id, comments),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.budget(id) })
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.budgets() })
    },
  })
}

export function useRejectBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiService.rejectBudget(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.budget(id) })
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.budgets() })
    },
  })
}

export function useBudgetVarianceAnalysis(id: string) {
  return useQuery({
    queryKey: financialAnalysisQueryKeys.budgetVariance(id),
    queryFn: () => apiService.getBudgetVarianceAnalysis(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useGenerateBudgetFromPrevious() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ previousBudgetId, adjustments }: { previousBudgetId: string; adjustments: any }) =>
      apiService.generateBudgetFromPrevious(previousBudgetId, adjustments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.budgets() })
    },
  })
}

// Cash Flow Forecasting hooks
export function useCashFlowForecasts(filters?: ForecastFilters) {
  return useQuery({
    queryKey: financialAnalysisQueryKeys.forecasts(filters),
    queryFn: () => apiService.getCashFlowForecasts(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useCashFlowForecast(id: string) {
  return useQuery({
    queryKey: financialAnalysisQueryKeys.forecast(id),
    queryFn: () => apiService.getCashFlowForecast(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateCashFlowForecast() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateForecastRequest) => apiService.createCashFlowForecast(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.forecasts() })
    },
  })
}

export function useUpdateCashFlowForecast() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateForecastRequest> }) =>
      apiService.updateCashFlowForecast(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.forecast(id) })
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.forecasts() })
    },
  })
}

export function useRunCashFlowForecast() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiService.runCashFlowForecast(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.forecast(id) })
    },
  })
}

export function useDeleteCashFlowForecast() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiService.deleteCashFlowForecast(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.forecasts() })
    },
  })
}

export function useCashFlowScenarioComparison() {
  return useMutation({
    mutationFn: (forecastIds: string[]) => apiService.compareCashFlowScenarios(forecastIds),
  })
}

// Custom Reports hooks
export function useCustomReports(filters?: ReportFilters) {
  return useQuery({
    queryKey: financialAnalysisQueryKeys.reports(filters),
    queryFn: () => apiService.getCustomReports(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useCustomReport(id: string) {
  return useQuery({
    queryKey: financialAnalysisQueryKeys.report(id),
    queryFn: () => apiService.getCustomReport(id),
    enabled: !!id,
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

export function useCustomReportData(id: string, params?: any) {
  return useQuery({
    queryKey: financialAnalysisQueryKeys.reportData(id, params),
    queryFn: () => apiService.getCustomReportData(id, params),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateCustomReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateReportRequest) => apiService.createCustomReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.reports() })
    },
  })
}

export function useUpdateCustomReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateReportRequest> }) =>
      apiService.updateCustomReport(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.report(id) })
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.reports() })
    },
  })
}

export function useDeleteCustomReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiService.deleteCustomReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.reports() })
    },
  })
}

export function useRunCustomReport() {
  return useMutation({
    mutationFn: ({ id, format, params }: { id: string; format: ReportFormat; params?: any }) =>
      apiService.runCustomReport(id, format, params),
  })
}

export function useScheduleCustomReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, schedule }: { id: string; schedule: any }) =>
      apiService.scheduleCustomReport(id, schedule),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.report(id) })
    },
  })
}

// KPI and Metrics hooks
export function useFinancialKPIs(dateRange?: { start: string; end: string }) {
  return useQuery({
    queryKey: financialAnalysisQueryKeys.kpis(dateRange),
    queryFn: () => apiService.getFinancialKPIs(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  })
}

export function useFinancialBenchmarks() {
  return useQuery({
    queryKey: financialAnalysisQueryKeys.benchmarks(),
    queryFn: () => apiService.getFinancialBenchmarks(),
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

export function useUpdateFinancialBenchmarks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (benchmarks: any) => apiService.updateFinancialBenchmarks(benchmarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.benchmarks() })
    },
  })
}

// Advanced Analysis hooks
export function useVarianceAnalysis() {
  return useMutation({
    mutationFn: (params: {
      dateRange: { start: string; end: string }
      comparisonType: 'BUDGET' | 'PREVIOUS_PERIOD' | 'SAME_PERIOD_LAST_YEAR'
      accounts?: string[]
    }) => apiService.runVarianceAnalysis(params),
  })
}

export function useTrendAnalysis() {
  return useMutation({
    mutationFn: (params: {
      accounts: string[]
      dateRange: { start: string; end: string }
      periods: number
    }) => apiService.runTrendAnalysis(params),
  })
}

export function useBreakEvenAnalysis() {
  return useMutation({
    mutationFn: (params: {
      fixedCosts: number
      variableCostRate: number
      sellingPrice: number
    }) => apiService.runBreakEvenAnalysis(params),
  })
}

export function useSensitivityAnalysis() {
  return useMutation({
    mutationFn: (params: {
      baseCase: any
      variables: Array<{
        name: string
        minValue: number
        maxValue: number
        step: number
      }>
    }) => apiService.runSensitivityAnalysis(params),
  })
}

// Bulk Operations
export function useBulkUpdateBudgetLines() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ budgetId, updates }: { budgetId: string; updates: any[] }) =>
      apiService.bulkUpdateBudgetLines(budgetId, updates),
    onSuccess: (_, { budgetId }) => {
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.budget(budgetId) })
    },
  })
}

export function useBulkApproveReports() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reportIds: string[]) => apiService.bulkApproveReports(reportIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialAnalysisQueryKeys.reports() })
    },
  })
}

// Export hooks
export function useExportFinancialAnalysis() {
  return useMutation({
    mutationFn: ({ id, format }: { id: string; format: ReportFormat }) =>
      apiService.exportFinancialAnalysis(id, format),
  })
}

export function useExportBudget() {
  return useMutation({
    mutationFn: ({ id, format, includeVariance }: { id: string; format: ReportFormat; includeVariance?: boolean }) =>
      apiService.exportBudget(id, format, includeVariance),
  })
}

export function useExportCashFlowForecast() {
  return useMutation({
    mutationFn: ({ id, format }: { id: string; format: ReportFormat }) =>
      apiService.exportCashFlowForecast(id, format),
  })
}

export function useExportFinancialRatios() {
  return useMutation({
    mutationFn: ({ period, format }: { period: AnalysisPeriod; format: ReportFormat }) =>
      apiService.exportFinancialRatios(period, format),
  })
}

// Real-time Data hooks
export function useRealTimeFinancialData() {
  return useQuery({
    queryKey: [...financialAnalysisQueryKeys.all, 'real-time-data'],
    queryFn: () => apiService.getRealTimeFinancialData(),
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
    staleTime: 10 * 1000, // 10 seconds
  })
}

export function useFinancialAlerts() {
  return useQuery({
    queryKey: [...financialAnalysisQueryKeys.all, 'alerts'],
    queryFn: () => apiService.getFinancialAlerts(),
    refetchInterval: 60 * 1000, // Check every minute
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useAcknowledgeFinancialAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (alertId: string) => apiService.acknowledgeFinancialAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...financialAnalysisQueryKeys.all, 'alerts'] })
    },
  })
}