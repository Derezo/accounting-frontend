import { useState, useEffect } from 'react'
import { Search, Users, FileText, Receipt, CreditCard, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSmartSearch } from '@/hooks/useAPI'
import { debounce } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Customer, Quote, Invoice, Payment } from '@/types/api'

interface GlobalSearchProps {
  placeholder?: string
  onResultSelect?: (result: any, type: string) => void
  className?: string
}

export function GlobalSearch({
  placeholder = "Search customers, quotes, invoices...",
  onResultSelect,
  className
}: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const { data: searchResults, isLoading } = useSmartSearch(debouncedQuery)

  // Debounce search query
  useEffect(() => {
    const debouncedSetQuery = debounce((value: string) => {
      setDebouncedQuery(value)
    }, 300)

    debouncedSetQuery(query)
  }, [query])

  const handleInputChange = (value: string) => {
    setQuery(value)
    setIsOpen(value.length >= 2)
  }

  const handleResultClick = (result: any, type: string) => {
    onResultSelect?.(result, type)
    setIsOpen(false)
    setQuery('')
  }

  const renderCustomerResult = (customer: Customer) => (
    <div
      key={customer.id}
      className="flex items-center space-x-3 p-3 hover:bg-accent cursor-pointer rounded-md"
      onClick={() => handleResultClick(customer, 'customer')}
    >
      <Users className="h-4 w-4 text-blue-500" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {customer.type === 'PERSON'
            ? `${customer.person?.firstName} ${customer.person?.lastName}`
            : customer.business?.businessName
          }
        </p>
        <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
      </div>
      <Badge variant="outline">{customer.tier}</Badge>
    </div>
  )

  const renderQuoteResult = (quote: Quote) => (
    <div
      key={quote.id}
      className="flex items-center space-x-3 p-3 hover:bg-accent cursor-pointer rounded-md"
      onClick={() => handleResultClick(quote, 'quote')}
    >
      <FileText className="h-4 w-4 text-green-500" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{quote.quoteNumber}</p>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(quote.total)} • {formatDate(quote.validUntil)}
        </p>
      </div>
      <Badge variant={quote.status === 'APPROVED' ? 'success' : 'outline'}>
        {quote.status}
      </Badge>
    </div>
  )

  const renderInvoiceResult = (invoice: Invoice) => (
    <div
      key={invoice.id}
      className="flex items-center space-x-3 p-3 hover:bg-accent cursor-pointer rounded-md"
      onClick={() => handleResultClick(invoice, 'invoice')}
    >
      <Receipt className="h-4 w-4 text-orange-500" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{invoice.invoiceNumber}</p>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(invoice.total)} • Due {formatDate(invoice.dueDate)}
        </p>
      </div>
      <Badge variant={invoice.status === 'PAID' ? 'success' : 'destructive'}>
        {invoice.status}
      </Badge>
    </div>
  )

  const renderPaymentResult = (payment: Payment) => (
    <div
      key={payment.id}
      className="flex items-center space-x-3 p-3 hover:bg-accent cursor-pointer rounded-md"
      onClick={() => handleResultClick(payment, 'payment')}
    >
      <CreditCard className="h-4 w-4 text-purple-500" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {formatCurrency(payment.amount)} via {payment.method}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(payment.createdAt)}
        </p>
      </div>
      <Badge variant={payment.status === 'COMPLETED' ? 'success' : 'warning'}>
        {payment.status}
      </Badge>
    </div>
  )

  const hasResults = searchResults && (
    searchResults.customers.length > 0 ||
    searchResults.quotes.length > 0 ||
    searchResults.invoices.length > 0 ||
    searchResults.payments.length > 0
  )

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(query.length >= 2)}
          onBlur={() => {
            // Delay closing to allow clicks on results
            setTimeout(() => setIsOpen(false), 200)
          }}
          className="pl-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-auto">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
              </div>
            ) : hasResults ? (
              <div className="divide-y">
                {/* Customers */}
                {searchResults!.customers.length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
                      Customers
                    </div>
                    {searchResults!.customers.map(renderCustomerResult)}
                  </div>
                )}

                {/* Quotes */}
                {searchResults!.quotes.length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
                      Quotes
                    </div>
                    {searchResults!.quotes.map(renderQuoteResult)}
                  </div>
                )}

                {/* Invoices */}
                {searchResults!.invoices.length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
                      Invoices
                    </div>
                    {searchResults!.invoices.map(renderInvoiceResult)}
                  </div>
                )}

                {/* Payments */}
                {searchResults!.payments.length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
                      Payments
                    </div>
                    {searchResults!.payments.map(renderPaymentResult)}
                  </div>
                )}
              </div>
            ) : query.length >= 2 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No results found for "{query}"
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  )
}