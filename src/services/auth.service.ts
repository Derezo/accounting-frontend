import axios from 'axios'
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  User,
} from '@/types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

class AuthService {
  private baseURL = API_BASE_URL

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(
        `${this.baseURL}/auth/login`,
        credentials,
        { timeout: 5000 } // 5 second timeout
      )
      return response.data
    } catch (error: any) {
      // Provide more helpful error messages for common connection issues
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error(
          `Cannot connect to authentication server at ${this.baseURL}. ` +
          'Please ensure the accounting-api backend is running on port 3000. ' +
          'Check the DEV_CREDENTIALS.md file for troubleshooting steps.'
        )
      }

      if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
        throw new Error(
          'Authentication server connection timeout. The backend may be starting up or experiencing issues.'
        )
      }

      // Handle HTTP error responses
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password.')
      }

      if (error.response?.status >= 500) {
        // Check for specific JSON parsing errors related to special characters
        const errorMessage = error.response?.data?.message || ''
        if (errorMessage.includes('Bad escaped character') || errorMessage.includes('JSON')) {
          throw new Error(
            'Authentication server error: There is an issue with special characters in the password. ' +
            'This is a known backend issue that needs to be fixed in the accounting-api server.'
          )
        }
        throw new Error('Authentication server error. Please try again later.')
      }

      // Re-throw original error for other cases
      throw error
    }
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const response = await axios.post<RegisterResponse>(
      `${this.baseURL}/auth/register`,
      userData
    )
    return response.data
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await axios.post<RefreshTokenResponse>(
      `${this.baseURL}/auth/refresh`,
      { refreshToken }
    )
    return response.data
  }

  async logout(): Promise<void> {
    await axios.post(`${this.baseURL}/auth/logout`)
  }

  async getCurrentUser(): Promise<User> {
    const response = await axios.get<User>(`${this.baseURL}/auth/me`)
    return response.data
  }

  async verifyEmail(token: string): Promise<void> {
    await axios.post(`${this.baseURL}/auth/verify-email`, { token })
  }

  async requestPasswordReset(email: string): Promise<void> {
    await axios.post(`${this.baseURL}/auth/request-password-reset`, { email })
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await axios.post(`${this.baseURL}/auth/reset-password`, { token, password })
  }

  // Token management
  getStoredTokens() {
    const tokens = localStorage.getItem('auth_tokens')
    return tokens ? JSON.parse(tokens) : null
  }

  setStoredTokens(tokens: any) {
    localStorage.setItem('auth_tokens', JSON.stringify(tokens))
  }

  removeStoredTokens() {
    localStorage.removeItem('auth_tokens')
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp * 1000 < Date.now()
    } catch {
      return true
    }
  }
}

export const authService = new AuthService()