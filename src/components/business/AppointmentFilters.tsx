import { useState } from 'react'
import { Search, Filter, X, Calendar, Clock, User, MapPin } from 'lucide-react'
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
  AppointmentFilters as IAppointmentFilters,
  AppointmentStatus,
  AppointmentType,
  AppointmentPriority
} from '@/types/api'

interface AppointmentFiltersProps {
  filters: IAppointmentFilters
  onFiltersChange: (filters: IAppointmentFilters) => void
}

export function AppointmentFilters({ filters, onFiltersChange }: AppointmentFiltersProps) {
  const [localFilters, setLocalFilters] = useState<IAppointmentFilters>(filters)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleFilterChange = (key: keyof IAppointmentFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleSearchChange = (value: string) => {
    handleFilterChange('search', value || undefined)
  }

  const handleStatusChange = (status: AppointmentStatus, checked: boolean) => {
    const currentStatuses = localFilters.status || []
    const newStatuses = checked
      ? [...currentStatuses, status]
      : currentStatuses.filter(s => s !== status)

    handleFilterChange('status', newStatuses.length > 0 ? newStatuses : undefined)
  }

  const handleTypeChange = (type: AppointmentType, checked: boolean) => {
    const currentTypes = localFilters.type || []
    const newTypes = checked
      ? [...currentTypes, type]
      : currentTypes.filter(t => t !== type)

    handleFilterChange('type', newTypes.length > 0 ? newTypes : undefined)
  }

  const handlePriorityChange = (priority: AppointmentPriority, checked: boolean) => {
    const currentPriorities = localFilters.priority || []
    const newPriorities = checked
      ? [...currentPriorities, priority]
      : currentPriorities.filter(p => p !== priority)

    handleFilterChange('priority', newPriorities.length > 0 ? newPriorities : undefined)
  }

  const clearFilters = () => {
    const emptyFilters: IAppointmentFilters = {}
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof IAppointmentFilters]
    return value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)
  })

  const getActiveFilterCount = () => {
    return Object.keys(filters).filter(key => {
      const value = filters[key as keyof IAppointmentFilters]
      return value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)
    }).length
  }

  return (
    <div className="space-y-4">
      {/* Quick Search */}
      <div className="flex gap-4 items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="search">Search Appointments</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by customer, service, location, or notes..."
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
                <Label htmlFor="startDate" className="text-xs">From Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={localFilters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-xs">To Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={localFilters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                />
              </div>
            </div>
          </div>

          {/* Time Range */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <Label className="text-sm font-medium">Time Range</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-xs">From Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={localFilters.startTime || ''}
                  onChange={(e) => handleFilterChange('startTime', e.target.value || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-xs">To Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={localFilters.endTime || ''}
                  onChange={(e) => handleFilterChange('endTime', e.target.value || undefined)}
                />
              </div>
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Status</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as AppointmentStatus[]).map((status) => (
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
            <Label className="text-sm font-medium">Appointment Type</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['CONSULTATION', 'SITE_VISIT', 'FOLLOW_UP', 'EMERGENCY'] as AppointmentType[]).map((type) => (
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
                    {type.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Priority</Label>
            <div className="grid grid-cols-3 gap-3">
              {(['LOW', 'MEDIUM', 'HIGH'] as AppointmentPriority[]).map((priority) => (
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

          {/* Customer and Service Filters */}
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
              <Label className="text-sm font-medium">Service Type</Label>
              <Input
                placeholder="Filter by service type..."
                value={localFilters.serviceType || ''}
                onChange={(e) => handleFilterChange('serviceType', e.target.value || undefined)}
              />
            </div>
          </div>

          {/* Location Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <Label className="text-sm font-medium">Location</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Location Type</Label>
                <Select
                  value={localFilters.locationType || ''}
                  onValueChange={(value) => handleFilterChange('locationType', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All location types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="ON_SITE">Our Office</SelectItem>
                    <SelectItem value="CLIENT_LOCATION">Client Location</SelectItem>
                    <SelectItem value="REMOTE">Remote/Virtual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Location Search</Label>
                <Input
                  placeholder="Search by address..."
                  value={localFilters.locationAddress || ''}
                  onChange={(e) => handleFilterChange('locationAddress', e.target.value || undefined)}
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
                  id="requiresConfirmation"
                  checked={localFilters.requiresConfirmation || false}
                  onCheckedChange={(checked) => handleFilterChange('requiresConfirmation', !!checked || undefined)}
                />
                <Label htmlFor="requiresConfirmation" className="text-sm font-normal cursor-pointer">
                  Requires confirmation
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRecurring"
                  checked={localFilters.isRecurring || false}
                  onCheckedChange={(checked) => handleFilterChange('isRecurring', !!checked || undefined)}
                />
                <Label htmlFor="isRecurring" className="text-sm font-normal cursor-pointer">
                  Recurring appointments
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasNotes"
                  checked={localFilters.hasNotes || false}
                  onCheckedChange={(checked) => handleFilterChange('hasNotes', !!checked || undefined)}
                />
                <Label htmlFor="hasNotes" className="text-sm font-normal cursor-pointer">
                  Has notes
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
            </div>
          </div>

          {/* Duration Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Duration (minutes)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minDuration" className="text-xs">Minimum</Label>
                <Input
                  id="minDuration"
                  type="number"
                  min="0"
                  step="15"
                  value={localFilters.minDuration || ''}
                  onChange={(e) => handleFilterChange('minDuration', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDuration" className="text-xs">Maximum</Label>
                <Input
                  id="maxDuration"
                  type="number"
                  min="0"
                  step="15"
                  value={localFilters.maxDuration || ''}
                  onChange={(e) => handleFilterChange('maxDuration', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="No limit"
                />
              </div>
            </div>
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
              Type: {type.replace('_', ' ')}
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
              From: {localFilters.startDate}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('startDate', undefined)}
              />
            </Badge>
          )}

          {localFilters.endDate && (
            <Badge variant="secondary" className="flex items-center gap-1">
              To: {localFilters.endDate}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange('endDate', undefined)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}