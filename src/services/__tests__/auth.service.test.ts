import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import axios from 'axios'
import { authService } from '../auth.service'
import { createMockUser, createMockTokens } from '@/lib/test-utils'
import { server } from '@/lib/test-setup'
import { authHandlers } from '@/lib/test-mocks'

// Mock axios
vi.mock('axios')
const mockedAxios = axios as any

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    server.use(...authHandlers)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = createMockUser()
      const mockTokens = createMockTokens()
      const mockResponse = {
        data: { user: mockUser, tokens: mockTokens },
      }

      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password',
      })

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/auth/login',
        { email: 'test@example.com', password: 'password' },
        { timeout: 5000 }
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle connection errors with helpful messages', async () => {
      const networkError = new Error('Network Error')
      networkError.code = 'ECONNREFUSED'

      mockedAxios.post.mockRejectedValue(networkError)

      await expect(authService.login({
        email: 'test@example.com',
        password: 'password',
      })).rejects.toThrow(/Cannot connect to authentication server/)
    })

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Timeout')
      timeoutError.code = 'ETIMEDOUT'

      mockedAxios.post.mockRejectedValue(timeoutError)

      await expect(authService.login({
        email: 'test@example.com',
        password: 'password',
      })).rejects.toThrow(/Authentication server connection timeout/)
    })

    it('should handle 401 unauthorized errors', async () => {
      const unauthorizedError = {
        response: { status: 401 },
      }

      mockedAxios.post.mockRejectedValue(unauthorizedError)

      await expect(authService.login({
        email: 'wrong@example.com',
        password: 'wrong',
      })).rejects.toThrow('Invalid email or password.')
    })

    it('should handle server errors with special character parsing issues', async () => {
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Bad escaped character in JSON' },
        },
      }

      mockedAxios.post.mockRejectedValue(serverError)

      await expect(authService.login({
        email: 'test@example.com',
        password: 'password with special chars',
      })).rejects.toThrow(/There is an issue with special characters in the password/)
    })

    it('should handle generic server errors', async () => {
      const serverError = {
        response: { status: 500 },
      }

      mockedAxios.post.mockRejectedValue(serverError)

      await expect(authService.login({
        email: 'test@example.com',
        password: 'password',
      })).rejects.toThrow('Authentication server error. Please try again later.')
    })
  })

  describe('register', () => {
    it('should register successfully', async () => {
      const mockUser = createMockUser()
      const mockTokens = createMockTokens()
      const mockResponse = {
        data: { user: mockUser, tokens: mockTokens },
      }

      mockedAxios.post.mockResolvedValue(mockResponse)

      const registerData = {
        email: 'new@example.com',
        password: 'password',
        firstName: 'New',
        lastName: 'User',
        organizationName: 'New Org',
      }

      const result = await authService.register(registerData)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/auth/register',
        registerData
      )
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockTokens = createMockTokens()
      const mockResponse = {
        data: { tokens: mockTokens },
      }

      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await authService.refreshToken('refresh-token')

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/auth/refresh',
        { refreshToken: 'refresh-token' }
      )
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user with valid token', async () => {
      const mockUser = createMockUser()
      const mockTokens = createMockTokens()
      const mockResponse = {
        data: { user: mockUser },
      }

      // Mock stored tokens
      authService.setStoredTokens(mockTokens)

      mockedAxios.get.mockResolvedValue(mockResponse)

      const result = await authService.getCurrentUser()

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/auth/profile',
        {
          headers: {
            Authorization: `Bearer ${mockTokens.accessToken}`,
          },
        }
      )
      expect(result).toEqual(mockUser)
    })
  })

  describe('token management', () => {
    it('should store and retrieve tokens', () => {
      const mockTokens = createMockTokens()

      authService.setStoredTokens(mockTokens)
      const retrieved = authService.getStoredTokens()

      expect(retrieved).toEqual(mockTokens)
    })

    it('should remove tokens', () => {
      const mockTokens = createMockTokens()

      authService.setStoredTokens(mockTokens)
      authService.removeStoredTokens()

      const retrieved = authService.getStoredTokens()
      expect(retrieved).toBeNull()
    })

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('auth_tokens', 'invalid-json')

      const retrieved = authService.getStoredTokens()
      expect(retrieved).toBeNull()
    })
  })

  describe('token expiration', () => {
    it('should correctly identify expired tokens', () => {
      // Create token that expired 1 hour ago
      const expiredTime = Math.floor(Date.now() / 1000) - 3600
      const expiredToken = createJWTToken({ exp: expiredTime })

      expect(authService.isTokenExpired(expiredToken)).toBe(true)
    })

    it('should correctly identify valid tokens', () => {
      // Create token that expires in 1 hour
      const futureTime = Math.floor(Date.now() / 1000) + 3600
      const validToken = createJWTToken({ exp: futureTime })

      expect(authService.isTokenExpired(validToken)).toBe(false)
    })

    it('should handle malformed tokens', () => {
      expect(authService.isTokenExpired('invalid-token')).toBe(true)
      expect(authService.isTokenExpired('')).toBe(true)
      expect(authService.isTokenExpired('a.b')).toBe(true)
    })
  })

  describe('password reset flow', () => {
    it('should request password reset', async () => {
      mockedAxios.post.mockResolvedValue({ data: {} })

      await authService.requestPasswordReset('test@example.com')

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/auth/request-password-reset',
        { email: 'test@example.com' }
      )
    })

    it('should reset password with token', async () => {
      mockedAxios.post.mockResolvedValue({ data: {} })

      await authService.resetPassword('reset-token', 'new-password')

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/auth/reset-password',
        { token: 'reset-token', password: 'new-password' }
      )
    })
  })

  describe('email verification', () => {
    it('should verify email with token', async () => {
      mockedAxios.post.mockResolvedValue({ data: {} })

      await authService.verifyEmail('verification-token')

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/auth/verify-email',
        { token: 'verification-token' }
      )
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockedAxios.post.mockResolvedValue({ data: {} })

      await authService.logout()

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/auth/logout'
      )
    })
  })
})

// Helper function to create JWT tokens for testing
function createJWTToken(payload: any): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = btoa(JSON.stringify(header))
  const encodedPayload = btoa(JSON.stringify(payload))
  const signature = 'test-signature'

  return `${encodedHeader}.${encodedPayload}.${signature}`
}