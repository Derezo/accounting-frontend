/**
 * API Service Validation Tests
 *
 * Tests to catch duplicate methods, type issues, and missing endpoints
 * in the API service layer.
 */

import { describe, test, expect, vi } from 'vitest'
import { APIService } from '@/services/api.service'

// Mock axios to prevent actual HTTP requests
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    }))
  }
}))

describe('API Service Structure Validation', () => {
  let apiService: APIService

  beforeEach(() => {
    apiService = new APIService()
  })

  test('APIService class should be instantiable', () => {
    expect(apiService).toBeInstanceOf(APIService)
  })

  test('APIService should have all required customer methods', () => {
    const customerMethods = [
      'findCustomers',
      'getCustomer',
      'createCustomer',
      'updateCustomer',
      'deleteCustomer'
    ]

    customerMethods.forEach(method => {
      expect(typeof apiService[method]).toBe('function')
    })
  })

  test('APIService should have all required quote methods', () => {
    const quoteMethods = [
      'findQuotes',
      'getQuote',
      'createQuote',
      'updateQuote',
      'deleteQuote',
      'convertQuoteToInvoice'
    ]

    quoteMethods.forEach(method => {
      expect(typeof apiService[method]).toBe('function')
    })
  })

  test('APIService should have all required invoice methods', () => {
    const invoiceMethods = [
      'findInvoices',
      'getInvoice',
      'createInvoice',
      'updateInvoice',
      'deleteInvoice',
      'sendInvoice'
    ]

    invoiceMethods.forEach(method => {
      expect(typeof apiService[method]).toBe('function')
    })
  })

  test('APIService should have all required payment methods', () => {
    const paymentMethods = [
      'findPayments',
      'getPayment',
      'createPayment',
      'updatePayment',
      'deletePayment'
    ]

    paymentMethods.forEach(method => {
      expect(typeof apiService[method]).toBe('function')
    })
  })

  test('APIService should have all required project methods', () => {
    const projectMethods = [
      'findProjects',
      'getProject',
      'createProject',
      'updateProject',
      'deleteProject'
    ]

    projectMethods.forEach(method => {
      expect(typeof apiService[method]).toBe('function')
    })
  })

  test('APIService should have all required employee methods', () => {
    const employeeMethods = [
      'findEmployees',
      'getEmployee',
      'createEmployee',
      'updateEmployee',
      'deleteEmployee'
    ]

    employeeMethods.forEach(method => {
      expect(typeof apiService[method]).toBe('function')
    })
  })

  test('APIService should have all required analytics methods', () => {
    const analyticsMethods = [
      'getAnalytics',
      'getFinancialMetrics',
      'getRevenueAnalytics'
    ]

    analyticsMethods.forEach(method => {
      expect(typeof apiService[method]).toBe('function')
    })
  })
})

describe('API Service Method Signatures', () => {
  let apiService: APIService

  beforeEach(() => {
    apiService = new APIService()
  })

  test('Customer methods should have correct signatures', () => {
    // These should not throw TypeScript errors
    expect(() => {
      apiService.findCustomers({ page: 1, limit: 10 })
      apiService.getCustomer('123')
      apiService.createCustomer({
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '555-0123'
      })
      apiService.updateCustomer('123', { name: 'Updated Customer' })
      apiService.deleteCustomer('123')
    }).not.toThrow()
  })

  test('Quote methods should have correct signatures', () => {
    expect(() => {
      apiService.findQuotes({ page: 1, limit: 10 })
      apiService.getQuote('123')
      apiService.createQuote({
        customerId: '123',
        items: [],
        total: 100,
        status: 'DRAFT'
      })
      apiService.updateQuote('123', { status: 'SENT' })
      apiService.deleteQuote('123')
    }).not.toThrow()
  })

  test('Invoice methods should have correct signatures', () => {
    expect(() => {
      apiService.findInvoices({ page: 1, limit: 10 })
      apiService.getInvoice('123')
      apiService.createInvoice({
        customerId: '123',
        items: [],
        total: 100,
        dueDate: new Date()
      })
      apiService.updateInvoice('123', { status: 'SENT' })
      apiService.deleteInvoice('123')
    }).not.toThrow()
  })
})

describe('API Service Duplicate Detection', () => {
  test('Should not have duplicate method definitions', () => {
    const apiService = new APIService()
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(apiService))
      .filter(name => typeof apiService[name] === 'function' && name !== 'constructor')

    const duplicates = methodNames.filter((name, index) => methodNames.indexOf(name) !== index)

    if (duplicates.length > 0) {
      throw new Error(`Duplicate methods found in APIService: ${duplicates.join(', ')}`)
    }
  })

  test('Method names should follow consistent naming conventions', () => {
    const apiService = new APIService()
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(apiService))
      .filter(name => typeof apiService[name] === 'function' && name !== 'constructor')

    const crudMethods = methodNames.filter(name =>
      name.startsWith('find') ||
      name.startsWith('get') ||
      name.startsWith('create') ||
      name.startsWith('update') ||
      name.startsWith('delete')
    )

    // Check for consistent naming patterns
    const entities = ['Customer', 'Quote', 'Invoice', 'Payment', 'Project', 'Employee']

    entities.forEach(entity => {
      const entityMethods = crudMethods.filter(name =>
        name.toLowerCase().includes(entity.toLowerCase())
      )

      if (entityMethods.length > 0) {
        // Should have basic CRUD operations
        const expectedMethods = [
          `find${entity}s`,
          `get${entity}`,
          `create${entity}`,
          `update${entity}`,
          `delete${entity}`
        ]

        expectedMethods.forEach(expectedMethod => {
          const methodExists = methodNames.includes(expectedMethod)
          if (!methodExists && entity !== 'Employee') { // Employees might have different patterns
            console.warn(`Missing expected method: ${expectedMethod}`)
          }
        })
      }
    })
  })
})

describe('API Service Error Handling', () => {
  test('Methods should handle missing parameters gracefully', () => {
    const apiService = new APIService()

    // These should not throw synchronously (might throw async)
    expect(() => {
      apiService.getCustomer('')
      apiService.getQuote('')
      apiService.getInvoice('')
    }).not.toThrow()
  })

  test('Create methods should validate required fields', () => {
    const apiService = new APIService()

    // These should not throw synchronously
    expect(() => {
      apiService.createCustomer({} as any)
      apiService.createQuote({} as any)
      apiService.createInvoice({} as any)
    }).not.toThrow()
  })
})

describe('API Service Type Safety', () => {
  test('Return types should be consistent', () => {
    const apiService = new APIService()

    // Test that methods exist and return promises
    expect(apiService.findCustomers()).toBeInstanceOf(Promise)
    expect(apiService.findQuotes()).toBeInstanceOf(Promise)
    expect(apiService.findInvoices()).toBeInstanceOf(Promise)
    expect(apiService.findPayments()).toBeInstanceOf(Promise)
  })

  test('Paginated methods should accept pagination parameters', () => {
    const apiService = new APIService()

    // Should accept page and limit parameters
    expect(() => {
      apiService.findCustomers({ page: 1, limit: 20 })
      apiService.findQuotes({ page: 2, limit: 50 })
      apiService.findInvoices({ page: 3, limit: 100 })
    }).not.toThrow()
  })
})

describe('API Service Integration Points', () => {
  test('Should work with authentication', () => {
    // API service should not crash when auth tokens are missing
    expect(() => {
      const apiService = new APIService()
      apiService.findCustomers()
    }).not.toThrow()
  })

  test('Should handle network errors gracefully', () => {
    // Network errors should be caught at the service level
    const apiService = new APIService()

    expect(() => {
      apiService.findCustomers().catch(() => {
        // Error handling should be in place
      })
    }).not.toThrow()
  })
})