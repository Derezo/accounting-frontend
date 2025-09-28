import React, { ReactNode, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAccessibility } from './AccessibilityProvider'
import { cn } from '@/lib/utils'
import { Eye, Palette, Type, Monitor, Sun, Moon, Contrast } from 'lucide-react'

interface ColorContrastIndicatorProps {
  foreground: string
  background: string
  text: string
  size?: 'small' | 'large'
  className?: string
}

export function ColorContrastIndicator({
  foreground,
  background,
  text,
  size = 'small',
  className
}: ColorContrastIndicatorProps) {
  const [contrastRatio, setContrastRatio] = useState<number>(0)
  const [wcagLevel, setWcagLevel] = useState<'fail' | 'aa' | 'aaa'>('fail')

  useEffect(() => {
    // Calculate contrast ratio
    const getLuminance = (rgb: string) => {
      const [r, g, b] = rgb.match(/\d+/g)?.map(Number) || [0, 0, 0]
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }

    const ratio = (getLuminance(foreground) + 0.05) / (getLuminance(background) + 0.05)
    const normalizedRatio = Math.max(ratio, 1 / ratio)

    setContrastRatio(normalizedRatio)

    // Determine WCAG compliance level
    const threshold = size === 'large' ? 3 : 4.5
    const aaaThreshold = size === 'large' ? 4.5 : 7

    if (normalizedRatio >= aaaThreshold) {
      setWcagLevel('aaa')
    } else if (normalizedRatio >= threshold) {
      setWcagLevel('aa')
    } else {
      setWcagLevel('fail')
    }
  }, [foreground, background, size])

  const levelColors = {
    fail: 'text-red-600 bg-red-50 border-red-200',
    aa: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    aaa: 'text-green-600 bg-green-50 border-green-200'
  }

  const levelText = {
    fail: 'FAIL',
    aa: 'AA',
    aaa: 'AAA'
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className="p-3 rounded border"
        style={{ color: foreground, backgroundColor: background }}
      >
        {text}
      </div>
      <div className={cn('inline-flex items-center px-2 py-1 rounded border text-xs font-medium', levelColors[wcagLevel])}>
        <span>Contrast: {contrastRatio.toFixed(2)}:1 - WCAG {levelText[wcagLevel]}</span>
      </div>
    </div>
  )
}

interface HighContrastToggleProps {
  className?: string
}

export function HighContrastToggle({ className }: HighContrastToggleProps) {
  const { preferences, updatePreferences, announceMessage } = useAccessibility()

  const handleToggle = (enabled: boolean) => {
    updatePreferences({ highContrast: enabled })
    announceMessage(enabled ? 'High contrast mode enabled' : 'High contrast mode disabled')

    // Apply high contrast CSS
    if (enabled) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Switch
        id="high-contrast"
        checked={preferences.highContrast}
        onCheckedChange={handleToggle}
        aria-describedby="high-contrast-desc"
      />
      <div className="space-y-0.5">
        <Label htmlFor="high-contrast" className="font-medium">
          High Contrast Mode
        </Label>
        <p id="high-contrast-desc" className="text-xs text-muted-foreground">
          Increases contrast for better visibility
        </p>
      </div>
    </div>
  )
}

interface FontSizeControlProps {
  className?: string
}

export function FontSizeControl({ className }: FontSizeControlProps) {
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'xl'>('medium')
  const { announceMessage } = useAccessibility()

  const fontSizes = {
    small: { scale: 0.875, label: 'Small' },
    medium: { scale: 1, label: 'Medium' },
    large: { scale: 1.125, label: 'Large' },
    xl: { scale: 1.25, label: 'Extra Large' }
  }

  const handleFontSizeChange = (size: typeof fontSize) => {
    setFontSize(size)
    const scale = fontSizes[size].scale
    document.documentElement.style.fontSize = `${16 * scale}px`
    announceMessage(`Font size changed to ${fontSizes[size].label}`)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="font-medium">Text Size</Label>
      <Select value={fontSize} onValueChange={handleFontSizeChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(fontSizes).map(([key, { label }]) => (
            <SelectItem key={key} value={key}>
              <span style={{ fontSize: `${fontSizes[key as keyof typeof fontSizes].scale}em` }}>
                {label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

interface MotionControlProps {
  className?: string
}

export function MotionControl({ className }: MotionControlProps) {
  const { preferences, updatePreferences, announceMessage } = useAccessibility()

  const handleToggle = (reducedMotion: boolean) => {
    updatePreferences({ reducedMotion })
    announceMessage(reducedMotion ? 'Reduced motion enabled' : 'Reduced motion disabled')

    // Apply motion preferences
    document.documentElement.style.setProperty(
      '--animation-duration',
      reducedMotion ? '0ms' : '200ms'
    )

    if (reducedMotion) {
      document.documentElement.classList.add('reduce-motion')
    } else {
      document.documentElement.classList.remove('reduce-motion')
    }
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Switch
        id="reduced-motion"
        checked={preferences.reducedMotion}
        onCheckedChange={handleToggle}
        aria-describedby="reduced-motion-desc"
      />
      <div className="space-y-0.5">
        <Label htmlFor="reduced-motion" className="font-medium">
          Reduce Motion
        </Label>
        <p id="reduced-motion-desc" className="text-xs text-muted-foreground">
          Minimizes animations and transitions
        </p>
      </div>
    </div>
  )
}

interface FocusIndicatorProps {
  children: ReactNode
  enhanced?: boolean
  className?: string
}

export function FocusIndicator({ children, enhanced = false, className }: FocusIndicatorProps) {
  return (
    <div
      className={cn(
        'focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        enhanced && 'focus-within:ring-4 focus-within:ring-blue-600 focus-within:ring-offset-4',
        className
      )}
    >
      {children}
    </div>
  )
}

interface AccessibilityPanelProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function AccessibilityPanel({ isOpen, onClose, className }: AccessibilityPanelProps) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto')

  const handleThemeChange = (newTheme: typeof theme) => {
    setTheme(newTheme)

    if (newTheme === 'auto') {
      document.documentElement.classList.remove('light', 'dark')
    } else {
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(newTheme)
    }
  }

  if (!isOpen) return null

  return (
    <Card className={cn('fixed top-4 right-4 w-80 z-50 shadow-lg', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Accessibility
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
        <CardDescription>
          Customize your viewing experience
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Theme Selection */}
        <div className="space-y-2">
          <Label className="font-medium flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Theme
          </Label>
          <Select value={theme} onValueChange={handleThemeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Light
                </div>
              </SelectItem>
              <SelectItem value="dark">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  Dark
                </div>
              </SelectItem>
              <SelectItem value="auto">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  System
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Font Size Control */}
        <div className="space-y-2">
          <Label className="font-medium flex items-center gap-2">
            <Type className="h-4 w-4" />
            Text Size
          </Label>
          <FontSizeControl />
        </div>

        {/* High Contrast Toggle */}
        <div className="space-y-2">
          <Label className="font-medium flex items-center gap-2">
            <Contrast className="h-4 w-4" />
            Visual Options
          </Label>
          <div className="space-y-3">
            <HighContrastToggle />
            <MotionControl />
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="p-3 bg-muted rounded-md">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1 py-0.5 bg-background rounded text-xs">?</kbd> to view keyboard shortcuts
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Hook for detecting system preferences
export function useSystemPreferences() {
  const [preferences, setPreferences] = useState({
    reducedMotion: false,
    highContrast: false,
    darkMode: false
  })

  useEffect(() => {
    // Check for reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotion = () => setPreferences(prev => ({ ...prev, reducedMotion: motionQuery.matches }))
    updateMotion()
    motionQuery.addListener(updateMotion)

    // Check for high contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)')
    const updateContrast = () => setPreferences(prev => ({ ...prev, highContrast: contrastQuery.matches }))
    updateContrast()
    contrastQuery.addListener(updateContrast)

    // Check for dark mode preference
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const updateDark = () => setPreferences(prev => ({ ...prev, darkMode: darkQuery.matches }))
    updateDark()
    darkQuery.addListener(updateDark)

    return () => {
      motionQuery.removeListener(updateMotion)
      contrastQuery.removeListener(updateContrast)
      darkQuery.removeListener(updateDark)
    }
  }, [])

  return preferences
}

// Utility component for accessible color palettes
interface AccessibleColorPaletteProps {
  colors: Array<{
    name: string
    value: string
    textColor?: string
  }>
  className?: string
}

export function AccessibleColorPalette({ colors, className }: AccessibleColorPaletteProps) {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-2', className)}>
      {colors.map((color) => (
        <div key={color.name} className="space-y-1">
          <div
            className="h-16 rounded border flex items-center justify-center text-sm font-medium"
            style={{
              backgroundColor: color.value,
              color: color.textColor || (color.value.includes('light') || color.value.includes('50') ? '#000' : '#fff')
            }}
          >
            {color.name}
          </div>
          <ColorContrastIndicator
            foreground={color.textColor || '#000'}
            background={color.value}
            text="Sample text"
            size="small"
          />
        </div>
      ))}
    </div>
  )
}