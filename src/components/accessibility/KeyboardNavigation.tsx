import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useAccessibility } from './AccessibilityProvider'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  action: () => void
  description: string
  global?: boolean
}

interface KeyboardNavigationProps {
  shortcuts?: KeyboardShortcut[]
  children: ReactNode
  className?: string
  enableArrowNavigation?: boolean
  wrapNavigation?: boolean
}

export function KeyboardNavigation({
  shortcuts = [],
  children,
  className,
  enableArrowNavigation = false,
  wrapNavigation = true
}: KeyboardNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { announceMessage } = useAccessibility()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle shortcuts
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey
        const altMatch = shortcut.altKey ? event.altKey : !event.altKey
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey
        const metaMatch = shortcut.metaKey ? event.metaKey : !event.metaKey

        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch && altMatch && shiftMatch && metaMatch
        ) {
          event.preventDefault()
          shortcut.action()
          announceMessage(`Executed: ${shortcut.description}`)
          return
        }
      }

      // Handle arrow navigation if enabled
      if (enableArrowNavigation && containerRef.current) {
        const focusableElements = Array.from(
          containerRef.current.querySelectorAll(
            'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
          )
        ) as HTMLElement[]

        const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
        let newIndex = currentIndex

        switch (event.key) {
          case 'ArrowDown':
          case 'ArrowRight':
            event.preventDefault()
            newIndex = currentIndex + 1
            if (wrapNavigation && newIndex >= focusableElements.length) {
              newIndex = 0
            }
            break
          case 'ArrowUp':
          case 'ArrowLeft':
            event.preventDefault()
            newIndex = currentIndex - 1
            if (wrapNavigation && newIndex < 0) {
              newIndex = focusableElements.length - 1
            }
            break
          case 'Home':
            event.preventDefault()
            newIndex = 0
            break
          case 'End':
            event.preventDefault()
            newIndex = focusableElements.length - 1
            break
        }

        if (newIndex !== currentIndex && focusableElements[newIndex]) {
          focusableElements[newIndex].focus()
        }
      }
    }

    const target = containerRef.current || document
    target.addEventListener('keydown', handleKeyDown)

    return () => {
      target.removeEventListener('keydown', handleKeyDown)
    }
  }, [shortcuts, enableArrowNavigation, wrapNavigation, announceMessage])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

interface FocusManagerProps {
  children: ReactNode
  autoFocus?: boolean
  restoreFocus?: boolean
  className?: string
}

export function FocusManager({
  children,
  autoFocus = false,
  restoreFocus = false,
  className
}: FocusManagerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lastFocusedElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (restoreFocus) {
      lastFocusedElement.current = document.activeElement as HTMLElement
    }

    if (autoFocus && containerRef.current) {
      const firstFocusable = containerRef.current.querySelector(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement

      if (firstFocusable) {
        firstFocusable.focus()
      }
    }

    return () => {
      if (restoreFocus && lastFocusedElement.current) {
        lastFocusedElement.current.focus()
      }
    }
  }, [autoFocus, restoreFocus])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

interface SkipNavigationProps {
  links: Array<{
    href: string
    label: string
  }>
  className?: string
}

export function SkipNavigation({ links, className }: SkipNavigationProps) {
  return (
    <nav
      aria-label="Skip navigation"
      className={cn('sr-only focus-within:not-sr-only', className)}
    >
      <ul className="flex flex-wrap gap-2 p-2 bg-background border rounded-md shadow-lg">
        {links.map((link, index) => (
          <li key={index}>
            <a
              href={link.href}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary bg-primary-foreground border border-primary rounded-md hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              onClick={(e) => {
                e.preventDefault()
                const target = document.querySelector(link.href)
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth' })
                  ;(target as HTMLElement).focus()
                }
              }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

interface RovingTabIndexProps {
  children: ReactNode
  className?: string
  orientation?: 'horizontal' | 'vertical' | 'both'
  loop?: boolean
}

export function RovingTabIndex({
  children,
  className,
  orientation = 'both',
  loop = true
}: RovingTabIndexProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const elements = Array.from(
      containerRef.current.querySelectorAll('[role="button"], button, [tabindex]')
    ) as HTMLElement[]

    // Set initial tab indices
    elements.forEach((element, index) => {
      element.tabIndex = index === currentIndex ? 0 : -1
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      let newIndex = currentIndex

      const isHorizontal = orientation === 'horizontal' || orientation === 'both'
      const isVertical = orientation === 'vertical' || orientation === 'both'

      switch (event.key) {
        case 'ArrowRight':
          if (isHorizontal) {
            event.preventDefault()
            newIndex = currentIndex + 1
          }
          break
        case 'ArrowLeft':
          if (isHorizontal) {
            event.preventDefault()
            newIndex = currentIndex - 1
          }
          break
        case 'ArrowDown':
          if (isVertical) {
            event.preventDefault()
            newIndex = currentIndex + 1
          }
          break
        case 'ArrowUp':
          if (isVertical) {
            event.preventDefault()
            newIndex = currentIndex - 1
          }
          break
        case 'Home':
          event.preventDefault()
          newIndex = 0
          break
        case 'End':
          event.preventDefault()
          newIndex = elements.length - 1
          break
      }

      if (loop) {
        if (newIndex >= elements.length) newIndex = 0
        if (newIndex < 0) newIndex = elements.length - 1
      } else {
        newIndex = Math.max(0, Math.min(elements.length - 1, newIndex))
      }

      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex)
        elements[newIndex]?.focus()
      }
    }

    const handleFocus = (event: FocusEvent) => {
      const focusedIndex = elements.indexOf(event.target as HTMLElement)
      if (focusedIndex >= 0) {
        setCurrentIndex(focusedIndex)
      }
    }

    containerRef.current.addEventListener('keydown', handleKeyDown)
    containerRef.current.addEventListener('focusin', handleFocus)

    return () => {
      containerRef.current?.removeEventListener('keydown', handleKeyDown)
      containerRef.current?.removeEventListener('focusin', handleFocus)
    }
  }, [currentIndex, orientation, loop])

  return (
    <div ref={containerRef} className={className} role="group">
      {children}
    </div>
  )
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const { announceMessage } = useAccessibility()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey
        const altMatch = shortcut.altKey ? event.altKey : !event.altKey
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey
        const metaMatch = shortcut.metaKey ? event.metaKey : !event.metaKey

        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch && altMatch && shiftMatch && metaMatch
        ) {
          event.preventDefault()
          shortcut.action()
          announceMessage(`Executed: ${shortcut.description}`)
          return
        }
      }
    }

    if (shortcuts.some(s => s.global)) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [shortcuts, announceMessage])

  const getShortcutDisplay = (shortcut: KeyboardShortcut) => {
    const parts = []
    if (shortcut.ctrlKey) parts.push('Ctrl')
    if (shortcut.altKey) parts.push('Alt')
    if (shortcut.shiftKey) parts.push('Shift')
    if (shortcut.metaKey) parts.push('Cmd')
    parts.push(shortcut.key.toUpperCase())
    return parts.join(' + ')
  }

  return { getShortcutDisplay }
}

interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[]
  className?: string
}

export function KeyboardShortcutsHelp({ shortcuts, className }: KeyboardShortcutsHelpProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { getShortcutDisplay } = useKeyboardShortcuts([
    {
      key: '?',
      action: () => setIsVisible(!isVisible),
      description: 'Toggle keyboard shortcuts help',
      global: true
    }
  ])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4',
        className
      )}
      onClick={() => setIsVisible(false)}
    >
      <div
        className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-96 overflow-auto p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="shortcuts-title"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="shortcuts-title" className="text-lg font-semibold">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close shortcuts help"
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {shortcut.description}
              </span>
              <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded">
                {getShortcutDisplay(shortcut)}
              </kbd>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              Toggle this help
            </span>
            <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded">
              ?
            </kbd>
          </div>
        </div>
      </div>
    </div>
  )
}