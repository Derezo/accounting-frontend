import React, { ReactElement, ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { User, UserRole, AuthTokens } from '@/types/auth'
import { useAuthStore } from '@/stores/auth.store'

// Test data factories for consistent test data
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'EMPLOYEE',
  organizationId: 'test-org-id',
  organizationName: 'Test Organization',
  isActive: true,
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:00:00.000Z',
  ...overrides,
})

export const createMockTokens = (overrides: Partial<AuthTokens> = {}): AuthTokens => ({
  accessToken: 'test-access-token',
  refreshToken: 'test-refresh-token',
  expiresAt: Date.now() + 3600000, // 1 hour from now
  ...overrides,
})

// Role-based user factories for permission testing
export const createUserByRole = (role: UserRole): User => createMockUser({ role })

export const testUsers = {
  superAdmin: createUserByRole('SUPER_ADMIN'),
  admin: createUserByRole('ADMIN'),
  manager: createUserByRole('MANAGER'),
  employee: createUserByRole('EMPLOYEE'),
  contractor: createUserByRole('CONTRACTOR'),
  readonly: createUserByRole('READONLY'),
}

// Auth store helpers for testing
export const mockAuthenticatedState = (user: User = testUsers.employee, tokens: AuthTokens = createMockTokens()) => {
  const store = useAuthStore.getState()
  store.setUser(user)
  store.setTokens(tokens)
}

export const mockUnauthenticatedState = () => {
  const store = useAuthStore.getState()
  store.logout()
}

// Test wrapper that provides all necessary context
interface TestProviderProps {
  children: ReactNode
  user?: User | null
  queryClient?: QueryClient
  initialRoute?: string
}

export const TestProvider = ({
  children,
  user = testUsers.employee,
  queryClient,
  initialRoute = '/'
}: TestProviderProps) => {
  // Create a fresh QueryClient for each test to avoid cache pollution
  const testQueryClient = queryClient || new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

  // Set auth state if user provided
  React.useEffect(() => {
    if (user) {
      mockAuthenticatedState(user)
    } else {
      mockUnauthenticatedState()
    }
  }, [user])

  return (
    <BrowserRouter>
      <QueryClientProvider client={testQueryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  )
}

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: User | null
  queryClient?: QueryClient
  initialRoute?: string
}

export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { user, queryClient, initialRoute, ...renderOptions } = options

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <TestProvider user={user} queryClient={queryClient} initialRoute={initialRoute}>
      {children}
    </TestProvider>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Financial calculation test helpers
export const expectFinancialEquals = (actual: number, expected: number, precision: number = 2) => {
  const factor = Math.pow(10, precision)
  const roundedActual = Math.round(actual * factor) / factor
  const roundedExpected = Math.round(expected * factor) / factor
  expect(roundedActual).toBe(roundedExpected)
}

export const calculateTotalWithTax = (subtotal: number, taxRate: number): number => {
  return Math.round((subtotal * (1 + taxRate)) * 100) / 100
}

// Date helpers for consistent testing
export const formatTestDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

export const addDaysToDate = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// API response factories
export const createMockApiResponse = <T,>(data: T, success: boolean = true) => ({
  success,
  data,
  message: success ? 'Success' : 'Error occurred',
})

export const createMockPaginatedResponse = <T,>(
  data: T[],
  page: number = 1,
  limit: number = 10,
  total?: number
) => ({
  data,
  pagination: {
    page,
    limit,
    total: total ?? data.length,
    totalPages: Math.ceil((total ?? data.length) / limit),
    hasNext: page * limit < (total ?? data.length),
    hasPrev: page > 1,
  },
})

// Form testing helpers
export const fillInput = async (getByLabelText: any, label: string, value: string) => {
  const { default: userEvent } = await import('@testing-library/user-event')
  const user = userEvent.setup()
  const input = getByLabelText(label)
  await user.clear(input)
  await user.type(input, value)
  return input
}

export const submitForm = async (getByRole: any) => {
  const { default: userEvent } = await import('@testing-library/user-event')
  const user = userEvent.setup()
  const submitButton = getByRole('button', { name: /submit|save|create|update/i })
  await user.click(submitButton)
  return submitButton
}

// Permission testing helpers
export const testRolePermissions = (role: UserRole, permissions: string[]) => {
  const user = createUserByRole(role)
  mockAuthenticatedState(user)

  return {
    user,
    hasPermission: (permission: string) => permissions.includes(permission),
    canAccess: (resource: string, action: 'read' | 'write' | 'delete' = 'read') =>
      permissions.includes(`${resource}:${action}`),
  }
}

// Wait for loading states to complete
export const waitForLoadingToFinish = async () => {
  const { waitFor, screen } = await import('@testing-library/react')
  await waitFor(() => {
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })
}

// Error boundary test helper
export const TestErrorBoundary = ({ children }: { children: ReactNode }) => {
  const [hasError, setHasError] = React.useState(false)

  React.useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      setHasError(true)
    }
    window.addEventListener('error', errorHandler)
    return () => window.removeEventListener('error', errorHandler)
  }, [])

  if (hasError) {
    return <div data-testid="error-boundary">Something went wrong</div>
  }

  return <>{children}</>
}

// Re-export testing library utilities
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'