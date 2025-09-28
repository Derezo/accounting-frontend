import React, { useState } from 'react'
import { Plus, Edit, Trash2, Settings, Users, Filter, Target, TrendingUp, BarChart3, Layers, X, Check, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table } from '@/components/ui/table'
import { Tabs } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
  useCustomerSegments,
  useCustomerSegment,
  useCreateCustomerSegment,
  useUpdateCustomerSegment
} from '@/hooks/useCustomerLifecycle'
import { useAuthStore } from '@/stores/auth.store'
import {
  CustomerSegment,
  SegmentCriteria,
  SegmentRule,
  CustomerLifecycleStage,
  CustomerHealthScore,
  EngagementLevel
} from '@/types/customer-lifecycle'
import { cn } from '@/lib/utils'

interface SegmentFormData {
  name: string
  description: string
  criteria: SegmentCriteria
  isActive: boolean
  isAutoUpdated: boolean
}

const SEGMENT_OPERATORS = [
  { value: 'EQUALS', label: 'Equals' },
  { value: 'NOT_EQUALS', label: 'Not Equals' },
  { value: 'GREATER_THAN', label: 'Greater Than' },
  { value: 'LESS_THAN', label: 'Less Than' },
  { value: 'CONTAINS', label: 'Contains' },
  { value: 'NOT_CONTAINS', label: 'Does Not Contain' },
  { value: 'IN', label: 'In List' },
  { value: 'NOT_IN', label: 'Not In List' },
]

const SEGMENT_FIELDS = [
  { value: 'currentStage', label: 'Current Stage', type: 'STRING' },
  { value: 'healthScore', label: 'Health Score', type: 'STRING' },
  { value: 'engagementLevel', label: 'Engagement Level', type: 'STRING' },
  { value: 'lifetimeValue', label: 'Lifetime Value', type: 'NUMBER' },
  { value: 'daysAsCustomer', label: 'Days as Customer', type: 'NUMBER' },
  { value: 'riskScore', label: 'Risk Score', type: 'NUMBER' },
  { value: 'churnProbability', label: 'Churn Probability', type: 'NUMBER' },
  { value: 'isHighValue', label: 'High Value Customer', type: 'BOOLEAN' },
  { value: 'isAtRisk', label: 'At Risk', type: 'BOOLEAN' },
  { value: 'requiresAttention', label: 'Requires Attention', type: 'BOOLEAN' },
  { value: 'tags', label: 'Tags', type: 'ARRAY' },
  { value: 'customerType', label: 'Customer Type', type: 'STRING' },
  { value: 'lastActivityDate', label: 'Last Activity Date', type: 'DATE' },
]

export function CustomerSegmentManager() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'segments' | 'create' | 'analytics'>('segments')
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingSegment, setEditingSegment] = useState<CustomerSegment | null>(null)

  const [formData, setFormData] = useState<SegmentFormData>({
    name: '',
    description: '',
    criteria: {
      rules: [],
      logic: 'AND'
    },
    isActive: true,
    isAutoUpdated: true
  })

  // Queries
  const { data: segments = [], isLoading: segmentsLoading } = useCustomerSegments()
  const { data: selectedSegmentData } = useCustomerSegment(selectedSegment || '')

  // Mutations
  const createSegment = useCreateCustomerSegment()
  const updateSegment = useUpdateCustomerSegment()

  const canManageSegments = user?.permissions?.includes('customers:write')

  const handleAddRule = () => {
    setFormData(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        rules: [
          ...prev.criteria.rules,
          {
            field: 'currentStage',
            operator: 'EQUALS',
            value: '',
            dataType: 'STRING'
          }
        ]
      }
    }))
  }

  const handleRemoveRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        rules: prev.criteria.rules.filter((_, i) => i !== index)
      }
    }))
  }

  const handleUpdateRule = (index: number, updates: Partial<SegmentRule>) => {
    setFormData(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        rules: prev.criteria.rules.map((rule, i) =>
          i === index ? { ...rule, ...updates } : rule
        )
      }
    }))
  }

  const handleSubmit = () => {
    if (editingSegment) {
      updateSegment.mutate({
        id: editingSegment.id,
        data: formData
      }, {
        onSuccess: () => {
          setShowForm(false)
          setEditingSegment(null)
          resetForm()
        }
      })
    } else {
      createSegment.mutate(formData, {
        onSuccess: () => {
          setShowForm(false)
          resetForm()
        }
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      criteria: {
        rules: [],
        logic: 'AND'
      },
      isActive: true,
      isAutoUpdated: true
    })
  }

  const handleEdit = (segment: CustomerSegment) => {
    setEditingSegment(segment)
    setFormData({
      name: segment.name,
      description: segment.description || '',
      criteria: segment.criteria,
      isActive: segment.isActive,
      isAutoUpdated: segment.isAutoUpdated
    })
    setShowForm(true)
  }

  const getFieldOptions = (fieldType: string) => {
    switch (fieldType) {
      case 'currentStage':
        return ['LEAD', 'PROSPECT', 'ONBOARDING', 'ACTIVE', 'AT_RISK', 'CHURNED', 'WON_BACK']
      case 'healthScore':
        return ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL']
      case 'engagementLevel':
        return ['HIGH', 'MEDIUM', 'LOW', 'INACTIVE']
      case 'customerType':
        return ['BUSINESS', 'INDIVIDUAL']
      default:
        return []
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customer Segments</h2>
          <p className="text-muted-foreground">
            Create and manage customer segments for targeted marketing and analysis
          </p>
        </div>
        {canManageSegments && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Segment
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Layers className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Total Segments</span>
          </div>
          <div className="text-2xl font-bold">{segments.length}</div>
          <div className="text-sm text-muted-foreground">
            {segments.filter(s => s.isActive).length} active
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Total Customers</span>
          </div>
          <div className="text-2xl font-bold">
            {segments.reduce((sum, s) => sum + s.customerCount, 0)}
          </div>
          <div className="text-sm text-muted-foreground">
            across all segments
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Target className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">Largest Segment</span>
          </div>
          <div className="text-2xl font-bold">
            {segments.length > 0 ? Math.max(...segments.map(s => s.customerCount)) : 0}
          </div>
          <div className="text-sm text-muted-foreground">
            customers
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium">Auto-Updated</span>
          </div>
          <div className="text-2xl font-bold">
            {segments.filter(s => s.isAutoUpdated).length}
          </div>
          <div className="text-sm text-muted-foreground">
            dynamic segments
          </div>
        </div>
      </div>

      <Separator />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <Tabs.List className="grid w-full grid-cols-3">
          <Tabs.Trigger value="segments" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Segments ({segments.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New
          </Tabs.Trigger>
          <Tabs.Trigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Tabs.Trigger>
        </Tabs.List>

        <div className="mt-6">
          {/* Segments List Tab */}
          <Tabs.Content value="segments">
            <div className="space-y-4">
              {segmentsLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="p-6 border rounded-lg animate-pulse">
                    <div className="h-6 bg-muted rounded w-1/3 mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3 mb-4" />
                    <div className="h-4 bg-muted rounded w-1/4" />
                  </div>
                ))
              ) : segments.length === 0 ? (
                <div className="text-center p-12 text-muted-foreground">
                  <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No segments created</h3>
                  <p>Create customer segments to organize and target your customers effectively.</p>
                </div>
              ) : (
                segments.map((segment) => (
                  <div
                    key={segment.id}
                    className="p-6 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedSegment(
                      selectedSegment === segment.id ? null : segment.id
                    )}
                  >
                    {/* Segment Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">{segment.name}</h3>
                          {segment.description && (
                            <p className="text-sm text-muted-foreground">{segment.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={segment.isActive ? 'default' : 'secondary'} size="sm">
                          {segment.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {segment.isAutoUpdated && (
                          <Badge variant="outline" size="sm">
                            Auto-Updated
                          </Badge>
                        )}
                        <div className="text-right">
                          <div className="text-2xl font-bold">{segment.customerCount}</div>
                          <div className="text-xs text-muted-foreground">customers</div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Criteria Summary */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span>{segment.criteria.rules.length} rule(s)</span>
                      <span>Logic: {segment.criteria.logic}</span>
                      <span>Updated: {new Date(segment.updatedAt).toLocaleDateString()}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {segment.criteria.rules.slice(0, 2).map((rule, index) => (
                          <Badge key={index} variant="outline" size="sm">
                            {SEGMENT_FIELDS.find(f => f.value === rule.field)?.label || rule.field} {rule.operator.toLowerCase()} {rule.value}
                          </Badge>
                        ))}
                        {segment.criteria.rules.length > 2 && (
                          <Badge variant="outline" size="sm">
                            +{segment.criteria.rules.length - 2} more
                          </Badge>
                        )}
                      </div>

                      {canManageSegments && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(segment)
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Expanded Details */}
                    {selectedSegment === segment.id && (
                      <div className="mt-6 pt-6 border-t">
                        <h4 className="font-semibold mb-4">Segment Criteria</h4>
                        <div className="space-y-3">
                          <div className="text-sm">
                            <strong>Logic:</strong> {segment.criteria.logic} (all/any rules must match)
                          </div>
                          <div className="space-y-2">
                            {segment.criteria.rules.map((rule, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-muted/25 rounded text-sm">
                                <span className="font-medium">
                                  {SEGMENT_FIELDS.find(f => f.value === rule.field)?.label || rule.field}
                                </span>
                                <span className="text-muted-foreground">{rule.operator.toLowerCase()}</span>
                                <Badge variant="outline" size="sm">{rule.value}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Tabs.Content>

          {/* Create/Edit Tab */}
          <Tabs.Content value="create">
            <div className="max-w-3xl">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Segment Name *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., High Value Customers"
                      />
                    </div>

                    <div className="space-y-2 flex items-center gap-4 pt-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.isActive}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: !!checked }))}
                        />
                        <label className="text-sm font-medium">Active</label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.isAutoUpdated}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAutoUpdated: !!checked }))}
                        />
                        <label className="text-sm font-medium">Auto-Update</label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe this customer segment and its purpose"
                      rows={3}
                    />
                  </div>
                </div>

                <Separator />

                {/* Criteria Builder */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Segment Criteria</h3>
                    <Button onClick={handleAddRule} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Logic</label>
                    <Select
                      value={formData.criteria.logic}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        criteria: { ...prev.criteria, logic: value as 'AND' | 'OR' }
                      }))}
                    >
                      <option value="AND">AND (all rules must match)</option>
                      <option value="OR">OR (any rule can match)</option>
                    </Select>
                  </div>

                  {/* Rules */}
                  <div className="space-y-4">
                    {formData.criteria.rules.map((rule, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Rule {index + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveRule(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Field</label>
                            <Select
                              value={rule.field}
                              onValueChange={(value) => {
                                const field = SEGMENT_FIELDS.find(f => f.value === value)
                                handleUpdateRule(index, {
                                  field: value,
                                  dataType: field?.type as any || 'STRING'
                                })
                              }}
                            >
                              {SEGMENT_FIELDS.map(field => (
                                <option key={field.value} value={field.value}>
                                  {field.label}
                                </option>
                              ))}
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Operator</label>
                            <Select
                              value={rule.operator}
                              onValueChange={(value) => handleUpdateRule(index, { operator: value as any })}
                            >
                              {SEGMENT_OPERATORS.map(op => (
                                <option key={op.value} value={op.value}>
                                  {op.label}
                                </option>
                              ))}
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Value</label>
                            {getFieldOptions(rule.field).length > 0 ? (
                              <Select
                                value={rule.value}
                                onValueChange={(value) => handleUpdateRule(index, { value })}
                              >
                                {getFieldOptions(rule.field).map(option => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </Select>
                            ) : (
                              <Input
                                value={rule.value}
                                onChange={(e) => handleUpdateRule(index, { value: e.target.value })}
                                type={rule.dataType === 'NUMBER' ? 'number' :
                                      rule.dataType === 'DATE' ? 'date' : 'text'}
                                placeholder="Enter value"
                              />
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Type</label>
                            <Select
                              value={rule.dataType}
                              onValueChange={(value) => handleUpdateRule(index, { dataType: value as any })}
                            >
                              <option value="STRING">Text</option>
                              <option value="NUMBER">Number</option>
                              <option value="DATE">Date</option>
                              <option value="BOOLEAN">True/False</option>
                              <option value="ARRAY">Array</option>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}

                    {formData.criteria.rules.length === 0 && (
                      <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No rules defined yet. Add rules to create your segment criteria.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditingSegment(null)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!formData.name || formData.criteria.rules.length === 0 || createSegment.isPending || updateSegment.isPending}
                  >
                    {editingSegment ? 'Update Segment' : 'Create Segment'}
                  </Button>
                </div>
              </div>
            </div>
          </Tabs.Content>

          {/* Analytics Tab */}
          <Tabs.Content value="analytics">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Segment Size Distribution</h3>
                  <div className="space-y-3">
                    {segments.map((segment) => (
                      <div key={segment.id} className="flex items-center justify-between">
                        <span className="text-sm">{segment.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${segments.length > 0 ? (segment.customerCount / Math.max(...segments.map(s => s.customerCount))) * 100 : 0}%`
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium">{segment.customerCount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Segment Performance</h3>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {segments.filter(s => s.isActive).length} / {segments.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Active Segments</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {segments.filter(s => s.isAutoUpdated).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Auto-Updated</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Segment Overlap Analysis</h3>
                <div className="text-center p-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Segment overlap analysis would be displayed here with interactive charts.</p>
                </div>
              </div>
            </div>
          </Tabs.Content>
        </div>
      </Tabs>

      {/* Segment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">
                  {editingSegment ? 'Edit Segment' : 'Create New Segment'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowForm(false)
                    setEditingSegment(null)
                    resetForm()
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Form content would go here - same as the create tab but in modal */}
              <Tabs value="create">
                <Tabs.Content value="create">
                  {/* Same content as create tab */}
                </Tabs.Content>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}