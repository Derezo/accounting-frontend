import { useState } from 'react'
import {
  Plus,
  FolderOpen,
  Filter,
  Search,
  Calendar,
  Clock,
  DollarSign,
  User,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  MoreHorizontal,
  Edit,
  Archive,
  FileText,
  TrendingUp,
  Users,
  Target,
  Timer
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ProjectForm } from '@/components/forms/ProjectForm'
import { ProjectFilters } from '@/components/business/ProjectFilters'
import { ProjectKanbanBoard } from '@/components/business/ProjectKanbanBoard'
import { ProjectTimeTracker } from '@/components/business/ProjectTimeTracker'
import { ProjectDetailView } from '@/components/business/ProjectDetailView'
import {
  useProjects,
  useUpdateProjectStatus,
  useGenerateProjectInvoice
} from '@/hooks/useAPI'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Project, ProjectFilters as IProjectFilters } from '@/types/api'

export function ProjectsPage() {
  const [activeTab, setActiveTab] = useState('list')
  const [filters, setFilters] = useState<IProjectFilters>({})
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // API hooks
  const { data: projectsData, isLoading, error } = useProjects({
    ...filters,
    search: searchQuery || undefined,
    page: 1,
    limit: 50,
  })

  const updateProjectStatus = useUpdateProjectStatus()
  const generateInvoice = useGenerateProjectInvoice()

  // Action handlers
  const handleEdit = (project: Project) => {
    setSelectedProject(project)
    setShowEditDialog(true)
  }

  const handleViewDetail = (project: Project) => {
    setSelectedProject(project)
    setShowDetailDialog(true)
  }

  const handleStatusChange = async (project: Project, newStatus: string) => {
    await updateProjectStatus.mutateAsync({
      projectId: project.id,
      status: newStatus
    })
  }

  const handleGenerateInvoice = async (project: Project) => {
    await generateInvoice.mutateAsync({
      projectId: project.id,
      includeTimeEntries: true,
      includeExpenses: true
    })
  }

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNING': return 'secondary'
      case 'ACTIVE': return 'success'
      case 'ON_HOLD': return 'warning'
      case 'COMPLETED': return 'success'
      case 'CANCELLED': return 'destructive'
      case 'ARCHIVED': return 'secondary'
      default: return 'outline'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'destructive'
      case 'MEDIUM': return 'warning'
      case 'LOW': return 'secondary'
      default: return 'outline'
    }
  }

  const getProgressPercentage = (project: Project) => {
    if (!project.tasks || project.tasks.length === 0) return 0
    const completedTasks = project.tasks.filter(task => task.status === 'COMPLETED').length
    return Math.round((completedTasks / project.tasks.length) * 100)
  }

  const getBudgetUsage = (project: Project) => {
    if (!project.budget) return 0
    const spent = (project.totalHours || 0) * (project.hourlyRate || 0) + (project.expenses || 0)
    return Math.round((spent / project.budget) * 100)
  }

  const canPerformAction = (project: Project, action: string) => {
    switch (action) {
      case 'start':
        return project.status === 'PLANNING'
      case 'pause':
        return project.status === 'ACTIVE'
      case 'resume':
        return project.status === 'ON_HOLD'
      case 'complete':
        return ['ACTIVE', 'ON_HOLD'].includes(project.status)
      case 'archive':
        return ['COMPLETED', 'CANCELLED'].includes(project.status)
      case 'invoice':
        return ['ACTIVE', 'COMPLETED'].includes(project.status) && (project.totalHours || 0) > 0
      case 'edit':
        return !['ARCHIVED'].includes(project.status)
      default:
        return false
    }
  }

  // Summary calculations
  const projectSummary = projectsData?.data.reduce((acc, project) => {
    acc.total += 1
    if (project.status === 'ACTIVE') acc.active += 1
    if (project.status === 'COMPLETED') acc.completed += 1
    if (project.status === 'ON_HOLD') acc.onHold += 1
    acc.totalBudget += project.budget || 0
    acc.totalSpent += (project.totalHours || 0) * (project.hourlyRate || 0) + (project.expenses || 0)
    acc.totalHours += project.totalHours || 0
    return acc
  }, {
    total: 0,
    active: 0,
    completed: 0,
    onHold: 0,
    totalBudget: 0,
    totalSpent: 0,
    totalHours: 0
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage client projects, track time, and monitor progress
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Set up a new project with timeline, budget, and team assignments.
              </DialogDescription>
            </DialogHeader>
            <ProjectForm
              onSuccess={() => setShowCreateDialog(false)}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Project Summary Cards */}
      {projectSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectSummary.total}</div>
              <p className="text-xs text-muted-foreground">
                {projectSummary.active} active, {projectSummary.completed} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(projectSummary.totalBudget)}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(projectSummary.totalSpent)} spent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectSummary.totalHours.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Across all projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projectsData?.data.length ?
                  Math.round(projectsData.data.reduce((acc, p) => acc + getProgressPercentage(p), 0) / projectsData.data.length)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Completion rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
          <CardDescription>
            Find projects by name, client, status, or date range
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by project name, client, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <ProjectFilters
            filters={filters}
            onFiltersChange={setFilters}
          />
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">
            <FileText className="h-4 w-4 mr-2" />
            List View
          </TabsTrigger>
          <TabsTrigger value="kanban">
            <Target className="h-4 w-4 mr-2" />
            Kanban Board
          </TabsTrigger>
          <TabsTrigger value="time">
            <Timer className="h-4 w-4 mr-2" />
            Time Tracking
          </TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>
                Project List
                {projectsData && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({projectsData.pagination.total} total)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Loading projects...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <p className="text-sm text-red-600">Failed to load projects</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Please try refreshing the page
                    </p>
                  </div>
                </div>
              ) : projectsData?.data.length === 0 ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No projects found</p>
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={() => setShowCreateDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create your first project
                    </Button>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectsData?.data.map((project) => (
                      <TableRow
                        key={project.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewDetail(project)}
                      >
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{project.name}</p>
                            {project.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {project.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2">
                              <Badge variant={getPriorityColor(project.priority) as any} className="text-xs">
                                {project.priority}
                              </Badge>
                              {project.type && (
                                <Badge variant="outline" className="text-xs">
                                  {project.type}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{project.customerName}</p>
                            {project.contactInfo?.email && (
                              <p className="text-xs text-muted-foreground">
                                {project.contactInfo.email}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(project.status) as any}>
                            {project.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>{getProgressPercentage(project)}%</span>
                              <span className="text-muted-foreground">
                                {project.tasks?.filter(t => t.status === 'COMPLETED').length || 0}/
                                {project.tasks?.length || 0}
                              </span>
                            </div>
                            <Progress value={getProgressPercentage(project)} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{formatCurrency(project.budget || 0)}</p>
                            {project.budget && (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>Used: {getBudgetUsage(project)}%</span>
                                </div>
                                <Progress value={getBudgetUsage(project)} className="h-1" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{project.totalHours?.toFixed(1) || '0.0'}h</p>
                            {project.estimatedHours && (
                              <p className="text-xs text-muted-foreground">
                                / {project.estimatedHours}h est.
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {project.deadline ? (
                            <div className="text-sm">
                              <p className="font-medium">{formatDate(project.deadline)}</p>
                              {new Date(project.deadline) < new Date() && project.status !== 'COMPLETED' && (
                                <p className="text-xs text-red-600 flex items-center">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Overdue
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">No deadline</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex -space-x-2">
                            {project.teamMembers?.slice(0, 3).map((member, index) => (
                              <div
                                key={member.id || index}
                                className="w-8 h-8 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs font-medium"
                                title={member.name}
                              >
                                {member.name?.charAt(0).toUpperCase()}
                              </div>
                            ))}
                            {(project.teamMembers?.length || 0) > 3 && (
                              <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                                +{(project.teamMembers?.length || 0) - 3}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {canPerformAction(project, 'edit') && (
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation()
                                  handleEdit(project)
                                }}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              )}

                              {canPerformAction(project, 'start') && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleStatusChange(project, 'ACTIVE')
                                  }}
                                  disabled={updateProjectStatus.isPending}
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  Start Project
                                </DropdownMenuItem>
                              )}

                              {canPerformAction(project, 'pause') && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleStatusChange(project, 'ON_HOLD')
                                  }}
                                  disabled={updateProjectStatus.isPending}
                                >
                                  <Pause className="h-4 w-4 mr-2" />
                                  Put on Hold
                                </DropdownMenuItem>
                              )}

                              {canPerformAction(project, 'resume') && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleStatusChange(project, 'ACTIVE')
                                  }}
                                  disabled={updateProjectStatus.isPending}
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  Resume
                                </DropdownMenuItem>
                              )}

                              {canPerformAction(project, 'complete') && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleStatusChange(project, 'COMPLETED')
                                  }}
                                  disabled={updateProjectStatus.isPending}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark Complete
                                </DropdownMenuItem>
                              )}

                              {canPerformAction(project, 'invoice') && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleGenerateInvoice(project)
                                    }}
                                    disabled={generateInvoice.isPending}
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Generate Invoice
                                  </DropdownMenuItem>
                                </>
                              )}

                              {canPerformAction(project, 'archive') && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleStatusChange(project, 'ARCHIVED')
                                    }}
                                    disabled={updateProjectStatus.isPending}
                                    className="text-red-600"
                                  >
                                    <Archive className="h-4 w-4 mr-2" />
                                    Archive
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Kanban Board View */}
        <TabsContent value="kanban">
          <ProjectKanbanBoard
            projects={projectsData?.data || []}
            isLoading={isLoading}
            onProjectClick={handleViewDetail}
            onStatusChange={handleStatusChange}
            onCreateProject={() => setShowCreateDialog(true)}
          />
        </TabsContent>

        {/* Time Tracking View */}
        <TabsContent value="time">
          <ProjectTimeTracker
            projects={projectsData?.data || []}
            isLoading={isLoading}
            onProjectClick={handleViewDetail}
          />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      {selectedProject && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update project details, timeline, and team assignments.
              </DialogDescription>
            </DialogHeader>
            <ProjectForm
              project={selectedProject}
              onSuccess={() => {
                setShowEditDialog(false)
                setSelectedProject(null)
              }}
              onCancel={() => {
                setShowEditDialog(false)
                setSelectedProject(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Detail View Dialog */}
      {selectedProject && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedProject.name}</DialogTitle>
              <DialogDescription>
                Complete project overview with tasks, timeline, and team details.
              </DialogDescription>
            </DialogHeader>
            <ProjectDetailView
              project={selectedProject}
              onEdit={() => {
                setShowDetailDialog(false)
                setShowEditDialog(true)
              }}
              onClose={() => {
                setShowDetailDialog(false)
                setSelectedProject(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}