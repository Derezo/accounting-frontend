import { apiClient } from '@/lib/axios'
import {
  Customer,
  Quote,
  Invoice,
  Payment,
  Project,
  OrganizationSettings,
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
  PaginatedResponse,
  RevenueAnalytics,
  CustomerAnalytics,
  PaymentAnalytics,
} from '@/types/api'

class APIService {
  // Customer Management
  async createCustomer(data: CreateCustomerRequest): Promise<Customer> {
    const response = await apiClient.post<Customer>('/customers', data)
    return response.data
  }

  async findCustomers(filters: CustomerFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Customer>> {
    const response = await apiClient.get<PaginatedResponse<Customer>>('/customers', { params: filters })
    return response.data
  }

  async getCustomer(customerId: string): Promise<Customer> {
    const response = await apiClient.get<Customer>(`/customers/${customerId}`)
    return response.data
  }

  async updateCustomer(customerId: string, data: UpdateCustomerRequest): Promise<Customer> {
    const response = await apiClient.put<Customer>(`/customers/${customerId}`, data)
    return response.data
  }

  async deleteCustomer(customerId: string): Promise<void> {
    await apiClient.delete(`/customers/${customerId}`)
  }

  // Quote Management
  async createQuote(data: CreateQuoteRequest): Promise<Quote> {
    const response = await apiClient.post<Quote>('/quotes', data)
    return response.data
  }

  async findQuotes(filters: QuoteFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Quote>> {
    const response = await apiClient.get<PaginatedResponse<Quote>>('/quotes', { params: filters })
    return response.data
  }

  async getQuote(quoteId: string): Promise<Quote> {
    const response = await apiClient.get<Quote>(`/quotes/${quoteId}`)
    return response.data
  }

  async updateQuote(quoteId: string, data: UpdateQuoteRequest): Promise<Quote> {
    const response = await apiClient.put<Quote>(`/quotes/${quoteId}`, data)
    return response.data
  }

  async sendQuote(quoteId: string, recipientEmail?: string): Promise<void> {
    await apiClient.post(`/quotes/${quoteId}/send`, { recipientEmail })
  }

  // Invoice Management
  async createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
    const response = await apiClient.post<Invoice>('/invoices', data)
    return response.data
  }

  async findInvoices(filters: InvoiceFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Invoice>> {
    const response = await apiClient.get<PaginatedResponse<Invoice>>('/invoices', { params: filters })
    return response.data
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    const response = await apiClient.get<Invoice>(`/invoices/${invoiceId}`)
    return response.data
  }

  async sendInvoice(invoiceId: string, recipientEmail?: string): Promise<void> {
    await apiClient.post(`/invoices/${invoiceId}/send`, { recipientEmail })
  }

  // Payment Management
  async createPayment(data: CreatePaymentRequest): Promise<Payment> {
    const response = await apiClient.post<Payment>('/payments', data)
    return response.data
  }

  async updatePayment(paymentId: string, data: Partial<CreatePaymentRequest>): Promise<Payment> {
    const response = await apiClient.put<Payment>(`/payments/${paymentId}`, data)
    return response.data
  }

  async findPayments(filters: PaymentFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Payment>> {
    const response = await apiClient.get<PaginatedResponse<Payment>>('/payments', { params: filters })
    return response.data
  }

  async getPayment(paymentId: string): Promise<Payment> {
    const response = await apiClient.get<Payment>(`/payments/${paymentId}`)
    return response.data
  }

  // Project Management
  async authorizeProject(data: { customerId: string; quoteId?: string; title: string; description?: string }): Promise<Project> {
    const response = await apiClient.post<Project>('/projects', data)
    return response.data
  }

  async trackProjectProgress(projectId: string): Promise<Project> {
    const response = await apiClient.get<Project>(`/projects/${projectId}`)
    return response.data
  }

  async updateProjectHours(projectId: string, actualHours: number): Promise<Project> {
    const response = await apiClient.put<Project>(`/projects/${projectId}`, { actualHours })
    return response.data
  }

  // Search functionality
  async smartSearch(query: string, types: ('customers' | 'quotes' | 'invoices' | 'payments')[] = ['customers', 'quotes', 'invoices']): Promise<{
    customers: Customer[]
    quotes: Quote[]
    invoices: Invoice[]
    payments: Payment[]
  }> {
    const searchPromises = []

    if (types.includes('customers')) {
      searchPromises.push(this.findCustomers({ search: query, limit: 5 }))
    }
    if (types.includes('quotes')) {
      searchPromises.push(this.findQuotes({ search: query, limit: 5 }))
    }
    if (types.includes('invoices')) {
      searchPromises.push(this.findInvoices({ search: query, limit: 5 }))
    }
    if (types.includes('payments')) {
      searchPromises.push(this.findPayments({ search: query, limit: 5 }))
    }

    const results = await Promise.allSettled(searchPromises)

    return {
      customers: types.includes('customers') && results[0]?.status === 'fulfilled' ? results[0].value.data : [],
      quotes: types.includes('quotes') && results[1]?.status === 'fulfilled' ? results[1].value.data : [],
      invoices: types.includes('invoices') && results[2]?.status === 'fulfilled' ? results[2].value.data : [],
      payments: types.includes('payments') && results[3]?.status === 'fulfilled' ? results[3].value.data : [],
    }
  }

  // Organization Settings Management (placeholder - implement based on actual API)
  async getOrganizationSettings(): Promise<OrganizationSettings> {
    const response = await apiClient.get<OrganizationSettings>('/organizations/settings')
    return response.data
  }

  async updateOrganizationSettings(settings: Partial<OrganizationSettings>): Promise<OrganizationSettings> {
    const response = await apiClient.put<OrganizationSettings>('/organizations/settings', settings)
    return response.data
  }
}

export const apiService = new APIService()