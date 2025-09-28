import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { FocusTrap, ScreenReaderOnly } from './ScreenReaderUtils'
import { useAccessibility } from './AccessibilityProvider'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface AccessibleDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnEscape?: boolean
  closeOnOverlayClick?: boolean
  className?: string
  role?: 'dialog' | 'alertdialog'
  initialFocus?: string // selector or 'first' or 'close'
}

export function AccessibleDialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnEscape = true,
  closeOnOverlayClick = true,
  className,
  role = 'dialog',
  initialFocus = 'first'
}: AccessibleDialogProps) {
  const { announceMessage, focusManagement } = useAccessibility()
  const overlayRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = `dialog-title-${React.useId()}`
  const generatedDescriptionId = React.useId()
  const descriptionId = description ? `dialog-description-${generatedDescriptionId}` : undefined

  useEffect(() => {
    if (isOpen) {
      announceMessage(`${role === 'alertdialog' ? 'Alert dialog' : 'Dialog'} opened: ${title}`)

      // Set initial focus
      setTimeout(() => {
        if (dialogRef.current) {
          let elementToFocus: HTMLElement | null = null

          if (initialFocus === 'close') {
            elementToFocus = dialogRef.current.querySelector('[data-close-button]')
          } else if (initialFocus === 'first' || !initialFocus) {
            elementToFocus = dialogRef.current.querySelector(
              'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
            )
          } else {
            elementToFocus = dialogRef.current.querySelector(initialFocus)
          }

          if (elementToFocus) {
            focusManagement.setFocusTrap(elementToFocus)
          }
        }
      }, 100)
    }

    return () => {
      if (isOpen) {
        focusManagement.restoreFocus()
      }
    }
  }, [isOpen, title, role, initialFocus, announceMessage, focusManagement])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault()
        onClose()
        announceMessage('Dialog closed')
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, closeOnEscape, onClose, announceMessage])

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === overlayRef.current) {
      onClose()
      announceMessage('Dialog closed')
    }
  }

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  }

  if (!isOpen) return null

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      aria-hidden="false"
    >
      <FocusTrap enabled={isOpen} className={cn('w-full', sizeClasses[size])}>
        <div
          ref={dialogRef}
          role={role}
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          aria-modal="true"
          className={cn(
            'bg-background rounded-lg shadow-lg max-h-[90vh] overflow-auto',
            'focus:outline-none focus:ring-2 focus:ring-ring',
            className
          )}
          tabIndex={-1}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="space-y-1">
              <h2 id={titleId} className="text-lg font-semibold">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              data-close-button
              aria-label={`Close ${title} dialog`}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </FocusTrap>

      <ScreenReaderOnly>
        <div aria-live="polite" aria-atomic="true">
          {isOpen ? `${role === 'alertdialog' ? 'Alert dialog' : 'Dialog'} is open. Press Escape to close.` : ''}
        </div>
      </ScreenReaderOnly>
    </div>,
    document.body
  )
}

interface AccessibleAlertDialogProps extends Omit<AccessibleDialogProps, 'role'> {
  actions?: ReactNode
  variant?: 'info' | 'warning' | 'error' | 'success'
}

export function AccessibleAlertDialog({
  actions,
  variant = 'info',
  children,
  ...props
}: AccessibleAlertDialogProps) {
  const variantStyles = {
    info: 'border-blue-200 bg-blue-50',
    warning: 'border-yellow-200 bg-yellow-50',
    error: 'border-red-200 bg-red-50',
    success: 'border-green-200 bg-green-50'
  }

  return (
    <AccessibleDialog
      {...props}
      role="alertdialog"
      initialFocus="close"
      className={cn(variantStyles[variant], props.className)}
    >
      <div className="space-y-4">
        <div className="text-sm">
          {children}
        </div>

        {actions && (
          <div className="flex justify-end space-x-2 pt-4 border-t">
            {actions}
          </div>
        )}
      </div>
    </AccessibleDialog>
  )
}

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'info' | 'warning' | 'error'
  isDestructive?: boolean
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  isDestructive = false
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <AccessibleAlertDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      variant={variant}
      actions={
        <>
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? 'destructive' : 'default'}
            onClick={handleConfirm}
            autoFocus
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <p>{message}</p>
    </AccessibleAlertDialog>
  )
}

interface AccessibleTooltipProps {
  content: string
  children: ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  className?: string
}

export function AccessibleTooltip({
  content,
  children,
  placement = 'top',
  delay = 500,
  className
}: AccessibleTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const tooltipId = `tooltip-${React.useId()}`

  const showTooltip = () => {
    const id = setTimeout(() => setIsVisible(true), delay)
    setTimeoutId(id)
  }

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setIsVisible(false)
  }

  const placementClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {React.cloneElement(children as React.ReactElement, {
        'aria-describedby': isVisible ? tooltipId : undefined
      })}

      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className={cn(
            'absolute z-50 px-2 py-1 text-sm text-white bg-black rounded shadow-lg',
            'pointer-events-none whitespace-nowrap',
            placementClasses[placement],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}