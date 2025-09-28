import { apiClient } from '@/lib/axios'
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
  PaginatedResponse,
  RevenueAnalytics,
  CustomerAnalytics,
  PaymentAnalytics,
} from '@/types/api'

const MCP_BASE_URL = import.meta.env.VITE_MCP_SERVER_URL || 'http://localhost:3001'

interface MCPToolCall {
  tool: string
  parameters: Record<string, any>
}

interface MCPResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: string[]
  suggestions?: string[]
}

class MCPService {
  private async callTool<T = any>(tool: string, parameters: Record<string, any> = {}): Promise<T> {
    try {
      const response = await apiClient.post<MCPResponse<T>>('/mcp/tools/call', {
        tool,
        parameters,
      })

      if (!response.data.success) {
        throw new Error(response.data.message || 'MCP tool call failed')
      }

      return response.data.data as T
    } catch (error: any) {
      console.error(`MCP tool call failed for ${tool}:`, error)
      throw new Error(error.response?.data?.message || error.message || 'MCP service error')
    }
  }

  // Customer Management
  async createCustomer(data: CreateCustomerRequest): Promise<Customer> {
    return this.callTool<Customer>('create_customer_profile', data)
  }

  async findCustomers(filters: CustomerFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Customer>> {
    return this.callTool<PaginatedResponse<Customer>>('find_customer', filters)
  }

  async getCustomer(customerId: string): Promise<Customer> {
    return this.callTool<Customer>('get_customer_overview', { customerId })
  }

  async updateCustomer(customerId: string, data: UpdateCustomerRequest): Promise<Customer> {
    return this.callTool<Customer>('update_customer_profile', { customerId, ...data })
  }

  async deleteCustomer(customerId: string): Promise<void> {
    return this.callTool<void>('delete_customer', { customerId })
  }

  // Quote Management
  async createQuote(data: CreateQuoteRequest): Promise<Quote> {
    return this.callTool<Quote>('create_quote_from_requirements', {
      customerSearch: data.customerId,
      requirements: data.items.map(item => `${item.description} (${item.quantity}x at $${item.unitPrice})`).join(', '),
      validForDays: this.calculateDaysUntil(data.validUntil),
      items: data.items,
      notes: data.notes,
      terms: data.terms,
    })
  }

  async findQuotes(filters: QuoteFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Quote>> {
    return this.callTool<PaginatedResponse<Quote>>('find_quotes', filters)
  }

  async getQuote(quoteId: string): Promise<Quote> {
    return this.callTool<Quote>('get_quote_details', { quoteId })
  }

  async updateQuote(quoteId: string, data: UpdateQuoteRequest): Promise<Quote> {
    return this.callTool<Quote>('update_quote', { quoteId, ...data })
  }

  async sendQuote(quoteId: string, recipientEmail?: string): Promise<void> {
    return this.callTool<void>('send_quote_to_customer', { quoteId, recipientEmail })
  }

  async trackQuoteStatus(quoteId: string): Promise<Quote> {
    return this.callTool<Quote>('track_quote_status', { quoteId })
  }

  // Invoice Management
  async createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
    if (data.quoteId) {
      return this.callTool<Invoice>('generate_invoice_from_quote', {
        quoteId: data.quoteId,
        dueDate: data.dueDate,
        notes: data.notes,
        terms: data.terms,
      })
    } else {
      return this.callTool<Invoice>('create_invoice', data)
    }
  }

  async findInvoices(filters: InvoiceFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Invoice>> {
    return this.callTool<PaginatedResponse<Invoice>>('find_invoices', filters)
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    return this.callTool<Invoice>('get_invoice_details', { invoiceId })
  }

  async sendInvoice(invoiceId: string, recipientEmail?: string): Promise<void> {
    return this.callTool<void>('send_invoice_to_customer', { invoiceId, recipientEmail })
  }

  // Payment Management
  async createPayment(data: CreatePaymentRequest): Promise<Payment> {
    return this.callTool<Payment>('process_payment_workflow', data)
  }

  async updatePayment(paymentId: string, data: Partial<CreatePaymentRequest>): Promise<Payment> {
    return this.callTool<Payment>('update_payment', { paymentId, ...data })
  }

  async findPayments(filters: PaymentFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Payment>> {
    return this.callTool<PaginatedResponse<Payment>>('find_payments', filters)
  }

  async getPayment(paymentId: string): Promise<Payment> {
    return this.callTool<Payment>('get_payment_details', { paymentId })
  }

  async trackPaymentStatus(paymentId: string): Promise<Payment> {
    return this.callTool<Payment>('track_payment_status', { paymentId })
  }

  // Project Management
  async authorizeProject(data: { customerId: string; quoteId?: string; title: string; description?: string }): Promise<Project> {
    return this.callTool<Project>('authorize_project_work', data)
  }

  async trackProjectProgress(projectId: string): Promise<Project> {
    return this.callTool<Project>('track_project_progress', { projectId })
  }

  async updateProjectHours(projectId: string, actualHours: number): Promise<Project> {
    return this.callTool<Project>('update_project_hours', { projectId, actualHours })
  }

  // Analytics & Reporting
  async getRevenueAnalytics(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<RevenueAnalytics[]> {
    return this.callTool<RevenueAnalytics[]>('generate_financial_reports', {
      reportType: 'revenue',
      period
    })
  }

  async getCustomerAnalytics(): Promise<CustomerAnalytics> {
    return this.callTool<CustomerAnalytics>('analyze_customer_patterns')
  }

  async getPaymentAnalytics(): Promise<PaymentAnalytics> {
    return this.callTool<PaymentAnalytics>('analyze_payment_patterns')
  }

  async forecastRevenue(months: number = 6): Promise<RevenueAnalytics[]> {
    return this.callTool<RevenueAnalytics[]>('forecast_revenue', { months })
  }

  async detectBillingAnomalies(): Promise<any[]> {
    return this.callTool<any[]>('detect_billing_anomalies')
  }

  // Intelligent Estimation
  async calculateProjectEstimate(requirements: string, projectType?: string): Promise<{
    estimatedHours: number
    estimatedCost: number
    breakdown: Array<{ task: string; hours: number; cost: number }>
  }> {
    return this.callTool('calculate_project_estimate', { requirements, projectType })
  }

  // Workflow Orchestration
  async createCompleteWorkflow(data: {
    customer: CreateCustomerRequest
    quote: Omit<CreateQuoteRequest, 'customerId'>
    autoSend?: boolean
  }): Promise<{
    customer: Customer
    quote: Quote
  }> {
    // First create customer
    const customer = await this.createCustomer(data.customer)

    // Then create quote
    const quote = await this.createQuote({
      ...data.quote,
      customerId: customer.id,
    })

    // Optionally send quote
    if (data.autoSend && customer.email) {
      await this.sendQuote(quote.id, customer.email)
    }

    return { customer, quote }
  }

  // Utility methods
  private calculateDaysUntil(dateString: string): number {
    const targetDate = new Date(dateString)
    const today = new Date()
    const diffTime = targetDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Search and Discovery
  async smartSearch(query: string, types: ('customers' | 'quotes' | 'invoices' | 'payments')[] = ['customers', 'quotes', 'invoices']): Promise<{
    customers: Customer[]
    quotes: Quote[]
    invoices: Invoice[]
    payments: Payment[]
  }> {
    const results = await Promise.allSettled([
      types.includes('customers') ? this.findCustomers({ search: query, limit: 5 }) : Promise.resolve({ data: [] }),
      types.includes('quotes') ? this.findQuotes({ search: query, limit: 5 }) : Promise.resolve({ data: [] }),
      types.includes('invoices') ? this.findInvoices({ search: query, limit: 5 }) : Promise.resolve({ data: [] }),
      types.includes('payments') ? this.findPayments({ search: query, limit: 5 }) : Promise.resolve({ data: [] }),
    ])

    return {
      customers: results[0].status === 'fulfilled' ? results[0].value.data : [],
      quotes: results[1].status === 'fulfilled' ? results[1].value.data : [],
      invoices: results[2].status === 'fulfilled' ? results[2].value.data : [],
      payments: results[3].status === 'fulfilled' ? results[3].value.data : [],
    }
  }

  // Organization Settings Management
  async getOrganizationSettings(): Promise<OrganizationSettings> {
    return this.callTool('get-organization-settings')
  }

  async updateOrganizationSettings(settings: Partial<OrganizationSettings>): Promise<OrganizationSettings> {
    return this.callTool('update-organization-settings', { settings })
  }

  // Invoice Template Management
  async getInvoiceTemplates(): Promise<InvoiceTemplate[]> {
    return this.callTool('get-invoice-templates')
  }

  async getInvoiceTemplate(templateId: string): Promise<InvoiceTemplate> {
    return this.callTool('get-invoice-template', { templateId })
  }

  async createInvoiceTemplate(template: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<InvoiceTemplate> {
    return this.callTool('create-invoice-template', { template })
  }

  async updateInvoiceTemplate(templateId: string, updates: Partial<InvoiceTemplate>): Promise<InvoiceTemplate> {
    return this.callTool('update-invoice-template', { templateId, updates })
  }

  async deleteInvoiceTemplate(templateId: string): Promise<void> {
    return this.callTool('delete-invoice-template', { templateId })
  }

  async duplicateInvoiceTemplate(templateId: string, name: string): Promise<InvoiceTemplate> {
    return this.callTool('duplicate-invoice-template', { templateId, name })
  }

  // Invoice PDF and Email Management
  async generateInvoicePdf(invoiceId: string, templateId?: string): Promise<{
    pdfUrl: string
    filename: string
  }> {
    return this.callTool('generate-invoice-pdf', { invoiceId, templateId })
  }

  async sendInvoiceEmail(invoiceId: string, options: {
    recipientEmail?: string
    subject?: string
    message?: string
    attachPdf?: boolean
    templateId?: string
  }): Promise<{
    sentTo: string
    messageId: string
  }> {
    return this.callTool('send-invoice-email', { invoiceId, options })
  }

  async previewInvoiceEmail(invoiceId: string, templateId?: string): Promise<{
    subject: string
    htmlContent: string
    textContent: string
  }> {
    return this.callTool('preview-invoice-email', { invoiceId, templateId })
  }

  // Template Preset Management
  async getTemplatePresets(): Promise<Array<{
    id: string
    name: string
    description: string
    preview: string
    template: Partial<InvoiceTemplate>
  }>> {
    return this.callTool('get-template-presets')
  }

  async createTemplateFromPreset(presetId: string, name: string, customizations?: Partial<InvoiceTemplate>): Promise<InvoiceTemplate> {
    return this.callTool('create-template-from-preset', { presetId, name, customizations })
  }
}

export const mcpService = new MCPService()