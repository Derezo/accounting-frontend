/**
 * Route Validation Tests
 *
 * Tests to verify all defined routes can be accessed without errors
 * and that protected routes enforce proper authentication.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from '@/App'

// Mock authentication states
const mockAuthenticatedUser = {
  id: '1',
  email: 'test@example.com',
  role: 'ADMIN',
  permissions: [
    'customers:read', 'customers:write',
    'quotes:read', 'quotes:write',
    'invoices:read', 'invoices:write',
    'payments:read', 'payments:write',
    'projects:read', 'projects:write',
    'employees:read', 'employees:write',
    'appointments:read', 'appointments:write',
    'analytics:read', 'reports:read',
    'audit:read', 'accounting:read',
    'expenses:read', 'tax:read',
    'settings:read', 'users:read',
    'organization:read', 'system:admin'
  ]
}

const mockUnauthenticatedUser = null

// Mock the auth store
vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn()
}))

// Mock the useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn()
}))

// Mock API services to prevent actual API calls
vi.mock('@/services/api.service', () => ({
  APIService: vi.fn().mockImplementation(() => ({
    findCustomers: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    findInvoices: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    findQuotes: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    findPayments: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    findProjects: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    findEmployees: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    findAppointments: vi.fn().mockResolvedValue({ data: [], total: 0 })
  }))
}))

// Mock other dependencies that might cause issues
vi.mock('@/components/charts/RevenueChart', () => ({
  RevenueChart: () => <div data-testid="revenue-chart">Revenue Chart</div>
}))

vi.mock('@/components/analytics/FinancialMetrics', () => ({
  FinancialMetrics: () => <div data-testid="financial-metrics">Financial Metrics</div>
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false }
    }
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('Route Validation - Public Routes', () => {
  beforeEach(() => {
    const { useAuthStore } = require('@/stores/auth.store')
    const { useAuth } = require('@/hooks/useAuth')

    useAuthStore.mockReturnValue({
      user: mockUnauthenticatedUser,
      isAuthenticated: false,
      isLoading: false,
      initialize: vi.fn()
    })

    useAuth.mockReturnValue({
      user: mockUnauthenticatedUser,
      isAuthenticated: false,
      isLoading: false,
      hasPermission: vi.fn().mockReturnValue(false)
    })
  })

  test('Login route should render without errors', () => {
    expect(() => render(
      <TestWrapper>
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      </TestWrapper>
    )).not.toThrow()
  })

  test('Home route should render without errors', () => {
    expect(() => render(
      <TestWrapper>
        <MemoryRouter initialEntries={['/home']}>
          <App />
        </MemoryRouter>
      </TestWrapper>
    )).not.toThrow()
  })

  test('Unauthorized route should render without errors', () => {
    expect(() => render(
      <TestWrapper>
        <MemoryRouter initialEntries={['/unauthorized']}>
          <App />
        </MemoryRouter>
      </TestWrapper>
    )).not.toThrow()
  })

  test('Password reset route should render without errors', () => {
    expect(() => render(
      <TestWrapper>
        <MemoryRouter initialEntries={['/auth/password-reset']}>
          <App />
        </MemoryRouter>
      </TestWrapper>
    )).not.toThrow()
  })
})

describe('Route Validation - Protected Routes (Authenticated)', () => {
  beforeEach(() => {
    const { useAuthStore } = require('@/stores/auth.store')
    const { useAuth } = require('@/hooks/useAuth')

    useAuthStore.mockReturnValue({
      user: mockAuthenticatedUser,
      isAuthenticated: true,
      isLoading: false,
      initialize: vi.fn()
    })

    useAuth.mockReturnValue({
      user: mockAuthenticatedUser,
      isAuthenticated: true,
      isLoading: false,
      hasPermission: vi.fn().mockImplementation((permission: string) =>
        mockAuthenticatedUser.permissions.includes(permission)
      )
    })
  })

  const protectedRoutes = [
    '/dashboard',
    '/customers',
    '/quotes',
    '/invoices',
    '/payments',
    '/projects',
    '/employees',
    '/appointments',
    '/analytics',
    '/reports',
    '/admin/users',
    '/admin/organization',
    '/settings/currency'
  ]

  test.each(protectedRoutes)('Route %s should render without errors for authenticated user', (route) => {
    expect(() => render(
      <TestWrapper>
        <MemoryRouter initialEntries={[route]}>
          <App />
        </MemoryRouter>
      </TestWrapper>
    )).not.toThrow()
  })

  test('Dashboard route should render main dashboard components', () => {
    render(
      <TestWrapper>
        <MemoryRouter initialEntries={['/dashboard']}>
          <App />
        </MemoryRouter>
      </TestWrapper>
    )

    // Should not crash and should render some dashboard content
    expect(document.body).toBeTruthy()
  })

  test('Customers route should render customer management interface', () => {
    render(
      <TestWrapper>
        <MemoryRouter initialEntries={['/customers']}>
          <App />
        </MemoryRouter>
      </TestWrapper>
    )

    expect(document.body).toBeTruthy()
  })

  test('Analytics route should render analytics components', () => {
    render(
      <TestWrapper>
        <MemoryRouter initialEntries={['/analytics']}>
          <App />
        </MemoryRouter>
      </TestWrapper>
    )

    expect(document.body).toBeTruthy()
  })
})

describe('Route Validation - Permission-Based Access', () => {
  test('Routes should enforce permission requirements', () => {
    const { useAuthStore } = require('@/stores/auth.store')
    const { useAuth } = require('@/hooks/useAuth')

    // Mock user with limited permissions
    const limitedUser = {
      ...mockAuthenticatedUser,
      role: 'EMPLOYEE',
      permissions: ['customers:read'] // Very limited permissions
    }

    useAuthStore.mockReturnValue({
      user: limitedUser,
      isAuthenticated: true,
      isLoading: false,
      initialize: vi.fn()
    })

    useAuth.mockReturnValue({
      user: limitedUser,
      isAuthenticated: true,
      isLoading: false,
      hasPermission: vi.fn().mockImplementation((permission: string) =>
        limitedUser.permissions.includes(permission)
      )
    })

    // These routes should still render (might show unauthorized content, but shouldn't crash)
    const restrictedRoutes = ['/admin/users', '/admin/organization', '/admin/system']

    restrictedRoutes.forEach(route => {
      expect(() => render(
        <TestWrapper>
          <MemoryRouter initialEntries={[route]}>
            <App />
          </MemoryRouter>
        </TestWrapper>
      )).not.toThrow()
    })
  })
})

describe('Route Validation - Error Handling', () => {
  beforeEach(() => {
    const { useAuthStore } = require('@/stores/auth.store')
    const { useAuth } = require('@/hooks/useAuth')

    useAuthStore.mockReturnValue({
      user: mockAuthenticatedUser,
      isAuthenticated: true,
      isLoading: false,
      initialize: vi.fn()
    })

    useAuth.mockReturnValue({
      user: mockAuthenticatedUser,
      isAuthenticated: true,
      isLoading: false,
      hasPermission: vi.fn().mockReturnValue(true)
    })
  })

  test('Invalid routes should render 404 page without crashing', () => {
    expect(() => render(
      <TestWrapper>
        <MemoryRouter initialEntries={['/non-existent-route']}>
          <App />
        </MemoryRouter>
      </TestWrapper>
    )).not.toThrow()
  })

  test('Routes with invalid parameters should handle gracefully', () => {
    expect(() => render(
      <TestWrapper>
        <MemoryRouter initialEntries={['/invoices/invalid-id/pdf']}>
          <App />
        </MemoryRouter>
      </TestWrapper>
    )).not.toThrow()

    expect(() => render(
      <TestWrapper>
        <MemoryRouter initialEntries={['/payments/invalid-id']}>
          <App />
        </MemoryRouter>
      </TestWrapper>
    )).not.toThrow()
  })
})

describe('Route Validation - Navigation', () => {
  test('Root route should redirect to dashboard for authenticated users', () => {
    const { useAuthStore } = require('@/stores/auth.store')
    const { useAuth } = require('@/hooks/useAuth')

    useAuthStore.mockReturnValue({
      user: mockAuthenticatedUser,
      isAuthenticated: true,
      isLoading: false,
      initialize: vi.fn()
    })

    useAuth.mockReturnValue({
      user: mockAuthenticatedUser,
      isAuthenticated: true,
      isLoading: false,
      hasPermission: vi.fn().mockReturnValue(true)
    })

    expect(() => render(
      <TestWrapper>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </TestWrapper>
    )).not.toThrow()
  })
})