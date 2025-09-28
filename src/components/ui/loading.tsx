import { cn } from '@/lib/utils'
import { Loader2, RefreshCw, Clock, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  variant?: 'default' | 'fast' | 'pulse'
}

export function LoadingSpinner({ size = 'md', className, variant = 'default' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const Icon = variant === 'fast' ? Zap : Loader2

  return (
    <Icon
      className={cn(
        'animate-spin',
        sizeClasses[size],
        variant === 'pulse' && 'animate-pulse',
        className
      )}
    />
  )
}

interface LoadingSkeletonProps {
  className?: string
  rows?: number
  avatar?: boolean
}

export function LoadingSkeleton({ className, rows = 3, avatar = false }: LoadingSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {avatar && (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
            <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </div>
      )}

      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse" style={{ width: `${Math.random() * 40 + 60}%` }} />
          {Math.random() > 0.5 && (
            <div className="h-3 bg-muted rounded animate-pulse" style={{ width: `${Math.random() * 30 + 40}%` }} />
          )}
        </div>
      ))}
    </div>
  )
}

interface LoadingCardProps {
  title?: string
  description?: string
  className?: string
}

export function LoadingCard({ title = 'Loading...', description, className }: LoadingCardProps) {
  return (
    <Card className={cn('animate-pulse', className)}>
      <CardHeader className="space-y-2">
        <div className="flex items-center space-x-2">
          <LoadingSpinner size="sm" />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <LoadingSkeleton rows={2} />
      </CardContent>
    </Card>
  )
}

interface LoadingTableProps {
  columns: number
  rows: number
  showHeader?: boolean
  className?: string
}

export function LoadingTable({ columns, rows, showHeader = true, className }: LoadingTableProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {showHeader && (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded animate-pulse w-3/4" />
          ))}
        </div>
      )}

      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-6 bg-muted rounded animate-pulse"
              style={{ width: `${Math.random() * 30 + 70}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

interface LoadingListProps {
  items: number
  showAvatar?: boolean
  showBadge?: boolean
  className?: string
}

export function LoadingList({ items, showAvatar = false, showBadge = false, className }: LoadingListProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3 flex-1">
            {showAvatar && (
              <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
            )}
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {showBadge && (
              <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
            )}
            <div className="h-8 w-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

interface ProgressLoadingProps {
  progress?: number
  message?: string
  estimated?: string
  className?: string
}

export function ProgressLoading({ progress, message = 'Loading...', estimated, className }: ProgressLoadingProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <LoadingSpinner size="lg" className="mb-4" />

      <h3 className="text-lg font-semibold mb-2">{message}</h3>

      {progress !== undefined && (
        <div className="w-full max-w-xs mb-2">
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>{progress}%</span>
            {estimated && <span>{estimated}</span>}
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {estimated && progress === undefined && (
        <p className="text-sm text-muted-foreground">
          <Clock className="w-4 h-4 inline mr-1" />
          Estimated time: {estimated}
        </p>
      )}
    </div>
  )
}

interface LoadingStateProps {
  type: 'card' | 'table' | 'list' | 'skeleton' | 'spinner' | 'progress'
  title?: string
  message?: string
  progress?: number
  estimated?: string
  rows?: number
  columns?: number
  items?: number
  showAvatar?: boolean
  showBadge?: boolean
  className?: string
}

export function LoadingState({
  type,
  title = 'Loading...',
  message,
  progress,
  estimated,
  rows = 5,
  columns = 4,
  items = 5,
  showAvatar = false,
  showBadge = false,
  className
}: LoadingStateProps) {
  switch (type) {
    case 'card':
      return <LoadingCard title={title} description={message} className={className} />

    case 'table':
      return <LoadingTable columns={columns} rows={rows} className={className} />

    case 'list':
      return (
        <LoadingList
          items={items}
          showAvatar={showAvatar}
          showBadge={showBadge}
          className={className}
        />
      )

    case 'skeleton':
      return <LoadingSkeleton rows={rows} avatar={showAvatar} className={className} />

    case 'progress':
      return (
        <ProgressLoading
          progress={progress}
          message={message || title}
          estimated={estimated}
          className={className}
        />
      )

    case 'spinner':
    default:
      return (
        <div className={cn('flex items-center justify-center p-8', className)}>
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            {message && (
              <p className="text-sm text-muted-foreground">{message}</p>
            )}
          </div>
        </div>
      )
  }
}

// Button loading states
export function ButtonLoading({ children, isLoading, ...props }: any) {
  return (
    <button {...props} disabled={isLoading || props.disabled}>
      {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </button>
  )
}

// Page loading overlay
export function PageLoadingOverlay({ message = 'Loading page...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card p-6 rounded-lg shadow-lg border">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-center font-medium">{message}</p>
      </div>
    </div>
  )
}