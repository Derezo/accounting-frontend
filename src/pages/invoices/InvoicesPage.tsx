import { useState } from 'react'
import { Plus, Send, FileText, DollarSign, AlertCircle, CheckCircle2, Download, Eye, Mail } from 'lucide-react'
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
import { InvoiceForm } from '@/components/forms/InvoiceForm'
import { InvoiceFilters } from '@/components/business/InvoiceFilters'
import { InvoicePreview } from '@/components/business/InvoicePreview'
import { useInvoices, useOrganizationSettings, useSendInvoiceEmail } from '@/hooks/useAPI'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Invoice, InvoiceFilters as IInvoiceFilters } from '@/types/api'

export function InvoicesPage() {
  const [filters, setFilters] = useState<IInvoiceFilters>({})
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)

  const { data: invoicesData, isLoading, error } = useInvoices({
    ...filters,
    page: 1,
    limit: 50,
  })
  const { data: organizationData } = useOrganizationSettings()

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowEditDialog(true)
  }

  const handlePreview = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowPreviewDialog(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'success'
      case 'SENT':
        return 'warning'
      case 'VIEWED':
        return 'secondary'
      case 'OVERDUE':
        return 'destructive'
      case 'CANCELLED':
        return 'destructive'
      case 'DRAFT':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle2 className="h-4 w-4" />
      case 'OVERDUE':
        return <AlertCircle className="h-4 w-4" />
      case 'SENT':
        return <Send className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const isOverdue = (invoice: Invoice) => {
    return new Date(invoice.dueDate) < new Date() && invoice.status !== 'PAID'
  }

  const calculateOverallStats = () => {
    if (!invoicesData?.data) return null

    const invoices = invoicesData.data
    const totalInvoices = invoices.length
    const paidInvoices = invoices.filter(inv => inv.status === 'PAID').length
    const overdueInvoices = invoices.filter(inv => isOverdue(inv)).length
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0)
    const paidAmount = invoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + inv.amountPaid, 0)
    const outstandingAmount = invoices.filter(inv => inv.status !== 'PAID').reduce((sum, inv) => sum + inv.amountDue, 0)

    return {
      totalInvoices,
      paidInvoices,
      overdueInvoices,
      totalAmount,
      paidAmount,
      outstandingAmount,
    }
  }

  const stats = calculateOverallStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Generate, track, and manage customer invoices and payments
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>
                Generate a professional invoice from a quote or create a custom invoice.
              </DialogDescription>
            </DialogHeader>
            <InvoiceForm
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
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInvoices}</div>
              <p className="text-xs text-muted-foreground">
                {stats.paidInvoices} paid, {stats.totalInvoices - stats.paidInvoices} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
              <p className="text-xs text-muted-foreground">
                Across all invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.outstandingAmount)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.overdueInvoices} overdue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collected</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.paidAmount)}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.paidAmount / stats.totalAmount) * 100).toFixed(1)}% collection rate
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
            Filter invoices by status, customer, date range, and payment status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InvoiceFilters
            filters={filters}
            onFiltersChange={setFilters}
          />
        </CardContent>
      </Card>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Invoice Management
            {invoicesData && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({invoicesData.pagination.total} total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading invoices...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <p className="text-sm text-red-600">Failed to load invoices</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please try refreshing the page
                </p>
              </div>
            </div>
          ) : invoicesData?.data.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">No invoices found</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first invoice
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoicesData?.data.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    className={isOverdue(invoice) ? 'bg-red-50 dark:bg-red-950/10' : ''}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(invoice.status)}
                        <div>
                          <p className="font-medium">{invoice.invoiceNumber}</p>
                          {invoice.quote && (
                            <p className="text-xs text-muted-foreground">
                              From Quote: {invoice.quote.quoteNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {invoice.customer ? (
                          <>
                            <p className="font-medium">
                              {invoice.customer.type === 'PERSON'
                                ? `${invoice.customer.person?.firstName} ${invoice.customer.person?.lastName}`
                                : invoice.customer.business?.businessName
                              }
                            </p>
                            {invoice.customer.email && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {invoice.customer.email}
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
                        <p className="font-medium">{formatCurrency(invoice.total)}</p>
                        <div className="text-xs text-muted-foreground">
                          {invoice.amountPaid > 0 && (
                            <p className="text-green-600">
                              Paid: {formatCurrency(invoice.amountPaid)}
                            </p>
                          )}
                          {invoice.amountDue > 0 && (
                            <p className={isOverdue(invoice) ? 'text-red-600' : ''}>
                              Due: {formatCurrency(invoice.amountDue)}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(invoice.status) as any}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>
                        <p className={isOverdue(invoice) ? 'text-red-600 font-medium' : ''}>
                          {formatDate(invoice.dueDate)}
                        </p>
                        {isOverdue(invoice) && (
                          <p className="text-xs text-red-600">
                            {Math.ceil((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(invoice.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePreview(invoice)}
                          title="Preview & Send Invoice"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(invoice)}
                          title="Edit Invoice"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        {invoice.status !== 'PAID' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePreview(invoice)}
                            title="Send Invoice"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
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
      {selectedInvoice && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
              <DialogDescription>
                View and manage invoice information.
              </DialogDescription>
            </DialogHeader>
            <InvoiceForm
              invoice={selectedInvoice}
              onSuccess={() => {
                setShowEditDialog(false)
                setSelectedInvoice(null)
              }}
              onCancel={() => {
                setShowEditDialog(false)
                setSelectedInvoice(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Preview Dialog */}
      {selectedInvoice && organizationData && (
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice Preview & Actions</DialogTitle>
              <DialogDescription>
                Preview, customize, download, and send your invoice
              </DialogDescription>
            </DialogHeader>
            <InvoicePreview
              invoice={selectedInvoice}
              organization={organizationData}
              onClose={() => {
                setShowPreviewDialog(false)
                setSelectedInvoice(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}