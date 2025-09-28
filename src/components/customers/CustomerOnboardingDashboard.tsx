import React, { useState } from 'react'
import { Plus, Filter, Search, Calendar, CheckCircle, Clock, AlertTriangle, User, Loader2 as ProgressIcon, FileText, Play, Pause, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table } from '@/components/ui/table'
import { Progress as ProgressBar } from '@/components/ui/progress'
import { Tabs } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  useCustomerOnboardings,
  useOnboardingTemplates,
  useCreateOnboarding,
  useUpdateOnboardingStep,
  useCompleteOnboardingStep
} from '@/hooks/useCustomerLifecycle'
import { useAuthStore } from '@/stores/auth.store'
import {
  OnboardingStatus,
  TaskStatus,
  OnboardingFilters,
  CreateOnboardingRequest
} from '@/types/customer-lifecycle'
import { cn } from '@/lib/utils'

const ONBOARDING_STATUS_COLORS: Record<OnboardingStatus, string> = {
  NOT_STARTED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  STALLED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

export function CustomerOnboardingDashboard() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'active' | 'templates' | 'completed'>('active')
  const [selectedOnboarding, setSelectedOnboarding] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [stepCompletionNotes, setStepCompletionNotes] = useState('')

  const [filters, setFilters] = useState<OnboardingFilters>({})

  // Queries
  const { data: onboardings = [], isLoading: onboardingsLoading } = useCustomerOnboardings(filters)
  const { data: templates = [], isLoading: templatesLoading } = useOnboardingTemplates()

  // Mutations
  const createOnboarding = useCreateOnboarding()
  const updateStep = useUpdateOnboardingStep()
  const completeStep = useCompleteOnboardingStep()

  const canManageOnboarding = user?.permissions?.includes('customers:write')

  const handleFilterChange = (key: keyof OnboardingFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  const activeOnboardings = onboardings.filter(o => o.status === 'IN_PROGRESS' || o.status === 'NOT_STARTED' || o.status === 'STALLED')
  const completedOnboardings = onboardings.filter(o => o.status === 'COMPLETED' || o.status === 'CANCELLED')

  const handleCompleteStep = (onboardingId: string, stepId: string) => {
    completeStep.mutate({
      onboardingId,
      stepId,
      notes: stepCompletionNotes || undefined
    }, {
      onSuccess: () => {
        setStepCompletionNotes('')
      }
    })
  }

  const getStatusIcon = (status: OnboardingStatus) => {
    switch (status) {
      case 'NOT_STARTED': return <Clock className="h-4 w-4" />
      case 'IN_PROGRESS': return <Play className="h-4 w-4" />
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />
      case 'STALLED': return <Pause className="h-4 w-4" />
      case 'CANCELLED': return <X className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getTaskStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'IN_PROGRESS': return <Play className="h-4 w-4" />
      case 'COMPLETED': return <Check className="h-4 w-4" />
      case 'CANCELLED': return <X className="h-4 w-4" />
      case 'OVERDUE': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customer Onboarding</h2>
          <p className="text-muted-foreground">
            Manage customer onboarding processes and track progress
          </p>
        </div>
        {canManageOnboarding && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Start Onboarding
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Play className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Active Onboardings</span>
          </div>
          <div className="text-2xl font-bold">{activeOnboardings.length}</div>
          <div className="text-sm text-muted-foreground">
            {activeOnboardings.filter(o => o.status === 'STALLED').length} stalled
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Completed</span>
          </div>
          <div className="text-2xl font-bold">
            {completedOnboardings.filter(o => o.status === 'COMPLETED').length}
          </div>
          <div className="text-sm text-muted-foreground">
            this month
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <ProgressIcon className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">Avg Progress</span>
          </div>
          <div className="text-2xl font-bold">
            {activeOnboardings.length > 0
              ? Math.round(activeOnboardings.reduce((sum, o) => sum + o.progress, 0) / activeOnboardings.length)
              : 0}%
          </div>
          <div className="text-sm text-muted-foreground">
            completion rate
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium">Templates</span>
          </div>
          <div className="text-2xl font-bold">{templates.length}</div>
          <div className="text-sm text-muted-foreground">
            available
          </div>
        </div>
      </div>

      <Separator />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <Tabs.List className="grid w-full grid-cols-3">
          <Tabs.Trigger value="active" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Active Onboardings ({activeOnboardings.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates ({templates.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed ({completedOnboardings.length})
          </Tabs.Trigger>
        </Tabs.List>

        <div className="mt-6">
          {/* Active Onboardings Tab */}
          <Tabs.Content value="active">
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
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="STALLED">Stalled</option>
              </Select>

              <Select
                value={filters.assignedTo || ''}
                onValueChange={(value) => handleFilterChange('assignedTo', value || undefined)}
              >
                <option value="">All Assignees</option>
                <option value={user?.id}>Assigned to Me</option>
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
                {activeOnboardings.length} onboardings
              </div>
            </div>

            {/* Onboardings List */}
            <div className="space-y-4">
              {onboardingsLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg animate-pulse">
                    <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                    <div className="h-2 bg-muted rounded mb-4" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                ))
              ) : activeOnboardings.length === 0 ? (
                <div className="text-center p-12 text-muted-foreground">
                  <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No active onboardings</h3>
                  <p>No customers are currently being onboarded.</p>
                </div>
              ) : (
                activeOnboardings.map((onboarding) => (
                  <div
                    key={onboarding.id}
                    className="p-6 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedOnboarding(
                      selectedOnboarding === onboarding.id ? null : onboarding.id
                    )}
                  >
                    {/* Onboarding Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(onboarding.status)}
                          <h3 className="font-semibold">
                            {onboarding.customer?.business?.businessName ||
                             `${onboarding.customer?.person?.firstName} ${onboarding.customer?.person?.lastName}`}
                          </h3>
                        </div>
                        <Badge className={ONBOARDING_STATUS_COLORS[onboarding.status]} size="sm">
                          {onboarding.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Progress</div>
                        <div className="font-semibold">{onboarding.progress}%</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <ProgressBar value={onboarding.progress} className="h-2" />
                    </div>

                    {/* Quick Info */}
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Template:</span>
                        <div className="font-medium">{onboarding.template?.name || 'Custom'}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Assigned to:</span>
                        <div className="font-medium">{onboarding.assignedToUser?.name || 'Unassigned'}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Started:</span>
                        <div className="font-medium">
                          {onboarding.startedAt ? new Date(onboarding.startedAt).toLocaleDateString() : 'Not started'}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Est. Completion:</span>
                        <div className={cn(
                          "font-medium",
                          onboarding.estimatedCompletionDate && new Date(onboarding.estimatedCompletionDate) < new Date()
                            ? "text-red-600"
                            : ""
                        )}>
                          {onboarding.estimatedCompletionDate
                            ? new Date(onboarding.estimatedCompletionDate).toLocaleDateString()
                            : 'Not set'
                          }
                        </div>
                      </div>
                    </div>

                    {/* Expanded Steps View */}
                    {selectedOnboarding === onboarding.id && (
                      <div className="mt-6 pt-6 border-t">
                        <h4 className="font-semibold mb-4">Onboarding Steps</h4>
                        <div className="space-y-3">
                          {onboarding.steps.map((step, index) => (
                            <div key={step.id} className="flex items-center gap-4 p-3 border rounded">
                              <div className="flex items-center gap-2 flex-1">
                                <div className={cn(
                                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                                  step.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                  step.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                  step.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-600'
                                )}>
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium">{step.name}</div>
                                  {step.description && (
                                    <div className="text-sm text-muted-foreground">{step.description}</div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={TASK_STATUS_COLORS[step.status]} size="sm">
                                  {getTaskStatusIcon(step.status)}
                                  {step.status.replace('_', ' ')}
                                </Badge>
                                {step.status !== 'COMPLETED' && canManageOnboarding && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleCompleteStep(onboarding.id, step.id)
                                    }}
                                    disabled={completeStep.isPending}
                                  >
                                    Complete
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Step Completion Notes */}
                        {canManageOnboarding && (
                          <div className="mt-4 p-4 bg-muted/25 rounded">
                            <label className="text-sm font-medium mb-2 block">Step Completion Notes</label>
                            <Textarea
                              value={stepCompletionNotes}
                              onChange={(e) => setStepCompletionNotes(e.target.value)}
                              placeholder="Add notes about step completion..."
                              rows={2}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Tabs.Content>

          {/* Templates Tab */}
          <Tabs.Content value="templates">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templatesLoading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="p-6 border rounded-lg animate-pulse">
                    <div className="h-6 bg-muted rounded w-2/3 mb-2" />
                    <div className="h-4 bg-muted rounded w-full mb-4" />
                    <div className="h-4 bg-muted rounded w-1/3" />
                  </div>
                ))
              ) : templates.length === 0 ? (
                <div className="col-span-2 text-center p-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No templates available</h3>
                  <p>Create onboarding templates to standardize your customer onboarding process.</p>
                </div>
              ) : (
                templates.map((template) => (
                  <div key={template.id} className="p-6 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{template.name}</h3>
                      <Badge variant={template.isActive ? 'default' : 'secondary'} size="sm">
                        {template.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    {template.description && (
                      <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Steps:</span>
                        <span className="font-medium">{template.steps.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Est. Duration:</span>
                        <span className="font-medium">{template.estimatedDuration} days</span>
                      </div>
                    </div>

                    {canManageOnboarding && template.isActive && (
                      <Button
                        className="w-full mt-4"
                        variant="outline"
                        onClick={() => {
                          setShowCreateForm(true)
                          // Pre-select this template
                        }}
                      >
                        Use This Template
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </Tabs.Content>

          {/* Completed Tab */}
          <Tabs.Content value="completed">
            <div className="space-y-4">
              {completedOnboardings.length === 0 ? (
                <div className="text-center p-12 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No completed onboardings</h3>
                  <p>Completed customer onboardings will appear here.</p>
                </div>
              ) : (
                completedOnboardings.map((onboarding) => (
                  <div key={onboarding.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(onboarding.status)}
                          <span className="font-medium">
                            {onboarding.customer?.business?.businessName ||
                             `${onboarding.customer?.person?.firstName} ${onboarding.customer?.person?.lastName}`}
                          </span>
                        </div>
                        <Badge className={ONBOARDING_STATUS_COLORS[onboarding.status]} size="sm">
                          {onboarding.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {onboarding.completedAt
                          ? `Completed ${new Date(onboarding.completedAt).toLocaleDateString()}`
                          : 'Status changed'
                        }
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Tabs.Content>
        </div>
      </Tabs>

      {/* Create Onboarding Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Start New Onboarding</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Customer</label>
                  <Input placeholder="Search or enter customer ID..." />
                </div>

                <div>
                  <label className="text-sm font-medium">Template</label>
                  <Select>
                    <option value="">Select a template...</option>
                    {templates.filter(t => t.isActive).map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Assigned To</label>
                  <Select>
                    <option value="">Select assignee...</option>
                    <option value={user?.id}>Me</option>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Estimated Completion Date</label>
                  <Input type="date" />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button>
                  Start Onboarding
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}