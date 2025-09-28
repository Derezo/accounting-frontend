import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ChartGrid, MetricCard, GenericChart, ChartDataPoint, MetricData, ChartConfig } from './ChartComponents'
import { LoadingSpinner } from '@/components/ui/loading'
import {
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Download,
  Filter,
  Target,
  CreditCard,
  Clock,
  Activity,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DashboardProps {
  className?: string
  userId?: string
  dateRange?: string
  onRefresh?: () => void
}

// Mock data for analytics
const mockMetrics: MetricData[] = [
  {
    label: 'Total Revenue',
    value: 245680,
    change: 12.5,
    changeType: 'increase',
    currency: '$',
    format: 'currency',
    trend: [
      { name: 'Jan', value: 185000 },
      { name: 'Feb', value: 195000 },
      { name: 'Mar', value: 210000 },
      { name: 'Apr', value: 225000 },
      { name: 'May', value: 245680 }
    ]
  },
  {
    label: 'Outstanding Invoices',
    value: 18450,
    change: -8.2,
    changeType: 'decrease',
    currency: '$',
    format: 'currency',
    trend: [
      { name: 'Jan', value: 22000 },
      { name: 'Feb', value: 21500 },
      { name: 'Mar', value: 20000 },
      { name: 'Apr', value: 19500 },
      { name: 'May', value: 18450 }
    ]
  },
  {
    label: 'Active Customers',
    value: 1247,
    change: 15.3,
    changeType: 'increase',
    format: 'number',
    trend: [
      { name: 'Jan', value: 980 },
      { name: 'Feb', value: 1050 },
      { name: 'Mar', value: 1120 },
      { name: 'Apr', value: 1185 },
      { name: 'May', value: 1247 }
    ]
  },
  {
    label: 'Collection Rate',
    value: 94.2,
    change: 2.1,
    changeType: 'increase',
    format: 'percentage',
    trend: [
      { name: 'Jan', value: 91.5 },
      { name: 'Feb', value: 92.1 },
      { name: 'Mar', value: 93.0 },
      { name: 'Apr', value: 93.8 },
      { name: 'May', value: 94.2 }
    ]
  }
]

const mockRevenueData: ChartDataPoint[] = [
  { month: 'Jan', revenue: 185000, expenses: 125000, profit: 60000 },
  { month: 'Feb', revenue: 195000, expenses: 130000, profit: 65000 },
  { month: 'Mar', revenue: 210000, expenses: 135000, profit: 75000 },
  { month: 'Apr', revenue: 225000, expenses: 140000, profit: 85000 },
  { month: 'May', revenue: 245680, expenses: 145000, profit: 100680 },
  { month: 'Jun', revenue: 258000, expenses: 150000, profit: 108000 }
]

const mockCustomerData: ChartDataPoint[] = [
  { month: 'Jan', new_customers: 45, total_customers: 980, churn: 12 },
  { month: 'Feb', new_customers: 62, total_customers: 1050, churn: 8 },
  { month: 'Mar', new_customers: 58, total_customers: 1120, churn: 15 },
  { month: 'Apr', new_customers: 71, total_customers: 1185, churn: 9 },
  { month: 'May', new_customers: 68, total_customers: 1247, churn: 6 },
  { month: 'Jun', new_customers: 75, total_customers: 1322, churn: 11 }
]

const mockInvoiceData: ChartDataPoint[] = [
  { status: 'Paid', count: 856, value: 185000 },
  { status: 'Pending', count: 142, value: 32000 },
  { status: 'Overdue', count: 38, value: 18450 },
  { status: 'Draft', count: 25, value: 8200 }
]

const mockPaymentData: ChartDataPoint[] = [
  { method: 'Credit Card', count: 425, amount: 98500, percentage: 42.1 },
  { method: 'Bank Transfer', count: 315, amount: 125000, percentage: 34.8 },
  { method: 'Check', count: 156, amount: 35000, percentage: 17.2 },
  { method: 'Cash', count: 67, amount: 12200, percentage: 5.9 }
]

const mockCashFlowData: ChartDataPoint[] = [
  { week: 'Week 1', inflow: 45000, outflow: 32000, net: 13000 },
  { week: 'Week 2', inflow: 52000, outflow: 38000, net: 14000 },
  { week: 'Week 3', inflow: 48000, outflow: 35000, net: 13000 },
  { week: 'Week 4', inflow: 61000, outflow: 42000, net: 19000 }
]

export function Dashboard({ className, userId, dateRange = '30d', onRefresh }: DashboardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDateRange, setSelectedDateRange] = useState(dateRange)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => {
    fetchDashboardData()
  }, [selectedDateRange, userId])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // In real implementation:
      // const data = await analyticsService.getDashboardData(selectedDateRange, userId)

      setLastUpdated(new Date().toISOString())
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchDashboardData()
    onRefresh?.()
  }

  const handleExport = (chartType: string) => {
    console.log('Exporting chart:', chartType)
    // In real implementation, this would trigger chart export
  }

  const overviewCharts: ChartConfig[] = [
    {
      type: 'area',
      title: 'Revenue vs Expenses',
      description: 'Monthly revenue and expense comparison',
      data: mockRevenueData,
      xAxisKey: 'month',
      yAxisKey: ['revenue', 'expenses'],
      colors: ['#10b981', '#ef4444'],
      showGrid: true,
      showTooltip: true,
      showLegend: true,
      height: 300
    },
    {
      type: 'bar',
      title: 'Customer Acquisition',
      description: 'New customers vs churn rate',
      data: mockCustomerData,
      xAxisKey: 'month',
      yAxisKey: ['new_customers', 'churn'],
      colors: ['#3b82f6', '#f59e0b'],
      showGrid: true,
      showTooltip: true,
      showLegend: true,
      height: 300
    },
    {
      type: 'pie',
      title: 'Invoice Status Distribution',
      description: 'Current invoice status breakdown',
      data: mockInvoiceData,
      xAxisKey: 'status',
      yAxisKey: 'count',
      colors: ['#10b981', '#f59e0b', '#ef4444', '#6b7280'],
      showTooltip: true,
      showLegend: true,
      height: 300
    },
    {
      type: 'composed',
      title: 'Cash Flow Analysis',
      description: 'Weekly cash inflow and outflow',
      data: mockCashFlowData,
      xAxisKey: 'week',
      yAxisKey: ['inflow', 'outflow'],
      colors: ['#10b981', '#ef4444'],
      showGrid: true,
      showTooltip: true,
      showLegend: true,
      height: 300
    }
  ]

  const revenueCharts: ChartConfig[] = [
    {
      type: 'line',
      title: 'Monthly Revenue Trend',
      description: 'Revenue performance over the last 6 months',
      data: mockRevenueData,
      xAxisKey: 'month',
      yAxisKey: 'revenue',
      colors: ['#10b981'],
      showGrid: true,
      showTooltip: true,
      showLegend: false,
      height: 400
    },
    {
      type: 'bar',
      title: 'Profit Margins',
      description: 'Monthly profit after expenses',
      data: mockRevenueData,
      xAxisKey: 'month',
      yAxisKey: 'profit',
      colors: ['#3b82f6'],
      showGrid: true,
      showTooltip: true,
      showLegend: false,
      height: 300
    }
  ]

  const customerCharts: ChartConfig[] = [
    {
      type: 'area',
      title: 'Customer Growth',
      description: 'Total customer base growth over time',
      data: mockCustomerData,
      xAxisKey: 'month',
      yAxisKey: 'total_customers',
      colors: ['#8b5cf6'],
      showGrid: true,
      showTooltip: true,
      showLegend: false,
      height: 300
    },
    {
      type: 'pie',
      title: 'Payment Methods',
      description: 'Preferred payment methods by usage',
      data: mockPaymentData,
      xAxisKey: 'method',
      yAxisKey: 'count',
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
      showTooltip: true,
      showLegend: true,
      height: 300
    }
  ]

  if (isLoading && !lastUpdated) {
    return (
      <div className={cn('p-6', className)}>
        <LoadingSpinner size="lg" message="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your business performance and key metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
            Refresh
          </Button>

          <Button variant="outline" onClick={() => handleExport('dashboard')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last updated: {new Date(lastUpdated).toLocaleString()}</span>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockMetrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} showTrend={true} />
        ))}
      </div>

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="revenue" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="customers" className="gap-2">
            <Users className="h-4 w-4" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="operations" className="gap-2">
            <Activity className="h-4 w-4" />
            Operations
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <ChartGrid
            charts={overviewCharts}
            onRefresh={handleRefresh}
            onExport={handleExport}
          />

          {/* Quick Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Quick Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Revenue Growth</h4>
                  <p className="text-2xl font-bold text-green-600">+12.5%</p>
                  <p className="text-sm text-muted-foreground">
                    Revenue increased by $27K this month
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Top Customer Segment</h4>
                  <p className="text-lg font-bold">Enterprise</p>
                  <p className="text-sm text-muted-foreground">
                    Contributing 68% of total revenue
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Payment Efficiency</h4>
                  <p className="text-2xl font-bold text-blue-600">18.2 days</p>
                  <p className="text-sm text-muted-foreground">
                    Average payment collection time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {revenueCharts.map((chart, index) => (
              <GenericChart
                key={index}
                config={chart}
                onRefresh={handleRefresh}
                onExport={handleExport}
              />
            ))}
          </div>

          {/* Revenue Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Subscription Revenue</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">68%</Badge>
                    <span className="font-medium">$167,062</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>One-time Payments</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">24%</Badge>
                    <span className="font-medium">$58,963</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Professional Services</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">8%</Badge>
                    <span className="font-medium">$19,655</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {customerCharts.map((chart, index) => (
              <GenericChart
                key={index}
                config={chart}
                onRefresh={handleRefresh}
                onExport={handleExport}
              />
            ))}
          </div>

          {/* Customer Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Customer Lifetime Value</h3>
                  <div className="text-2xl font-bold">$4,267</div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>+8.3% vs last month</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Average Deal Size</h3>
                  <div className="text-2xl font-bold">$1,847</div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>+15.2% vs last month</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Churn Rate</h3>
                  <div className="text-2xl font-bold">2.1%</div>
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <TrendingUp className="h-4 w-4 rotate-180" />
                    <span>-0.5% vs last month</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Invoices Generated
                  </h3>
                  <div className="text-2xl font-bold">1,061</div>
                  <div className="text-sm text-muted-foreground">This month</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payments Processed
                  </h3>
                  <div className="text-2xl font-bold">963</div>
                  <div className="text-sm text-muted-foreground">This month</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Avg. Collection Time
                  </h3>
                  <div className="text-2xl font-bold">18.2</div>
                  <div className="text-sm text-muted-foreground">Days</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Operational Efficiency */}
          <Card>
            <CardHeader>
              <CardTitle>Operational Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Invoice Processing Time</span>
                    <span>2.3 hours (Target: 4 hours)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '57.5%' }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Payment Success Rate</span>
                    <span>94.2% (Target: 95%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '94.2%' }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Customer Response Time</span>
                    <span>4.1 hours (Target: 6 hours)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '68.3%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}