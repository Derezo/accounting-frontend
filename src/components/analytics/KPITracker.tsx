import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  BarChart3,
  Activity,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  Download,
  Settings,
  Plus,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { KPIMetric, DateRange, PerformanceTarget } from '@/types/advanced-analytics'

interface KPITrackerProps {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  className?: string
}

interface KPIPerformanceData {
  current: number
  target: number
  previous: number
  trend: 'UP' | 'DOWN' | 'STABLE'
  changePercent: number
  progressPercent: number
  status: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL'
  history: Array<{ date: string; value: number }>
}

export function KPITracker({ dateRange, onDateRangeChange, className }: KPITrackerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTimeframe, setSelectedTimeframe] = useState<'realtime' | 'daily' | 'weekly' | 'monthly'>('daily')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Mock KPI metrics with performance data
  const kpiMetrics = useMemo(() => [
    {
      id: 'revenue-growth',
      name: 'Revenue Growth Rate',
      description: 'Month-over-month revenue growth percentage',
      category: 'financial',
      unit: 'PERCENTAGE',
      icon: TrendingUp,
      color: 'emerald',
      performance: {
        current: 12.5,
        target: 10.0,
        previous: 8.3,
        trend: 'UP' as const,
        changePercent: 50.6,
        progressPercent: 125,
        status: 'EXCELLENT' as const,
        history: [
          { date: '2024-01-01', value: 8.3 },
          { date: '2024-02-01', value: 9.1 },
          { date: '2024-03-01', value: 10.5 },
          { date: '2024-04-01', value: 12.5 }
        ]
      }
    },
    {
      id: 'customer-acquisition',
      name: 'Customer Acquisition Cost',
      description: 'Average cost to acquire a new customer',
      category: 'marketing',
      unit: 'CURRENCY',
      icon: Target,
      color: 'blue',
      performance: {
        current: 245,
        target: 300,
        previous: 280,
        trend: 'DOWN' as const,
        changePercent: -12.5,
        progressPercent: 82,
        status: 'EXCELLENT' as const,
        history: [
          { date: '2024-01-01', value: 280 },
          { date: '2024-02-01', value: 265 },
          { date: '2024-03-01', value: 255 },
          { date: '2024-04-01', value: 245 }
        ]
      }
    },
    {
      id: 'conversion-rate',
      name: 'Lead Conversion Rate',
      description: 'Percentage of leads that convert to customers',
      category: 'sales',
      unit: 'PERCENTAGE',
      icon: Zap,
      color: 'orange',
      performance: {
        current: 18.5,
        target: 20.0,
        previous: 19.2,
        trend: 'DOWN' as const,
        changePercent: -3.6,
        progressPercent: 92.5,
        status: 'WARNING' as const,
        history: [
          { date: '2024-01-01', value: 19.2 },
          { date: '2024-02-01', value: 19.8 },
          { date: '2024-03-01', value: 18.9 },
          { date: '2024-04-01', value: 18.5 }
        ]
      }
    },
    {
      id: 'customer-satisfaction',
      name: 'Customer Satisfaction Score',
      description: 'Average customer satisfaction rating',
      category: 'support',
      unit: 'SCORE',
      icon: CheckCircle2,
      color: 'green',
      performance: {
        current: 94.2,
        target: 90.0,
        previous: 92.8,
        trend: 'UP' as const,
        changePercent: 1.5,
        progressPercent: 105,
        status: 'EXCELLENT' as const,
        history: [
          { date: '2024-01-01', value: 92.8 },
          { date: '2024-02-01', value: 93.1 },
          { date: '2024-03-01', value: 93.8 },
          { date: '2024-04-01', value: 94.2 }
        ]
      }
    },
    {
      id: 'system-uptime',
      name: 'System Uptime',
      description: 'Percentage of time systems are operational',
      category: 'technical',
      unit: 'PERCENTAGE',
      icon: Activity,
      color: 'purple',
      performance: {
        current: 98.7,
        target: 99.5,
        previous: 99.1,
        trend: 'DOWN' as const,
        changePercent: -0.4,
        progressPercent: 99.2,
        status: 'WARNING' as const,
        history: [
          { date: '2024-01-01', value: 99.1 },
          { date: '2024-02-01', value: 99.3 },
          { date: '2024-03-01', value: 98.9 },
          { date: '2024-04-01', value: 98.7 }
        ]
      }
    },
    {
      id: 'response-time',
      name: 'Average Response Time',
      description: 'Average customer support response time',
      category: 'support',
      unit: 'TIME',
      icon: Clock,
      color: 'red',
      performance: {
        current: 2.8,
        target: 2.0,
        previous: 3.2,
        trend: 'DOWN' as const,
        changePercent: -12.5,
        progressPercent: 71,
        status: 'GOOD' as const,
        history: [
          { date: '2024-01-01', value: 3.2 },
          { date: '2024-02-01', value: 3.0 },
          { date: '2024-03-01', value: 2.9 },
          { date: '2024-04-01', value: 2.8 }
        ]
      }
    }
  ], [])

  const filteredMetrics = useMemo(() => {
    if (selectedCategory === 'all') return kpiMetrics
    return kpiMetrics.filter(metric => metric.category === selectedCategory)
  }, [kpiMetrics, selectedCategory])

  const categories = useMemo(() => [
    { value: 'all', label: 'All Categories' },
    { value: 'financial', label: 'Financial' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'support', label: 'Customer Support' },
    { value: 'technical', label: 'Technical' }
  ], [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const formatValue = (value: number, unit: string) => {
    switch (unit) {
      case 'CURRENCY':
        return `$${value.toLocaleString()}`
      case 'PERCENTAGE':
        return `${value}%`
      case 'SCORE':
        return `${value}/100`
      case 'TIME':
        return `${value}h`
      default:
        return value.toLocaleString()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXCELLENT':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'GOOD':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'WARNING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'CRITICAL':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTrendIcon = (trend: string, changePercent: number) => {
    if (trend === 'UP') {
      return <TrendingUp className="h-4 w-4 text-green-500" />
    } else if (trend === 'DOWN') {
      return <TrendingDown className={cn(
        "h-4 w-4",
        changePercent < 0 ? "text-red-500" : "text-green-500"
      )} />
    }
    return <div className="h-4 w-4 rounded-full bg-gray-300" />
  }

  const renderMetricCard = (metric: typeof kpiMetrics[0]) => {
    const Icon = metric.icon
    const performance = metric.performance

    return (
      <Card key={metric.id} className="group hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn(
                'p-2 rounded-lg',
                metric.color === 'emerald' && 'bg-emerald-100 text-emerald-600',
                metric.color === 'blue' && 'bg-blue-100 text-blue-600',
                metric.color === 'orange' && 'bg-orange-100 text-orange-600',
                metric.color === 'green' && 'bg-green-100 text-green-600',
                metric.color === 'purple' && 'bg-purple-100 text-purple-600',
                metric.color === 'red' && 'bg-red-100 text-red-600'
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">{metric.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Eye className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Edit className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current Value and Trend */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {formatValue(performance.current, metric.unit)}
              </div>
              <div className="flex items-center space-x-2">
                {getTrendIcon(performance.trend, performance.changePercent)}
                <span className={cn(
                  'text-sm font-medium',
                  performance.changePercent > 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {performance.changePercent > 0 ? '+' : ''}{performance.changePercent}%
                </span>
                <span className="text-xs text-muted-foreground">vs last period</span>
              </div>
            </div>
            <Badge className={cn('text-xs', getStatusColor(performance.status))}>
              {performance.status}
            </Badge>
          </div>

          {/* Progress to Target */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress to Target</span>
              <span>{formatValue(performance.target, metric.unit)}</span>
            </div>
            <Progress
              value={Math.min(performance.progressPercent, 100)}
              className={cn(
                "h-2",
                performance.progressPercent >= 100 && "progress-success"
              )}
            />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                {performance.progressPercent.toFixed(1)}% of target
              </span>
              <span className={cn(
                "font-medium",
                performance.progressPercent >= 100 ? "text-green-600" : "text-orange-600"
              )}>
                {performance.progressPercent >= 100 ? 'Target Exceeded' : 'Below Target'}
              </span>
            </div>
          </div>

          {/* Mini Chart Placeholder */}
          <div className="h-12 bg-muted rounded flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground ml-1">Trend Chart</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderSummaryStats = () => {
    const totalMetrics = filteredMetrics.length
    const excellentMetrics = filteredMetrics.filter(m => m.performance.status === 'EXCELLENT').length
    const warningMetrics = filteredMetrics.filter(m => m.performance.status === 'WARNING' || m.performance.status === 'CRITICAL').length
    const onTargetMetrics = filteredMetrics.filter(m => m.performance.progressPercent >= 100).length

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total KPIs</p>
                <p className="text-xl font-bold">{totalMetrics}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Excellent</p>
                <p className="text-xl font-bold">{excellentMetrics}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Needs Attention</p>
                <p className="text-xl font-bold">{warningMetrics}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">On Target</p>
                <p className="text-xl font-bold">{onTargetMetrics}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">KPI Performance Tracker</h2>
          <p className="text-muted-foreground">
            Real-time monitoring of key performance indicators and business metrics
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={selectedTimeframe} onValueChange={(value: any) => setSelectedTimeframe(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="realtime">Real-time</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Refresh
          </Button>

          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>

          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add KPI
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              List
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      {renderSummaryStats()}

      {/* KPI Metrics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Performance Metrics
            {selectedCategory !== 'all' && (
              <Badge variant="outline" className="ml-2">
                {categories.find(c => c.value === selectedCategory)?.label}
              </Badge>
            )}
          </h3>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span>
              {selectedTimeframe === 'realtime' ? 'Updating every 30 seconds' :
               `Updated ${selectedTimeframe}`}
            </span>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMetrics.map(renderMetricCard)}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMetrics.map(metric => (
              <Card key={metric.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        'p-2 rounded-lg',
                        metric.color === 'emerald' && 'bg-emerald-100 text-emerald-600',
                        metric.color === 'blue' && 'bg-blue-100 text-blue-600',
                        metric.color === 'orange' && 'bg-orange-100 text-orange-600',
                        metric.color === 'green' && 'bg-green-100 text-green-600',
                        metric.color === 'purple' && 'bg-purple-100 text-purple-600',
                        metric.color === 'red' && 'bg-red-100 text-red-600'
                      )}>
                        <metric.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">{metric.name}</h4>
                        <p className="text-sm text-muted-foreground">{metric.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-bold">
                          {formatValue(metric.performance.current, metric.unit)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Target: {formatValue(metric.performance.target, metric.unit)}
                        </div>
                      </div>
                      <Badge className={cn('text-xs', getStatusColor(metric.performance.status))}>
                        {metric.performance.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>Revenue Growth:</strong> Exceeding target by 25%. Consider scaling marketing efforts.
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>System Uptime:</strong> Below target. Investigate infrastructure issues immediately.
              </AlertDescription>
            </Alert>

            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <strong>Customer Satisfaction:</strong> Trending upward. Great opportunity for upselling.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}