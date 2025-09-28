import { ReactNode, ButtonHTMLAttributes } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/types/auth'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProtectedButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  children: ReactNode
  permission?: string
  role?: UserRole
  resource?: string
  action?: 'read' | 'write' | 'delete'
  onClick?: () => void
  onUnauthorized?: () => void
  hideWhenNoAccess?: boolean
  disableWhenNoAccess?: boolean
  showLockIcon?: boolean
  unauthorizedTooltip?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

/**
 * ProtectedButton component that handles permission-based button access
 *
 * @param permission - Specific permission string (e.g., 'customers:write')
 * @param role - Required minimum role level
 * @param resource - Resource name to check with action
 * @param action - Action to check for resource ('read', 'write', 'delete')
 * @param onClick - Function to call when button is clicked (only if authorized)
 * @param onUnauthorized - Function to call when unauthorized user clicks button
 * @param hideWhenNoAccess - If true, completely hide button when no access
 * @param disableWhenNoAccess - If true, disable button when no access (default: true)
 * @param showLockIcon - If true, show lock icon when disabled due to permissions
 * @param unauthorizedTooltip - Tooltip text to show when button is disabled due to permissions
 */
export function ProtectedButton({
  children,
  permission,
  role,
  resource,
  action = 'read',
  onClick,
  onUnauthorized,
  hideWhenNoAccess = false,
  disableWhenNoAccess = true,
  showLockIcon = false,
  unauthorizedTooltip,
  className,
  disabled,
  variant = 'default',
  size = 'default',
  ...props
}: ProtectedButtonProps) {
  const { user, hasRole, hasPermission, canAccess } = useAuth()

  // Check permissions
  let hasAccess = false

  if (!user) {
    hasAccess = false
  } else if (permission) {
    hasAccess = hasPermission(permission)
  } else if (role) {
    hasAccess = hasRole(role)
  } else if (resource) {
    hasAccess = canAccess(resource, action)
  } else {
    // If no permission criteria specified, allow access
    hasAccess = true
  }

  // Hide button if no access and hideWhenNoAccess is true
  if (!hasAccess && hideWhenNoAccess) {
    return null
  }

  // Determine if button should be disabled
  const isDisabled = disabled || (!hasAccess && disableWhenNoAccess)

  // Handle button click
  const handleClick = () => {
    if (!hasAccess) {
      onUnauthorized?.()
      return
    }

    onClick?.()
  }

  // Determine button content
  const buttonContent = (
    <>
      {!hasAccess && showLockIcon && <Lock className="h-4 w-4 mr-2" />}
      {children}
    </>
  )

  return (
    <Button
      {...props}
      variant={variant}
      size={size}
      className={cn(className)}
      disabled={isDisabled}
      onClick={handleClick}
      title={!hasAccess && unauthorizedTooltip ? unauthorizedTooltip : props.title}
    >
      {buttonContent}
    </Button>
  )
}

/**
 * Convenience components for common permission scenarios
 */

interface CreateButtonProps extends Omit<ProtectedButtonProps, 'action'> {
  resource: string
}

export function CreateButton({ resource, children = 'Create', ...props }: CreateButtonProps) {
  return (
    <ProtectedButton
      action="write"
      resource={resource}
      showLockIcon
      unauthorizedTooltip={`You don't have permission to create ${resource}`}
      {...props}
    >
      {children}
    </ProtectedButton>
  )
}

interface EditButtonProps extends Omit<ProtectedButtonProps, 'action'> {
  resource: string
}

export function EditButton({ resource, children = 'Edit', ...props }: EditButtonProps) {
  return (
    <ProtectedButton
      action="write"
      resource={resource}
      variant="outline"
      showLockIcon
      unauthorizedTooltip={`You don't have permission to edit ${resource}`}
      {...props}
    >
      {children}
    </ProtectedButton>
  )
}

interface DeleteButtonProps extends Omit<ProtectedButtonProps, 'action'> {
  resource: string
}

export function DeleteButton({ resource, children = 'Delete', ...props }: DeleteButtonProps) {
  return (
    <ProtectedButton
      action="delete"
      resource={resource}
      variant="destructive"
      showLockIcon
      unauthorizedTooltip={`You don't have permission to delete ${resource}`}
      {...props}
    >
      {children}
    </ProtectedButton>
  )
}

interface AdminButtonProps extends Omit<ProtectedButtonProps, 'role'> {}

export function AdminButton({ children = 'Admin Action', ...props }: AdminButtonProps) {
  return (
    <ProtectedButton
      role="ADMIN"
      showLockIcon
      unauthorizedTooltip="Admin access required"
      {...props}
    >
      {children}
    </ProtectedButton>
  )
}

interface ManagerButtonProps extends Omit<ProtectedButtonProps, 'role'> {}

export function ManagerButton({ children = 'Manager Action', ...props }: ManagerButtonProps) {
  return (
    <ProtectedButton
      role="MANAGER"
      showLockIcon
      unauthorizedTooltip="Manager access required"
      {...props}
    >
      {children}
    </ProtectedButton>
  )
}