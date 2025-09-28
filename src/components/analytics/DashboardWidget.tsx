import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  MoreHorizontal,
  Maximize2,
  Minimize2,
  RefreshCw,
  Settings,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DashboardWidget as WidgetType, WidgetData } from '@/types/advanced-analytics'

interface DashboardWidgetProps {
  widget: WidgetType
  data?: WidgetData
  isLoading?: boolean
  error?: string | null
  isExpanded?: boolean
  onToggleExpand?: () => void
  onRefresh?: () => void
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}

export function DashboardWidget({
  widget,
  data,
  isLoading = false,
  error = null,
  isExpanded = false,
  onToggleExpand,
  onRefresh,
  onEdit,
  onDelete,
  className
}: DashboardWidgetProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
  }

  const renderWidgetContent = () => {
    if (isLoading || isRefreshing) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="text-center space-y-2">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Loading widget data...</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )
    }

    switch (widget.type) {
      case 'METRIC':
        return renderMetricWidget()
      case 'CHART':
        return renderChartWidget()
      case 'TABLE':
        return renderTableWidget()
      case 'TEXT':
        return renderTextWidget()
      default:
        return (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>Unsupported widget type: {widget.type}</p>
          </div>
        )
    }
  }

  const renderMetricWidget = () => {
    const mockValue = 1247
    const mockChange = 12.5
    const mockTrend = 'UP'

    return (
      <div className="p-6">
        <div className="text-center space-y-4">
          <div className="text-3xl font-bold">
            {widget.config.format === 'CURRENCY' ? `$${mockValue.toLocaleString()}` :
             widget.config.format === 'PERCENTAGE' ? `${mockValue}%` :
             mockValue.toLocaleString()}
          </div>
          <div className="flex items-center justify-center space-x-2">
            {mockTrend === 'UP' ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : mockTrend === 'DOWN' ? (
              <TrendingDown className="h-4 w-4 text-red-500" />
            ) : (
              <Minus className="h-4 w-4 text-gray-500" />
            )}
            <Badge
              variant={mockTrend === 'UP' ? 'default' : mockTrend === 'DOWN' ? 'destructive' : 'secondary'}
            >
              {mockTrend === 'UP' ? '+' : mockTrend === 'DOWN' ? '-' : ''}{Math.abs(mockChange)}%
            </Badge>
          </div>
          {widget.config.description && (
            <p className="text-sm text-muted-foreground">{widget.config.description}</p>
          )}
        </div>
      </div>
    )
  }

  const renderChartWidget = () => {
    return (
      <div className="p-4">
        <div className={cn(
          "border-2 border-dashed border-muted rounded-lg flex items-center justify-center",
          isExpanded ? "h-96" : "h-48"
        )}>
          <div className="text-center space-y-2">
            <div className="text-muted-foreground">
              📊 {widget.config.chartType?.toUpperCase()} Chart
            </div>
            <p className="text-sm text-muted-foreground">
              Chart visualization will render here
            </p>
          </div>
        </div>
      </div>
    )
  }

  const renderTableWidget = () => {
    const mockData = [
      { name: 'Q1 Revenue', value: '$125,000', change: '+8.2%' },
      { name: 'Q2 Revenue', value: '$142,500', change: '+12.1%' },
      { name: 'Q3 Revenue', value: '$138,750', change: '+5.8%' },
      { name: 'Q4 Revenue', value: '$156,250', change: '+15.3%' }
    ]

    return (
      <div className="p-4">
        <div className="space-y-2">
          {mockData.map((row, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <span className="text-sm font-medium">{row.name}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm">{row.value}</span>
                <Badge variant="outline" className="text-xs">
                  {row.change}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderTextWidget = () => {
    return (
      <div className="p-6">
        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground">
            {widget.config.content || 'This is a text widget. Configure it to display custom content, insights, or instructions.'}
          </p>
        </div>
      </div>
    )
  }

  const getWidgetStatusIcon = () => {
    if (error) return <AlertTriangle className="h-3 w-3 text-red-500" />
    if (isLoading || isRefreshing) return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
    return <CheckCircle className="h-3 w-3 text-green-500" />
  }

  return (
    <Card className={cn(
      "relative transition-all duration-200",
      isExpanded && "col-span-2 row-span-2",
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-base">{widget.title}</CardTitle>
            {getWidgetStatusIcon()}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
            </Button>
            {onToggleExpand && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpand}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? (
                  <Minimize2 className="h-3 w-3" />
                ) : (
                  <Maximize2 className="h-3 w-3" />
                )}
              </Button>
            )}
            <div className="relative group">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
              <div className="absolute right-0 top-6 bg-white border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="py-1 min-w-32">
                  {onEdit && (
                    <button
                      onClick={onEdit}
                      className="w-full px-3 py-1 text-left text-sm hover:bg-muted flex items-center space-x-2"
                    >
                      <Settings className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={onDelete}
                      className="w-full px-3 py-1 text-left text-sm hover:bg-muted text-red-600 flex items-center space-x-2"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {widget.description && (
          <p className="text-xs text-muted-foreground">{widget.description}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {renderWidgetContent()}
        {widget.config.showLastUpdated && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(widget.updatedAt).toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}