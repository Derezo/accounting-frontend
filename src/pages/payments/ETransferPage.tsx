import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Filter, Download, Eye, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ETransferForm } from '@/components/forms/ETransferForm'
import { ETransferFilters } from '@/components/business/ETransferFilters'
import { apiService } from '@/services/api.service'
import { ETransfer, ETransferStatus } from '@/types/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export function ETransferPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedETransfer, setSelectedETransfer] = useState<ETransfer | null>(null)
  const [filters, setFilters] = useState({
    status: 'all' as ETransferStatus | 'all',
    dateRange: { start: '', end: '' },
    amountRange: { min: '', max: '' },
    customerName: '',
    referenceNumber: '',
  })

  const queryClient = useQueryClient()

  // Fetch e-transfers
  const { data: etransfers, isLoading } = useQuery({
    queryKey: ['etransfers', filters, searchTerm],
    queryFn: () => apiService.getETransfers({
      status: filters.status !== 'all' ? filters.status : undefined,
      startDate: filters.dateRange.start || undefined,
      endDate: filters.dateRange.end || undefined,
      minAmount: filters.amountRange.min ? parseFloat(filters.amountRange.min) : undefined,
      maxAmount: filters.amountRange.max ? parseFloat(filters.amountRange.max) : undefined,
      search: searchTerm || undefined,
    }),
  })

  // Fetch e-transfer analytics
  const { data: analytics } = useQuery({
    queryKey: ['etransfer-analytics'],
    queryFn: () => apiService.getETransferAnalytics(),
  })

  // Confirm e-transfer received mutation
  const confirmReceivedMutation = useMutation({
    mutationFn: (etransferId: string) => apiService.confirmETransferReceived(etransferId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['etransfers'] })
      queryClient.invalidateQueries({ queryKey: ['etransfer-analytics'] })
      toast.success('e-Transfer confirmed as received')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to confirm e-Transfer')
    },
  })

  // Mark e-transfer as failed mutation
  const markFailedMutation = useMutation({
    mutationFn: ({ etransferId, reason }: { etransferId: string; reason: string }) =>
      apiService.markETransferFailed(etransferId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['etransfers'] })
      queryClient.invalidateQueries({ queryKey: ['etransfer-analytics'] })
      toast.success('e-Transfer marked as failed')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to mark e-Transfer as failed')
    },
  })

  const getStatusBadge = (status: ETransferStatus) => {
    const variants = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      SENT: 'bg-blue-100 text-blue-800',
      RECEIVED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    }

    const icons = {
      PENDING: Clock,
      SENT: Download,
      RECEIVED: CheckCircle,
      FAILED: XCircle,
      CANCELLED: XCircle,
    }

    const Icon = icons[status]

    return (
      <Badge className={variants[status]}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    )
  }

  const filteredETransfers = etransfers?.filter(etransfer =>
    etransfer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    etransfer.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    etransfer.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">e-Transfer Management</h1>
          <p className="text-muted-foreground">
            Manage electronic money transfers and track payment status
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New e-Transfer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New e-Transfer</DialogTitle>
            </DialogHeader>
            <ETransferForm onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['etransfers'] })
              queryClient.invalidateQueries({ queryKey: ['etransfer-analytics'] })
            }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total e-Transfers</CardTitle>
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
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.pendingCount}</div>
              <p className="text-xs text-muted-foreground">
                ${analytics.pendingAmount.toLocaleString()} pending
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Received</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.receivedCount}</div>
              <p className="text-xs text-muted-foreground">
                ${analytics.receivedAmount.toLocaleString()} received
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.failedCount}</div>
              <p className="text-xs text-muted-foreground">
                ${analytics.failedAmount.toLocaleString()} failed
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
            <CardTitle>Filter e-Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <ETransferFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </CardContent>
        </Card>
      )}

      {/* e-Transfers List */}
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
          ) : filteredETransfers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No e-Transfers Found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm || Object.values(filters).some(f => f && f !== 'all')
                    ? "No e-transfers match your search criteria."
                    : "Get started by creating your first e-transfer."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredETransfers.map((etransfer) => (
                <Card key={etransfer.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">
                            {etransfer.customerName}
                          </h3>
                          {getStatusBadge(etransfer.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Ref: {etransfer.referenceNumber}</span>
                          <span>•</span>
                          <span>${etransfer.amount.toLocaleString()}</span>
                          <span>•</span>
                          <span>{format(new Date(etransfer.createdAt), 'MMM dd, yyyy')}</span>
                        </div>
                        {etransfer.description && (
                          <p className="text-sm text-muted-foreground">
                            {etransfer.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedETransfer(etransfer)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        {etransfer.status === 'SENT' && (
                          <Button
                            size="sm"
                            onClick={() => confirmReceivedMutation.mutate(etransfer.id)}
                            disabled={confirmReceivedMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm Received
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
            {filteredETransfers.map((etransfer) => (
              <Card key={etransfer.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{etransfer.customerName}</CardTitle>
                    {getStatusBadge(etransfer.status)}
                  </div>
                  <CardDescription>
                    Ref: {etransfer.referenceNumber}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-2xl font-bold text-primary">
                      ${etransfer.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(etransfer.createdAt), 'MMM dd, yyyy')}
                    </div>
                    {etransfer.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {etransfer.description}
                      </p>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedETransfer(etransfer)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      {etransfer.status === 'SENT' && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => confirmReceivedMutation.mutate(etransfer.id)}
                          disabled={confirmReceivedMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm
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

      {/* e-Transfer Details Dialog */}
      {selectedETransfer && (
        <Dialog open={!!selectedETransfer} onOpenChange={() => setSelectedETransfer(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>e-Transfer Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Customer</label>
                  <p className="text-sm">{selectedETransfer.customerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedETransfer.status)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Amount</label>
                  <p className="text-sm font-semibold">${selectedETransfer.amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Reference Number</label>
                  <p className="text-sm">{selectedETransfer.referenceNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-sm">{format(new Date(selectedETransfer.createdAt), 'PPP')}</p>
                </div>
                {selectedETransfer.receivedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Received</label>
                    <p className="text-sm">{format(new Date(selectedETransfer.receivedAt), 'PPP')}</p>
                  </div>
                )}
              </div>
              {selectedETransfer.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm mt-1">{selectedETransfer.description}</p>
                </div>
              )}
              {selectedETransfer.failureReason && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Failure Reason</label>
                  <p className="text-sm mt-1 text-red-600">{selectedETransfer.failureReason}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}