import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/services/api.service'
import {
  CustomerLifecycle,
  CustomerCommunication,
  CustomerOnboarding,
  CustomerPortalAccess,
  CustomerEvent,
  CustomerRelationshipHistory,
  CustomerInsights,
  CustomerSegment,
  OnboardingTemplate,
  CreateCommunicationRequest,
  CreateOnboardingRequest,
  CreateCustomerEventRequest,
  UpdateCustomerLifecycleRequest,
  UpdatePortalAccessRequest,
  CustomerLifecycleFilters,
  CommunicationFilters,
  OnboardingFilters
} from '@/types/customer-lifecycle'

// Query Keys
export const customerLifecycleQueryKeys = {
  all: ['customer-lifecycle'] as const,
  lifecycle: (customerId?: string) => [...customerLifecycleQueryKeys.all, 'lifecycle', customerId] as const,
  lifecycles: (filters?: CustomerLifecycleFilters) => [...customerLifecycleQueryKeys.all, 'lifecycles', filters] as const,
  communications: (filters?: CommunicationFilters) => [...customerLifecycleQueryKeys.all, 'communications', filters] as const,
  communication: (id: string) => [...customerLifecycleQueryKeys.all, 'communication', id] as const,
  onboarding: (customerId?: string) => [...customerLifecycleQueryKeys.all, 'onboarding', customerId] as const,
  onboardings: (filters?: OnboardingFilters) => [...customerLifecycleQueryKeys.all, 'onboardings', filters] as const,
  onboardingTemplates: () => [...customerLifecycleQueryKeys.all, 'onboarding-templates'] as const,
  portalAccess: (customerId: string) => [...customerLifecycleQueryKeys.all, 'portal-access', customerId] as const,
  events: (customerId?: string, filters?: any) => [...customerLifecycleQueryKeys.all, 'events', customerId, filters] as const,
  event: (id: string) => [...customerLifecycleQueryKeys.all, 'event', id] as const,
  history: (customerId: string) => [...customerLifecycleQueryKeys.all, 'history', customerId] as const,
  insights: (customerId: string) => [...customerLifecycleQueryKeys.all, 'insights', customerId] as const,
  segments: () => [...customerLifecycleQueryKeys.all, 'segments'] as const,
  segment: (id: string) => [...customerLifecycleQueryKeys.all, 'segment', id] as const,
  analytics: (filters?: any) => [...customerLifecycleQueryKeys.all, 'analytics', filters] as const,
}

// Customer Lifecycle hooks
export function useCustomerLifecycle(customerId: string) {
  return useQuery({
    queryKey: customerLifecycleQueryKeys.lifecycle(customerId),
    queryFn: () => apiService.getCustomerLifecycle(customerId),
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useCustomerLifecycles(filters?: CustomerLifecycleFilters) {
  return useQuery({
    queryKey: customerLifecycleQueryKeys.lifecycles(filters),
    queryFn: () => apiService.getCustomerLifecycles(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUpdateCustomerLifecycle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ customerId, data }: { customerId: string; data: UpdateCustomerLifecycleRequest }) =>
      apiService.updateCustomerLifecycle(customerId, data),
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.lifecycle(customerId) })
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.lifecycles() })
    },
  })
}

export function useAdvanceLifecycleStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ customerId, stage, notes }: { customerId: string; stage: string; notes?: string }) =>
      apiService.advanceCustomerLifecycleStage(customerId, stage, notes),
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.lifecycle(customerId) })
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.lifecycles() })
    },
  })
}

// Communication hooks
export function useCustomerCommunications(filters?: CommunicationFilters) {
  return useQuery({
    queryKey: customerLifecycleQueryKeys.communications(filters),
    queryFn: () => apiService.getCustomerCommunications(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export function useCustomerCommunication(id: string) {
  return useQuery({
    queryKey: customerLifecycleQueryKeys.communication(id),
    queryFn: () => apiService.getCustomerCommunication(id),
    enabled: !!id,
  })
}

export function useCreateCommunication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCommunicationRequest) => apiService.createCustomerCommunication(data),
    onSuccess: (newCommunication) => {
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.communications() })
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.lifecycle(newCommunication.customerId) })
    },
  })
}

export function useUpdateCommunication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCommunicationRequest> }) =>
      apiService.updateCustomerCommunication(id, data),
    onSuccess: (updatedCommunication, { id }) => {
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.communication(id) })
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.communications() })
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.lifecycle(updatedCommunication.customerId) })
    },
  })
}

export function useDeleteCommunication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiService.deleteCustomerCommunication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.communications() })
    },
  })
}

// Onboarding hooks
export function useCustomerOnboarding(customerId: string) {
  return useQuery({
    queryKey: customerLifecycleQueryKeys.onboarding(customerId),
    queryFn: () => apiService.getCustomerOnboarding(customerId),
    enabled: !!customerId,
  })
}

export function useCustomerOnboardings(filters?: OnboardingFilters) {
  return useQuery({
    queryKey: customerLifecycleQueryKeys.onboardings(filters),
    queryFn: () => apiService.getCustomerOnboardings(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useOnboardingTemplates() {
  return useQuery({
    queryKey: customerLifecycleQueryKeys.onboardingTemplates(),
    queryFn: () => apiService.getOnboardingTemplates(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useCreateOnboarding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateOnboardingRequest) => apiService.createCustomerOnboarding(data),
    onSuccess: (newOnboarding) => {
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.onboarding(newOnboarding.customerId) })
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.onboardings() })
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.lifecycle(newOnboarding.customerId) })
    },
  })
}

export function useUpdateOnboardingStep() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ onboardingId, stepId, data }: { onboardingId: string; stepId: string; data: any }) =>
      apiService.updateOnboardingStep(onboardingId, stepId, data),
    onSuccess: (_, { onboardingId }) => {
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.onboardings() })
      // Also invalidate specific onboarding query
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'customer-lifecycle' &&
          query.queryKey[1] === 'onboarding'
      })
    },
  })
}

export function useCompleteOnboardingStep() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ onboardingId, stepId, notes }: { onboardingId: string; stepId: string; notes?: string }) =>
      apiService.completeOnboardingStep(onboardingId, stepId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.onboardings() })
    },
  })
}

// Portal Access hooks
export function useCustomerPortalAccess(customerId: string) {
  return useQuery({
    queryKey: customerLifecycleQueryKeys.portalAccess(customerId),
    queryFn: () => apiService.getCustomerPortalAccess(customerId),
    enabled: !!customerId,
  })
}

export function useUpdatePortalAccess() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ customerId, data }: { customerId: string; data: UpdatePortalAccessRequest }) =>
      apiService.updateCustomerPortalAccess(customerId, data),
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.portalAccess(customerId) })
    },
  })
}

export function useCreatePortalInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ customerId, email, message }: { customerId: string; email?: string; message?: string }) =>
      apiService.createPortalInvitation(customerId, email, message),
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.portalAccess(customerId) })
    },
  })
}

// Event hooks
export function useCustomerEvents(customerId?: string, filters?: any) {
  return useQuery({
    queryKey: customerLifecycleQueryKeys.events(customerId, filters),
    queryFn: () => apiService.getCustomerEvents(customerId, filters),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export function useCustomerEvent(id: string) {
  return useQuery({
    queryKey: customerLifecycleQueryKeys.event(id),
    queryFn: () => apiService.getCustomerEvent(id),
    enabled: !!id,
  })
}

export function useCreateCustomerEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCustomerEventRequest) => apiService.createCustomerEvent(data),
    onSuccess: (newEvent) => {
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.events(newEvent.customerId) })
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.events() })
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.lifecycle(newEvent.customerId) })
    },
  })
}

export function useUpdateCustomerEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCustomerEventRequest> }) =>
      apiService.updateCustomerEvent(id, data),
    onSuccess: (updatedEvent, { id }) => {
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.event(id) })
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.events(updatedEvent.customerId) })
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.events() })
    },
  })
}

export function useDeleteCustomerEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiService.deleteCustomerEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.events() })
    },
  })
}

// History and Insights hooks
export function useCustomerHistory(customerId: string) {
  return useQuery({
    queryKey: customerLifecycleQueryKeys.history(customerId),
    queryFn: () => apiService.getCustomerRelationshipHistory(customerId),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCustomerInsights(customerId: string) {
  return useQuery({
    queryKey: customerLifecycleQueryKeys.insights(customerId),
    queryFn: () => apiService.getCustomerInsights(customerId),
    enabled: !!customerId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useRefreshInsights() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (customerId: string) => apiService.refreshCustomerInsights(customerId),
    onSuccess: (_, customerId) => {
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.insights(customerId) })
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.lifecycle(customerId) })
    },
  })
}

// Segmentation hooks
export function useCustomerSegments() {
  return useQuery({
    queryKey: customerLifecycleQueryKeys.segments(),
    queryFn: () => apiService.getCustomerSegments(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

export function useCustomerSegment(id: string) {
  return useQuery({
    queryKey: customerLifecycleQueryKeys.segment(id),
    queryFn: () => apiService.getCustomerSegment(id),
    enabled: !!id,
  })
}

export function useCreateCustomerSegment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => apiService.createCustomerSegment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.segments() })
    },
  })
}

export function useUpdateCustomerSegment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiService.updateCustomerSegment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.segment(id) })
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.segments() })
    },
  })
}

// Analytics hooks
export function useCustomerLifecycleAnalytics(filters?: any) {
  return useQuery({
    queryKey: customerLifecycleQueryKeys.analytics(filters),
    queryFn: () => apiService.getCustomerLifecycleAnalytics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Bulk operations
export function useBulkUpdateLifecycleStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ customerIds, stage, notes }: { customerIds: string[]; stage: string; notes?: string }) =>
      apiService.bulkUpdateLifecycleStage(customerIds, stage, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.lifecycles() })
    },
  })
}

export function useBulkCreateCommunications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ customerIds, data }: { customerIds: string[]; data: Omit<CreateCommunicationRequest, 'customerId'> }) =>
      apiService.bulkCreateCommunications(customerIds, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.communications() })
    },
  })
}

// File upload hooks
export function useUploadCommunicationAttachment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ communicationId, file }: { communicationId: string; file: File }) =>
      apiService.uploadCommunicationAttachment(communicationId, file),
    onSuccess: (_, { communicationId }) => {
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.communication(communicationId) })
    },
  })
}

export function useDeleteCommunicationAttachment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ communicationId, attachmentId }: { communicationId: string; attachmentId: string }) =>
      apiService.deleteCommunicationAttachment(communicationId, attachmentId),
    onSuccess: (_, { communicationId }) => {
      queryClient.invalidateQueries({ queryKey: customerLifecycleQueryKeys.communication(communicationId) })
    },
  })
}

// Export hooks
export function useExportCustomerData() {
  return useMutation({
    mutationFn: ({ customerId, format, includeHistory }: { customerId: string; format: 'PDF' | 'EXCEL' | 'CSV'; includeHistory?: boolean }) =>
      apiService.exportCustomerData(customerId, format, includeHistory),
  })
}

export function useExportLifecycleReport() {
  return useMutation({
    mutationFn: ({ format, filters }: { format: 'PDF' | 'EXCEL' | 'CSV'; filters?: CustomerLifecycleFilters }) =>
      apiService.exportLifecycleReport(format, filters),
  })
}