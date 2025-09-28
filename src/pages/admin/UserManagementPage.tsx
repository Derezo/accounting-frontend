import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Key,
  Mail,
  Phone,
  Calendar,
  Shield,
  Eye,
  Settings,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserForm } from '@/components/forms/UserForm'
import { UserFilters } from '@/components/business/UserFilters'
import { PermissionMatrix } from '@/components/business/PermissionMatrix'
import { UserActivityChart } from '@/components/analytics/UserActivityChart'
import { apiService } from '@/services/api.service'
import { User, UserRole } from '@/types/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('users')
  const [filters, setFilters] = useState({
    role: 'all' as UserRole | 'all',
    status: 'all' as 'all' | 'active' | 'inactive',
    lastLogin: 'all' as 'all' | 'recent' | 'inactive',
    department: '',
  })

  const queryClient = useQueryClient()

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', filters, searchTerm],
    queryFn: () => apiService.findUsers({
      role: filters.role !== 'all' ? filters.role : undefined,
      isActive: filters.status !== 'all' ? filters.status === 'active' : undefined,
      search: searchTerm || undefined,
      page: 1,
      limit: 100,
    }),
  })

  const users = usersData?.data || []

  // Mock user analytics for now - this would come from the backend
  const userAnalytics = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    newThisMonth: Math.floor(users.length * 0.1),
    growth: 12.5,
    recentLogins: users.filter(u => u.lastLoginAt &&
      new Date(u.lastLoginAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
    adminUsers: users.filter(u => ['SUPER_ADMIN', 'ADMIN'].includes(u.role)).length,
    activityData: [] // Would be populated from backend
  }

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (userData: any) => apiService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user-analytics'] })
      setShowUserDialog(false)
      toast.success('User created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create user')
    },
  })

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, userData }: { userId: string; userData: any }) =>
      apiService.updateUser(userId, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setShowUserDialog(false)
      setSelectedUser(null)
      toast.success('User updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user')
    },
  })

  // Deactivate user mutation (using updateUser)
  const deactivateUserMutation = useMutation({
    mutationFn: (userId: string) => apiService.updateUser(userId, { isActive: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deactivated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to deactivate user')
    },
  })

  // Reactivate user mutation (using updateUser)
  const reactivateUserMutation = useMutation({
    mutationFn: (userId: string) => apiService.updateUser(userId, { isActive: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User reactivated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reactivate user')
    },
  })

  // Send password reset mutation (using resendUserInvite as proxy)
  const sendPasswordResetMutation = useMutation({
    mutationFn: (userId: string) => apiService.resendUserInvite(userId),
    onSuccess: () => {
      toast.success('User invitation resent')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to resend invitation')
    },
  })

  const getRoleBadge = (role: UserRole) => {
    const variants = {
      SUPER_ADMIN: 'bg-purple-100 text-purple-800',
      ADMIN: 'bg-red-100 text-red-800',
      MANAGER: 'bg-blue-100 text-blue-800',
      ACCOUNTANT: 'bg-green-100 text-green-800',
      EMPLOYEE: 'bg-yellow-100 text-yellow-800',
      VIEWER: 'bg-gray-100 text-gray-800',
    }

    return (
      <Badge className={variants[role]}>
        {role.replace('_', ' ')}
      </Badge>
    )
  }

  const getStatusBadge = (isActive: boolean, lastLogin?: string) => {
    if (!isActive) {
      return <Badge className="bg-red-100 text-red-800">Inactive</Badge>
    }

    if (!lastLogin) {
      return <Badge className="bg-yellow-100 text-yellow-800">Never Logged In</Badge>
    }

    const daysSinceLogin = Math.floor(
      (new Date().getTime() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceLogin <= 7) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>
    } else if (daysSinceLogin <= 30) {
      return <Badge className="bg-yellow-100 text-yellow-800">Inactive (Recent)</Badge>
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Inactive (Long)</Badge>
    }
  }

  const filteredUsers = users?.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions for your organization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Users
          </Button>
          <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedUser ? 'Edit User' : 'Create New User'}
                </DialogTitle>
              </DialogHeader>
              <UserForm
                initialData={selectedUser || undefined}
                onSave={(userData) => {
                  if (selectedUser) {
                    updateUserMutation.mutate({ userId: selectedUser.id, userData })
                  } else {
                    createUserMutation.mutate(userData)
                  }
                }}
                onCancel={() => {
                  setShowUserDialog(false)
                  setSelectedUser(null)
                }}
                isLoading={createUserMutation.isPending || updateUserMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* User Analytics */}
      {userAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userAnalytics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {userAnalytics.activeUsers} active users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userAnalytics.newThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                +{userAnalytics.growth.toFixed(1)}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Logins</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userAnalytics.recentLogins}</div>
              <p className="text-xs text-muted-foreground">
                Last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
              <Key className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userAnalytics.adminUsers}</div>
              <p className="text-xs text-muted-foreground">
                System administrators
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity Monitoring</TabsTrigger>
          <TabsTrigger value="security">Security Settings</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card>
              <CardHeader>
                <CardTitle>Filter Users</CardTitle>
              </CardHeader>
              <CardContent>
                <UserFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </CardContent>
            </Card>
          )}

          {/* Users List */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm || Object.values(filters).some(f => f && f !== 'all')
                    ? "No users match your search criteria."
                    : "Get started by adding your first user."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-lg font-semibold text-primary">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">{user.name}</h3>
                            {getRoleBadge(user.role)}
                            {getStatusBadge(user.isActive, user.lastLoginAt)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Phone className="w-4 h-4" />
                                  {user.phone}
                                </div>
                              </>
                            )}
                            {user.lastLoginAt && (
                              <>
                                <span>•</span>
                                <span>Last login: {format(new Date(user.lastLoginAt), 'MMM dd, yyyy')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user)
                                setShowUserDialog(true)
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user)
                                setShowPermissionsDialog(true)
                              }}
                            >
                              <Key className="w-4 h-4 mr-2" />
                              Manage Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => sendPasswordResetMutation.mutate(user.id)}
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Resend Invitation
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.isActive ? (
                              <DropdownMenuItem
                                onClick={() => deactivateUserMutation.mutate(user.id)}
                                className="text-red-600"
                              >
                                <UserX className="w-4 h-4 mr-2" />
                                Deactivate User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => reactivateUserMutation.mutate(user.id)}
                                className="text-green-600"
                              >
                                <UserCheck className="w-4 h-4 mr-2" />
                                Reactivate User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Roles & Permissions Tab */}
        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>
                Manage role-based permissions across the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PermissionMatrix />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Monitoring Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Overview</CardTitle>
              <CardDescription>
                Monitor user login patterns and system usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserActivityChart data={userAnalytics?.activityData} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Policies</CardTitle>
              <CardDescription>
                Configure system-wide security settings and policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Security policy management coming soon. This will include password policies,
                session management, two-factor authentication settings, and access controls.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Permissions Dialog */}
      {selectedUser && (
        <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Manage Permissions for {selectedUser.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">
                    {selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(selectedUser.role)}
                    <span className="text-sm text-muted-foreground">{selectedUser.email}</span>
                  </div>
                </div>
              </div>
              <PermissionMatrix userId={selectedUser.id} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}