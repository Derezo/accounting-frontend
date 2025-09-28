import React, { useState } from 'react'
import { Users, Plus, Filter, Download, Calendar, Clock, TrendingUp, UserCheck, UserX, Settings, Search, MoreHorizontal, Edit, Trash2, FileText, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table } from '@/components/ui/table'
import { Tabs } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { useEmployees, useEmployeeAnalytics } from '@/hooks/useEmployees'
import { useAuthStore } from '@/stores/auth.store'
import {
  EmployeeFilters,
  EmployeeStatus,
  EmploymentType,
  Employee
} from '@/types/employees'
import { cn } from '@/lib/utils'

type TabValue = 'employees' | 'contractors' | 'time-tracking' | 'leave' | 'performance' | 'payroll'

const EMPLOYEE_STATUS_COLORS: Record<EmployeeStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  INACTIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  TERMINATED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  ON_LEAVE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  PENDING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
}

const EMPLOYMENT_TYPE_COLORS: Record<EmploymentType, string> = {
  FULL_TIME: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  PART_TIME: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  CONTRACT: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  INTERN: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  TEMPORARY: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
}

export function EmployeesPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabValue>('employees')
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const [filters, setFilters] = useState<EmployeeFilters>({})

  // Query data
  const { data: employees = [], isLoading: employeesLoading } = useEmployees(filters)
  const { data: analytics, isLoading: analyticsLoading } = useEmployeeAnalytics(filters)

  const handleFilterChange = (key: keyof EmployeeFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  const canManageEmployees = user?.permissions?.includes('employees:write')
  const canViewPayroll = user?.permissions?.includes('payroll:read')
  const canViewReports = user?.permissions?.includes('reports:read')

  const activeEmployees = employees.filter(e => e.status === 'ACTIVE')
  const pendingEmployees = employees.filter(e => e.status === 'PENDING')
  const onLeaveEmployees = employees.filter(e => e.status === 'ON_LEAVE')

  const getStatusIcon = (status: EmployeeStatus) => {
    switch (status) {
      case 'ACTIVE': return <UserCheck className="h-4 w-4" />
      case 'INACTIVE': return <UserX className="h-4 w-4" />
      case 'TERMINATED': return <UserX className="h-4 w-4" />
      case 'ON_LEAVE': return <Calendar className="h-4 w-4" />
      case 'PENDING': return <Clock className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
          <p className="text-muted-foreground">
            Manage employees, contractors, time tracking, and performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canViewReports && (
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          )}
          {canManageEmployees && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Total Employees</span>
          </div>
          <div className="text-2xl font-bold">{employees.length}</div>
          <div className="text-sm text-muted-foreground">
            {activeEmployees.length} active
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <UserCheck className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Active</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{activeEmployees.length}</div>
          <div className="text-sm text-muted-foreground">
            employees working
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium">Pending</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">{pendingEmployees.length}</div>
          <div className="text-sm text-muted-foreground">
            new hires
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">On Leave</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{onLeaveEmployees.length}</div>
          <div className="text-sm text-muted-foreground">
            employees
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium">Avg Tenure</span>
          </div>
          <div className="text-2xl font-bold">
            {analytics?.averageTenure ? `${Math.round(analytics.averageTenure / 365)} yr` : '0'}
          </div>
          <div className="text-sm text-muted-foreground">
            employee tenure
          </div>
        </div>
      </div>

      <Separator />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
        <Tabs.List className="grid w-full grid-cols-6">
          <Tabs.Trigger value="employees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Employees ({employees.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="contractors" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Contractors
          </Tabs.Trigger>
          <Tabs.Trigger value="time-tracking" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time Tracking
          </Tabs.Trigger>
          <Tabs.Trigger value="leave" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Leave Management
          </Tabs.Trigger>
          <Tabs.Trigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </Tabs.Trigger>
          {canViewPayroll && (
            <Tabs.Trigger value="payroll" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Payroll
            </Tabs.Trigger>
          )}
        </Tabs.List>

        <div className="mt-6">
          {/* Employees Tab */}
          <Tabs.Content value="employees">
            {/* Filters */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg mb-6">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <Select
                value={filters.status || ''}
                onValueChange={(value) => handleFilterChange('status', value || undefined)}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="PENDING">Pending</option>
                <option value="TERMINATED">Terminated</option>
              </Select>

              <Select
                value={filters.employmentType || ''}
                onValueChange={(value) => handleFilterChange('employmentType', value || undefined)}
              >
                <option value="">All Types</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERN">Intern</option>
                <option value="TEMPORARY">Temporary</option>
              </Select>

              <Select
                value={filters.department || ''}
                onValueChange={(value) => handleFilterChange('department', value || undefined)}
              >
                <option value="">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </Select>

              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
                  className="w-64"
                />
              </div>

              {Object.keys(filters).length > 0 && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}

              <div className="ml-auto text-sm text-muted-foreground">
                {employees.length} employees
              </div>
            </div>

            {/* Employees Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4">Employee</th>
                    <th className="text-left p-4">Position</th>
                    <th className="text-left p-4">Department</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Employment Type</th>
                    <th className="text-left p-4">Hire Date</th>
                    <th className="text-left p-4">Manager</th>
                    <th className="text-center p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employeesLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                        <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                        <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                        <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                        <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                        <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                        <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                        <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                      </tr>
                    ))
                  ) : employees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center p-12 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No employees found</h3>
                        <p>No employees match your current filters.</p>
                      </td>
                    </tr>
                  ) : (
                    employees.map((employee) => (
                      <tr
                        key={employee.id}
                        className="border-b hover:bg-muted/25 cursor-pointer"
                        onClick={() => setSelectedEmployee(employee.id)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-medium text-sm">
                              {employee.firstName[0]}{employee.lastName[0]}
                            </div>
                            <div>
                              <div className="font-medium">
                                {employee.firstName} {employee.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                {employee.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {employee.email}
                                  </span>
                                )}
                                {employee.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {employee.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{employee.position}</div>
                          <div className="text-sm text-muted-foreground">ID: {employee.employeeId}</div>
                        </td>
                        <td className="p-4">
                          <span className="font-medium">{employee.department || 'Unassigned'}</span>
                        </td>
                        <td className="p-4">
                          <Badge className={EMPLOYEE_STATUS_COLORS[employee.status]} size="sm">
                            <div className="flex items-center gap-1">
                              {getStatusIcon(employee.status)}
                              {employee.status.replace('_', ' ')}
                            </div>
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={EMPLOYMENT_TYPE_COLORS[employee.employmentType]} size="sm">
                            {employee.employmentType.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            {new Date(employee.hireDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {Math.floor((Date.now() - new Date(employee.hireDate).getTime()) / (1000 * 60 * 60 * 24))} days
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm">
                            {employee.reportsToEmployee
                              ? `${employee.reportsToEmployee.firstName} ${employee.reportsToEmployee.lastName}`
                              : 'No manager'
                            }
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {canManageEmployees && (
                            <DropdownMenu>
                              <DropdownMenu.Trigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenu.Trigger>
                              <DropdownMenu.Content align="end">
                                <DropdownMenu.Item>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Employee
                                </DropdownMenu.Item>
                                <DropdownMenu.Item>
                                  <FileText className="h-4 w-4 mr-2" />
                                  View Profile
                                </DropdownMenu.Item>
                                <DropdownMenu.Separator />
                                <DropdownMenu.Item className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove Employee
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Tabs.Content>

          {/* Other tabs would be placeholder content for now */}
          <Tabs.Content value="contractors">
            <div className="text-center p-12 text-muted-foreground">
              <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Contractor Management</h3>
              <p>Contractor management interface would be implemented here</p>
            </div>
          </Tabs.Content>

          <Tabs.Content value="time-tracking">
            <div className="text-center p-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Time Tracking</h3>
              <p>Time tracking interface would be implemented here</p>
            </div>
          </Tabs.Content>

          <Tabs.Content value="leave">
            <div className="text-center p-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Leave Management</h3>
              <p>Leave management interface would be implemented here</p>
            </div>
          </Tabs.Content>

          <Tabs.Content value="performance">
            <div className="text-center p-12 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Performance Management</h3>
              <p>Performance management interface would be implemented here</p>
            </div>
          </Tabs.Content>

          {canViewPayroll && (
            <Tabs.Content value="payroll">
              <div className="text-center p-12 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Payroll Management</h3>
                <p>Payroll management interface would be implemented here</p>
              </div>
            </Tabs.Content>
          )}
        </div>
      </Tabs>

      {/* Create Employee Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-lg shadow-lg w-full max-w-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Add New Employee</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">First Name</label>
                    <Input placeholder="Enter first name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Name</label>
                    <Input placeholder="Enter last name" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="Enter email address" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Position</label>
                    <Input placeholder="Enter position/job title" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Department</label>
                    <Select>
                      <option value="">Select department</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Employment Type</label>
                    <Select>
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERN">Intern</option>
                      <option value="TEMPORARY">Temporary</option>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Hire Date</label>
                    <Input type="date" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Salary (Annual)</label>
                    <Input type="number" placeholder="Annual salary" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Reports To</label>
                    <Select>
                      <option value="">Select manager</option>
                      {employees.filter(e => e.isManager).map(manager => (
                        <option key={manager.id} value={manager.id}>
                          {manager.firstName} {manager.lastName}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button>
                  Add Employee
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}