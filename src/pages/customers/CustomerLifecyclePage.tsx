import React, { useState } from 'react'
import { Users, MessageSquare, Calendar, TrendingUp, Settings, Plus, Filter, Download, Phone, Mail, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table } from '@/components/ui/table'
import { Tabs } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useCustomerLifecycles, useCustomerLifecycleAnalytics } from '@/hooks/useCustomerLifecycle'
import { useAuthStore } from '@/stores/auth.store'
import { CustomerLifecycleFilters, CustomerLifecycleStage, CustomerHealthScore, EngagementLevel } from '@/types/customer-lifecycle'
import { CustomerLifecycleDetails } from '@/components/customers/CustomerLifecycleDetails'
import { CommunicationForm } from '@/components/forms/CommunicationForm'
import { CustomerOnboardingDashboard } from '@/components/customers/CustomerOnboardingDashboard'
import { CustomerSegmentManager } from '@/components/customers/CustomerSegmentManager'
import { cn } from '@/lib/utils'

type TabValue = 'overview' | 'communications' | 'onboarding' | 'segments' | 'analytics'

const LIFECYCLE_STAGE_COLORS: Record<CustomerLifecycleStage, string> = {
  LEAD: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  PROSPECT: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  ONBOARDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  AT_RISK: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  CHURNED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  WON_BACK: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
}

const HEALTH_SCORE_COLORS: Record<CustomerHealthScore, string> = {
  EXCELLENT: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  GOOD: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  FAIR: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  POOR: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

const ENGAGEMENT_LEVEL_COLORS: Record<EngagementLevel, string> = {
  HIGH: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  MEDIUM: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  LOW: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  INACTIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
}

export function CustomerLifecyclePage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabValue>('overview')
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [showCommunicationForm, setShowCommunicationForm] = useState(false)

  const [filters, setFilters] = useState<CustomerLifecycleFilters>({})

  // Query data
  const { data: lifecycles = [], isLoading: lifecyclesLoading } = useCustomerLifecycles(filters)
  const { data: analytics, isLoading: analyticsLoading } = useCustomerLifecycleAnalytics(filters)

  const handleFilterChange = (key: keyof CustomerLifecycleFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  const atRiskCustomers = lifecycles.filter(l => l.isAtRisk || l.healthScore === 'CRITICAL' || l.healthScore === 'POOR')
  const needsAttentionCustomers = lifecycles.filter(l => l.requiresAttention)

  const canManageCustomers = user?.permissions?.includes('customers:write')

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Lifecycle Management</h1>
          <p className="text-muted-foreground">
            Track customer relationships, communications, and lifecycle stages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          {canManageCustomers && (
            <Button onClick={() => setShowCommunicationForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Log Communication
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Total Customers</span>
          </div>
          <div className="text-2xl font-bold">{lifecycles.length}</div>
          <div className="text-sm text-muted-foreground">
            {lifecycles.filter(l => l.currentStage === 'ACTIVE').length} active
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Lifetime Value</span>
          </div>
          <div className="text-2xl font-bold">
            ${lifecycles.reduce((sum, l) => sum + l.lifetimeValue, 0).toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            ${(lifecycles.reduce((sum, l) => sum + l.lifetimeValue, 0) / (lifecycles.length || 1)).toFixed(0)} avg
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">At Risk</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{atRiskCustomers.length}</div>
          <div className="text-sm text-muted-foreground">
            {((atRiskCustomers.length / (lifecycles.length || 1)) * 100).toFixed(1)}% of total
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium">Needs Attention</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">{needsAttentionCustomers.length}</div>
          <div className="text-sm text-muted-foreground">
            requiring follow-up
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {atRiskCustomers.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-red-600" />
            <span className="font-semibold text-red-800">Customers at Risk</span>
          </div>
          <div className="space-y-2">
            {atRiskCustomers.slice(0, 3).map((customer) => (
              <div key={customer.id} className="text-sm text-red-700 cursor-pointer hover:underline"
                   onClick={() => setSelectedCustomerId(customer.customerId)}>
                • {customer.customer?.business?.businessName || customer.customer?.person?.firstName + ' ' + customer.customer?.person?.lastName}
                : {customer.healthScore} health score, {customer.daysInCurrentStage} days in {customer.currentStage}
              </div>
            ))}
            {atRiskCustomers.length > 3 && (
              <div className="text-sm text-red-600">
                +{atRiskCustomers.length - 3} more customers need attention
              </div>
            )}
          </div>
        </div>
      )}

      <Separator />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
        <Tabs.List className="grid w-full grid-cols-5">
          <Tabs.Trigger value="overview" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger value="communications" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Communications
          </Tabs.Trigger>
          <Tabs.Trigger value="onboarding" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Onboarding
          </Tabs.Trigger>
          <Tabs.Trigger value="segments" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Segments
          </Tabs.Trigger>
          <Tabs.Trigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </Tabs.Trigger>
        </Tabs.List>

        <div className="mt-6">
          {/* Overview Tab */}
          <Tabs.Content value="overview">
            {/* Filters */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg mb-6">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <Select
                value={filters.stage || ''}
                onValueChange={(value) => handleFilterChange('stage', value || undefined)}
              >
                <option value="">All Stages</option>
                <option value="LEAD">Lead</option>
                <option value="PROSPECT">Prospect</option>
                <option value="ONBOARDING">Onboarding</option>
                <option value="ACTIVE">Active</option>
                <option value="AT_RISK">At Risk</option>
                <option value="CHURNED">Churned</option>
                <option value="WON_BACK">Won Back</option>
              </Select>

              <Select
                value={filters.healthScore || ''}
                onValueChange={(value) => handleFilterChange('healthScore', value || undefined)}
              >
                <option value="">All Health Scores</option>
                <option value="EXCELLENT">Excellent</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
                <option value="POOR">Poor</option>
                <option value="CRITICAL">Critical</option>
              </Select>

              <Select
                value={filters.engagementLevel || ''}
                onValueChange={(value) => handleFilterChange('engagementLevel', value || undefined)}
              >
                <option value="">All Engagement Levels</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
                <option value="INACTIVE">Inactive</option>
              </Select>

              <Input
                placeholder="Search customers..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
                className="w-64"
              />

              {Object.keys(filters).length > 0 && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}

              <div className="ml-auto text-sm text-muted-foreground">
                {lifecycles.length} customers
              </div>
            </div>

            {/* Customer Lifecycle Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4">Customer</th>
                    <th className="text-left p-4">Stage</th>
                    <th className="text-left p-4">Health Score</th>
                    <th className="text-left p-4">Engagement</th>
                    <th className="text-right p-4">Lifetime Value</th>
                    <th className="text-left p-4">Last Activity</th>
                    <th className="text-left p-4">Next Review</th>
                    <th className="text-center p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lifecyclesLoading ? (
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
                  ) : lifecycles.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center p-12 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No customers found</h3>
                        <p>No customers match your current filters.</p>
                      </td>
                    </tr>
                  ) : (
                    lifecycles.map((lifecycle) => (
                      <tr
                        key={lifecycle.id}
                        className="border-b hover:bg-muted/25 cursor-pointer"
                        onClick={() => setSelectedCustomerId(lifecycle.customerId)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="font-medium">
                                {lifecycle.customer?.business?.businessName ||
                                 `${lifecycle.customer?.person?.firstName} ${lifecycle.customer?.person?.lastName}`}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                {lifecycle.customer?.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {lifecycle.customer.email}
                                  </span>
                                )}
                                {lifecycle.customer?.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {lifecycle.customer.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={LIFECYCLE_STAGE_COLORS[lifecycle.currentStage]} size="sm">
                            {lifecycle.currentStage.replace('_', ' ')}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {lifecycle.daysInCurrentStage} days
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={HEALTH_SCORE_COLORS[lifecycle.healthScore]} size="sm">
                            {lifecycle.healthScore}
                          </Badge>
                          {lifecycle.isAtRisk && (
                            <div className="text-xs text-red-600 font-medium mt-1">At Risk</div>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge className={ENGAGEMENT_LEVEL_COLORS[lifecycle.engagementLevel]} size="sm">
                            {lifecycle.engagementLevel}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="font-semibold">
                            ${lifecycle.lifetimeValue.toLocaleString('en-US', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ${lifecycle.predictedLifetimeValue.toLocaleString()} predicted
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            {lifecycle.lastActivityDate
                              ? new Date(lifecycle.lastActivityDate).toLocaleDateString()
                              : 'No activity'
                            }
                          </div>
                        </td>
                        <td className="p-4">
                          <div className={cn(
                            "text-sm",
                            lifecycle.nextReviewDate && new Date(lifecycle.nextReviewDate) < new Date()
                              ? "text-red-600 font-medium"
                              : ""
                          )}>
                            {lifecycle.nextReviewDate
                              ? new Date(lifecycle.nextReviewDate).toLocaleDateString()
                              : 'Not scheduled'
                            }
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {lifecycle.requiresAttention && (
                              <div className="w-2 h-2 bg-orange-500 rounded-full" title="Requires attention" />
                            )}
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Tabs.Content>

          {/* Communications Tab */}
          <Tabs.Content value="communications">
            <div className="text-center p-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Communications Dashboard</h3>
              <p>Communication tracking component would go here</p>
            </div>
          </Tabs.Content>

          {/* Onboarding Tab */}
          <Tabs.Content value="onboarding">
            <CustomerOnboardingDashboard />
          </Tabs.Content>

          {/* Segments Tab */}
          <Tabs.Content value="segments">
            <CustomerSegmentManager />
          </Tabs.Content>

          {/* Analytics Tab */}
          <Tabs.Content value="analytics">
            {analyticsLoading ? (
              <div className="space-y-4">
                <div className="animate-pulse">
                  <div className="h-8 bg-muted rounded w-1/3 mb-4" />
                  <div className="grid grid-cols-2 gap-6">
                    <div className="h-64 bg-muted rounded" />
                    <div className="h-64 bg-muted rounded" />
                  </div>
                </div>
              </div>
            ) : analytics ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-card border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Lifecycle Stage Distribution</h3>
                    <div className="space-y-3">
                      {Object.entries(analytics.stageDistribution || {}).map(([stage, count]) => (
                        <div key={stage} className="flex items-center justify-between">
                          <span className="text-sm">{stage.replace('_', ' ')}</span>
                          <Badge className={LIFECYCLE_STAGE_COLORS[stage as CustomerLifecycleStage]}>
                            {count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-card border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Health Score Overview</h3>
                    <div className="space-y-3">
                      {Object.entries(analytics.healthScoreDistribution || {}).map(([score, count]) => (
                        <div key={score} className="flex items-center justify-between">
                          <span className="text-sm">{score}</span>
                          <Badge className={HEALTH_SCORE_COLORS[score as CustomerHealthScore]}>
                            {count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Customer Lifecycle Trends</h3>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Chart visualization would go here
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-12 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No analytics data available</h3>
                <p>Customer lifecycle analytics will appear here once you have customer data.</p>
              </div>
            )}
          </Tabs.Content>
        </div>
      </Tabs>

      {/* Customer Lifecycle Details Modal */}
      {selectedCustomerId && (
        <CustomerLifecycleDetails
          customerId={selectedCustomerId}
          open={!!selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}

      {/* Communication Form Modal */}
      {showCommunicationForm && (
        <CommunicationForm
          open={showCommunicationForm}
          onClose={() => setShowCommunicationForm(false)}
        />
      )}
    </div>
  )
}