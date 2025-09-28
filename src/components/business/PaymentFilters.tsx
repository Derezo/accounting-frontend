import { useState } from 'react'
import { Search, Filter, X, Calendar, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { PaymentFilters as IPaymentFilters } from '@/types/api'
import { useCustomers } from '@/hooks/useAPI'

interface PaymentFiltersProps {
  filters: IPaymentFilters
  onFiltersChange: (filters: IPaymentFilters) => void
}

export function PaymentFilters({ filters, onFiltersChange }: PaymentFiltersProps) {
  const [localFilters, setLocalFilters] = useState<IPaymentFilters>(filters)
  const { data: customersData } = useCustomers({ limit: 100 })

  const handleFilterChange = (key: keyof IPaymentFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleSearchChange = (value: string) => {
    handleFilterChange('search', value || undefined)
  }

  const clearFilters = () => {
    const emptyFilters: IPaymentFilters = {}
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof IPaymentFilters]
    return value !== undefined && value !== ''
  })

  const getActiveFilterCount = () => {
    return Object.keys(filters).filter(key => {
      const value = filters[key as keyof IPaymentFilters]
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

  const getMethodDisplay = (method: string) => {
    switch (method) {
      case 'CREDIT_CARD': return 'Credit Card'
      case 'BANK_TRANSFER': return 'Bank Transfer'
      case 'PAYPAL': return 'PayPal'
      case 'STRIPE': return 'Stripe'
      case 'CASH': return 'Cash'
      case 'CHECK': return 'Check'
      case 'OTHER': return 'Other'
      default: return method
    }
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search payments by number, reference, or transaction ID..."
          value={localFilters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Payment Status */}
        <div className="space-y-2">
          <Label>Status</Label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>

        {/* Payment Method */}
        <div className="space-y-2">
          <Label>Method</Label>
          <select
            value={localFilters.method || ''}
            onChange={(e) => handleFilterChange('method', e.target.value || undefined)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">All Methods</option>
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="PAYPAL">PayPal</option>
            <option value="STRIPE">Stripe</option>
            <option value="CASH">Cash</option>
            <option value="CHECK">Check</option>
            <option value="OTHER">Other</option>
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
              onClick={() => handleFilterChange('status', 'COMPLETED')}
              className="justify-start text-xs"
            >
              Completed
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange('status', 'PENDING')}
              className="justify-start text-xs"
            >
              Pending
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date().toISOString().split('T')[0]
                handleFilterChange('dateFrom', today)
                handleFilterChange('dateTo', today)
              }}
              className="justify-start text-xs"
            >
              Today
            </Button>
          </div>
        </div>
      </div>

      {/* Amount Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Minimum Amount</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={localFilters.minAmount || ''}
            onChange={(e) => handleFilterChange('minAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label>Maximum Amount</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={localFilters.maxAmount || ''}
            onChange={(e) => handleFilterChange('maxAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="10000.00"
          />
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

          {filters.method && (
            <Badge variant="secondary" className="text-xs">
              Method: {getMethodDisplay(filters.method)}
              <button
                onClick={() => handleFilterChange('method', undefined)}
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

          {filters.minAmount && (
            <Badge variant="secondary" className="text-xs">
              Min: ${filters.minAmount}
              <button
                onClick={() => handleFilterChange('minAmount', undefined)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.maxAmount && (
            <Badge variant="secondary" className="text-xs">
              Max: ${filters.maxAmount}
              <button
                onClick={() => handleFilterChange('maxAmount', undefined)}
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