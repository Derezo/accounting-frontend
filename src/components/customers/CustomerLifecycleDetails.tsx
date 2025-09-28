import React, { useState } from 'react'
import { X, Users, Phone, Mail, MapPin, Calendar, TrendingUp, FileText, Clock, AlertTriangle, CheckCircle, MessageSquare, Settings, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Table } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import {
  useCustomerLifecycle,
  useCustomerHistory,
  useCustomerInsights,
  useCustomerCommunications,
  useCustomerEvents,
  useAdvanceLifecycleStage,
  useUpdateCustomerLifecycle
} from '@/hooks/useCustomerLifecycle'
import { useAuthStore } from '@/stores/auth.store'
import {
  CustomerLifecycleStage,
  CustomerHealthScore,
  EngagementLevel,
  CommunicationType,
  EventType,
  TaskPriority
} from '@/types/customer-lifecycle'
import { cn } from '@/lib/utils'

interface CustomerLifecycleDetailsProps {
  customerId: string
  open: boolean
  onClose: () => void
}

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

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  LOW: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  MEDIUM: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  URGENT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

export function CustomerLifecycleDetails({ customerId, open, onClose }: CustomerLifecycleDetailsProps) {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'insights' | 'communications' | 'events'>('overview')
  const [stageUpdateNotes, setStageUpdateNotes] = useState('')
  const [newStage, setNewStage] = useState<CustomerLifecycleStage | ''>('')

  // Queries
  const { data: lifecycle, isLoading: lifecycleLoading } = useCustomerLifecycle(customerId)
  const { data: history, isLoading: historyLoading } = useCustomerHistory(customerId)
  const { data: insights, isLoading: insightsLoading } = useCustomerInsights(customerId)
  const { data: communications = [], isLoading: communicationsLoading } = useCustomerCommunications({ customerId })
  const { data: events = [], isLoading: eventsLoading } = useCustomerEvents(customerId)

  // Mutations
  const advanceStage = useAdvanceLifecycleStage()
  const updateLifecycle = useUpdateCustomerLifecycle()

  const canManageCustomers = user?.permissions?.includes('customers:write')

  const handleStageAdvance = () => {
    if (!newStage || !lifecycle) return

    advanceStage.mutate({
      customerId: lifecycle.customerId,
      stage: newStage,
      notes: stageUpdateNotes || undefined
    }, {
      onSuccess: () => {
        setNewStage('')
        setStageUpdateNotes('')
      }
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <Users className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">
                {lifecycle?.customer?.business?.businessName ||
                 `${lifecycle?.customer?.person?.firstName} ${lifecycle?.customer?.person?.lastName}`}
              </h2>
              <p className="text-sm text-muted-foreground">Customer Lifecycle Details</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {lifecycleLoading ? (
            <div className="p-6 space-y-4">
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-1/3 mb-4" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-32 bg-muted rounded" />
                  <div className="h-32 bg-muted rounded" />
                  <div className="h-32 bg-muted rounded" />
                </div>
              </div>
            </div>
          ) : !lifecycle ? (
            <div className="p-6 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Customer not found</h3>
              <p>The customer lifecycle data could not be loaded.</p>
            </div>
          ) : (
            <>
              {/* Quick Summary */}
              <div className="p-6 border-b">
                <div className="grid grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Current Stage</div>
                    <Badge className={LIFECYCLE_STAGE_COLORS[lifecycle.currentStage]}>
                      {lifecycle.currentStage.replace('_', ' ')}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {lifecycle.daysInCurrentStage} days in stage
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Health Score</div>
                    <Badge className={HEALTH_SCORE_COLORS[lifecycle.healthScore]}>
                      {lifecycle.healthScore}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      Risk Score: {lifecycle.riskScore}%
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Engagement</div>
                    <Badge className={ENGAGEMENT_LEVEL_COLORS[lifecycle.engagementLevel]}>
                      {lifecycle.engagementLevel}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      Churn Risk: {lifecycle.churnProbability}%
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Lifetime Value</div>
                    <div className="text-lg font-semibold">
                      ${lifecycle.lifetimeValue.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Predicted: ${lifecycle.predictedLifetimeValue.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Alerts */}
                {(lifecycle.isAtRisk || lifecycle.requiresAttention) && (
                  <div className="mt-4 p-4 rounded-lg bg-orange-50 border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-orange-800">Attention Required</span>
                    </div>
                    <div className="text-sm text-orange-700">
                      {lifecycle.isAtRisk && "This customer is at risk of churning. "}
                      {lifecycle.requiresAttention && "Customer requires immediate attention."}
                    </div>
                  </div>
                )}

                {/* Stage Update */}
                {canManageCustomers && (
                  <div className="mt-4 p-4 rounded-lg bg-muted/25 border">
                    <div className="flex items-center gap-2 mb-3">
                      <Edit className="h-4 w-4" />
                      <span className="font-medium">Update Customer Stage</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Select
                        value={newStage}
                        onValueChange={(value) => setNewStage(value as CustomerLifecycleStage)}
                      >
                        <option value="">Select new stage...</option>
                        <option value="LEAD">Lead</option>
                        <option value="PROSPECT">Prospect</option>
                        <option value="ONBOARDING">Onboarding</option>
                        <option value="ACTIVE">Active</option>
                        <option value="AT_RISK">At Risk</option>
                        <option value="CHURNED">Churned</option>
                        <option value="WON_BACK">Won Back</option>
                      </Select>
                      <Textarea
                        placeholder="Notes about stage change (optional)"
                        value={stageUpdateNotes}
                        onChange={(e) => setStageUpdateNotes(e.target.value)}
                        className="flex-1 h-10"
                      />
                      <Button
                        onClick={handleStageAdvance}
                        disabled={!newStage || advanceStage.isPending}
                      >
                        {advanceStage.isPending ? 'Updating...' : 'Update Stage'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="p-6">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                  <Tabs.List className="grid w-full grid-cols-5">
                    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
                    <Tabs.Trigger value="history">History</Tabs.Trigger>
                    <Tabs.Trigger value="insights">Insights</Tabs.Trigger>
                    <Tabs.Trigger value="communications">Communications</Tabs.Trigger>
                    <Tabs.Trigger value="events">Events</Tabs.Trigger>
                  </Tabs.List>

                  <div className="mt-6">
                    {/* Overview Tab */}
                    <Tabs.Content value="overview">
                      <div className="space-y-6">
                        {/* Customer Information */}
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Customer Information</h3>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{lifecycle.customer?.email || 'No email'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{lifecycle.customer?.phone || 'No phone'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {lifecycle.customer?.addresses?.[0] ?
                                    `${lifecycle.customer.addresses[0].street}, ${lifecycle.customer.addresses[0].city}` :
                                    'No address'
                                  }
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Key Dates</h3>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">First Contact:</span>
                                <span>{lifecycle.firstContactDate ? new Date(lifecycle.firstContactDate).toLocaleDateString() : 'Unknown'}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Last Activity:</span>
                                <span>{lifecycle.lastActivityDate ? new Date(lifecycle.lastActivityDate).toLocaleDateString() : 'None'}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Next Review:</span>
                                <span className={cn(
                                  lifecycle.nextReviewDate && new Date(lifecycle.nextReviewDate) < new Date()
                                    ? "text-red-600 font-medium"
                                    : ""
                                )}>
                                  {lifecycle.nextReviewDate ? new Date(lifecycle.nextReviewDate).toLocaleDateString() : 'Not scheduled'}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Days as Customer:</span>
                                <span>{lifecycle.daysAsCustomer} days</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Tags and Priority */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Tags & Priority</h3>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Priority:</span>
                              <Badge className={PRIORITY_COLORS[lifecycle.priority]}>
                                {lifecycle.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Tags:</span>
                              <div className="flex gap-2">
                                {lifecycle.tags.length > 0 ? (
                                  lifecycle.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" size="sm">
                                      {tag}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-sm text-muted-foreground">No tags</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Flags */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Status Flags</h3>
                          <div className="flex gap-4">
                            {lifecycle.isHighValue && (
                              <Badge className="bg-yellow-100 text-yellow-800">High Value</Badge>
                            )}
                            {lifecycle.isAtRisk && (
                              <Badge className="bg-red-100 text-red-800">At Risk</Badge>
                            )}
                            {lifecycle.requiresAttention && (
                              <Badge className="bg-orange-100 text-orange-800">Needs Attention</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Tabs.Content>

                    {/* History Tab */}
                    <Tabs.Content value="history">
                      {historyLoading ? (
                        <div className="animate-pulse space-y-4">
                          <div className="h-6 bg-muted rounded w-1/4" />
                          <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className="h-4 bg-muted rounded" />
                            ))}
                          </div>
                        </div>
                      ) : history ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-3 gap-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold">{history.totalProjects}</div>
                              <div className="text-sm text-muted-foreground">Total Projects</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold">${history.totalRevenue.toLocaleString()}</div>
                              <div className="text-sm text-muted-foreground">Total Revenue</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold">{history.averagePaymentTime} days</div>
                              <div className="text-sm text-muted-foreground">Avg Payment Time</div>
                            </div>
                          </div>

                          <Separator />

                          <div>
                            <h3 className="text-lg font-semibold mb-4">Customer Milestones</h3>
                            <div className="space-y-3">
                              {history.milestones.length > 0 ? (
                                history.milestones.map((milestone) => (
                                  <div key={milestone.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <div className="flex-1">
                                      <div className="font-medium">{milestone.title}</div>
                                      <div className="text-sm text-muted-foreground">{milestone.description}</div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {new Date(milestone.achievedDate).toLocaleDateString()}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center p-8 text-muted-foreground">
                                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                  <p>No milestones recorded yet</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-8 text-muted-foreground">
                          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No history data available</p>
                        </div>
                      )}
                    </Tabs.Content>

                    {/* Insights Tab */}
                    <Tabs.Content value="insights">
                      {insightsLoading ? (
                        <div className="animate-pulse space-y-4">
                          <div className="h-6 bg-muted rounded w-1/4" />
                          <div className="grid grid-cols-2 gap-4">
                            <div className="h-32 bg-muted rounded" />
                            <div className="h-32 bg-muted rounded" />
                          </div>
                        </div>
                      ) : insights ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold">Communication Preferences</h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Preferred Channel:</span>
                                  <span>{insights.communicationPreferences.preferredChannel}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Best Time to Contact:</span>
                                  <span>{insights.communicationPreferences.bestTimeToContact}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Response Rate:</span>
                                  <span>{(insights.communicationPreferences.responseRate * 100).toFixed(1)}%</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold">Payment Behavior</h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Avg Payment Time:</span>
                                  <span>{insights.paymentBehavior.averagePaymentTime} days</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Early Payment Rate:</span>
                                  <span>{(insights.paymentBehavior.earlyPaymentRate * 100).toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Late Payment Rate:</span>
                                  <span>{(insights.paymentBehavior.latePaymentRate * 100).toFixed(1)}%</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          <div>
                            <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                            <div className="space-y-3">
                              {insights.recommendations.length > 0 ? (
                                insights.recommendations.map((rec, index) => (
                                  <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium">{rec.title}</span>
                                      <Badge className={PRIORITY_COLORS[rec.priority]} size="sm">
                                        {rec.priority}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                                    <div className="text-xs text-muted-foreground">
                                      Impact: {rec.estimatedImpact}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center p-8 text-muted-foreground">
                                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                  <p>No recommendations available</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-8 text-muted-foreground">
                          <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No insights data available</p>
                        </div>
                      )}
                    </Tabs.Content>

                    {/* Communications Tab */}
                    <Tabs.Content value="communications">
                      {communicationsLoading ? (
                        <div className="animate-pulse space-y-4">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-16 bg-muted rounded" />
                          ))}
                        </div>
                      ) : communications.length > 0 ? (
                        <div className="space-y-4">
                          {communications.map((comm) => (
                            <div key={comm.id} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4" />
                                  <span className="font-medium">{comm.subject}</span>
                                </div>
                                <Badge size="sm">{comm.type}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{comm.summary}</p>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{comm.direction}</span>
                                <span>{new Date(comm.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-8 text-muted-foreground">
                          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No communications recorded</p>
                        </div>
                      )}
                    </Tabs.Content>

                    {/* Events Tab */}
                    <Tabs.Content value="events">
                      {eventsLoading ? (
                        <div className="animate-pulse space-y-4">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-16 bg-muted rounded" />
                          ))}
                        </div>
                      ) : events.length > 0 ? (
                        <div className="space-y-4">
                          {events.map((event) => (
                            <div key={event.id} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span className="font-medium">{event.title}</span>
                                </div>
                                <Badge size="sm">{event.type}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{event.status}</span>
                                <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-8 text-muted-foreground">
                          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No events recorded</p>
                        </div>
                      )}
                    </Tabs.Content>
                  </div>
                </Tabs>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}