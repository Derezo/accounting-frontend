import { useState } from 'react'
import { Plus, Send, Edit, Trash2, Eye, Calculator } from 'lucide-react'
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
import { QuoteForm } from '@/components/forms/QuoteForm'
import { QuoteFilters } from '@/components/business/QuoteFilters'
import { EstimateCalculator } from '@/components/business/EstimateCalculator'
import { useQuotes, useSendQuote } from '@/hooks/useAPI'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Quote, QuoteFilters as IQuoteFilters } from '@/types/api'

export function QuotesPage() {
  const [filters, setFilters] = useState<IQuoteFilters>({})
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showEstimateDialog, setShowEstimateDialog] = useState(false)

  const { data: quotesData, isLoading, error } = useQuotes({
    ...filters,
    page: 1,
    limit: 50,
  })

  const sendQuote = useSendQuote()

  const handleEdit = (quote: Quote) => {
    setSelectedQuote(quote)
    setShowEditDialog(true)
  }

  const handleSend = async (quote: Quote) => {
    if (quote.customer?.email) {
      await sendQuote.mutateAsync({
        quoteId: quote.id,
        recipientEmail: quote.customer.email,
      })
    } else {
      // Handle case where customer has no email
      const email = prompt('Enter email address to send quote:')
      if (email) {
        await sendQuote.mutateAsync({
          quoteId: quote.id,
          recipientEmail: email,
        })
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success'
      case 'SENT':
        return 'warning'
      case 'VIEWED':
        return 'secondary'
      case 'REJECTED':
        return 'destructive'
      case 'EXPIRED':
        return 'destructive'
      case 'DRAFT':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const isQuoteEditable = (status: string) => {
    return ['DRAFT', 'REJECTED'].includes(status)
  }

  const isQuoteSendable = (status: string) => {
    return ['DRAFT', 'REJECTED'].includes(status)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotes</h1>
          <p className="text-muted-foreground">
            Create and manage customer quotes and estimates
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showEstimateDialog} onOpenChange={setShowEstimateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calculator className="h-4 w-4 mr-2" />
                Estimate Calculator
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Project Estimate Calculator</DialogTitle>
                <DialogDescription>
                  Use AI to estimate project costs based on requirements.
                </DialogDescription>
              </DialogHeader>
              <EstimateCalculator
                onEstimateComplete={(estimate) => {
                  setShowEstimateDialog(false)
                  // Could pre-populate a new quote form with the estimate
                }}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Quote
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Quote</DialogTitle>
                <DialogDescription>
                  Generate a professional quote for your customer with detailed line items.
                </DialogDescription>
              </DialogHeader>
              <QuoteForm
                onSuccess={() => setShowCreateDialog(false)}
                onCancel={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter quotes by status, customer, date range, and more
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuoteFilters
            filters={filters}
            onFiltersChange={setFilters}
          />
        </CardContent>
      </Card>

      {/* Quote List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Quote Management
            {quotesData && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({quotesData.pagination.total} total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading quotes...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <p className="text-sm text-red-600">Failed to load quotes</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please try refreshing the page
                </p>
              </div>
            </div>
          ) : quotesData?.data.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">No quotes found</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first quote
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotesData?.data.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{quote.quoteNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {quote.items.length} item{quote.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {quote.customer ? (
                          <>
                            <p className="font-medium">
                              {quote.customer.type === 'PERSON'
                                ? `${quote.customer.person?.firstName} ${quote.customer.person?.lastName}`
                                : quote.customer.business?.businessName
                              }
                            </p>
                            {quote.customer.email && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {quote.customer.email}
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
                        <p className="font-medium">{formatCurrency(quote.total)}</p>
                        <p className="text-xs text-muted-foreground">
                          Subtotal: {formatCurrency(quote.subtotal)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(quote.status) as any}>
                        {quote.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>
                        <p>{formatDate(quote.validUntil)}</p>
                        {new Date(quote.validUntil) < new Date() && (
                          <p className="text-xs text-red-600">Expired</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(quote.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {isQuoteSendable(quote.status) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSend(quote)}
                            disabled={sendQuote.isPending}
                            title="Send Quote"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        {isQuoteEditable(quote.status) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(quote)}
                            title="Edit Quote"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="View Quote"
                        >
                          <Eye className="h-4 w-4" />
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
      {selectedQuote && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Quote</DialogTitle>
              <DialogDescription>
                Update quote information and line items.
              </DialogDescription>
            </DialogHeader>
            <QuoteForm
              quote={selectedQuote}
              onSuccess={() => {
                setShowEditDialog(false)
                setSelectedQuote(null)
              }}
              onCancel={() => {
                setShowEditDialog(false)
                setSelectedQuote(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}