import { useState } from 'react'
import {
  Plus,
  Calendar,
  DollarSign,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Pause,
  Play,
  Archive,
  MoreHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn, formatDate, formatCurrency } from '@/lib/utils'
import { Project, ProjectStatus } from '@/types/api'

interface ProjectKanbanBoardProps {
  projects: Project[]
  isLoading: boolean
  onProjectClick: (project: Project) => void
  onStatusChange: (project: Project, newStatus: string) => void
  onCreateProject: () => void
}

interface KanbanColumn {
  id: ProjectStatus
  title: string
  color: string
  projects: Project[]
}

export function ProjectKanbanBoard({
  projects,
  isLoading,
  onProjectClick,
  onStatusChange,
  onCreateProject
}: ProjectKanbanBoardProps) {
  const [draggedProject, setDraggedProject] = useState<Project | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<ProjectStatus | null>(null)

  // Organize projects by status
  const columns: KanbanColumn[] = [
    {
      id: 'PLANNING',
      title: 'Planning',
      color: 'bg-blue-50 border-blue-200',
      projects: projects.filter(p => p.status === 'PLANNING')
    },
    {
      id: 'ACTIVE',
      title: 'Active',
      color: 'bg-green-50 border-green-200',
      projects: projects.filter(p => p.status === 'ACTIVE')
    },
    {
      id: 'ON_HOLD',
      title: 'On Hold',
      color: 'bg-yellow-50 border-yellow-200',
      projects: projects.filter(p => p.status === 'ON_HOLD')
    },
    {
      id: 'COMPLETED',
      title: 'Completed',
      color: 'bg-gray-50 border-gray-200',
      projects: projects.filter(p => p.status === 'COMPLETED')
    }
  ]

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'border-l-red-500 bg-red-50'
      case 'MEDIUM': return 'border-l-yellow-500 bg-yellow-50'
      case 'LOW': return 'border-l-blue-500 bg-blue-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  const isOverdue = (project: Project) => {
    return project.deadline &&
           new Date(project.deadline) < new Date() &&
           !['COMPLETED', 'CANCELLED', 'ARCHIVED'].includes(project.status)
  }

  const canDropInColumn = (columnId: ProjectStatus) => {
    if (!draggedProject) return false

    const validTransitions: Record<ProjectStatus, ProjectStatus[]> = {
      'PLANNING': ['ACTIVE', 'CANCELLED'],
      'ACTIVE': ['ON_HOLD', 'COMPLETED', 'CANCELLED'],
      'ON_HOLD': ['ACTIVE', 'COMPLETED', 'CANCELLED'],
      'COMPLETED': ['ARCHIVED'],
      'CANCELLED': ['ARCHIVED'],
      'ARCHIVED': []
    }

    return validTransitions[draggedProject.status as ProjectStatus]?.includes(columnId) || false
  }

  const handleDragStart = (e: React.DragEvent, project: Project) => {
    setDraggedProject(project)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, columnId: ProjectStatus) => {
    e.preventDefault()

    if (canDropInColumn(columnId)) {
      e.dataTransfer.dropEffect = 'move'
      setDragOverColumn(columnId)
    } else {
      e.dataTransfer.dropEffect = 'none'
    }
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, columnId: ProjectStatus) => {
    e.preventDefault()
    setDragOverColumn(null)

    if (draggedProject && canDropInColumn(columnId)) {
      onStatusChange(draggedProject, columnId)
    }

    setDraggedProject(null)
  }

  const handleDragEnd = () => {
    setDraggedProject(null)
    setDragOverColumn(null)
  }

  const getQuickActions = (project: Project) => {
    const actions = []

    switch (project.status) {
      case 'PLANNING':
        actions.push({
          icon: Play,
          label: 'Start Project',
          action: () => onStatusChange(project, 'ACTIVE'),
          color: 'text-green-600'
        })
        break
      case 'ACTIVE':
        actions.push({
          icon: Pause,
          label: 'Put on Hold',
          action: () => onStatusChange(project, 'ON_HOLD'),
          color: 'text-yellow-600'
        })
        actions.push({
          icon: CheckCircle,
          label: 'Mark Complete',
          action: () => onStatusChange(project, 'COMPLETED'),
          color: 'text-green-600'
        })
        break
      case 'ON_HOLD':
        actions.push({
          icon: Play,
          label: 'Resume',
          action: () => onStatusChange(project, 'ACTIVE'),
          color: 'text-green-600'
        })
        break
      case 'COMPLETED':
        actions.push({
          icon: Archive,
          label: 'Archive',
          action: () => onStatusChange(project, 'ARCHIVED'),
          color: 'text-gray-600'
        })
        break
    }

    return actions
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Loading kanban board...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Board Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Project Kanban Board</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{projects.length} total projects</span>
            <span>•</span>
            <span>{projects.filter(p => p.status === 'ACTIVE').length} active</span>
          </div>
        </div>
        <Button onClick={onCreateProject}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-96">
        {columns.map((column) => (
          <div
            key={column.id}
            className={cn(
              "space-y-3 p-4 rounded-lg border-2 border-dashed transition-colors",
              column.color,
              dragOverColumn === column.id && canDropInColumn(column.id)
                ? "border-primary bg-primary/5"
                : "border-gray-200"
            )}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">{column.title}</h4>
              <Badge variant="secondary" className="text-xs">
                {column.projects.length}
              </Badge>
            </div>

            {/* Project Cards */}
            <div className="space-y-3">
              {column.projects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-sm">No projects in {column.title.toLowerCase()}</div>
                  {column.id === 'PLANNING' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onCreateProject}
                      className="mt-2"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Project
                    </Button>
                  )}
                </div>
              ) : (
                column.projects.map((project) => (
                  <Card
                    key={project.id}
                    className={cn(
                      "cursor-pointer hover:shadow-md transition-shadow border-l-4",
                      getPriorityColor(project.priority),
                      draggedProject?.id === project.id && "opacity-50"
                    )}
                    draggable
                    onDragStart={(e) => handleDragStart(e, project)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onProjectClick(project)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-medium truncate">
                            {project.name}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {project.description || 'No description'}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {getQuickActions(project).map((action, index) => (
                              <DropdownMenuItem
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  action.action()
                                }}
                                className={action.color}
                              >
                                <action.icon className="h-4 w-4 mr-2" />
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 space-y-3">
                      {/* Customer */}
                      <div className="flex items-center text-xs text-muted-foreground">
                        <User className="h-3 w-3 mr-1" />
                        <span className="truncate">{project.customerName}</span>
                      </div>

                      {/* Project Type & Priority */}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {project.type}
                        </Badge>
                        <Badge
                          variant={project.priority === 'HIGH' ? 'destructive' : project.priority === 'MEDIUM' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {project.priority}
                        </Badge>
                      </div>

                      {/* Progress */}
                      {project.tasks && project.tasks.length > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>Progress</span>
                            <span>{getProgressPercentage(project)}%</span>
                          </div>
                          <Progress value={getProgressPercentage(project)} className="h-1" />
                          <div className="text-xs text-muted-foreground">
                            {project.tasks.filter(t => t.status === 'COMPLETED').length} / {project.tasks.length} tasks
                          </div>
                        </div>
                      )}

                      {/* Budget */}
                      {project.budget && (
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center text-muted-foreground">
                            <DollarSign className="h-3 w-3 mr-1" />
                            <span>Budget</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(project.budget)}</div>
                            {getBudgetUsage(project) > 0 && (
                              <div className={cn(
                                "text-xs",
                                getBudgetUsage(project) > 90 ? "text-red-600" : "text-muted-foreground"
                              )}>
                                {getBudgetUsage(project)}% used
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Hours */}
                      {(project.totalHours || project.estimatedHours) && (
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>Hours</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {project.totalHours?.toFixed(1) || '0.0'}h
                            </div>
                            {project.estimatedHours && (
                              <div className="text-xs text-muted-foreground">
                                / {project.estimatedHours}h est.
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Deadline */}
                      {project.deadline && (
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>Deadline</span>
                          </div>
                          <div className={cn(
                            "text-right font-medium",
                            isOverdue(project) ? "text-red-600" : "text-muted-foreground"
                          )}>
                            {formatDate(project.deadline)}
                            {isOverdue(project) && (
                              <div className="flex items-center text-red-600 text-xs">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Overdue
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Team Members */}
                      {project.teamMembers && project.teamMembers.length > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Team</span>
                          <div className="flex -space-x-1">
                            {project.teamMembers.slice(0, 3).map((member, index) => (
                              <div
                                key={member.id || index}
                                className="w-6 h-6 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs font-medium"
                                title={member.name}
                              >
                                {member.name?.charAt(0).toUpperCase()}
                              </div>
                            ))}
                            {project.teamMembers.length > 3 && (
                              <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                                +{project.teamMembers.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Drop Zone Indicator */}
            {draggedProject && canDropInColumn(column.id) && dragOverColumn === column.id && (
              <div className="border-2 border-dashed border-primary bg-primary/5 rounded-lg p-4 text-center text-sm text-primary">
                Drop here to move to {column.title}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Kanban Board Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="font-medium mb-2">Priority Indicators:</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-l-2 border-red-500 bg-red-50"></div>
                  <span>High Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-l-2 border-yellow-500 bg-yellow-50"></div>
                  <span>Medium Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-l-2 border-blue-500 bg-blue-50"></div>
                  <span>Low Priority</span>
                </div>
              </div>
            </div>

            <div>
              <div className="font-medium mb-2">Actions:</div>
              <div className="space-y-1">
                <div>• Drag cards between columns to change status</div>
                <div>• Click cards to view details</div>
                <div>• Use dropdown menu for quick actions</div>
                <div>• Red deadline indicates overdue projects</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}