import { useState } from 'react'
import {
  Plus,
  Calendar,
  Filter,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  MoreHorizontal,
  Edit,
  Check,
  X,
  Play,
  Pause
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { AppointmentForm } from '@/components/forms/AppointmentForm'
import { AppointmentFilters } from '@/components/business/AppointmentFilters'
import { AppointmentCalendarView } from '@/components/business/AppointmentCalendarView'
import {
  useAppointments,
  useAppointmentCalendar,
  useConfirmAppointment,
  useCancelAppointment,
  useCompleteAppointment,
  useUpdateAppointment
} from '@/hooks/useAPI'
import { formatDate, formatTime } from '@/lib/utils'
import { Appointment, AppointmentFilters as IAppointmentFilters } from '@/types/api'

export function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState('list')
  const [filters, setFilters] = useState<IAppointmentFilters>({})
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Date range for calendar view (current week by default)
  const [calendarStartDate, setCalendarStartDate] = useState(() => {
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    return startOfWeek.toISOString().split('T')[0]
  })

  const [calendarEndDate, setCalendarEndDate] = useState(() => {
    const now = new Date()
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6))
    return endOfWeek.toISOString().split('T')[0]
  })

  // API hooks
  const { data: appointmentsData, isLoading, error } = useAppointments({
    ...filters,
    search: searchQuery || undefined,
    page: 1,
    limit: 50,
  })

  const { data: calendarData, isLoading: calendarLoading } = useAppointmentCalendar(
    calendarStartDate,
    calendarEndDate
  )

  const confirmAppointment = useConfirmAppointment()
  const cancelAppointment = useCancelAppointment()
  const completeAppointment = useCompleteAppointment()
  const updateAppointment = useUpdateAppointment()

  // Action handlers
  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowEditDialog(true)
  }

  const handleConfirm = async (appointment: Appointment) => {
    await confirmAppointment.mutateAsync(appointment.id)
  }

  const handleCancel = async (appointment: Appointment) => {
    const reason = window.prompt('Please provide a reason for cancellation (optional):')
    await cancelAppointment.mutateAsync({
      appointmentId: appointment.id,
      reason: reason || undefined
    })
  }

  const handleComplete = async (appointment: Appointment) => {
    const notes = window.prompt('Add any completion notes (optional):')
    await completeAppointment.mutateAsync({
      appointmentId: appointment.id,
      notes: notes || undefined
    })
  }

  const handleStartAppointment = async (appointment: Appointment) => {
    await updateAppointment.mutateAsync({
      appointmentId: appointment.id,
      data: { status: 'IN_PROGRESS' }
    })
  }

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'secondary'
      case 'CONFIRMED': return 'success'
      case 'IN_PROGRESS': return 'warning'
      case 'COMPLETED': return 'success'
      case 'CANCELLED': return 'destructive'
      case 'NO_SHOW': return 'destructive'
      default: return 'outline'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CONSULTATION': return 'blue'
      case 'SITE_VISIT': return 'green'
      case 'FOLLOW_UP': return 'purple'
      case 'EMERGENCY': return 'red'
      default: return 'gray'
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

  const canPerformAction = (appointment: Appointment, action: string) => {
    switch (action) {
      case 'confirm':
        return appointment.status === 'SCHEDULED'
      case 'start':
        return appointment.status === 'CONFIRMED' || appointment.status === 'SCHEDULED'
      case 'complete':
        return appointment.status === 'IN_PROGRESS'
      case 'cancel':
        return ['SCHEDULED', 'CONFIRMED'].includes(appointment.status)
      case 'edit':
        return !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(appointment.status)
      default:
        return false
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">
            Manage customer appointments and scheduling
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
              <DialogDescription>
                Create a new appointment with customer and service details.
              </DialogDescription>
            </DialogHeader>
            <AppointmentForm
              onSuccess={() => setShowCreateDialog(false)}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
          <CardDescription>
            Find appointments by customer, service, or date range
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer name, service, or notes..."
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
          <AppointmentFilters
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
          <TabsTrigger value="calendar">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>
                Appointment List
                {appointmentsData && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({appointmentsData.pagination.total} total)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Loading appointments...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <p className="text-sm text-red-600">Failed to load appointments</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Please try refreshing the page
                    </p>
                  </div>
                </div>
              ) : appointmentsData?.data.length === 0 ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No appointments found</p>
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={() => setShowCreateDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule your first appointment
                    </Button>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointmentsData?.data.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{appointment.customerName}</p>
                            {appointment.contactInfo?.email && (
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Mail className="h-3 w-3 mr-1" />
                                {appointment.contactInfo.email}
                              </div>
                            )}
                            {appointment.contactInfo?.phone && (
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Phone className="h-3 w-3 mr-1" />
                                {appointment.contactInfo.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{appointment.serviceType}</p>
                            {appointment.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {appointment.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{formatDate(appointment.scheduledDate)}</p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {appointment.startTime} - {appointment.endTime}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {appointment.estimatedDuration} min
                            {appointment.actualDuration && appointment.actualDuration !== appointment.estimatedDuration && (
                              <div className="text-xs text-muted-foreground">
                                Actual: {appointment.actualDuration} min
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-${getTypeColor(appointment.type)}-600 border-${getTypeColor(appointment.type)}-300`}>
                            {appointment.type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityColor(appointment.priority) as any}>
                            {appointment.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(appointment.status) as any}>
                            {appointment.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {appointment.location ? (
                            <div className="flex items-center text-sm">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="truncate max-w-[120px]">
                                {appointment.location.address}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">TBD</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {canPerformAction(appointment, 'edit') && (
                                <DropdownMenuItem onClick={() => handleEdit(appointment)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {canPerformAction(appointment, 'confirm') && (
                                <DropdownMenuItem
                                  onClick={() => handleConfirm(appointment)}
                                  disabled={confirmAppointment.isPending}
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Confirm
                                </DropdownMenuItem>
                              )}
                              {canPerformAction(appointment, 'start') && (
                                <DropdownMenuItem
                                  onClick={() => handleStartAppointment(appointment)}
                                  disabled={updateAppointment.isPending}
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  Start
                                </DropdownMenuItem>
                              )}
                              {canPerformAction(appointment, 'complete') && (
                                <DropdownMenuItem
                                  onClick={() => handleComplete(appointment)}
                                  disabled={completeAppointment.isPending}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Complete
                                </DropdownMenuItem>
                              )}
                              {canPerformAction(appointment, 'cancel') && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleCancel(appointment)}
                                    disabled={cancelAppointment.isPending}
                                    className="text-red-600"
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
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

        {/* Calendar View */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>
                View and manage appointments in calendar format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AppointmentCalendarView
                appointments={calendarData?.data || []}
                isLoading={calendarLoading}
                startDate={calendarStartDate}
                endDate={calendarEndDate}
                onDateRangeChange={(start, end) => {
                  setCalendarStartDate(start)
                  setCalendarEndDate(end)
                }}
                onAppointmentClick={handleEdit}
                onCreateAppointment={(dateTime) => {
                  // Pre-fill the form with the selected date/time
                  setShowCreateDialog(true)
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      {selectedAppointment && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Appointment</DialogTitle>
              <DialogDescription>
                Update appointment details and scheduling information.
              </DialogDescription>
            </DialogHeader>
            <AppointmentForm
              appointment={selectedAppointment}
              onSuccess={() => {
                setShowEditDialog(false)
                setSelectedAppointment(null)
              }}
              onCancel={() => {
                setShowEditDialog(false)
                setSelectedAppointment(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}