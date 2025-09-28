/**
 * Smoke Tests
 *
 * Basic rendering tests for all major pages and components to catch
 * critical runtime issues and missing imports.
 */

import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

// Mock components that might have complex dependencies
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'test@example.com', role: 'ADMIN' },
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn()
  })
}))

vi.mock('@/hooks/useAPI', () => ({
  useAPI: () => ({
    data: [],
    isLoading: false,
    error: null,
    refetch: vi.fn()
  })
}))

// Test wrapper component
const TestWrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false }
    }
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Smoke Tests - Core Components', () => {
  test('App component should render without crashing', async () => {
    const { App } = await import('@/App')
    expect(() => render(<App />)).not.toThrow()
  })

  test('MainLayout should render without crashing', async () => {
    const { MainLayout } = await import('@/components/layout/MainLayout')
    expect(() => render(
      <TestWrapper>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </TestWrapper>
    )).not.toThrow()
  })

  test('ProtectedRoute should render without crashing', async () => {
    const { ProtectedRoute } = await import('@/components/layout/ProtectedRoute')
    expect(() => render(
      <TestWrapper>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    )).not.toThrow()
  })
})

describe('Smoke Tests - Page Components', () => {
  test('DashboardPage should render without crashing', async () => {
    const { DashboardPage } = await import('@/pages/dashboard/DashboardPage')
    expect(() => render(
      <TestWrapper>
        <DashboardPage />
      </TestWrapper>
    )).not.toThrow()
  })

  test('CustomersPage should render without crashing', async () => {
    const { CustomersPage } = await import('@/pages/customers/CustomersPage')
    expect(() => render(
      <TestWrapper>
        <CustomersPage />
      </TestWrapper>
    )).not.toThrow()
  })

  test('QuotesPage should render without crashing', async () => {
    const { QuotesPage } = await import('@/pages/quotes/QuotesPage')
    expect(() => render(
      <TestWrapper>
        <QuotesPage />
      </TestWrapper>
    )).not.toThrow()
  })

  test('InvoicesPage should render without crashing', async () => {
    const { InvoicesPage } = await import('@/pages/invoices/InvoicesPage')
    expect(() => render(
      <TestWrapper>
        <InvoicesPage />
      </TestWrapper>
    )).not.toThrow()
  })

  test('PaymentsPage should render without crashing', async () => {
    const { PaymentsPage } = await import('@/pages/payments/PaymentsPage')
    expect(() => render(
      <TestWrapper>
        <PaymentsPage />
      </TestWrapper>
    )).not.toThrow()
  })

  test('AnalyticsPage should render without crashing', async () => {
    const { AnalyticsPage } = await import('@/pages/analytics/AnalyticsPage')
    expect(() => render(
      <TestWrapper>
        <AnalyticsPage />
      </TestWrapper>
    )).not.toThrow()
  })

  test('ReportsPage should render without crashing', async () => {
    const { ReportsPage } = await import('@/pages/reports/ReportsPage')
    expect(() => render(
      <TestWrapper>
        <ReportsPage />
      </TestWrapper>
    )).not.toThrow()
  })
})

describe('Smoke Tests - Form Components', () => {
  test('LoginForm should render without crashing', async () => {
    const { LoginForm } = await import('@/components/forms/LoginForm')
    expect(() => render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )).not.toThrow()
  })

  test('CustomerForm should render without crashing', async () => {
    const { CustomerForm } = await import('@/components/forms/CustomerForm')
    expect(() => render(
      <TestWrapper>
        <CustomerForm />
      </TestWrapper>
    )).not.toThrow()
  })
})

describe('Smoke Tests - UI Components', () => {
  test('Button component should render without crashing', async () => {
    const { Button } = await import('@/components/ui/button')
    expect(() => render(
      <TestWrapper>
        <Button>Test Button</Button>
      </TestWrapper>
    )).not.toThrow()
  })

  test('Input component should render without crashing', async () => {
    const { Input } = await import('@/components/ui/input')
    expect(() => render(
      <TestWrapper>
        <Input placeholder="Test Input" />
      </TestWrapper>
    )).not.toThrow()
  })

  test('Select component should render without crashing', async () => {
    const { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } = await import('@/components/ui/select')
    expect(() => render(
      <TestWrapper>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      </TestWrapper>
    )).not.toThrow()
  })

  test('Table component should render without crashing', async () => {
    const { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } = await import('@/components/ui/table')
    expect(() => render(
      <TestWrapper>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TestWrapper>
    )).not.toThrow()
  })
})

describe('Smoke Tests - Service Modules', () => {
  test('API service should be importable and have expected methods', async () => {
    const { APIService } = await import('@/services/api.service')
    const apiService = new APIService()

    // Check for critical methods
    expect(typeof apiService.findCustomers).toBe('function')
    expect(typeof apiService.createCustomer).toBe('function')
    expect(typeof apiService.findInvoices).toBe('function')
    expect(typeof apiService.createInvoice).toBe('function')
  })

  test('Auth service should be importable and have expected methods', async () => {
    const authService = await import('@/services/auth.service')

    expect(typeof authService.login).toBe('function')
    expect(typeof authService.logout).toBe('function')
    expect(typeof authService.refreshToken).toBe('function')
  })
})

describe('Smoke Tests - Store Modules', () => {
  test('Auth store should be importable and have expected structure', async () => {
    const { useAuthStore } = await import('@/stores/auth.store')

    const store = useAuthStore.getState()
    expect(store).toHaveProperty('user')
    expect(store).toHaveProperty('isAuthenticated')
    expect(store).toHaveProperty('isLoading')
    expect(store).toHaveProperty('login')
    expect(store).toHaveProperty('logout')
  })
})

describe('Smoke Tests - Hook Modules', () => {
  test('useAuth hook should be importable', async () => {
    const { useAuth } = await import('@/hooks/useAuth')
    expect(typeof useAuth).toBe('function')
  })

  test('useAPI hook should be importable', async () => {
    const { useAPI } = await import('@/hooks/useAPI')
    expect(typeof useAPI).toBe('function')
  })
})