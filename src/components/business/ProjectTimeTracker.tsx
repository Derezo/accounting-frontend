import { useState } from 'react'
import {
  Play,
  Pause,
  Square,
  Clock,
  Calendar,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Timer,
  DollarSign,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLogProjectTime } from '@/hooks/useAPI'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Project } from '@/types/api'

interface ProjectTimeTrackerProps {
  projects: Project[]
  isLoading: boolean
  onProjectClick: (project: Project) => void
}

interface TimeEntry {
  id: string
  projectId: string
  projectName: string
  taskId?: string
  taskName?: string
  description: string
  hours: number
  date: string
  rate: number
  billable: boolean
  status: 'LOGGED' | 'APPROVED' | 'BILLED'
}

interface ActiveTimer {
  projectId: string
  projectName: string
  taskId?: string
  taskName?: string
  description: string
  startTime: Date
  elapsedSeconds: number
}

export function ProjectTimeTracker({
  projects,
  isLoading,
  onProjectClick
}: ProjectTimeTrackerProps) {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showLogTimeDialog, setShowLogTimeDialog] = useState(false)
  const [manualTimeEntry, setManualTimeEntry] = useState({
    projectId: '',
    taskId: '',
    description: '',
    hours: 0,
    date: new Date().toISOString().split('T')[0],
    billable: true
  })

  const logProjectTime = useLogProjectTime()

  // Mock time entries - in real app, this would come from API
  const timeEntries: TimeEntry[] = [
    {
      id: '1',
      projectId: 'proj1',
      projectName: 'Website Redesign',
      taskId: 'task1',
      taskName: 'Frontend Development',
      description: 'Implemented responsive navigation',
      hours: 2.5,
      date: '2024-01-15',
      rate: 75,
      billable: true,
      status: 'LOGGED'
    },
    // Add more mock entries...
  ]

  // Timer functions
  const startTimer = (project: Project, description: string = '') => {
    if (activeTimer) {
      stopTimer()
    }

    setActiveTimer({
      projectId: project.id,
      projectName: project.name,
      description,
      startTime: new Date(),
      elapsedSeconds: 0
    })

    // Start interval to update elapsed time
    const interval = setInterval(() => {
      setActiveTimer(prev => {
        if (!prev) {
          clearInterval(interval)
          return null
        }
        return {
          ...prev,
          elapsedSeconds: Math.floor((Date.now() - prev.startTime.getTime()) / 1000)
        }
      })
    }, 1000)
  }

  const pauseTimer = () => {
    if (activeTimer) {
      // Save current elapsed time and clear interval
      setActiveTimer(prev => prev ? { ...prev, startTime: new Date() } : null)
    }
  }

  const stopTimer = async () => {
    if (!activeTimer) return

    const hours = activeTimer.elapsedSeconds / 3600

    if (hours > 0) {
      try {
        await logProjectTime.mutateAsync({
          projectId: activeTimer.projectId,
          data: {
            hours: parseFloat(hours.toFixed(2)),
            description: activeTimer.description || 'Time tracking session',
            date: new Date().toISOString().split('T')[0],
            taskId: activeTimer.taskId
          }
        })
      } catch (error) {
        console.error('Failed to log time:', error)
      }
    }

    setActiveTimer(null)
  }

  const logManualTime = async () => {
    if (!manualTimeEntry.projectId || !manualTimeEntry.hours) return

    try {
      await logProjectTime.mutateAsync({
        projectId: manualTimeEntry.projectId,
        data: {
          hours: manualTimeEntry.hours,
          description: manualTimeEntry.description,
          date: manualTimeEntry.date,
          taskId: manualTimeEntry.taskId || undefined
        }
      })

      setManualTimeEntry({
        projectId: '',
        taskId: '',
        description: '',
        hours: 0,
        date: new Date().toISOString().split('T')[0],
        billable: true
      })
      setShowLogTimeDialog(false)
    } catch (error) {
      console.error('Failed to log manual time:', error)
    }
  }

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProjectTimeStats = (project: Project) => {
    const entries = timeEntries.filter(entry => entry.projectId === project.id)
    const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0)
    const billableHours = entries.filter(entry => entry.billable).reduce((sum, entry) => sum + entry.hours, 0)
    const totalValue = entries.reduce((sum, entry) => sum + (entry.hours * entry.rate), 0)

    return {
      totalHours,
      billableHours,
      totalValue,
      entriesCount: entries.length
    }
  }

  const getTodayEntries = () => {
    const today = new Date().toISOString().split('T')[0]
    return timeEntries.filter(entry => entry.date === today)
  }

  const getWeekTotal = () => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoStr = weekAgo.toISOString().split('T')[0]
    const today = new Date().toISOString().split('T')[0]

    return timeEntries
      .filter(entry => entry.date >= weekAgoStr && entry.date <= today)
      .reduce((sum, entry) => sum + entry.hours, 0)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Loading time tracker...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Active Timer */}
      {activeTimer && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary" />
              Active Timer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">{activeTimer.projectName}</p>
                <p className="text-sm text-muted-foreground">
                  {activeTimer.description || 'No description'}
                </p>
              </div>
              <div className="text-right space-y-2">
                <div className="text-2xl font-mono font-bold text-primary">
                  {formatElapsedTime(activeTimer.elapsedSeconds)}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={pauseTimer}>
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </Button>
                  <Button size="sm" variant="destructive" onClick={stopTimer}>
                    <Square className="h-4 w-4 mr-1" />
                    Square & Log
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getTodayEntries().reduce((sum, entry) => sum + entry.hours, 0).toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">
              {getTodayEntries().length} entries logged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getWeekTotal().toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                timeEntries
                  .filter(entry => {
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return entry.date >= weekAgo.toISOString().split('T')[0]
                  })
                  .reduce((sum, entry) => sum + (entry.hours * entry.rate), 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Billable time value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Dialog open={showLogTimeDialog} onOpenChange={setShowLogTimeDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Time Manually
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Time Entry</DialogTitle>
              <DialogDescription>
                Manually log time spent on a project or task.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manual-project">Project *</Label>
                <Select
                  value={manualTimeEntry.projectId}
                  onValueChange={(value) => setManualTimeEntry(prev => ({ ...prev, projectId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manual-hours">Hours *</Label>
                  <Input
                    id="manual-hours"
                    type="number"
                    step="0.25"
                    min="0"
                    value={manualTimeEntry.hours}
                    onChange={(e) => setManualTimeEntry(prev => ({ ...prev, hours: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual-date">Date *</Label>
                  <Input
                    id="manual-date"
                    type="date"
                    value={manualTimeEntry.date}
                    onChange={(e) => setManualTimeEntry(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-description">Description</Label>
                <Textarea
                  id="manual-description"
                  value={manualTimeEntry.description}
                  onChange={(e) => setManualTimeEntry(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What did you work on?"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowLogTimeDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={logManualTime} disabled={!manualTimeEntry.projectId || !manualTimeEntry.hours}>
                  Log Time
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects with Time Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Project Time Overview</CardTitle>
          <CardDescription>
            Quick start timers and view time statistics for active projects
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Billable Hours</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.filter(p => ['PLANNING', 'ACTIVE', 'ON_HOLD'].includes(p.status)).map((project) => {
                const stats = getProjectTimeStats(project)
                const progressPercentage = project.estimatedHours
                  ? Math.min((stats.totalHours / project.estimatedHours) * 100, 100)
                  : 0

                return (
                  <TableRow
                    key={project.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onProjectClick(project)}
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">{project.customerName}</p>
                        <Badge variant={project.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs">
                          {project.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{stats.totalHours.toFixed(1)}h</p>
                        {project.estimatedHours && (
                          <p className="text-xs text-muted-foreground">
                            / {project.estimatedHours}h est.
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{stats.billableHours.toFixed(1)}h</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{formatCurrency(stats.totalValue)}</p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>{progressPercentage.toFixed(0)}%</span>
                        </div>
                        {project.estimatedHours && (
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-primary h-1 rounded-full"
                              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {!activeTimer && project.status === 'ACTIVE' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              startTimer(project)
                            }}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                setManualTimeEntry(prev => ({ ...prev, projectId: project.id }))
                                setShowLogTimeDialog(true)
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Log Time
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onProjectClick(project)}>
                              <FileText className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Time Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
          <CardDescription>
            Latest time entries across all projects
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeEntries.slice(0, 10).map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <p className="text-sm">{formatDate(entry.date)}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{entry.projectName}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{entry.taskName || '-'}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm max-w-[200px] truncate">{entry.description}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{entry.hours}h</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{formatCurrency(entry.hours * entry.rate)}</p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        entry.status === 'BILLED' ? 'default' :
                        entry.status === 'APPROVED' ? 'secondary' : 'outline'
                      }
                      className="text-xs"
                    >
                      {entry.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}