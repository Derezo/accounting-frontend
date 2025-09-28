import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Calendar,
  Filter,
  Download,
  Settings,
  Plus,
  RefreshCw,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAnalyticsDashboards, useKPIMetrics, useAIInsights } from '@/hooks/useAdvancedAnalytics'
import { useAuth } from '@/hooks/useAuth'
import type { AnalyticsDashboard, KPIMetric, AIInsight } from '@/types/advanced-analytics'

export default function AdvancedAnalyticsPage() {
  const { user } = useAuth()
  const [selectedDashboard, setSelectedDashboard] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: new Date().toISOString().split('T')[0],
    preset: 'LAST_30_DAYS' as const
  })
  const [activeTab, setActiveTab] = useState('dashboards')

  const { data: dashboards, isLoading: dashboardsLoading } = useAnalyticsDashboards()
  const { data: kpis, isLoading: kpisLoading } = useKPIMetrics({ dateRange })
  const { data: insights, isLoading: insightsLoading } = useAIInsights({
    dashboardId: selectedDashboard || undefined,
    dateRange
  })

  useEffect(() => {
    if (dashboards && dashboards.length > 0 && !selectedDashboard) {
      const defaultDashboard = dashboards.find(d => d.isDefault) || dashboards[0]
      setSelectedDashboard(defaultDashboard.id)
    }
  }, [dashboards, selectedDashboard])

  const handleDateRangeChange = (preset: string, customRange?: { start: string; end: string }) => {
    if (preset === 'CUSTOM' && customRange) {
      setDateRange({ ...customRange, preset: 'CUSTOM' })
    } else {
      const now = new Date()
      let start = new Date()

      switch (preset) {
        case 'LAST_7_DAYS':
          start.setDate(now.getDate() - 7)
          break
        case 'LAST_30_DAYS':
          start.setDate(now.getDate() - 30)
          break
        case 'LAST_90_DAYS':
          start.setDate(now.getDate() - 90)
          break
        case 'LAST_YEAR':
          start.setFullYear(now.getFullYear() - 1)
          break
        case 'YEAR_TO_DATE':
          start = new Date(now.getFullYear(), 0, 1)
          break
      }

      setDateRange({
        start: start.toISOString().split('T')[0],
        end: now.toISOString().split('T')[0],
        preset: preset as any
      })
    }
  }

  const renderKPIGrid = () => {
    if (kpisLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    const mockKPIs = [
      {
        id: 'revenue',
        name: 'Monthly Revenue',
        value: 156750,
        change: 12.5,
        trend: 'UP' as const,
        icon: DollarSign,
        color: 'green'
      },
      {
        id: 'customers',
        name: 'Active Customers',
        value: 1247,
        change: 8.3,
        trend: 'UP' as const,
        icon: Users,
        color: 'blue'
      },
      {
        id: 'conversion',
        name: 'Conversion Rate',
        value: 23.4,
        change: -2.1,
        trend: 'DOWN' as const,
        icon: Target,
        color: 'orange'
      },
      {
        id: 'activity',
        name: 'System Activity',
        value: 94.2,
        change: 1.8,
        trend: 'UP' as const,
        icon: Activity,
        color: 'purple'
      }
    ]

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockKPIs.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.id} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {kpi.name}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold">
                        {kpi.id === 'revenue' ? `$${kpi.value.toLocaleString()}` :
                         kpi.id === 'conversion' || kpi.id === 'activity' ? `${kpi.value}%` :
                         kpi.value.toLocaleString()}
                      </p>
                      <Badge
                        variant={kpi.trend === 'UP' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {kpi.trend === 'UP' ? '+' : ''}{kpi.change}%
                      </Badge>
                    </div>
                  </div>
                  <div className={cn(
                    'p-3 rounded-full',
                    kpi.color === 'green' && 'bg-green-100 text-green-600',
                    kpi.color === 'blue' && 'bg-blue-100 text-blue-600',
                    kpi.color === 'orange' && 'bg-orange-100 text-orange-600',
                    kpi.color === 'purple' && 'bg-purple-100 text-purple-600'
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  const renderDashboardWidgets = () => {
    const selectedDashboardData = dashboards?.find(d => d.id === selectedDashboard)

    if (!selectedDashboardData) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Select a dashboard to view widgets</p>
          </div>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
              <p className="text-muted-foreground">Chart will render here</p>
            </div>
          </CardContent>
        </Card>

        {/* Customer Analytics Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
              <p className="text-muted-foreground">Chart will render here</p>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
              <p className="text-muted-foreground">Chart will render here</p>
            </div>
          </CardContent>
        </Card>

        {/* Activity Overview Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
              <p className="text-muted-foreground">Chart will render here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderInsights = () => {
    if (insightsLoading) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-16 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    const mockInsights = [
      {
        id: '1',
        type: 'TREND' as const,
        title: 'Revenue Growth Accelerating',
        description: 'Monthly revenue has increased by 12.5% compared to last month, with strong performance in enterprise accounts.',
        confidence: 0.89,
        priority: 'HIGH' as const,
        generatedAt: new Date().toISOString()
      },
      {
        id: '2',
        type: 'ANOMALY' as const,
        title: 'Unusual Customer Activity Pattern',
        description: 'Customer engagement has dropped by 15% on weekends, suggesting potential optimization opportunities.',
        confidence: 0.76,
        priority: 'MEDIUM' as const,
        generatedAt: new Date().toISOString()
      },
      {
        id: '3',
        type: 'RECOMMENDATION' as const,
        title: 'Optimize Payment Processing',
        description: 'Consider implementing automated payment reminders to reduce outstanding invoices by an estimated 8%.',
        confidence: 0.82,
        priority: 'MEDIUM' as const,
        generatedAt: new Date().toISOString()
      }
    ]

    return (
      <div className="space-y-4">
        {mockInsights.map((insight) => (
          <Card key={insight.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      insight.priority === 'HIGH' ? 'destructive' :
                      insight.priority === 'MEDIUM' ? 'default' : 'secondary'
                    }>
                      {insight.priority}
                    </Badge>
                    <Badge variant="outline">
                      {insight.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(insight.confidence * 100)}% confidence
                    </span>
                  </div>
                  <h4 className="font-semibold">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(insight.generatedAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive business intelligence and performance insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Dashboard
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Date Range:</span>
            <div className="flex space-x-1">
              {['LAST_7_DAYS', 'LAST_30_DAYS', 'LAST_90_DAYS', 'YEAR_TO_DATE'].map((preset) => (
                <Button
                  key={preset}
                  variant={dateRange.preset === preset ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDateRangeChange(preset)}
                >
                  {preset.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                </Button>
              ))}
            </div>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Overview */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Key Performance Indicators</h2>
        {renderKPIGrid()}
      </div>

      {/* Main Analytics Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboards" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboards
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboards" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Interactive Dashboards</h3>
            {dashboards && dashboards.length > 0 && (
              <div className="flex space-x-2">
                {dashboards.map((dashboard) => (
                  <Button
                    key={dashboard.id}
                    variant={selectedDashboard === dashboard.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDashboard(dashboard.id)}
                  >
                    {dashboard.name}
                    {dashboard.isDefault && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Default
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            )}
          </div>
          {renderDashboardWidgets()}
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Advanced Reports</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </div>
          <Card>
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h4 className="font-semibold">Advanced Reporting Coming Soon</h4>
                  <p className="text-sm text-muted-foreground">
                    Build custom reports with drag-and-drop interface and advanced filtering
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">AI-Generated Insights</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Generate Insight
            </Button>
          </div>
          <ScrollArea className="h-96">
            {renderInsights()}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <h3 className="text-lg font-semibold">Analytics Preferences</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Auto-refresh interval</label>
                  <select className="border rounded px-2 py-1 text-sm">
                    <option>30 seconds</option>
                    <option>1 minute</option>
                    <option>5 minutes</option>
                    <option>Never</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Default date range</label>
                  <select className="border rounded px-2 py-1 text-sm">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>Year to date</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Currency display</label>
                  <select className="border rounded px-2 py-1 text-sm">
                    <option>USD ($)</option>
                    <option>CAD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Number format</label>
                  <select className="border rounded px-2 py-1 text-sm">
                    <option>1,234.56</option>
                    <option>1.234,56</option>
                    <option>1 234.56</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Status Indicator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Analytics Engine Status</span>
            </div>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Activity className="h-3 w-3" />
                <span>Real-time monitoring active</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}