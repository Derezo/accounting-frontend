import React, { useState } from 'react'
import { Shield, Settings, Users, Activity, Database, Zap, BarChart3, AlertTriangle, CheckCircle, XCircle, Clock, Server, Globe, Wrench, RefreshCw, Download, Plus, Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table } from '@/components/ui/table'
import { Tabs } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  useSystemHealth,
  useOrganizations,
  useSystemAnalytics,
  useSystemLogs,
  useIntegrations,
  useMaintenanceWindows,
  useFeatureToggles
} from '@/hooks/useSystemAdmin'
import { useAuthStore } from '@/stores/auth.store'
import {
  SystemStatus,
  TenantStatus,
  OrganizationFilters,
  SystemLogFilters,
  IntegrationFilters
} from '@/types/system-admin'
import { cn } from '@/lib/utils'

type TabValue = 'overview' | 'organizations' | 'monitoring' | 'integrations' | 'maintenance' | 'analytics' | 'settings'

const SYSTEM_STATUS_COLORS: Record<SystemStatus, string> = {
  HEALTHY: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  WARNING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  ERROR: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  MAINTENANCE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
}

const TENANT_STATUS_COLORS: Record<TenantStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  SUSPENDED: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  PENDING: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  TERMINATED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

export function SystemAdminPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabValue>('overview')
  const [orgFilters, setOrgFilters] = useState<OrganizationFilters>({})
  const [logFilters, setLogFilters] = useState<SystemLogFilters>({ level: 'ERROR' })
  const [integrationFilters, setIntegrationFilters] = useState<IntegrationFilters>({})

  // Query data
  const { data: systemHealth, isLoading: healthLoading } = useSystemHealth()
  const { data: organizations = [], isLoading: orgsLoading } = useOrganizations(orgFilters)
  const { data: analytics, isLoading: analyticsLoading } = useSystemAnalytics()
  const { data: logs = [], isLoading: logsLoading } = useSystemLogs(logFilters)
  const { data: integrations = [], isLoading: integrationsLoading } = useIntegrations(integrationFilters)
  const { data: maintenanceWindows = [], isLoading: maintenanceLoading } = useMaintenanceWindows()
  const { data: featureToggles = [], isLoading: togglesLoading } = useFeatureToggles()

  const isSuperAdmin = user?.role === 'SUPER_ADMIN'

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You need SUPER_ADMIN privileges to access this page.</p>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: SystemStatus) => {
    switch (status) {
      case 'HEALTHY': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'WARNING': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'ERROR': return <XCircle className="h-4 w-4 text-red-600" />
      case 'MAINTENANCE': return <Wrench className="h-4 w-4 text-blue-600" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const activeOrgs = organizations.filter(o => o.status === 'ACTIVE').length
  const suspendedOrgs = organizations.filter(o => o.status === 'SUSPENDED').length
  const pendingOrgs = organizations.filter(o => o.status === 'PENDING').length

  const activeIntegrations = integrations.filter(i => i.status === 'ACTIVE').length
  const failedIntegrations = integrations.filter(i => i.status === 'ERROR').length

  const activeMaintenance = maintenanceWindows.filter(m => m.status === 'IN_PROGRESS').length
  const plannedMaintenance = maintenanceWindows.filter(m => m.status === 'PLANNED').length

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            System Administration
          </h1>
          <p className="text-muted-foreground">
            System-wide management, monitoring, and configuration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* System Health Status */}
      {systemHealth && (
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(systemHealth.status)}
              <h2 className="text-xl font-semibold">System Status</h2>
              <Badge className={SYSTEM_STATUS_COLORS[systemHealth.status]}>
                {systemHealth.status}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date(systemHealth.timestamp).toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{systemHealth.uptime.toFixed(1)}h</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{systemHealth.cpu.usage.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">CPU Usage</div>
              <Progress value={systemHealth.cpu.usage} className="mt-1" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{systemHealth.memory.usage.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Memory Usage</div>
              <Progress value={systemHealth.memory.usage} className="mt-1" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{systemHealth.disk.usage.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Disk Usage</div>
              <Progress value={systemHealth.disk.usage} className="mt-1" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{systemHealth.metrics.requestsPerSecond}</div>
              <div className="text-sm text-muted-foreground">Requests/sec</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-6 gap-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Organizations</span>
          </div>
          <div className="text-2xl font-bold">{organizations.length}</div>
          <div className="text-sm text-muted-foreground">
            {activeOrgs} active
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">System Health</span>
          </div>
          <div className="text-2xl font-bold">
            {systemHealth?.services?.filter(s => s.status === 'HEALTHY').length || 0}
          </div>
          <div className="text-sm text-muted-foreground">
            services healthy
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">Integrations</span>
          </div>
          <div className="text-2xl font-bold">{integrations.length}</div>
          <div className="text-sm text-muted-foreground">
            {activeIntegrations} active
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Wrench className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium">Maintenance</span>
          </div>
          <div className="text-2xl font-bold">{activeMaintenance}</div>
          <div className="text-sm text-muted-foreground">
            active windows
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium">Critical Issues</span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {logs.filter(l => l.level === 'ERROR').length}
          </div>
          <div className="text-sm text-muted-foreground">
            in last 24h
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">Features</span>
          </div>
          <div className="text-2xl font-bold">
            {featureToggles.filter(f => f.enabled).length}
          </div>
          <div className="text-sm text-muted-foreground">
            enabled
          </div>
        </div>
      </div>

      <Separator />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
        <Tabs.List className="grid w-full grid-cols-7">
          <Tabs.Trigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger value="organizations" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Organizations ({organizations.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitoring
          </Tabs.Trigger>
          <Tabs.Trigger value="integrations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Integrations
          </Tabs.Trigger>
          <Tabs.Trigger value="maintenance" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Maintenance
          </Tabs.Trigger>
          <Tabs.Trigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Tabs.Trigger>
          <Tabs.Trigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Tabs.Trigger>
        </Tabs.List>

        <div className="mt-6">
          {/* Overview Tab */}
          <Tabs.Content value="overview">
            <div className="space-y-6">
              {/* System Services Status */}
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">System Services</h3>
                <div className="grid grid-cols-2 gap-4">
                  {systemHealth?.services?.map((service) => (
                    <div key={service.name} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Response time: {service.responseTime}ms
                          </div>
                        </div>
                      </div>
                      <Badge className={SYSTEM_STATUS_COLORS[service.status]} size="sm">
                        {service.status}
                      </Badge>
                    </div>
                  )) || (
                    <div className="col-span-2 text-center p-8 text-muted-foreground">
                      <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Service health data not available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Critical Logs */}
              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Recent Critical Issues</h3>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('monitoring')}>
                    View All Logs
                  </Button>
                </div>
                <div className="space-y-2">
                  {logs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center gap-3 p-3 border rounded">
                      <Badge
                        className={
                          log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                          log.level === 'WARN' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }
                        size="sm"
                      >
                        {log.level}
                      </Badge>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{log.message}</div>
                        <div className="text-xs text-muted-foreground">
                          {log.source} • {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-center p-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No critical issues found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Tabs.Content>

          {/* Organizations Tab */}
          <Tabs.Content value="organizations">
            {/* Filters */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg mb-6">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <Select
                value={orgFilters.status || ''}
                onValueChange={(value) => setOrgFilters(prev => ({ ...prev, status: value as TenantStatus || undefined }))}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="PENDING">Pending</option>
                <option value="TERMINATED">Terminated</option>
              </Select>

              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search organizations..."
                  value={orgFilters.search || ''}
                  onChange={(e) => setOrgFilters(prev => ({ ...prev, search: e.target.value || undefined }))}
                  className="w-64"
                />
              </div>

              <div className="ml-auto flex items-center gap-2">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Organization
                </Button>
              </div>
            </div>

            {/* Organizations Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4">Organization</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Plan</th>
                    <th className="text-left p-4">Users</th>
                    <th className="text-left p-4">Created</th>
                    <th className="text-left p-4">Last Activity</th>
                    <th className="text-center p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orgsLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                        <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                        <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                        <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                        <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                        <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                        <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                      </tr>
                    ))
                  ) : organizations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center p-12 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No organizations found</h3>
                        <p>No organizations match your current filters.</p>
                      </td>
                    </tr>
                  ) : (
                    organizations.map((org) => (
                      <tr key={org.id} className="border-b hover:bg-muted/25">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{org.name}</div>
                            <div className="text-sm text-muted-foreground">{org.slug}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={TENANT_STATUS_COLORS[org.status]} size="sm">
                            {org.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className="text-sm">
                            {org.subscription?.plan?.name || 'No Plan'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            {org.usage?.users?.active || 0} / {org.limits?.maxUsers || 'Unlimited'}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm">
                            {new Date(org.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm">
                            {org.lastLoginAt ? new Date(org.lastLoginAt).toLocaleDateString() : 'Never'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <Button variant="ghost" size="sm">
                            Manage
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Tabs.Content>

          {/* Other tabs would be placeholder content for now */}
          <Tabs.Content value="monitoring">
            <div className="text-center p-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">System Monitoring</h3>
              <p>System monitoring interface would be implemented here</p>
            </div>
          </Tabs.Content>

          <Tabs.Content value="integrations">
            <div className="text-center p-12 text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Integration Management</h3>
              <p>Integration management interface would be implemented here</p>
            </div>
          </Tabs.Content>

          <Tabs.Content value="maintenance">
            <div className="text-center p-12 text-muted-foreground">
              <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Maintenance Windows</h3>
              <p>Maintenance window management interface would be implemented here</p>
            </div>
          </Tabs.Content>

          <Tabs.Content value="analytics">
            <div className="text-center p-12 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">System Analytics</h3>
              <p>System-wide analytics and reporting interface would be implemented here</p>
            </div>
          </Tabs.Content>

          <Tabs.Content value="settings">
            <div className="text-center p-12 text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">System Settings</h3>
              <p>System configuration and settings interface would be implemented here</p>
            </div>
          </Tabs.Content>
        </div>
      </Tabs>
    </div>
  )
}