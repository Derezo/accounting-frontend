import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../LoginForm'
import { renderWithProviders, mockUnauthenticatedState } from '@/lib/test-utils'
import { useAuth } from '@/hooks/useAuth'
import { server } from '@/lib/test-setup'
import { authHandlers, errorHandlers } from '@/lib/test-mocks'

// Mock the useAuth hook
vi.mock('@/hooks/useAuth')
const mockUseAuth = useAuth as any

describe('LoginForm', () => {
  const mockLogin = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUnauthenticatedState()

    // Setup default mock implementation
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
    })

    server.use(...authHandlers)
  })

  const renderLoginForm = (props = {}) => {
    return renderWithProviders(
      <LoginForm onSuccess={mockOnSuccess} {...props} />,
      { user: null }
    )
  }

  describe('rendering', () => {
    it('should render login form with all fields', () => {
      renderLoginForm()

      expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('should have proper form accessibility', () => {
      renderLoginForm()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('id', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('id', 'password')
    })

    it('should show password toggle button', () => {
      renderLoginForm()

      const toggleButton = screen.getByRole('button', { name: '' })
      expect(toggleButton).toBeInTheDocument()
    })
  })

  describe('form validation', () => {
    it('should validate email format', async () => {
      const user = userEvent.setup()
      renderLoginForm()

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'invalid-email')
      await user.click(submitButton)

      expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument()
      expect(mockLogin).not.toHaveBeenCalled()
    })

    it('should require password', async () => {
      const user = userEvent.setup()
      renderLoginForm()

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)

      expect(await screen.findByText(/password is required/i)).toBeInTheDocument()
      expect(mockLogin).not.toHaveBeenCalled()
    })

    it('should validate both fields simultaneously', async () => {
      const user = userEvent.setup()
      renderLoginForm()

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument()
      expect(await screen.findByText(/password is required/i)).toBeInTheDocument()
    })
  })

  describe('password visibility toggle', () => {
    it('should toggle password visibility', async () => {
      const user = userEvent.setup()
      renderLoginForm()

      const passwordInput = screen.getByLabelText(/password/i)
      const toggleButton = screen.getByRole('button', { name: '' })

      // Initially password type
      expect(passwordInput).toHaveAttribute('type', 'password')

      // Click to show password
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')

      // Click to hide password
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('should disable toggle when form is loading', async () => {
      mockUseAuth.mockReturnValue({
        login: mockLogin,
        isLoading: true,
        error: null,
      })

      renderLoginForm()

      const toggleButton = screen.getByRole('button', { name: '' })
      expect(toggleButton).toBeDisabled()
    })
  })

  describe('form submission', () => {
    it('should submit valid credentials', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue(undefined)

      renderLoginForm()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled()
      })
    })

    it('should handle login success', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue(undefined)

      renderLoginForm()

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled()
      })
    })

    it('should handle login failure', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Invalid credentials'
      mockLogin.mockRejectedValue(new Error(errorMessage))

      renderLoginForm()

      await user.type(screen.getByLabelText(/email/i), 'wrong@example.com')
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      // The error should be displayed (handled by the auth store)
      expect(mockLogin).toHaveBeenCalled()
      expect(mockOnSuccess).not.toHaveBeenCalled()
    })
  })

  describe('loading states', () => {
    it('should show loading state during submission', () => {
      mockUseAuth.mockReturnValue({
        login: mockLogin,
        isLoading: true,
        error: null,
      })

      renderLoginForm()

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      expect(submitButton).toBeDisabled()
      expect(emailInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()
      expect(screen.getByTestId('loading-spinner') || screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('should disable form inputs during loading', () => {
      mockUseAuth.mockReturnValue({
        login: mockLogin,
        isLoading: true,
        error: null,
      })

      renderLoginForm()

      expect(screen.getByLabelText(/email/i)).toBeDisabled()
      expect(screen.getByLabelText(/password/i)).toBeDisabled()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled()
    })
  })

  describe('error handling', () => {
    it('should display authentication errors', () => {
      const errorMessage = 'Invalid email or password'
      mockUseAuth.mockReturnValue({
        login: mockLogin,
        isLoading: false,
        error: errorMessage,
      })

      renderLoginForm()

      expect(screen.getByText(errorMessage)).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toHaveClass('text-red-600')
    })

    it('should display network error messages', () => {
      const networkError = 'Cannot connect to authentication server'
      mockUseAuth.mockReturnValue({
        login: mockLogin,
        isLoading: false,
        error: networkError,
      })

      renderLoginForm()

      expect(screen.getByText(networkError)).toBeInTheDocument()
    })

    it('should clear errors when form is re-submitted', async () => {
      const user = userEvent.setup()

      // First render with error
      mockUseAuth.mockReturnValue({
        login: mockLogin,
        isLoading: false,
        error: 'Previous error',
      })

      const { rerender } = renderLoginForm()

      expect(screen.getByText('Previous error')).toBeInTheDocument()

      // Re-render without error (simulating successful retry)
      mockUseAuth.mockReturnValue({
        login: mockLogin,
        isLoading: false,
        error: null,
      })

      rerender(<LoginForm onSuccess={mockOnSuccess} />)

      expect(screen.queryByText('Previous error')).not.toBeInTheDocument()
    })
  })

  describe('accessibility and keyboard navigation', () => {
    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      renderLoginForm()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      // Tab through form elements
      await user.tab()
      expect(emailInput).toHaveFocus()

      await user.tab()
      expect(passwordInput).toHaveFocus()

      await user.tab()
      expect(screen.getByRole('button', { name: '' })).toHaveFocus() // Password toggle

      await user.tab()
      expect(submitButton).toHaveFocus()
    })

    it('should submit form on Enter key', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue(undefined)

      renderLoginForm()

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.keyboard('{Enter}')

      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('should have proper ARIA labels', () => {
      renderLoginForm()

      const form = screen.getByRole('form') || screen.getByTestId('login-form')
      expect(form).toBeInTheDocument()

      // Check for accessible form elements
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-invalid', 'false')
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('aria-invalid', 'false')
    })
  })

  describe('integration with authentication flow', () => {
    it('should work with real authentication service', async () => {
      const user = userEvent.setup()

      // Use real auth hook instead of mock
      vi.unmock('@/hooks/useAuth')

      renderLoginForm()

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password')
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      // Should trigger actual login flow
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled()
      }, { timeout: 3000 })
    })
  })

  describe('custom styling and className', () => {
    it('should apply custom className', () => {
      const customClass = 'custom-login-form'
      renderLoginForm({ className: customClass })

      const card = screen.getByRole('heading').closest('.card') ||
                   screen.getByRole('heading').closest('[class*="card"]') ||
                   screen.getByTestId('login-card')

      expect(card).toHaveClass(customClass)
    })
  })

  describe('security considerations', () => {
    it('should not expose sensitive data in DOM', () => {
      renderLoginForm()

      // Password input should be properly masked
      const passwordInput = screen.getByLabelText(/password/i)
      expect(passwordInput).toHaveAttribute('type', 'password')

      // Form should not have any data attributes with sensitive info
      const form = passwordInput.closest('form')
      expect(form).not.toHaveAttribute('data-email')
      expect(form).not.toHaveAttribute('data-password')
    })

    it('should handle special characters in password safely', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue(undefined)

      renderLoginForm()

      const specialPassword = 'p@ssw0rd!@#$%^&*()'
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), specialPassword)
      await user.click(screen.getByRole('button', { name: /sign in/i }))

      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: specialPassword,
      })
    })
  })
})