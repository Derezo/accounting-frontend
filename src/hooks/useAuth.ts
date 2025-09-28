import { useAuthStore } from '@/stores/auth.store'
import { UserRole } from '@/types/auth'

export const useAuth = () => {
  const {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshAuth,
    setLoading,
    setError,
    clearError,
    initialize,
  } = useAuthStore()

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false

    const roleHierarchy: Record<UserRole, number> = {
      READONLY: 1,
      CONTRACTOR: 2,
      EMPLOYEE: 3,
      MANAGER: 4,
      ADMIN: 5,
      SUPER_ADMIN: 6,
    }

    return roleHierarchy[user.role] >= roleHierarchy[role]
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false

    // Define permissions based on roles
    const rolePermissions: Record<UserRole, string[]> = {
      SUPER_ADMIN: ['*'], // All permissions
      ADMIN: [
        'customers:read',
        'customers:write',
        'customers:delete',
        'quotes:read',
        'quotes:write',
        'quotes:delete',
        'invoices:read',
        'invoices:write',
        'invoices:delete',
        'payments:read',
        'payments:write',
        'payments:delete',
        'analytics:read',
        'users:read',
        'users:write',
      ],
      MANAGER: [
        'customers:read',
        'customers:write',
        'quotes:read',
        'quotes:write',
        'invoices:read',
        'invoices:write',
        'payments:read',
        'payments:write',
        'analytics:read',
      ],
      EMPLOYEE: [
        'customers:read',
        'customers:write',
        'quotes:read',
        'quotes:write',
        'invoices:read',
        'payments:read',
      ],
      CONTRACTOR: [
        'customers:read',
        'quotes:read',
        'invoices:read',
        'payments:read',
      ],
      READONLY: [
        'customers:read',
        'quotes:read',
        'invoices:read',
        'payments:read',
      ],
    }

    const userPermissions = rolePermissions[user.role] || []

    // Super admin has all permissions
    if (userPermissions.includes('*')) return true

    return userPermissions.includes(permission)
  }

  const canAccess = (resource: string, action: 'read' | 'write' | 'delete' = 'read'): boolean => {
    return hasPermission(`${resource}:${action}`)
  }

  return {
    // State
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    register,
    logout,
    refreshAuth,
    setLoading,
    setError,
    clearError,
    initialize,

    // Utilities
    hasRole,
    hasPermission,
    canAccess,
  }
}