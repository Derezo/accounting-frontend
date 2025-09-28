import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  ExternalLink,
  Play,
  Pause,
  Square
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StatusUpdate {
  id: string
  type: 'process' | 'task' | 'system' | 'sync' | 'export' | 'import' | 'backup'
  title: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused' | 'cancelled'
  progress?: number
  startTime: string
  endTime?: string
  duration?: number
  estimatedCompletion?: string
  metadata?: {
    totalItems?: number
    processedItems?: number
    failedItems?: number
    successRate?: number
    errorMessage?: string
    throughput?: number
    [key: string]: any
  }
  actions?: StatusAction[]
}

export interface StatusAction {
  id: string
  label: string
  type: 'primary' | 'secondary' | 'destructive'
  icon?: React.ReactNode
  onClick: () => void
  disabled?: boolean
}

export interface StatusUpdatesProps {
  updates: StatusUpdate[]
  onRefresh?: () => void
  onActionClick?: (updateId: string, actionId: string) => void
  onViewDetails?: (updateId: string) => void
  autoRefresh?: boolean
  refreshInterval?: number
  showCompleted?: boolean
  maxVisible?: number
  className?: string
}

export function StatusUpdates({
  updates,
  onRefresh,
  onActionClick,
  onViewDetails,
  autoRefresh = true,
  refreshInterval = 5000,
  showCompleted = true,
  maxVisible = 10,
  className
}: StatusUpdatesProps) {
  const [lastRefresh, setLastRefresh] = useState<string>('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      handleRefresh()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh?.()
      setLastRefresh(new Date().toISOString())
    } catch (error) {
      console.error('Failed to refresh status updates:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleActionClick = (updateId: string, actionId: string, action: StatusAction) => {
    action.onClick()
    onActionClick?.(updateId, actionId)
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <Clock className="h-4 w-4 text-gray-500" />,
      running: <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />,
      completed: <CheckCircle className="h-4 w-4 text-green-500" />,
      failed: <XCircle className="h-4 w-4 text-red-500" />,
      paused: <Pause className="h-4 w-4 text-yellow-500" />,
      cancelled: <Square className="h-4 w-4 text-gray-500" />
    }
    return icons[status as keyof typeof icons] || icons.pending
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'border-l-gray-400 bg-gray-50/50',
      running: 'border-l-blue-400 bg-blue-50/50',
      completed: 'border-l-green-400 bg-green-50/50',
      failed: 'border-l-red-400 bg-red-50/50',
      paused: 'border-l-yellow-400 bg-yellow-50/50',
      cancelled: 'border-l-gray-400 bg-gray-50/50'
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  const getTypeIcon = (type: string) => {
    const icons = {
      process: <Activity className="h-4 w-4" />,
      task: <CheckCircle className="h-4 w-4" />,
      system: <Zap className="h-4 w-4" />,
      sync: <RefreshCw className="h-4 w-4" />,
      export: <TrendingUp className="h-4 w-4" />,
      import: <TrendingDown className="h-4 w-4" />,
      backup: <Activity className="h-4 w-4" />
    }
    return icons[type as keyof typeof icons] || icons.process
  }

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  const getElapsedTime = (startTime: string, endTime?: string) => {
    const start = new Date(startTime).getTime()
    const end = endTime ? new Date(endTime).getTime() : Date.now()
    return end - start
  }

  const getEstimatedCompletion = (update: StatusUpdate) => {
    if (update.estimatedCompletion) {
      return new Date(update.estimatedCompletion).toLocaleTimeString()
    }
    return null
  }

  const getSuccessRate = (update: StatusUpdate) => {
    const { metadata } = update
    if (metadata?.totalItems && metadata?.processedItems !== undefined) {
      const processed = metadata.processedItems
      const failed = metadata.failedItems || 0
      const success = processed - failed
      return (success / processed) * 100
    }
    return metadata?.successRate || null
  }

  const getThroughput = (update: StatusUpdate) => {
    const { metadata } = update
    if (metadata?.throughput) {
      return `${metadata.throughput.toFixed(1)} items/sec`
    }

    if (metadata?.processedItems && update.startTime) {
      const elapsed = getElapsedTime(update.startTime, update.endTime) / 1000
      const throughput = metadata.processedItems / elapsed
      return `${throughput.toFixed(1)} items/sec`
    }

    return null
  }

  // Filter updates
  const filteredUpdates = updates
    .filter(update => showCompleted || update.status !== 'completed')
    .slice(0, maxVisible)

  const runningUpdates = updates.filter(u => u.status === 'running')
  const completedToday = updates.filter(u =>
    u.status === 'completed' &&
    new Date(u.endTime || u.startTime).toDateString() === new Date().toDateString()
  )
  const failedUpdates = updates.filter(u => u.status === 'failed')

  if (filteredUpdates.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Status Updates
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Active Processes</h3>
            <p className="text-muted-foreground">
              All processes are currently idle
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Status Updates
          </CardTitle>
          <div className="flex items-center gap-2">
            {autoRefresh && lastRefresh && (
              <span className="text-xs text-muted-foreground">
                Updated: {new Date(lastRefresh).toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{runningUpdates.length}</div>
            <div className="text-sm text-muted-foreground">Running</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedToday.length}</div>
            <div className="text-sm text-muted-foreground">Completed Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{failedUpdates.length}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="space-y-0">
            {filteredUpdates.map((update, index) => {
              const elapsedTime = getElapsedTime(update.startTime, update.endTime)
              const successRate = getSuccessRate(update)
              const throughput = getThroughput(update)
              const eta = getEstimatedCompletion(update)

              return (
                <div key={update.id}>
                  <div className={cn(
                    'p-4 border-l-4',
                    getStatusColor(update.status)
                  )}>
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-2 mt-0.5">
                            {getTypeIcon(update.type)}
                            {getStatusIcon(update.status)}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{update.title}</h4>
                            <p className="text-sm text-muted-foreground">{update.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {update.type}
                          </Badge>
                          {onViewDetails && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewDetails(update.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Progress */}
                      {update.progress !== undefined && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{update.progress}%</span>
                          </div>
                          <Progress value={update.progress} className="h-2" />
                        </div>
                      )}

                      {/* Metadata */}
                      {update.metadata && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {update.metadata.processedItems !== undefined && update.metadata.totalItems && (
                            <div>
                              <div className="text-muted-foreground">Items</div>
                              <div className="font-medium">
                                {update.metadata.processedItems} / {update.metadata.totalItems}
                              </div>
                            </div>
                          )}

                          {successRate !== null && (
                            <div>
                              <div className="text-muted-foreground">Success Rate</div>
                              <div className={cn(
                                'font-medium',
                                successRate >= 95 ? 'text-green-600' :
                                successRate >= 80 ? 'text-yellow-600' :
                                'text-red-600'
                              )}>
                                {successRate.toFixed(1)}%
                              </div>
                            </div>
                          )}

                          <div>
                            <div className="text-muted-foreground">Duration</div>
                            <div className="font-medium">{formatDuration(elapsedTime)}</div>
                          </div>

                          {throughput && (
                            <div>
                              <div className="text-muted-foreground">Throughput</div>
                              <div className="font-medium">{throughput}</div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ETA */}
                      {eta && update.status === 'running' && (
                        <Alert className="py-2">
                          <Clock className="h-4 w-4" />
                          <AlertDescription>
                            Estimated completion: {eta}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Error Message */}
                      {update.status === 'failed' && update.metadata?.errorMessage && (
                        <Alert variant="destructive" className="py-2">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            {update.metadata.errorMessage}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Actions */}
                      {update.actions && update.actions.length > 0 && (
                        <div className="flex gap-2">
                          {update.actions.map((action) => (
                            <Button
                              key={action.id}
                              variant={
                                action.type === 'primary' ? 'default' :
                                action.type === 'destructive' ? 'destructive' :
                                'outline'
                              }
                              size="sm"
                              onClick={() => handleActionClick(update.id, action.id, action)}
                              disabled={action.disabled}
                              className="text-xs gap-1"
                            >
                              {action.icon}
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {index < filteredUpdates.length - 1 && <Separator />}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// Hook for managing status updates
export function useStatusUpdates() {
  const [updates, setUpdates] = useState<StatusUpdate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addUpdate = useCallback((update: Omit<StatusUpdate, 'id' | 'startTime'>) => {
    const newUpdate: StatusUpdate = {
      ...update,
      id: `update-${Date.now()}-${Math.random()}`,
      startTime: new Date().toISOString()
    }

    setUpdates(prev => [newUpdate, ...prev])
    return newUpdate.id
  }, [])

  const updateStatus = useCallback((id: string, updates: Partial<StatusUpdate>) => {
    setUpdates(prev => prev.map(update =>
      update.id === id ? { ...update, ...updates } : update
    ))
  }, [])

  const removeUpdate = useCallback((id: string) => {
    setUpdates(prev => prev.filter(update => update.id !== id))
  }, [])

  const clearCompleted = useCallback(() => {
    setUpdates(prev => prev.filter(update => update.status !== 'completed'))
  }, [])

  const getActiveUpdates = useCallback(() => {
    return updates.filter(update => ['pending', 'running', 'paused'].includes(update.status))
  }, [updates])

  return {
    updates,
    isLoading,
    error,
    addUpdate,
    updateStatus,
    removeUpdate,
    clearCompleted,
    getActiveUpdates
  }
}