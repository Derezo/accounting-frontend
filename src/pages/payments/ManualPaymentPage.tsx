import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Filter, Eye, DollarSign, CreditCard, Banknote, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ManualPaymentForm } from '@/components/forms/ManualPaymentForm'
import { ManualPaymentFilters } from '@/components/business/ManualPaymentFilters'
import { apiService } from '@/services/api.service'
import { ManualPayment, PaymentMethod } from '@/types/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export function ManualPaymentPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<ManualPayment | null>(null)
  const [filters, setFilters] = useState({
    method: 'all' as PaymentMethod | 'all',
    dateRange: { start: '', end: '' },
    amountRange: { min: '', max: '' },
    customerName: '',
    referenceNumber: '',
    verified: 'all' as 'all' | 'verified' | 'unverified',
  })

  const queryClient = useQueryClient()

  // Fetch manual payments
  const { data: payments, isLoading } = useQuery({
    queryKey: ['manual-payments', filters, searchTerm],
    queryFn: () => apiService.getManualPayments({
      method: filters.method !== 'all' ? filters.method : undefined,
      startDate: filters.dateRange.start || undefined,
      endDate: filters.dateRange.end || undefined,
      minAmount: filters.amountRange.min ? parseFloat(filters.amountRange.min) : undefined,
      maxAmount: filters.amountRange.max ? parseFloat(filters.amountRange.max) : undefined,
      search: searchTerm || undefined,
      verified: filters.verified !== 'all' ? filters.verified === 'verified' : undefined,
    }),
  })

  // Fetch payment analytics
  const { data: analytics } = useQuery({
    queryKey: ['manual-payment-analytics'],
    queryFn: () => apiService.getManualPaymentAnalytics(),
  })

  // Verify payment mutation
  const verifyPaymentMutation = useMutation({
    mutationFn: (paymentId: string) => apiService.verifyManualPayment(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual-payments'] })
      queryClient.invalidateQueries({ queryKey: ['manual-payment-analytics'] })
      toast.success('Payment verified successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to verify payment')
    },
  })

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    const icons = {
      CASH: Banknote,
      CHEQUE: Receipt,
      CREDIT_CARD: CreditCard,
      DEBIT_CARD: CreditCard,
      BANK_TRANSFER: DollarSign,
      OTHER: DollarSign,
    }
    return icons[method] || DollarSign
  }

  const getPaymentMethodBadge = (method: PaymentMethod) => {
    const variants = {
      CASH: 'bg-green-100 text-green-800',
      CHEQUE: 'bg-blue-100 text-blue-800',
      CREDIT_CARD: 'bg-purple-100 text-purple-800',
      DEBIT_CARD: 'bg-indigo-100 text-indigo-800',
      BANK_TRANSFER: 'bg-orange-100 text-orange-800',
      OTHER: 'bg-gray-100 text-gray-800',
    }

    const Icon = getPaymentMethodIcon(method)

    return (
      <Badge className={variants[method]}>
        <Icon className="w-3 h-3 mr-1" />
        {method.replace('_', ' ')}
      </Badge>
    )
  }

  const filteredPayments = payments?.filter(payment =>
    payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manual Payment Recording</h1>
          <p className="text-muted-foreground">
            Record and track manual payments received outside the system
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record Manual Payment</DialogTitle>
            </DialogHeader>
            <ManualPaymentForm onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['manual-payments'] })
              queryClient.invalidateQueries({ queryKey: ['manual-payment-analytics'] })
            }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalCount}</div>
              <p className="text-xs text-muted-foreground">
                ${analytics.totalAmount.toLocaleString()} total value
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <Receipt className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.verifiedCount}</div>
              <p className="text-xs text-muted-foreground">
                ${analytics.verifiedAmount.toLocaleString()} verified
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
              <Eye className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.unverifiedCount}</div>
              <p className="text-xs text-muted-foreground">
                ${analytics.unverifiedAmount.toLocaleString()} pending
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.thisMonthCount}</div>
              <p className="text-xs text-muted-foreground">
                ${analytics.thisMonthAmount.toLocaleString()} this month
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by customer, reference, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filter Manual Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <ManualPaymentFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </CardContent>
        </Card>
      )}

      {/* Payments List */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Manual Payments Found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm || Object.values(filters).some(f => f && f !== 'all')
                    ? "No payments match your search criteria."
                    : "Get started by recording your first manual payment."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <Card key={payment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">
                            {payment.customerName}
                          </h3>
                          {getPaymentMethodBadge(payment.method)}
                          {payment.isVerified ? (
                            <Badge className="bg-green-100 text-green-800">
                              <Receipt className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Eye className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {payment.referenceNumber && (
                            <>
                              <span>Ref: {payment.referenceNumber}</span>
                              <span>•</span>
                            </>
                          )}
                          <span>${payment.amount.toLocaleString()}</span>
                          <span>•</span>
                          <span>{format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</span>
                        </div>
                        {payment.description && (
                          <p className="text-sm text-muted-foreground">
                            {payment.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPayment(payment)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        {!payment.isVerified && (
                          <Button
                            size="sm"
                            onClick={() => verifyPaymentMutation.mutate(payment.id)}
                            disabled={verifyPaymentMutation.isPending}
                          >
                            <Receipt className="w-4 h-4 mr-2" />
                            Verify
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPayments.map((payment) => (
              <Card key={payment.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{payment.customerName}</CardTitle>
                    {payment.isVerified ? (
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    )}
                  </div>
                  <CardDescription>
                    {getPaymentMethodBadge(payment.method)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-2xl font-bold text-primary">
                      ${payment.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                    </div>
                    {payment.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {payment.description}
                      </p>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      {!payment.isVerified && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => verifyPaymentMutation.mutate(payment.id)}
                          disabled={verifyPaymentMutation.isPending}
                        >
                          <Receipt className="w-4 h-4 mr-2" />
                          Verify
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Payment Details Dialog */}
      {selectedPayment && (
        <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Manual Payment Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Customer</label>
                  <p className="text-sm">{selectedPayment.customerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                  <div className="mt-1">
                    {getPaymentMethodBadge(selectedPayment.method)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Amount</label>
                  <p className="text-sm font-semibold">${selectedPayment.amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Date</label>
                  <p className="text-sm">{format(new Date(selectedPayment.paymentDate), 'PPP')}</p>
                </div>
                {selectedPayment.referenceNumber && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Reference Number</label>
                    <p className="text-sm">{selectedPayment.referenceNumber}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    {selectedPayment.isVerified ? (
                      <Badge className="bg-green-100 text-green-800">
                        <Receipt className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Eye className="w-3 h-3 mr-1" />
                        Pending Verification
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Recorded</label>
                  <p className="text-sm">{format(new Date(selectedPayment.createdAt), 'PPP')}</p>
                </div>
                {selectedPayment.verifiedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Verified</label>
                    <p className="text-sm">{format(new Date(selectedPayment.verifiedAt), 'PPP')}</p>
                  </div>
                )}
              </div>
              {selectedPayment.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm mt-1">{selectedPayment.description}</p>
                </div>
              )}
              {selectedPayment.attachments && selectedPayment.attachments.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Attachments</label>
                  <div className="mt-2 space-y-2">
                    {selectedPayment.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <Receipt className="w-4 h-4" />
                        <span className="text-sm">{attachment.filename}</span>
                        <Button size="sm" variant="outline" className="ml-auto">
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}