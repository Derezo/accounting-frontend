import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  RefreshCw,
  Download,
  CreditCard,
  Building2,
  Receipt,
  Calendar,
  DollarSign,
  ArrowRight,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PaymentStatus {
  id: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REQUIRES_ACTION' | 'REFUNDED' | 'PARTIALLY_REFUNDED'
  amount: number
  currency: string
  paymentMethod: {
    type: string
    last4?: string
    brand?: string
    bankName?: string
  }
  transaction: {
    id: string
    processingTime?: string
    completedAt?: string
    failedAt?: string
    failureReason?: string
  }
  timeline: PaymentTimelineEvent[]
  nextAction?: {
    type: 'VERIFY_MICRO_DEPOSITS' | 'RETRY_PAYMENT' | 'CONTACT_SUPPORT' | 'VERIFY_IDENTITY'
    description: string
    dueDate?: string
    actionUrl?: string
  }
  refunds?: PaymentRefund[]
  receipt?: {
    url: string
    downloadUrl: string
  }
  metadata?: {
    invoiceId?: string
    customerId?: string
    description?: string
  }
}

export interface PaymentTimelineEvent {
  id: string
  type: 'CREATED' | 'AUTHORIZED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED'
  title: string
  description: string
  timestamp: string
  status: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO'
  metadata?: any
}

export interface PaymentRefund {
  id: string
  amount: number
  currency: string
  reason: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  requestedAt: string
  processedAt?: string
  transactionId: string
}

export interface PaymentStatusTrackerProps {
  paymentId: string
  onRefresh?: () => void
  onRetry?: () => void
  onCancel?: () => void
  className?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

// Mock payment status data
const mockPaymentStatus: PaymentStatus = {
  id: 'pay_1234567890',
  status: 'PROCESSING',
  amount: 1250.00,
  currency: 'USD',
  paymentMethod: {
    type: 'CREDIT_CARD',
    last4: '4242',
    brand: 'Visa'
  },
  transaction: {
    id: 'txn_0987654321',
    processingTime: '2-3 business days'
  },
  timeline: [
    {
      id: '1',
      type: 'CREATED',
      title: 'Payment Created',
      description: 'Payment request initiated',
      timestamp: '2024-01-15T10:00:00Z',
      status: 'SUCCESS'
    },
    {
      id: '2',
      type: 'AUTHORIZED',
      title: 'Payment Authorized',
      description: 'Payment method authorized successfully',
      timestamp: '2024-01-15T10:01:30Z',
      status: 'SUCCESS'
    },
    {
      id: '3',
      type: 'PROCESSING',
      title: 'Processing Payment',
      description: 'Payment is being processed by the payment processor',
      timestamp: '2024-01-15T10:02:00Z',
      status: 'INFO'
    }
  ],
  nextAction: {
    type: 'VERIFY_MICRO_DEPOSITS',
    description: 'Please verify the micro-deposits in your bank account to complete the payment',
    dueDate: '2024-01-18T23:59:59Z'
  },
  receipt: {
    url: '/receipts/pay_1234567890',
    downloadUrl: '/receipts/pay_1234567890.pdf'
  },
  metadata: {
    invoiceId: 'INV-001',
    customerId: 'cust_123',
    description: 'Payment for Invoice INV-001'
  }
}

export function PaymentStatusTracker({
  paymentId,
  onRefresh,
  onRetry,
  onCancel,
  className,
  autoRefresh = true,
  refreshInterval = 30000
}: PaymentStatusTrackerProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchPaymentStatus()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [paymentId, autoRefresh, refreshInterval])

  // Initial fetch
  useEffect(() => {
    fetchPaymentStatus()
  }, [paymentId])

  const fetchPaymentStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In real implementation, this would be an API call
      // const response = await paymentService.getPaymentStatus(paymentId)
      setPaymentStatus(mockPaymentStatus)
      setLastRefresh(new Date())
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payment status')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchPaymentStatus()
    onRefresh?.()
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      PENDING: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <Clock className="h-4 w-4" />,
        description: 'Payment is waiting to be processed'
      },
      PROCESSING: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <RefreshCw className="h-4 w-4 animate-spin" />,
        description: 'Payment is currently being processed'
      },
      COMPLETED: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="h-4 w-4" />,
        description: 'Payment has been completed successfully'
      },
      FAILED: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <XCircle className="h-4 w-4" />,
        description: 'Payment failed to process'
      },
      CANCELLED: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: <XCircle className="h-4 w-4" />,
        description: 'Payment was cancelled'
      },
      REQUIRES_ACTION: {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: <AlertTriangle className="h-4 w-4" />,
        description: 'Payment requires additional action from you'
      },
      REFUNDED: {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: <RefreshCw className="h-4 w-4" />,
        description: 'Payment has been refunded'
      },
      PARTIALLY_REFUNDED: {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: <RefreshCw className="h-4 w-4" />,
        description: 'Payment has been partially refunded'
      }
    }

    return configs[status as keyof typeof configs] || configs.PENDING
  }

  const getTimelineEventIcon = (type: string, status: string) => {
    const statusColors = {
      SUCCESS: 'text-green-600',
      ERROR: 'text-red-600',
      WARNING: 'text-yellow-600',
      INFO: 'text-blue-600'
    }

    const icons = {
      CREATED: <DollarSign className={cn('h-4 w-4', statusColors[status as keyof typeof statusColors])} />,
      AUTHORIZED: <CheckCircle className={cn('h-4 w-4', statusColors[status as keyof typeof statusColors])} />,
      PROCESSING: <RefreshCw className={cn('h-4 w-4', statusColors[status as keyof typeof statusColors])} />,
      COMPLETED: <CheckCircle className={cn('h-4 w-4', statusColors[status as keyof typeof statusColors])} />,
      FAILED: <XCircle className={cn('h-4 w-4', statusColors[status as keyof typeof statusColors])} />,
      REFUNDED: <RefreshCw className={cn('h-4 w-4', statusColors[status as keyof typeof statusColors])} />,
      CANCELLED: <XCircle className={cn('h-4 w-4', statusColors[status as keyof typeof statusColors])} />
    }

    return icons[type as keyof typeof icons] || <Info className={cn('h-4 w-4', statusColors[status as keyof typeof statusColors])} />
  }

  const getPaymentMethodDisplay = (method: any) => {
    if (method.type === 'CREDIT_CARD' || method.type === 'DEBIT_CARD') {
      return (
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          <span>{method.brand} •••• {method.last4}</span>
        </div>
      )
    } else if (method.type === 'BANK_TRANSFER' || method.type === 'ACH') {
      return (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span>{method.bankName || 'Bank Transfer'}</span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <Receipt className="h-4 w-4" />
        <span>{method.type.replace('_', ' ')}</span>
      </div>
    )
  }

  const calculateProgress = (timeline: PaymentTimelineEvent[], currentStatus: string) => {
    const statusOrder = ['CREATED', 'AUTHORIZED', 'PROCESSING', 'COMPLETED']
    const currentIndex = statusOrder.indexOf(currentStatus.replace('REQUIRES_ACTION', 'PROCESSING'))
    return currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load payment status: {error}
            </AlertDescription>
          </Alert>
          <Button onClick={handleRefresh} className="mt-4" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isLoading && !paymentStatus) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-y-4">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading payment status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!paymentStatus) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Payment status not found for ID: {paymentId}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const statusConfig = getStatusConfig(paymentStatus.status)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Payment Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Status
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={statusConfig.color}>
                {statusConfig.icon}
                {paymentStatus.status.replace('_', ' ')}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Payment ID:</span>
                <span className="font-mono text-sm">{paymentStatus.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span className="font-medium">
                  {paymentStatus.currency} {paymentStatus.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Transaction ID:</span>
                <span className="font-mono text-sm">{paymentStatus.transaction.id}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Payment Method:</span>
                {getPaymentMethodDisplay(paymentStatus.paymentMethod)}
              </div>
              {paymentStatus.transaction.processingTime && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Processing Time:</span>
                  <span className="text-sm">{paymentStatus.transaction.processingTime}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Updated:</span>
                <span className="text-sm">{lastRefresh.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {(paymentStatus.status === 'PROCESSING' || paymentStatus.status === 'PENDING') && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(calculateProgress(paymentStatus.timeline, paymentStatus.status))}%</span>
              </div>
              <Progress value={calculateProgress(paymentStatus.timeline, paymentStatus.status)} />
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            {statusConfig.description}
          </p>
        </CardContent>
      </Card>

      {/* Next Action Required */}
      {paymentStatus.nextAction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {paymentStatus.nextAction.description}
              </AlertDescription>
            </Alert>

            {paymentStatus.nextAction.dueDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Due by: {new Date(paymentStatus.nextAction.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="flex gap-2">
              {paymentStatus.nextAction.actionUrl && (
                <Button asChild>
                  <a href={paymentStatus.nextAction.actionUrl}>
                    Take Action
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              )}
              {paymentStatus.status === 'FAILED' && onRetry && (
                <Button onClick={onRetry} variant="outline">
                  Retry Payment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Payment Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentStatus.timeline.map((event, index) => (
              <div key={event.id} className="flex items-start gap-3">
                <div className="mt-1">
                  {getTimelineEventIcon(event.type, event.status)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Refunds */}
      {paymentStatus.refunds && paymentStatus.refunds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Refunds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentStatus.refunds.map((refund) => (
                <div key={refund.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">
                        {paymentStatus.currency} {refund.amount.toFixed(2)}
                      </h4>
                      <p className="text-sm text-muted-foreground">{refund.reason}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {refund.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(refund.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {paymentStatus.receipt && (
              <Button variant="outline" asChild>
                <a href={paymentStatus.receipt.downloadUrl}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </a>
              </Button>
            )}

            <Button variant="outline" asChild>
              <a href={`/payments/${paymentStatus.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </a>
            </Button>

            {paymentStatus.status === 'FAILED' && onRetry && (
              <Button onClick={onRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Payment
              </Button>
            )}

            {(paymentStatus.status === 'PENDING' || paymentStatus.status === 'REQUIRES_ACTION') && onCancel && (
              <Button variant="destructive" onClick={onCancel}>
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Payment
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}