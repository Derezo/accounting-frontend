import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown,
  Shield,
  Target,
  Bell,
  Filter
} from 'lucide-react'
import { format, differenceInDays, addMonths } from 'date-fns'
import { cn } from '@/lib/utils'

interface ComplianceRequirement {
  id: string
  jurisdiction: string
  requirementType: 'FILING' | 'PAYMENT' | 'REGISTRATION' | 'RENEWAL' | 'REPORTING'
  description: string
  dueDate: string
  status: 'COMPLIANT' | 'PENDING' | 'OVERDUE' | 'AT_RISK'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY' | 'ONE_TIME'
  lastCompleted?: string
  nextDueDate?: string
  assignedTo?: string
  estimatedHours?: number
  completionPercentage: number
  notes?: string
}

interface ComplianceMetrics {
  overallScore: number
  totalRequirements: number
  compliantCount: number
  pendingCount: number
  overdueCount: number
  atRiskCount: number
  upcomingDeadlines: number
  averageCompletionTime: number
  trendDirection: 'UP' | 'DOWN' | 'STABLE'
  trendPercentage: number
}

interface TaxComplianceDashboardProps {
  metrics?: ComplianceMetrics
  requirements?: ComplianceRequirement[]
  isLoading?: boolean
  onViewRequirement?: (requirement: ComplianceRequirement) => void
  onCreateReminder?: (requirement: ComplianceRequirement) => void
  onMarkComplete?: (requirement: ComplianceRequirement) => void
  onGenerateReport?: () => void
}

export function TaxComplianceDashboard({
  metrics,
  requirements = [],
  isLoading = false,
  onViewRequirement,
  onCreateReminder,
  onMarkComplete,
  onGenerateReport
}: TaxComplianceDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPriority, setSelectedPriority] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | ComplianceRequirement['status']>('ALL')

  const getStatusColor = (status: ComplianceRequirement['status']) => {
    switch (status) {
      case 'COMPLIANT':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-blue-100 text-blue-800'
      case 'OVERDUE':
        return 'bg-red-100 text-red-800'
      case 'AT_RISK':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: ComplianceRequirement['status']) => {
    switch (status) {
      case 'COMPLIANT':
        return <CheckCircle className="h-4 w-4" />
      case 'OVERDUE':
        return <AlertTriangle className="h-4 w-4" />
      case 'AT_RISK':
        return <Clock className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: ComplianceRequirement['priority']) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-600'
      case 'MEDIUM':
        return 'text-yellow-600'
      case 'LOW':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    return differenceInDays(new Date(dueDate), new Date())
  }

  const filteredRequirements = requirements.filter(req => {
    const priorityMatch = selectedPriority === 'ALL' || req.priority === selectedPriority
    const statusMatch = selectedStatus === 'ALL' || req.status === selectedStatus
    return priorityMatch && statusMatch
  })

  const upcomingRequirements = requirements
    .filter(req => req.status !== 'COMPLIANT' && req.status !== 'OVERDUE')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  const overdueRequirements = requirements.filter(req => req.status === 'OVERDUE')

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground mt-4">Loading compliance dashboard...</p>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Compliance Data</h3>
          <p className="text-muted-foreground">Compliance metrics will appear here once you set up tax requirements.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tax Compliance Dashboard</h2>
          <p className="text-muted-foreground">Monitor tax compliance requirements and deadlines</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onGenerateReport}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button>
            <Bell className="h-4 w-4 mr-2" />
            Setup Alerts
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                <p className="text-2xl font-bold">{metrics.overallScore}%</p>
                <div className="flex items-center gap-1 text-xs mt-1">
                  {metrics.trendDirection === 'UP' ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">+{metrics.trendPercentage}%</span>
                    </>
                  ) : metrics.trendDirection === 'DOWN' ? (
                    <>
                      <TrendingDown className="h-3 w-3 text-red-600" />
                      <span className="text-red-600">-{metrics.trendPercentage}%</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">No change</span>
                  )}
                </div>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress value={metrics.overallScore} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue Items</p>
                <p className="text-2xl font-bold text-red-600">{metrics.overdueCount}</p>
                <p className="text-xs text-muted-foreground">Require immediate attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming Deadlines</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.upcomingDeadlines}</p>
                <p className="text-xs text-muted-foreground">Next 30 days</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliant</p>
                <p className="text-2xl font-bold text-green-600">{metrics.compliantCount}</p>
                <p className="text-xs text-muted-foreground">
                  {((metrics.compliantCount / metrics.totalRequirements) * 100).toFixed(1)}% of total
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {overdueRequirements.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {overdueRequirements.length} overdue compliance requirement{overdueRequirements.length !== 1 ? 's' : ''}.
            Please address these immediately to avoid penalties.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requirements">All Requirements</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Upcoming Deadlines
                </CardTitle>
                <CardDescription>Next {upcomingRequirements.length} items due</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingRequirements.map((requirement) => {
                    const daysUntil = getDaysUntilDue(requirement.dueDate)
                    return (
                      <div key={requirement.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(requirement.status)}>
                              {getStatusIcon(requirement.status)}
                              {requirement.status}
                            </Badge>
                            <span className={getPriorityColor(requirement.priority)}>
                              {requirement.priority}
                            </span>
                          </div>
                          <p className="font-medium mt-1">{requirement.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {requirement.jurisdiction} • Due {format(new Date(requirement.dueDate), 'MMM d, yyyy')}
                          </p>
                          <p className={cn('text-sm font-medium',
                            daysUntil <= 0 ? 'text-red-600' :
                            daysUntil <= 7 ? 'text-yellow-600' : 'text-green-600'
                          )}>
                            {daysUntil <= 0 ? `${Math.abs(daysUntil)} days overdue` :
                             daysUntil === 1 ? 'Due tomorrow' :
                             `Due in ${daysUntil} days`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => onViewRequirement?.(requirement)}>
                            View
                          </Button>
                          {requirement.status !== 'COMPLIANT' && (
                            <Button size="sm" onClick={() => onMarkComplete?.(requirement)}>
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {upcomingRequirements.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No upcoming deadlines</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Compliance Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Compliance Progress
                </CardTitle>
                <CardDescription>Status breakdown by requirement type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600">Compliant</span>
                      <span className="text-sm font-medium">{metrics.compliantCount}</span>
                    </div>
                    <Progress value={(metrics.compliantCount / metrics.totalRequirements) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-600">Pending</span>
                      <span className="text-sm font-medium">{metrics.pendingCount}</span>
                    </div>
                    <Progress value={(metrics.pendingCount / metrics.totalRequirements) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-yellow-600">At Risk</span>
                      <span className="text-sm font-medium">{metrics.atRiskCount}</span>
                    </div>
                    <Progress value={(metrics.atRiskCount / metrics.totalRequirements) * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-red-600">Overdue</span>
                      <span className="text-sm font-medium">{metrics.overdueCount}</span>
                    </div>
                    <Progress value={(metrics.overdueCount / metrics.totalRequirements) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Priority:</span>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value as any)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="ALL">All</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Status:</span>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as any)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="ALL">All</option>
                    <option value="COMPLIANT">Compliant</option>
                    <option value="PENDING">Pending</option>
                    <option value="AT_RISK">At Risk</option>
                    <option value="OVERDUE">Overdue</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements List */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Requirements</CardTitle>
              <CardDescription>
                Showing {filteredRequirements.length} of {requirements.length} requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRequirements.map((requirement) => {
                  const daysUntil = getDaysUntilDue(requirement.dueDate)
                  return (
                    <div key={requirement.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getStatusColor(requirement.status)}>
                              {getStatusIcon(requirement.status)}
                              {requirement.status}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(requirement.priority)}>
                              {requirement.priority}
                            </Badge>
                            <Badge variant="outline">
                              {requirement.requirementType}
                            </Badge>
                          </div>
                          <h4 className="font-medium">{requirement.description}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {requirement.jurisdiction} • {requirement.frequency}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span>Due: {format(new Date(requirement.dueDate), 'MMM d, yyyy')}</span>
                            {requirement.assignedTo && (
                              <span>Assigned to: {requirement.assignedTo}</span>
                            )}
                            {requirement.estimatedHours && (
                              <span>Est. {requirement.estimatedHours}h</span>
                            )}
                          </div>
                          {requirement.completionPercentage > 0 && requirement.completionPercentage < 100 && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Progress</span>
                                <span>{requirement.completionPercentage}%</span>
                              </div>
                              <Progress value={requirement.completionPercentage} className="mt-1" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => onViewRequirement?.(requirement)}>
                            View
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => onCreateReminder?.(requirement)}>
                            Remind
                          </Button>
                          {requirement.status !== 'COMPLIANT' && (
                            <Button size="sm" onClick={() => onMarkComplete?.(requirement)}>
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredRequirements.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    No requirements match the selected filters
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
              <p className="text-muted-foreground">Calendar integration for compliance deadlines coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}