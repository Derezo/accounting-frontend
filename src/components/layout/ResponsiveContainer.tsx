import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useBreakpoint } from '@/hooks/useBreakpoint'

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  mobileLayout?: ReactNode
  tabletLayout?: ReactNode
  desktopLayout?: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function ResponsiveContainer({
  children,
  className,
  mobileLayout,
  tabletLayout,
  desktopLayout,
  maxWidth = 'full',
  padding = 'md'
}: ResponsiveContainerProps) {
  const { isMobile, isTablet, isDesktop } = useBreakpoint()

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  }

  const paddingClasses = {
    none: '',
    sm: 'p-2 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  }

  // Return specific layouts based on screen size
  if (isMobile && mobileLayout) {
    return (
      <div className={cn(
        'mx-auto w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className
      )}>
        {mobileLayout}
      </div>
    )
  }

  if (isTablet && tabletLayout) {
    return (
      <div className={cn(
        'mx-auto w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className
      )}>
        {tabletLayout}
      </div>
    )
  }

  if (isDesktop && desktopLayout) {
    return (
      <div className={cn(
        'mx-auto w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className
      )}>
        {desktopLayout}
      </div>
    )
  }

  // Default responsive layout
  return (
    <div className={cn(
      'mx-auto w-full',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  )
}

interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  cols?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'sm' | 'md' | 'lg'
}

export function ResponsiveGrid({
  children,
  className,
  cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
  gap = 'md'
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  }

  const gridClasses = [
    'grid',
    gapClasses[gap],
    cols.xs && `grid-cols-${cols.xs}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`
  ].filter(Boolean).join(' ')

  return (
    <div className={cn(gridClasses, className)}>
      {children}
    </div>
  )
}

interface ResponsiveStackProps {
  children: ReactNode
  className?: string
  direction?: {
    mobile?: 'vertical' | 'horizontal'
    tablet?: 'vertical' | 'horizontal'
    desktop?: 'vertical' | 'horizontal'
  }
  spacing?: 'sm' | 'md' | 'lg'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
}

export function ResponsiveStack({
  children,
  className,
  direction = { mobile: 'vertical', tablet: 'horizontal', desktop: 'horizontal' },
  spacing = 'md',
  align = 'start',
  justify = 'start'
}: ResponsiveStackProps) {
  const spacingClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  }

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  }

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  }

  const mobileDirection = direction.mobile === 'vertical' ? 'flex-col' : 'flex-row'
  const tabletDirection = direction.tablet === 'vertical' ? 'md:flex-col' : 'md:flex-row'
  const desktopDirection = direction.desktop === 'vertical' ? 'lg:flex-col' : 'lg:flex-row'

  return (
    <div className={cn(
      'flex',
      mobileDirection,
      tabletDirection,
      desktopDirection,
      spacingClasses[spacing],
      alignClasses[align],
      justifyClasses[justify],
      className
    )}>
      {children}
    </div>
  )
}

interface ResponsiveShowProps {
  children: ReactNode
  on?: ('mobile' | 'tablet' | 'desktop')[]
  className?: string
}

export function ResponsiveShow({ children, on = ['mobile', 'tablet', 'desktop'], className }: ResponsiveShowProps) {
  const showClasses = []

  if (on.includes('mobile')) {
    showClasses.push('block')
  } else {
    showClasses.push('hidden')
  }

  if (on.includes('tablet')) {
    showClasses.push('md:block')
  } else {
    showClasses.push('md:hidden')
  }

  if (on.includes('desktop')) {
    showClasses.push('lg:block')
  } else {
    showClasses.push('lg:hidden')
  }

  return (
    <div className={cn(showClasses.join(' '), className)}>
      {children}
    </div>
  )
}

interface ResponsiveHideProps {
  children: ReactNode
  on?: ('mobile' | 'tablet' | 'desktop')[]
  className?: string
}

export function ResponsiveHide({ children, on = [], className }: ResponsiveHideProps) {
  const hideClasses = []

  if (on.includes('mobile')) {
    hideClasses.push('hidden')
  } else {
    hideClasses.push('block')
  }

  if (on.includes('tablet')) {
    hideClasses.push('md:hidden')
  } else {
    hideClasses.push('md:block')
  }

  if (on.includes('desktop')) {
    hideClasses.push('lg:hidden')
  } else {
    hideClasses.push('lg:block')
  }

  return (
    <div className={cn(hideClasses.join(' '), className)}>
      {children}
    </div>
  )
}