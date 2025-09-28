import { useState } from 'react'
import {
  Calendar,
  Clock,
  DollarSign,
  User,
  FileText,
  CheckCircle,
  Circle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  TrendingUp,
  Target,
  Users,
  Settings,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { Separator } from '@/components/ui/separator'
import {
  useProjectTasks,
  useProjectTimeEntries,
  useProjectTimeline,
  useCreateProjectTask,
  useUpdateProjectTask,
  useLogProjectTime,
  useAddProjectNote
} from '@/hooks/useAPI'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Project } from '@/types/api'

interface ProjectDetailViewProps {
  project: Project
  onEdit: () => void
  onClose: () => void
}

export function ProjectDetailView({ project, onEdit, onClose }: ProjectDetailViewProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newNote, setNewNote] = useState('')
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [showTimeDialog, setShowTimeDialog] = useState(false)
  const [timeEntry, setTimeEntry] = useState({
    hours: 0,
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  // API hooks
  const { data: tasks } = useProjectTasks(project.id)
  const { data: timeEntries } = useProjectTimeEntries(project.id)
  const { data: timeline } = useProjectTimeline(project.id)

  const createTask = useCreateProjectTask()
  const updateTask = useUpdateProjectTask()
  const logTime = useLogProjectTime()
  const addNote = useAddProjectNote()

  // Calculate progress
  const getProgressPercentage = () => {
    if (!tasks || tasks.length === 0) return 0
    const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length
    return Math.round((completedTasks / tasks.length) * 100)
  }

  const getBudgetUsage = () => {
    if (!project.budget) return 0
    const spent = (project.totalHours || 0) * (project.hourlyRate || 0) + (project.expenses || 0)
    return Math.round((spent / project.budget) * 100)
  }

  const getTotalTimeValue = () => {
    return (project.totalHours || 0) * (project.hourlyRate || 0)
  }

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

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return CheckCircle
      case 'IN_PROGRESS': return Circle
      case 'BLOCKED': return AlertCircle
      default: return Circle
    }
  }

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return

    try {
      await createTask.mutateAsync({
        projectId: project.id,
        data: {
          title: newTaskTitle,
          priority: 'MEDIUM'
        }
      })
      setNewTaskTitle('')
      setShowTaskDialog(false)
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'TODO' : 'COMPLETED'

    try {
      await updateTask.mutateAsync({
        projectId: project.id,
        taskId,
        data: { status: newStatus }
      })
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleLogTime = async () => {
    if (!timeEntry.hours || !timeEntry.description) return

    try {
      await logTime.mutateAsync({
        projectId: project.id,
        data: timeEntry
      })
      setTimeEntry({
        hours: 0,
        description: '',
        date: new Date().toISOString().split('T')[0]
      })
      setShowTimeDialog(false)
    } catch (error) {
      console.error('Failed to log time:', error)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    try {
      await addNote.mutateAsync({
        projectId: project.id,
        note: newNote
      })
      setNewNote('')
    } catch (error) {
      console.error('Failed to add note:', error)
    }
  }

  const isOverdue = project.deadline &&
    new Date(project.deadline) < new Date() &&
    !['COMPLETED', 'CANCELLED', 'ARCHIVED'].includes(project.status)

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{project.name}</h2>
            <Badge variant={getStatusColor(project.status) as any}>
              {project.status.replace('_', ' ')}
            </Badge>
            <Badge variant={getPriorityColor(project.priority) as any}>
              {project.priority} PRIORITY
            </Badge>
          </div>
          <p className="text-muted-foreground">{project.description}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {project.customerName}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Started {formatDate(project.startDate)}
            </div>
            {project.deadline && (
              <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
                <AlertCircle className="h-4 w-4" />
                Due {formatDate(project.deadline)}
                {isOverdue && ' (Overdue)'}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Project
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getProgressPercentage()}%</div>
            <Progress value={getProgressPercentage()} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {tasks?.filter(t => t.status === 'COMPLETED').length || 0} / {tasks?.length || 0} tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Logged</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.totalHours?.toFixed(1) || '0.0'}h</div>
            {project.estimatedHours && (
              <>
                <Progress value={(project.totalHours || 0) / project.estimatedHours * 100} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  of {project.estimatedHours}h estimated
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getTotalTimeValue())}</div>
            {project.budget && (
              <>
                <Progress value={getBudgetUsage()} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  of {formatCurrency(project.budget)} budget
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.teamMembers?.length || 0}</div>
            <div className="flex -space-x-1 mt-2">
              {project.teamMembers?.slice(0, 4).map((member, index) => (
                <div
                  key={member.id || index}
                  className="w-6 h-6 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs font-medium"
                  title={member.name}
                >
                  {member.name?.charAt(0).toUpperCase()}
                </div>
              ))}
              {(project.teamMembers?.length || 0) > 4 && (
                <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                  +{(project.teamMembers?.length || 0) - 4}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium">Type</label>
                    <p className="text-muted-foreground">{project.type}</p>
                  </div>
                  <div>
                    <label className="font-medium">Billing Type</label>
                    <p className="text-muted-foreground">{project.billingType || 'Hourly'}</p>
                  </div>
                  <div>
                    <label className="font-medium">Hourly Rate</label>
                    <p className="text-muted-foreground">{formatCurrency(project.hourlyRate || 0)}</p>
                  </div>
                  <div>
                    <label className="font-medium">Manager</label>
                    <p className="text-muted-foreground">{project.managerId || 'Unassigned'}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="font-medium">Objectives</label>
                  <p className="text-muted-foreground text-sm mt-1">
                    {project.objectives || 'No objectives defined'}
                  </p>
                </div>

                <div>
                  <label className="font-medium">Deliverables</label>
                  <p className="text-muted-foreground text-sm mt-1">
                    {project.deliverables || 'No deliverables defined'}
                  </p>
                </div>

                <div>
                  <label className="font-medium">Requirements</label>
                  <p className="text-muted-foreground text-sm mt-1">
                    {project.requirements || 'No requirements specified'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline?.slice(0, 5).map((event, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div className="flex-1">
                        <p className="text-sm">{event.description}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(event.timestamp)}</p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-4">
            <Dialog open={showTimeDialog} onOpenChange={setShowTimeDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Clock className="h-4 w-4 mr-2" />
                  Log Time
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Time Entry</DialogTitle>
                  <DialogDescription>
                    Record time spent on this project.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hours</label>
                      <Input
                        type="number"
                        step="0.25"
                        min="0"
                        value={timeEntry.hours}
                        onChange={(e) => setTimeEntry(prev => ({ ...prev, hours: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date</label>
                      <Input
                        type="date"
                        value={timeEntry.date}
                        onChange={(e) => setTimeEntry(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={timeEntry.description}
                      onChange={(e) => setTimeEntry(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="What did you work on?"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowTimeDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleLogTime} disabled={!timeEntry.hours || !timeEntry.description}>
                      Log Time
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>
                    Add a new task to this project.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Task Title</label>
                    <Input
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Enter task title"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTask} disabled={!newTaskTitle.trim()}>
                      Create Task
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Project Tasks</CardTitle>
              <CardDescription>
                Manage and track project tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tasks && tasks.length > 0 ? (
                <div className="space-y-2">
                  {tasks.map((task) => {
                    const StatusIcon = getTaskStatusIcon(task.status)
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <button
                          onClick={() => handleToggleTaskStatus(task.id, task.status)}
                          className="flex-shrink-0"
                        >
                          <StatusIcon
                            className={`h-5 w-5 ${
                              task.status === 'COMPLETED' ? 'text-green-600' : 'text-muted-foreground'
                            }`}
                          />
                        </button>
                        <div className="flex-1">
                          <p className={`font-medium ${task.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                          )}
                        </div>
                        {task.assignee && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            {task.assignee}
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatDate(task.dueDate)}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No tasks created yet</p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => setShowTaskDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Tracking Tab */}
        <TabsContent value="time">
          <Card>
            <CardHeader>
              <CardTitle>Time Entries</CardTitle>
              <CardDescription>
                View and manage time logged on this project
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {timeEntries && timeEntries.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{formatDate(entry.date)}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>{entry.hours}h</TableCell>
                        <TableCell>{formatCurrency(entry.hours * (project.hourlyRate || 0))}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Logged</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No time entries yet</p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => setShowTimeDialog(true)}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Log First Entry
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
              <CardDescription>
                Chronological view of project events and milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timeline && timeline.length > 0 ? (
                <div className="space-y-4">
                  {timeline.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        {index < timeline.length - 1 && <div className="w-px h-8 bg-border mt-2" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(event.timestamp)}</p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No timeline events yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Project Notes</CardTitle>
              <CardDescription>
                Add and manage project notes and comments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  rows={3}
                />
                <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>

              <Separator />

              {project.notes ? (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm">{project.notes}</p>
                    <p className="text-xs text-muted-foreground mt-2">Added on project creation</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No notes yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}