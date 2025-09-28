import { useState } from 'react'
import { Plus, CreditCard, DollarSign, CheckCircle2, AlertCircle, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PaymentForm } from '@/components/forms/PaymentForm'
import { PaymentFilters } from '@/components/business/PaymentFilters'
import { usePayments } from '@/hooks/useAPI'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Payment, PaymentFilters as IPaymentFilters } from '@/types/api'

export function PaymentsPage() {
  const [filters, setFilters] = useState<IPaymentFilters>({})
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const { data: paymentsData, isLoading, error } = usePayments({
    ...filters,
    page: 1,
    limit: 50,
  })

  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment)
    setShowEditDialog(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success'
      case 'PENDING':
        return 'warning'
      case 'PROCESSING':
        return 'secondary'
      case 'FAILED':
        return 'destructive'
      case 'CANCELLED':
        return 'destructive'
      case 'REFUNDED':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4" />
      case 'FAILED':
      case 'CANCELLED':
        return <AlertCircle className="h-4 w-4" />
      case 'PENDING':
      case 'PROCESSING':
        return <Calendar className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const getMethodDisplay = (method: string) => {
    switch (method) {
      case 'CREDIT_CARD':
        return 'Credit Card'
      case 'BANK_TRANSFER':
        return 'Bank Transfer'
      case 'PAYPAL':
        return 'PayPal'
      case 'STRIPE':
        return 'Stripe'
      case 'CASH':
        return 'Cash'
      case 'CHECK':
        return 'Check'
      case 'OTHER':
        return 'Other'
      default:
        return method
    }
  }

  const calculateOverallStats = () => {
    if (!paymentsData?.data) return null

    const payments = paymentsData.data
    const totalPayments = payments.length
    const completedPayments = payments.filter(p => p.status === 'COMPLETED').length
    const pendingPayments = payments.filter(p => p.status === 'PENDING').length
    const failedPayments = payments.filter(p => p.status === 'FAILED').length
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)
    const completedAmount = payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0)
    const pendingAmount = payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0)

    return {
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
      totalAmount,
      completedAmount,
      pendingAmount,
    }
  }

  const stats = calculateOverallStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            Track and manage customer payments across all invoices
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
              <DialogDescription>
                Record a payment received from a customer for an invoice.
              </DialogDescription>
            </DialogHeader>
            <PaymentForm
              onSuccess={() => setShowCreateDialog(false)}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPayments}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedPayments} completed, {stats.pendingPayments} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Received</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
              <p className="text-xs text-muted-foreground">
                Across all payment methods
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.completedAmount)}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.completedAmount / stats.totalAmount) * 100).toFixed(1)}% success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.pendingAmount)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingPayments} transactions
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter payments by status, method, date range, and amount
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentFilters
            filters={filters}
            onFiltersChange={setFilters}
          />
        </CardContent>
      </Card>

      {/* Payment List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Payment History
            {paymentsData && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({paymentsData.pagination.total} total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading payments...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <p className="text-sm text-red-600">Failed to load payments</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please try refreshing the page
                </p>
              </div>
            </div>
          ) : paymentsData?.data.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">No payments found</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Record your first payment
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment #</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentsData?.data.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(payment.status)}
                        <div>
                          <p className="font-medium">{payment.paymentNumber}</p>
                          {payment.reference && (
                            <p className="text-xs text-muted-foreground">
                              Ref: {payment.reference}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {payment.invoice ? (
                        <div>
                          <p className="font-medium">{payment.invoice.invoiceNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            Total: {formatCurrency(payment.invoice.total)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No Invoice</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        {payment.customer ? (
                          <>
                            <p className="font-medium">
                              {payment.customer.type === 'PERSON'
                                ? `${payment.customer.person?.firstName} ${payment.customer.person?.lastName}`
                                : payment.customer.business?.businessName
                              }
                            </p>
                            {payment.customer.email && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {payment.customer.email}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-muted-foreground">Unknown Customer</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-green-600">{formatCurrency(payment.amount)}</p>
                        {payment.fees > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Fees: {formatCurrency(payment.fees)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{getMethodDisplay(payment.method)}</p>
                        {payment.transactionId && (
                          <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                            {payment.transactionId}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(payment.status) as any}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(payment.paymentDate)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(payment)}
                          title="View Payment Details"
                        >
                          <CreditCard className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {selectedPayment && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>
                View and manage payment information.
              </DialogDescription>
            </DialogHeader>
            <PaymentForm
              payment={selectedPayment}
              onSuccess={() => {
                setShowEditDialog(false)
                setSelectedPayment(null)
              }}
              onCancel={() => {
                setShowEditDialog(false)
                setSelectedPayment(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}