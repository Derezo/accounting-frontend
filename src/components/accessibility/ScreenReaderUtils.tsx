import React, { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ScreenReaderOnlyProps {
  children: ReactNode
  className?: string
}

export function ScreenReaderOnly({ children, className }: ScreenReaderOnlyProps) {
  return (
    <span className={cn('sr-only', className)}>
      {children}
    </span>
  )
}

interface VisuallyHiddenProps {
  children: ReactNode
  className?: string
  focusable?: boolean
}

export function VisuallyHidden({ children, className, focusable = false }: VisuallyHiddenProps) {
  return (
    <span
      className={cn(
        'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
        focusable && 'focus:not-sr-only focus:w-auto focus:h-auto focus:p-2 focus:m-0 focus:overflow-visible focus:whitespace-normal',
        className
      )}
    >
      {children}
    </span>
  )
}

interface SkipLinkProps {
  href: string
  children: ReactNode
  className?: string
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50',
        'focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md',
        'focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring',
        'transition-all duration-200',
        className
      )}
      onClick={(e) => {
        e.preventDefault()
        const target = document.querySelector(href)
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' })
          ;(target as HTMLElement).focus()
        }
      }}
    >
      {children}
    </a>
  )
}

interface AriaAnnouncementProps {
  message: string
  priority?: 'polite' | 'assertive'
  clearAfter?: number
}

export function AriaAnnouncement({
  message,
  priority = 'polite',
  clearAfter = 1000
}: AriaAnnouncementProps) {
  React.useEffect(() => {
    const announcer = document.getElementById(
      priority === 'assertive' ? 'assertive-announcer' : 'polite-announcer'
    )

    if (announcer) {
      announcer.textContent = message

      if (clearAfter > 0) {
        const timer = setTimeout(() => {
          announcer.textContent = ''
        }, clearAfter)

        return () => clearTimeout(timer)
      }
    }
  }, [message, priority, clearAfter])

  return null
}

interface LandmarkProps {
  children: ReactNode
  role: 'main' | 'banner' | 'navigation' | 'contentinfo' | 'complementary' | 'region'
  'aria-label'?: string
  'aria-labelledby'?: string
  className?: string
}

export function Landmark({
  children,
  role,
  className,
  ...ariaProps
}: LandmarkProps) {
  const Tag = role === 'banner' ? 'header' :
             role === 'main' ? 'main' :
             role === 'navigation' ? 'nav' :
             role === 'contentinfo' ? 'footer' :
             'section'

  return (
    <Tag
      role={role}
      className={className}
      tabIndex={-1} // Allow programmatic focus
      {...ariaProps}
    >
      {children}
    </Tag>
  )
}

interface AccessibleHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: ReactNode
  className?: string
  id?: string
}

export function AccessibleHeading({
  level,
  children,
  className,
  id
}: AccessibleHeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements

  return React.createElement(
    Tag,
    {
      className: cn(className),
      id,
      tabIndex: -1 // Allow programmatic focus for navigation
    },
    children
  )
}

interface LoadingAnnouncementProps {
  isLoading: boolean
  loadingMessage?: string
  completeMessage?: string
}

export function LoadingAnnouncement({
  isLoading,
  loadingMessage = 'Loading',
  completeMessage = 'Content loaded'
}: LoadingAnnouncementProps) {
  const [previousLoading, setPreviousLoading] = React.useState(isLoading)

  React.useEffect(() => {
    if (isLoading !== previousLoading) {
      const message = isLoading ? loadingMessage : completeMessage
      const announcer = document.getElementById('polite-announcer')
      if (announcer) {
        announcer.textContent = message
        setTimeout(() => {
          announcer.textContent = ''
        }, 1000)
      }
    }
    setPreviousLoading(isLoading)
  }, [isLoading, loadingMessage, completeMessage])

  return null
}

interface FocusTrapProps {
  children: ReactNode
  enabled: boolean
  className?: string
}

export function FocusTrap({ children, enabled, className }: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!enabled || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Allow parent to handle escape
        e.stopPropagation()
      }
    }

    container.addEventListener('keydown', handleTabKey)
    container.addEventListener('keydown', handleEscape)

    // Focus first element when enabled
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
      container.removeEventListener('keydown', handleEscape)
    }
  }, [enabled])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}