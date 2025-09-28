import { http, HttpResponse } from 'msw'
import {
  User,
  LoginResponse,
  RegisterResponse,
  RefreshTokenResponse,
  UserRole,
} from '@/types/auth'
import {
  Customer,
  Quote,
  Invoice,
  Payment,
  PaginatedResponse,
  CustomerType,
  QuoteStatus,
  InvoiceStatus,
  PaymentStatus,
  PaymentMethod,
} from '@/types/api'
import { createMockUser, createMockTokens, createMockPaginatedResponse } from './test-utils'

// Mock data factories
const createMockCustomer = (overrides: Partial<Customer> = {}): Customer => ({
  id: 'customer-1',
  type: 'BUSINESS' as CustomerType,
  email: 'customer@example.com',
  phone: '+1-555-0100',
  address: {
    street: '123 Business St',
    city: 'Business City',
    province: 'BC',
    postalCode: 'V1A 1A1',
    country: 'Canada',
  },
  business: {
    businessName: 'Test Business Inc',
    legalName: 'Test Business Incorporated',
    businessType: 'CORPORATION',
    website: 'https://testbusiness.com',
    industry: 'Technology',
    taxId: '123456789',
    registrationNumber: 'BC1234567',
  },
  tier: 'SMALL_BUSINESS',
  status: 'ACTIVE',
  tags: ['tech', 'software'],
  notes: 'Test customer for development',
  organizationId: 'test-org-id',
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:00:00.000Z',
  ...overrides,
})

const createMockQuote = (overrides: Partial<Quote> = {}): Quote => ({
  id: 'quote-1',
  quoteNumber: 'Q-2024-001',
  customerId: 'customer-1',
  customer: createMockCustomer(),
  items: [
    {
      id: 'item-1',
      description: 'Web Development Services',
      quantity: 40,
      unitPrice: 125.00,
      total: 5000.00,
    },
  ],
  subtotal: 5000.00,
  taxRate: 0.12,
  taxAmount: 600.00,
  total: 5600.00,
  status: 'DRAFT' as QuoteStatus,
  validUntil: '2024-02-15',
  notes: 'Development of company website',
  terms: 'Payment due within 30 days',
  organizationId: 'test-org-id',
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:00:00.000Z',
  ...overrides,
})

const createMockInvoice = (overrides: Partial<Invoice> = {}): Invoice => ({
  id: 'invoice-1',
  invoiceNumber: 'INV-2024-001',
  customerId: 'customer-1',
  customer: createMockCustomer(),
  quoteId: 'quote-1',
  items: [
    {
      id: 'item-1',
      description: 'Web Development Services',
      quantity: 40,
      unitPrice: 125.00,
      total: 5000.00,
    },
  ],
  subtotal: 5000.00,
  taxRate: 0.12,
  taxAmount: 600.00,
  total: 5600.00,
  status: 'SENT' as InvoiceStatus,
  issueDate: '2024-01-15',
  dueDate: '2024-02-14',
  paidAmount: 0,
  notes: 'Thank you for your business',
  terms: 'Payment due within 30 days',
  organizationId: 'test-org-id',
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:00:00.000Z',
  ...overrides,
})

const createMockPayment = (overrides: Partial<Payment> = {}): Payment => ({
  id: 'payment-1',
  paymentNumber: 'PAY-2024-001',
  invoiceId: 'invoice-1',
  invoice: createMockInvoice(),
  amount: 5600.00,
  method: 'BANK_TRANSFER' as PaymentMethod,
  status: 'COMPLETED' as PaymentStatus,
  transactionId: 'txn_test123',
  processedAt: '2024-01-16T10:00:00.000Z',
  notes: 'Payment received via bank transfer',
  organizationId: 'test-org-id',
  createdAt: '2024-01-16T10:00:00.000Z',
  updatedAt: '2024-01-16T10:00:00.000Z',
  ...overrides,
})

// Auth API handlers
export const authHandlers = [
  // Login
  http.post('*/api/v1/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string }

    // Simulate login validation
    if (body.email === 'test@example.com' && body.password === 'password') {
      const response: LoginResponse = {
        user: createMockUser(),
        tokens: createMockTokens(),
      }
      return HttpResponse.json(response)
    }

    return HttpResponse.json(
      { message: 'Invalid email or password' },
      { status: 401 }
    )
  }),

  // Register
  http.post('*/api/v1/auth/register', async ({ request }) => {
    const body = await request.json() as any
    const response: RegisterResponse = {
      user: createMockUser({
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        organizationName: body.organizationName,
      }),
      tokens: createMockTokens(),
    }
    return HttpResponse.json(response)
  }),

  // Refresh token
  http.post('*/api/v1/auth/refresh', async () => {
    const response: RefreshTokenResponse = {
      tokens: createMockTokens(),
    }
    return HttpResponse.json(response)
  }),

  // Get current user
  http.get('*/api/v1/auth/profile', () => {
    return HttpResponse.json({
      user: createMockUser(),
    })
  }),

  // Logout
  http.post('*/api/v1/auth/logout', () => {
    return HttpResponse.json({ message: 'Logged out successfully' })
  }),
]

// MCP API handlers
export const mcpHandlers = [
  // Customer operations
  http.post('*/api/v1/mcp/tools/call', async ({ request }) => {
    const body = await request.json() as { tool: string; parameters: any }
    const { tool, parameters } = body

    switch (tool) {
      case 'create_customer_profile':
        return HttpResponse.json({
          success: true,
          data: createMockCustomer({
            email: parameters.email,
            business: { businessName: parameters.businessName },
          }),
        })

      case 'find_customer': {
        const customers = [createMockCustomer(), createMockCustomer({ id: 'customer-2' })]
        return HttpResponse.json({
          success: true,
          data: createMockPaginatedResponse(customers, parameters.page, parameters.limit),
        })
      }

      case 'get_customer_overview':
        return HttpResponse.json({
          success: true,
          data: createMockCustomer({ id: parameters.customerId }),
        })

      case 'update_customer_profile':
        return HttpResponse.json({
          success: true,
          data: createMockCustomer({
            id: parameters.customerId,
            ...parameters,
          }),
        })

      case 'delete_customer':
        return HttpResponse.json({
          success: true,
          message: 'Customer deleted successfully',
        })

      // Quote operations
      case 'create_quote_from_requirements':
        return HttpResponse.json({
          success: true,
          data: createMockQuote({
            customerId: parameters.customerSearch,
            items: parameters.items || [],
          }),
        })

      case 'find_quotes': {
        const quotes = [createMockQuote(), createMockQuote({ id: 'quote-2' })]
        return HttpResponse.json({
          success: true,
          data: createMockPaginatedResponse(quotes, parameters.page, parameters.limit),
        })
      }

      case 'get_quote_details':
        return HttpResponse.json({
          success: true,
          data: createMockQuote({ id: parameters.quoteId }),
        })

      case 'update_quote':
        return HttpResponse.json({
          success: true,
          data: createMockQuote({ id: parameters.quoteId, ...parameters }),
        })

      case 'send_quote_to_customer':
        return HttpResponse.json({
          success: true,
          message: 'Quote sent successfully',
        })

      // Invoice operations
      case 'create_invoice':
      case 'generate_invoice_from_quote':
        return HttpResponse.json({
          success: true,
          data: createMockInvoice({
            quoteId: parameters.quoteId,
            customerId: parameters.customerId,
          }),
        })

      case 'find_invoices': {
        const invoices = [createMockInvoice(), createMockInvoice({ id: 'invoice-2' })]
        return HttpResponse.json({
          success: true,
          data: createMockPaginatedResponse(invoices, parameters.page, parameters.limit),
        })
      }

      case 'get_invoice_details':
        return HttpResponse.json({
          success: true,
          data: createMockInvoice({ id: parameters.invoiceId }),
        })

      case 'send_invoice_to_customer':
        return HttpResponse.json({
          success: true,
          message: 'Invoice sent successfully',
        })

      // Payment operations
      case 'process_payment_workflow':
        return HttpResponse.json({
          success: true,
          data: createMockPayment({
            invoiceId: parameters.invoiceId,
            amount: parameters.amount,
            method: parameters.method,
          }),
        })

      case 'find_payments': {
        const payments = [createMockPayment(), createMockPayment({ id: 'payment-2' })]
        return HttpResponse.json({
          success: true,
          data: createMockPaginatedResponse(payments, parameters.page, parameters.limit),
        })
      }

      case 'get_payment_details':
        return HttpResponse.json({
          success: true,
          data: createMockPayment({ id: parameters.paymentId }),
        })

      // Analytics operations
      case 'generate_financial_reports':
        return HttpResponse.json({
          success: true,
          data: [
            {
              period: '2024-01',
              revenue: 10000,
              expenses: 2000,
              profit: 8000,
              invoiceCount: 5,
              paymentCount: 4,
            },
          ],
        })

      case 'analyze_customer_patterns':
        return HttpResponse.json({
          success: true,
          data: {
            totalCustomers: 25,
            newThisMonth: 3,
            topCustomers: [createMockCustomer()],
            averageValue: 2500.00,
          },
        })

      default:
        return HttpResponse.json(
          { success: false, message: `Unknown tool: ${tool}` },
          { status: 400 }
        )
    }
  }),
]

// Error simulation handlers
export const errorHandlers = [
  // Network error simulation
  http.post('*/api/v1/auth/login', () => {
    return HttpResponse.error()
  }),

  // Server error simulation
  http.post('*/api/v1/mcp/tools/call', () => {
    return HttpResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }),
]

// Default handlers for normal operation
export const handlers = [...authHandlers, ...mcpHandlers]

// Role-based response helpers
export const createRoleBasedHandler = (
  endpoint: string,
  requiredRole: UserRole,
  handler: () => HttpResponse
) => {
  return http.post(endpoint, ({ request }) => {
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return HttpResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }

    // In real tests, you'd decode the JWT and check the role
    // For now, we'll assume the test provides the correct role context
    return handler()
  })
}

// Test data access
export const testData = {
  users: {
    employee: createMockUser({ role: 'EMPLOYEE' }),
    admin: createMockUser({ role: 'ADMIN' }),
    manager: createMockUser({ role: 'MANAGER' }),
  },
  customers: [createMockCustomer()],
  quotes: [createMockQuote()],
  invoices: [createMockInvoice()],
  payments: [createMockPayment()],
}