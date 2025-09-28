import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToastNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  duration?: number
  persistent?: boolean
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  actions?: ToastAction[]
  progress?: number
  metadata?: {
    entityType?: string
    entityId?: string
    [key: string]: any
  }
}

export interface ToastAction {
  id: string
  label: string
  type: 'primary' | 'secondary'
  onClick: () => void
}

export interface NotificationToastProps {
  notifications: ToastNotification[]
  onRemove: (id: string) => void
  onActionClick?: (notificationId: string, actionId: string) => void
  maxVisible?: number
  className?: string
}

export interface ToastItemProps {
  notification: ToastNotification
  onRemove: (id: string) => void
  onActionClick?: (notificationId: string, actionId: string) => void
}

function ToastItem({ notification, onRemove, onActionClick }: ToastItemProps) {
  const [progress, setProgress] = useState(100)
  const [isVisible, setIsVisible] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const duration = notification.duration || 5000
  const isPersistent = notification.persistent || notification.type === 'error'

  useEffect(() => {
    // Fade in animation
    const fadeInTimer = setTimeout(() => setIsVisible(true), 100)

    let progressTimer: NodeJS.Timeout | undefined
    let removeTimer: NodeJS.Timeout | undefined

    if (!isPersistent) {
      // Progress countdown
      const startTime = Date.now()
      progressTimer = setInterval(() => {
        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
        setProgress(remaining)

        if (remaining <= 0) {
          clearInterval(progressTimer)
        }
      }, 50)

      // Auto remove
      removeTimer = setTimeout(() => {
        handleRemove()
      }, duration)
    }

    return () => {
      clearTimeout(fadeInTimer)
      if (progressTimer) clearInterval(progressTimer)
      if (removeTimer) clearTimeout(removeTimer)
    }
  }, [duration, isPersistent])

  const handleRemove = () => {
    setIsRemoving(true)
    setTimeout(() => {
      onRemove(notification.id)
    }, 300) // Wait for exit animation
  }

  const handleActionClick = (actionId: string, action: ToastAction) => {
    action.onClick()
    onActionClick?.(notification.id, actionId)
    if (!isPersistent) {
      handleRemove()
    }
  }

  const getIcon = () => {
    const icons = {
      success: <CheckCircle className="h-5 w-5 text-green-500" />,
      warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
      error: <XCircle className="h-5 w-5 text-red-500" />,
      info: <Info className="h-5 w-5 text-blue-500" />
    }
    return icons[notification.type]
  }

  const getColorClasses = () => {
    const colors = {
      success: 'border-l-green-500 bg-green-50/50',
      warning: 'border-l-yellow-500 bg-yellow-50/50',
      error: 'border-l-red-500 bg-red-50/50',
      info: 'border-l-blue-500 bg-blue-50/50'
    }
    return colors[notification.type]
  }

  return (
    <div
      className={cn(
        'transform transition-all duration-300 ease-out mb-3',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        isRemoving && 'translate-x-full opacity-0'
      )}
    >
      <Card className={cn(
        'shadow-lg border-l-4 relative overflow-hidden',
        getColorClasses()
      )}>
        {/* Progress bar for non-persistent notifications */}
        {!isPersistent && (
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
            <div
              className="h-full bg-primary transition-all duration-50 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-foreground mb-1">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {notification.message}
                  </p>

                  {/* Custom progress (different from auto-dismiss progress) */}
                  {notification.progress !== undefined && (
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="text-xs font-medium">{notification.progress}%</span>
                      </div>
                      <Progress value={notification.progress} className="h-2" />
                    </div>
                  )}

                  {/* Actions */}
                  {notification.actions && notification.actions.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {notification.actions.map((action) => (
                        <Button
                          key={action.id}
                          variant={action.type === 'primary' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleActionClick(action.id, action)}
                          className="text-xs"
                        >
                          {action.label}
                          {action.type === 'primary' && (
                            <ChevronRight className="h-3 w-3 ml-1" />
                          )}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {isPersistent && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Persistent
                    </Badge>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function NotificationToast({
  notifications,
  onRemove,
  onActionClick,
  maxVisible = 5,
  className
}: NotificationToastProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    // Create or get the toast container
    let toastContainer = document.getElementById('toast-container')
    if (!toastContainer) {
      toastContainer = document.createElement('div')
      toastContainer.id = 'toast-container'
      toastContainer.className = 'fixed z-[100] pointer-events-none'
      document.body.appendChild(toastContainer)
    }
    setContainer(toastContainer)

    return () => {
      // Clean up if no notifications
      if (notifications.length === 0 && toastContainer?.parentNode) {
        toastContainer.parentNode.removeChild(toastContainer)
      }
    }
  }, [notifications.length])

  if (!container || notifications.length === 0) {
    return null
  }

  // Get position classes based on the first notification's position
  const position = notifications[0]?.position || 'top-right'
  const getPositionClasses = () => {
    const positions = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    }
    return positions[position]
  }

  // Limit visible notifications
  const visibleNotifications = notifications.slice(0, maxVisible)
  const hiddenCount = notifications.length - maxVisible

  return createPortal(
    <div
      className={cn(
        'pointer-events-auto max-w-sm w-full',
        getPositionClasses(),
        className
      )}
    >
      {visibleNotifications.map((notification) => (
        <ToastItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
          onActionClick={onActionClick}
        />
      ))}

      {/* Show count of hidden notifications */}
      {hiddenCount > 0 && (
        <div className="text-center">
          <Badge variant="outline" className="text-xs">
            +{hiddenCount} more notification{hiddenCount !== 1 ? 's' : ''}
          </Badge>
        </div>
      )}
    </div>,
    container
  )
}

// Toast notification manager hook
export function useToastNotifications() {
  const [toasts, setToasts] = useState<ToastNotification[]>([])

  const addToast = (toast: Omit<ToastNotification, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    const newToast: ToastNotification = { ...toast, id }

    setToasts(prev => [newToast, ...prev])
    return id
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const updateToast = (id: string, updates: Partial<ToastNotification>) => {
    setToasts(prev => prev.map(toast =>
      toast.id === id ? { ...toast, ...updates } : toast
    ))
  }

  const clearAll = () => {
    setToasts([])
  }

  // Convenience methods
  const success = (title: string, message: string, options?: Partial<ToastNotification>) => {
    return addToast({ type: 'success', title, message, ...options })
  }

  const error = (title: string, message: string, options?: Partial<ToastNotification>) => {
    return addToast({ type: 'error', title, message, persistent: true, ...options })
  }

  const warning = (title: string, message: string, options?: Partial<ToastNotification>) => {
    return addToast({ type: 'warning', title, message, ...options })
  }

  const info = (title: string, message: string, options?: Partial<ToastNotification>) => {
    return addToast({ type: 'info', title, message, ...options })
  }

  const progress = (title: string, message: string, progressValue: number, options?: Partial<ToastNotification>) => {
    return addToast({
      type: 'info',
      title,
      message,
      progress: progressValue,
      persistent: true,
      ...options
    })
  }

  return {
    toasts,
    addToast,
    removeToast,
    updateToast,
    clearAll,
    success,
    error,
    warning,
    info,
    progress
  }
}