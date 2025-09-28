import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  Target,
  TrendingUp,
  Activity,
  Brain,
  Calendar,
  Download,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { KPITracker } from '@/components/analytics/KPITracker'
import { KPIDashboard } from '@/components/analytics/KPIDashboard'
import { AIInsightsPanel } from '@/components/analytics/AIInsightsPanel'
import type { DateRange } from '@/types/advanced-analytics'

export default function PerformanceMetricsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: '2024-01-01',
    end: new Date().toISOString().split('T')[0],
    preset: 'LAST_30_DAYS'
  })
  const [activeTab, setActiveTab] = useState('overview')

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange)
  }

  const renderOverviewTab = () => {
    return (
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Active KPIs</p>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-xs text-muted-foreground">+2 this month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">On Target</p>
                  <p className="text-2xl font-bold">18</p>
                  <p className="text-xs text-muted-foreground">75% success rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Needs Attention</p>
                  <p className="text-2xl font-bold">4</p>
                  <p className="text-xs text-muted-foreground">17% of total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Improving</p>
                  <p className="text-2xl font-bold">15</p>
                  <p className="text-xs text-muted-foreground">63% trending up</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
              <div className="text-center space-y-2">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">Performance overview chart will render here</p>
                <p className="text-sm text-muted-foreground">
                  Showing KPI performance trends over {dateRange.preset.toLowerCase().replace('_', ' ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Performance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div>
                    <p className="font-medium">System Uptime Below Target</p>
                    <p className="text-sm text-muted-foreground">Current: 98.7% | Target: 99.5%</p>
                  </div>
                </div>
                <Badge variant="destructive">Critical</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div>
                    <p className="font-medium">Conversion Rate Declining</p>
                    <p className="text-sm text-muted-foreground">Down 3.6% from last period</p>
                  </div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div>
                    <p className="font-medium">Revenue Growth Exceeding Target</p>
                    <p className="text-sm text-muted-foreground">125% of monthly target achieved</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Excellent</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Metrics</h1>
          <p className="text-muted-foreground">
            Comprehensive performance monitoring and KPI tracking dashboard
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-medium">Real-time Monitoring Active</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Data source: Production systems
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              All Systems Operational
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="kpi-dashboard" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            KPI Dashboard
          </TabsTrigger>
          <TabsTrigger value="performance-tracker" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance Tracker
          </TabsTrigger>
          <TabsTrigger value="ai-insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="kpi-dashboard" className="mt-6">
          <KPIDashboard
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        </TabsContent>

        <TabsContent value="performance-tracker" className="mt-6">
          <KPITracker
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        </TabsContent>

        <TabsContent value="ai-insights" className="mt-6">
          <AIInsightsPanel
            context={{
              dateRange,
              dashboardId: 'performance-metrics'
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}