import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/services/api.service'
import {
  PaymentGateway,
  PaymentMethod,
  PaymentProcessingSettings,
  RecurringPayment,
  PaymentPlan,
  RefundRequest,
  ChargebackNotice,
  PaymentAnalytics,
  CreatePaymentGatewayRequest,
  UpdatePaymentGatewayRequest,
  CreatePaymentMethodRequest,
  CreateRecurringPaymentRequest,
  CreatePaymentPlanRequest,
  CreateRefundRequest,
  ProcessPaymentRequest,
  PaymentGatewayFilters,
  PaymentMethodFilters,
  RecurringPaymentFilters,
  PaymentPlanFilters,
  RefundRequestFilters,
  ChargebackFilters,
  PaymentAnalyticsFilters
} from '@/types/payment-processing'
import { PaginatedResponse } from '@/types/api'
import toast from 'react-hot-toast'

// Query Keys
export const paymentProcessingQueryKeys = {
  all: ['payment-processing'] as const,
  gateways: () => [...paymentProcessingQueryKeys.all, 'gateways'] as const,
  gateway: (id: string) => [...paymentProcessingQueryKeys.gateways(), id] as const,
  paymentMethods: () => [...paymentProcessingQueryKeys.all, 'payment-methods'] as const,
  paymentMethod: (id: string) => [...paymentProcessingQueryKeys.paymentMethods(), id] as const,
  customerPaymentMethods: (customerId: string) => [...paymentProcessingQueryKeys.paymentMethods(), 'customer', customerId] as const,
  settings: () => [...paymentProcessingQueryKeys.all, 'settings'] as const,
  recurringPayments: () => [...paymentProcessingQueryKeys.all, 'recurring-payments'] as const,
  recurringPayment: (id: string) => [...paymentProcessingQueryKeys.recurringPayments(), id] as const,
  paymentPlans: () => [...paymentProcessingQueryKeys.all, 'payment-plans'] as const,
  paymentPlan: (id: string) => [...paymentProcessingQueryKeys.paymentPlans(), id] as const,
  refunds: () => [...paymentProcessingQueryKeys.all, 'refunds'] as const,
  refund: (id: string) => [...paymentProcessingQueryKeys.refunds(), id] as const,
  chargebacks: () => [...paymentProcessingQueryKeys.all, 'chargebacks'] as const,
  chargeback: (id: string) => [...paymentProcessingQueryKeys.chargebacks(), id] as const,
  analytics: (filters: PaymentAnalyticsFilters) => [...paymentProcessingQueryKeys.all, 'analytics', filters] as const,
}

// Payment Gateway Hooks
export function usePaymentGateways(filters: PaymentGatewayFilters = {}) {
  return useQuery({
    queryKey: [...paymentProcessingQueryKeys.gateways(), filters],
    queryFn: () => apiService.getPaymentGateways(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function usePaymentGateway(gatewayId: string) {
  return useQuery({
    queryKey: paymentProcessingQueryKeys.gateway(gatewayId),
    queryFn: () => apiService.getPaymentGateway(gatewayId),
    staleTime: 5 * 60 * 1000,
    enabled: !!gatewayId,
  })
}

export function useCreatePaymentGateway() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePaymentGatewayRequest) => apiService.createPaymentGateway(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentProcessingQueryKeys.gateways() })
      toast.success('Payment gateway created successfully')
    },
    onError: () => {
      toast.error('Failed to create payment gateway')
    },
  })
}

export function useUpdatePaymentGateway() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ gatewayId, data }: { gatewayId: string; data: UpdatePaymentGatewayRequest }) =>
      apiService.updatePaymentGateway(gatewayId, data),
    onSuccess: (_, { gatewayId }) => {
      queryClient.invalidateQueries({ queryKey: paymentProcessingQueryKeys.gateway(gatewayId) })
      queryClient.invalidateQueries({ queryKey: paymentProcessingQueryKeys.gateways() })
      toast.success('Payment gateway updated successfully')
    },
    onError: () => {
      toast.error('Failed to update payment gateway')
    },
  })
}

export function useDeletePaymentGateway() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (gatewayId: string) => apiService.deletePaymentGateway(gatewayId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentProcessingQueryKeys.gateways() })
      toast.success('Payment gateway deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete payment gateway')
    },
  })
}

export function useTestPaymentGateway() {
  return useMutation({
    mutationFn: (gatewayId: string) => apiService.testPaymentGateway(gatewayId),
    onSuccess: () => {
      toast.success('Payment gateway test successful')
    },
    onError: () => {
      toast.error('Payment gateway test failed')
    },
  })
}

// Payment Method Hooks
export function usePaymentMethods(filters: PaymentMethodFilters = {}) {
  return useQuery({
    queryKey: [...paymentProcessingQueryKeys.paymentMethods(), filters],
    queryFn: () => apiService.getPaymentMethods(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useCustomerPaymentMethods(customerId: string) {
  return useQuery({
    queryKey: paymentProcessingQueryKeys.customerPaymentMethods(customerId),
    queryFn: () => apiService.getCustomerPaymentMethods(customerId),
    staleTime: 2 * 60 * 1000,
    enabled: !!customerId,
  })
}

export function usePaymentMethod(paymentMethodId: string) {
  return useQuery({
    queryKey: paymentProcessingQueryKeys.paymentMethod(paymentMethodId),
    queryFn: () => apiService.getPaymentMethod(paymentMethodId),
    staleTime: 2 * 60 * 1000,
    enabled: !!paymentMethodId,
  })
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePaymentMethodRequest) => apiService.createPaymentMethod(data),
    onSuccess: (paymentMethod) => {
      queryClient.invalidateQueries({ queryKey: paymentProcessingQueryKeys.paymentMethods() })
      queryClient.invalidateQueries({ queryKey: paymentProcessingQueryKeys.customerPaymentMethods(paymentMethod.customerId) })
      toast.success('Payment method added successfully')
    },
    onError: () => {
      toast.error('Failed to add payment method')
    },
  })
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ paymentMethodId, data }: { paymentMethodId: string; data: Partial<CreatePaymentMethodRequest> }) =>
      apiService.updatePaymentMethod(paymentMethodId, data),
    onSuccess: (paymentMethod, { paymentMethodId }) => {
      queryClient.invalidateQueries({ queryKey: paymentProcessingQueryKeys.paymentMethod(paymentMethodId) })
      queryClient.invalidateQueries({ queryKey: paymentProcessingQueryKeys.customerPaymentMethods(paymentMethod.customerId) })
      queryClient.invalidateQueries({ queryKey: paymentProcessingQueryKeys.paymentMethods() })
      toast.success('Payment method updated successfully')
    },
    onError: () => {
      toast.error('Failed to update payment method')
    },
  })
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (paymentMethodId: string) => apiService.deletePaymentMethod(paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentProcessingQueryKeys.paymentMethods() })
      toast.success('Payment method deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete payment method')
    },
  })
}

export function useVerifyPaymentMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (paymentMethodId: string) => apiService.verifyPaymentMethod(paymentMethodId),
    onSuccess: (_, paymentMethodId) => {
      queryClient.invalidateQueries({ queryKey: paymentProcessingQueryKeys.paymentMethod(paymentMethodId) })
      toast.success('Payment method verified successfully')
    },
    onError: () => {
      toast.error('Failed to verify payment method')
    },
  })
}

// Payment Processing Settings Hooks
export function usePaymentProcessingSettings() {
  return useQuery({
    queryKey: paymentProcessingQueryKeys.settings(),
    queryFn: () => apiService.getPaymentProcessingSettings(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useUpdatePaymentProcessingSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<PaymentProcessingSettings>) => apiService.updatePaymentProcessingSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentProcessingQueryKeys.settings() })
      toast.success('Payment processing settings updated successfully')
    },
    onError: () => {
      toast.error('Failed to update payment processing settings')
    },
  })
}

// Recurring Payment Hooks
export function useRecurringPayments(filters: RecurringPaymentFilters = {}) {
  return useQuery({
    queryKey: [...paymentProcessingQueryKeys.recurringPayments(), filters],
    queryFn: () => apiService.getRecurringPayments(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useRecurringPayment(recurringPaymentId: string) {
  return useQuery({
    queryKey: paymentProcessingQueryKeys.recurringPayment(recurringPaymentId),
    queryFn: () => apiService.getRecurringPayment(recurringPaymentId),
    staleTime: 5 * 60 * 1000,
    enabled: !!recurringPaymentId,
  })
}

export function useCreateRecurringPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRecurringPaymentRequest) => apiService.createRecurringPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentProcessingQueryKeys.recurringPayments() })
      toast.success('Recurring payment created successfully')
    },
    onError: () => {
      toast.error('Failed to create recurring payment')
    },
  })
}

export function useUpdateRecurringPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ recurringPaymentId, data }: { recurringPaymentId: string; data: Partial<CreateRecurringPaymentRequest> }) =>
      apiService.updateRecurringPayment(recurringPaymentId, data),
    onSuccess: (_, { recurringPaymentId }) => {
      queryClient.invalidateQueries({ queryKey: paymentProcessingQueryKeys.recurringPayment(recurringPaymentId) })
      queryClient.invalidateQueries({ queryKey: paymentProcessingQueryKeys.recurringPayments() })
      toast.success('Recurring payment updated successfully')
    },
    onError: () => {
      toast.error('Failed to update recurring payment')
    },
  })
}

export function useCancelRecurringPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (recurringPaymentId: string) => apiService.cancelRecurringPayment(recurringPaymentId),
    onSuccess: (_, recurringPaymentId) => {
      queryClient.invalidateQueries({ queryKey: paymentProcessingQueryKeys.recurringPayment(recurringPaymentId) })
      queryClient.invalidateQueries({ queryKey: paymentProcessingQueryKeys.recurringPayments() })
      toast.success('Recurring payment cancelled successfully')
    },
    onError: () => {
      toast.error('Failed to cancel recurring payment')
    },
  })
}

// Payment Plan Hooks
export function usePaymentPlans(filters: PaymentPlanFilters = {}) {
  return useQuery({
    queryKey: [...paymentProcessingQueryKeys.paymentPlans(), filters],
    queryFn: () => apiService.getPaymentPlans(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function usePaymentPlan(paymentPlanId: string) {
  return useQuery({
    queryKey: paymentProcessingQueryKeys.paymentPlan(paymentPlanId),
    queryFn: () => apiService.getPaymentPlan(paymentPlanId),
    staleTime: 5 * 60 * 1000,
    enabled: !!paymentPlanId,
  })
}

export function useCreatePaymentPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePaymentPlanRequest) => apiService.createPaymentPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentProcessingQueryKeys.paymentPlans() })
      toast.success('Payment plan created successfully')
    },
    onError: () => {
      toast.error('Failed to create payment plan')
    },
  })
}

export function useUpdatePaymentPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ paymentPlanId, data }: { paymentPlanId: string; data: Partial<CreatePaymentPlanRequest> }) =>
      apiService.updatePaymentPlan(paymentPlanId, data),
    onSuccess: (_, { paymentPlanId }) => {
      queryClient.invalidateQueries({ queryKey: paymentProcessingQueryKeys.paymentPlan(paymentPlanId) })
      queryClient.invalidateQueries({ queryKey: paymentProcessingQueryKeys.paymentPlans() })
      toast.success('Payment plan updated successfully')
    },
    onError: () => {
      toast.error('Failed to update payment plan')
    },
  })
}

export function useCancelPaymentPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (paymentPlanId: string) => apiService.cancelPaymentPlan(paymentPlanId),
    onSuccess: (_, paymentPlanId) => {
      queryClient.invalidateQueries({ queryKey: paymentProcessingQueryKeys.paymentPlan(paymentPlanId) })
      queryClient.invalidateQueries({ queryKey: paymentProcessingQueryKeys.paymentPlans() })
      toast.success('Payment plan cancelled successfully')
    },
    onError: () => {
      toast.error('Failed to cancel payment plan')
    },
  })
}

// Payment Processing Hooks
export function useProcessPayment() {
  return useMutation({
    mutationFn: (data: ProcessPaymentRequest) => apiService.processPayment(data),
    onSuccess: () => {
      toast.success('Payment processed successfully')
    },
    onError: () => {
      toast.error('Payment processing failed')
    },
  })
}

export function useRetryPayment() {
  return useMutation({
    mutationFn: (paymentId: string) => apiService.retryPayment(paymentId),
    onSuccess: () => {
      toast.success('Payment retry initiated')
    },
    onError: () => {
      toast.error('Failed to retry payment')
    },
  })
}

// Refund Hooks
export function useRefundRequests(filters: RefundRequestFilters = {}) {
  return useQuery({
    queryKey: [...paymentProcessingQueryKeys.refunds(), filters],
    queryFn: () => apiService.getRefundRequests(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useRefundRequest(refundId: string) {
  return useQuery({
    queryKey: paymentProcessingQueryKeys.refund(refundId),
    queryFn: () => apiService.getRefundRequest(refundId),
    staleTime: 5 * 60 * 1000,
    enabled: !!refundId,
  })
}

export function useCreateRefundRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRefundRequest) => apiService.createRefundRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentProcessingQueryKeys.refunds() })
      toast.success('Refund request created successfully')
    },
    onError: () => {
      toast.error('Failed to create refund request')
    },
  })
}

export function useProcessRefund() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ refundId, approve }: { refundId: string; approve: boolean }) =>
      apiService.processRefund(refundId, approve),
    onSuccess: (_, { refundId }) => {
      queryClient.invalidateQueries({ queryKey: paymentProcessingQueryKeys.refund(refundId) })
      queryClient.invalidateQueries({ queryKey: paymentProcessingQueryKeys.refunds() })
      toast.success('Refund processed successfully')
    },
    onError: () => {
      toast.error('Failed to process refund')
    },
  })
}

// Chargeback Hooks
export function useChargebacks(filters: ChargebackFilters = {}) {
  return useQuery({
    queryKey: [...paymentProcessingQueryKeys.chargebacks(), filters],
    queryFn: () => apiService.getChargebacks(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useChargeback(chargebackId: string) {
  return useQuery({
    queryKey: paymentProcessingQueryKeys.chargeback(chargebackId),
    queryFn: () => apiService.getChargeback(chargebackId),
    staleTime: 5 * 60 * 1000,
    enabled: !!chargebackId,
  })
}

export function useSubmitChargebackEvidence() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ chargebackId, evidence }: { chargebackId: string; evidence: { description: string; documents: string[] } }) =>
      apiService.submitChargebackEvidence(chargebackId, evidence),
    onSuccess: (_, { chargebackId }) => {
      queryClient.invalidateQueries({ queryKey: paymentProcessingQueryKeys.chargeback(chargebackId) })
      queryClient.invalidateQueries({ queryKey: paymentProcessingQueryKeys.chargebacks() })
      toast.success('Chargeback evidence submitted successfully')
    },
    onError: () => {
      toast.error('Failed to submit chargeback evidence')
    },
  })
}

// Analytics Hooks
export function usePaymentAnalytics(filters: PaymentAnalyticsFilters) {
  return useQuery({
    queryKey: paymentProcessingQueryKeys.analytics(filters),
    queryFn: () => apiService.getPaymentAnalytics(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!filters.dateFrom && !!filters.dateTo,
  })
}

export function usePaymentTrends(filters: PaymentAnalyticsFilters) {
  return useQuery({
    queryKey: [...paymentProcessingQueryKeys.analytics(filters), 'trends'],
    queryFn: () => apiService.getPaymentTrends(filters),
    staleTime: 10 * 60 * 1000,
    enabled: !!filters.dateFrom && !!filters.dateTo,
  })
}