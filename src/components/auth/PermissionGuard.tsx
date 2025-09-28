import { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/types/auth'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock, Eye, EyeOff } from 'lucide-react'

interface PermissionGuardProps {
  children: ReactNode
  permission?: string
  role?: UserRole
  resource?: string
  action?: 'read' | 'write' | 'delete'
  fallback?: ReactNode
  showFallback?: boolean
  hideWhenNoAccess?: boolean
  className?: string
}

/**
 * PermissionGuard component that conditionally renders children based on user permissions
 *
 * @param permission - Specific permission string (e.g., 'customers:write')
 * @param role - Required minimum role level
 * @param resource - Resource name to check with action (e.g., 'customers' with action 'write')
 * @param action - Action to check for resource ('read', 'write', 'delete')
 * @param fallback - Custom component to show when access is denied
 * @param showFallback - Whether to show a fallback when access is denied (default: true)
 * @param hideWhenNoAccess - If true, completely hide content when no access (overrides showFallback)
 * @param className - CSS classes for the fallback container
 */
export function PermissionGuard({
  children,
  permission,
  role,
  resource,
  action = 'read',
  fallback,
  showFallback = true,
  hideWhenNoAccess = false,
  className = ''
}: PermissionGuardProps) {
  const { user, hasRole, hasPermission, canAccess } = useAuth()

  // If user is not authenticated, deny access
  if (!user) {
    if (hideWhenNoAccess) return null
    if (!showFallback) return null

    return (
      <div className={className}>
        {fallback || (
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Please sign in to access this content.
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  // Check permissions based on provided props
  let hasAccess = false

  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (role) {
    hasAccess = hasRole(role)
  } else if (resource) {
    hasAccess = canAccess(resource, action)
  } else {
    // If no permission criteria specified, allow access
    hasAccess = true
  }

  // If user has access, render children
  if (hasAccess) {
    return <>{children}</>
  }

  // If no access and should hide completely
  if (hideWhenNoAccess) {
    return null
  }

  // If no access and should not show fallback
  if (!showFallback) {
    return null
  }

  // Show fallback for denied access
  return (
    <div className={className}>
      {fallback || (
        <Alert variant="destructive">
          <EyeOff className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this content.
            {role && ` Required role: ${role}`}
            {permission && ` Required permission: ${permission}`}
            {resource && ` Required access: ${action} ${resource}`}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

/**
 * Convenience component for role-based access control
 */
interface RoleGuardProps {
  children: ReactNode
  role: UserRole
  fallback?: ReactNode
  showFallback?: boolean
  hideWhenNoAccess?: boolean
  className?: string
}

export function RoleGuard({ role, ...props }: RoleGuardProps) {
  return <PermissionGuard role={role} {...props} />
}

/**
 * Convenience component for permission-based access control
 */
interface PermissionCheckProps {
  children: ReactNode
  permission: string
  fallback?: ReactNode
  showFallback?: boolean
  hideWhenNoAccess?: boolean
  className?: string
}

export function PermissionCheck({ permission, ...props }: PermissionCheckProps) {
  return <PermissionGuard permission={permission} {...props} />
}

/**
 * Convenience component for resource-action based access control
 */
interface ResourceGuardProps {
  children: ReactNode
  resource: string
  action?: 'read' | 'write' | 'delete'
  fallback?: ReactNode
  showFallback?: boolean
  hideWhenNoAccess?: boolean
  className?: string
}

export function ResourceGuard({ resource, action = 'read', ...props }: ResourceGuardProps) {
  return <PermissionGuard resource={resource} action={action} {...props} />
}

/**
 * Hook for conditional rendering based on permissions
 */
export function usePermissionGuard() {
  const { user, hasRole, hasPermission, canAccess } = useAuth()

  const checkPermission = (
    permission?: string,
    role?: UserRole,
    resource?: string,
    action: 'read' | 'write' | 'delete' = 'read'
  ): boolean => {
    if (!user) return false

    if (permission) {
      return hasPermission(permission)
    } else if (role) {
      return hasRole(role)
    } else if (resource) {
      return canAccess(resource, action)
    }

    return true
  }

  return {
    checkPermission,
    hasRole,
    hasPermission,
    canAccess,
    user
  }
}