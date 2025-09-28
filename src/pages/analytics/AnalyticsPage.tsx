import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  FileText,
  CreditCard,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RevenueChart } from '@/components/analytics/RevenueChart'
import { CustomerChart } from '@/components/analytics/CustomerChart'
import { PaymentMethodChart } from '@/components/analytics/PaymentMethodChart'
import { ServicePerformanceChart } from '@/components/analytics/ServicePerformanceChart'
import { CashFlowChart } from '@/components/analytics/CashFlowChart'
import { ProjectStatusChart } from '@/components/analytics/ProjectStatusChart'
import { apiService } from '@/services/api.service'
import { useAuth } from '@/hooks/useAuth'
import { format, subDays, subMonths, subYears } from 'date-fns'

interface AnalyticsData {
  revenue: {
    total: number
    growth: number
    thisMonth: number
    lastMonth: number
    chartData: Array<{ date: string; amount: number }>
  }
  customers: {
    total: number
    new: number
    active: number
    growth: number
    chartData: Array<{ date: string; new: number; active: number }>
  }
  invoices: {
    total: number
    paid: number
    pending: number
    overdue: number
    averageValue: number
  }
  payments: {
    total: number
    methods: Array<{ method: string; amount: number; percentage: number }>
    processing: number
  }
  projects: {
    total: number
    active: number
    completed: number
    onTrack: number
    delayed: number
  }
  services: {
    topPerforming: Array<{ name: string; revenue: number; growth: number }>
    utilization: number
  }
  cashFlow: {
    inflow: number
    outflow: number
    net: number
    chartData: Array<{ date: string; inflow: number; outflow: number }>
  }
}

export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('revenue')
  const { hasPermission } = useAuth()

  // Calculate date ranges
  const getDateRange = (range: string) => {
    const now = new Date()
    switch (range) {
      case '7d':
        return { start: subDays(now, 7), end: now }
      case '30d':
        return { start: subDays(now, 30), end: now }
      case '90d':
        return { start: subDays(now, 90), end: now }
      case '6m':
        return { start: subMonths(now, 6), end: now }
      case '1y':
        return { start: subYears(now, 1), end: now }
      default:
        return { start: subDays(now, 30), end: now }
    }
  }

  const { start, end } = getDateRange(dateRange)

  // Fetch analytics data
  const { data: analytics, isLoading, refetch } = useQuery<AnalyticsData>({
    queryKey: ['analytics', dateRange, start, end],
    queryFn: () => apiService.getAnalytics({
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    }),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const getGrowthBadge = (growth: number) => {
    if (growth > 0) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <TrendingUp className="w-3 h-3 mr-1" />
          +{growth.toFixed(1)}%
        </Badge>
      )
    } else if (growth < 0) {
      return (
        <Badge className="bg-red-100 text-red-800">
          <TrendingDown className="w-3 h-3 mr-1" />
          {growth.toFixed(1)}%
        </Badge>
      )
    }
    return (
      <Badge className="bg-gray-100 text-gray-800">
        0%
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Analytics</h1>
          <p className="text-muted-foreground">
            Monitor your business performance and key metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.revenue.total.toLocaleString()}</div>
              <div className="flex items-center pt-1">
                {getGrowthBadge(analytics.revenue.growth)}
                <span className="text-xs text-muted-foreground ml-2">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.customers.active}</div>
              <div className="flex items-center pt-1">
                {getGrowthBadge(analytics.customers.growth)}
                <span className="text-xs text-muted-foreground ml-2">+{analytics.customers.new} new</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invoices Paid</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.invoices.paid}</div>
              <div className="flex items-center pt-1">
                <Progress
                  value={(analytics.invoices.paid / analytics.invoices.total) * 100}
                  className="w-full h-2"
                />
                <span className="text-xs text-muted-foreground ml-2">
                  {analytics.invoices.pending} pending
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.cashFlow.net >= 0 ? '+' : ''}${analytics.cashFlow.net.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                In: ${analytics.cashFlow.inflow.toLocaleString()} |
                Out: ${analytics.cashFlow.outflow.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueChart data={analytics?.revenue.chartData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Distribution of payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentMethodChart data={analytics?.payments.methods} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cash Flow</CardTitle>
                <CardDescription>Inflow vs outflow over time</CardDescription>
              </CardHeader>
              <CardContent>
                <CashFlowChart data={analytics?.cashFlow.chartData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Status</CardTitle>
                <CardDescription>Current project distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectStatusChart
                  data={{
                    active: analytics?.projects.active || 0,
                    completed: analytics?.projects.completed || 0,
                    onTrack: analytics?.projects.onTrack || 0,
                    delayed: analytics?.projects.delayed || 0,
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Analysis</CardTitle>
                <CardDescription>Detailed revenue breakdown and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueChart data={analytics?.revenue.chartData} />
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    ${analytics?.revenue.thisMonth.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    vs ${analytics?.revenue.lastMonth.toLocaleString()} last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Average Invoice</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${analytics?.invoices.averageValue.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Across {analytics?.invoices.total} invoices
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>New vs active customers over time</CardDescription>
              </CardHeader>
              <CardContent>
                <CustomerChart data={analytics?.customers.chartData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Customers</span>
                  <span className="text-lg font-bold">{analytics?.customers.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Active This Period</span>
                  <span className="text-lg font-bold text-green-600">{analytics?.customers.active}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">New This Period</span>
                  <span className="text-lg font-bold text-blue-600">{analytics?.customers.new}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Growth Rate</span>
                  {getGrowthBadge(analytics?.customers.growth || 0)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Distribution</CardTitle>
                <CardDescription>Current status of all projects</CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectStatusChart
                  data={{
                    active: analytics?.projects.active || 0,
                    completed: analytics?.projects.completed || 0,
                    onTrack: analytics?.projects.onTrack || 0,
                    delayed: analytics?.projects.delayed || 0,
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Projects</span>
                  <span className="text-lg font-bold">{analytics?.projects.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Active Projects</span>
                  <span className="text-lg font-bold text-blue-600">{analytics?.projects.active}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">On Track</span>
                  <span className="text-lg font-bold text-green-600">{analytics?.projects.onTrack}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Delayed</span>
                  <span className="text-lg font-bold text-red-600">{analytics?.projects.delayed}</span>
                </div>
                <div className="pt-2">
                  <Progress
                    value={(analytics?.projects.onTrack || 0) / (analytics?.projects.total || 1) * 100}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {((analytics?.projects.onTrack || 0) / (analytics?.projects.total || 1) * 100).toFixed(1)}% on track
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>How customers prefer to pay</CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentMethodChart data={analytics?.payments.methods} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Payments</span>
                  <span className="text-lg font-bold">${analytics?.payments.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Processing</span>
                  <span className="text-lg font-bold text-yellow-600">${analytics?.payments.processing.toLocaleString()}</span>
                </div>
                <div className="space-y-2">
                  {analytics?.payments.methods.map((method, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{method.method}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">${method.amount.toLocaleString()}</span>
                        <Badge variant="outline">{method.percentage.toFixed(1)}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Performance</CardTitle>
                <CardDescription>Revenue by service type</CardDescription>
              </CardHeader>
              <CardContent>
                <ServicePerformanceChart data={analytics?.services.topPerforming} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Utilization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Overall Utilization</span>
                  <span className="text-lg font-bold">{analytics?.services.utilization.toFixed(1)}%</span>
                </div>
                <Progress value={analytics?.services.utilization} className="w-full" />

                <div className="space-y-3 pt-4">
                  <h4 className="text-sm font-medium">Top Performing Services</h4>
                  {analytics?.services.topPerforming.map((service, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{service.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">${service.revenue.toLocaleString()}</span>
                        {getGrowthBadge(service.growth)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}