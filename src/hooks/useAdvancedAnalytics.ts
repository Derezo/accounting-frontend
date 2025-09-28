import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/services/api.service'
import type {
  AnalyticsDashboard,
  DashboardWidget,
  KPIMetric,
  AdvancedReport,
  DataSourceConnection,
  AIInsight,
  AnalyticsFilter,
  DateRange,
  ExportFormat,
  AnalyticsPreferences
} from '@/types/advanced-analytics'

export function useAnalyticsDashboards(filters?: AnalyticsFilter) {
  return useQuery({
    queryKey: ['analytics', 'dashboards', filters],
    queryFn: () => apiService.getAnalyticsDashboards(filters),
  })
}

export function useAnalyticsDashboard(dashboardId: string) {
  return useQuery({
    queryKey: ['analytics', 'dashboard', dashboardId],
    queryFn: () => apiService.getAnalyticsDashboard(dashboardId),
    enabled: !!dashboardId,
  })
}

export function useCreateAnalyticsDashboard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dashboard: Omit<AnalyticsDashboard, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiService.createAnalyticsDashboard(dashboard),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'dashboards'] })
    },
  })
}

export function useUpdateAnalyticsDashboard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...dashboard }: Partial<AnalyticsDashboard> & { id: string }) =>
      apiService.updateAnalyticsDashboard(id, dashboard),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'dashboards'] })
      queryClient.invalidateQueries({ queryKey: ['analytics', 'dashboard', variables.id] })
    },
  })
}

export function useDeleteAnalyticsDashboard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dashboardId: string) => apiService.deleteAnalyticsDashboard(dashboardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'dashboards'] })
    },
  })
}

export function useDashboardWidgets(dashboardId: string) {
  return useQuery({
    queryKey: ['analytics', 'widgets', dashboardId],
    queryFn: () => apiService.getDashboardWidgets(dashboardId),
    enabled: !!dashboardId,
  })
}

export function useCreateDashboardWidget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (widget: Omit<DashboardWidget, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiService.createDashboardWidget(widget),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'widgets', variables.dashboardId] })
      queryClient.invalidateQueries({ queryKey: ['analytics', 'dashboard', variables.dashboardId] })
    },
  })
}

export function useUpdateDashboardWidget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...widget }: Partial<DashboardWidget> & { id: string }) =>
      apiService.updateDashboardWidget(id, widget),
    onSuccess: (_, variables) => {
      if (variables.dashboardId) {
        queryClient.invalidateQueries({ queryKey: ['analytics', 'widgets', variables.dashboardId] })
        queryClient.invalidateQueries({ queryKey: ['analytics', 'dashboard', variables.dashboardId] })
      }
    },
  })
}

export function useDeleteDashboardWidget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (widgetId: string) => apiService.deleteDashboardWidget(widgetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'widgets'] })
      queryClient.invalidateQueries({ queryKey: ['analytics', 'dashboards'] })
    },
  })
}

export function useKPIMetrics(filters?: AnalyticsFilter & { dateRange?: DateRange }) {
  return useQuery({
    queryKey: ['analytics', 'kpis', filters],
    queryFn: () => apiService.getKPIMetrics(filters),
  })
}

export function useKPIMetric(kpiId: string, dateRange?: DateRange) {
  return useQuery({
    queryKey: ['analytics', 'kpi', kpiId, dateRange],
    queryFn: () => apiService.getKPIMetric(kpiId, dateRange),
    enabled: !!kpiId,
  })
}

export function useCreateKPIMetric() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (kpi: Omit<KPIMetric, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiService.createKPIMetric(kpi),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'kpis'] })
    },
  })
}

export function useAdvancedReports(filters?: AnalyticsFilter) {
  return useQuery({
    queryKey: ['analytics', 'reports', filters],
    queryFn: () => apiService.getAdvancedReports(filters),
  })
}

export function useAdvancedReport(reportId: string) {
  return useQuery({
    queryKey: ['analytics', 'report', reportId],
    queryFn: () => apiService.getAdvancedReport(reportId),
    enabled: !!reportId,
  })
}

export function useCreateAdvancedReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (report: Omit<AdvancedReport, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiService.createAdvancedReport(report),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'reports'] })
    },
  })
}

export function useGenerateAdvancedReport() {
  return useMutation({
    mutationFn: ({ reportId, parameters }: { reportId: string; parameters?: Record<string, any> }) =>
      apiService.generateAdvancedReport(reportId, parameters),
  })
}

export function useExportAdvancedReport() {
  return useMutation({
    mutationFn: ({ reportId, format, parameters }: {
      reportId: string
      format: ExportFormat
      parameters?: Record<string, any>
    }) => apiService.exportAdvancedReport(reportId, format, parameters),
  })
}

export function useDataSourceConnections() {
  return useQuery({
    queryKey: ['analytics', 'data-sources'],
    queryFn: () => apiService.getDataSourceConnections(),
  })
}

export function useCreateDataSourceConnection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dataSource: Omit<DataSourceConnection, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiService.createDataSourceConnection(dataSource),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'data-sources'] })
    },
  })
}

export function useTestDataSourceConnection() {
  return useMutation({
    mutationFn: (connectionId: string) => apiService.testDataSourceConnection(connectionId),
  })
}

export function useAIInsights(context?: {
  dashboardId?: string
  reportId?: string
  kpiId?: string
  dateRange?: DateRange
}) {
  return useQuery({
    queryKey: ['analytics', 'ai-insights', context],
    queryFn: () => apiService.getAIInsights(context),
    enabled: !!context && Object.keys(context).length > 0,
  })
}

export function useGenerateAIInsight() {
  return useMutation({
    mutationFn: (context: {
      type: 'DASHBOARD' | 'REPORT' | 'KPI' | 'GENERAL'
      targetId?: string
      question?: string
      dateRange?: DateRange
    }) => apiService.generateAIInsight(context),
  })
}

export function useAnalyticsPreferences() {
  return useQuery({
    queryKey: ['analytics', 'preferences'],
    queryFn: () => apiService.getAnalyticsPreferences(),
  })
}

export function useUpdateAnalyticsPreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (preferences: Partial<AnalyticsPreferences>) =>
      apiService.updateAnalyticsPreferences(preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'preferences'] })
    },
  })
}

export function useWidgetData(widgetId: string, dateRange?: DateRange) {
  return useQuery({
    queryKey: ['analytics', 'widget-data', widgetId, dateRange],
    queryFn: () => apiService.getWidgetData(widgetId, dateRange),
    enabled: !!widgetId,
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  })
}

export function useAnalyticsSearch(query: string, filters?: AnalyticsFilter) {
  return useQuery({
    queryKey: ['analytics', 'search', query, filters],
    queryFn: () => apiService.searchAnalytics(query, filters),
    enabled: query.length > 2,
  })
}

export function useBulkExportAnalytics() {
  return useMutation({
    mutationFn: ({
      dashboardIds,
      reportIds,
      format,
      dateRange
    }: {
      dashboardIds?: string[]
      reportIds?: string[]
      format: ExportFormat
      dateRange?: DateRange
    }) => apiService.bulkExportAnalytics({ dashboardIds, reportIds, format, dateRange }),
  })
}

export function useAnalyticsAuditLog(filters?: {
  dateRange?: DateRange
  userId?: string
  action?: string
}) {
  return useQuery({
    queryKey: ['analytics', 'audit-log', filters],
    queryFn: () => apiService.getAnalyticsAuditLog(filters),
  })
}