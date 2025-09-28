import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Users,
  FileText,
  Download,
  RefreshCw,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types for chart data
export interface ChartDataPoint {
  name: string
  value: number
  date?: string
  category?: string
  [key: string]: any
}

export interface MetricData {
  label: string
  value: number
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  currency?: string
  format?: 'currency' | 'number' | 'percentage'
  trend?: ChartDataPoint[]
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'area' | 'pie' | 'composed'
  title: string
  description?: string
  data: ChartDataPoint[]
  xAxisKey: string
  yAxisKey: string | string[]
  colors?: string[]
  showGrid?: boolean
  showLegend?: boolean
  showTooltip?: boolean
  height?: number
  isLoading?: boolean
  error?: string
}

// Chart color palettes
const chartColors = {
  primary: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  revenue: ['#059669', '#0891b2', '#7c3aed', '#db2777'],
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  }
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, formatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3 min-w-[150px]">
        <p className="font-medium text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.dataKey}:</span>
            </div>
            <span className="font-medium">
              {formatter ? formatter(entry.value, entry.dataKey) : entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// Metric card component
export interface MetricCardProps {
  metric: MetricData
  className?: string
  showTrend?: boolean
}

export function MetricCard({ metric, className, showTrend = true }: MetricCardProps) {
  const formatValue = (value: number, format?: string, currency?: string) => {
    switch (format) {
      case 'currency':
        return `${currency || '$'}${value.toLocaleString()}`
      case 'percentage':
        return `${value.toFixed(1)}%`
      default:
        return value.toLocaleString()
    }
  }

  const getTrendIcon = () => {
    if (!metric.change) return null

    if (metric.changeType === 'increase' || metric.change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />
    } else if (metric.changeType === 'decrease' || metric.change < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />
    }
    return null
  }

  const getChangeColor = () => {
    if (!metric.change) return 'text-muted-foreground'

    if (metric.changeType === 'increase' || metric.change > 0) {
      return 'text-green-600'
    } else if (metric.changeType === 'decrease' || metric.change < 0) {
      return 'text-red-600'
    }
    return 'text-muted-foreground'
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">{metric.label}</h3>
            {getTrendIcon()}
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {formatValue(metric.value, metric.format, metric.currency)}
            </div>

            {metric.change !== undefined && (
              <div className={cn('flex items-center gap-1 text-sm', getChangeColor())}>
                <span>
                  {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                </span>
                <span className="text-muted-foreground">vs last period</span>
              </div>
            )}
          </div>

          {showTrend && metric.trend && metric.trend.length > 0 && (
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={40}>
                <LineChart data={metric.trend}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={metric.change && metric.change > 0 ? '#10b981' : '#ef4444'}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Generic chart component
export interface GenericChartProps {
  config: ChartConfig
  onRefresh?: () => void
  onExport?: () => void
  className?: string
}

export function GenericChart({ config, onRefresh, onExport, className }: GenericChartProps) {
  const [timeRange, setTimeRange] = useState('30d')

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`
  const formatNumber = (value: number) => value.toLocaleString()

  if (config.isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <LoadingSpinner message="Loading chart data..." />
        </CardContent>
      </Card>
    )
  }

  if (config.error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{config.error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const renderChart = () => {
    const commonProps = {
      data: config.data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    }

    switch (config.type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={config.xAxisKey} />
            <YAxis tickFormatter={formatNumber} />
            {config.showTooltip && <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />}
            {config.showLegend && <Legend />}
            {Array.isArray(config.yAxisKey) ? (
              config.yAxisKey.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={config.colors?.[index] || chartColors.primary[index]}
                />
              ))
            ) : (
              <Bar dataKey={config.yAxisKey} fill={config.colors?.[0] || chartColors.primary[0]} />
            )}
          </BarChart>
        )

      case 'line':
        return (
          <LineChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={config.xAxisKey} />
            <YAxis tickFormatter={formatNumber} />
            {config.showTooltip && <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />}
            {config.showLegend && <Legend />}
            {Array.isArray(config.yAxisKey) ? (
              config.yAxisKey.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={config.colors?.[index] || chartColors.primary[index]}
                  strokeWidth={2}
                />
              ))
            ) : (
              <Line
                type="monotone"
                dataKey={config.yAxisKey}
                stroke={config.colors?.[0] || chartColors.primary[0]}
                strokeWidth={2}
              />
            )}
          </LineChart>
        )

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={config.xAxisKey} />
            <YAxis tickFormatter={formatNumber} />
            {config.showTooltip && <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />}
            {config.showLegend && <Legend />}
            {Array.isArray(config.yAxisKey) ? (
              config.yAxisKey.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stackId="1"
                  stroke={config.colors?.[index] || chartColors.primary[index]}
                  fill={config.colors?.[index] || chartColors.primary[index]}
                />
              ))
            ) : (
              <Area
                type="monotone"
                dataKey={config.yAxisKey}
                stroke={config.colors?.[0] || chartColors.primary[0]}
                fill={config.colors?.[0] || chartColors.primary[0]}
              />
            )}
          </AreaChart>
        )

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={config.data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={config.yAxisKey as string}
            >
              {config.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={config.colors?.[index] || chartColors.primary[index % chartColors.primary.length]} />
              ))}
            </Pie>
            {config.showTooltip && <Tooltip content={<CustomTooltip formatter={formatNumber} />} />}
          </PieChart>
        )

      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={config.xAxisKey} />
            <YAxis tickFormatter={formatNumber} />
            {config.showTooltip && <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />}
            {config.showLegend && <Legend />}
            <Bar dataKey="revenue" fill={chartColors.revenue[0]} />
            <Line type="monotone" dataKey="growth" stroke={chartColors.revenue[1]} strokeWidth={2} />
          </ComposedChart>
        )

      default:
        return null
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {config.type === 'bar' && <BarChart3 className="h-5 w-5" />}
              {config.type === 'pie' && <PieChartIcon className="h-5 w-5" />}
              {config.type === 'line' && <Activity className="h-5 w-5" />}
              {config.type === 'area' && <Activity className="h-5 w-5" />}
              {config.type === 'composed' && <BarChart3 className="h-5 w-5" />}
              {config.title}
            </CardTitle>
            {config.description && (
              <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>

            {onRefresh && (
              <Button variant="ghost" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}

            {onExport && (
              <Button variant="ghost" size="sm" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={config.height || 300}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Chart grid component for dashboard layouts
export interface ChartGridProps {
  charts: ChartConfig[]
  metrics?: MetricData[]
  onRefresh?: (chartId: string) => void
  onExport?: (chartId: string) => void
  className?: string
}

export function ChartGrid({ charts, metrics, onRefresh, onExport, className }: ChartGridProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Metrics Row */}
      {metrics && metrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} showTrend={true} />
          ))}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {charts.map((chart, index) => (
          <GenericChart
            key={index}
            config={chart}
            onRefresh={() => onRefresh?.(chart.title)}
            onExport={() => onExport?.(chart.title)}
          />
        ))}
      </div>
    </div>
  )
}

// Specialized chart components
export function RevenueChart({ data, height = 300, className }: {
  data: ChartDataPoint[]
  height?: number
  className?: string
}) {
  const config: ChartConfig = {
    type: 'area',
    title: 'Revenue Trend',
    description: 'Monthly revenue over time',
    data,
    xAxisKey: 'month',
    yAxisKey: 'revenue',
    colors: [chartColors.revenue[0]],
    showGrid: true,
    showTooltip: true,
    showLegend: false,
    height
  }

  return <GenericChart config={config} className={className} />
}

export function CustomerGrowthChart({ data, height = 300, className }: {
  data: ChartDataPoint[]
  height?: number
  className?: string
}) {
  const config: ChartConfig = {
    type: 'line',
    title: 'Customer Growth',
    description: 'New customers acquired over time',
    data,
    xAxisKey: 'month',
    yAxisKey: ['new_customers', 'total_customers'],
    colors: [chartColors.primary[0], chartColors.primary[1]],
    showGrid: true,
    showTooltip: true,
    showLegend: true,
    height
  }

  return <GenericChart config={config} className={className} />
}

export function InvoiceStatusChart({ data, height = 300, className }: {
  data: ChartDataPoint[]
  height?: number
  className?: string
}) {
  const config: ChartConfig = {
    type: 'pie',
    title: 'Invoice Status Distribution',
    description: 'Breakdown of invoice statuses',
    data,
    xAxisKey: 'status',
    yAxisKey: 'count',
    colors: [
      chartColors.status.success,
      chartColors.status.warning,
      chartColors.status.error,
      chartColors.status.info
    ],
    showTooltip: true,
    showLegend: true,
    height
  }

  return <GenericChart config={config} className={className} />
}