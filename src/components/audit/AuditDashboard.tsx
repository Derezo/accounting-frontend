import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import {
  Shield,
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Database,
  Lock,
  Eye,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAudit } from '@/hooks/useAudit'
import { AuditTrail } from './AuditTrail'
import type { AuditLogEntry, AuditSeverity, AuditCategory, AuditAction, AuditEntityType } from '@/types/audit'

export interface AuditDashboardProps {
  className?: string
  onExport?: () => void
}

interface MetricCardProps {
  title: string
  value: number | string
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon: React.ReactNode
  description?: string
  trend?: Array<{ name: string; value: number }>
}

function MetricCard({ title, value, change, changeType, icon, description, trend }: MetricCardProps) {
  const getChangeColor = () => {
    if (changeType === 'increase') return 'text-green-600'
    if (changeType === 'decrease') return 'text-red-600'
    return 'text-muted-foreground'
  }

  const getChangeIcon = () => {
    if (changeType === 'increase') return <TrendingUp className="h-3 w-3" />
    if (changeType === 'decrease') return <TrendingDown className="h-3 w-3" />
    return null
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {icon}
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{value}</p>
              {change !== undefined && (
                <div className={cn('flex items-center gap-1 text-sm', getChangeColor())}>
                  {getChangeIcon()}
                  <span>{Math.abs(change)}% vs last period</span>
                </div>
              )}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          {trend && trend.length > 0 && (
            <div className="w-20 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={changeType === 'increase' ? '#10b981' : changeType === 'decrease' ? '#ef4444' : '#6b7280'}
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

export function AuditDashboard({ className, onExport }: AuditDashboardProps) {
  const [timeRange, setTimeRange] = useState('7d')
  const [activeTab, setActiveTab] = useState('overview')

  const {
    entries,
    summary,
    isLoading,
    error,
    metrics,
    fetchAuditLogs,
    exportAuditLogs
  } = useAudit({
    autoRefresh: true,
    refreshInterval: 30000
  })

  // Generate chart data based on entries
  const chartData = useMemo(() => {
    if (!entries || entries.length === 0) return {}

    // Activity over time
    const activityData = entries.reduce((acc, entry) => {
      const date = new Date(entry.timestamp).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const activityChart = Object.entries(activityData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString(),
        activities: count
      }))

    // Helper functions for chart colors
    const getActionColor = (action: AuditAction): string => {
      const colors = {
        CREATE: '#10b981',
        READ: '#3b82f6',
        UPDATE: '#f59e0b',
        DELETE: '#ef4444',
        LOGIN: '#10b981',
        LOGOUT: '#6b7280',
        LOGIN_FAILED: '#ef4444'
      }
      return colors[action as keyof typeof colors] || '#6b7280'
    }

    const getSeverityColor = (severity: AuditSeverity): string => {
      const colors = {
        LOW: '#10b981',
        MEDIUM: '#f59e0b',
        HIGH: '#f97316',
        CRITICAL: '#ef4444'
      }
      return colors[severity]
    }

    // Actions distribution
    const actionData = entries.reduce((acc, entry) => {
      acc[entry.action] = (acc[entry.action] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const actionChart = Object.entries(actionData)
      .map(([action, count]) => ({
        name: action.toLowerCase().replace('_', ' '),
        value: count,
        fill: getActionColor(action as AuditAction)
      }))

    // Severity distribution
    const severityData = entries.reduce((acc, entry) => {
      acc[entry.severity] = (acc[entry.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const severityChart = Object.entries(severityData)
      .map(([severity, count]) => ({
        name: severity.toLowerCase(),
        value: count,
        fill: getSeverityColor(severity as AuditSeverity)
      }))

    // User activity
    const userActivity = entries.reduce((acc, entry) => {
      const key = entry.userName
      if (!acc[key]) {
        acc[key] = { name: entry.userName, activities: 0, role: entry.userRole }
      }
      acc[key].activities++
      return acc
    }, {} as Record<string, { name: string; activities: number; role: string }>)

    const userActivityChart = Object.values(userActivity)
      .sort((a, b) => b.activities - a.activities)
      .slice(0, 10)

    // Security events over time
    const securityEvents = entries
      .filter(entry => entry.category === 'SECURITY' || entry.action === 'LOGIN_FAILED')
      .reduce((acc, entry) => {
        const date = new Date(entry.timestamp).toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const securityChart = Object.entries(securityEvents)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString(),
        events: count
      }))

    return {
      activityChart,
      actionChart,
      severityChart,
      userActivityChart,
      securityChart
    }
  }, [entries])


  const handleExport = async () => {
    try {
      await exportAuditLogs({
        format: 'csv',
        filter: {
          dateRange: {
            from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            to: new Date().toISOString().split('T')[0]
          }
        },
        includeDetails: true,
        includeChanges: true,
        includeMetadata: true
      })
      onExport?.()
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor system activity and security events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={fetchAuditLogs} disabled={isLoading}>
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {isLoading ? (
        <LoadingSpinner message="Loading audit dashboard..." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Activities"
              value={metrics.todayCount}
              change={12.5}
              changeType="increase"
              icon={<Activity className="h-5 w-5 text-blue-500" />}
              description="Events today"
            />
            <MetricCard
              title="Security Events"
              value={metrics.securityEvents}
              change={-8.3}
              changeType="decrease"
              icon={<Shield className="h-5 w-5 text-red-500" />}
              description="Security-related events"
            />
            <MetricCard
              title="Failed Logins"
              value={metrics.failedLogins}
              change={-25.1}
              changeType="decrease"
              icon={<Lock className="h-5 w-5 text-yellow-500" />}
              description="Failed authentication attempts"
            />
            <MetricCard
              title="Critical Events"
              value={metrics.criticalEvents}
              change={0}
              changeType="neutral"
              icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
              description="Critical severity events"
            />
          </div>

          {/* Charts and Details */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Over Time */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChartIcon className="h-5 w-5" />
                      Activity Over Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData.activityChart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="activities"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.1}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Actions Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                      Actions Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={chartData.actionChart}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.actionChart?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Users */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Most Active Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData.userActivityChart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="activities" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Severity Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Event Severity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={chartData.severityChart}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.severityChart?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Security Events Over Time */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security Events Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData.securityChart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="events"
                          stroke="#ef4444"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Recent Security Events */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Recent Security Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {entries
                        .filter(entry => entry.category === 'SECURITY' || entry.action === 'LOGIN_FAILED')
                        .slice(0, 5)
                        .map((entry) => (
                          <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Badge variant={entry.severity === 'CRITICAL' ? 'destructive' : 'secondary'}>
                                {entry.severity}
                              </Badge>
                              <div>
                                <p className="font-medium">{entry.action.replace('_', ' ')}</p>
                                <p className="text-sm text-muted-foreground">
                                  {entry.userName} • {new Date(entry.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline">{entry.category}</Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="details">
              <AuditTrail
                showSummary={false}
                maxHeight="500px"
                onExport={handleExport}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}