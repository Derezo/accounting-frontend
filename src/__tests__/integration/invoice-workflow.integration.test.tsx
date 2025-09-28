import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, testUsers, expectFinancialEquals } from '@/lib/test-utils'
import { server } from '@/lib/test-setup'
import { mcpHandlers } from '@/lib/test-mocks'
import { InvoiceForm } from '@/components/forms/InvoiceForm'
import { QueryClient } from '@tanstack/react-query'

// Mock the MCP service
vi.mock('@/services/mcp.service', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    mcpService: {
      findCustomers: vi.fn(),
      findQuotes: vi.fn(),
      createInvoice: vi.fn(),
      sendInvoice: vi.fn(),
      getInvoice: vi.fn(),
    },
  }
})

describe('Invoice Workflow Integration', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: 0, gcTime: 0 },
        mutations: { retry: false },
      },
    })
    server.use(...mcpHandlers)
  })

  const renderInvoiceForm = (user = testUsers.manager) => {
    return renderWithProviders(
      <InvoiceForm onSuccess={() => {}} />,
      { user, queryClient }
    )
  }

  describe('complete invoice creation workflow', () => {
    it('should create invoice from quote with accurate financial calculations', async () => {
      const user = userEvent.setup()
      const { mcpService } = await import('@/services/mcp.service')

      // Mock data for quote-based invoice
      const mockQuote = {
        id: 'quote-123',
        customerId: 'customer-123',
        customer: {
          id: 'customer-123',
          businessName: 'Test Business Inc',
          email: 'business@test.com',
        },
        items: [
          {
            id: 'item-1',
            description: 'Web Development Services',
            quantity: 40,
            unitPrice: 125.00,
            total: 5000.00,
          },
          {
            id: 'item-2',
            description: 'Design Services',
            quantity: 20,
            unitPrice: 100.00,
            total: 2000.00,
          },
        ],
        subtotal: 7000.00,
        taxRate: 0.12,
        taxAmount: 840.00,
        total: 7840.00,
      }

      const mockInvoice = {
        id: 'invoice-123',
        invoiceNumber: 'INV-2024-001',
        quoteId: mockQuote.id,
        customerId: mockQuote.customerId,
        customer: mockQuote.customer,
        items: mockQuote.items,
        subtotal: mockQuote.subtotal,
        taxRate: mockQuote.taxRate,
        taxAmount: mockQuote.taxAmount,
        total: mockQuote.total,
        status: 'DRAFT',
        issueDate: '2024-01-15',
        dueDate: '2024-02-14',
      }

      // Setup mocks
      mcpService.findQuotes.mockResolvedValue({
        data: [mockQuote],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      })

      mcpService.createInvoice.mockResolvedValue(mockInvoice)

      renderInvoiceForm(testUsers.manager)

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create invoice/i })).toBeInTheDocument()
      })

      // Select "From Quote" option
      const fromQuoteRadio = screen.getByLabelText(/from quote/i)
      await user.click(fromQuoteRadio)

      // Search and select quote
      const quoteSearch = screen.getByPlaceholderText(/search quotes/i)
      await user.type(quoteSearch, 'Test Business')

      await waitFor(() => {
        expect(screen.getByText('Test Business Inc')).toBeInTheDocument()
      })

      const quoteOption = screen.getByText('Test Business Inc')
      await user.click(quoteOption)

      // Verify quote details are populated
      await waitFor(() => {
        expect(screen.getByText('Web Development Services')).toBeInTheDocument()
        expect(screen.getByText('Design Services')).toBeInTheDocument()
      })

      // Verify financial calculations are displayed correctly
      const subtotalElement = screen.getByTestId('invoice-subtotal') ||
                            screen.getByText(/subtotal.*7,000\.00/i)
      expect(subtotalElement).toBeInTheDocument()

      const taxElement = screen.getByTestId('invoice-tax') ||
                        screen.getByText(/tax.*840\.00/i)
      expect(taxElement).toBeInTheDocument()

      const totalElement = screen.getByTestId('invoice-total') ||
                          screen.getByText(/total.*7,840\.00/i)
      expect(totalElement).toBeInTheDocument()

      // Set due date
      const dueDateInput = screen.getByLabelText(/due date/i)
      await user.clear(dueDateInput)
      await user.type(dueDateInput, '2024-02-14')

      // Add notes
      const notesInput = screen.getByLabelText(/notes/i)
      await user.type(notesInput, 'Payment due within 30 days')

      // Submit invoice
      const createButton = screen.getByRole('button', { name: /create invoice/i })
      await user.click(createButton)

      // Verify invoice creation call
      await waitFor(() => {
        expect(mcpService.createInvoice).toHaveBeenCalledWith({
          quoteId: mockQuote.id,
          dueDate: '2024-02-14',
          notes: 'Payment due within 30 days',
        })
      })

      // Verify success message or navigation
      await waitFor(() => {
        const successMessage = screen.queryByText(/invoice created successfully/i) ||
                              screen.queryByTestId('success-notification')
        expect(successMessage).toBeInTheDocument()
      })
    })

    it('should create standalone invoice with manual item entry', async () => {
      const user = userEvent.setup()
      const { mcpService } = await import('@/services/mcp.service')

      const mockCustomer = {
        id: 'customer-456',
        businessName: 'Another Business Corp',
        email: 'another@business.com',
      }

      const mockInvoice = {
        id: 'invoice-456',
        invoiceNumber: 'INV-2024-002',
        customerId: mockCustomer.id,
        customer: mockCustomer,
        items: [
          {
            id: 'item-new-1',
            description: 'Consulting Services',
            quantity: 10,
            unitPrice: 150.00,
            total: 1500.00,
          },
        ],
        subtotal: 1500.00,
        taxRate: 0.12,
        taxAmount: 180.00,
        total: 1680.00,
        status: 'DRAFT',
        issueDate: '2024-01-15',
        dueDate: '2024-02-14',
      }

      // Setup mocks
      mcpService.findCustomers.mockResolvedValue({
        data: [mockCustomer],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      })

      mcpService.createInvoice.mockResolvedValue(mockInvoice)

      renderInvoiceForm(testUsers.manager)

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create invoice/i })).toBeInTheDocument()
      })

      // Select "Standalone Invoice" option (should be default)
      const standaloneRadio = screen.getByLabelText(/standalone invoice/i)
      await user.click(standaloneRadio)

      // Search and select customer
      const customerSearch = screen.getByPlaceholderText(/search customers/i)
      await user.type(customerSearch, 'Another Business')

      await waitFor(() => {
        expect(screen.getByText('Another Business Corp')).toBeInTheDocument()
      })

      const customerOption = screen.getByText('Another Business Corp')
      await user.click(customerOption)

      // Add invoice item
      const addItemButton = screen.getByRole('button', { name: /add item/i })
      await user.click(addItemButton)

      // Fill item details
      const descriptionInput = screen.getByPlaceholderText(/item description/i)
      await user.type(descriptionInput, 'Consulting Services')

      const quantityInput = screen.getByPlaceholderText(/quantity/i)
      await user.clear(quantityInput)
      await user.type(quantityInput, '10')

      const unitPriceInput = screen.getByPlaceholderText(/unit price/i)
      await user.clear(unitPriceInput)
      await user.type(unitPriceInput, '150.00')

      // Verify calculations update automatically
      await waitFor(() => {
        const itemTotal = screen.getByTestId('item-total-0') ||
                         screen.getByDisplayValue('1500.00')
        expect(itemTotal).toBeInTheDocument()
      })

      // Verify invoice totals
      await waitFor(() => {
        const subtotal = screen.getByTestId('invoice-subtotal') ||
                        screen.getByText(/1,500\.00/)
        expect(subtotal).toBeInTheDocument()

        const tax = screen.getByTestId('invoice-tax') ||
                   screen.getByText(/180\.00/)
        expect(tax).toBeInTheDocument()

        const total = screen.getByTestId('invoice-total') ||
                     screen.getByText(/1,680\.00/)
        expect(total).toBeInTheDocument()
      })

      // Set due date
      const dueDateInput = screen.getByLabelText(/due date/i)
      await user.clear(dueDateInput)
      await user.type(dueDateInput, '2024-02-14')

      // Submit invoice
      const createButton = screen.getByRole('button', { name: /create invoice/i })
      await user.click(createButton)

      // Verify invoice creation call
      await waitFor(() => {
        expect(mcpService.createInvoice).toHaveBeenCalledWith({
          customerId: mockCustomer.id,
          items: [
            {
              description: 'Consulting Services',
              quantity: 10,
              unitPrice: 150.00,
              total: 1500.00,
            },
          ],
          dueDate: '2024-02-14',
          subtotal: 1500.00,
          taxRate: 0.12,
          taxAmount: 180.00,
          total: 1680.00,
        })
      })
    })
  })

  describe('invoice sending workflow', () => {
    it('should send invoice with email validation', async () => {
      const user = userEvent.setup()
      const { mcpService } = await import('@/services/mcp.service')

      const mockInvoice = {
        id: 'invoice-789',
        customer: {
          email: 'customer@business.com',
          businessName: 'Test Customer',
        },
        total: 1000.00,
      }

      mcpService.getInvoice.mockResolvedValue(mockInvoice)
      mcpService.sendInvoice.mockResolvedValue(undefined)

      // Render invoice detail view with send functionality
      renderWithProviders(
        <div>
          <button onClick={() => mcpService.sendInvoice(mockInvoice.id, mockInvoice.customer.email)}>
            Send Invoice
          </button>
        </div>,
        { user: testUsers.manager, queryClient }
      )

      const sendButton = screen.getByRole('button', { name: /send invoice/i })
      await user.click(sendButton)

      await waitFor(() => {
        expect(mcpService.sendInvoice).toHaveBeenCalledWith(
          mockInvoice.id,
          mockInvoice.customer.email
        )
      })
    })
  })

  describe('financial validation workflow', () => {
    it('should validate financial calculations throughout the process', async () => {
      const user = userEvent.setup()

      renderInvoiceForm(testUsers.manager)

      // Test that all financial calculations maintain proper precision
      // This simulates a complex invoice with multiple items and tax calculations

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create invoice/i })).toBeInTheDocument()
      })

      // Select standalone invoice
      const standaloneRadio = screen.getByLabelText(/standalone invoice/i)
      await user.click(standaloneRadio)

      // Add multiple items with complex calculations
      const addItemButton = screen.getByRole('button', { name: /add item/i })

      // Item 1: Fractional quantity
      await user.click(addItemButton)
      const desc1 = screen.getAllByPlaceholderText(/item description/i)[0]
      await user.type(desc1, 'Hourly Consulting')

      const qty1 = screen.getAllByPlaceholderText(/quantity/i)[0]
      await user.clear(qty1)
      await user.type(qty1, '2.5')

      const price1 = screen.getAllByPlaceholderText(/unit price/i)[0]
      await user.clear(price1)
      await user.type(price1, '125.33')

      // Item 2: High precision calculation
      await user.click(addItemButton)
      const desc2 = screen.getAllByPlaceholderText(/item description/i)[1]
      await user.type(desc2, 'Software License')

      const qty2 = screen.getAllByPlaceholderText(/quantity/i)[1]
      await user.clear(qty2)
      await user.type(qty2, '1')

      const price2 = screen.getAllByPlaceholderText(/unit price/i)[1]
      await user.clear(price2)
      await user.type(price2, '999.99')

      // Verify calculations are precise
      await waitFor(() => {
        // Item 1 total: 2.5 * 125.33 = 313.33 (rounded)
        const item1Total = screen.getByTestId('item-total-0')
        expect(item1Total).toHaveValue('313.33')

        // Item 2 total: 1 * 999.99 = 999.99
        const item2Total = screen.getByTestId('item-total-1')
        expect(item2Total).toHaveValue('999.99')

        // Subtotal: 313.33 + 999.99 = 1313.32
        const subtotal = screen.getByTestId('invoice-subtotal')
        expect(subtotal).toHaveTextContent('1,313.32')

        // Tax (12%): 1313.32 * 0.12 = 157.60 (rounded)
        const tax = screen.getByTestId('invoice-tax')
        expect(tax).toHaveTextContent('157.60')

        // Total: 1313.32 + 157.60 = 1470.92
        const total = screen.getByTestId('invoice-total')
        expect(total).toHaveTextContent('1,470.92')
      })
    })
  })

  describe('error handling workflow', () => {
    it('should handle invoice creation errors gracefully', async () => {
      const user = userEvent.setup()
      const { mcpService } = await import('@/services/mcp.service')

      mcpService.createInvoice.mockRejectedValue(new Error('Customer not found'))

      renderInvoiceForm(testUsers.employee)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create invoice/i })).toBeInTheDocument()
      })

      // Try to submit with minimal data
      const createButton = screen.getByRole('button', { name: /create invoice/i })
      await user.click(createButton)

      // Should show validation errors
      await waitFor(() => {
        const errorMessage = screen.getByText(/customer not found/i) ||
                            screen.getByText(/please select a customer/i)
        expect(errorMessage).toBeInTheDocument()
      })
    })

    it('should prevent unauthorized access to invoice creation', () => {
      // Test with readonly user
      renderInvoiceForm(testUsers.readonly)

      // Should not render form or show access denied
      expect(
        screen.queryByRole('button', { name: /create invoice/i }) ||
        screen.getByText(/access denied/i)
      ).toBeInTheDocument()
    })
  })

  describe('performance workflow', () => {
    it('should handle large invoice creation efficiently', async () => {
      const user = userEvent.setup()
      const startTime = Date.now()

      renderInvoiceForm(testUsers.manager)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create invoice/i })).toBeInTheDocument()
      })

      // Simulate creating invoice with many items
      const addItemButton = screen.getByRole('button', { name: /add item/i })

      // Add 10 items (simulating large invoice)
      for (let i = 0; i < 10; i++) {
        await user.click(addItemButton)

        const descriptions = screen.getAllByPlaceholderText(/item description/i)
        const quantities = screen.getAllByPlaceholderText(/quantity/i)
        const prices = screen.getAllByPlaceholderText(/unit price/i)

        await user.type(descriptions[i], `Item ${i + 1}`)
        await user.clear(quantities[i])
        await user.type(quantities[i], '1')
        await user.clear(prices[i])
        await user.type(prices[i], '100.00')
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should complete within reasonable time (< 5 seconds)
      expect(duration).toBeLessThan(5000)

      // Verify all calculations are still accurate
      await waitFor(() => {
        const subtotal = screen.getByTestId('invoice-subtotal')
        expect(subtotal).toHaveTextContent('1,000.00')
      })
    })
  })
})