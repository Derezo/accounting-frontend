import { apiClient } from '@/lib/axios'
import {
  Customer,
  Quote,
  Invoice,
  Payment,
  Project,
  OrganizationSettings,
  Appointment,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  AppointmentFilters,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectFilters,
  ETransfer,
  CreateETransferRequest,
  ETransferFilters,
  PaymentPlan,
  CreatePaymentPlanRequest,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
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
import {
  Account,
  CreateAccountRequest,
  UpdateAccountRequest,
  AccountFilters,
  JournalEntry,
  CreateJournalEntryRequest,
  UpdateJournalEntryRequest,
  JournalEntryFilters,
  GeneralLedgerEntry,
  GeneralLedgerFilters,
  TrialBalance,
  BankTransaction,
  BankReconciliation,
  CreateBankReconciliationRequest,
  BalanceSheet,
  IncomeStatement,
  CashFlowStatement,
  FinancialReportRequest,
  AccountHierarchy
} from '@/types/accounting'
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
import {
  Employee,
  Contractor,
  Contract,
  TimeEntry,
  LeaveRequest,
  PerformanceReview,
  PayrollPeriod,
  PayrollEntry,
  WorkSchedule,
  EmployeeFilters,
  ContractorFilters,
  TimeEntryFilters,
  LeaveRequestFilters,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  CreateContractorRequest,
  CreateContractRequest,
  CreateTimeEntryRequest,
  CreateLeaveRequestRequest,
  CreatePerformanceReviewRequest
} from '@/types/employees'
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
import {
  FinancialDashboard,
  FinancialAnalysis,
  FinancialRatios,
  Budget,
  Forecast,
  CustomReport,
  ScheduledReport,
  AnalysisResults,
  ForecastResults,
  ReportResults,
  BudgetVariance,
  RatioComparison,
  HistoricalRatio,
  ScenarioResults,
  MetricDefinition,
  DataSource,
  CreateDashboardRequest,
  UpdateDashboardRequest,
  CreateAnalysisRequest,
  UpdateAnalysisRequest,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  CreateForecastRequest,
  UpdateForecastRequest,
  CreateReportRequest,
  UpdateReportRequest,
  AnalysisFilters,
  BudgetFilters,
  ForecastFilters,
  ReportFilters,
  ReportParameters,
  ReportSchedule,
  ReportQuery,
  DateRange,
  RatioType,
  ScenarioInput
} from '@/types/financial-analysis'
import {
  PaymentGateway,
  PaymentMethod,
  PaymentProcessingSettings,
  RecurringPayment,
  PaymentPlan,
  RefundRequest,
  ChargebackNotice,
  PaymentAnalytics,
  PaymentAttempt,
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

  async acceptQuote(quoteId: string, acceptanceNote?: string): Promise<Quote> {
    const response = await apiClient.post<Quote>(`/quotes/${quoteId}/accept`, { acceptanceNote })
    return response.data
  }

  async rejectQuote(quoteId: string, rejectionReason?: string): Promise<Quote> {
    const response = await apiClient.post<Quote>(`/quotes/${quoteId}/reject`, { rejectionReason })
    return response.data
  }

  async convertQuoteToInvoice(quoteId: string, data: {
    issueDate?: string
    dueDate?: string
    depositRequired?: number
  }): Promise<Invoice> {
    const response = await apiClient.post<Invoice>(`/quotes/${quoteId}/convert-to-invoice`, data)
    return response.data
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

  async markInvoiceAsPaid(invoiceId: string, data: {
    paymentMethod: string
    paymentDate: string
    referenceNumber?: string
    amount?: number
  }): Promise<Invoice> {
    const response = await apiClient.post<Invoice>(`/invoices/${invoiceId}/mark-paid`, data)
    return response.data
  }

  async cancelInvoice(invoiceId: string, reason?: string): Promise<Invoice> {
    const response = await apiClient.post<Invoice>(`/invoices/${invoiceId}/cancel`, { reason })
    return response.data
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

  async refundPayment(paymentId: string, data: {
    amount: number
    reason: string
    refundMethod?: 'ORIGINAL_METHOD' | 'MANUAL'
  }): Promise<Payment> {
    const response = await apiClient.post<Payment>(`/payments/${paymentId}/refund`, data)
    return response.data
  }

  async voidPayment(paymentId: string, reason: string): Promise<Payment> {
    const response = await apiClient.post<Payment>(`/payments/${paymentId}/void`, { reason })
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
    const searchPromises: Promise<PaginatedResponse<any>>[] = []
    const searchTypes: string[] = []

    if (types.includes('customers')) {
      searchPromises.push(this.findCustomers({ search: query, limit: 5 }))
      searchTypes.push('customers')
    }
    if (types.includes('quotes')) {
      searchPromises.push(this.findQuotes({ search: query, limit: 5 }))
      searchTypes.push('quotes')
    }
    if (types.includes('invoices')) {
      searchPromises.push(this.findInvoices({ search: query, limit: 5 }))
      searchTypes.push('invoices')
    }
    if (types.includes('payments')) {
      searchPromises.push(this.findPayments({ search: query, limit: 5 }))
      searchTypes.push('payments')
    }

    const results = await Promise.allSettled(searchPromises)

    let customers: Customer[] = []
    let quotes: Quote[] = []
    let invoices: Invoice[] = []
    let payments: Payment[] = []

    let resultIndex = 0
    if (types.includes('customers')) {
      const result = results[resultIndex]
      customers = result?.status === 'fulfilled' ? result.value.data : []
      resultIndex++
    }
    if (types.includes('quotes')) {
      const result = results[resultIndex]
      quotes = result?.status === 'fulfilled' ? result.value.data : []
      resultIndex++
    }
    if (types.includes('invoices')) {
      const result = results[resultIndex]
      invoices = result?.status === 'fulfilled' ? result.value.data : []
      resultIndex++
    }
    if (types.includes('payments')) {
      const result = results[resultIndex]
      payments = result?.status === 'fulfilled' ? result.value.data : []
      resultIndex++
    }

    return { customers, quotes, invoices, payments }
  }

  // Analytics & Reporting (placeholder - implement based on actual API)
  async getRevenueAnalytics(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<RevenueAnalytics[]> {
    const response = await apiClient.get<RevenueAnalytics[]>('/analytics/revenue', { params: { period } })
    return response.data
  }

  async getCustomerAnalytics(): Promise<CustomerAnalytics> {
    const response = await apiClient.get<CustomerAnalytics>('/analytics/customers')
    return response.data
  }


  async forecastRevenue(months: number = 6): Promise<RevenueAnalytics[]> {
    const response = await apiClient.get<RevenueAnalytics[]>('/analytics/forecast', { params: { months } })
    return response.data
  }

  // Intelligent Estimation (placeholder)
  async calculateProjectEstimate(requirements: string, projectType?: string): Promise<{
    estimatedHours: number
    estimatedCost: number
    breakdown: Array<{ task: string; hours: number; cost: number }>
  }> {
    const response = await apiClient.post('/estimates/calculate', { requirements, projectType })
    return response.data
  }


  // Invoice Template Management (placeholder)
  async getInvoiceTemplates(): Promise<any[]> {
    const response = await apiClient.get('/invoice-templates')
    return response.data
  }

  async getInvoiceTemplate(templateId: string): Promise<any> {
    const response = await apiClient.get(`/invoice-templates/${templateId}`)
    return response.data
  }

  async createInvoiceTemplate(template: any): Promise<any> {
    const response = await apiClient.post('/invoice-templates', template)
    return response.data
  }

  async updateInvoiceTemplate(templateId: string, updates: any): Promise<any> {
    const response = await apiClient.put(`/invoice-templates/${templateId}`, updates)
    return response.data
  }

  async deleteInvoiceTemplate(templateId: string): Promise<void> {
    await apiClient.delete(`/invoice-templates/${templateId}`)
  }

  // Invoice Email Management (placeholder)
  async sendInvoiceEmail(invoiceId: string, options: {
    recipientEmail?: string
    subject?: string
    message?: string
    attachPdf?: boolean
  }): Promise<any> {
    const response = await apiClient.post(`/invoices/${invoiceId}/send-email`, options)
    return response.data
  }

  // ========================================
  // APPOINTMENT MANAGEMENT
  // ========================================

  async createAppointment(data: CreateAppointmentRequest): Promise<Appointment> {
    const response = await apiClient.post<Appointment>('/appointments', data)
    return response.data
  }

  async findAppointments(filters: AppointmentFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Appointment>> {
    const response = await apiClient.get<PaginatedResponse<Appointment>>('/appointments', { params: filters })
    return response.data
  }

  async getAppointment(appointmentId: string): Promise<Appointment> {
    const response = await apiClient.get<Appointment>(`/appointments/${appointmentId}`)
    return response.data
  }

  async updateAppointment(appointmentId: string, data: UpdateAppointmentRequest): Promise<Appointment> {
    const response = await apiClient.put<Appointment>(`/appointments/${appointmentId}`, data)
    return response.data
  }

  async deleteAppointment(appointmentId: string): Promise<void> {
    await apiClient.delete(`/appointments/${appointmentId}`)
  }

  async confirmAppointment(appointmentId: string): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(`/appointments/${appointmentId}/confirm`)
    return response.data
  }

  async cancelAppointment(appointmentId: string, reason?: string): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(`/appointments/${appointmentId}/cancel`, { reason })
    return response.data
  }

  async rescheduleAppointment(appointmentId: string, data: { startTime: string; endTime: string; reason?: string }): Promise<Appointment> {
    const response = await apiClient.post<Appointment>(`/appointments/${appointmentId}/reschedule`, data)
    return response.data
  }

  async sendAppointmentReminder(appointmentId: string): Promise<void> {
    await apiClient.post(`/appointments/${appointmentId}/send-reminder`)
  }

  // ========================================
  // PROJECT MANAGEMENT
  // ========================================

  async createProject(data: CreateProjectRequest): Promise<Project> {
    const response = await apiClient.post<Project>('/projects', data)
    return response.data
  }

  async findProjects(filters: ProjectFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Project>> {
    const response = await apiClient.get<PaginatedResponse<Project>>('/projects', { params: filters })
    return response.data
  }

  async getProject(projectId: string): Promise<Project> {
    const response = await apiClient.get<Project>(`/projects/${projectId}`)
    return response.data
  }

  async updateProject(projectId: string, data: UpdateProjectRequest): Promise<Project> {
    const response = await apiClient.put<Project>(`/projects/${projectId}`, data)
    return response.data
  }

  async deleteProject(projectId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}`)
  }

  async addProjectMilestone(projectId: string, milestone: { name: string; description?: string; dueDate: string }): Promise<Project> {
    const response = await apiClient.post<Project>(`/projects/${projectId}/milestones`, milestone)
    return response.data
  }

  async updateProjectMilestone(projectId: string, milestoneId: string, updates: { name?: string; description?: string; dueDate?: string; completed?: boolean }): Promise<Project> {
    const response = await apiClient.put<Project>(`/projects/${projectId}/milestones/${milestoneId}`, updates)
    return response.data
  }

  async logProjectTime(projectId: string, data: { hours: number; description?: string; date: string }): Promise<Project> {
    const response = await apiClient.post<Project>(`/projects/${projectId}/time-log`, data)
    return response.data
  }

  // ========================================
  // E-TRANSFER MANAGEMENT
  // ========================================

  async createETransfer(data: CreateETransferRequest): Promise<ETransfer> {
    const response = await apiClient.post<ETransfer>('/etransfer', data)
    return response.data
  }

  async findETransfers(filters: ETransferFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<ETransfer>> {
    const response = await apiClient.get<PaginatedResponse<ETransfer>>('/etransfer', { params: filters })
    return response.data
  }

  async getETransfer(etransferId: string): Promise<ETransfer> {
    const response = await apiClient.get<ETransfer>(`/etransfer/${etransferId}`)
    return response.data
  }

  async cancelETransfer(etransferId: string): Promise<ETransfer> {
    const response = await apiClient.post<ETransfer>(`/etransfer/${etransferId}/cancel`)
    return response.data
  }

  async confirmETransferReceived(etransferId: string): Promise<ETransfer> {
    const response = await apiClient.post<ETransfer>(`/etransfer/${etransferId}/confirm-received`)
    return response.data
  }

  async resendETransferNotification(etransferId: string): Promise<void> {
    await apiClient.post(`/etransfer/${etransferId}/resend-notification`)
  }

  // ========================================
  // MANUAL PAYMENT MANAGEMENT
  // ========================================

  async recordManualPayment(data: {
    customerId: string
    invoiceId?: string
    amount: number
    method: 'CASH' | 'CHECK' | 'BANK_TRANSFER'
    paymentDate: string
    reference?: string
    notes?: string
    receiptFile?: File
  }): Promise<Payment> {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value)
        } else {
          formData.append(key, String(value))
        }
      }
    })

    const response = await apiClient.post<Payment>('/manual-payment', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  }

  async reconcilePayment(paymentId: string, data: { bankReference?: string; reconciled: boolean; notes?: string }): Promise<Payment> {
    const response = await apiClient.post<Payment>(`/manual-payment/${paymentId}/reconcile`, data)
    return response.data
  }


  // ========================================
  // USER MANAGEMENT
  // ========================================

  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<User>('/users', data)
    return response.data
  }

  async findUsers(filters: UserFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponse<User>>('/users', { params: filters })
    return response.data
  }

  async getUser(userId: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${userId}`)
    return response.data
  }

  async updateUser(userId: string, data: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put<User>(`/users/${userId}`, data)
    return response.data
  }

  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/users/${userId}`)
  }

  async inviteUser(email: string, role: User['role']): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/users/invite', { email, role })
    return response.data
  }

  async resendUserInvite(userId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`/users/${userId}/resend-invite`)
    return response.data
  }

  // ========================================
  // ENHANCED ANALYTICS
  // ========================================


  async getProjectAnalytics(): Promise<{
    totalProjects: number
    activeProjects: number
    completedProjects: number
    averageProjectDuration: number
    projectsByStatus: Record<string, number>
    profitabilityTrends: Array<{ period: string; profit: number; margin: number }>
  }> {
    const response = await apiClient.get('/analytics/projects')
    return response.data
  }

  async getPaymentMethodAnalytics(): Promise<{
    preferredMethods: Record<string, number>
    processingTimes: Record<string, number>
    failureRates: Record<string, number>
    transactionVolumes: Record<string, { count: number; amount: number }>
  }> {
    const response = await apiClient.get('/analytics/payment-methods')
    return response.data
  }

  // ========================================
  // AUDIT AND COMPLIANCE
  // ========================================

  async getAuditLogs(filters: {
    startDate?: string
    endDate?: string
    category?: string
    severity?: string
    success?: boolean
    search?: string
    userId?: string
    action?: string
    resource?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  } = {}): Promise<Array<{
    id: string
    timestamp: string
    userId: string
    userName: string
    userRole: string
    action: string
    category: 'AUTH' | 'DATA' | 'SYSTEM' | 'SECURITY' | 'FINANCIAL'
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    resource: string
    description: string
    ipAddress: string
    userAgent: string
    success: boolean
    details: Record<string, any>
    riskScore: number
  }>> {
    const response = await apiClient.get('/audit/logs', { params: filters })
    return response.data
  }

  async getSecuritySummary(filters: {
    startDate: string
    endDate: string
  }): Promise<{
    totalEvents: number
    criticalEvents: number
    failedLogins: number
    dataAccess: number
    recentActivity: Array<{
      time: string
      events: number
      severity: string
    }>
  }> {
    const response = await apiClient.get('/audit/security-summary', { params: filters })
    return response.data
  }

  async exportAuditLogs(filters: {
    userId?: string
    action?: string
    resource?: string
    dateFrom?: string
    dateTo?: string
    format?: 'csv' | 'json' | 'pdf'
  }): Promise<Blob> {
    const response = await apiClient.get('/audit/export', {
      params: filters,
      responseType: 'blob'
    })
    return response.data
  }

  // ========================================
  // REPORTS
  // ========================================

  async generateReport(templateId: string, parameters: Record<string, any>): Promise<{
    reportId: string
    status: 'generating' | 'completed' | 'failed'
    downloadUrl?: string
  }> {
    const response = await apiClient.post('/reports/generate', { templateId, parameters })
    return response.data
  }

  async getReportTemplates(): Promise<Array<{
    id: string
    name: string
    description: string
    category: 'financial' | 'operational' | 'compliance'
    parameters: Array<{
      name: string
      type: 'string' | 'number' | 'date' | 'boolean'
      required: boolean
      options?: string[]
    }>
  }>> {
    const response = await apiClient.get('/reports/templates')
    return response.data
  }

  async getReportStatus(reportId: string): Promise<{
    reportId: string
    status: 'generating' | 'completed' | 'failed'
    progress?: number
    downloadUrl?: string
    error?: string
  }> {
    const response = await apiClient.get(`/reports/${reportId}/status`)
    return response.data
  }

  async downloadReport(reportId: string): Promise<Blob> {
    const response = await apiClient.get(`/reports/${reportId}/download`, {
      responseType: 'blob'
    })
    return response.data
  }

  // ========================================
  // ORGANIZATION SETTINGS
  // ========================================

  async getOrganizationSettings(): Promise<OrganizationSettings> {
    const response = await apiClient.get<OrganizationSettings>('/organizations/current')
    return response.data
  }

  async updateOrganizationSettings(data: Partial<OrganizationSettings>): Promise<OrganizationSettings> {
    const response = await apiClient.put<OrganizationSettings>('/organizations/current', data)
    return response.data
  }

  // ========================================
  // FILE UPLOADS
  // ========================================

  async uploadFile(file: File, category: 'invoice' | 'payment' | 'receipt' | 'document'): Promise<{
    fileId: string
    url: string
    fileName: string
    size: number
    mimeType: string
  }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', category)

    const response = await apiClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  async deleteFile(fileId: string): Promise<void> {
    await apiClient.delete(`/files/${fileId}`)
  }

  // ========================================
  // CHART OF ACCOUNTS MANAGEMENT
  // ========================================

  async createAccount(data: CreateAccountRequest): Promise<Account> {
    const response = await apiClient.post<Account>('/accounting/accounts', data)
    return response.data
  }

  async findAccounts(filters: AccountFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Account>> {
    const response = await apiClient.get<PaginatedResponse<Account>>('/accounting/accounts', { params: filters })
    return response.data
  }

  async getAccount(accountId: string): Promise<Account> {
    const response = await apiClient.get<Account>(`/accounting/accounts/${accountId}`)
    return response.data
  }

  async updateAccount(accountId: string, data: UpdateAccountRequest): Promise<Account> {
    const response = await apiClient.put<Account>(`/accounting/accounts/${accountId}`, data)
    return response.data
  }

  async deleteAccount(accountId: string): Promise<void> {
    await apiClient.delete(`/accounting/accounts/${accountId}`)
  }

  async getAccountHierarchy(): Promise<AccountHierarchy[]> {
    const response = await apiClient.get<AccountHierarchy[]>('/accounting/accounts/hierarchy')
    return response.data
  }

  async getAccountBalance(accountId: string, asOfDate?: string): Promise<{ balance: number; debitBalance: number; creditBalance: number }> {
    const response = await apiClient.get(`/accounting/accounts/${accountId}/balance`, {
      params: asOfDate ? { asOfDate } : {}
    })
    return response.data
  }

  // ========================================
  // JOURNAL ENTRIES MANAGEMENT
  // ========================================

  async createJournalEntry(data: CreateJournalEntryRequest): Promise<JournalEntry> {
    const response = await apiClient.post<JournalEntry>('/accounting/journal-entries', data)
    return response.data
  }

  async findJournalEntries(filters: JournalEntryFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<JournalEntry>> {
    const response = await apiClient.get<PaginatedResponse<JournalEntry>>('/accounting/journal-entries', { params: filters })
    return response.data
  }

  async getJournalEntry(entryId: string): Promise<JournalEntry> {
    const response = await apiClient.get<JournalEntry>(`/accounting/journal-entries/${entryId}`)
    return response.data
  }

  async updateJournalEntry(entryId: string, data: UpdateJournalEntryRequest): Promise<JournalEntry> {
    const response = await apiClient.put<JournalEntry>(`/accounting/journal-entries/${entryId}`, data)
    return response.data
  }

  async postJournalEntry(entryId: string): Promise<JournalEntry> {
    const response = await apiClient.post<JournalEntry>(`/accounting/journal-entries/${entryId}/post`)
    return response.data
  }

  async reverseJournalEntry(entryId: string, reversalDate: string, description?: string): Promise<JournalEntry> {
    const response = await apiClient.post<JournalEntry>(`/accounting/journal-entries/${entryId}/reverse`, {
      reversalDate,
      description
    })
    return response.data
  }

  async validateJournalEntry(data: CreateJournalEntryRequest): Promise<{
    isValid: boolean
    isBalanced: boolean
    errors: string[]
    warnings: string[]
    totalDebits: number
    totalCredits: number
  }> {
    const response = await apiClient.post('/accounting/journal-entries/validate', data)
    return response.data
  }

  // ========================================
  // GENERAL LEDGER
  // ========================================

  async getGeneralLedger(filters: GeneralLedgerFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<GeneralLedgerEntry>> {
    const response = await apiClient.get<PaginatedResponse<GeneralLedgerEntry>>('/accounting/general-ledger', { params: filters })
    return response.data
  }

  async getAccountLedger(accountId: string, filters: { dateFrom?: string; dateTo?: string; page?: number; limit?: number } = {}): Promise<PaginatedResponse<GeneralLedgerEntry>> {
    const response = await apiClient.get<PaginatedResponse<GeneralLedgerEntry>>(`/accounting/accounts/${accountId}/ledger`, { params: filters })
    return response.data
  }

  // ========================================
  // TRIAL BALANCE
  // ========================================

  async getTrialBalance(asOfDate: string): Promise<TrialBalance> {
    const response = await apiClient.get<TrialBalance>('/accounting/trial-balance', {
      params: { asOfDate }
    })
    return response.data
  }

  // ========================================
  // BANK RECONCILIATION
  // ========================================

  async createBankReconciliation(data: CreateBankReconciliationRequest): Promise<BankReconciliation> {
    const response = await apiClient.post<BankReconciliation>('/accounting/bank-reconciliation', data)
    return response.data
  }

  async getBankReconciliations(accountId?: string): Promise<PaginatedResponse<BankReconciliation>> {
    const response = await apiClient.get<PaginatedResponse<BankReconciliation>>('/accounting/bank-reconciliation', {
      params: accountId ? { accountId } : {}
    })
    return response.data
  }

  async getBankReconciliation(reconciliationId: string): Promise<BankReconciliation> {
    const response = await apiClient.get<BankReconciliation>(`/accounting/bank-reconciliation/${reconciliationId}`)
    return response.data
  }

  async matchBankTransaction(reconciliationId: string, bankTransactionId: string, journalEntryId: string): Promise<BankReconciliation> {
    const response = await apiClient.post<BankReconciliation>(`/accounting/bank-reconciliation/${reconciliationId}/match`, {
      bankTransactionId,
      journalEntryId
    })
    return response.data
  }

  async unmatchBankTransaction(reconciliationId: string, bankTransactionId: string): Promise<BankReconciliation> {
    const response = await apiClient.post<BankReconciliation>(`/accounting/bank-reconciliation/${reconciliationId}/unmatch`, {
      bankTransactionId
    })
    return response.data
  }

  async completeBankReconciliation(reconciliationId: string): Promise<BankReconciliation> {
    const response = await apiClient.post<BankReconciliation>(`/accounting/bank-reconciliation/${reconciliationId}/complete`)
    return response.data
  }

  // ========================================
  // FINANCIAL STATEMENTS
  // ========================================

  async generateBalanceSheet(asOfDate: string): Promise<BalanceSheet> {
    const response = await apiClient.get<BalanceSheet>('/accounting/reports/balance-sheet', {
      params: { asOfDate }
    })
    return response.data
  }

  async generateIncomeStatement(periodStart: string, periodEnd: string): Promise<IncomeStatement> {
    const response = await apiClient.get<IncomeStatement>('/accounting/reports/income-statement', {
      params: { periodStart, periodEnd }
    })
    return response.data
  }

  async generateCashFlowStatement(periodStart: string, periodEnd: string): Promise<CashFlowStatement> {
    const response = await apiClient.get<CashFlowStatement>('/accounting/reports/cash-flow', {
      params: { periodStart, periodEnd }
    })
    return response.data
  }

  async generateFinancialReport(request: FinancialReportRequest): Promise<Blob | any> {
    const response = await apiClient.post('/accounting/reports/generate', request, {
      responseType: request.format && ['PDF', 'EXCEL', 'CSV'].includes(request.format) ? 'blob' : 'json'
    })
    return response.data
  }

  // ========================================
  // ACCOUNTING UTILITIES
  // ========================================

  async getAccountingPeriods(): Promise<Array<{ id: string; name: string; startDate: string; endDate: string; isClosed: boolean }>> {
    const response = await apiClient.get('/accounting/periods')
    return response.data
  }

  async closeAccountingPeriod(periodId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`/accounting/periods/${periodId}/close`)
    return response.data
  }

  async getAccountingSettings(): Promise<{
    fiscalYearStart: string
    baseCurrency: string
    retainedEarningsAccountId: string
    defaultTaxAccountId: string
    allowNegativeInventory: boolean
    requireApprovalForJournalEntries: boolean
  }> {
    const response = await apiClient.get('/accounting/settings')
    return response.data
  }

  async updateAccountingSettings(settings: {
    fiscalYearStart?: string
    baseCurrency?: string
    retainedEarningsAccountId?: string
    defaultTaxAccountId?: string
    allowNegativeInventory?: boolean
    requireApprovalForJournalEntries?: boolean
  }): Promise<{
    fiscalYearStart: string
    baseCurrency: string
    retainedEarningsAccountId: string
    defaultTaxAccountId: string
    allowNegativeInventory: boolean
    requireApprovalForJournalEntries: boolean
  }> {
    const response = await apiClient.put('/accounting/settings', settings)
    return response.data
  }

  // Expense Management
  async createExpense(data: CreateExpenseRequest): Promise<Expense> {
    const response = await apiClient.post<Expense>('/expenses', data)
    return response.data
  }

  async findExpenses(filters: ExpenseFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Expense>> {
    const response = await apiClient.get<PaginatedResponse<Expense>>('/expenses', { params: filters })
    return response.data
  }

  async getExpense(expenseId: string): Promise<Expense> {
    const response = await apiClient.get<Expense>(`/expenses/${expenseId}`)
    return response.data
  }

  async updateExpense(expenseId: string, data: UpdateExpenseRequest): Promise<Expense> {
    const response = await apiClient.put<Expense>(`/expenses/${expenseId}`, data)
    return response.data
  }

  async deleteExpense(expenseId: string): Promise<void> {
    await apiClient.delete(`/expenses/${expenseId}`)
  }

  async submitExpense(expenseId: string): Promise<Expense> {
    const response = await apiClient.post<Expense>(`/expenses/${expenseId}/submit`)
    return response.data
  }

  async getMyExpenses(filters: ExpenseFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Expense>> {
    const response = await apiClient.get<PaginatedResponse<Expense>>('/expenses/my-expenses', { params: filters })
    return response.data
  }

  async getPendingExpenseApprovals(): Promise<Expense[]> {
    const response = await apiClient.get<Expense[]>('/expenses/pending-approvals')
    return response.data
  }

  // Expense Approval Workflow
  async approveExpense(expenseId: string, data: CreateApprovalRequest): Promise<Expense> {
    const response = await apiClient.post<Expense>(`/expenses/${expenseId}/approve`, data)
    return response.data
  }

  async rejectExpense(expenseId: string, data: CreateApprovalRequest): Promise<Expense> {
    const response = await apiClient.post<Expense>(`/expenses/${expenseId}/reject`, data)
    return response.data
  }

  async bulkApproveExpenses(expenseIds: string[], data: CreateApprovalRequest): Promise<void> {
    await apiClient.post('/expenses/bulk-approve', { expenseIds, ...data })
  }

  async bulkRejectExpenses(expenseIds: string[], data: CreateApprovalRequest): Promise<void> {
    await apiClient.post('/expenses/bulk-reject', { expenseIds, ...data })
  }

  // Expense Categories
  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    const response = await apiClient.get<ExpenseCategory[]>('/expense-categories')
    return response.data
  }

  async getExpenseCategory(categoryId: string): Promise<ExpenseCategory> {
    const response = await apiClient.get<ExpenseCategory>(`/expense-categories/${categoryId}`)
    return response.data
  }

  async createExpenseCategory(data: CreateExpenseCategoryRequest): Promise<ExpenseCategory> {
    const response = await apiClient.post<ExpenseCategory>('/expense-categories', data)
    return response.data
  }

  async updateExpenseCategory(categoryId: string, data: Partial<CreateExpenseCategoryRequest>): Promise<ExpenseCategory> {
    const response = await apiClient.put<ExpenseCategory>(`/expense-categories/${categoryId}`, data)
    return response.data
  }

  async deleteExpenseCategory(categoryId: string): Promise<void> {
    await apiClient.delete(`/expense-categories/${categoryId}`)
  }

  // Expense Reports
  async getExpenseReports(filters: ExpenseReportFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<ExpenseReport>> {
    const response = await apiClient.get<PaginatedResponse<ExpenseReport>>('/expense-reports', { params: filters })
    return response.data
  }

  async getExpenseReport(reportId: string): Promise<ExpenseReport> {
    const response = await apiClient.get<ExpenseReport>(`/expense-reports/${reportId}`)
    return response.data
  }

  async createExpenseReport(data: { title: string; description?: string; expenseIds: string[] }): Promise<ExpenseReport> {
    const response = await apiClient.post<ExpenseReport>('/expense-reports', data)
    return response.data
  }

  // Expense Policies
  async getExpensePolicies(): Promise<ExpensePolicy[]> {
    const response = await apiClient.get<ExpensePolicy[]>('/expense-policies')
    return response.data
  }

  async getExpensePolicy(policyId: string): Promise<ExpensePolicy> {
    const response = await apiClient.get<ExpensePolicy>(`/expense-policies/${policyId}`)
    return response.data
  }

  // Expense Analytics
  async getExpenseAnalytics(filters: ExpenseFilters = {}): Promise<ExpenseAnalytics> {
    const response = await apiClient.get<ExpenseAnalytics>('/expenses/analytics', { params: filters })
    return response.data
  }

  // Expense Attachments
  async uploadExpenseAttachment(expenseId: string, file: File): Promise<ExpenseAttachment> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post<ExpenseAttachment>(`/expenses/${expenseId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async deleteExpenseAttachment(expenseId: string, attachmentId: string): Promise<void> {
    await apiClient.delete(`/expenses/${expenseId}/attachments/${attachmentId}`)
  }

  // Expense Export
  async exportExpenses(data: { format: 'CSV' | 'EXCEL' | 'PDF'; filters?: ExpenseFilters }): Promise<Blob> {
    const response = await apiClient.post('/expenses/export', data, { responseType: 'blob' })
    return response.data
  }

  // Expense Reimbursement
  async processExpenseReimbursement(expenseId: string, amount: number, reference?: string): Promise<Expense> {
    const response = await apiClient.post<Expense>(`/expenses/${expenseId}/reimbursement`, { amount, reference })
    return response.data
  }

  // Tax Management

  // Tax Jurisdictions
  async getTaxJurisdictions(): Promise<TaxJurisdiction[]> {
    const response = await apiClient.get<TaxJurisdiction[]>('/tax/jurisdictions')
    return response.data
  }

  async getTaxJurisdiction(id: string): Promise<TaxJurisdiction> {
    const response = await apiClient.get<TaxJurisdiction>(`/tax/jurisdictions/${id}`)
    return response.data
  }

  async createTaxJurisdiction(data: CreateTaxJurisdictionRequest): Promise<TaxJurisdiction> {
    const response = await apiClient.post<TaxJurisdiction>('/tax/jurisdictions', data)
    return response.data
  }

  async updateTaxJurisdiction(id: string, data: Partial<CreateTaxJurisdictionRequest>): Promise<TaxJurisdiction> {
    const response = await apiClient.put<TaxJurisdiction>(`/tax/jurisdictions/${id}`, data)
    return response.data
  }

  async deleteTaxJurisdiction(id: string): Promise<void> {
    await apiClient.delete(`/tax/jurisdictions/${id}`)
  }

  // Tax Rates
  async getTaxRates(filters: any = {}): Promise<TaxRate[]> {
    const response = await apiClient.get<TaxRate[]>('/tax/rates', { params: filters })
    return response.data
  }

  async getTaxRate(id: string): Promise<TaxRate> {
    const response = await apiClient.get<TaxRate>(`/tax/rates/${id}`)
    return response.data
  }

  async createTaxRate(data: CreateTaxRateRequest): Promise<TaxRate> {
    const response = await apiClient.post<TaxRate>('/tax/rates', data)
    return response.data
  }

  async updateTaxRate(id: string, data: Partial<CreateTaxRateRequest>): Promise<TaxRate> {
    const response = await apiClient.put<TaxRate>(`/tax/rates/${id}`, data)
    return response.data
  }

  async deleteTaxRate(id: string): Promise<void> {
    await apiClient.delete(`/tax/rates/${id}`)
  }

  // Tax Returns
  async getTaxReturns(filters: TaxFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<TaxReturn>> {
    const response = await apiClient.get<PaginatedResponse<TaxReturn>>('/tax/returns', { params: filters })
    return response.data
  }

  async getTaxReturn(id: string): Promise<TaxReturn> {
    const response = await apiClient.get<TaxReturn>(`/tax/returns/${id}`)
    return response.data
  }

  async createTaxReturn(data: CreateTaxReturnRequest): Promise<TaxReturn> {
    const response = await apiClient.post<TaxReturn>('/tax/returns', data)
    return response.data
  }

  async updateTaxReturn(id: string, data: Partial<CreateTaxReturnRequest>): Promise<TaxReturn> {
    const response = await apiClient.put<TaxReturn>(`/tax/returns/${id}`, data)
    return response.data
  }

  async submitTaxReturn(id: string): Promise<TaxReturn> {
    const response = await apiClient.post<TaxReturn>(`/tax/returns/${id}/submit`)
    return response.data
  }

  async amendTaxReturn(id: string, data: { reason: string; changes: any }): Promise<TaxReturn> {
    const response = await apiClient.post<TaxReturn>(`/tax/returns/${id}/amend`, data)
    return response.data
  }

  // Tax Liabilities
  async getTaxLiabilities(filters: TaxFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<TaxLiability>> {
    const response = await apiClient.get<PaginatedResponse<TaxLiability>>('/tax/liabilities', { params: filters })
    return response.data
  }

  async getTaxLiability(id: string): Promise<TaxLiability> {
    const response = await apiClient.get<TaxLiability>(`/tax/liabilities/${id}`)
    return response.data
  }

  // Tax Payments
  async getTaxPayments(filters: TaxFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<TaxPayment>> {
    const response = await apiClient.get<PaginatedResponse<TaxPayment>>('/tax/payments', { params: filters })
    return response.data
  }

  async getTaxPayment(id: string): Promise<TaxPayment> {
    const response = await apiClient.get<TaxPayment>(`/tax/payments/${id}`)
    return response.data
  }

  async createTaxPayment(data: CreateTaxPaymentRequest): Promise<TaxPayment> {
    const response = await apiClient.post<TaxPayment>('/tax/payments', data)
    return response.data
  }

  async updateTaxPayment(id: string, data: Partial<CreateTaxPaymentRequest>): Promise<TaxPayment> {
    const response = await apiClient.put<TaxPayment>(`/tax/payments/${id}`, data)
    return response.data
  }

  async deleteTaxPayment(id: string): Promise<void> {
    await apiClient.delete(`/tax/payments/${id}`)
  }

  // Tax Notices
  async getTaxNotices(filters: any & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<TaxNotice>> {
    const response = await apiClient.get<PaginatedResponse<TaxNotice>>('/tax/notices', { params: filters })
    return response.data
  }

  async getTaxNotice(id: string): Promise<TaxNotice> {
    const response = await apiClient.get<TaxNotice>(`/tax/notices/${id}`)
    return response.data
  }

  async createTaxNotice(data: CreateTaxNoticeRequest): Promise<TaxNotice> {
    const response = await apiClient.post<TaxNotice>('/tax/notices', data)
    return response.data
  }

  async updateTaxNotice(id: string, data: Partial<CreateTaxNoticeRequest>): Promise<TaxNotice> {
    const response = await apiClient.put<TaxNotice>(`/tax/notices/${id}`, data)
    return response.data
  }

  async respondToTaxNotice(id: string, data: { response: string; documents?: File[] }): Promise<TaxNotice> {
    const formData = new FormData()
    formData.append('response', data.response)
    if (data.documents) {
      data.documents.forEach((file, index) => {
        formData.append(`document_${index}`, file)
      })
    }
    const response = await apiClient.post<TaxNotice>(`/tax/notices/${id}/respond`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  // Tax Compliance
  async getTaxCompliance(filters: TaxComplianceFilters = {}): Promise<TaxComplianceStatus[]> {
    const response = await apiClient.get<TaxComplianceStatus[]>('/tax/compliance', { params: filters })
    return response.data
  }

  async getTaxComplianceRequirements(): Promise<TaxComplianceRequirement[]> {
    const response = await apiClient.get<TaxComplianceRequirement[]>('/tax/compliance/requirements')
    return response.data
  }

  async updateTaxComplianceStatus(id: string, data: { status: string; notes?: string }): Promise<TaxComplianceStatus> {
    const response = await apiClient.put<TaxComplianceStatus>(`/tax/compliance/${id}`, data)
    return response.data
  }

  // Tax Calculation
  async calculateTax(data: TaxCalculationRequest): Promise<TaxCalculationResult> {
    const response = await apiClient.post<TaxCalculationResult>('/tax/calculate', data)
    return response.data
  }

  async bulkCalculateTax(data: TaxCalculationRequest[]): Promise<TaxCalculationResult[]> {
    const response = await apiClient.post<TaxCalculationResult[]>('/tax/calculate/bulk', data)
    return response.data
  }

  // Tax Analytics
  async getTaxAnalytics(filters: TaxFilters = {}): Promise<TaxAnalytics> {
    const response = await apiClient.get<TaxAnalytics>('/tax/analytics', { params: filters })
    return response.data
  }

  async getTaxCalendar(year: number): Promise<any[]> {
    const response = await apiClient.get(`/tax/calendar/${year}`)
    return response.data
  }

  // Tax Documents
  async uploadTaxDocument(returnId: string, file: File, documentType: string): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentType', documentType)
    const response = await apiClient.post(`/tax/returns/${returnId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async deleteTaxDocument(returnId: string, documentId: string): Promise<void> {
    await apiClient.delete(`/tax/returns/${returnId}/documents/${documentId}`)
  }

  // Tax Export
  async exportTaxReturns(data: { format: 'PDF' | 'XML' | 'CSV'; filters?: TaxFilters }): Promise<Blob> {
    const response = await apiClient.post('/tax/returns/export', data, { responseType: 'blob' })
    return response.data
  }

  async exportTaxReports(data: { reportType: string; format: 'PDF' | 'EXCEL' | 'CSV'; filters?: TaxFilters }): Promise<Blob> {
    const response = await apiClient.post('/tax/reports/export', data, { responseType: 'blob' })
    return response.data
  }

  // Tax Registration
  async getTaxRegistrations(): Promise<any[]> {
    const response = await apiClient.get('/tax/registrations')
    return response.data
  }

  async createTaxRegistration(data: any): Promise<any> {
    const response = await apiClient.post('/tax/registrations', data)
    return response.data
  }

  // Tax Audit
  async getTaxAudits(): Promise<any[]> {
    const response = await apiClient.get('/tax/audits')
    return response.data
  }

  async createTaxAuditResponse(auditId: string, data: any): Promise<any> {
    const response = await apiClient.post(`/tax/audits/${auditId}/response`, data)
    return response.data
  }

  // Customer Lifecycle Management

  // Customer Lifecycle
  async getCustomerLifecycle(customerId: string): Promise<CustomerLifecycle> {
    const response = await apiClient.get<CustomerLifecycle>(`/customers/${customerId}/lifecycle`)
    return response.data
  }

  async getCustomerLifecycles(filters: CustomerLifecycleFilters = {}): Promise<CustomerLifecycle[]> {
    const response = await apiClient.get<CustomerLifecycle[]>('/customers/lifecycle', { params: filters })
    return response.data
  }

  async updateCustomerLifecycle(customerId: string, data: UpdateCustomerLifecycleRequest): Promise<CustomerLifecycle> {
    const response = await apiClient.put<CustomerLifecycle>(`/customers/${customerId}/lifecycle`, data)
    return response.data
  }

  async advanceCustomerLifecycleStage(customerId: string, stage: string, notes?: string): Promise<CustomerLifecycle> {
    const response = await apiClient.post<CustomerLifecycle>(`/customers/${customerId}/lifecycle/advance`, { stage, notes })
    return response.data
  }

  // Customer Communications
  async getCustomerCommunications(filters: CommunicationFilters = {}): Promise<PaginatedResponse<CustomerCommunication>> {
    const response = await apiClient.get<PaginatedResponse<CustomerCommunication>>('/customer-communications', { params: filters })
    return response.data
  }

  async getCustomerCommunication(id: string): Promise<CustomerCommunication> {
    const response = await apiClient.get<CustomerCommunication>(`/customer-communications/${id}`)
    return response.data
  }

  async createCustomerCommunication(data: CreateCommunicationRequest): Promise<CustomerCommunication> {
    const response = await apiClient.post<CustomerCommunication>('/customer-communications', data)
    return response.data
  }

  async updateCustomerCommunication(id: string, data: Partial<CreateCommunicationRequest>): Promise<CustomerCommunication> {
    const response = await apiClient.put<CustomerCommunication>(`/customer-communications/${id}`, data)
    return response.data
  }

  async deleteCustomerCommunication(id: string): Promise<void> {
    await apiClient.delete(`/customer-communications/${id}`)
  }

  // Customer Onboarding
  async getCustomerOnboarding(customerId: string): Promise<CustomerOnboarding> {
    const response = await apiClient.get<CustomerOnboarding>(`/customers/${customerId}/onboarding`)
    return response.data
  }

  async getCustomerOnboardings(filters: OnboardingFilters = {}): Promise<PaginatedResponse<CustomerOnboarding>> {
    const response = await apiClient.get<PaginatedResponse<CustomerOnboarding>>('/customer-onboarding', { params: filters })
    return response.data
  }

  async getOnboardingTemplates(): Promise<OnboardingTemplate[]> {
    const response = await apiClient.get<OnboardingTemplate[]>('/onboarding-templates')
    return response.data
  }

  async createCustomerOnboarding(data: CreateOnboardingRequest): Promise<CustomerOnboarding> {
    const response = await apiClient.post<CustomerOnboarding>('/customer-onboarding', data)
    return response.data
  }

  async updateOnboardingStep(onboardingId: string, stepId: string, data: any): Promise<CustomerOnboarding> {
    const response = await apiClient.put<CustomerOnboarding>(`/customer-onboarding/${onboardingId}/steps/${stepId}`, data)
    return response.data
  }

  async completeOnboardingStep(onboardingId: string, stepId: string, notes?: string): Promise<CustomerOnboarding> {
    const response = await apiClient.post<CustomerOnboarding>(`/customer-onboarding/${onboardingId}/steps/${stepId}/complete`, { notes })
    return response.data
  }

  // Customer Portal Access
  async getCustomerPortalAccess(customerId: string): Promise<CustomerPortalAccess> {
    const response = await apiClient.get<CustomerPortalAccess>(`/customers/${customerId}/portal-access`)
    return response.data
  }

  async updateCustomerPortalAccess(customerId: string, data: UpdatePortalAccessRequest): Promise<CustomerPortalAccess> {
    const response = await apiClient.put<CustomerPortalAccess>(`/customers/${customerId}/portal-access`, data)
    return response.data
  }

  async createPortalInvitation(customerId: string, email?: string, message?: string): Promise<any> {
    const response = await apiClient.post(`/customers/${customerId}/portal-access/invite`, { email, message })
    return response.data
  }

  // Customer Events
  async getCustomerEvents(customerId?: string, filters: any = {}): Promise<PaginatedResponse<CustomerEvent>> {
    const endpoint = customerId ? `/customers/${customerId}/events` : '/customer-events'
    const response = await apiClient.get<PaginatedResponse<CustomerEvent>>(endpoint, { params: filters })
    return response.data
  }

  async getCustomerEvent(id: string): Promise<CustomerEvent> {
    const response = await apiClient.get<CustomerEvent>(`/customer-events/${id}`)
    return response.data
  }

  async createCustomerEvent(data: CreateCustomerEventRequest): Promise<CustomerEvent> {
    const response = await apiClient.post<CustomerEvent>('/customer-events', data)
    return response.data
  }

  async updateCustomerEvent(id: string, data: Partial<CreateCustomerEventRequest>): Promise<CustomerEvent> {
    const response = await apiClient.put<CustomerEvent>(`/customer-events/${id}`, data)
    return response.data
  }

  async deleteCustomerEvent(id: string): Promise<void> {
    await apiClient.delete(`/customer-events/${id}`)
  }

  // Customer Relationship History
  async getCustomerRelationshipHistory(customerId: string): Promise<CustomerRelationshipHistory> {
    const response = await apiClient.get<CustomerRelationshipHistory>(`/customers/${customerId}/relationship-history`)
    return response.data
  }

  // Customer Insights
  async getCustomerInsights(customerId: string): Promise<CustomerInsights> {
    const response = await apiClient.get<CustomerInsights>(`/customers/${customerId}/insights`)
    return response.data
  }

  async refreshCustomerInsights(customerId: string): Promise<CustomerInsights> {
    const response = await apiClient.post<CustomerInsights>(`/customers/${customerId}/insights/refresh`)
    return response.data
  }

  // Customer Segmentation
  async getCustomerSegments(): Promise<CustomerSegment[]> {
    const response = await apiClient.get<CustomerSegment[]>('/customer-segments')
    return response.data
  }

  async getCustomerSegment(id: string): Promise<CustomerSegment> {
    const response = await apiClient.get<CustomerSegment>(`/customer-segments/${id}`)
    return response.data
  }

  async createCustomerSegment(data: any): Promise<CustomerSegment> {
    const response = await apiClient.post<CustomerSegment>('/customer-segments', data)
    return response.data
  }

  async updateCustomerSegment(id: string, data: any): Promise<CustomerSegment> {
    const response = await apiClient.put<CustomerSegment>(`/customer-segments/${id}`, data)
    return response.data
  }

  // Customer Lifecycle Analytics
  async getCustomerLifecycleAnalytics(filters: any = {}): Promise<any> {
    const response = await apiClient.get('/customers/lifecycle/analytics', { params: filters })
    return response.data
  }

  // Bulk Operations
  async bulkUpdateLifecycleStage(customerIds: string[], stage: string, notes?: string): Promise<void> {
    await apiClient.post('/customers/lifecycle/bulk-update-stage', { customerIds, stage, notes })
  }

  async bulkCreateCommunications(customerIds: string[], data: Omit<CreateCommunicationRequest, 'customerId'>): Promise<void> {
    await apiClient.post('/customer-communications/bulk-create', { customerIds, ...data })
  }

  // File Uploads
  async uploadCommunicationAttachment(communicationId: string, file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post(`/customer-communications/${communicationId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async deleteCommunicationAttachment(communicationId: string, attachmentId: string): Promise<void> {
    await apiClient.delete(`/customer-communications/${communicationId}/attachments/${attachmentId}`)
  }

  // Export Functions
  async exportCustomerData(customerId: string, format: 'PDF' | 'EXCEL' | 'CSV', includeHistory?: boolean): Promise<Blob> {
    const response = await apiClient.post(`/customers/${customerId}/export`, { format, includeHistory }, { responseType: 'blob' })
    return response.data
  }

  async exportLifecycleReport(format: 'PDF' | 'EXCEL' | 'CSV', filters?: CustomerLifecycleFilters): Promise<Blob> {
    const response = await apiClient.post('/customers/lifecycle/export', { format, filters }, { responseType: 'blob' })
    return response.data
  }

  // Employee Management
  async getEmployees(filters?: EmployeeFilters): Promise<Employee[]> {
    const response = await apiClient.get<Employee[]>('/employees', { params: filters })
    return response.data
  }

  async getEmployee(id: string): Promise<Employee> {
    const response = await apiClient.get<Employee>(`/employees/${id}`)
    return response.data
  }

  async createEmployee(data: CreateEmployeeRequest): Promise<Employee> {
    const response = await apiClient.post<Employee>('/employees', data)
    return response.data
  }

  async updateEmployee(id: string, data: UpdateEmployeeRequest): Promise<Employee> {
    const response = await apiClient.put<Employee>(`/employees/${id}`, data)
    return response.data
  }

  async deleteEmployee(id: string): Promise<void> {
    await apiClient.delete(`/employees/${id}`)
  }

  // Contractor Management
  async getContractors(filters?: ContractorFilters): Promise<Contractor[]> {
    const response = await apiClient.get<Contractor[]>('/contractors', { params: filters })
    return response.data
  }

  async getContractor(id: string): Promise<Contractor> {
    const response = await apiClient.get<Contractor>(`/contractors/${id}`)
    return response.data
  }

  async createContractor(data: CreateContractorRequest): Promise<Contractor> {
    const response = await apiClient.post<Contractor>('/contractors', data)
    return response.data
  }

  async updateContractor(id: string, data: Partial<CreateContractorRequest>): Promise<Contractor> {
    const response = await apiClient.put<Contractor>(`/contractors/${id}`, data)
    return response.data
  }

  async deleteContractor(id: string): Promise<void> {
    await apiClient.delete(`/contractors/${id}`)
  }

  // Contract Management
  async getContracts(contractorId?: string): Promise<Contract[]> {
    const response = await apiClient.get<Contract[]>('/contracts', { params: { contractorId } })
    return response.data
  }

  async getContract(id: string): Promise<Contract> {
    const response = await apiClient.get<Contract>(`/contracts/${id}`)
    return response.data
  }

  async createContract(data: CreateContractRequest): Promise<Contract> {
    const response = await apiClient.post<Contract>('/contracts', data)
    return response.data
  }

  async updateContract(id: string, data: Partial<CreateContractRequest>): Promise<Contract> {
    const response = await apiClient.put<Contract>(`/contracts/${id}`, data)
    return response.data
  }

  async deleteContract(id: string): Promise<void> {
    await apiClient.delete(`/contracts/${id}`)
  }

  // Time Tracking
  async getTimeEntries(filters?: TimeEntryFilters): Promise<TimeEntry[]> {
    const response = await apiClient.get<TimeEntry[]>('/time-entries', { params: filters })
    return response.data
  }

  async getTimeEntry(id: string): Promise<TimeEntry> {
    const response = await apiClient.get<TimeEntry>(`/time-entries/${id}`)
    return response.data
  }

  async createTimeEntry(data: CreateTimeEntryRequest): Promise<TimeEntry> {
    const response = await apiClient.post<TimeEntry>('/time-entries', data)
    return response.data
  }

  async updateTimeEntry(id: string, data: Partial<CreateTimeEntryRequest>): Promise<TimeEntry> {
    const response = await apiClient.put<TimeEntry>(`/time-entries/${id}`, data)
    return response.data
  }

  async deleteTimeEntry(id: string): Promise<void> {
    await apiClient.delete(`/time-entries/${id}`)
  }

  async submitTimeEntry(id: string): Promise<TimeEntry> {
    const response = await apiClient.post<TimeEntry>(`/time-entries/${id}/submit`)
    return response.data
  }

  async approveTimeEntry(id: string, notes?: string): Promise<TimeEntry> {
    const response = await apiClient.post<TimeEntry>(`/time-entries/${id}/approve`, { notes })
    return response.data
  }

  async rejectTimeEntry(id: string, reason: string): Promise<TimeEntry> {
    const response = await apiClient.post<TimeEntry>(`/time-entries/${id}/reject`, { reason })
    return response.data
  }

  // Leave Management
  async getLeaveRequests(filters?: LeaveRequestFilters): Promise<LeaveRequest[]> {
    const response = await apiClient.get<LeaveRequest[]>('/leave-requests', { params: filters })
    return response.data
  }

  async getLeaveRequest(id: string): Promise<LeaveRequest> {
    const response = await apiClient.get<LeaveRequest>(`/leave-requests/${id}`)
    return response.data
  }

  async createLeaveRequest(data: CreateLeaveRequestRequest): Promise<LeaveRequest> {
    const response = await apiClient.post<LeaveRequest>('/leave-requests', data)
    return response.data
  }

  async updateLeaveRequest(id: string, data: Partial<CreateLeaveRequestRequest>): Promise<LeaveRequest> {
    const response = await apiClient.put<LeaveRequest>(`/leave-requests/${id}`, data)
    return response.data
  }

  async approveLeaveRequest(id: string, notes?: string): Promise<LeaveRequest> {
    const response = await apiClient.post<LeaveRequest>(`/leave-requests/${id}/approve`, { notes })
    return response.data
  }

  async rejectLeaveRequest(id: string, reason: string): Promise<LeaveRequest> {
    const response = await apiClient.post<LeaveRequest>(`/leave-requests/${id}/reject`, { reason })
    return response.data
  }

  // Performance Reviews
  async getPerformanceReviews(employeeId?: string): Promise<PerformanceReview[]> {
    const response = await apiClient.get<PerformanceReview[]>('/performance-reviews', { params: { employeeId } })
    return response.data
  }

  async getPerformanceReview(id: string): Promise<PerformanceReview> {
    const response = await apiClient.get<PerformanceReview>(`/performance-reviews/${id}`)
    return response.data
  }

  async createPerformanceReview(data: CreatePerformanceReviewRequest): Promise<PerformanceReview> {
    const response = await apiClient.post<PerformanceReview>('/performance-reviews', data)
    return response.data
  }

  async updatePerformanceReview(id: string, data: Partial<CreatePerformanceReviewRequest>): Promise<PerformanceReview> {
    const response = await apiClient.put<PerformanceReview>(`/performance-reviews/${id}`, data)
    return response.data
  }

  async completePerformanceReview(id: string): Promise<PerformanceReview> {
    const response = await apiClient.post<PerformanceReview>(`/performance-reviews/${id}/complete`)
    return response.data
  }

  // Payroll Management
  async getPayrollPeriods(): Promise<PayrollPeriod[]> {
    const response = await apiClient.get<PayrollPeriod[]>('/payroll-periods')
    return response.data
  }

  async getPayrollPeriod(id: string): Promise<PayrollPeriod> {
    const response = await apiClient.get<PayrollPeriod>(`/payroll-periods/${id}`)
    return response.data
  }

  async createPayrollPeriod(data: { periodStart: string; periodEnd: string; payDate: string }): Promise<PayrollPeriod> {
    const response = await apiClient.post<PayrollPeriod>('/payroll-periods', data)
    return response.data
  }

  async processPayroll(periodId: string): Promise<PayrollPeriod> {
    const response = await apiClient.post<PayrollPeriod>(`/payroll-periods/${periodId}/process`)
    return response.data
  }

  async getPayrollEntries(periodId: string): Promise<PayrollEntry[]> {
    const response = await apiClient.get<PayrollEntry[]>(`/payroll-periods/${periodId}/entries`)
    return response.data
  }

  // Work Schedules
  async getWorkSchedules(): Promise<WorkSchedule[]> {
    const response = await apiClient.get<WorkSchedule[]>('/work-schedules')
    return response.data
  }

  async getWorkSchedule(id: string): Promise<WorkSchedule> {
    const response = await apiClient.get<WorkSchedule>(`/work-schedules/${id}`)
    return response.data
  }

  async createWorkSchedule(data: Omit<WorkSchedule, 'id'>): Promise<WorkSchedule> {
    const response = await apiClient.post<WorkSchedule>('/work-schedules', data)
    return response.data
  }

  async updateWorkSchedule(id: string, data: Partial<WorkSchedule>): Promise<WorkSchedule> {
    const response = await apiClient.put<WorkSchedule>(`/work-schedules/${id}`, data)
    return response.data
  }

  // Analytics and Reporting
  async getEmployeeHierarchy(): Promise<any> {
    const response = await apiClient.get('/employees/hierarchy')
    return response.data
  }

  async getEmployeeAnalytics(filters?: any): Promise<any> {
    const response = await apiClient.get('/employees/analytics', { params: filters })
    return response.data
  }

  // Bulk Operations
  async bulkUpdateEmployees(employeeIds: string[], data: Partial<UpdateEmployeeRequest>): Promise<void> {
    await apiClient.post('/employees/bulk-update', { employeeIds, ...data })
  }

  async bulkApproveTimeEntries(timeEntryIds: string[], notes?: string): Promise<void> {
    await apiClient.post('/time-entries/bulk-approve', { timeEntryIds, notes })
  }

  async bulkApproveLeaveRequests(leaveRequestIds: string[], notes?: string): Promise<void> {
    await apiClient.post('/leave-requests/bulk-approve', { leaveRequestIds, notes })
  }

  // File Uploads
  async uploadEmployeeDocument(employeeId: string, file: File, type: string): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    const response = await apiClient.post(`/employees/${employeeId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async deleteEmployeeDocument(employeeId: string, documentId: string): Promise<void> {
    await apiClient.delete(`/employees/${employeeId}/documents/${documentId}`)
  }

  // Export Functions
  async exportEmployeeData(format: 'PDF' | 'EXCEL' | 'CSV', filters?: EmployeeFilters): Promise<Blob> {
    const response = await apiClient.post('/employees/export', { format, filters }, { responseType: 'blob' })
    return response.data
  }

  async exportTimeEntries(format: 'PDF' | 'EXCEL' | 'CSV', filters?: TimeEntryFilters): Promise<Blob> {
    const response = await apiClient.post('/time-entries/export', { format, filters }, { responseType: 'blob' })
    return response.data
  }

  async exportPayrollReport(periodId: string, format: 'PDF' | 'EXCEL' | 'CSV'): Promise<Blob> {
    const response = await apiClient.post(`/payroll-periods/${periodId}/export`, { format }, { responseType: 'blob' })
    return response.data
  }

  // System Administration - System Settings
  async getSystemSettings(): Promise<SystemSettings> {
    const response = await apiClient.get<SystemSettings>('/admin/system/settings')
    return response.data
  }

  async updateSystemSettings(data: UpdateSystemSettingsRequest): Promise<SystemSettings> {
    const response = await apiClient.put<SystemSettings>('/admin/system/settings', data)
    return response.data
  }

  // Organization Management
  async getOrganizations(filters?: OrganizationFilters): Promise<Organization[]> {
    const response = await apiClient.get<Organization[]>('/admin/organizations', { params: filters })
    return response.data
  }

  async getOrganization(id: string): Promise<Organization> {
    const response = await apiClient.get<Organization>(`/admin/organizations/${id}`)
    return response.data
  }

  async createOrganization(data: CreateOrganizationRequest): Promise<Organization> {
    const response = await apiClient.post<Organization>('/admin/organizations', data)
    return response.data
  }

  async updateOrganization(id: string, data: UpdateOrganizationRequest): Promise<Organization> {
    const response = await apiClient.put<Organization>(`/admin/organizations/${id}`, data)
    return response.data
  }

  async suspendOrganization(id: string, reason: string): Promise<Organization> {
    const response = await apiClient.post<Organization>(`/admin/organizations/${id}/suspend`, { reason })
    return response.data
  }

  async terminateOrganization(id: string, reason: string): Promise<Organization> {
    const response = await apiClient.post<Organization>(`/admin/organizations/${id}/terminate`, { reason })
    return response.data
  }

  // Subscription Plan Management
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const response = await apiClient.get<SubscriptionPlan[]>('/admin/subscription-plans')
    return response.data
  }

  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan> {
    const response = await apiClient.get<SubscriptionPlan>(`/admin/subscription-plans/${id}`)
    return response.data
  }

  async createSubscriptionPlan(data: CreateSubscriptionPlanRequest): Promise<SubscriptionPlan> {
    const response = await apiClient.post<SubscriptionPlan>('/admin/subscription-plans', data)
    return response.data
  }

  async updateSubscriptionPlan(id: string, data: Partial<CreateSubscriptionPlanRequest>): Promise<SubscriptionPlan> {
    const response = await apiClient.put<SubscriptionPlan>(`/admin/subscription-plans/${id}`, data)
    return response.data
  }

  async deleteSubscriptionPlan(id: string): Promise<void> {
    await apiClient.delete(`/admin/subscription-plans/${id}`)
  }

  // Subscription Management
  async getSubscriptions(organizationId?: string): Promise<Subscription[]> {
    const response = await apiClient.get<Subscription[]>('/admin/subscriptions', { params: { organizationId } })
    return response.data
  }

  async getSubscription(id: string): Promise<Subscription> {
    const response = await apiClient.get<Subscription>(`/admin/subscriptions/${id}`)
    return response.data
  }

  async updateSubscription(id: string, data: any): Promise<Subscription> {
    const response = await apiClient.put<Subscription>(`/admin/subscriptions/${id}`, data)
    return response.data
  }

  async cancelSubscription(id: string, reason: string): Promise<Subscription> {
    const response = await apiClient.post<Subscription>(`/admin/subscriptions/${id}/cancel`, { reason })
    return response.data
  }

  // System Health and Monitoring
  async getSystemHealth(): Promise<SystemHealth> {
    const response = await apiClient.get<SystemHealth>('/admin/system/health')
    return response.data
  }

  async getSystemLogs(filters?: SystemLogFilters): Promise<SystemLog[]> {
    const response = await apiClient.get<SystemLog[]>('/admin/system/logs', { params: filters })
    return response.data
  }

  async getSystemLogStream(): Promise<SystemLog[]> {
    const response = await apiClient.get<SystemLog[]>('/admin/system/logs/stream')
    return response.data
  }

  async clearSystemLogs(before?: string, level?: string): Promise<void> {
    await apiClient.delete('/admin/system/logs', { params: { before, level } })
  }

  // Integration Management
  async getIntegrations(filters?: IntegrationFilters): Promise<SystemIntegration[]> {
    const response = await apiClient.get<SystemIntegration[]>('/admin/integrations', { params: filters })
    return response.data
  }

  async getIntegration(id: string): Promise<SystemIntegration> {
    const response = await apiClient.get<SystemIntegration>(`/admin/integrations/${id}`)
    return response.data
  }

  async createIntegration(data: CreateIntegrationRequest): Promise<SystemIntegration> {
    const response = await apiClient.post<SystemIntegration>('/admin/integrations', data)
    return response.data
  }

  async updateIntegration(id: string, data: Partial<CreateIntegrationRequest>): Promise<SystemIntegration> {
    const response = await apiClient.put<SystemIntegration>(`/admin/integrations/${id}`, data)
    return response.data
  }

  async deleteIntegration(id: string): Promise<void> {
    await apiClient.delete(`/admin/integrations/${id}`)
  }

  async testIntegration(id: string): Promise<any> {
    const response = await apiClient.post(`/admin/integrations/${id}/test`)
    return response.data
  }

  // Maintenance Window Management
  async getMaintenanceWindows(): Promise<MaintenanceWindow[]> {
    const response = await apiClient.get<MaintenanceWindow[]>('/admin/maintenance-windows')
    return response.data
  }

  async getMaintenanceWindow(id: string): Promise<MaintenanceWindow> {
    const response = await apiClient.get<MaintenanceWindow>(`/admin/maintenance-windows/${id}`)
    return response.data
  }

  async createMaintenanceWindow(data: CreateMaintenanceWindowRequest): Promise<MaintenanceWindow> {
    const response = await apiClient.post<MaintenanceWindow>('/admin/maintenance-windows', data)
    return response.data
  }

  async updateMaintenanceWindow(id: string, data: Partial<CreateMaintenanceWindowRequest>): Promise<MaintenanceWindow> {
    const response = await apiClient.put<MaintenanceWindow>(`/admin/maintenance-windows/${id}`, data)
    return response.data
  }

  async startMaintenanceWindow(id: string): Promise<MaintenanceWindow> {
    const response = await apiClient.post<MaintenanceWindow>(`/admin/maintenance-windows/${id}/start`)
    return response.data
  }

  async completeMaintenanceWindow(id: string, notes?: string): Promise<MaintenanceWindow> {
    const response = await apiClient.post<MaintenanceWindow>(`/admin/maintenance-windows/${id}/complete`, { notes })
    return response.data
  }

  async cancelMaintenanceWindow(id: string, reason: string): Promise<MaintenanceWindow> {
    const response = await apiClient.post<MaintenanceWindow>(`/admin/maintenance-windows/${id}/cancel`, { reason })
    return response.data
  }

  // System Analytics
  async getSystemAnalytics(period?: { start: string; end: string }): Promise<SystemAnalytics> {
    const response = await apiClient.get<SystemAnalytics>('/admin/analytics', { params: period })
    return response.data
  }

  async generateAnalyticsReport(period: { start: string; end: string }, format: 'PDF' | 'EXCEL' | 'CSV'): Promise<Blob> {
    const response = await apiClient.post('/admin/analytics/export', { period, format }, { responseType: 'blob' })
    return response.data
  }

  // Feature Toggle Management
  async getFeatureToggles(): Promise<FeatureToggle[]> {
    const response = await apiClient.get<FeatureToggle[]>('/admin/feature-toggles')
    return response.data
  }

  async getFeatureToggle(id: string): Promise<FeatureToggle> {
    const response = await apiClient.get<FeatureToggle>(`/admin/feature-toggles/${id}`)
    return response.data
  }

  async createFeatureToggle(data: FeatureToggleRequest): Promise<FeatureToggle> {
    const response = await apiClient.post<FeatureToggle>('/admin/feature-toggles', data)
    return response.data
  }

  async updateFeatureToggle(id: string, data: Partial<FeatureToggleRequest>): Promise<FeatureToggle> {
    const response = await apiClient.put<FeatureToggle>(`/admin/feature-toggles/${id}`, data)
    return response.data
  }

  async deleteFeatureToggle(id: string): Promise<void> {
    await apiClient.delete(`/admin/feature-toggles/${id}`)
  }

  // System User Management
  async getSystemUsers(): Promise<any[]> {
    const response = await apiClient.get('/admin/users')
    return response.data
  }

  async createSystemUser(data: any): Promise<any> {
    const response = await apiClient.post('/admin/users', data)
    return response.data
  }

  async updateSystemUserRole(userId: string, role: string): Promise<any> {
    const response = await apiClient.put(`/admin/users/${userId}/role`, { role })
    return response.data
  }

  // Backup Management
  async getBackups(): Promise<any[]> {
    const response = await apiClient.get('/admin/backups')
    return response.data
  }

  async createBackup(includeFiles?: boolean, description?: string): Promise<any> {
    const response = await apiClient.post('/admin/backups', { includeFiles, description })
    return response.data
  }

  async restoreBackup(backupId: string): Promise<any> {
    const response = await apiClient.post(`/admin/backups/${backupId}/restore`)
    return response.data
  }

  async deleteBackup(backupId: string): Promise<void> {
    await apiClient.delete(`/admin/backups/${backupId}`)
  }

  // Bulk Operations
  async bulkUpdateOrganizations(organizationIds: string[], data: Partial<UpdateOrganizationRequest>): Promise<void> {
    await apiClient.post('/admin/organizations/bulk-update', { organizationIds, ...data })
  }

  async bulkSuspendOrganizations(organizationIds: string[], reason: string): Promise<void> {
    await apiClient.post('/admin/organizations/bulk-suspend', { organizationIds, reason })
  }

  // System Operations
  async restartService(serviceName: string): Promise<any> {
    const response = await apiClient.post(`/admin/system/services/${serviceName}/restart`)
    return response.data
  }

  async flushCache(cacheType?: string): Promise<any> {
    const response = await apiClient.post('/admin/system/cache/flush', { cacheType })
    return response.data
  }

  async runSystemCheck(): Promise<any> {
    const response = await apiClient.post('/admin/system/check')
    return response.data
  }

  // Export Functions for System Admin
  async exportOrganizations(format: 'PDF' | 'EXCEL' | 'CSV', filters?: OrganizationFilters): Promise<Blob> {
    const response = await apiClient.post('/admin/organizations/export', { format, filters }, { responseType: 'blob' })
    return response.data
  }

  async exportSystemLogs(format: 'PDF' | 'EXCEL' | 'CSV', filters?: SystemLogFilters): Promise<Blob> {
    const response = await apiClient.post('/admin/system/logs/export', { format, filters }, { responseType: 'blob' })
    return response.data
  }

  // ========================================
  // PAYMENT PROCESSING
  // ========================================

  // Payment Gateway Management
  async getPaymentGateways(filters: PaymentGatewayFilters = {}): Promise<PaymentGateway[]> {
    const response = await apiClient.get<PaymentGateway[]>('/payment-processing/gateways', { params: filters })
    return response.data
  }

  async getPaymentGateway(gatewayId: string): Promise<PaymentGateway> {
    const response = await apiClient.get<PaymentGateway>(`/payment-processing/gateways/${gatewayId}`)
    return response.data
  }

  async createPaymentGateway(data: CreatePaymentGatewayRequest): Promise<PaymentGateway> {
    const response = await apiClient.post<PaymentGateway>('/payment-processing/gateways', data)
    return response.data
  }

  async updatePaymentGateway(gatewayId: string, data: UpdatePaymentGatewayRequest): Promise<PaymentGateway> {
    const response = await apiClient.put<PaymentGateway>(`/payment-processing/gateways/${gatewayId}`, data)
    return response.data
  }

  async deletePaymentGateway(gatewayId: string): Promise<void> {
    await apiClient.delete(`/payment-processing/gateways/${gatewayId}`)
  }

  async testPaymentGateway(gatewayId: string): Promise<{ success: boolean; message: string; responseTime: number }> {
    const response = await apiClient.post(`/payment-processing/gateways/${gatewayId}/test`)
    return response.data
  }

  async setDefaultGateway(gatewayId: string): Promise<void> {
    await apiClient.post(`/payment-processing/gateways/${gatewayId}/set-default`)
  }

  // Payment Method Management
  async getPaymentMethods(filters: PaymentMethodFilters = {}): Promise<PaginatedResponse<PaymentMethod>> {
    const response = await apiClient.get<PaginatedResponse<PaymentMethod>>('/payment-processing/payment-methods', { params: filters })
    return response.data
  }

  async getCustomerPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    const response = await apiClient.get<PaymentMethod[]>(`/customers/${customerId}/payment-methods`)
    return response.data
  }

  async getPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
    const response = await apiClient.get<PaymentMethod>(`/payment-processing/payment-methods/${paymentMethodId}`)
    return response.data
  }

  async createPaymentMethod(data: CreatePaymentMethodRequest): Promise<PaymentMethod> {
    const response = await apiClient.post<PaymentMethod>('/payment-processing/payment-methods', data)
    return response.data
  }

  async updatePaymentMethod(paymentMethodId: string, data: Partial<CreatePaymentMethodRequest>): Promise<PaymentMethod> {
    const response = await apiClient.put<PaymentMethod>(`/payment-processing/payment-methods/${paymentMethodId}`, data)
    return response.data
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    await apiClient.delete(`/payment-processing/payment-methods/${paymentMethodId}`)
  }

  async verifyPaymentMethod(paymentMethodId: string): Promise<{ verified: boolean; message: string }> {
    const response = await apiClient.post(`/payment-processing/payment-methods/${paymentMethodId}/verify`)
    return response.data
  }

  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<void> {
    await apiClient.post(`/customers/${customerId}/payment-methods/${paymentMethodId}/set-default`)
  }

  // Payment Processing Settings
  async getPaymentProcessingSettings(): Promise<PaymentProcessingSettings> {
    const response = await apiClient.get<PaymentProcessingSettings>('/payment-processing/settings')
    return response.data
  }

  async updatePaymentProcessingSettings(data: Partial<PaymentProcessingSettings>): Promise<PaymentProcessingSettings> {
    const response = await apiClient.put<PaymentProcessingSettings>('/payment-processing/settings', data)
    return response.data
  }

  // Payment Processing
  async processPayment(data: ProcessPaymentRequest): Promise<{
    paymentId: string
    status: 'SUCCESS' | 'FAILED' | 'PENDING'
    transactionId?: string
    message: string
    fees: { gatewayFee: number; processingFee: number; totalFees: number }
  }> {
    const response = await apiClient.post('/payment-processing/process', data)
    return response.data
  }

  async retryPayment(paymentId: string): Promise<{
    success: boolean
    attemptId: string
    status: 'SUCCESS' | 'FAILED' | 'PENDING'
    message: string
  }> {
    const response = await apiClient.post(`/payments/${paymentId}/retry`)
    return response.data
  }

  async getPaymentAttempts(paymentId: string): Promise<PaymentAttempt[]> {
    const response = await apiClient.get<PaymentAttempt[]>(`/payments/${paymentId}/attempts`)
    return response.data
  }

  async cancelPayment(paymentId: string): Promise<void> {
    await apiClient.post(`/payments/${paymentId}/cancel`)
  }

  // Recurring Payments
  async getRecurringPayments(filters: RecurringPaymentFilters = {}): Promise<PaginatedResponse<RecurringPayment>> {
    const response = await apiClient.get<PaginatedResponse<RecurringPayment>>('/payment-processing/recurring', { params: filters })
    return response.data
  }

  async getRecurringPayment(recurringPaymentId: string): Promise<RecurringPayment> {
    const response = await apiClient.get<RecurringPayment>(`/payment-processing/recurring/${recurringPaymentId}`)
    return response.data
  }

  async createRecurringPayment(data: CreateRecurringPaymentRequest): Promise<RecurringPayment> {
    const response = await apiClient.post<RecurringPayment>('/payment-processing/recurring', data)
    return response.data
  }

  async updateRecurringPayment(recurringPaymentId: string, data: Partial<CreateRecurringPaymentRequest>): Promise<RecurringPayment> {
    const response = await apiClient.put<RecurringPayment>(`/payment-processing/recurring/${recurringPaymentId}`, data)
    return response.data
  }

  async cancelRecurringPayment(recurringPaymentId: string): Promise<RecurringPayment> {
    const response = await apiClient.post<RecurringPayment>(`/payment-processing/recurring/${recurringPaymentId}/cancel`)
    return response.data
  }

  async pauseRecurringPayment(recurringPaymentId: string): Promise<RecurringPayment> {
    const response = await apiClient.post<RecurringPayment>(`/payment-processing/recurring/${recurringPaymentId}/pause`)
    return response.data
  }

  async resumeRecurringPayment(recurringPaymentId: string): Promise<RecurringPayment> {
    const response = await apiClient.post<RecurringPayment>(`/payment-processing/recurring/${recurringPaymentId}/resume`)
    return response.data
  }

  async processRecurringPayment(recurringPaymentId: string): Promise<{
    success: boolean
    paymentId?: string
    message: string
  }> {
    const response = await apiClient.post(`/payment-processing/recurring/${recurringPaymentId}/process`)
    return response.data
  }

  // Payment Plans
  async getPaymentPlans(filters: PaymentPlanFilters = {}): Promise<PaginatedResponse<PaymentPlan>> {
    const response = await apiClient.get<PaginatedResponse<PaymentPlan>>('/payment-processing/payment-plans', { params: filters })
    return response.data
  }

  async getPaymentPlan(paymentPlanId: string): Promise<PaymentPlan> {
    const response = await apiClient.get<PaymentPlan>(`/payment-processing/payment-plans/${paymentPlanId}`)
    return response.data
  }

  async createPaymentPlan(data: CreatePaymentPlanRequest): Promise<PaymentPlan> {
    const response = await apiClient.post<PaymentPlan>('/payment-processing/payment-plans', data)
    return response.data
  }

  async updatePaymentPlan(paymentPlanId: string, data: Partial<CreatePaymentPlanRequest>): Promise<PaymentPlan> {
    const response = await apiClient.put<PaymentPlan>(`/payment-processing/payment-plans/${paymentPlanId}`, data)
    return response.data
  }

  async cancelPaymentPlan(paymentPlanId: string): Promise<PaymentPlan> {
    const response = await apiClient.post<PaymentPlan>(`/payment-processing/payment-plans/${paymentPlanId}/cancel`)
    return response.data
  }

  async processPaymentPlanInstallment(paymentPlanId: string, installmentId: string): Promise<{
    success: boolean
    paymentId?: string
    message: string
  }> {
    const response = await apiClient.post(`/payment-processing/payment-plans/${paymentPlanId}/installments/${installmentId}/process`)
    return response.data
  }

  async waiveLateFee(paymentPlanId: string, installmentId: string): Promise<void> {
    await apiClient.post(`/payment-processing/payment-plans/${paymentPlanId}/installments/${installmentId}/waive-late-fee`)
  }

  // Refund Management
  async getRefundRequests(filters: RefundRequestFilters = {}): Promise<PaginatedResponse<RefundRequest>> {
    const response = await apiClient.get<PaginatedResponse<RefundRequest>>('/payment-processing/refunds', { params: filters })
    return response.data
  }

  async getRefundRequest(refundId: string): Promise<RefundRequest> {
    const response = await apiClient.get<RefundRequest>(`/payment-processing/refunds/${refundId}`)
    return response.data
  }

  async createRefundRequest(data: CreateRefundRequest): Promise<RefundRequest> {
    const response = await apiClient.post<RefundRequest>('/payment-processing/refunds', data)
    return response.data
  }

  async processRefund(refundId: string, approve: boolean, notes?: string): Promise<RefundRequest> {
    const response = await apiClient.post<RefundRequest>(`/payment-processing/refunds/${refundId}/process`, {
      approve,
      notes
    })
    return response.data
  }

  async getRefundStatus(refundId: string): Promise<{
    status: RefundRequest['status']
    gatewayRefundId?: string
    processedAmount?: number
    gatewayResponse?: any
  }> {
    const response = await apiClient.get(`/payment-processing/refunds/${refundId}/status`)
    return response.data
  }

  // Chargeback Management
  async getChargebacks(filters: ChargebackFilters = {}): Promise<PaginatedResponse<ChargebackNotice>> {
    const response = await apiClient.get<PaginatedResponse<ChargebackNotice>>('/payment-processing/chargebacks', { params: filters })
    return response.data
  }

  async getChargeback(chargebackId: string): Promise<ChargebackNotice> {
    const response = await apiClient.get<ChargebackNotice>(`/payment-processing/chargebacks/${chargebackId}`)
    return response.data
  }

  async submitChargebackEvidence(chargebackId: string, evidence: {
    description: string
    documents: string[]
  }): Promise<ChargebackNotice> {
    const response = await apiClient.post<ChargebackNotice>(`/payment-processing/chargebacks/${chargebackId}/evidence`, evidence)
    return response.data
  }

  async acceptChargeback(chargebackId: string, notes?: string): Promise<ChargebackNotice> {
    const response = await apiClient.post<ChargebackNotice>(`/payment-processing/chargebacks/${chargebackId}/accept`, { notes })
    return response.data
  }

  // Payment Analytics
  async getPaymentAnalytics(filters: PaymentAnalyticsFilters): Promise<PaymentAnalytics> {
    const response = await apiClient.get<PaymentAnalytics>('/payment-processing/analytics', { params: filters })
    return response.data
  }

  async getPaymentTrends(filters: PaymentAnalyticsFilters): Promise<Array<{
    date: string
    volume: number
    count: number
    successRate: number
    averageValue: number
  }>> {
    const response = await apiClient.get('/payment-processing/analytics/trends', { params: filters })
    return response.data
  }

  async getGatewayPerformance(filters: PaymentAnalyticsFilters): Promise<Array<{
    gatewayId: string
    gatewayName: string
    volume: number
    count: number
    successRate: number
    averageResponseTime: number
    totalFees: number
  }>> {
    const response = await apiClient.get('/payment-processing/analytics/gateway-performance', { params: filters })
    return response.data
  }

  async getFailureAnalysis(filters: PaymentAnalyticsFilters): Promise<Array<{
    reason: string
    count: number
    percentage: number
    impact: 'HIGH' | 'MEDIUM' | 'LOW'
    suggestion: string
  }>> {
    const response = await apiClient.get('/payment-processing/analytics/failure-analysis', { params: filters })
    return response.data
  }

  async exportPaymentData(filters: PaymentAnalyticsFilters, format: 'PDF' | 'EXCEL' | 'CSV'): Promise<Blob> {
    const response = await apiClient.post('/payment-processing/export',
      { ...filters, format },
      { responseType: 'blob' }
    )
    return response.data
  }

  // Payment Processing Utilities
  async validatePaymentData(data: ProcessPaymentRequest): Promise<{
    isValid: boolean
    errors: string[]
    warnings: string[]
    estimatedFees: number
    recommendedGateway?: string
  }> {
    const response = await apiClient.post('/payment-processing/validate', data)
    return response.data
  }

  async estimatePaymentFees(amount: number, currency: string, paymentMethod: string, gatewayId?: string): Promise<{
    gatewayFee: number
    processingFee: number
    totalFees: number
    effectiveRate: number
  }> {
    const response = await apiClient.post('/payment-processing/estimate-fees', {
      amount,
      currency,
      paymentMethod,
      gatewayId
    })
    return response.data
  }

  async getPaymentMethodOptions(customerId: string, amount: number, currency: string): Promise<Array<{
    paymentMethodId: string
    type: string
    displayName: string
    isRecommended: boolean
    estimatedFees: number
    processingTime: string
  }>> {
    const response = await apiClient.get('/payment-processing/payment-options', {
      params: { customerId, amount, currency }
    })
    return response.data
  }

  // ========================================
  // FINANCIAL ANALYSIS & DASHBOARDS
  // ========================================

  // Financial Dashboards
  async getFinancialDashboards(): Promise<FinancialDashboard[]> {
    const response = await apiClient.get<FinancialDashboard[]>('/financial-analysis/dashboards')
    return response.data
  }

  async getFinancialDashboard(dashboardId: string): Promise<FinancialDashboard> {
    const response = await apiClient.get<FinancialDashboard>(`/financial-analysis/dashboards/${dashboardId}`)
    return response.data
  }

  async createFinancialDashboard(data: CreateDashboardRequest): Promise<FinancialDashboard> {
    const response = await apiClient.post<FinancialDashboard>('/financial-analysis/dashboards', data)
    return response.data
  }

  async updateFinancialDashboard(dashboardId: string, data: UpdateDashboardRequest): Promise<FinancialDashboard> {
    const response = await apiClient.put<FinancialDashboard>(`/financial-analysis/dashboards/${dashboardId}`, data)
    return response.data
  }

  async deleteFinancialDashboard(dashboardId: string): Promise<void> {
    await apiClient.delete(`/financial-analysis/dashboards/${dashboardId}`)
  }

  async setDefaultDashboard(dashboardId: string): Promise<void> {
    await apiClient.post(`/financial-analysis/dashboards/${dashboardId}/set-default`)
  }

  async duplicateDashboard(dashboardId: string, name: string): Promise<FinancialDashboard> {
    const response = await apiClient.post<FinancialDashboard>(`/financial-analysis/dashboards/${dashboardId}/duplicate`, { name })
    return response.data
  }

  // Financial Analysis
  async getFinancialAnalyses(filters: AnalysisFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<FinancialAnalysis>> {
    const response = await apiClient.get<PaginatedResponse<FinancialAnalysis>>('/financial-analysis/analyses', { params: filters })
    return response.data
  }

  async getFinancialAnalysis(analysisId: string): Promise<FinancialAnalysis> {
    const response = await apiClient.get<FinancialAnalysis>(`/financial-analysis/analyses/${analysisId}`)
    return response.data
  }

  async createFinancialAnalysis(data: CreateAnalysisRequest): Promise<FinancialAnalysis> {
    const response = await apiClient.post<FinancialAnalysis>('/financial-analysis/analyses', data)
    return response.data
  }

  async updateFinancialAnalysis(analysisId: string, data: UpdateAnalysisRequest): Promise<FinancialAnalysis> {
    const response = await apiClient.put<FinancialAnalysis>(`/financial-analysis/analyses/${analysisId}`, data)
    return response.data
  }

  async deleteFinancialAnalysis(analysisId: string): Promise<void> {
    await apiClient.delete(`/financial-analysis/analyses/${analysisId}`)
  }

  async runAnalysis(analysisId: string, dateRange?: DateRange): Promise<AnalysisResults> {
    const response = await apiClient.post<AnalysisResults>(`/financial-analysis/analyses/${analysisId}/run`, { dateRange })
    return response.data
  }

  async exportAnalysis(analysisId: string, format: 'PDF' | 'EXCEL' | 'CSV'): Promise<Blob> {
    const response = await apiClient.post(`/financial-analysis/analyses/${analysisId}/export`, { format }, { responseType: 'blob' })
    return response.data
  }

  // Financial Ratios
  async getFinancialRatios(dateRange: DateRange, ratioTypes?: RatioType[]): Promise<FinancialRatios> {
    const response = await apiClient.post<FinancialRatios>('/financial-analysis/ratios', { dateRange, ratioTypes })
    return response.data
  }

  async getHistoricalRatios(ratioType: RatioType, dateRange: DateRange, frequency: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'): Promise<HistoricalRatio[]> {
    const response = await apiClient.get<HistoricalRatio[]>('/financial-analysis/ratios/historical', {
      params: { ratioType, ...dateRange, frequency }
    })
    return response.data
  }

  async compareRatios(currentPeriod: DateRange, comparisonPeriod: DateRange): Promise<RatioComparison> {
    const response = await apiClient.post<RatioComparison>('/financial-analysis/ratios/compare', {
      currentPeriod,
      comparisonPeriod
    })
    return response.data
  }

  // Budget Management
  async getBudgets(filters: BudgetFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Budget>> {
    const response = await apiClient.get<PaginatedResponse<Budget>>('/financial-analysis/budgets', { params: filters })
    return response.data
  }

  async getBudget(budgetId: string): Promise<Budget> {
    const response = await apiClient.get<Budget>(`/financial-analysis/budgets/${budgetId}`)
    return response.data
  }

  async createBudget(data: CreateBudgetRequest): Promise<Budget> {
    const response = await apiClient.post<Budget>('/financial-analysis/budgets', data)
    return response.data
  }

  async updateBudget(budgetId: string, data: UpdateBudgetRequest): Promise<Budget> {
    const response = await apiClient.put<Budget>(`/financial-analysis/budgets/${budgetId}`, data)
    return response.data
  }

  async deleteBudget(budgetId: string): Promise<void> {
    await apiClient.delete(`/financial-analysis/budgets/${budgetId}`)
  }

  async approveBudget(budgetId: string, comments?: string): Promise<Budget> {
    const response = await apiClient.post<Budget>(`/financial-analysis/budgets/${budgetId}/approve`, { comments })
    return response.data
  }

  async rejectBudget(budgetId: string, reason: string): Promise<Budget> {
    const response = await apiClient.post<Budget>(`/financial-analysis/budgets/${budgetId}/reject`, { reason })
    return response.data
  }

  async getBudgetVariance(budgetId: string, period: DateRange): Promise<BudgetVariance> {
    const response = await apiClient.get<BudgetVariance>(`/financial-analysis/budgets/${budgetId}/variance`, {
      params: period
    })
    return response.data
  }

  async copyBudgetFromPrevious(previousBudgetId: string, targetPeriod: DateRange, adjustmentFactor?: number): Promise<Budget> {
    const response = await apiClient.post<Budget>('/financial-analysis/budgets/copy', {
      previousBudgetId,
      targetPeriod,
      adjustmentFactor
    })
    return response.data
  }

  // Forecasting
  async getForecasts(filters: ForecastFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Forecast>> {
    const response = await apiClient.get<PaginatedResponse<Forecast>>('/financial-analysis/forecasts', { params: filters })
    return response.data
  }

  async getForecast(forecastId: string): Promise<Forecast> {
    const response = await apiClient.get<Forecast>(`/financial-analysis/forecasts/${forecastId}`)
    return response.data
  }

  async createForecast(data: CreateForecastRequest): Promise<Forecast> {
    const response = await apiClient.post<Forecast>('/financial-analysis/forecasts', data)
    return response.data
  }

  async updateForecast(forecastId: string, data: UpdateForecastRequest): Promise<Forecast> {
    const response = await apiClient.put<Forecast>(`/financial-analysis/forecasts/${forecastId}`, data)
    return response.data
  }

  async deleteForecast(forecastId: string): Promise<void> {
    await apiClient.delete(`/financial-analysis/forecasts/${forecastId}`)
  }

  async generateForecast(forecastId: string): Promise<ForecastResults> {
    const response = await apiClient.post<ForecastResults>(`/financial-analysis/forecasts/${forecastId}/generate`)
    return response.data
  }

  async getScenarioAnalysis(forecastId: string, scenarios: ScenarioInput[]): Promise<ScenarioResults> {
    const response = await apiClient.post<ScenarioResults>(`/financial-analysis/forecasts/${forecastId}/scenarios`, { scenarios })
    return response.data
  }

  // Custom Reports
  async getCustomReports(filters: ReportFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<CustomReport>> {
    const response = await apiClient.get<PaginatedResponse<CustomReport>>('/financial-analysis/reports', { params: filters })
    return response.data
  }

  async getCustomReport(reportId: string): Promise<CustomReport> {
    const response = await apiClient.get<CustomReport>(`/financial-analysis/reports/${reportId}`)
    return response.data
  }

  async createCustomReport(data: CreateReportRequest): Promise<CustomReport> {
    const response = await apiClient.post<CustomReport>('/financial-analysis/reports', data)
    return response.data
  }

  async updateCustomReport(reportId: string, data: UpdateReportRequest): Promise<CustomReport> {
    const response = await apiClient.put<CustomReport>(`/financial-analysis/reports/${reportId}`, data)
    return response.data
  }

  async deleteCustomReport(reportId: string): Promise<void> {
    await apiClient.delete(`/financial-analysis/reports/${reportId}`)
  }

  async generateCustomReport(reportId: string, parameters: ReportParameters): Promise<ReportResults> {
    const response = await apiClient.post<ReportResults>(`/financial-analysis/reports/${reportId}/generate`, { parameters })
    return response.data
  }

  async scheduleReport(reportId: string, schedule: ReportSchedule): Promise<ScheduledReport> {
    const response = await apiClient.post<ScheduledReport>(`/financial-analysis/reports/${reportId}/schedule`, { schedule })
    return response.data
  }

  async getScheduledReports(): Promise<ScheduledReport[]> {
    const response = await apiClient.get<ScheduledReport[]>('/financial-analysis/reports/scheduled')
    return response.data
  }

  async updateReportSchedule(scheduleId: string, schedule: Partial<ReportSchedule>): Promise<ScheduledReport> {
    const response = await apiClient.put<ScheduledReport>(`/financial-analysis/reports/scheduled/${scheduleId}`, { schedule })
    return response.data
  }

  async deleteReportSchedule(scheduleId: string): Promise<void> {
    await apiClient.delete(`/financial-analysis/reports/scheduled/${scheduleId}`)
  }

  async exportCustomReport(reportId: string, format: 'PDF' | 'EXCEL' | 'CSV', parameters: ReportParameters): Promise<Blob> {
    const response = await apiClient.post(`/financial-analysis/reports/${reportId}/export`,
      { format, parameters },
      { responseType: 'blob' }
    )
    return response.data
  }

  // Financial Analysis Utilities
  async getAvailableMetrics(): Promise<MetricDefinition[]> {
    const response = await apiClient.get<MetricDefinition[]>('/financial-analysis/metrics')
    return response.data
  }

  async getDataSources(): Promise<DataSource[]> {
    const response = await apiClient.get<DataSource[]>('/financial-analysis/data-sources')
    return response.data
  }

  async validateReportQuery(query: ReportQuery): Promise<{
    isValid: boolean
    errors: string[]
    warnings: string[]
    estimatedRows: number
  }> {
    const response = await apiClient.post('/financial-analysis/validate-query', { query })
    return response.data
  }

  async previewReportData(reportId: string, parameters: ReportParameters, limit: number = 50): Promise<{
    columns: string[]
    data: any[]
    totalRows: number
  }> {
    const response = await apiClient.post(`/financial-analysis/reports/${reportId}/preview`, { parameters, limit })
    return response.data
  }

  // ========================================
  // ADVANCED ANALYTICS & REPORTING
  // ========================================

  // Advanced Analytics Dashboard Methods
  async getAnalyticsDashboards(filters?: any): Promise<any[]> {
    const response = await apiClient.get('/analytics/dashboards', { params: filters })
    return response.data
  }

  async getAnalyticsDashboard(dashboardId: string): Promise<any> {
    const response = await apiClient.get(`/analytics/dashboards/${dashboardId}`)
    return response.data
  }

  async createAnalyticsDashboard(dashboard: any): Promise<any> {
    const response = await apiClient.post('/analytics/dashboards', dashboard)
    return response.data
  }

  async updateAnalyticsDashboard(dashboardId: string, dashboard: any): Promise<any> {
    const response = await apiClient.put(`/analytics/dashboards/${dashboardId}`, dashboard)
    return response.data
  }

  async deleteAnalyticsDashboard(dashboardId: string): Promise<void> {
    await apiClient.delete(`/analytics/dashboards/${dashboardId}`)
  }

  // Dashboard Widget Methods
  async getDashboardWidgets(dashboardId: string): Promise<any[]> {
    const response = await apiClient.get(`/analytics/dashboards/${dashboardId}/widgets`)
    return response.data
  }

  async createDashboardWidget(widget: any): Promise<any> {
    const response = await apiClient.post('/analytics/widgets', widget)
    return response.data
  }

  async updateDashboardWidget(widgetId: string, widget: any): Promise<any> {
    const response = await apiClient.put(`/analytics/widgets/${widgetId}`, widget)
    return response.data
  }

  async deleteDashboardWidget(widgetId: string): Promise<void> {
    await apiClient.delete(`/analytics/widgets/${widgetId}`)
  }

  async getWidgetData(widgetId: string, dateRange?: any): Promise<any> {
    const response = await apiClient.get(`/analytics/widgets/${widgetId}/data`, { params: { dateRange } })
    return response.data
  }

  // KPI Metrics Methods
  async getKPIMetrics(filters?: any): Promise<any[]> {
    const response = await apiClient.get('/analytics/kpis', { params: filters })
    return response.data
  }

  async getKPIMetric(kpiId: string, dateRange?: any): Promise<any> {
    const response = await apiClient.get(`/analytics/kpis/${kpiId}`, { params: { dateRange } })
    return response.data
  }

  async createKPIMetric(kpi: any): Promise<any> {
    const response = await apiClient.post('/analytics/kpis', kpi)
    return response.data
  }

  async updateKPIMetric(kpiId: string, kpi: any): Promise<any> {
    const response = await apiClient.put(`/analytics/kpis/${kpiId}`, kpi)
    return response.data
  }

  async deleteKPIMetric(kpiId: string): Promise<void> {
    await apiClient.delete(`/analytics/kpis/${kpiId}`)
  }

  // Advanced Reports Methods
  async getAdvancedReports(filters?: any): Promise<any[]> {
    const response = await apiClient.get('/analytics/reports', { params: filters })
    return response.data
  }

  async getAdvancedReport(reportId: string): Promise<any> {
    const response = await apiClient.get(`/analytics/reports/${reportId}`)
    return response.data
  }

  async createAdvancedReport(report: any): Promise<any> {
    const response = await apiClient.post('/analytics/reports', report)
    return response.data
  }

  async updateAdvancedReport(reportId: string, report: any): Promise<any> {
    const response = await apiClient.put(`/analytics/reports/${reportId}`, report)
    return response.data
  }

  async deleteAdvancedReport(reportId: string): Promise<void> {
    await apiClient.delete(`/analytics/reports/${reportId}`)
  }

  async generateAdvancedReport(reportId: string, parameters?: any): Promise<any> {
    const response = await apiClient.post(`/analytics/reports/${reportId}/generate`, { parameters })
    return response.data
  }

  async exportAdvancedReport(reportId: string, format: string, parameters?: any): Promise<Blob> {
    const response = await apiClient.post(
      `/analytics/reports/${reportId}/export`,
      { format, parameters },
      { responseType: 'blob' }
    )
    return response.data
  }

  // Data Source Connection Methods
  async getDataSourceConnections(): Promise<any[]> {
    const response = await apiClient.get('/analytics/data-sources')
    return response.data
  }

  async createDataSourceConnection(dataSource: any): Promise<any> {
    const response = await apiClient.post('/analytics/data-sources', dataSource)
    return response.data
  }

  async updateDataSourceConnection(connectionId: string, dataSource: any): Promise<any> {
    const response = await apiClient.put(`/analytics/data-sources/${connectionId}`, dataSource)
    return response.data
  }

  async deleteDataSourceConnection(connectionId: string): Promise<void> {
    await apiClient.delete(`/analytics/data-sources/${connectionId}`)
  }

  async testDataSourceConnection(connectionId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`/analytics/data-sources/${connectionId}/test`)
    return response.data
  }

  // AI Insights Methods
  async getAIInsights(context?: any): Promise<any[]> {
    const response = await apiClient.get('/analytics/ai-insights', { params: context })
    return response.data
  }

  async generateAIInsight(context: any): Promise<any> {
    const response = await apiClient.post('/analytics/ai-insights/generate', context)
    return response.data
  }

  // Analytics Preferences Methods
  async getAnalyticsPreferences(): Promise<any> {
    const response = await apiClient.get('/analytics/preferences')
    return response.data
  }

  async updateAnalyticsPreferences(preferences: any): Promise<any> {
    const response = await apiClient.put('/analytics/preferences', preferences)
    return response.data
  }

  // Analytics Search and Utilities
  async searchAnalytics(query: string, filters?: any): Promise<any> {
    const response = await apiClient.get('/analytics/search', { params: { query, ...filters } })
    return response.data
  }

  async bulkExportAnalytics(options: any): Promise<Blob> {
    const response = await apiClient.post('/analytics/bulk-export', options, { responseType: 'blob' })
    return response.data
  }

  async getAnalyticsAuditLog(filters?: any): Promise<any[]> {
    const response = await apiClient.get('/analytics/audit-log', { params: filters })
    return response.data
  }
}

export const apiService = new APIService()