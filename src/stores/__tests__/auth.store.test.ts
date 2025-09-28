import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '../auth.store'
import { authService } from '@/services/auth.service'
import { createMockUser, createMockTokens } from '@/lib/test-utils'
import { server } from '@/lib/test-setup'
import { authHandlers, errorHandlers } from '@/lib/test-mocks'

// Mock the auth service
vi.mock('@/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    refreshToken: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    getStoredTokens: vi.fn(),
    setStoredTokens: vi.fn(),
    removeStoredTokens: vi.fn(),
    isTokenExpired: vi.fn(),
  },
}))

const mockAuthService = authService as any

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.getState().logout()

    // Reset all mocks
    vi.clearAllMocks()

    // Clear localStorage
    localStorage.clear()

    // Setup default MSW handlers
    server.use(...authHandlers)
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState()

      expect(state.user).toBeNull()
      expect(state.tokens).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = createMockUser()
      const mockTokens = createMockTokens()

      mockAuthService.login.mockResolvedValue({
        user: mockUser,
        tokens: mockTokens,
      })

      const { login } = useAuthStore.getState()

      await login({ email: 'test@example.com', password: 'password' })

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.tokens).toEqual(mockTokens)
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
      expect(mockAuthService.setStoredTokens).toHaveBeenCalledWith(mockTokens)
    })

    it('should handle login failure', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'))

      const { login } = useAuthStore.getState()

      await expect(login({ email: 'wrong@example.com', password: 'wrong' }))
        .rejects.toThrow('Invalid credentials')

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBe('Invalid credentials')
    })

    it('should set loading state during login', async () => {
      let resolveLogin: (value: any) => void
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve
      })

      mockAuthService.login.mockReturnValue(loginPromise)

      const { login } = useAuthStore.getState()
      const loginCall = login({ email: 'test@example.com', password: 'password' })

      // Check loading state is true
      expect(useAuthStore.getState().isLoading).toBe(true)

      // Resolve the promise
      resolveLogin!({
        user: createMockUser(),
        tokens: createMockTokens(),
      })

      await loginCall

      // Check loading state is false
      expect(useAuthStore.getState().isLoading).toBe(false)
    })
  })

  describe('logout', () => {
    it('should clear user state on logout', () => {
      // Set up authenticated state
      const mockUser = createMockUser()
      const mockTokens = createMockTokens()
      useAuthStore.getState().setUser(mockUser)
      useAuthStore.getState().setTokens(mockTokens)

      // Logout
      useAuthStore.getState().logout()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.tokens).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.error).toBeNull()
      expect(mockAuthService.removeStoredTokens).toHaveBeenCalled()
    })
  })

  describe('token refresh', () => {
    it('should refresh tokens successfully', async () => {
      const oldTokens = createMockTokens()
      const newTokens = createMockTokens({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      })

      mockAuthService.getStoredTokens.mockReturnValue(oldTokens)
      mockAuthService.isTokenExpired.mockReturnValue(false)
      mockAuthService.refreshToken.mockResolvedValue({
        tokens: newTokens,
      })

      const { refreshAuth } = useAuthStore.getState()
      await refreshAuth()

      const state = useAuthStore.getState()
      expect(state.tokens).toEqual({ ...oldTokens, ...newTokens })
      expect(mockAuthService.setStoredTokens).toHaveBeenCalledWith({ ...oldTokens, ...newTokens })
    })

    it('should logout if refresh token is expired', async () => {
      const expiredTokens = createMockTokens()

      mockAuthService.getStoredTokens.mockReturnValue(expiredTokens)
      mockAuthService.isTokenExpired.mockReturnValue(true)

      const { refreshAuth } = useAuthStore.getState()

      await expect(refreshAuth()).rejects.toThrow('Refresh token expired')

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })

    it('should logout if refresh fails', async () => {
      const validTokens = createMockTokens()

      mockAuthService.getStoredTokens.mockReturnValue(validTokens)
      mockAuthService.isTokenExpired.mockReturnValue(false)
      mockAuthService.refreshToken.mockRejectedValue(new Error('Refresh failed'))

      const { refreshAuth } = useAuthStore.getState()

      await expect(refreshAuth()).rejects.toThrow('Refresh failed')

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })
  })

  describe('initialize', () => {
    it('should initialize with valid stored tokens', async () => {
      const validTokens = createMockTokens()
      const mockUser = createMockUser()

      mockAuthService.getStoredTokens.mockReturnValue(validTokens)
      mockAuthService.isTokenExpired.mockReturnValue(false)
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser)

      const { initialize } = useAuthStore.getState()
      await initialize()

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.tokens).toEqual(validTokens)
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
    })

    it('should refresh tokens if access token expired but refresh token valid', async () => {
      const tokensWithExpiredAccess = createMockTokens({
        accessToken: 'expired-token',
      })
      const newTokens = createMockTokens({
        accessToken: 'new-access-token',
      })
      const mockUser = createMockUser()

      mockAuthService.getStoredTokens.mockReturnValue(tokensWithExpiredAccess)
      mockAuthService.isTokenExpired
        .mockReturnValueOnce(true) // access token expired
        .mockReturnValueOnce(false) // refresh token valid
      mockAuthService.refreshToken.mockResolvedValue({ tokens: newTokens })
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser)

      const { initialize } = useAuthStore.getState()
      await initialize()

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.isAuthenticated).toBe(true)
      expect(mockAuthService.refreshToken).toHaveBeenCalled()
    })

    it('should logout if both tokens are expired', async () => {
      const expiredTokens = createMockTokens()

      mockAuthService.getStoredTokens.mockReturnValue(expiredTokens)
      mockAuthService.isTokenExpired.mockReturnValue(true)

      const { initialize } = useAuthStore.getState()
      await initialize()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
    })

    it('should handle initialization errors gracefully', async () => {
      const validTokens = createMockTokens()

      mockAuthService.getStoredTokens.mockReturnValue(validTokens)
      mockAuthService.isTokenExpired.mockReturnValue(false)
      mockAuthService.getCurrentUser.mockRejectedValue(new Error('Network error'))

      const { initialize } = useAuthStore.getState()
      await initialize()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should clear errors when clearError is called', () => {
      const { setError, clearError } = useAuthStore.getState()

      setError('Test error')
      expect(useAuthStore.getState().error).toBe('Test error')

      clearError()
      expect(useAuthStore.getState().error).toBeNull()
    })

    it('should set loading state correctly', () => {
      const { setLoading } = useAuthStore.getState()

      setLoading(true)
      expect(useAuthStore.getState().isLoading).toBe(true)

      setLoading(false)
      expect(useAuthStore.getState().isLoading).toBe(false)
    })
  })

  describe('persistence', () => {
    it('should persist authentication state', () => {
      const mockUser = createMockUser()
      const mockTokens = createMockTokens()

      const { setUser, setTokens } = useAuthStore.getState()
      setUser(mockUser)
      setTokens(mockTokens)

      // Check that the state is persisted (this would normally be tested with actual persistence)
      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.tokens).toEqual(mockTokens)
      expect(state.isAuthenticated).toBe(true)
    })
  })
})