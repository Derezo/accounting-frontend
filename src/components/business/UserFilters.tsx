import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { UserRole } from '@/types/api'
import { X, Filter, Search } from 'lucide-react'

interface UserFiltersState {
  role: UserRole | 'all'
  status: 'all' | 'active' | 'inactive'
  lastLogin: 'all' | 'recent' | 'inactive'
  search: string
  emailVerified: 'all' | 'verified' | 'unverified'
}

interface UserFiltersProps {
  filters: UserFiltersState
  onFiltersChange: (filters: UserFiltersState) => void
}

const userRoles: { value: UserRole; label: string }[] = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'ACCOUNTANT', label: 'Accountant' },
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'VIEWER', label: 'Viewer' },
]

export function UserFilters({ filters, onFiltersChange }: UserFiltersProps) {
  const updateFilter = (key: keyof UserFiltersState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      role: 'all',
      status: 'all',
      lastLogin: 'all',
      search: '',
      emailVerified: 'all',
    })
  }

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'search') return value !== ''
    return value !== 'all'
  })

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">Search Users</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="search"
            placeholder="Search by name, email, or phone..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Role Filter */}
        <div className="space-y-2">
          <Label>Role</Label>
          <Select
            value={filters.role}
            onValueChange={(value: UserRole | 'all') => updateFilter('role', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {userRoles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value: 'all' | 'active' | 'inactive') => updateFilter('status', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Last Login Filter */}
        <div className="space-y-2">
          <Label>Last Login</Label>
          <Select
            value={filters.lastLogin}
            onValueChange={(value: 'all' | 'recent' | 'inactive') => updateFilter('lastLogin', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Time</SelectItem>
              <SelectItem value="recent">Last 7 Days</SelectItem>
              <SelectItem value="inactive">Over 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Email Verification Filter */}
        <div className="space-y-2">
          <Label>Email Status</Label>
          <Select
            value={filters.emailVerified}
            onValueChange={(value: 'all' | 'verified' | 'unverified') => updateFilter('emailVerified', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Emails</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filter Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {hasActiveFilters ? 'Filters applied' : 'No filters applied'}
          </span>
        </div>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground"
          >
            <X className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              {filters.role !== 'all' && (
                <div className="flex items-center gap-2 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                  Role: {userRoles.find(r => r.value === filters.role)?.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => updateFilter('role', 'all')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}

              {filters.status !== 'all' && (
                <div className="flex items-center gap-2 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                  Status: {filters.status === 'active' ? 'Active' : 'Inactive'}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => updateFilter('status', 'all')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}

              {filters.lastLogin !== 'all' && (
                <div className="flex items-center gap-2 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                  Login: {filters.lastLogin === 'recent' ? 'Recent' : 'Inactive'}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => updateFilter('lastLogin', 'all')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}

              {filters.emailVerified !== 'all' && (
                <div className="flex items-center gap-2 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                  Email: {filters.emailVerified === 'verified' ? 'Verified' : 'Unverified'}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => updateFilter('emailVerified', 'all')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}

              {filters.search && (
                <div className="flex items-center gap-2 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                  Search: "{filters.search}"
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => updateFilter('search', '')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}