import { useState } from 'react'
import { Search, Filter, X, Calendar, DollarSign, User, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  ProjectFilters as IProjectFilters,
  ProjectStatus,
  ProjectType,
  ProjectPriority
} from '@/types/api'

interface ProjectFiltersProps {
  filters: IProjectFilters
  onFiltersChange: (filters: IProjectFilters) => void
}

export function ProjectFilters({ filters, onFiltersChange }: ProjectFiltersProps) {
  const [localFilters, setLocalFilters] = useState<IProjectFilters>(filters)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleFilterChange = (key: keyof IProjectFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleSearchChange = (value: string) => {
    handleFilterChange('search', value || undefined)
  }

  const handleStatusChange = (status: ProjectStatus, checked: boolean) => {
    const currentStatuses = localFilters.status || []
    const newStatuses = checked
      ? [...currentStatuses, status]
      : currentStatuses.filter(s => s !== status)

    handleFilterChange('status', newStatuses.length > 0 ? newStatuses : undefined)
  }

  const handleTypeChange = (type: ProjectType, checked: boolean) => {
    const currentTypes = localFilters.type || []
    const newTypes = checked
      ? [...currentTypes, type]
      : currentTypes.filter(t => t !== type)

    handleFilterChange('type', newTypes.length > 0 ? newTypes : undefined)
  }

  const handlePriorityChange = (priority: ProjectPriority, checked: boolean) => {
    const currentPriorities = localFilters.priority || []
    const newPriorities = checked
      ? [...currentPriorities, priority]
      : currentPriorities.filter(p => p !== priority)

    handleFilterChange('priority', newPriorities.length > 0 ? newPriorities : undefined)
  }

  const clearFilters = () => {
    const emptyFilters: IProjectFilters = {}
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof IProjectFilters]
    return value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)
  })

  const getActiveFilterCount = () => {
    return Object.keys(filters).filter(key => {
      const value = filters[key as keyof IProjectFilters]
      return value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)
    }).length
  }

  return (
    <div className="space-y-4">
      {/* Quick Search */}
      <div className="flex gap-4 items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="search">Search Projects</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by project name, client, description, or tags..."
              value={localFilters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Advanced
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1">
              {getActiveFilterCount()}
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border rounded-lg p-4 space-y-6 bg-muted/30">
          {/* Date Range */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <Label className="text-sm font-medium">Date Range</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-xs">Start Date From</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={localFilters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-xs">Start Date To</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={localFilters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deadlineFrom" className="text-xs">Deadline From</Label>
                <Input
                  id="deadlineFrom"
                  type="date"
                  value={localFilters.deadlineFrom || ''}
                  onChange={(e) => handleFilterChange('deadlineFrom', e.target.value || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadlineTo" className="text-xs">Deadline To</Label>
                <Input
                  id="deadlineTo"
                  type="date"
                  value={localFilters.deadlineTo || ''}
                  onChange={(e) => handleFilterChange('deadlineTo', e.target.value || undefined)}
                />
              </div>
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Status</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'ARCHIVED'] as ProjectStatus[]).map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={localFilters.status?.includes(status) || false}
                    onCheckedChange={(checked) => handleStatusChange(status, !!checked)}
                  />
                  <Label
                    htmlFor={`status-${status}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {status.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Project Type</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(['CONSULTING', 'DEVELOPMENT', 'MAINTENANCE', 'AUDIT', 'TRAINING', 'SUPPORT'] as ProjectType[]).map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={localFilters.type?.includes(type) || false}
                    onCheckedChange={(checked) => handleTypeChange(type, !!checked)}
                  />
                  <Label
                    htmlFor={`type-${type}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Priority</Label>
            <div className="grid grid-cols-3 gap-3">
              {(['LOW', 'MEDIUM', 'HIGH'] as ProjectPriority[]).map((priority) => (
                <div key={priority} className="flex items-center space-x-2">
                  <Checkbox
                    id={`priority-${priority}`}
                    checked={localFilters.priority?.includes(priority) || false}
                    onCheckedChange={(checked) => handlePriorityChange(priority, !!checked)}
                  />
                  <Label
                    htmlFor={`priority-${priority}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {priority}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Customer and Manager Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <Label className="text-sm font-medium">Customer Filter</Label>
              </div>
              <Input
                placeholder="Filter by customer name..."
                value={localFilters.customerName || ''}
                onChange={(e) => handleFilterChange('customerName', e.target.value || undefined)}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Project Manager</Label>
              <Input
                placeholder="Filter by manager name..."
                value={localFilters.managerName || ''}
                onChange={(e) => handleFilterChange('managerName', e.target.value || undefined)}
              />
            </div>
          </div>

          {/* Budget and Hours Range */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <Label className="text-sm font-medium">Budget Range</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minBudget" className="text-xs">Minimum Budget</Label>
                <Input
                  id="minBudget"
                  type="number"
                  min="0"
                  step="100"
                  value={localFilters.minBudget || ''}
                  onChange={(e) => handleFilterChange('minBudget', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxBudget" className="text-xs">Maximum Budget</Label>
                <Input
                  id="maxBudget"
                  type="number"
                  min="0"
                  step="100"
                  value={localFilters.maxBudget || ''}
                  onChange={(e) => handleFilterChange('maxBudget', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="No limit"
                />
              </div>
            </div>
          </div>

          {/* Hours Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Hours Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minHours" className="text-xs">Minimum Hours</Label>
                <Input
                  id="minHours"
                  type="number"
                  min="0"
                  step="1"
                  value={localFilters.minHours || ''}
                  onChange={(e) => handleFilterChange('minHours', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxHours" className="text-xs">Maximum Hours</Label>
                <Input
                  id="maxHours"
                  type="number"
                  min="0"
                  step="1"
                  value={localFilters.maxHours || ''}
                  onChange={(e) => handleFilterChange('maxHours', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="No limit"
                />
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Additional Options</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isTemplate"
                  checked={localFilters.isTemplate || false}
                  onCheckedChange={(checked) => handleFilterChange('isTemplate', !!checked || undefined)}
                />
                <Label htmlFor="isTemplate" className="text-sm font-normal cursor-pointer">
                  Templates only
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRecurring"
                  checked={localFilters.isRecurring || false}
                  onCheckedChange={(checked) => handleFilterChange('isRecurring', !!checked || undefined)}
                />
                <Label htmlFor="isRecurring" className="text-sm font-normal cursor-pointer">
                  Recurring projects
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasDeadline"
                  checked={localFilters.hasDeadline || false}
                  onCheckedChange={(checked) => handleFilterChange('hasDeadline', !!checked || undefined)}
                />
                <Label htmlFor="hasDeadline" className="text-sm font-normal cursor-pointer">
                  Has deadline
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="overdueOnly"
                  checked={localFilters.overdueOnly || false}
                  onCheckedChange={(checked) => handleFilterChange('overdueOnly', !!checked || undefined)}
                />
                <Label htmlFor="overdueOnly" className="text-sm font-normal cursor-pointer">
                  Overdue only
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiresApproval"
                  checked={localFilters.requiresApproval || false}
                  onCheckedChange={(checked) => handleFilterChange('requiresApproval', !!checked || undefined)}
                />
                <Label htmlFor="requiresApproval" className="text-sm font-normal cursor-pointer">
                  Requires approval
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="clientAccess"
                  checked={localFilters.clientAccess || false}
                  onCheckedChange={(checked) => handleFilterChange('clientAccess', !!checked || undefined)}
                />
                <Label htmlFor="clientAccess" className="text-sm font-normal cursor-pointer">
                  Client access enabled
                </Label>
              </div>
            </div>
          </div>

          {/* Billing Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Billing Type</Label>
            <Select
              value={localFilters.billingType || ''}
              onValueChange={(value) => handleFilterChange('billingType', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All billing types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="HOURLY">Hourly</SelectItem>
                <SelectItem value="FIXED">Fixed Price</SelectItem>
                <SelectItem value="RETAINER">Retainer</SelectItem>
                <SelectItem value="MILESTONE">Milestone-based</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tags</Label>
            <Input
              placeholder="Search by tags (comma-separated)..."
              value={localFilters.tags || ''}
              onChange={(e) => handleFilterChange('tags', e.target.value || undefined)}
            />
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {localFilters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {localFilters.search}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('search', undefined)}
              />
            </Badge>
          )}

          {localFilters.status?.map(status => (
            <Badge key={status} variant="secondary" className="flex items-center gap-1">
              Status: {status.replace('_', ' ')}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleStatusChange(status, false)}
              />
            </Badge>
          ))}

          {localFilters.type?.map(type => (
            <Badge key={type} variant="secondary" className="flex items-center gap-1">
              Type: {type}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleTypeChange(type, false)}
              />
            </Badge>
          ))}

          {localFilters.priority?.map(priority => (
            <Badge key={priority} variant="secondary" className="flex items-center gap-1">
              Priority: {priority}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handlePriorityChange(priority, false)}
              />
            </Badge>
          ))}

          {localFilters.startDate && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Start: {localFilters.startDate}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('startDate', undefined)}
              />
            </Badge>
          )}

          {localFilters.deadlineFrom && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Deadline From: {localFilters.deadlineFrom}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('deadlineFrom', undefined)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}