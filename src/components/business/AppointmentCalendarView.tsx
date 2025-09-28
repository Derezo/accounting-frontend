import { useState, useMemo } from 'react'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  MapPin,
  Plus,
  MoreHorizontal,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Appointment } from '@/types/api'

interface AppointmentCalendarViewProps {
  appointments: Appointment[]
  isLoading: boolean
  startDate: string
  endDate: string
  onDateRangeChange: (startDate: string, endDate: string) => void
  onAppointmentClick: (appointment: Appointment) => void
  onCreateAppointment: (dateTime: { date: string; time: string }) => void
}

interface CalendarDay {
  date: string
  appointments: Appointment[]
  isToday: boolean
  isInCurrentMonth: boolean
}

interface TimeSlot {
  time: string
  appointments: Appointment[]
}

export function AppointmentCalendarView({
  appointments,
  isLoading,
  startDate,
  endDate,
  onDateRangeChange,
  onAppointmentClick,
  onCreateAppointment
}: AppointmentCalendarViewProps) {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [currentDate, setCurrentDate] = useState(new Date(startDate))

  // Generate calendar days based on view mode
  const calendarDays = useMemo(() => {
    const days: CalendarDay[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (viewMode === 'week') {
      // Generate week view (7 days)
      const start = new Date(currentDate)
      start.setDate(start.getDate() - start.getDay()) // Start of week (Sunday)

      for (let i = 0; i < 7; i++) {
        const date = new Date(start)
        date.setDate(start.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]

        const dayAppointments = appointments.filter(apt => apt.scheduledDate === dateStr)

        days.push({
          date: dateStr,
          appointments: dayAppointments,
          isToday: date.getTime() === today.getTime(),
          isInCurrentMonth: date.getMonth() === currentDate.getMonth()
        })
      }
    } else {
      // Generate month view
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      // Start from the beginning of the week containing the first day of the month
      const calendarStart = new Date(start)
      calendarStart.setDate(calendarStart.getDate() - calendarStart.getDay())

      // End at the end of the week containing the last day of the month
      const calendarEnd = new Date(end)
      calendarEnd.setDate(calendarEnd.getDate() + (6 - calendarEnd.getDay()))

      for (let date = new Date(calendarStart); date <= calendarEnd; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0]
        const dayAppointments = appointments.filter(apt => apt.scheduledDate === dateStr)

        days.push({
          date: dateStr,
          appointments: dayAppointments,
          isToday: date.getTime() === today.getTime(),
          isInCurrentMonth: date.getMonth() === currentDate.getMonth()
        })
      }
    }

    return days
  }, [appointments, currentDate, viewMode])

  // Generate time slots for week view
  const timeSlots = useMemo(() => {
    if (viewMode !== 'week') return []

    const slots: TimeSlot[] = []
    const businessStart = 8 // 8 AM
    const businessEnd = 18 // 6 PM

    for (let hour = businessStart; hour <= businessEnd; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const slotAppointments = appointments.filter(apt => {
          const aptStart = apt.startTime
          const aptEnd = apt.endTime
          return aptStart <= time && aptEnd > time
        })

        slots.push({
          time,
          appointments: slotAppointments
        })
      }
    }

    return slots
  }, [appointments, viewMode])

  const navigatePrevious = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    setCurrentDate(newDate)

    // Update date range
    const start = new Date(newDate)
    const end = new Date(newDate)
    if (viewMode === 'week') {
      start.setDate(start.getDate() - start.getDay())
      end.setDate(start.getDate() + 6)
    } else {
      start.setDate(1)
      end.setMonth(end.getMonth() + 1, 0)
    }
    onDateRangeChange(start.toISOString().split('T')[0], end.toISOString().split('T')[0])
  }

  const navigateNext = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)

    // Update date range
    const start = new Date(newDate)
    const end = new Date(newDate)
    if (viewMode === 'week') {
      start.setDate(start.getDate() - start.getDay())
      end.setDate(start.getDate() + 6)
    } else {
      start.setDate(1)
      end.setMonth(end.getMonth() + 1, 0)
    }
    onDateRangeChange(start.toISOString().split('T')[0], end.toISOString().split('T')[0])
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)

    // Update date range
    const start = new Date(today)
    const end = new Date(today)
    if (viewMode === 'week') {
      start.setDate(start.getDate() - start.getDay())
      end.setDate(start.getDate() + 6)
    } else {
      start.setDate(1)
      end.setMonth(end.getMonth() + 1, 0)
    }
    onDateRangeChange(start.toISOString().split('T')[0], end.toISOString().split('T')[0])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200'
      case 'NO_SHOW': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'border-l-red-500'
      case 'MEDIUM': return 'border-l-yellow-500'
      case 'LOW': return 'border-l-blue-500'
      default: return 'border-l-gray-500'
    }
  }

  const formatDateHeader = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      weekday: viewMode === 'week' ? 'long' : 'short',
      month: viewMode === 'week' ? 'short' : undefined,
      day: 'numeric'
    })
  }

  const formatTimeSlot = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Loading calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Button variant="outline" size="sm" onClick={navigatePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <h2 className="text-lg font-semibold">
            {currentDate.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
              ...(viewMode === 'week' && {
                day: 'numeric'
              })
            })}
          </h2>

          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className="rounded-r-none"
            >
              Week
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="rounded-l-none"
            >
              Month
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'week' ? (
        /* Week View */
        <div className="border rounded-lg overflow-hidden">
          {/* Week Header */}
          <div className="grid grid-cols-8 border-b bg-muted/30">
            <div className="p-3 border-r">
              <span className="text-sm font-medium">Time</span>
            </div>
            {calendarDays.map((day) => (
              <div
                key={day.date}
                className={cn(
                  "p-3 border-r last:border-r-0 text-center",
                  day.isToday && "bg-primary/10"
                )}
              >
                <div className="text-sm font-medium">{formatDateHeader(day.date)}</div>
                <div className="text-xs text-muted-foreground">
                  {day.appointments.length} appointments
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="max-h-96 overflow-y-auto">
            {timeSlots.map((slot) => (
              <div key={slot.time} className="grid grid-cols-8 border-b last:border-b-0 min-h-12">
                <div className="p-2 border-r bg-muted/30 flex items-center">
                  <span className="text-xs text-muted-foreground">
                    {formatTimeSlot(slot.time)}
                  </span>
                </div>
                {calendarDays.map((day) => {
                  const daySlotAppointments = slot.appointments.filter(
                    apt => apt.scheduledDate === day.date
                  )

                  return (
                    <div
                      key={`${day.date}-${slot.time}`}
                      className="p-1 border-r last:border-r-0 relative group cursor-pointer hover:bg-muted/30"
                      onClick={() => onCreateAppointment({ date: day.date, time: slot.time })}
                    >
                      {daySlotAppointments.map((appointment) => (
                        <TooltipProvider key={appointment.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "text-xs p-1 mb-1 rounded border-l-2 cursor-pointer",
                                  getStatusColor(appointment.status),
                                  getPriorityColor(appointment.priority)
                                )}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onAppointmentClick(appointment)
                                }}
                              >
                                <div className="font-medium truncate">
                                  {appointment.customerName}
                                </div>
                                <div className="text-xs opacity-75 truncate">
                                  {appointment.serviceType}
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-sm">
                                <div className="font-medium">{appointment.customerName}</div>
                                <div>{appointment.serviceType}</div>
                                <div className="text-xs text-muted-foreground">
                                  {appointment.startTime} - {appointment.endTime}
                                </div>
                                {appointment.location?.address && (
                                  <div className="text-xs text-muted-foreground flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {appointment.location.address}
                                  </div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}

                      {/* Add appointment button (visible on hover) */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Month View */
        <div className="border rounded-lg overflow-hidden">
          {/* Month Header */}
          <div className="grid grid-cols-7 border-b bg-muted/30">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-3 border-r last:border-r-0 text-center">
                <span className="text-sm font-medium">{day}</span>
              </div>
            ))}
          </div>

          {/* Month Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day) => (
              <div
                key={day.date}
                className={cn(
                  "min-h-32 p-2 border-r border-b last:border-r-0",
                  !day.isInCurrentMonth && "bg-muted/30 text-muted-foreground",
                  day.isToday && "bg-primary/10"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "text-sm",
                    day.isToday && "font-bold"
                  )}>
                    {new Date(day.date).getDate()}
                  </span>
                  {day.appointments.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {day.appointments.length}
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  {day.appointments.slice(0, 3).map((appointment) => (
                    <div
                      key={appointment.id}
                      className={cn(
                        "text-xs p-1 rounded border-l-2 cursor-pointer",
                        getStatusColor(appointment.status),
                        getPriorityColor(appointment.priority)
                      )}
                      onClick={() => onAppointmentClick(appointment)}
                    >
                      <div className="font-medium truncate">
                        {appointment.startTime} {appointment.customerName}
                      </div>
                      <div className="opacity-75 truncate">
                        {appointment.serviceType}
                      </div>
                    </div>
                  ))}

                  {day.appointments.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{day.appointments.length - 3} more
                    </div>
                  )}
                </div>

                {/* Add appointment button for empty days */}
                {day.appointments.length === 0 && (
                  <div
                    className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => onCreateAppointment({ date: day.date, time: '09:00' })}
                  >
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></div>
              <span>Scheduled</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
              <span>Confirmed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200"></div>
              <span>Completed</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-xs mt-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 border-l-2 border-red-500"></div>
              <span>High Priority</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 border-l-2 border-yellow-500"></div>
              <span>Medium Priority</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 border-l-2 border-blue-500"></div>
              <span>Low Priority</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}