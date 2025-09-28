import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAuth } from '../useAuth'
import { useAuthStore } from '@/stores/auth.store'
import { createMockUser } from '@/lib/test-utils'
import { UserRole } from '@/types/auth'

describe('useAuth Hook', () => {
  beforeEach(() => {
    // Reset auth store
    useAuthStore.getState().logout()
  })

  describe('role hierarchy', () => {
    it('should correctly implement role hierarchy', () => {
      const testCases: Array<{
        userRole: UserRole
        requiredRole: UserRole
        expected: boolean
      }> = [
        // Super admin can access everything
        { userRole: 'SUPER_ADMIN', requiredRole: 'VIEWER', expected: true },
        { userRole: 'SUPER_ADMIN', requiredRole: 'ADMIN', expected: true },

        // Admin can access lower roles
        { userRole: 'ADMIN', requiredRole: 'MANAGER', expected: true },
        { userRole: 'ADMIN', requiredRole: 'EMPLOYEE', expected: true },
        { userRole: 'ADMIN', requiredRole: 'SUPER_ADMIN', expected: false },

        // Manager permissions
        { userRole: 'MANAGER', requiredRole: 'EMPLOYEE', expected: true },
        { userRole: 'MANAGER', requiredRole: 'ADMIN', expected: false },

        // Accountant permissions
        { userRole: 'ACCOUNTANT', requiredRole: 'EMPLOYEE', expected: true },
        { userRole: 'ACCOUNTANT', requiredRole: 'MANAGER', expected: false },

        // Employee permissions
        { userRole: 'EMPLOYEE', requiredRole: 'EMPLOYEE', expected: true },
        { userRole: 'EMPLOYEE', requiredRole: 'MANAGER', expected: false },

        // Viewer permissions
        { userRole: 'VIEWER', requiredRole: 'VIEWER', expected: true },
        { userRole: 'VIEWER', requiredRole: 'EMPLOYEE', expected: false },
      ]

      testCases.forEach(({ userRole, requiredRole, expected }) => {
        const user = createMockUser({ role: userRole })
        useAuthStore.getState().setUser(user)

        const { result } = renderHook(() => useAuth())

        expect(result.current.hasRole(requiredRole)).toBe(expected)
      })
    })
  })

  describe('permission system', () => {
    const permissionTestCases = [
      {
        role: 'SUPER_ADMIN' as UserRole,
        permissions: ['*'], // All permissions
        testPermissions: [
          'customers:read',
          'customers:write',
          'customers:delete',
          'users:delete',
          'system:admin',
        ],
        expected: true,
      },
      {
        role: 'ADMIN' as UserRole,
        permissions: [
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
        testPermissions: ['customers:write', 'payments:delete', 'analytics:read'],
        expectedTrue: ['customers:write', 'payments:delete', 'analytics:read'],
        expectedFalse: ['system:admin'],
      },
      {
        role: 'MANAGER' as UserRole,
        permissions: [
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
        expectedTrue: ['customers:write', 'quotes:write', 'analytics:read'],
        expectedFalse: ['customers:delete', 'users:write'],
      },
      {
        role: 'ACCOUNTANT' as UserRole,
        permissions: [
          'customers:read',
          'customers:write',
          'quotes:read',
          'invoices:read',
          'invoices:write',
          'invoices:delete',
          'payments:read',
          'payments:write',
          'payments:delete',
          'analytics:read',
          'reports:read',
          'reports:write',
        ],
        expectedTrue: ['invoices:write', 'payments:delete', 'reports:write'],
        expectedFalse: ['customers:delete', 'users:write', 'quotes:write'],
      },
      {
        role: 'EMPLOYEE' as UserRole,
        permissions: [
          'customers:read',
          'customers:write',
          'quotes:read',
          'quotes:write',
          'invoices:read',
          'payments:read',
        ],
        expectedTrue: ['customers:read', 'quotes:write'],
        expectedFalse: ['customers:delete', 'payments:write', 'analytics:read'],
      },
      {
        role: 'VIEWER' as UserRole,
        permissions: [
          'customers:read',
          'quotes:read',
          'invoices:read',
          'payments:read',
          'projects:read',
          'appointments:read',
          'analytics:read',
          'reports:read',
        ],
        expectedTrue: ['customers:read', 'invoices:read'],
        expectedFalse: ['customers:write', 'quotes:write', 'payments:write'],
      },
    ]

    permissionTestCases.forEach(({ role, expectedTrue, expectedFalse }) => {
      describe(`${role} permissions`, () => {
        beforeEach(() => {
          const user = createMockUser({ role })
          useAuthStore.getState().setUser(user)
        })

        if (role === 'SUPER_ADMIN') {
          it('should have all permissions', () => {
            const { result } = renderHook(() => useAuth())

            // Test a variety of permissions
            const testPermissions = [
              'customers:read',
              'customers:write',
              'customers:delete',
              'system:admin',
              'users:delete',
            ]

            testPermissions.forEach((permission) => {
              expect(result.current.hasPermission(permission)).toBe(true)
            })
          })
        } else {
          it(`should have correct permissions for ${role}`, () => {
            const { result } = renderHook(() => useAuth())

            // Test permissions that should be true
            expectedTrue?.forEach((permission) => {
              expect(result.current.hasPermission(permission)).toBe(true)
            })

            // Test permissions that should be false
            expectedFalse?.forEach((permission) => {
              expect(result.current.hasPermission(permission)).toBe(false)
            })
          })
        }
      })
    })
  })

  describe('canAccess helper', () => {
    it('should correctly check resource access', () => {
      const user = createMockUser({ role: 'MANAGER' })
      useAuthStore.getState().setUser(user)

      const { result } = renderHook(() => useAuth())

      // Manager can read/write customers but not delete
      expect(result.current.canAccess('customers', 'read')).toBe(true)
      expect(result.current.canAccess('customers', 'write')).toBe(true)
      expect(result.current.canAccess('customers', 'delete')).toBe(false)

      // Manager can read users but not write
      expect(result.current.canAccess('users', 'read')).toBe(true)
      expect(result.current.canAccess('users', 'write')).toBe(false)
    })

    it('should default to read access', () => {
      const user = createMockUser({ role: 'EMPLOYEE' })
      useAuthStore.getState().setUser(user)

      const { result } = renderHook(() => useAuth())

      // Should default to read access
      expect(result.current.canAccess('customers')).toBe(true)
      expect(result.current.canAccess('customers', 'read')).toBe(true)
    })
  })

  describe('unauthenticated state', () => {
    it('should return false for all permissions when not authenticated', () => {
      // Ensure no user is set
      useAuthStore.getState().logout()

      const { result } = renderHook(() => useAuth())

      expect(result.current.hasRole('VIEWER')).toBe(false)
      expect(result.current.hasPermission('customers:read')).toBe(false)
      expect(result.current.canAccess('customers')).toBe(false)
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
    })
  })

  describe('integration with auth store', () => {
    it('should reflect auth store state changes', () => {
      const { result, rerender } = renderHook(() => useAuth())

      // Initially unauthenticated
      expect(result.current.isAuthenticated).toBe(false)

      // Set user
      const user = createMockUser({ role: 'ADMIN' })
      useAuthStore.getState().setUser(user)

      rerender()

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(user)
      expect(result.current.hasRole('ADMIN')).toBe(true)
    })

    it('should provide all auth store actions', () => {
      const { result } = renderHook(() => useAuth())

      // Check that all expected actions are available
      expect(typeof result.current.login).toBe('function')
      expect(typeof result.current.logout).toBe('function')
      expect(typeof result.current.register).toBe('function')
      expect(typeof result.current.refreshAuth).toBe('function')
      expect(typeof result.current.initialize).toBe('function')
    })
  })

  describe('financial role scenarios', () => {
    it('should handle accountant-specific permissions correctly', () => {
      const user = createMockUser({ role: 'ACCOUNTANT' })
      useAuthStore.getState().setUser(user)

      const { result } = renderHook(() => useAuth())

      // Accountant should be able to handle financial data
      expect(result.current.canAccess('invoices', 'read')).toBe(true)
      expect(result.current.canAccess('invoices', 'write')).toBe(true)
      expect(result.current.canAccess('payments', 'read')).toBe(true)
      expect(result.current.canAccess('payments', 'write')).toBe(true)
      expect(result.current.canAccess('reports', 'read')).toBe(true)
    })

    it('should restrict sensitive operations appropriately', () => {
      const user = createMockUser({ role: 'EMPLOYEE' })
      useAuthStore.getState().setUser(user)

      const { result } = renderHook(() => useAuth())

      // Employee should not be able to delete financial records
      expect(result.current.canAccess('invoices', 'delete')).toBe(false)
      expect(result.current.canAccess('payments', 'delete')).toBe(false)
      expect(result.current.canAccess('customers', 'delete')).toBe(false)

      // Employee should not access analytics
      expect(result.current.canAccess('analytics', 'read')).toBe(false)
    })
  })
})