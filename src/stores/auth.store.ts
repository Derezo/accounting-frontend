import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  AuthState,
  User,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
} from '@/types/auth'
import { authService } from '@/services/auth.service'

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => void
  refreshAuth: () => Promise<void>
  setUser: (user: User) => void
  setTokens: (tokens: AuthTokens) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true, error: null })

          const response = await authService.login(credentials)

          // Store tokens
          authService.setStoredTokens(response.tokens)

          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          // Use the error message from the auth service if available, otherwise use response message
          const errorMessage = error.message || error.response?.data?.message || 'Login failed'
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          })
          throw error
        }
      },

      register: async (userData: RegisterRequest) => {
        try {
          set({ isLoading: true, error: null })

          const response = await authService.register(userData)

          // Store tokens
          authService.setStoredTokens(response.tokens)

          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Registration failed'
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          })
          throw error
        }
      },

      logout: () => {
        authService.removeStoredTokens()
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        })
      },

      refreshAuth: async () => {
        try {
          const storedTokens = authService.getStoredTokens()

          if (!storedTokens?.refreshToken) {
            throw new Error('No refresh token available')
          }

          if (authService.isTokenExpired(storedTokens.refreshToken)) {
            throw new Error('Refresh token expired')
          }

          const response = await authService.refreshToken(storedTokens.refreshToken)

          const newTokens = {
            ...storedTokens,
            ...response.tokens,
          }

          authService.setStoredTokens(newTokens)

          set({
            tokens: newTokens,
          })
        } catch (error) {
          // If refresh fails, logout
          get().logout()
          throw error
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      },

      setTokens: (tokens: AuthTokens) => {
        set({ tokens })
        authService.setStoredTokens(tokens)
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },

      initialize: async () => {
        try {
          set({ isLoading: true })

          const storedTokens = authService.getStoredTokens()

          if (!storedTokens?.accessToken) {
            set({ isLoading: false })
            return
          }

          // Check if access token is valid
          if (!authService.isTokenExpired(storedTokens.accessToken)) {
            // Token is valid, get current user
            const user = await authService.getCurrentUser()
            set({
              user,
              tokens: storedTokens,
              isAuthenticated: true,
              isLoading: false,
            })
          } else if (storedTokens.refreshToken && !authService.isTokenExpired(storedTokens.refreshToken)) {
            // Access token expired but refresh token is valid
            await get().refreshAuth()
            const user = await authService.getCurrentUser()
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            // Both tokens expired
            get().logout()
            set({ isLoading: false })
          }
        } catch (error) {
          get().logout()
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)