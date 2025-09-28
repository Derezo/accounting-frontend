import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/types/auth'
import { LoadingState } from '@/components/ui/loading'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Lock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProtectedRouteProps {
  children: ReactNode
  permission?: string
  role?: UserRole
  resource?: string
  action?: 'read' | 'write' | 'delete'
  redirectTo?: string
  fallbackComponent?: ReactNode
  showAccessDenied?: boolean
}

/**
 * ProtectedRoute component that handles route-level authorization
 *
 * @param permission - Specific permission string (e.g., 'customers:write')
 * @param role - Required minimum role level
 * @param resource - Resource name to check with action
 * @param action - Action to check for resource ('read', 'write', 'delete')
 * @param redirectTo - Where to redirect unauthorized users (default: '/login')
 * @param fallbackComponent - Custom component to show for access denied
 * @param showAccessDenied - Whether to show access denied page instead of redirecting
 */
export function ProtectedRoute({
  children,
  permission,
  role,
  resource,
  action = 'read',
  redirectTo = '/login',
  fallbackComponent,
  showAccessDenied = false
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, hasRole, hasPermission, canAccess, logout } = useAuth()
  const location = useLocation()

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <LoadingState
        type="spinner"
        title="Loading..."
        message="Checking your permissions..."
        className="min-h-screen"
      />
    )
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
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
    // If no permission criteria specified, allow access for authenticated users
    hasAccess = true
  }

  // If user has access, render children
  if (hasAccess) {
    return <>{children}</>
  }

  // If access denied and should show custom fallback
  if (fallbackComponent) {
    return <>{fallbackComponent}</>
  }

  // If access denied and should show access denied page
  if (showAccessDenied) {
    return <AccessDeniedPage permission={permission} role={role} resource={resource} action={action} />
  }

  // Default: redirect to unauthorized page or login
  return (
    <Navigate
      to="/unauthorized"
      state={{ from: location, permission, role, resource, action }}
      replace
    />
  )
}

/**
 * Access Denied Page Component
 */
interface AccessDeniedPageProps {
  permission?: string
  role?: UserRole
  resource?: string
  action?: 'read' | 'write' | 'delete'
}

function AccessDeniedPage({ permission, role, resource, action }: AccessDeniedPageProps) {
  const { user, logout } = useAuth()

  const getRequirementText = () => {
    if (permission) {
      return `Required permission: ${permission}`
    } else if (role) {
      return `Required role: ${role}`
    } else if (resource) {
      return `Required access: ${action} ${resource}`
    }
    return 'You do not have the required permissions'
  }

  const getSuggestion = () => {
    if (user?.role === 'VIEWER') {
      return 'Your current role (Viewer) provides read-only access. Contact your administrator to request additional permissions.'
    } else if (user?.role === 'EMPLOYEE') {
      return 'Your current role (Employee) has limited access. Contact your manager or administrator for elevated permissions.'
    } else {
      return 'Contact your administrator to request the necessary permissions for this resource.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Lock className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Insufficient Permissions</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>{getRequirementText()}</p>
            <p className="text-sm">Current role: <strong>{user?.role}</strong></p>
          </AlertDescription>
        </Alert>

        <Alert>
          <AlertDescription>
            <strong>What can you do?</strong>
            <br />
            {getSuggestion()}
          </AlertDescription>
        </Alert>

        <div className="flex flex-col space-y-3">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="w-full"
          >
            Go Back
          </Button>

          <Button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full"
          >
            Go to Dashboard
          </Button>

          <Button
            onClick={() => logout()}
            variant="ghost"
            className="w-full text-gray-500"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Convenience components for common route protection scenarios
 */

interface AdminRouteProps {
  children: ReactNode
  fallbackComponent?: ReactNode
  showAccessDenied?: boolean
}

export function AdminRoute({ children, ...props }: AdminRouteProps) {
  return (
    <ProtectedRoute role="ADMIN" {...props}>
      {children}
    </ProtectedRoute>
  )
}

interface ManagerRouteProps {
  children: ReactNode
  fallbackComponent?: ReactNode
  showAccessDenied?: boolean
}

export function ManagerRoute({ children, ...props }: ManagerRouteProps) {
  return (
    <ProtectedRoute role="MANAGER" {...props}>
      {children}
    </ProtectedRoute>
  )
}

interface AccountantRouteProps {
  children: ReactNode
  fallbackComponent?: ReactNode
  showAccessDenied?: boolean
}

export function AccountantRoute({ children, ...props }: AccountantRouteProps) {
  return (
    <ProtectedRoute role="ACCOUNTANT" {...props}>
      {children}
    </ProtectedRoute>
  )
}

interface ResourceRouteProps {
  children: ReactNode
  resource: string
  action?: 'read' | 'write' | 'delete'
  fallbackComponent?: ReactNode
  showAccessDenied?: boolean
}

export function ResourceRoute({ resource, action = 'read', children, ...props }: ResourceRouteProps) {
  return (
    <ProtectedRoute resource={resource} action={action} {...props}>
      {children}
    </ProtectedRoute>
  )
}