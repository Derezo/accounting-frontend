import { useState } from 'react'
import { Search, Filter, X, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { InvoiceFilters as IInvoiceFilters } from '@/types/api'
import { useCustomers } from '@/hooks/useAPI'

interface InvoiceFiltersProps {
  filters: IInvoiceFilters
  onFiltersChange: (filters: IInvoiceFilters) => void
}

export function InvoiceFilters({ filters, onFiltersChange }: InvoiceFiltersProps) {
  const [localFilters, setLocalFilters] = useState<IInvoiceFilters>(filters)
  const { data: customersData } = useCustomers({ limit: 100 })

  const handleFilterChange = (key: keyof IInvoiceFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleSearchChange = (value: string) => {
    handleFilterChange('search', value || undefined)
  }

  const clearFilters = () => {
    const emptyFilters: IInvoiceFilters = {}
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof IInvoiceFilters]
    return value !== undefined && value !== ''
  })

  const getActiveFilterCount = () => {
    return Object.keys(filters).filter(key => {
      const value = filters[key as keyof IInvoiceFilters]
      return value !== undefined && value !== ''
    }).length
  }

  const getCustomerDisplayName = (customerId: string) => {
    const customer = customersData?.data.find(c => c.id === customerId)
    if (!customer) return 'Unknown Customer'

    return customer.type === 'PERSON'
      ? `${customer.person?.firstName} ${customer.person?.lastName}`
      : customer.business?.businessName
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search invoices by number, customer, or description..."
          value={localFilters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Invoice Status */}
        <div className="space-y-2">
          <Label>Status</Label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="VIEWED">Viewed</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Customer */}
        <div className="space-y-2">
          <Label>Customer</Label>
          <select
            value={localFilters.customerId || ''}
            onChange={(e) => handleFilterChange('customerId', e.target.value || undefined)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">All Customers</option>
            {customersData?.data.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.type === 'PERSON'
                  ? `${customer.person?.firstName} ${customer.person?.lastName}`
                  : customer.business?.businessName
                }
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div className="space-y-2">
          <Label>From Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              value={localFilters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Date To */}
        <div className="space-y-2">
          <Label>To Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              value={localFilters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="space-y-2">
          <Label>Quick Filters</Label>
          <div className="flex flex-col space-y-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange('status', 'DRAFT')}
              className="justify-start text-xs"
            >
              Draft Invoices
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange('overdue', true)}
              className="justify-start text-xs"
            >
              Overdue
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center space-x-2 flex-wrap">
          <div className="flex items-center space-x-1">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} applied:
            </span>
          </div>

          {filters.search && (
            <Badge variant="secondary" className="text-xs">
              Search: "{filters.search}"
              <button
                onClick={() => handleFilterChange('search', undefined)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.status && (
            <Badge variant="secondary" className="text-xs">
              Status: {filters.status}
              <button
                onClick={() => handleFilterChange('status', undefined)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.customerId && (
            <Badge variant="secondary" className="text-xs">
              Customer: {getCustomerDisplayName(filters.customerId)}
              <button
                onClick={() => handleFilterChange('customerId', undefined)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.dateFrom && (
            <Badge variant="secondary" className="text-xs">
              From: {filters.dateFrom}
              <button
                onClick={() => handleFilterChange('dateFrom', undefined)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.dateTo && (
            <Badge variant="secondary" className="text-xs">
              To: {filters.dateTo}
              <button
                onClick={() => handleFilterChange('dateTo', undefined)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs h-6 px-2"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}