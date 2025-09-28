import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import {
  useCustomers,
  useQuotes,
  useInvoices,
  usePayments,
  // Analytics endpoints not available yet in accounting-api
  // useRevenueAnalytics,
  // useCustomerAnalytics,
  // usePaymentAnalytics,
} from '@/hooks/useAPI'
import {
  Users,
  FileText,
  Receipt,
  CreditCard,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ResponsiveContainer, ResponsiveGrid, ResponsiveStack, ResponsiveShow } from '@/components/layout/ResponsiveContainer'
import { useBreakpoint } from '@/hooks/useBreakpoint'

export function DashboardPage() {
  const { user } = useAuth()
  const { isMobile, isTablet } = useBreakpoint()
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly')

  // Data fetching
  const { data: customersData } = useCustomers({ limit: 1000 })
  const { data: quotesData } = useQuotes({ limit: 1000 })
  const { data: invoicesData } = useInvoices({ limit: 1000 })
  const { data: paymentsData } = usePayments({ limit: 1000 })

  // Analytics endpoints not available yet in accounting-api
  // const { data: revenueAnalytics } = useRevenueAnalytics(period)
  // const { data: customerAnalytics } = useCustomerAnalytics()
  // const { data: paymentAnalytics } = usePaymentAnalytics()

  // Calculate real-time statistics
  const calculateStats = () => {
    const customers = customersData?.data || []
    const quotes = quotesData?.data || []
    const invoices = invoicesData?.data || []
    const payments = paymentsData?.data || []

    const totalCustomers = customers.length
    const activeCustomers = customers.filter(c => c.status === 'ACTIVE').length

    const pendingQuotes = quotes.filter(q => q.status === 'SENT').length
    const draftQuotes = quotes.filter(q => q.status === 'DRAFT').length

    const unpaidInvoices = invoices.filter(i => i.status !== 'PAID').length
    const overdueInvoices = invoices.filter(i => {
      return new Date(i.dueDate) < new Date() && i.status !== 'PAID'
    }).length

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0)
    const paidRevenue = invoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + inv.amountPaid, 0)
    const outstandingRevenue = invoices.filter(inv => inv.status !== 'PAID').reduce((sum, inv) => sum + inv.amountDue, 0)

    const completedPayments = payments.filter(p => p.status === 'COMPLETED').length
    const pendingPayments = payments.filter(p => p.status === 'PENDING').length

    return {
      totalCustomers,
      activeCustomers,
      pendingQuotes,
      draftQuotes,
      unpaidInvoices,
      overdueInvoices,
      totalRevenue,
      paidRevenue,
      outstandingRevenue,
      completedPayments,
      pendingPayments,
    }
  }

  const stats = calculateStats()

  // Helper function to get revenue analytics data (disabled - endpoints not available)
  // const getRevenueData = () => {
  //   if (!revenueAnalytics) return null
  //   const data = Array.isArray(revenueAnalytics) ? revenueAnalytics[0] : revenueAnalytics
  //   return data || null
  // }

  // const revenueData = getRevenueData()
  const revenueData = null

  // Recent activity from the last 10 items across all entities
  const getRecentActivity = () => {
    const customers = customersData?.data || []
    const quotes = quotesData?.data || []
    const invoices = invoicesData?.data || []
    const payments = paymentsData?.data || []

    const activities = [
      ...customers.slice(0, 3).map(c => ({
        type: 'customer',
        title: 'New customer added',
        description: c.type === 'PERSON'
          ? `${c.person?.firstName} ${c.person?.lastName}`
          : c.business?.businessName,
        timestamp: c.createdAt,
        icon: Users,
        color: 'text-blue-600',
      })),
      ...quotes.slice(0, 3).map(q => ({
        type: 'quote',
        title: 'Quote created',
        description: `${q.quoteNumber} - ${formatCurrency(q.total)}`,
        timestamp: q.createdAt,
        icon: FileText,
        color: 'text-purple-600',
      })),
      ...invoices.slice(0, 3).map(i => ({
        type: 'invoice',
        title: i.status === 'PAID' ? 'Invoice paid' : 'Invoice created',
        description: `${i.invoiceNumber} - ${formatCurrency(i.total)}`,
        timestamp: i.updatedAt,
        icon: Receipt,
        color: i.status === 'PAID' ? 'text-green-600' : 'text-orange-600',
      })),
      ...payments.slice(0, 3).map(p => ({
        type: 'payment',
        title: 'Payment received',
        description: `${formatCurrency(p.amount)} via ${p.method.replace('_', ' ')}`,
        timestamp: p.createdAt,
        icon: CreditCard,
        color: 'text-green-600',
      })),
    ]

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8)
  }

  const recentActivity = getRecentActivity()

  const kpiCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toString(),
      change: `${stats.activeCustomers} active`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pending Quotes',
      value: stats.pendingQuotes.toString(),
      change: `${stats.draftQuotes} drafts`,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Outstanding Invoices',
      value: stats.unpaidInvoices.toString(),
      change: `${stats.overdueInvoices} overdue`,
      icon: AlertCircle,
      color: stats.overdueInvoices > 0 ? 'text-red-600' : 'text-orange-600',
      bgColor: stats.overdueInvoices > 0 ? 'bg-red-50' : 'bg-orange-50',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      change: `${formatCurrency(stats.outstandingRevenue)} pending`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ]

  return (
    <ResponsiveContainer maxWidth="full" padding="md">
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <ResponsiveStack
          direction={{ mobile: 'vertical', tablet: 'horizontal', desktop: 'horizontal' }}
          justify="between"
          align="start"
          spacing="md"
          className="mb-6"
        >
          <div className="space-y-1">
            <h1 className={`font-bold tracking-tight ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              Welcome back, {user?.firstName || 'User'}!
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Here's what's happening with your business today.
            </p>
          </div>

          {/* Period Selector - Mobile vs Desktop Layout */}
          <ResponsiveShow on={['desktop']}>
            <div className="flex items-center space-x-2">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod(p)}
                  className="capitalize"
                >
                  {p}
                </Button>
              ))}
            </div>
          </ResponsiveShow>

          {/* Mobile Period Selector - Dropdown style */}
          <ResponsiveShow on={['mobile', 'tablet']}>
            <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? 'default' : 'outline'}
                  size={isMobile ? 'sm' : 'default'}
                  onClick={() => setPeriod(p)}
                  className="capitalize text-xs md:text-sm"
                >
                  {p}
                </Button>
              ))}
            </div>
          </ResponsiveShow>
        </ResponsiveStack>

        {/* KPI Cards */}
        <ResponsiveGrid
          cols={{ xs: 1, sm: 2, md: 2, lg: 4, xl: 4 }}
          gap="md"
          className="mb-6"
        >
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon
            return (
              <Card
                key={kpi.title}
                className="relative overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {kpi.title}
                  </CardTitle>
                  <div className={`rounded-full p-2 ${kpi.bgColor}`}>
                    <Icon className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} ${kpi.color}`} />
                  </div>
                </CardHeader>
                <CardContent className={isMobile ? 'pt-2' : ''}>
                  <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                    {kpi.value}
                  </div>
                  <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
                    {kpi.change}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </ResponsiveGrid>

      {/* Revenue Analytics - Disabled (endpoints not available) */}
      {/* {revenueAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Revenue Analytics</span>
            </CardTitle>
            <CardDescription>
              Revenue performance for the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(revenueData?.totalRevenue || 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {revenueData?.paidInvoices || 0}
                </p>
                <p className="text-sm text-muted-foreground">Paid Invoices</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(revenueData?.pendingRevenue || 0)}
                </p>
                <p className="text-sm text-muted-foreground">Pending Revenue</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center space-x-1">
                  {(revenueData?.growth || 0) > 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  )}
                  <p className={`text-2xl font-bold ${(revenueData?.growth || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(revenueData?.growth || 0).toFixed(1)}%
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">Growth Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )} */}

        {/* Main Content Grid */}
        <ResponsiveGrid
          cols={{ xs: 1, sm: 1, md: 1, lg: 7, xl: 7 }}
          gap="md"
          className="mb-6"
        >
          {/* Payment Analytics - Disabled (endpoints not available) */}
          {/* {paymentAnalytics && (
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Payment Analytics</span>
                </CardTitle>
                <CardDescription>
                  Payment processing performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Payments</span>
                  <Badge variant="outline">{paymentAnalytics.totalPayments}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Success Rate</span>
                  <Badge variant="secondary">
                    {((paymentAnalytics.successfulPayments / paymentAnalytics.totalPayments) * 100).toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Failed Payments</span>
                  <Badge variant="destructive">{paymentAnalytics.failedPayments}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg. Processing Time</span>
                  <Badge variant="outline">{paymentAnalytics.averagePaymentTime}h</Badge>
                </div>
              </CardContent>
            </Card>
          )} */}

          {/* Recent Activity */}
          <Card className="lg:col-span-7">
            <CardHeader>
              <CardTitle className={`flex items-center space-x-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                <Clock className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription className={isMobile ? 'text-xs' : 'text-sm'}>
                Latest business activities across all modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
                {recentActivity.length === 0 ? (
                  <div className={`text-center text-muted-foreground ${isMobile ? 'py-6' : 'py-8'}`}>
                    <Calendar className={`mx-auto mb-2 ${isMobile ? 'h-8 w-8' : 'h-12 w-12'}`} />
                    <p className={isMobile ? 'text-sm' : 'text-base'}>No recent activity</p>
                    <p className="text-xs">Activity will appear here as you use the system</p>
                  </div>
                ) : (
                  recentActivity.map((activity, index) => {
                    const Icon = activity.icon
                    return (
                      <div key={index} className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
                        <div className={`rounded-full ${isMobile ? 'p-1.5' : 'p-2'} bg-muted`}>
                          <Icon className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} ${activity.color}`} />
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          <p className={`font-medium leading-none ${isMobile ? 'text-xs' : 'text-sm'}`}>
                            {activity.title}
                          </p>
                          <p className={`text-muted-foreground truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>
                            {activity.description}
                          </p>
                        </div>
                        <div className={`text-muted-foreground flex-shrink-0 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                          {isMobile ? formatDate(activity.timestamp, true) : formatDate(activity.timestamp)}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </ResponsiveGrid>

      {/* Customer Analytics - Disabled (endpoints not available) */}
      {/* {customerAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Customer Analytics</span>
            </CardTitle>
            <CardDescription>
              Customer segmentation and growth metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{customerAnalytics.totalCustomers}</p>
                <p className="text-sm text-muted-foreground">Total Customers</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-green-600">{customerAnalytics.newCustomers}</p>
                <p className="text-sm text-muted-foreground">New This Period</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{customerAnalytics.activeCustomers}</p>
                <p className="text-sm text-muted-foreground">Active Customers</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {customerAnalytics.customersByType.BUSINESS || 0}
                </p>
                <p className="text-sm text-muted-foreground">Business Clients</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {customerAnalytics.customersByType.PERSON || 0}
                </p>
                <p className="text-sm text-muted-foreground">Individual Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )} */}
      </div>
    </ResponsiveContainer>
  )
}