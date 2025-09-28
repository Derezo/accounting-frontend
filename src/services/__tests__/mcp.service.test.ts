import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mcpService } from '../mcp.service'
import { apiClient } from '@/lib/axios'
import { server } from '@/lib/test-setup'
import { mcpHandlers } from '@/lib/test-mocks'
import {
  expectFinancialEquals,
  createMockApiResponse,
  createMockPaginatedResponse,
} from '@/lib/test-utils'

// Mock the API client
vi.mock('@/lib/axios', () => ({
  apiClient: {
    post: vi.fn(),
  },
}))

const mockApiClient = apiClient as any

describe('MCPService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    server.use(...mcpHandlers)
  })

  describe('customer operations', () => {
    it('should create customer successfully', async () => {
      const customerData = {
        type: 'BUSINESS' as const,
        email: 'business@example.com',
        businessName: 'Test Business',
        phone: '+1-555-0100',
      }

      const mockResponse = createMockApiResponse({
        id: 'customer-1',
        ...customerData,
      })

      mockApiClient.post.mockResolvedValue({ data: mockResponse })

      const result = await mcpService.createCustomer(customerData)

      expect(mockApiClient.post).toHaveBeenCalledWith('/mcp/tools/call', {
        tool: 'create_customer_profile',
        parameters: customerData,
      })
      expect(result.email).toBe(customerData.email)
    })

    it('should find customers with filters', async () => {
      const filters = {
        search: 'test',
        type: 'BUSINESS' as const,
        page: 1,
        limit: 10,
      }

      const mockCustomers = [
        { id: 'customer-1', email: 'test1@example.com' },
        { id: 'customer-2', email: 'test2@example.com' },
      ]

      const mockResponse = createMockApiResponse(
        createMockPaginatedResponse(mockCustomers, 1, 10)
      )

      mockApiClient.post.mockResolvedValue({ data: mockResponse })

      const result = await mcpService.findCustomers(filters)

      expect(mockApiClient.post).toHaveBeenCalledWith('/mcp/tools/call', {
        tool: 'find_customer',
        parameters: filters,
      })
      expect(result.data).toHaveLength(2)
      expect(result.pagination.page).toBe(1)
    })

    it('should get customer by ID', async () => {
      const customerId = 'customer-1'
      const mockCustomer = { id: customerId, email: 'test@example.com' }
      const mockResponse = createMockApiResponse(mockCustomer)

      mockApiClient.post.mockResolvedValue({ data: mockResponse })

      const result = await mcpService.getCustomer(customerId)

      expect(mockApiClient.post).toHaveBeenCalledWith('/mcp/tools/call', {
        tool: 'get_customer_overview',
        parameters: { customerId },
      })
      expect(result.id).toBe(customerId)
    })

    it('should update customer', async () => {
      const customerId = 'customer-1'
      const updateData = { email: 'updated@example.com' }
      const mockResponse = createMockApiResponse({
        id: customerId,
        ...updateData,
      })

      mockApiClient.post.mockResolvedValue({ data: mockResponse })

      const result = await mcpService.updateCustomer(customerId, updateData)

      expect(mockApiClient.post).toHaveBeenCalledWith('/mcp/tools/call', {
        tool: 'update_customer_profile',
        parameters: { customerId, ...updateData },
      })
      expect(result.email).toBe(updateData.email)
    })

    it('should delete customer', async () => {
      const customerId = 'customer-1'
      const mockResponse = createMockApiResponse(undefined)

      mockApiClient.post.mockResolvedValue({ data: mockResponse })

      await mcpService.deleteCustomer(customerId)

      expect(mockApiClient.post).toHaveBeenCalledWith('/mcp/tools/call', {
        tool: 'delete_customer',
        parameters: { customerId },
      })
    })
  })

  describe('quote operations', () => {
    it('should create quote with financial calculations', async () => {
      const quoteData = {
        customerId: 'customer-1',
        items: [
          {
            description: 'Web Development',
            quantity: 40,
            unitPrice: 125.00,
            total: 5000.00,
          },
          {
            description: 'Design Services',
            quantity: 20,
            unitPrice: 100.00,
            total: 2000.00,
          },
        ],
        validUntil: '2024-02-15',
        notes: 'Custom web development project',
        terms: 'Payment due within 30 days',
      }

      const expectedSubtotal = 7000.00
      const expectedTaxRate = 0.12
      const expectedTaxAmount = 840.00
      const expectedTotal = 7840.00

      const mockQuote = {
        id: 'quote-1',
        customerId: quoteData.customerId,
        items: quoteData.items,
        subtotal: expectedSubtotal,
        taxRate: expectedTaxRate,
        taxAmount: expectedTaxAmount,
        total: expectedTotal,
      }

      const mockResponse = createMockApiResponse(mockQuote)
      mockApiClient.post.mockResolvedValue({ data: mockResponse })

      const result = await mcpService.createQuote(quoteData)

      expect(mockApiClient.post).toHaveBeenCalledWith('/mcp/tools/call', {
        tool: 'create_quote_from_requirements',
        parameters: expect.objectContaining({
          customerSearch: quoteData.customerId,
          items: quoteData.items,
          notes: quoteData.notes,
          terms: quoteData.terms,
        }),
      })

      // Verify financial calculations are correct
      expectFinancialEquals(result.subtotal, expectedSubtotal)
      expectFinancialEquals(result.taxAmount, expectedTaxAmount)
      expectFinancialEquals(result.total, expectedTotal)
    })

    it('should send quote to customer', async () => {
      const quoteId = 'quote-1'
      const recipientEmail = 'customer@example.com'
      const mockResponse = createMockApiResponse(undefined)

      mockApiClient.post.mockResolvedValue({ data: mockResponse })

      await mcpService.sendQuote(quoteId, recipientEmail)

      expect(mockApiClient.post).toHaveBeenCalledWith('/mcp/tools/call', {
        tool: 'send_quote_to_customer',
        parameters: { quoteId, recipientEmail },
      })
    })

    it('should track quote status', async () => {
      const quoteId = 'quote-1'
      const mockQuote = {
        id: quoteId,
        status: 'VIEWED',
        viewedAt: '2024-01-16T10:00:00.000Z',
      }

      const mockResponse = createMockApiResponse(mockQuote)
      mockApiClient.post.mockResolvedValue({ data: mockResponse })

      const result = await mcpService.trackQuoteStatus(quoteId)

      expect(mockApiClient.post).toHaveBeenCalledWith('/mcp/tools/call', {
        tool: 'track_quote_status',
        parameters: { quoteId },
      })
      expect(result.status).toBe('VIEWED')
    })
  })

  describe('invoice operations', () => {
    it('should create invoice from quote', async () => {
      const invoiceData = {
        quoteId: 'quote-1',
        dueDate: '2024-02-14',
        notes: 'Thank you for your business',
        terms: 'Payment due within 30 days',
      }

      const mockInvoice = {
        id: 'invoice-1',
        quoteId: invoiceData.quoteId,
        dueDate: invoiceData.dueDate,
        subtotal: 5000.00,
        taxAmount: 600.00,
        total: 5600.00,
        status: 'DRAFT',
      }

      const mockResponse = createMockApiResponse(mockInvoice)
      mockApiClient.post.mockResolvedValue({ data: mockResponse })

      const result = await mcpService.createInvoice(invoiceData)

      expect(mockApiClient.post).toHaveBeenCalledWith('/mcp/tools/call', {
        tool: 'generate_invoice_from_quote',
        parameters: invoiceData,
      })
      expect(result.quoteId).toBe(invoiceData.quoteId)
      expectFinancialEquals(result.total, 5600.00)
    })

    it('should create standalone invoice', async () => {
      const invoiceData = {
        customerId: 'customer-1',
        items: [
          {
            description: 'Consulting Services',
            quantity: 10,
            unitPrice: 150.00,
            total: 1500.00,
          },
        ],
        dueDate: '2024-02-14',
      }

      const mockInvoice = {
        id: 'invoice-1',
        customerId: invoiceData.customerId,
        items: invoiceData.items,
        subtotal: 1500.00,
        taxAmount: 180.00,
        total: 1680.00,
      }

      const mockResponse = createMockApiResponse(mockInvoice)
      mockApiClient.post.mockResolvedValue({ data: mockResponse })

      const result = await mcpService.createInvoice(invoiceData)

      expect(mockApiClient.post).toHaveBeenCalledWith('/mcp/tools/call', {
        tool: 'create_invoice',
        parameters: invoiceData,
      })
      expectFinancialEquals(result.total, 1680.00)
    })

    it('should send invoice to customer', async () => {
      const invoiceId = 'invoice-1'
      const recipientEmail = 'customer@example.com'
      const mockResponse = createMockApiResponse(undefined)

      mockApiClient.post.mockResolvedValue({ data: mockResponse })

      await mcpService.sendInvoice(invoiceId, recipientEmail)

      expect(mockApiClient.post).toHaveBeenCalledWith('/mcp/tools/call', {
        tool: 'send_invoice_to_customer',
        parameters: { invoiceId, recipientEmail },
      })
    })
  })

  describe('payment operations', () => {
    it('should process payment with correct amount verification', async () => {
      const paymentData = {
        invoiceId: 'invoice-1',
        amount: 5600.00,
        method: 'BANK_TRANSFER' as const,
        transactionId: 'txn_test123',
      }

      const mockPayment = {
        id: 'payment-1',
        ...paymentData,
        status: 'COMPLETED',
        processedAt: '2024-01-16T10:00:00.000Z',
      }

      const mockResponse = createMockApiResponse(mockPayment)
      mockApiClient.post.mockResolvedValue({ data: mockResponse })

      const result = await mcpService.createPayment(paymentData)

      expect(mockApiClient.post).toHaveBeenCalledWith('/mcp/tools/call', {
        tool: 'process_payment_workflow',
        parameters: paymentData,
      })

      expectFinancialEquals(result.amount, paymentData.amount)
      expect(result.status).toBe('COMPLETED')
    })

    it('should track payment status', async () => {
      const paymentId = 'payment-1'
      const mockPayment = {
        id: paymentId,
        status: 'PROCESSING',
        amount: 5600.00,
      }

      const mockResponse = createMockApiResponse(mockPayment)
      mockApiClient.post.mockResolvedValue({ data: mockResponse })

      const result = await mcpService.trackPaymentStatus(paymentId)

      expect(mockApiClient.post).toHaveBeenCalledWith('/mcp/tools/call', {
        tool: 'track_payment_status',
        parameters: { paymentId },
      })
      expect(result.status).toBe('PROCESSING')
    })
  })

  describe('analytics and reporting', () => {
    it('should generate revenue analytics', async () => {
      const mockAnalytics = [
        {
          period: '2024-01',
          revenue: 10000.00,
          expenses: 2000.00,
          profit: 8000.00,
          invoiceCount: 5,
          paymentCount: 4,
        },
        {
          period: '2024-02',
          revenue: 12000.00,
          expenses: 2500.00,
          profit: 9500.00,
          invoiceCount: 6,
          paymentCount: 5,
        },
      ]

      const mockResponse = createMockApiResponse(mockAnalytics)
      mockApiClient.post.mockResolvedValue({ data: mockResponse })

      const result = await mcpService.getRevenueAnalytics('monthly')

      expect(mockApiClient.post).toHaveBeenCalledWith('/mcp/tools/call', {
        tool: 'generate_financial_reports',
        parameters: { reportType: 'revenue', period: 'monthly' },
      })

      expect(result).toHaveLength(2)
      expectFinancialEquals(result[0].profit, 8000.00)
      expectFinancialEquals(result[1].profit, 9500.00)
    })

    it('should detect billing anomalies', async () => {
      const mockAnomalies = [
        {
          type: 'unusual_amount',
          invoiceId: 'invoice-123',
          amount: 50000.00,
          reason: 'Amount significantly higher than usual',
        },
        {
          type: 'overdue_payment',
          invoiceId: 'invoice-124',
          daysPastDue: 45,
          reason: 'Payment overdue by more than 30 days',
        },
      ]

      const mockResponse = createMockApiResponse(mockAnomalies)
      mockApiClient.post.mockResolvedValue({ data: mockResponse })

      const result = await mcpService.detectBillingAnomalies()

      expect(mockApiClient.post).toHaveBeenCalledWith('/mcp/tools/call', {
        tool: 'detect_billing_anomalies',
        parameters: {},
      })

      expect(result).toHaveLength(2)
      expect(result[0].type).toBe('unusual_amount')
      expect(result[1].type).toBe('overdue_payment')
    })
  })

  describe('complete workflow operations', () => {
    it('should create complete customer and quote workflow', async () => {
      const workflowData = {
        customer: {
          type: 'BUSINESS' as const,
          email: 'newclient@example.com',
          businessName: 'New Client Corp',
        },
        quote: {
          items: [
            {
              description: 'Project Setup',
              quantity: 1,
              unitPrice: 1000.00,
              total: 1000.00,
            },
          ],
          validUntil: '2024-02-15',
        },
        autoSend: true,
      }

      const mockCustomer = { id: 'customer-new', ...workflowData.customer }
      const mockQuote = { id: 'quote-new', customerId: 'customer-new' }

      // Mock the individual service calls
      mockApiClient.post
        .mockResolvedValueOnce({ data: createMockApiResponse(mockCustomer) })
        .mockResolvedValueOnce({ data: createMockApiResponse(mockQuote) })
        .mockResolvedValueOnce({ data: createMockApiResponse(undefined) })

      const result = await mcpService.createCompleteWorkflow(workflowData)

      expect(result.customer.id).toBe('customer-new')
      expect(result.quote.customerId).toBe('customer-new')

      // Verify all service calls were made
      expect(mockApiClient.post).toHaveBeenCalledTimes(3) // create customer, create quote, send quote
    })
  })

  describe('error handling', () => {
    it('should handle MCP tool call failures', async () => {
      const errorResponse = {
        success: false,
        message: 'Tool execution failed',
        errors: ['Invalid customer ID'],
      }

      mockApiClient.post.mockResolvedValue({ data: errorResponse })

      await expect(mcpService.getCustomer('invalid-id'))
        .rejects.toThrow('Tool execution failed')
    })

    it('should handle network errors', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Network error'))

      await expect(mcpService.getCustomer('customer-1'))
        .rejects.toThrow('Network error')
    })

    it('should handle server error responses', async () => {
      const serverError = {
        response: {
          data: { message: 'Internal server error' },
        },
      }

      mockApiClient.post.mockRejectedValue(serverError)

      await expect(mcpService.getCustomer('customer-1'))
        .rejects.toThrow('Internal server error')
    })
  })

  describe('smart search functionality', () => {
    it('should perform smart search across multiple entities', async () => {
      const query = 'test company'
      const mockSearchResults = {
        customers: [{ id: 'customer-1', businessName: 'Test Company' }],
        quotes: [{ id: 'quote-1', customer: { businessName: 'Test Company' } }],
        invoices: [{ id: 'invoice-1', customer: { businessName: 'Test Company' } }],
        payments: [],
      }

      // Mock multiple service calls
      mockApiClient.post
        .mockResolvedValueOnce({
          data: createMockApiResponse(createMockPaginatedResponse(mockSearchResults.customers))
        })
        .mockResolvedValueOnce({
          data: createMockApiResponse(createMockPaginatedResponse(mockSearchResults.quotes))
        })
        .mockResolvedValueOnce({
          data: createMockApiResponse(createMockPaginatedResponse(mockSearchResults.invoices))
        })
        .mockResolvedValueOnce({
          data: createMockApiResponse(createMockPaginatedResponse(mockSearchResults.payments))
        })

      const result = await mcpService.smartSearch(query)

      expect(result.customers).toHaveLength(1)
      expect(result.quotes).toHaveLength(1)
      expect(result.invoices).toHaveLength(1)
      expect(result.payments).toHaveLength(0)
    })
  })
})