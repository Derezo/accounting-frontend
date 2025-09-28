import { useState } from 'react'
import { ChevronDown, ChevronUp, X, Filter, Calendar, DollarSign, User, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

interface FilterOption {
  id: string
  label: string
  value: string
  count?: number
  color?: string
}

interface FilterGroup {
  id: string
  label: string
  type: 'checkbox' | 'select' | 'date-range' | 'number-range' | 'text'
  icon?: React.ReactNode
  options?: FilterOption[]
  value?: any
  placeholder?: string
  min?: number
  max?: number
  defaultExpanded?: boolean
}

interface FilterPanelProps {
  filters: FilterGroup[]
  onFilterChange: (filterId: string, value: any) => void
  onClearAll: () => void
  onApply?: () => void
  showApplyButton?: boolean
  className?: string
  collapsible?: boolean
  title?: string
}

export function FilterPanel({
  filters,
  onFilterChange,
  onClearAll,
  onApply,
  showApplyButton = false,
  className,
  collapsible = true,
  title = 'Filters'
}: FilterPanelProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(filters.filter(f => f.defaultExpanded !== false).map(f => f.id))
  )

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId)
    } else {
      newExpanded.add(groupId)
    }
    setExpandedGroups(newExpanded)
  }

  const getActiveFilterCount = () => {
    return filters.reduce((count, filter) => {
      if (filter.type === 'checkbox' && Array.isArray(filter.value) && filter.value.length > 0) {
        return count + filter.value.length
      } else if (filter.value && filter.value !== '' && filter.value !== null && filter.value !== undefined) {
        return count + 1
      }
      return count
    }, 0)
  }

  const clearFilter = (filterId: string) => {
    const filter = filters.find(f => f.id === filterId)
    if (filter?.type === 'checkbox') {
      onFilterChange(filterId, [])
    } else {
      onFilterChange(filterId, null)
    }
  }

  const renderCheckboxFilter = (filter: FilterGroup) => (
    <div className="space-y-3">
      {filter.options?.map((option) => (
        <div key={option.id} className="flex items-center space-x-2">
          <Checkbox
            id={`${filter.id}-${option.id}`}
            checked={filter.value?.includes(option.value) || false}
            onCheckedChange={(checked) => {
              const currentValue = filter.value || []
              let newValue
              if (checked) {
                newValue = [...currentValue, option.value]
              } else {
                newValue = currentValue.filter((v: string) => v !== option.value)
              }
              onFilterChange(filter.id, newValue)
            }}
          />
          <Label htmlFor={`${filter.id}-${option.id}`} className="flex-1 flex items-center justify-between cursor-pointer">
            <span className="flex items-center">
              {option.color && (
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: option.color }}
                />
              )}
              {option.label}
            </span>
            {option.count !== undefined && (
              <Badge variant="secondary" className="text-xs">
                {option.count}
              </Badge>
            )}
          </Label>
        </div>
      ))}
    </div>
  )

  const renderSelectFilter = (filter: FilterGroup) => (
    <Select
      value={filter.value || ''}
      onValueChange={(value) => onFilterChange(filter.id, value)}
    >
      <SelectTrigger>
        <SelectValue placeholder={filter.placeholder || 'Select option'} />
      </SelectTrigger>
      <SelectContent>
        {filter.options?.map((option) => (
          <SelectItem key={option.id} value={option.value}>
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center">
                {option.color && (
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: option.color }}
                  />
                )}
                {option.label}
              </span>
              {option.count !== undefined && (
                <Badge variant="secondary" className="text-xs ml-2">
                  {option.count}
                </Badge>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  const renderDateRangeFilter = (filter: FilterGroup) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-muted-foreground">From</Label>
          <Input
            type="date"
            value={filter.value?.from || ''}
            onChange={(e) => onFilterChange(filter.id, { ...filter.value, from: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">To</Label>
          <Input
            type="date"
            value={filter.value?.to || ''}
            onChange={(e) => onFilterChange(filter.id, { ...filter.value, to: e.target.value })}
          />
        </div>
      </div>
    </div>
  )

  const renderNumberRangeFilter = (filter: FilterGroup) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-muted-foreground">Min</Label>
          <Input
            type="number"
            min={filter.min}
            max={filter.max}
            value={filter.value?.min || ''}
            onChange={(e) => onFilterChange(filter.id, { ...filter.value, min: e.target.value })}
            placeholder={filter.min?.toString()}
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Max</Label>
          <Input
            type="number"
            min={filter.min}
            max={filter.max}
            value={filter.value?.max || ''}
            onChange={(e) => onFilterChange(filter.id, { ...filter.value, max: e.target.value })}
            placeholder={filter.max?.toString()}
          />
        </div>
      </div>
    </div>
  )

  const renderTextFilter = (filter: FilterGroup) => (
    <Input
      value={filter.value || ''}
      onChange={(e) => onFilterChange(filter.id, e.target.value)}
      placeholder={filter.placeholder}
    />
  )

  const renderFilterContent = (filter: FilterGroup) => {
    switch (filter.type) {
      case 'checkbox':
        return renderCheckboxFilter(filter)
      case 'select':
        return renderSelectFilter(filter)
      case 'date-range':
        return renderDateRangeFilter(filter)
      case 'number-range':
        return renderNumberRangeFilter(filter)
      case 'text':
        return renderTextFilter(filter)
      default:
        return null
    }
  }

  const activeFilterCount = getActiveFilterCount()

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-base">
            <Filter className="h-4 w-4 mr-2" />
            {title}
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearAll}>
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {filters.map((filter, index) => {
          const isExpanded = !collapsible || expandedGroups.has(filter.id)
          const hasValue = filter.type === 'checkbox'
            ? Array.isArray(filter.value) && filter.value.length > 0
            : filter.value && filter.value !== '' && filter.value !== null

          return (
            <div key={filter.id}>
              {index > 0 && <Separator className="mb-4" />}

              <Collapsible open={isExpanded}>
                <div className="flex items-center justify-between">
                  <CollapsibleTrigger
                    onClick={() => collapsible && toggleGroup(filter.id)}
                    className="flex items-center space-x-2 text-sm font-medium hover:text-primary transition-colors"
                    disabled={!collapsible}
                  >
                    {filter.icon}
                    <span>{filter.label}</span>
                    {collapsible && (
                      isExpanded ?
                        <ChevronUp className="h-4 w-4" /> :
                        <ChevronDown className="h-4 w-4" />
                    )}
                  </CollapsibleTrigger>

                  {hasValue && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearFilter(filter.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <CollapsibleContent className="mt-3">
                  {renderFilterContent(filter)}
                </CollapsibleContent>
              </Collapsible>
            </div>
          )
        })}

        {showApplyButton && (
          <>
            <Separator />
            <Button onClick={onApply} className="w-full">
              Apply Filters
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Preset filter configurations for common entities
export const customerFilters: FilterGroup[] = [
  {
    id: 'type',
    label: 'Customer Type',
    type: 'checkbox',
    icon: <User className="h-4 w-4" />,
    options: [
      { id: 'person', label: 'Individual', value: 'PERSON', count: 156 },
      { id: 'business', label: 'Business', value: 'BUSINESS', count: 89 }
    ],
    defaultExpanded: true
  },
  {
    id: 'tier',
    label: 'Customer Tier',
    type: 'checkbox',
    icon: <Tag className="h-4 w-4" />,
    options: [
      { id: 'personal', label: 'Personal', value: 'PERSONAL', color: '#3b82f6', count: 87 },
      { id: 'business', label: 'Business', value: 'BUSINESS', color: '#10b981', count: 98 },
      { id: 'enterprise', label: 'Enterprise', value: 'ENTERPRISE', color: '#8b5cf6', count: 34 },
      { id: 'emergency', label: 'Emergency', value: 'EMERGENCY', color: '#ef4444', count: 26 }
    ],
    defaultExpanded: true
  },
  {
    id: 'status',
    label: 'Status',
    type: 'checkbox',
    icon: <Tag className="h-4 w-4" />,
    options: [
      { id: 'active', label: 'Active', value: 'ACTIVE', color: '#10b981', count: 189 },
      { id: 'inactive', label: 'Inactive', value: 'INACTIVE', color: '#6b7280', count: 34 },
      { id: 'suspended', label: 'Suspended', value: 'SUSPENDED', color: '#ef4444', count: 12 }
    ]
  },
  {
    id: 'created_date',
    label: 'Created Date',
    type: 'date-range',
    icon: <Calendar className="h-4 w-4" />
  },
  {
    id: 'credit_limit',
    label: 'Credit Limit',
    type: 'number-range',
    icon: <DollarSign className="h-4 w-4" />,
    min: 0,
    max: 100000
  }
]

export const invoiceFilters: FilterGroup[] = [
  {
    id: 'status',
    label: 'Invoice Status',
    type: 'checkbox',
    icon: <Tag className="h-4 w-4" />,
    options: [
      { id: 'draft', label: 'Draft', value: 'DRAFT', color: '#6b7280', count: 23 },
      { id: 'sent', label: 'Sent', value: 'SENT', color: '#3b82f6', count: 45 },
      { id: 'viewed', label: 'Viewed', value: 'VIEWED', color: '#8b5cf6', count: 34 },
      { id: 'paid', label: 'Paid', value: 'PAID', color: '#10b981', count: 156 },
      { id: 'overdue', label: 'Overdue', value: 'OVERDUE', color: '#ef4444', count: 12 },
      { id: 'cancelled', label: 'Cancelled', value: 'CANCELLED', color: '#6b7280', count: 8 }
    ],
    defaultExpanded: true
  },
  {
    id: 'amount_range',
    label: 'Amount Range',
    type: 'number-range',
    icon: <DollarSign className="h-4 w-4" />,
    min: 0,
    max: 50000
  },
  {
    id: 'due_date',
    label: 'Due Date',
    type: 'date-range',
    icon: <Calendar className="h-4 w-4" />
  },
  {
    id: 'created_date',
    label: 'Created Date',
    type: 'date-range',
    icon: <Calendar className="h-4 w-4" />
  }
]

export const paymentFilters: FilterGroup[] = [
  {
    id: 'status',
    label: 'Payment Status',
    type: 'checkbox',
    icon: <Tag className="h-4 w-4" />,
    options: [
      { id: 'pending', label: 'Pending', value: 'PENDING', color: '#f59e0b', count: 34 },
      { id: 'completed', label: 'Completed', value: 'COMPLETED', color: '#10b981', count: 189 },
      { id: 'failed', label: 'Failed', value: 'FAILED', color: '#ef4444', count: 12 },
      { id: 'cancelled', label: 'Cancelled', value: 'CANCELLED', color: '#6b7280', count: 8 },
      { id: 'refunded', label: 'Refunded', value: 'REFUNDED', color: '#8b5cf6', count: 23 }
    ],
    defaultExpanded: true
  },
  {
    id: 'method',
    label: 'Payment Method',
    type: 'checkbox',
    icon: <Tag className="h-4 w-4" />,
    options: [
      { id: 'cash', label: 'Cash', value: 'CASH', count: 45 },
      { id: 'credit_card', label: 'Credit Card', value: 'CREDIT_CARD', count: 123 },
      { id: 'debit_card', label: 'Debit Card', value: 'DEBIT_CARD', count: 67 },
      { id: 'bank_transfer', label: 'Bank Transfer', value: 'BANK_TRANSFER', count: 89 },
      { id: 'check', label: 'Check', value: 'CHECK', count: 34 },
      { id: 'paypal', label: 'PayPal', value: 'PAYPAL', count: 56 },
      { id: 'stripe', label: 'Stripe', value: 'STRIPE', count: 78 }
    ]
  },
  {
    id: 'amount_range',
    label: 'Amount Range',
    type: 'number-range',
    icon: <DollarSign className="h-4 w-4" />,
    min: 0,
    max: 50000
  },
  {
    id: 'payment_date',
    label: 'Payment Date',
    type: 'date-range',
    icon: <Calendar className="h-4 w-4" />
  }
]