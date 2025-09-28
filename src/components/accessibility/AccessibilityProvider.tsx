import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AccessibilityContextType {
  announceMessage: (message: string, priority?: 'polite' | 'assertive') => void
  focusManagement: {
    setFocusTrap: (element: HTMLElement | null) => void
    restoreFocus: () => void
    moveFocusToMain: () => void
    skipToContent: () => void
  }
  preferences: {
    reducedMotion: boolean
    highContrast: boolean
    largeText: boolean
  }
  updatePreferences: (prefs: Partial<AccessibilityContextType['preferences']>) => void
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null)

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider')
  }
  return context
}

interface AccessibilityProviderProps {
  children: ReactNode
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [lastFocusedElement, setLastFocusedElement] = useState<HTMLElement | null>(null)
  const [preferences, setPreferences] = useState({
    reducedMotion: false,
    highContrast: false,
    largeText: false
  })

  // Live region for announcements
  const [announcer, setAnnouncer] = useState<HTMLElement | null>(null)

  // Setup effect for DOM elements and media queries
  useEffect(() => {
    // Create live regions for announcements
    const politeAnnouncer = document.createElement('div')
    politeAnnouncer.setAttribute('aria-live', 'polite')
    politeAnnouncer.setAttribute('aria-atomic', 'true')
    politeAnnouncer.setAttribute('aria-relevant', 'text')
    politeAnnouncer.className = 'sr-only'
    politeAnnouncer.id = 'polite-announcer'
    document.body.appendChild(politeAnnouncer)

    const assertiveAnnouncer = document.createElement('div')
    assertiveAnnouncer.setAttribute('aria-live', 'assertive')
    assertiveAnnouncer.setAttribute('aria-atomic', 'true')
    assertiveAnnouncer.setAttribute('aria-relevant', 'text')
    assertiveAnnouncer.className = 'sr-only'
    assertiveAnnouncer.id = 'assertive-announcer'
    document.body.appendChild(assertiveAnnouncer)

    setAnnouncer(politeAnnouncer)

    // Detect user preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotionPreference = () => {
      setPreferences(prev => ({ ...prev, reducedMotion: mediaQuery.matches }))
    }
    updateMotionPreference()

    // Use modern addEventListener instead of deprecated addListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateMotionPreference)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(updateMotionPreference)
    }

    const contrastQuery = window.matchMedia('(prefers-contrast: high)')
    const updateContrastPreference = () => {
      setPreferences(prev => ({ ...prev, highContrast: contrastQuery.matches }))
    }
    updateContrastPreference()

    if (contrastQuery.addEventListener) {
      contrastQuery.addEventListener('change', updateContrastPreference)
    } else {
      contrastQuery.addListener(updateContrastPreference)
    }

    return () => {
      document.body.removeChild(politeAnnouncer)
      document.body.removeChild(assertiveAnnouncer)

      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updateMotionPreference)
      } else {
        mediaQuery.removeListener(updateMotionPreference)
      }

      if (contrastQuery.removeEventListener) {
        contrastQuery.removeEventListener('change', updateContrastPreference)
      } else {
        contrastQuery.removeListener(updateContrastPreference)
      }
    }
  }, []) // Empty dependency array - only run once

  // Separate effect for applying CSS based on preferences
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--animation-duration',
      preferences.reducedMotion ? '0ms' : '200ms'
    )
  }, [preferences.reducedMotion])

  const announceMessage = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const targetAnnouncer = document.getElementById(
      priority === 'assertive' ? 'assertive-announcer' : 'polite-announcer'
    )
    if (targetAnnouncer) {
      targetAnnouncer.textContent = message
      // Clear after announcement to allow re-announcements
      setTimeout(() => {
        targetAnnouncer.textContent = ''
      }, 1000)
    }
  }

  const focusManagement = {
    setFocusTrap: (element: HTMLElement | null) => {
      if (element) {
        setLastFocusedElement(document.activeElement as HTMLElement)
        element.focus()
      }
    },

    restoreFocus: () => {
      if (lastFocusedElement) {
        lastFocusedElement.focus()
        setLastFocusedElement(null)
      }
    },

    moveFocusToMain: () => {
      const main = document.querySelector('main') || document.querySelector('[role="main"]')
      if (main) {
        (main as HTMLElement).focus()
      }
    },

    skipToContent: () => {
      const main = document.querySelector('main') || document.querySelector('[role="main"]')
      if (main) {
        (main as HTMLElement).focus()
        announceMessage('Skipped to main content')
      }
    }
  }

  const updatePreferences = (newPrefs: Partial<typeof preferences>) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }))
  }

  return (
    <AccessibilityContext.Provider
      value={{
        announceMessage,
        focusManagement,
        preferences,
        updatePreferences
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}