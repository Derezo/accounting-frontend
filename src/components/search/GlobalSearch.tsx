import { useState, useMemo } from 'react'
import { SearchInput } from '@/components/search/SearchInput'
import { FilterPanel, customerFilters, invoiceFilters, paymentFilters } from '@/components/search/FilterPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useFilteredSearch, useSearchSuggestions } from '@/hooks/useSearch'
import { useAuth } from '@/hooks/useAuth'
import { Filter, Users, FileText, Receipt, CreditCard, Calendar, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data - replace with actual API calls
const mockCustomers = [
  { id: '1', type: 'PERSON', tier: 'PERSONAL', status: 'ACTIVE', firstName: 'John', lastName: 'Doe', email: 'john@example.com', createdAt: '2024-01-15' },
  { id: '2', type: 'BUSINESS', tier: 'ENTERPRISE', status: 'ACTIVE', businessName: 'Acme Corp', email: 'contact@acme.com', createdAt: '2024-01-20' },
  // ... more mock data
]

const mockInvoices = [
  { id: 'INV-001', status: 'PAID', amount: 1500, customerId: '1', customerName: 'John Doe', dueDate: '2024-02-15', createdAt: '2024-01-15' },
  { id: 'INV-002', status: 'OVERDUE', amount: 2500, customerId: '2', customerName: 'Acme Corp', dueDate: '2024-01-30', createdAt: '2024-01-10' },
  // ... more mock data
]

const mockPayments = [
  { id: 'PAY-001', status: 'COMPLETED', amount: 1500, method: 'CREDIT_CARD', invoiceId: 'INV-001', paidAt: '2024-02-10' },
  { id: 'PAY-002', status: 'PENDING', amount: 2500, method: 'BANK_TRANSFER', invoiceId: 'INV-002', paidAt: null },
  // ... more mock data
]

interface GlobalSearchProps {
  className?: string
  defaultTab?: 'customers' | 'invoices' | 'payments'
  onResultSelect?: (result: any, type: string) => void
}

export function GlobalSearch({ className, defaultTab = 'customers', onResultSelect }: GlobalSearchProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [showFilters, setShowFilters] = useState(false)
  const { canAccess } = useAuth()

  // Customer search and filtering
  const customerSearch = useFilteredSearch(mockCustomers, {
    searchFields: ['firstName', 'lastName', 'businessName', 'email'],
    debounceMs: 300,
    minSearchLength: 1
  })

  // Invoice search and filtering
  const invoiceSearch = useFilteredSearch(mockInvoices, {
    searchFields: ['id', 'customerName'],
    debounceMs: 300,
    minSearchLength: 1
  })

  // Payment search and filtering
  const paymentSearch = useFilteredSearch(mockPayments, {
    searchFields: ['id', 'invoiceId'],
    debounceMs: 300,
    minSearchLength: 1
  })

  // Search suggestions
  const customerSuggestions = useSearchSuggestions(
    mockCustomers,
    (customer) => ({
      id: customer.id,
      text: customer.type === 'PERSON' ? `${customer.firstName} ${customer.lastName}` : customer.businessName || '',
      type: 'customer',
      subtitle: customer.email,
      metadata: customer
    }),
    customerSearch.searchTerm
  )

  const invoiceSuggestions = useSearchSuggestions(
    mockInvoices,
    (invoice) => ({
      id: invoice.id,
      text: invoice.id,
      type: 'invoice',
      subtitle: `${invoice.customerName} - $${invoice.amount}`,
      metadata: invoice
    }),
    invoiceSearch.searchTerm
  )

  const paymentSuggestions = useSearchSuggestions(
    mockPayments,
    (payment) => ({
      id: payment.id,
      text: payment.id,
      type: 'payment',
      subtitle: `${payment.method} - $${payment.amount}`,
      metadata: payment
    }),
    paymentSearch.searchTerm
  )

  const getCurrentSearch = () => {
    switch (activeTab) {
      case 'customers':
        return customerSearch
      case 'invoices':
        return invoiceSearch
      case 'payments':
        return paymentSearch
      default:
        return customerSearch
    }
  }

  const getCurrentSuggestions = () => {
    switch (activeTab) {
      case 'customers':
        return customerSuggestions.suggestions
      case 'invoices':
        return invoiceSuggestions.suggestions
      case 'payments':
        return paymentSuggestions.suggestions
      default:
        return []
    }
  }

  const getCurrentFilters = () => {
    switch (activeTab) {
      case 'customers':
        return customerFilters
      case 'invoices':
        return invoiceFilters
      case 'payments':
        return paymentFilters
      default:
        return []
    }
  }

  const renderCustomerResult = (customer: any) => (
    <Card
      key={customer.id}
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onResultSelect?.(customer, 'customer')}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              {customer.type === 'PERSON' ? (
                <Users className="h-5 w-5 text-blue-600" />
              ) : (
                <Building2 className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="font-medium">
                {customer.type === 'PERSON' ? `${customer.firstName} ${customer.lastName}` : customer.businessName}
              </h3>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
            </div>
          </div>
          <div className="text-right space-y-1">
            <Badge variant="outline" className={cn(
              customer.status === 'ACTIVE' ? 'border-green-200 text-green-800' :
              customer.status === 'INACTIVE' ? 'border-gray-200 text-gray-800' :
              'border-red-200 text-red-800'
            )}>
              {customer.status}
            </Badge>
            <p className="text-xs text-muted-foreground">{customer.tier}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderInvoiceResult = (invoice: any) => (
    <Card
      key={invoice.id}
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onResultSelect?.(invoice, 'invoice')}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium">{invoice.id}</h3>
              <p className="text-sm text-muted-foreground">{invoice.customerName}</p>
            </div>
          </div>
          <div className="text-right space-y-1">
            <p className="font-medium">${invoice.amount.toLocaleString()}</p>
            <Badge variant="outline" className={cn(
              invoice.status === 'PAID' ? 'border-green-200 text-green-800' :
              invoice.status === 'OVERDUE' ? 'border-red-200 text-red-800' :
              invoice.status === 'SENT' ? 'border-blue-200 text-blue-800' :
              'border-gray-200 text-gray-800'
            )}>
              {invoice.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderPaymentResult = (payment: any) => (
    <Card
      key={payment.id}
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onResultSelect?.(payment, 'payment')}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium">{payment.id}</h3>
              <p className="text-sm text-muted-foreground">Invoice: {payment.invoiceId}</p>
            </div>
          </div>
          <div className="text-right space-y-1">
            <p className="font-medium">${payment.amount.toLocaleString()}</p>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={cn(
                payment.status === 'COMPLETED' ? 'border-green-200 text-green-800' :
                payment.status === 'PENDING' ? 'border-yellow-200 text-yellow-800' :
                payment.status === 'FAILED' ? 'border-red-200 text-red-800' :
                'border-gray-200 text-gray-800'
              )}>
                {payment.status}
              </Badge>
              <span className="text-xs text-muted-foreground">{payment.method}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderResults = () => {
    const search = getCurrentSearch()

    switch (activeTab) {
      case 'customers':
        return (
          <div className="space-y-3">
            {search.filteredAndSearchedData.map(renderCustomerResult)}
          </div>
        )
      case 'invoices':
        return (
          <div className="space-y-3">
            {search.filteredAndSearchedData.map(renderInvoiceResult)}
          </div>
        )
      case 'payments':
        return (
          <div className="space-y-3">
            {search.filteredAndSearchedData.map(renderPaymentResult)}
          </div>
        )
      default:
        return null
    }
  }

  const currentSearch = getCurrentSearch()
  const hasAccess = (resource: string) => canAccess(resource, 'read')

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Search</h1>
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {currentSearch.activeFilterCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {currentSearch.activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-80">
              <SheetHeader>
                <SheetTitle>Search Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterPanel
                  filters={getCurrentFilters()}
                  onFilterChange={currentSearch.setFilter}
                  onClearAll={currentSearch.clearAllFilters}
                  collapsible={true}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Search Input */}
        <SearchInput
          value={currentSearch.searchTerm}
          onChange={currentSearch.setSearchTerm}
          onClear={currentSearch.clearSearch}
          placeholder={`Search ${activeTab}...`}
          suggestions={getCurrentSuggestions()}
          onSuggestionSelect={(suggestion) => {
            currentSearch.setSearchTerm(suggestion.text)
            if (activeTab === 'customers') {
              customerSuggestions.addToRecent(suggestion)
            } else if (activeTab === 'invoices') {
              invoiceSuggestions.addToRecent(suggestion)
            } else if (activeTab === 'payments') {
              paymentSuggestions.addToRecent(suggestion)
            }
          }}
          isLoading={currentSearch.isSearching}
          size="lg"
        />
      </div>

      {/* Search Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          {hasAccess('customers') && (
            <TabsTrigger value="customers" className="gap-2">
              <Users className="h-4 w-4" />
              Customers
              <Badge variant="secondary" className="text-xs">
                {customerSearch.filteredAndSearchedData.length}
              </Badge>
            </TabsTrigger>
          )}
          {hasAccess('invoices') && (
            <TabsTrigger value="invoices" className="gap-2">
              <FileText className="h-4 w-4" />
              Invoices
              <Badge variant="secondary" className="text-xs">
                {invoiceSearch.filteredAndSearchedData.length}
              </Badge>
            </TabsTrigger>
          )}
          {hasAccess('payments') && (
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Payments
              <Badge variant="secondary" className="text-xs">
                {paymentSearch.filteredAndSearchedData.length}
              </Badge>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Search Results */}
        <TabsContent value="customers" className="space-y-4">
          {renderResults()}
          {customerSearch.filteredAndSearchedData.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No customers found</h3>
                <p className="text-muted-foreground">
                  {customerSearch.searchTerm ? 'Try adjusting your search terms or filters' : 'No customers available'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          {renderResults()}
          {invoiceSearch.filteredAndSearchedData.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No invoices found</h3>
                <p className="text-muted-foreground">
                  {invoiceSearch.searchTerm ? 'Try adjusting your search terms or filters' : 'No invoices available'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          {renderResults()}
          {paymentSearch.filteredAndSearchedData.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No payments found</h3>
                <p className="text-muted-foreground">
                  {paymentSearch.searchTerm ? 'Try adjusting your search terms or filters' : 'No payments available'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}