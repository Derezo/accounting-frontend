import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/services/api.service'
import {
  SystemSettings,
  Organization,
  Subscription,
  SubscriptionPlan,
  SystemHealth,
  SystemLog,
  SystemIntegration,
  MaintenanceWindow,
  SystemAnalytics,
  FeatureToggle,
  OrganizationFilters,
  SystemLogFilters,
  IntegrationFilters,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  CreateSubscriptionPlanRequest,
  CreateIntegrationRequest,
  CreateMaintenanceWindowRequest,
  UpdateSystemSettingsRequest,
  FeatureToggleRequest
} from '@/types/system-admin'

// Query Keys
export const systemAdminQueryKeys = {
  all: ['system-admin'] as const,
  settings: () => [...systemAdminQueryKeys.all, 'settings'] as const,
  organizations: (filters?: OrganizationFilters) => [...systemAdminQueryKeys.all, 'organizations', filters] as const,
  organization: (id: string) => [...systemAdminQueryKeys.all, 'organization', id] as const,
  subscriptionPlans: () => [...systemAdminQueryKeys.all, 'subscription-plans'] as const,
  subscriptionPlan: (id: string) => [...systemAdminQueryKeys.all, 'subscription-plan', id] as const,
  subscriptions: (organizationId?: string) => [...systemAdminQueryKeys.all, 'subscriptions', organizationId] as const,
  subscription: (id: string) => [...systemAdminQueryKeys.all, 'subscription', id] as const,
  systemHealth: () => [...systemAdminQueryKeys.all, 'system-health'] as const,
  systemLogs: (filters?: SystemLogFilters) => [...systemAdminQueryKeys.all, 'system-logs', filters] as const,
  integrations: (filters?: IntegrationFilters) => [...systemAdminQueryKeys.all, 'integrations', filters] as const,
  integration: (id: string) => [...systemAdminQueryKeys.all, 'integration', id] as const,
  maintenanceWindows: () => [...systemAdminQueryKeys.all, 'maintenance-windows'] as const,
  maintenanceWindow: (id: string) => [...systemAdminQueryKeys.all, 'maintenance-window', id] as const,
  analytics: (period?: { start: string; end: string }) => [...systemAdminQueryKeys.all, 'analytics', period] as const,
  featureToggles: () => [...systemAdminQueryKeys.all, 'feature-toggles'] as const,
  featureToggle: (id: string) => [...systemAdminQueryKeys.all, 'feature-toggle', id] as const,
  systemUsers: () => [...systemAdminQueryKeys.all, 'system-users'] as const,
  backups: () => [...systemAdminQueryKeys.all, 'backups'] as const,
}

// System Settings hooks
export function useSystemSettings() {
  return useQuery({
    queryKey: systemAdminQueryKeys.settings(),
    queryFn: () => apiService.getSystemSettings(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useUpdateSystemSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateSystemSettingsRequest) => apiService.updateSystemSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.settings() })
    },
  })
}

// Organization Management hooks
export function useOrganizations(filters?: OrganizationFilters) {
  return useQuery({
    queryKey: systemAdminQueryKeys.organizations(filters),
    queryFn: () => apiService.getOrganizations(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: systemAdminQueryKeys.organization(id),
    queryFn: () => apiService.getOrganization(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useCreateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateOrganizationRequest) => apiService.createOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.organizations() })
    },
  })
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrganizationRequest }) =>
      apiService.updateOrganization(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.organization(id) })
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.organizations() })
    },
  })
}

export function useSuspendOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiService.suspendOrganization(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.organization(id) })
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.organizations() })
    },
  })
}

export function useTerminateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiService.terminateOrganization(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.organization(id) })
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.organizations() })
    },
  })
}

// Subscription Management hooks
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: systemAdminQueryKeys.subscriptionPlans(),
    queryFn: () => apiService.getSubscriptionPlans(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

export function useSubscriptionPlan(id: string) {
  return useQuery({
    queryKey: systemAdminQueryKeys.subscriptionPlan(id),
    queryFn: () => apiService.getSubscriptionPlan(id),
    enabled: !!id,
  })
}

export function useCreateSubscriptionPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSubscriptionPlanRequest) => apiService.createSubscriptionPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.subscriptionPlans() })
    },
  })
}

export function useUpdateSubscriptionPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSubscriptionPlanRequest> }) =>
      apiService.updateSubscriptionPlan(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.subscriptionPlan(id) })
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.subscriptionPlans() })
    },
  })
}

export function useDeleteSubscriptionPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiService.deleteSubscriptionPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.subscriptionPlans() })
    },
  })
}

export function useSubscriptions(organizationId?: string) {
  return useQuery({
    queryKey: systemAdminQueryKeys.subscriptions(organizationId),
    queryFn: () => apiService.getSubscriptions(organizationId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useSubscription(id: string) {
  return useQuery({
    queryKey: systemAdminQueryKeys.subscription(id),
    queryFn: () => apiService.getSubscription(id),
    enabled: !!id,
  })
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiService.updateSubscription(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.subscription(id) })
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.subscriptions() })
    },
  })
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiService.cancelSubscription(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.subscription(id) })
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.subscriptions() })
    },
  })
}

// System Health and Monitoring hooks
export function useSystemHealth() {
  return useQuery({
    queryKey: systemAdminQueryKeys.systemHealth(),
    queryFn: () => apiService.getSystemHealth(),
    refetchInterval: 30 * 1000, // 30 seconds
    staleTime: 10 * 1000, // 10 seconds
  })
}

export function useSystemLogs(filters?: SystemLogFilters) {
  return useQuery({
    queryKey: systemAdminQueryKeys.systemLogs(filters),
    queryFn: () => apiService.getSystemLogs(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export function useSystemLogStream() {
  return useQuery({
    queryKey: [...systemAdminQueryKeys.all, 'log-stream'],
    queryFn: () => apiService.getSystemLogStream(),
    refetchInterval: 5 * 1000, // 5 seconds
    staleTime: 1 * 1000, // 1 second
  })
}

export function useClearSystemLogs() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ before, level }: { before?: string; level?: string }) =>
      apiService.clearSystemLogs(before, level),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.systemLogs() })
    },
  })
}

// Integration Management hooks
export function useIntegrations(filters?: IntegrationFilters) {
  return useQuery({
    queryKey: systemAdminQueryKeys.integrations(filters),
    queryFn: () => apiService.getIntegrations(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useIntegration(id: string) {
  return useQuery({
    queryKey: systemAdminQueryKeys.integration(id),
    queryFn: () => apiService.getIntegration(id),
    enabled: !!id,
  })
}

export function useCreateIntegration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateIntegrationRequest) => apiService.createIntegration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.integrations() })
    },
  })
}

export function useUpdateIntegration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateIntegrationRequest> }) =>
      apiService.updateIntegration(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.integration(id) })
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.integrations() })
    },
  })
}

export function useDeleteIntegration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiService.deleteIntegration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.integrations() })
    },
  })
}

export function useTestIntegration() {
  return useMutation({
    mutationFn: (id: string) => apiService.testIntegration(id),
  })
}

// Maintenance Window hooks
export function useMaintenanceWindows() {
  return useQuery({
    queryKey: systemAdminQueryKeys.maintenanceWindows(),
    queryFn: () => apiService.getMaintenanceWindows(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useMaintenanceWindow(id: string) {
  return useQuery({
    queryKey: systemAdminQueryKeys.maintenanceWindow(id),
    queryFn: () => apiService.getMaintenanceWindow(id),
    enabled: !!id,
  })
}

export function useCreateMaintenanceWindow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateMaintenanceWindowRequest) => apiService.createMaintenanceWindow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.maintenanceWindows() })
    },
  })
}

export function useUpdateMaintenanceWindow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateMaintenanceWindowRequest> }) =>
      apiService.updateMaintenanceWindow(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.maintenanceWindow(id) })
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.maintenanceWindows() })
    },
  })
}

export function useStartMaintenanceWindow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiService.startMaintenanceWindow(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.maintenanceWindow(id) })
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.maintenanceWindows() })
    },
  })
}

export function useCompleteMaintenanceWindow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      apiService.completeMaintenanceWindow(id, notes),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.maintenanceWindow(id) })
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.maintenanceWindows() })
    },
  })
}

export function useCancelMaintenanceWindow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiService.cancelMaintenanceWindow(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.maintenanceWindow(id) })
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.maintenanceWindows() })
    },
  })
}

// Analytics hooks
export function useSystemAnalytics(period?: { start: string; end: string }) {
  return useQuery({
    queryKey: systemAdminQueryKeys.analytics(period),
    queryFn: () => apiService.getSystemAnalytics(period),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useGenerateAnalyticsReport() {
  return useMutation({
    mutationFn: ({ period, format }: { period: { start: string; end: string }; format: 'PDF' | 'EXCEL' | 'CSV' }) =>
      apiService.generateAnalyticsReport(period, format),
  })
}

// Feature Toggle hooks
export function useFeatureToggles() {
  return useQuery({
    queryKey: systemAdminQueryKeys.featureToggles(),
    queryFn: () => apiService.getFeatureToggles(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useFeatureToggle(id: string) {
  return useQuery({
    queryKey: systemAdminQueryKeys.featureToggle(id),
    queryFn: () => apiService.getFeatureToggle(id),
    enabled: !!id,
  })
}

export function useCreateFeatureToggle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: FeatureToggleRequest) => apiService.createFeatureToggle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.featureToggles() })
    },
  })
}

export function useUpdateFeatureToggle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FeatureToggleRequest> }) =>
      apiService.updateFeatureToggle(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.featureToggle(id) })
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.featureToggles() })
    },
  })
}

export function useDeleteFeatureToggle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiService.deleteFeatureToggle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.featureToggles() })
    },
  })
}

// System Users hooks
export function useSystemUsers() {
  return useQuery({
    queryKey: systemAdminQueryKeys.systemUsers(),
    queryFn: () => apiService.getSystemUsers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateSystemUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => apiService.createSystemUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.systemUsers() })
    },
  })
}

export function useUpdateSystemUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      apiService.updateSystemUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.systemUsers() })
    },
  })
}

// Backup Management hooks
export function useBackups() {
  return useQuery({
    queryKey: systemAdminQueryKeys.backups(),
    queryFn: () => apiService.getBackups(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateBackup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ includeFiles, description }: { includeFiles?: boolean; description?: string }) =>
      apiService.createBackup(includeFiles, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.backups() })
    },
  })
}

export function useRestoreBackup() {
  return useMutation({
    mutationFn: (backupId: string) => apiService.restoreBackup(backupId),
  })
}

export function useDeleteBackup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (backupId: string) => apiService.deleteBackup(backupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.backups() })
    },
  })
}

// Bulk Operations
export function useBulkUpdateOrganizations() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ organizationIds, data }: { organizationIds: string[]; data: Partial<UpdateOrganizationRequest> }) =>
      apiService.bulkUpdateOrganizations(organizationIds, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.organizations() })
    },
  })
}

export function useBulkSuspendOrganizations() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ organizationIds, reason }: { organizationIds: string[]; reason: string }) =>
      apiService.bulkSuspendOrganizations(organizationIds, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemAdminQueryKeys.organizations() })
    },
  })
}

// System Operations
export function useRestartService() {
  return useMutation({
    mutationFn: (serviceName: string) => apiService.restartService(serviceName),
  })
}

export function useFlushCache() {
  return useMutation({
    mutationFn: (cacheType?: string) => apiService.flushCache(cacheType),
  })
}

export function useRunSystemCheck() {
  return useMutation({
    mutationFn: () => apiService.runSystemCheck(),
  })
}

// Export hooks
export function useExportOrganizations() {
  return useMutation({
    mutationFn: ({ format, filters }: { format: 'PDF' | 'EXCEL' | 'CSV'; filters?: OrganizationFilters }) =>
      apiService.exportOrganizations(format, filters),
  })
}

export function useExportSystemLogs() {
  return useMutation({
    mutationFn: ({ format, filters }: { format: 'PDF' | 'EXCEL' | 'CSV'; filters?: SystemLogFilters }) =>
      apiService.exportSystemLogs(format, filters),
  })
}