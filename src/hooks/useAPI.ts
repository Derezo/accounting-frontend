import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { apiService } from '@/services/api.service'
import {
  Customer,
  Quote,
  Invoice,
  Payment,
  Project,
  OrganizationSettings,
  InvoiceTemplate,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CreateQuoteRequest,
  UpdateQuoteRequest,
  CreateInvoiceRequest,
  CreatePaymentRequest,
  CustomerFilters,
  QuoteFilters,
  InvoiceFilters,
  PaymentFilters,
} from '@/types/api'

// Query keys
export const apiQueryKeys = {
  customers: {
    all: ['api', 'customers'] as const,
    lists: () => [...apiQueryKeys.customers.all, 'list'] as const,
    list: (filters: CustomerFilters) => [...apiQueryKeys.customers.lists(), filters] as const,
    details: () => [...apiQueryKeys.customers.all, 'detail'] as const,
    detail: (id: string) => [...apiQueryKeys.customers.details(), id] as const,
  },
  quotes: {
    all: ['api', 'quotes'] as const,
    lists: () => [...apiQueryKeys.quotes.all, 'list'] as const,
    list: (filters: QuoteFilters) => [...apiQueryKeys.quotes.lists(), filters] as const,
    details: () => [...apiQueryKeys.quotes.all, 'detail'] as const,
    detail: (id: string) => [...apiQueryKeys.quotes.details(), id] as const,
  },
  invoices: {
    all: ['api', 'invoices'] as const,
    lists: () => [...apiQueryKeys.invoices.all, 'list'] as const,
    list: (filters: InvoiceFilters) => [...apiQueryKeys.invoices.lists(), filters] as const,
    details: () => [...apiQueryKeys.invoices.all, 'detail'] as const,
    detail: (id: string) => [...apiQueryKeys.invoices.details(), id] as const,
  },
  payments: {
    all: ['api', 'payments'] as const,
    lists: () => [...apiQueryKeys.payments.all, 'list'] as const,
    list: (filters: PaymentFilters) => [...apiQueryKeys.payments.lists(), filters] as const,
    details: () => [...apiQueryKeys.payments.all, 'detail'] as const,
    detail: (id: string) => [...apiQueryKeys.payments.details(), id] as const,
  },
  analytics: {
    all: ['api', 'analytics'] as const,
    revenue: (period: string) => [...apiQueryKeys.analytics.all, 'revenue', period] as const,
    customers: () => [...apiQueryKeys.analytics.all, 'customers'] as const,
    payments: () => [...apiQueryKeys.analytics.all, 'payments'] as const,
    forecast: (months: number) => [...apiQueryKeys.analytics.all, 'forecast', months] as const,
  },
  search: {
    all: ['api', 'search'] as const,
    smart: (query: string, types: string[]) => [...apiQueryKeys.search.all, 'smart', query, types] as const,
  },
  organization: {
    all: ['api', 'organization'] as const,
    settings: () => [...apiQueryKeys.organization.all, 'settings'] as const,
    templates: () => [...apiQueryKeys.organization.all, 'templates'] as const,
    template: (id: string) => [...apiQueryKeys.organization.all, 'template', id] as const,
  },
}

// Customer hooks
export function useCustomers(filters: CustomerFilters & { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: apiQueryKeys.customers.list(filters),
    queryFn: () => apiService.findCustomers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCustomer(customerId: string) {
  return useQuery({
    queryKey: apiQueryKeys.customers.detail(customerId),
    queryFn: () => apiService.getCustomer(customerId),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCustomerRequest) => apiService.createCustomer(data),
    onSuccess: (customer) => {
      // Invalidate customers list
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.customers.lists() })
      // Set customer in cache
      queryClient.setQueryData(apiQueryKeys.customers.detail(customer.id), customer)
      toast.success('Customer created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create customer')
    },
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ customerId, data }: { customerId: string; data: UpdateCustomerRequest }) =>
      apiService.updateCustomer(customerId, data),
    onSuccess: (customer, { customerId }) => {
      // Update customer in cache
      queryClient.setQueryData(apiQueryKeys.customers.detail(customerId), customer)
      // Invalidate customers list
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.customers.lists() })
      toast.success('Customer updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update customer')
    },
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (customerId: string) => apiService.deleteCustomer(customerId),
    onSuccess: (_, customerId) => {
      // Remove customer from cache
      queryClient.removeQueries({ queryKey: apiQueryKeys.customers.detail(customerId) })
      // Invalidate customers list
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.customers.lists() })
      toast.success('Customer deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete customer')
    },
  })
}

// Quote hooks
export function useQuotes(filters: QuoteFilters & { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: apiQueryKeys.quotes.list(filters),
    queryFn: () => apiService.findQuotes(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
  })
}

export function useQuote(quoteId: string) {
  return useQuery({
    queryKey: apiQueryKeys.quotes.detail(quoteId),
    queryFn: () => apiService.getQuote(quoteId),
    enabled: !!quoteId,
    staleTime: 3 * 60 * 1000,
  })
}

export function useCreateQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateQuoteRequest) => apiService.createQuote(data),
    onSuccess: (quote) => {
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.quotes.lists() })
      queryClient.setQueryData(apiQueryKeys.quotes.detail(quote.id), quote)
      toast.success('Quote created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create quote')
    },
  })
}

export function useUpdateQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ quoteId, data }: { quoteId: string; data: UpdateQuoteRequest }) =>
      apiService.updateQuote(quoteId, data),
    onSuccess: (quote, { quoteId }) => {
      queryClient.setQueryData(apiQueryKeys.quotes.detail(quoteId), quote)
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.quotes.lists() })
      toast.success('Quote updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update quote')
    },
  })
}

export function useSendQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ quoteId, recipientEmail }: { quoteId: string; recipientEmail?: string }) =>
      apiService.sendQuote(quoteId, recipientEmail),
    onSuccess: (_, { quoteId }) => {
      // Invalidate quote details to refresh status
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.quotes.detail(quoteId) })
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.quotes.lists() })
      toast.success('Quote sent successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send quote')
    },
  })
}

// Invoice hooks
export function useInvoices(filters: InvoiceFilters & { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: apiQueryKeys.invoices.list(filters),
    queryFn: () => apiService.findInvoices(filters),
    staleTime: 3 * 60 * 1000,
  })
}

export function useInvoice(invoiceId: string) {
  return useQuery({
    queryKey: apiQueryKeys.invoices.detail(invoiceId),
    queryFn: () => apiService.getInvoice(invoiceId),
    enabled: !!invoiceId,
    staleTime: 3 * 60 * 1000,
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateInvoiceRequest) => apiService.createInvoice(data),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.invoices.lists() })
      queryClient.setQueryData(apiQueryKeys.invoices.detail(invoice.id), invoice)
      toast.success('Invoice created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create invoice')
    },
  })
}

// Payment hooks
export function usePayments(filters: PaymentFilters & { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: apiQueryKeys.payments.list(filters),
    queryFn: () => apiService.findPayments(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent for payments)
  })
}

export function usePayment(paymentId: string) {
  return useQuery({
    queryKey: apiQueryKeys.payments.detail(paymentId),
    queryFn: () => apiService.getPayment(paymentId),
    enabled: !!paymentId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePaymentRequest) => apiService.createPayment(data),
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.payments.lists() })
      queryClient.setQueryData(apiQueryKeys.payments.detail(payment.id), payment)
      // Also invalidate invoice if payment is linked
      if (payment.invoiceId) {
        queryClient.invalidateQueries({ queryKey: apiQueryKeys.invoices.detail(payment.invoiceId) })
        queryClient.invalidateQueries({ queryKey: apiQueryKeys.invoices.lists() })
      }
      toast.success('Payment processed successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to process payment')
    },
  })
}

export function useUpdatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & CreatePaymentRequest) =>
      apiService.updatePayment(id, data),
    onSuccess: (payment, { id }) => {
      queryClient.setQueryData(apiQueryKeys.payments.detail(id), payment)
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.payments.lists() })
      // Also invalidate invoice if payment is linked
      if (payment.invoiceId) {
        queryClient.invalidateQueries({ queryKey: apiQueryKeys.invoices.detail(payment.invoiceId) })
        queryClient.invalidateQueries({ queryKey: apiQueryKeys.invoices.lists() })
      }
      toast.success('Payment updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update payment')
    },
  })
}

// Analytics hooks
export function useRevenueAnalytics(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly') {
  return useQuery({
    queryKey: apiQueryKeys.analytics.revenue(period),
    queryFn: () => apiService.getRevenueAnalytics(period),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

export function useCustomerAnalytics() {
  return useQuery({
    queryKey: apiQueryKeys.analytics.customers(),
    queryFn: () => apiService.getCustomerAnalytics(),
    staleTime: 15 * 60 * 1000,
  })
}

export function usePaymentAnalytics() {
  return useQuery({
    queryKey: apiQueryKeys.analytics.payments(),
    queryFn: () => apiService.getPaymentAnalytics(),
    staleTime: 15 * 60 * 1000,
  })
}

export function useRevenueForecasting(months: number = 6) {
  return useQuery({
    queryKey: apiQueryKeys.analytics.forecast(months),
    queryFn: () => apiService.forecastRevenue(months),
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Search hooks
export function useSmartSearch(query: string, types: ('customers' | 'quotes' | 'invoices' | 'payments')[] = ['customers', 'quotes', 'invoices']) {
  return useQuery({
    queryKey: apiQueryKeys.search.smart(query, types),
    queryFn: () => apiService.smartSearch(query, types),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000,
  })
}

// Project hooks
export function useAuthorizeProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { customerId: string; quoteId?: string; title: string; description?: string }) =>
      apiService.authorizeProject(data),
    onSuccess: () => {
      toast.success('Project authorized successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to authorize project')
    },
  })
}

// Utility hooks
export function useCalculateEstimate() {
  return useMutation({
    mutationFn: ({ requirements, projectType }: { requirements: string; projectType?: string }) =>
      apiService.calculateProjectEstimate(requirements, projectType),
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to calculate estimate')
    },
  })
}

// Organization hooks
export function useOrganizationSettings() {
  return useQuery({
    queryKey: apiQueryKeys.organization.settings(),
    queryFn: () => apiService.getOrganizationSettings(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useUpdateOrganizationSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (settings: Partial<OrganizationSettings>) =>
      apiService.updateOrganizationSettings(settings),
    onSuccess: (settings) => {
      queryClient.setQueryData(apiQueryKeys.organization.settings(), settings)
      toast.success('Organization settings updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update organization settings')
    },
  })
}

export function useInvoiceTemplates() {
  return useQuery({
    queryKey: apiQueryKeys.organization.templates(),
    queryFn: () => apiService.getInvoiceTemplates(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

export function useInvoiceTemplate(templateId: string) {
  return useQuery({
    queryKey: apiQueryKeys.organization.template(templateId),
    queryFn: () => apiService.getInvoiceTemplate(templateId),
    enabled: !!templateId,
    staleTime: 15 * 60 * 1000,
  })
}

export function useCreateInvoiceTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (template: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'updatedAt'>) =>
      apiService.createInvoiceTemplate(template),
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.organization.templates() })
      queryClient.setQueryData(apiQueryKeys.organization.template(template.id), template)
      toast.success('Invoice template created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create invoice template')
    },
  })
}

export function useUpdateInvoiceTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ templateId, updates }: { templateId: string; updates: Partial<InvoiceTemplate> }) =>
      apiService.updateInvoiceTemplate(templateId, updates),
    onSuccess: (template, { templateId }) => {
      queryClient.setQueryData(apiQueryKeys.organization.template(templateId), template)
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.organization.templates() })
      toast.success('Invoice template updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update invoice template')
    },
  })
}

export function useDeleteInvoiceTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (templateId: string) => apiService.deleteInvoiceTemplate(templateId),
    onSuccess: (_, templateId) => {
      queryClient.removeQueries({ queryKey: apiQueryKeys.organization.template(templateId) })
      queryClient.invalidateQueries({ queryKey: apiQueryKeys.organization.templates() })
      toast.success('Invoice template deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete invoice template')
    },
  })
}

// Invoice PDF and Email hooks
export function useSendInvoiceEmail() {
  return useMutation({
    mutationFn: ({
      invoiceId,
      recipientEmail,
      subject,
      message,
      attachPdf = true
    }: {
      invoiceId: string
      recipientEmail?: string
      subject?: string
      message?: string
      attachPdf?: boolean
    }) => apiService.sendInvoiceEmail(invoiceId, { recipientEmail, subject, message, attachPdf }),
    onSuccess: () => {
      toast.success('Invoice sent successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send invoice')
    },
  })
}