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
      VIEWER: 1,
      EMPLOYEE: 2,
      ACCOUNTANT: 3,
      MANAGER: 4,
      ADMIN: 5,
      SUPER_ADMIN: 6,
    }

    return roleHierarchy[user.role] >= roleHierarchy[role]
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false

    // Define permissions based on roles - aligned with backend API capabilities
    const rolePermissions: Record<UserRole, string[]> = {
      SUPER_ADMIN: ['*'], // All permissions - system administration

      ADMIN: [
        // Organization operations, team management, financial oversight
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
        'projects:read',
        'projects:write',
        'projects:delete',
        'appointments:read',
        'appointments:write',
        'appointments:delete',
        'analytics:read',
        'analytics:write',
        'users:read',
        'users:write',
        'users:delete',
        'organization:read',
        'organization:write',
        'reports:read',
        'reports:write',
        'audit:read',
      ],

      MANAGER: [
        // Project oversight, customer management, performance tracking
        'customers:read',
        'customers:write',
        'quotes:read',
        'quotes:write',
        'quotes:delete',
        'invoices:read',
        'invoices:write',
        'payments:read',
        'payments:write',
        'projects:read',
        'projects:write',
        'appointments:read',
        'appointments:write',
        'analytics:read',
        'reports:read',
        'users:read',
      ],

      ACCOUNTANT: [
        // Financial operations, payment processing, compliance
        'customers:read',
        'customers:write',
        'quotes:read',
        'invoices:read',
        'invoices:write',
        'invoices:delete',
        'payments:read',
        'payments:write',
        'payments:delete',
        'projects:read',
        'analytics:read',
        'reports:read',
        'reports:write',
        'etransfer:read',
        'etransfer:write',
        'manual-payment:read',
        'manual-payment:write',
        'payment-analytics:read',
      ],

      EMPLOYEE: [
        // Task execution, time tracking, customer interaction
        'customers:read',
        'customers:write',
        'quotes:read',
        'quotes:write',
        'invoices:read',
        'payments:read',
        'projects:read',
        'projects:write',
        'appointments:read',
        'appointments:write',
      ],

      VIEWER: [
        // Read-only access, report viewing
        'customers:read',
        'quotes:read',
        'invoices:read',
        'payments:read',
        'projects:read',
        'appointments:read',
        'analytics:read',
        'reports:read',
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