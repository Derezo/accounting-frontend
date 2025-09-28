import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PaymentMethod } from '@/types/api'

interface ManualPaymentFiltersProps {
  filters: {
    method: PaymentMethod | 'all'
    dateRange: { start: string; end: string }
    amountRange: { min: string; max: string }
    customerName: string
    referenceNumber: string
    verified: 'all' | 'verified' | 'unverified'
  }
  onFiltersChange: (filters: any) => void
}

export function ManualPaymentFilters({ filters, onFiltersChange }: ManualPaymentFiltersProps) {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const updateDateRange = (type: 'start' | 'end', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [type]: value,
      },
    })
  }

  const updateAmountRange = (type: 'min' | 'max', value: string) => {
    onFiltersChange({
      ...filters,
      amountRange: {
        ...filters.amountRange,
        [type]: value,
      },
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      method: 'all',
      dateRange: { start: '', end: '' },
      amountRange: { min: '', max: '' },
      customerName: '',
      referenceNumber: '',
      verified: 'all',
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Payment Method Filter */}
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <Select
            value={filters.method}
            onValueChange={(value) => updateFilter('method', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="CHEQUE">Cheque</SelectItem>
              <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
              <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
              <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Verification Status */}
        <div className="space-y-2">
          <Label>Verification Status</Label>
          <Select
            value={filters.verified}
            onValueChange={(value) => updateFilter('verified', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Pending Verification</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Customer Name */}
        <div className="space-y-2">
          <Label>Customer Name</Label>
          <Input
            placeholder="Enter customer name"
            value={filters.customerName}
            onChange={(e) => updateFilter('customerName', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date Range */}
        <div className="space-y-2">
          <Label>Payment Date Range</Label>
          <div className="flex space-x-2">
            <Input
              type="date"
              placeholder="Start date"
              value={filters.dateRange.start}
              onChange={(e) => updateDateRange('start', e.target.value)}
            />
            <Input
              type="date"
              placeholder="End date"
              value={filters.dateRange.end}
              onChange={(e) => updateDateRange('end', e.target.value)}
            />
          </div>
        </div>

        {/* Amount Range */}
        <div className="space-y-2">
          <Label>Amount Range (CAD)</Label>
          <div className="flex space-x-2">
            <Input
              type="number"
              step="0.01"
              placeholder="Min amount"
              value={filters.amountRange.min}
              onChange={(e) => updateAmountRange('min', e.target.value)}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Max amount"
              value={filters.amountRange.max}
              onChange={(e) => updateAmountRange('max', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Reference Number */}
        <div className="space-y-2">
          <Label>Reference Number</Label>
          <Input
            placeholder="Enter reference number"
            value={filters.referenceNumber}
            onChange={(e) => updateFilter('referenceNumber', e.target.value)}
          />
        </div>
      </div>

      {/* Clear Filters */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={clearFilters}>
          Clear All Filters
        </Button>
      </div>
    </div>
  )
}