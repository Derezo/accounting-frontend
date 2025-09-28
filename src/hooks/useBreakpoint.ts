import { useState, useEffect } from 'react'

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface BreakpointConfig {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
}

const breakpoints: BreakpointConfig = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

export function useBreakpoint() {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('lg')
  const [windowWidth, setWindowWidth] = useState<number>(0)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setWindowWidth(width)

      if (width >= breakpoints['2xl']) {
        setCurrentBreakpoint('2xl')
      } else if (width >= breakpoints.xl) {
        setCurrentBreakpoint('xl')
      } else if (width >= breakpoints.lg) {
        setCurrentBreakpoint('lg')
      } else if (width >= breakpoints.md) {
        setCurrentBreakpoint('md')
      } else if (width >= breakpoints.sm) {
        setCurrentBreakpoint('sm')
      } else {
        setCurrentBreakpoint('xs')
      }
    }

    // Set initial value
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isBreakpoint = (breakpoint: Breakpoint) => {
    return currentBreakpoint === breakpoint
  }

  const isAboveBreakpoint = (breakpoint: Breakpoint) => {
    const current = breakpoints[currentBreakpoint]
    const target = breakpoints[breakpoint]
    return current >= target
  }

  const isBelowBreakpoint = (breakpoint: Breakpoint) => {
    const current = breakpoints[currentBreakpoint]
    const target = breakpoints[breakpoint]
    return current < target
  }

  const isMobile = isBelowBreakpoint('md')
  const isTablet = isBreakpoint('md')
  const isDesktop = isAboveBreakpoint('lg')

  return {
    breakpoint: currentBreakpoint,
    windowWidth,
    isBreakpoint,
    isAboveBreakpoint,
    isBelowBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    breakpoints
  }
}