import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ETransferStatus } from '@/types/api'

interface ETransferFiltersProps {
  filters: {
    status: ETransferStatus | 'all'
    dateRange: { start: string; end: string }
    amountRange: { min: string; max: string }
    customerName: string
    referenceNumber: string
  }
  onFiltersChange: (filters: any) => void
}

export function ETransferFilters({ filters, onFiltersChange }: ETransferFiltersProps) {
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
      status: 'all',
      dateRange: { start: '', end: '' },
      amountRange: { min: '', max: '' },
      customerName: '',
      referenceNumber: '',
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => updateFilter('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="SENT">Sent</SelectItem>
              <SelectItem value="RECEIVED">Received</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date Range */}
        <div className="space-y-2">
          <Label>Date Range</Label>
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

      {/* Clear Filters */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={clearFilters}>
          Clear All Filters
        </Button>
      </div>
    </div>
  )
}