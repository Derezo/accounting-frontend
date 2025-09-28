import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  CreditCard,
  Repeat,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  Settings,
  Plus,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Wallet,
  BarChart3,
  Calendar
} from 'lucide-react'
import {
  usePaymentGateways,
  usePaymentMethods,
  useRecurringPayments,
  usePaymentPlans,
  useRefundRequests,
  useChargebacks,
  usePaymentAnalytics
} from '@/hooks/usePaymentProcessing'
import { LoadingSpinner } from '@/components/ui/loading'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const StatCard = ({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: {
  title: string
  value: string | number
  subtitle?: string
  icon: any
  trend?: { value: number; label: string; type: 'up' | 'down' | 'neutral' }
  variant?: 'default' | 'success' | 'warning' | 'danger'
}) => {
  const variantClasses = {
    default: 'border',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    danger: 'border-red-200 bg-red-50'
  }

  return (
    <Card className={variantClasses[variant]}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            {trend && (
              <div className={cn('flex items-center gap-1 text-xs mt-1',
                trend.type === 'up' ? 'text-green-600' :
                trend.type === 'down' ? 'text-red-600' : 'text-muted-foreground'
              )}>
                {trend.type === 'up' ? <TrendingUp className="h-3 w-3" /> :
                 trend.type === 'down' ? <TrendingDown className="h-3 w-3" /> : null}
                <span>{trend.value > 0 && trend.type !== 'down' ? '+' : ''}{trend.value}{trend.type !== 'neutral' ? '%' : ''} {trend.label}</span>
              </div>
            )}
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}

const GatewayCard = ({ gateway, onEdit, onTest }: {
  gateway: any
  onEdit: (gateway: any) => void
  onTest: (gateway: any) => void
}) => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-base">{gateway.name}</CardTitle>
          <CardDescription>{gateway.provider} • {gateway.country}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {gateway.isDefault && <Badge variant="default">Default</Badge>}
          <Badge variant={gateway.status === 'ACTIVE' ? 'default' : 'secondary'}>
            {gateway.status}
          </Badge>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Supported Methods</span>
          <span>{gateway.configuration.supportedPaymentMethods?.length || 0} methods</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Fee Structure</span>
          <span>
            {gateway.configuration.fees.percentage}% + ${gateway.configuration.fees.fixedAmount}
          </span>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(gateway)}>
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => onTest(gateway)}>
            Test
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
)

export function PaymentProcessingPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPeriod, setSelectedPeriod] = useState({
    dateFrom: '2024-01-01',
    dateTo: '2024-12-31'
  })

  const { data: gateways, isLoading: loadingGateways } = usePaymentGateways()
  const { data: paymentMethods, isLoading: loadingPaymentMethods } = usePaymentMethods()
  const { data: recurringPayments, isLoading: loadingRecurring } = useRecurringPayments()
  const { data: paymentPlans, isLoading: loadingPaymentPlans } = usePaymentPlans()
  const { data: refunds, isLoading: loadingRefunds } = useRefundRequests()
  const { data: chargebacks, isLoading: loadingChargebacks } = useChargebacks()
  const { data: analytics, isLoading: loadingAnalytics } = usePaymentAnalytics(selectedPeriod)

  const handleCreateGateway = () => {
    // TODO: Open create gateway dialog
    console.log('Create gateway')
  }

  const handleEditGateway = (gateway: any) => {
    // TODO: Open edit gateway dialog
    console.log('Edit gateway', gateway)
  }

  const handleTestGateway = (gateway: any) => {
    // TODO: Test gateway connection
    console.log('Test gateway', gateway)
  }

  const handleCreateRecurring = () => {
    // TODO: Open create recurring payment dialog
    console.log('Create recurring payment')
  }

  const handleCreatePaymentPlan = () => {
    // TODO: Open create payment plan dialog
    console.log('Create payment plan')
  }

  const handleProcessRefund = (refund: any) => {
    // TODO: Open refund processing dialog
    console.log('Process refund', refund)
  }

  const handleViewSettings = () => {
    // TODO: Open payment processing settings
    console.log('View settings')
  }

  if (loadingGateways || loadingPaymentMethods || loadingRecurring || loadingPaymentPlans || loadingRefunds || loadingChargebacks) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Processing</h1>
          <p className="text-muted-foreground">
            Manage payment gateways, methods, recurring payments, and analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleViewSettings}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={handleCreateGateway}>
            <Plus className="h-4 w-4 mr-2" />
            Add Gateway
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gateways">Gateways</TabsTrigger>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
          <TabsTrigger value="payment-plans">Payment Plans</TabsTrigger>
          <TabsTrigger value="refunds">Refunds</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Volume (Month)"
              value={analytics ? `$${analytics.totalVolume.amount.toLocaleString()}` : '$0'}
              subtitle={analytics ? `${analytics.totalVolume.transactionCount} transactions` : '0 transactions'}
              icon={DollarSign}
              trend={analytics ? { value: 12.5, label: 'vs last month', type: 'up' } : undefined}
              variant="success"
            />
            <StatCard
              title="Success Rate"
              value={analytics ? `${(analytics.successRate * 100).toFixed(1)}%` : '0%'}
              subtitle="Last 30 days"
              icon={CheckCircle}
              trend={analytics ? { value: 2.1, label: 'vs last month', type: 'up' } : undefined}
              variant={analytics && analytics.successRate > 0.95 ? 'success' : 'warning'}
            />
            <StatCard
              title="Active Gateways"
              value={gateways?.filter(g => g.status === 'ACTIVE').length || 0}
              subtitle={`${gateways?.length || 0} total configured`}
              icon={Wallet}
              trend={{ value: 0, label: 'no change', type: 'neutral' }}
            />
            <StatCard
              title="Pending Refunds"
              value={refunds?.data?.filter(r => r.status === 'PENDING').length || 0}
              subtitle="Requires attention"
              icon={RefreshCw}
              variant={refunds?.data?.filter(r => r.status === 'PENDING').length > 0 ? 'warning' : 'default'}
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Repeat className="h-5 w-5" />
                  Recurring Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active</span>
                    <span className="font-mono">{recurringPayments?.data?.filter(r => r.status === 'ACTIVE').length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Next Due Today</span>
                    <span className="font-mono">
                      {recurringPayments?.data?.filter(r =>
                        r.nextPaymentDate === new Date().toISOString().split('T')[0]
                      ).length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Failed This Month</span>
                    <span className="font-mono text-red-600">
                      {recurringPayments?.data?.filter(r => r.failureCount > 0).length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Payment Plans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Plans</span>
                    <span className="font-mono">{paymentPlans?.data?.filter(p => p.status === 'ACTIVE').length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Overdue</span>
                    <span className="font-mono text-red-600">
                      {paymentPlans?.data?.filter(p =>
                        p.nextDueDate < new Date().toISOString().split('T')[0] && p.status === 'ACTIVE'
                      ).length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Due This Week</span>
                    <span className="font-mono">
                      {paymentPlans?.data?.filter(p => {
                        const weekFromNow = new Date()
                        weekFromNow.setDate(weekFromNow.getDate() + 7)
                        return p.nextDueDate <= weekFromNow.toISOString().split('T')[0] && p.status === 'ACTIVE'
                      }).length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Issues & Disputes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Open Chargebacks</span>
                    <span className="font-mono text-red-600">
                      {chargebacks?.data?.filter(c => ['RECEIVED', 'UNDER_REVIEW'].includes(c.status)).length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pending Refunds</span>
                    <span className="font-mono text-yellow-600">
                      {refunds?.data?.filter(r => r.status === 'PENDING').length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Failed Payments</span>
                    <span className="font-mono">
                      {analytics?.declineReasons?.reduce((sum, reason) => sum + reason.count, 0) || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Payment Activity</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Mock recent activity data */}
                  {[
                    { type: 'payment', status: 'success', amount: '$1,250.00', customer: 'Acme Corp', time: '2 minutes ago' },
                    { type: 'refund', status: 'pending', amount: '$85.00', customer: 'Tech Solutions', time: '15 minutes ago' },
                    { type: 'recurring', status: 'success', amount: '$499.00', customer: 'StartupXYZ', time: '1 hour ago' },
                    { type: 'chargeback', status: 'dispute', amount: '$320.00', customer: 'Global Inc', time: '3 hours ago' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div className={cn('p-2 rounded-lg',
                          activity.status === 'success' ? 'bg-green-100' :
                          activity.status === 'pending' ? 'bg-yellow-100' :
                          activity.status === 'dispute' ? 'bg-red-100' : 'bg-gray-100'
                        )}>
                          {activity.type === 'payment' && <DollarSign className="h-4 w-4" />}
                          {activity.type === 'refund' && <RefreshCw className="h-4 w-4" />}
                          {activity.type === 'recurring' && <Repeat className="h-4 w-4" />}
                          {activity.type === 'chargeback' && <AlertTriangle className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{activity.type} - {activity.customer}</p>
                          <p className="text-sm text-muted-foreground">{activity.amount} • {activity.time}</p>
                        </div>
                      </div>
                      <Badge variant={
                        activity.status === 'success' ? 'default' :
                        activity.status === 'pending' ? 'secondary' :
                        'destructive'
                      }>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gateways" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Payment Gateways</h2>
            <Button onClick={handleCreateGateway}>
              <Plus className="h-4 w-4 mr-2" />
              Add Gateway
            </Button>
          </div>

          {gateways && gateways.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gateways.map((gateway) => (
                <GatewayCard
                  key={gateway.id}
                  gateway={gateway}
                  onEdit={handleEditGateway}
                  onTest={handleTestGateway}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Payment Gateways</h3>
                <p className="text-muted-foreground mb-4">Set up your first payment gateway to start processing payments.</p>
                <Button onClick={handleCreateGateway}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Gateway
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recurring" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recurring Payments</h2>
            <Button onClick={handleCreateRecurring}>
              <Repeat className="h-4 w-4 mr-2" />
              Create Recurring Payment
            </Button>
          </div>

          {recurringPayments?.data && recurringPayments.data.length > 0 ? (
            <div className="space-y-4">
              {recurringPayments.data.map((recurring) => (
                <Card key={recurring.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{recurring.description}</CardTitle>
                        <CardDescription>
                          ${recurring.amount} {recurring.currency} • {recurring.frequency} • Customer ID: {recurring.customerId}
                        </CardDescription>
                      </div>
                      <Badge variant={recurring.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {recurring.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Next Payment</p>
                        <p className="font-medium">{format(new Date(recurring.nextPaymentDate), 'MMM d, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Payment</p>
                        <p className="font-medium">
                          {recurring.lastPaymentDate ? format(new Date(recurring.lastPaymentDate), 'MMM d, yyyy') : 'None'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Failure Count</p>
                        <p className={cn('font-medium', recurring.failureCount > 0 ? 'text-red-600' : 'text-green-600')}>
                          {recurring.failureCount} / {recurring.maxFailures}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">View Details</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Repeat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Recurring Payments</h3>
                <p className="text-muted-foreground mb-4">Set up recurring payments for your customers.</p>
                <Button onClick={handleCreateRecurring}>
                  <Repeat className="h-4 w-4 mr-2" />
                  Create Your First Recurring Payment
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payment-plans" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Payment Plans</h2>
            <Button onClick={handleCreatePaymentPlan}>
              <Calendar className="h-4 w-4 mr-2" />
              Create Payment Plan
            </Button>
          </div>

          {paymentPlans?.data && paymentPlans.data.length > 0 ? (
            <div className="space-y-4">
              {paymentPlans.data.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{plan.description}</CardTitle>
                        <CardDescription>
                          ${plan.originalAmount} {plan.currency} • {plan.numberOfInstallments} installments • {plan.frequency}
                        </CardDescription>
                      </div>
                      <Badge variant={plan.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {plan.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-sm font-medium">
                          {plan.completedInstallments} / {plan.numberOfInstallments} completed
                        </span>
                      </div>
                      <Progress
                        value={(plan.completedInstallments / plan.numberOfInstallments) * 100}
                        className="h-2"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Remaining Amount</p>
                          <p className="font-medium">${plan.remainingAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Next Due Date</p>
                          <p className="font-medium">{format(new Date(plan.nextDueDate), 'MMM d, yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Installment Amount</p>
                          <p className="font-medium">${plan.installmentAmount.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">View Schedule</Button>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Payment Plans</h3>
                <p className="text-muted-foreground mb-4">Create installment plans for your customers.</p>
                <Button onClick={handleCreatePaymentPlan}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Create Your First Payment Plan
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="refunds" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Refund Requests</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Filter
              </Button>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
          </div>

          {refunds?.data && refunds.data.length > 0 ? (
            <div className="space-y-4">
              {refunds.data.map((refund) => (
                <Card key={refund.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Refund Request #{refund.id.slice(-8)}</CardTitle>
                        <CardDescription>
                          ${refund.amount} {refund.currency} • {refund.refundType} • {refund.reason}
                        </CardDescription>
                      </div>
                      <Badge variant={
                        refund.status === 'COMPLETED' ? 'default' :
                        refund.status === 'PENDING' ? 'secondary' :
                        refund.status === 'DENIED' ? 'destructive' :
                        'outline'
                      }>
                        {refund.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Requested By</p>
                        <p className="font-medium">{refund.requestedBy}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Request Date</p>
                        <p className="font-medium">{format(new Date(refund.createdAt), 'MMM d, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Refund Fee</p>
                        <p className="font-medium">${refund.refundFee}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {refund.status === 'PENDING' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleProcessRefund(refund)}>
                              Review
                            </Button>
                            <Button size="sm">Approve</Button>
                          </>
                        )}
                        {refund.status !== 'PENDING' && (
                          <Button variant="outline" size="sm">View Details</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Refund Requests</h3>
                <p className="text-muted-foreground">Refund requests will appear here when they are submitted.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Payment Analytics</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Date Range
              </Button>
              <Button variant="outline" size="sm">Export Report</Button>
            </div>
          </div>

          {analytics ? (
            <div className="space-y-6">
              {/* Volume Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Total Volume"
                  value={`$${analytics.totalVolume.amount.toLocaleString()}`}
                  subtitle={`${analytics.totalVolume.transactionCount} transactions`}
                  icon={DollarSign}
                  variant="success"
                />
                <StatCard
                  title="Average Transaction"
                  value={`$${analytics.averageTransactionValue.toLocaleString()}`}
                  subtitle="Per transaction"
                  icon={BarChart3}
                />
                <StatCard
                  title="Success Rate"
                  value={`${(analytics.successRate * 100).toFixed(1)}%`}
                  subtitle="Payment approval rate"
                  icon={CheckCircle}
                  variant={analytics.successRate > 0.95 ? 'success' : 'warning'}
                />
              </div>

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods Performance</CardTitle>
                  <CardDescription>Volume and transaction count by payment method</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topPaymentMethods.map((method, index) => (
                      <div key={method.method} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <CreditCard className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">{method.method.replace('_', ' ')}</p>
                            <p className="text-sm text-muted-foreground">{method.count} transactions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${method.volume.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{method.percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Issues */}
              {analytics.declineReasons.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top Decline Reasons</CardTitle>
                    <CardDescription>Most common reasons for payment failures</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.declineReasons.slice(0, 5).map((reason, index) => (
                        <div key={reason.reason} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                              <XCircle className="h-4 w-4 text-red-600" />
                            </div>
                            <span className="font-medium">{reason.reason}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{reason.count} failures</p>
                            <p className="text-sm text-muted-foreground">{reason.percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
                <p className="text-muted-foreground">Analytics will appear here once you start processing payments.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}