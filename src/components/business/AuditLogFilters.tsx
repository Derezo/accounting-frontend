import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AuditLogFiltersProps {
  filters: {
    category: string
    severity: string
    success: 'all' | 'true' | 'false'
    user: string
    ipAddress: string
    resource: string
  }
  onFiltersChange: (filters: any) => void
}

export function AuditLogFilters({ filters, onFiltersChange }: AuditLogFiltersProps) {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      category: 'all',
      severity: 'all',
      success: 'all',
      user: '',
      ipAddress: '',
      resource: '',
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="user-filter">User</Label>
        <Input
          id="user-filter"
          placeholder="Filter by user name..."
          value={filters.user}
          onChange={(e) => updateFilter('user', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ip-filter">IP Address</Label>
        <Input
          id="ip-filter"
          placeholder="Filter by IP address..."
          value={filters.ipAddress}
          onChange={(e) => updateFilter('ipAddress', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="resource-filter">Resource</Label>
        <Input
          id="resource-filter"
          placeholder="Filter by resource..."
          value={filters.resource}
          onChange={(e) => updateFilter('resource', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="success-filter">Success Status</Label>
        <Select value={filters.success} onValueChange={(value) => updateFilter('success', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Success Only</SelectItem>
            <SelectItem value="false">Failures Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end">
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Clear All Filters
        </Button>
      </div>
    </div>
  )
}