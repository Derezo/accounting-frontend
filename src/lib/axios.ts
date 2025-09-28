import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth.store'
import { errorHandler } from '@/lib/error-handler'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tokens = authService.getStoredTokens()

    if (tokens?.accessToken && !authService.isTokenExpired(tokens.accessToken)) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh and errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const tokens = authService.getStoredTokens()

        if (tokens?.refreshToken && !authService.isTokenExpired(tokens.refreshToken)) {
          const refreshResponse = await authService.refreshToken(tokens.refreshToken)

          // Update stored tokens
          const newTokens = {
            ...tokens,
            ...refreshResponse.tokens,
          }
          authService.setStoredTokens(newTokens)

          // Update auth store
          useAuthStore.getState().setTokens(newTokens)

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.tokens.accessToken}`
          return apiClient(originalRequest)
        } else {
          // Refresh token is invalid, logout user
          useAuthStore.getState().logout()
          window.location.href = '/login'
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }

    // Convert axios error to AppError for consistent handling
    const appError = errorHandler.handleAxiosError(error)

    // Add request context for debugging
    const context = {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      requestId: error.response?.headers['x-request-id']
    }

    // Log error with context but don't show toast (let individual handlers decide)
    errorHandler.handleError(appError, {
      showToast: false,
      logError: true,
      context
    })

    return Promise.reject(appError)
  }
)

export default apiClient