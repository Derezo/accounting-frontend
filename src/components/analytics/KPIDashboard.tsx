import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  DollarSign,
  Users,
  ShoppingCart,
  Activity,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { KPIMetric, DateRange } from '@/types/advanced-analytics'

interface KPIDashboardProps {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  className?: string
}

export function KPIDashboard({ dateRange, onDateRangeChange, className }: KPIDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTimeframe, setSelectedTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('monthly')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mock KPI data
  const kpiData = useMemo(() => [
    {
      id: 'total-revenue',
      name: 'Total Revenue',
      value: 1567500,
      target: 1500000,
      change: 12.5,
      trend: 'UP' as const,
      category: 'finance',
      icon: DollarSign,
      color: 'green',
      format: 'CURRENCY' as const,
      period: 'This Month'
    },
    {
      id: 'active-customers',
      name: 'Active Customers',
      value: 1247,
      target: 1200,
      change: 8.3,
      trend: 'UP' as const,
      category: 'customers',
      icon: Users,
      color: 'blue',
      format: 'NUMBER' as const,
      period: 'This Month'
    },
    {
      id: 'conversion-rate',
      name: 'Conversion Rate',
      value: 23.4,
      target: 25.0,
      change: -2.1,
      trend: 'DOWN' as const,
      category: 'sales',
      icon: Target,
      color: 'orange',
      format: 'PERCENTAGE' as const,
      period: 'This Month'
    },
    {
      id: 'avg-order-value',
      name: 'Avg Order Value',
      value: 1258,
      target: 1200,
      change: 4.8,
      trend: 'UP' as const,
      category: 'sales',
      icon: ShoppingCart,
      color: 'purple',
      format: 'CURRENCY' as const,
      period: 'This Month'
    },
    {
      id: 'customer-satisfaction',
      name: 'Customer Satisfaction',
      value: 94.2,
      target: 90.0,
      change: 1.8,
      trend: 'UP' as const,
      category: 'customers',
      icon: CheckCircle,
      color: 'green',
      format: 'PERCENTAGE' as const,
      period: 'This Month'
    },
    {
      id: 'system-uptime',
      name: 'System Uptime',
      value: 99.8,
      target: 99.5,
      change: 0.1,
      trend: 'UP' as const,
      category: 'operations',
      icon: Activity,
      color: 'blue',
      format: 'PERCENTAGE' as const,
      period: 'This Month'
    }
  ], [])

  const filteredKPIs = useMemo(() => {
    if (selectedCategory === 'all') return kpiData
    return kpiData.filter(kpi => kpi.category === selectedCategory)
  }, [kpiData, selectedCategory])

  const categories = useMemo(() => [
    { value: 'all', label: 'All Categories' },
    { value: 'finance', label: 'Finance' },
    { value: 'customers', label: 'Customers' },
    { value: 'sales', label: 'Sales' },
    { value: 'operations', label: 'Operations' }
  ], [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const formatValue = (value: number, format: 'CURRENCY' | 'PERCENTAGE' | 'NUMBER') => {
    switch (format) {
      case 'CURRENCY':
        return `$${value.toLocaleString()}`
      case 'PERCENTAGE':
        return `${value}%`
      case 'NUMBER':
        return value.toLocaleString()
      default:
        return value.toString()
    }
  }

  const getProgressValue = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getTrendIcon = (trend: 'UP' | 'DOWN' | 'STABLE') => {
    switch (trend) {
      case 'UP':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'DOWN':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case 'STABLE':
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 bg-green-50'
    if (change < 0) return 'text-red-600 bg-red-50'
    return 'text-gray-600 bg-gray-50'
  }

  const renderKPICard = (kpi: typeof kpiData[0]) => {
    const Icon = kpi.icon
    const progressValue = getProgressValue(kpi.value, kpi.target)
    const isOnTarget = kpi.value >= kpi.target

    return (
      <Card key={kpi.id} className="relative overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={cn(
                'p-2 rounded-full',
                kpi.color === 'green' && 'bg-green-100 text-green-600',
                kpi.color === 'blue' && 'bg-blue-100 text-blue-600',
                kpi.color === 'orange' && 'bg-orange-100 text-orange-600',
                kpi.color === 'purple' && 'bg-purple-100 text-purple-600'
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-medium">{kpi.name}</CardTitle>
                <p className="text-xs text-muted-foreground">{kpi.period}</p>
              </div>
            </div>
            <Badge variant={isOnTarget ? 'default' : 'secondary'} className="text-xs">
              {isOnTarget ? 'On Target' : 'Below Target'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {formatValue(kpi.value, kpi.format)}
              </span>
              <div className="flex items-center space-x-1">
                {getTrendIcon(kpi.trend)}
                <span className={cn(
                  'text-sm font-medium px-2 py-1 rounded-full',
                  getChangeColor(kpi.change)
                )}>
                  {kpi.change > 0 ? '+' : ''}{kpi.change}%
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress to Target</span>
                <span>{formatValue(kpi.target, kpi.format)}</span>
              </div>
              <Progress value={progressValue} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {progressValue.toFixed(1)}% of target achieved
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderSummaryStats = () => {
    const totalKPIs = filteredKPIs.length
    const onTargetKPIs = filteredKPIs.filter(kpi => kpi.value >= kpi.target).length
    const improvingKPIs = filteredKPIs.filter(kpi => kpi.trend === 'UP').length
    const averageProgress = filteredKPIs.reduce((acc, kpi) => acc + getProgressValue(kpi.value, kpi.target), 0) / totalKPIs

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total KPIs</p>
                <p className="text-xl font-bold">{totalKPIs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">On Target</p>
                <p className="text-xl font-bold">{onTargetKPIs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Improving</p>
                <p className="text-xl font-bold">{improvingKPIs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Avg Progress</p>
                <p className="text-xl font-bold">{averageProgress.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">KPI Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor key performance indicators and track progress towards targets
          </p>
        </div>

        <div className="flex items-center space-x-2">
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

          <Select value={selectedTimeframe} onValueChange={(value: any) => setSelectedTimeframe(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      {renderSummaryStats()}

      {/* KPI Grid */}
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
            <Clock className="h-4 w-4" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredKPIs.map(renderKPICard)}
        </div>
      </div>

      {/* Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Badge className="bg-green-100 text-green-800">Positive</Badge>
              <div>
                <p className="font-medium">Revenue exceeding targets</p>
                <p className="text-sm text-muted-foreground">
                  Total revenue is 4.5% above target, driven by strong performance in enterprise accounts.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Badge variant="destructive">Attention</Badge>
              <div>
                <p className="font-medium">Conversion rate declining</p>
                <p className="text-sm text-muted-foreground">
                  Conversion rate has dropped 2.1% this month. Consider reviewing marketing campaigns and user experience.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Badge className="bg-blue-100 text-blue-800">Opportunity</Badge>
              <div>
                <p className="font-medium">Customer satisfaction improving</p>
                <p className="text-sm text-muted-foreground">
                  Customer satisfaction is trending upward, creating opportunities for upselling and referrals.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}