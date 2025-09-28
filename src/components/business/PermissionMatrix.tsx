import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { UserRole } from '@/types/api'
import {
  Check,
  X,
  Shield,
  Users,
  FileText,
  CreditCard,
  Calendar,
  Settings,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload
} from 'lucide-react'

interface Permission {
  id: string
  name: string
  description: string
  category: 'AUTH' | 'DATA' | 'FINANCIAL' | 'SYSTEM' | 'ANALYTICS' | 'SECURITY'
  icon: React.ComponentType<{ className?: string }>
}

interface RolePermission {
  role: UserRole
  permissions: Record<string, boolean>
}

const permissions: Permission[] = [
  // Authentication & User Management
  { id: 'user_create', name: 'Create Users', description: 'Create new user accounts', category: 'AUTH', icon: Plus },
  { id: 'user_read', name: 'View Users', description: 'View user profiles and details', category: 'AUTH', icon: Eye },
  { id: 'user_update', name: 'Edit Users', description: 'Update user information', category: 'AUTH', icon: Edit },
  { id: 'user_delete', name: 'Delete Users', description: 'Remove user accounts', category: 'AUTH', icon: Trash2 },
  { id: 'user_invite', name: 'Invite Users', description: 'Send user invitations', category: 'AUTH', icon: Users },
  { id: 'role_manage', name: 'Manage Roles', description: 'Assign and modify user roles', category: 'AUTH', icon: Shield },

  // Data Management
  { id: 'customer_create', name: 'Create Customers', description: 'Add new customer records', category: 'DATA', icon: Plus },
  { id: 'customer_read', name: 'View Customers', description: 'Access customer information', category: 'DATA', icon: Eye },
  { id: 'customer_update', name: 'Edit Customers', description: 'Modify customer details', category: 'DATA', icon: Edit },
  { id: 'customer_delete', name: 'Delete Customers', description: 'Remove customer records', category: 'DATA', icon: Trash2 },
  { id: 'customer_export', name: 'Export Customers', description: 'Export customer data', category: 'DATA', icon: Download },

  // Financial Operations
  { id: 'quote_create', name: 'Create Quotes', description: 'Generate customer quotes', category: 'FINANCIAL', icon: Plus },
  { id: 'quote_read', name: 'View Quotes', description: 'Access quote information', category: 'FINANCIAL', icon: Eye },
  { id: 'quote_update', name: 'Edit Quotes', description: 'Modify quote details', category: 'FINANCIAL', icon: Edit },
  { id: 'quote_delete', name: 'Delete Quotes', description: 'Remove quotes', category: 'FINANCIAL', icon: Trash2 },
  { id: 'quote_approve', name: 'Approve Quotes', description: 'Accept/reject quotes', category: 'FINANCIAL', icon: Check },
  { id: 'quote_convert', name: 'Convert Quotes', description: 'Convert quotes to invoices', category: 'FINANCIAL', icon: FileText },

  { id: 'invoice_create', name: 'Create Invoices', description: 'Generate customer invoices', category: 'FINANCIAL', icon: Plus },
  { id: 'invoice_read', name: 'View Invoices', description: 'Access invoice information', category: 'FINANCIAL', icon: Eye },
  { id: 'invoice_update', name: 'Edit Invoices', description: 'Modify invoice details', category: 'FINANCIAL', icon: Edit },
  { id: 'invoice_delete', name: 'Delete Invoices', description: 'Remove invoices', category: 'FINANCIAL', icon: Trash2 },
  { id: 'invoice_send', name: 'Send Invoices', description: 'Email invoices to customers', category: 'FINANCIAL', icon: Upload },

  { id: 'payment_create', name: 'Process Payments', description: 'Record and process payments', category: 'FINANCIAL', icon: Plus },
  { id: 'payment_read', name: 'View Payments', description: 'Access payment information', category: 'FINANCIAL', icon: Eye },
  { id: 'payment_update', name: 'Edit Payments', description: 'Modify payment details', category: 'FINANCIAL', icon: Edit },
  { id: 'payment_refund', name: 'Process Refunds', description: 'Handle payment refunds', category: 'FINANCIAL', icon: CreditCard },

  // Project Management
  { id: 'project_create', name: 'Create Projects', description: 'Start new projects', category: 'DATA', icon: Plus },
  { id: 'project_read', name: 'View Projects', description: 'Access project information', category: 'DATA', icon: Eye },
  { id: 'project_update', name: 'Edit Projects', description: 'Modify project details', category: 'DATA', icon: Edit },
  { id: 'project_delete', name: 'Delete Projects', description: 'Remove projects', category: 'DATA', icon: Trash2 },
  { id: 'project_time', name: 'Track Time', description: 'Log time entries', category: 'DATA', icon: Calendar },

  // Analytics & Reporting
  { id: 'analytics_revenue', name: 'Revenue Analytics', description: 'View revenue reports', category: 'ANALYTICS', icon: BarChart3 },
  { id: 'analytics_customer', name: 'Customer Analytics', description: 'View customer insights', category: 'ANALYTICS', icon: BarChart3 },
  { id: 'analytics_payment', name: 'Payment Analytics', description: 'View payment reports', category: 'ANALYTICS', icon: BarChart3 },
  { id: 'report_generate', name: 'Generate Reports', description: 'Create custom reports', category: 'ANALYTICS', icon: FileText },
  { id: 'report_export', name: 'Export Reports', description: 'Download report data', category: 'ANALYTICS', icon: Download },

  // System & Security
  { id: 'org_settings', name: 'Organization Settings', description: 'Manage organization configuration', category: 'SYSTEM', icon: Settings },
  { id: 'audit_view', name: 'View Audit Logs', description: 'Access security audit trails', category: 'SECURITY', icon: Eye },
  { id: 'audit_export', name: 'Export Audit Logs', description: 'Download audit data', category: 'SECURITY', icon: Download },
  { id: 'security_summary', name: 'Security Summary', description: 'View security dashboard', category: 'SECURITY', icon: Shield },
]

// Default role permissions
const defaultRolePermissions: RolePermission[] = [
  {
    role: 'SUPER_ADMIN',
    permissions: Object.fromEntries(permissions.map(p => [p.id, true])), // All permissions
  },
  {
    role: 'ADMIN',
    permissions: {
      // Users
      user_create: true, user_read: true, user_update: true, user_delete: false, user_invite: true, role_manage: true,
      // Customers
      customer_create: true, customer_read: true, customer_update: true, customer_delete: true, customer_export: true,
      // Financial
      quote_create: true, quote_read: true, quote_update: true, quote_delete: true, quote_approve: true, quote_convert: true,
      invoice_create: true, invoice_read: true, invoice_update: true, invoice_delete: true, invoice_send: true,
      payment_create: true, payment_read: true, payment_update: true, payment_refund: true,
      // Projects
      project_create: true, project_read: true, project_update: true, project_delete: true, project_time: true,
      // Analytics
      analytics_revenue: true, analytics_customer: true, analytics_payment: true, report_generate: true, report_export: true,
      // System
      org_settings: false, audit_view: true, audit_export: true, security_summary: true,
    },
  },
  {
    role: 'MANAGER',
    permissions: {
      // Users
      user_create: false, user_read: true, user_update: false, user_delete: false, user_invite: false, role_manage: false,
      // Customers
      customer_create: true, customer_read: true, customer_update: true, customer_delete: false, customer_export: true,
      // Financial
      quote_create: true, quote_read: true, quote_update: true, quote_delete: false, quote_approve: true, quote_convert: true,
      invoice_create: true, invoice_read: true, invoice_update: true, invoice_delete: false, invoice_send: true,
      payment_create: true, payment_read: true, payment_update: true, payment_refund: false,
      // Projects
      project_create: true, project_read: true, project_update: true, project_delete: false, project_time: true,
      // Analytics
      analytics_revenue: true, analytics_customer: true, analytics_payment: true, report_generate: true, report_export: false,
      // System
      org_settings: false, audit_view: false, audit_export: false, security_summary: false,
    },
  },
  {
    role: 'ACCOUNTANT',
    permissions: {
      // Users
      user_create: false, user_read: true, user_update: false, user_delete: false, user_invite: false, role_manage: false,
      // Customers
      customer_create: false, customer_read: true, customer_update: false, customer_delete: false, customer_export: true,
      // Financial
      quote_create: false, quote_read: true, quote_update: false, quote_delete: false, quote_approve: false, quote_convert: false,
      invoice_create: true, invoice_read: true, invoice_update: true, invoice_delete: false, invoice_send: true,
      payment_create: true, payment_read: true, payment_update: true, payment_refund: true,
      // Projects
      project_create: false, project_read: true, project_update: false, project_delete: false, project_time: false,
      // Analytics
      analytics_revenue: true, analytics_customer: false, analytics_payment: true, report_generate: true, report_export: true,
      // System
      org_settings: false, audit_view: false, audit_export: false, security_summary: false,
    },
  },
  {
    role: 'EMPLOYEE',
    permissions: {
      // Users
      user_create: false, user_read: false, user_update: false, user_delete: false, user_invite: false, role_manage: false,
      // Customers
      customer_create: true, customer_read: true, customer_update: true, customer_delete: false, customer_export: false,
      // Financial
      quote_create: true, quote_read: true, quote_update: true, quote_delete: false, quote_approve: false, quote_convert: false,
      invoice_create: false, invoice_read: true, invoice_update: false, invoice_delete: false, invoice_send: false,
      payment_create: false, payment_read: true, payment_update: false, payment_refund: false,
      // Projects
      project_create: false, project_read: true, project_update: true, project_delete: false, project_time: true,
      // Analytics
      analytics_revenue: false, analytics_customer: false, analytics_payment: false, report_generate: false, report_export: false,
      // System
      org_settings: false, audit_view: false, audit_export: false, security_summary: false,
    },
  },
  {
    role: 'VIEWER',
    permissions: {
      // Users
      user_create: false, user_read: false, user_update: false, user_delete: false, user_invite: false, role_manage: false,
      // Customers
      customer_create: false, customer_read: true, customer_update: false, customer_delete: false, customer_export: false,
      // Financial
      quote_create: false, quote_read: true, quote_update: false, quote_delete: false, quote_approve: false, quote_convert: false,
      invoice_create: false, invoice_read: true, invoice_update: false, invoice_delete: false, invoice_send: false,
      payment_create: false, payment_read: true, payment_update: false, payment_refund: false,
      // Projects
      project_create: false, project_read: true, project_update: false, project_delete: false, project_time: false,
      // Analytics
      analytics_revenue: false, analytics_customer: false, analytics_payment: false, report_generate: false, report_export: false,
      // System
      org_settings: false, audit_view: false, audit_export: false, security_summary: false,
    },
  },
]

interface PermissionMatrixProps {
  userId?: string
}

export function PermissionMatrix({ userId }: PermissionMatrixProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [editMode, setEditMode] = useState(false)
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(defaultRolePermissions)

  const categories = ['all', 'AUTH', 'DATA', 'FINANCIAL', 'ANALYTICS', 'SYSTEM', 'SECURITY'] as const

  const filteredPermissions = selectedCategory === 'all'
    ? permissions
    : permissions.filter(p => p.category === selectedCategory)

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

  const hasPermission = (role: UserRole, permissionId: string): boolean => {
    const rolePermission = rolePermissions.find(rp => rp.role === role)
    return rolePermission?.permissions[permissionId] || false
  }

  const togglePermission = (role: UserRole, permissionId: string) => {
    if (!editMode) return

    setRolePermissions(prev => prev.map(rp =>
      rp.role === role
        ? {
            ...rp,
            permissions: {
              ...rp.permissions,
              [permissionId]: !rp.permissions[permissionId]
            }
          }
        : rp
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Permission Matrix</h3>
          <p className="text-muted-foreground">
            {userId ? 'User-specific permissions' : 'Role-based permission system'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={editMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Save Changes' : 'Edit Permissions'}
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-7">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category === 'all' ? 'All' : category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {selectedCategory === 'all' ? (
                  <>
                    <Shield className="w-5 h-5" />
                    All Permissions
                  </>
                ) : (
                  <>
                    {selectedCategory === 'AUTH' && <Users className="w-5 h-5" />}
                    {selectedCategory === 'DATA' && <FileText className="w-5 h-5" />}
                    {selectedCategory === 'FINANCIAL' && <CreditCard className="w-5 h-5" />}
                    {selectedCategory === 'ANALYTICS' && <BarChart3 className="w-5 h-5" />}
                    {selectedCategory === 'SYSTEM' && <Settings className="w-5 h-5" />}
                    {selectedCategory === 'SECURITY' && <Shield className="w-5 h-5" />}
                    {selectedCategory} Permissions
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Permission</th>
                      {(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'EMPLOYEE', 'VIEWER'] as UserRole[]).map((role) => (
                        <th key={role} className="text-center p-3 font-medium min-w-[120px]">
                          {getRoleBadge(role)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPermissions.map((permission) => {
                      const Icon = permission.icon
                      return (
                        <tr key={permission.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <div className="flex items-start gap-3">
                              <Icon className="w-4 h-4 mt-1 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{permission.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {permission.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          {(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'EMPLOYEE', 'VIEWER'] as UserRole[]).map((role) => (
                            <td key={role} className="p-3 text-center">
                              {editMode ? (
                                <Switch
                                  checked={hasPermission(role, permission.id)}
                                  onCheckedChange={() => togglePermission(role, permission.id)}
                                />
                              ) : (
                                <div className="flex justify-center">
                                  {hasPermission(role, permission.id) ? (
                                    <Check className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <X className="w-5 h-5 text-red-400" />
                                  )}
                                </div>
                              )}
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Permission Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'EMPLOYEE', 'VIEWER'] as UserRole[]).map((role) => {
              const rolePermission = rolePermissions.find(rp => rp.role === role)
              const grantedCount = Object.values(rolePermission?.permissions || {}).filter(Boolean).length
              const totalCount = permissions.length

              return (
                <div key={role} className="text-center">
                  {getRoleBadge(role)}
                  <div className="text-sm text-muted-foreground mt-2">
                    {grantedCount}/{totalCount} permissions
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-1">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(grantedCount / totalCount) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}