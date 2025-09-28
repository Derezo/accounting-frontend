import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CustomerFilters as ICustomerFilters, CustomerType, CustomerTier, CustomerStatus } from '@/types/api'

interface CustomerFiltersProps {
  filters: ICustomerFilters
  onFiltersChange: (filters: ICustomerFilters) => void
}

export function CustomerFilters({ filters, onFiltersChange }: CustomerFiltersProps) {
  const [localFilters, setLocalFilters] = useState<ICustomerFilters>(filters)

  const handleFilterChange = (key: keyof ICustomerFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleSearchChange = (value: string) => {
    handleFilterChange('search', value || undefined)
  }

  const handleTagsChange = (value: string) => {
    const tags = value ? value.split(',').map(tag => tag.trim()).filter(Boolean) : undefined
    handleFilterChange('tags', tags)
  }

  const clearFilters = () => {
    const emptyFilters: ICustomerFilters = {}
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof ICustomerFilters]
    return value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)
  })

  const getActiveFilterCount = () => {
    return Object.keys(filters).filter(key => {
      const value = filters[key as keyof ICustomerFilters]
      return value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)
    }).length
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search customers by name, email, or business..."
          value={localFilters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Customer Type */}
        <div className="space-y-2">
          <Label>Customer Type</Label>
          <select
            value={localFilters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">All Types</option>
            <option value="PERSON">Individual</option>
            <option value="BUSINESS">Business</option>
          </select>
        </div>

        {/* Customer Tier */}
        <div className="space-y-2">
          <Label>Customer Tier</Label>
          <select
            value={localFilters.tier || ''}
            onChange={(e) => handleFilterChange('tier', e.target.value || undefined)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">All Tiers</option>
            <option value="PERSONAL">Personal</option>
            <option value="SMALL_BUSINESS">Small Business</option>
            <option value="ENTERPRISE">Enterprise</option>
            <option value="EMERGENCY">Emergency</option>
          </select>
        </div>

        {/* Customer Status */}
        <div className="space-y-2">
          <Label>Status</Label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">All Statuses</option>
            <option value="PROSPECT">Prospect</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags</Label>
          <Input
            placeholder="important, vip, referral"
            value={localFilters.tags?.join(', ') || ''}
            onChange={(e) => handleTagsChange(e.target.value)}
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

          {filters.type && (
            <Badge variant="secondary" className="text-xs">
              Type: {filters.type === 'PERSON' ? 'Individual' : 'Business'}
              <button
                onClick={() => handleFilterChange('type', undefined)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.tier && (
            <Badge variant="secondary" className="text-xs">
              Tier: {filters.tier.replace('_', ' ')}
              <button
                onClick={() => handleFilterChange('tier', undefined)}
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

          {filters.tags && filters.tags.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              Tags: {filters.tags.join(', ')}
              <button
                onClick={() => handleFilterChange('tags', undefined)}
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