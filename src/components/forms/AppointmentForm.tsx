import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { Loader2, Calendar, Clock, User, MapPin, FileText, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useCreateAppointment, useUpdateAppointment, useCustomers } from '@/hooks/useAPI'
import { Appointment, AppointmentType, AppointmentPriority } from '@/types/api'

const appointmentSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  serviceType: z.string().min(1, 'Service type is required'),
  type: z.enum(['CONSULTATION', 'SITE_VISIT', 'FOLLOW_UP', 'EMERGENCY']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),

  // Date and time
  scheduledDate: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  estimatedDuration: z.number().min(15, 'Duration must be at least 15 minutes'),

  // Customer info (if creating new customer inline)
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email().optional().or(z.literal('')),
  customerPhone: z.string().optional(),

  // Location
  locationType: z.enum(['ON_SITE', 'CLIENT_LOCATION', 'REMOTE']),
  locationAddress: z.string().optional(),
  locationInstructions: z.string().optional(),

  // Details
  description: z.string().optional(),
  requirements: z.string().optional(),
  notes: z.string().optional(),

  // Settings
  requiresConfirmation: z.boolean().optional(),
  sendReminders: z.boolean().optional(),
  isRecurring: z.boolean().optional(),
  recurringPattern: z.string().optional(),

  // Preparation
  estimatedCost: z.number().optional(),
  materialsNeeded: z.string().optional(),
  specialInstructions: z.string().optional(),
}).refine((data) => {
  const start = new Date(`${data.scheduledDate}T${data.startTime}`)
  const end = new Date(`${data.scheduledDate}T${data.endTime}`)
  return end > start
}, {
  message: 'End time must be after start time',
  path: ['endTime']
}).refine((data) => {
  if (data.locationType !== 'REMOTE' && !data.locationAddress) {
    return false
  }
  return true
}, {
  message: 'Location address is required for on-site and client location appointments',
  path: ['locationAddress']
})

type AppointmentFormData = z.infer<typeof appointmentSchema>

interface AppointmentFormProps {
  appointment?: Appointment
  onSuccess: () => void
  onCancel: () => void
  initialCustomerId?: string
  initialDate?: string
  initialTime?: string
}

export function AppointmentForm({
  appointment,
  onSuccess,
  onCancel,
  initialCustomerId,
  initialDate,
  initialTime
}: AppointmentFormProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomerId || appointment?.customerId || '')
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)

  const isEditing = !!appointment
  const createAppointment = useCreateAppointment()
  const updateAppointment = useUpdateAppointment()

  // Load customers for selection
  const { data: customersData } = useCustomers({ limit: 100 })

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: appointment ? {
      customerId: appointment.customerId,
      serviceType: appointment.serviceType,
      type: appointment.type as AppointmentType,
      priority: appointment.priority as AppointmentPriority,
      scheduledDate: appointment.scheduledDate,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      estimatedDuration: appointment.estimatedDuration,
      customerName: appointment.customerName,
      customerEmail: appointment.contactInfo?.email || '',
      customerPhone: appointment.contactInfo?.phone || '',
      locationType: appointment.location?.type || 'CLIENT_LOCATION',
      locationAddress: appointment.location?.address || '',
      locationInstructions: appointment.location?.instructions || '',
      description: appointment.description || '',
      requirements: appointment.requirements || '',
      notes: appointment.notes || '',
      requiresConfirmation: appointment.requiresConfirmation || false,
      sendReminders: appointment.sendReminders || true,
      isRecurring: appointment.isRecurring || false,
      recurringPattern: appointment.recurringPattern || '',
      estimatedCost: appointment.estimatedCost || undefined,
      materialsNeeded: appointment.materialsNeeded || '',
      specialInstructions: appointment.specialInstructions || '',
    } : {
      type: 'CONSULTATION',
      priority: 'MEDIUM',
      scheduledDate: initialDate || '',
      startTime: initialTime || '',
      endTime: '',
      estimatedDuration: 60,
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      locationType: 'CLIENT_LOCATION',
      locationAddress: '',
      locationInstructions: '',
      description: '',
      requirements: '',
      notes: '',
      requiresConfirmation: true,
      sendReminders: true,
      isRecurring: false,
      recurringPattern: '',
      materialsNeeded: '',
      specialInstructions: '',
    }
  })

  // Update form when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      form.setValue('customerName', selectedCustomer.type === 'PERSON'
        ? `${selectedCustomer.person?.firstName} ${selectedCustomer.person?.lastName}`.trim()
        : selectedCustomer.business?.businessName || ''
      )
      form.setValue('customerEmail', selectedCustomer.email || '')
      form.setValue('customerPhone', selectedCustomer.phone || '')

      // Set default location for existing customers
      if (selectedCustomer.address) {
        const address = `${selectedCustomer.address.street}, ${selectedCustomer.address.city}, ${selectedCustomer.address.province} ${selectedCustomer.address.postalCode}`.trim()
        form.setValue('locationAddress', address)
      }
    }
  }, [selectedCustomer, form])

  // Calculate end time based on duration
  const calculateEndTime = (startTime: string, duration: number) => {
    if (!startTime) return ''

    const [hours, minutes] = startTime.split(':').map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + duration

    const endHours = Math.floor(endMinutes / 60)
    const endMins = endMinutes % 60

    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
  }

  // Watch for start time and duration changes
  const startTime = form.watch('startTime')
  const duration = form.watch('estimatedDuration')

  useEffect(() => {
    if (startTime && duration) {
      const endTime = calculateEndTime(startTime, duration)
      form.setValue('endTime', endTime)
    }
  }, [startTime, duration, form])

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      const appointmentData = {
        customerId: data.customerId,
        serviceType: data.serviceType,
        type: data.type,
        priority: data.priority,
        scheduledDate: data.scheduledDate,
        startTime: data.startTime,
        endTime: data.endTime,
        estimatedDuration: data.estimatedDuration,
        customerName: data.customerName,
        contactInfo: {
          email: data.customerEmail || undefined,
          phone: data.customerPhone || undefined,
        },
        location: {
          type: data.locationType,
          address: data.locationAddress || undefined,
          instructions: data.locationInstructions || undefined,
        },
        description: data.description || undefined,
        requirements: data.requirements || undefined,
        notes: data.notes || undefined,
        requiresConfirmation: data.requiresConfirmation || false,
        sendReminders: data.sendReminders || true,
        isRecurring: data.isRecurring || false,
        recurringPattern: data.recurringPattern || undefined,
        estimatedCost: data.estimatedCost || undefined,
        materialsNeeded: data.materialsNeeded || undefined,
        specialInstructions: data.specialInstructions || undefined,
      }

      if (isEditing) {
        await updateAppointment.mutateAsync({
          appointmentId: appointment.id,
          data: appointmentData
        })
      } else {
        await createAppointment.mutateAsync(appointmentData)
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving appointment:', error)
    }
  }

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId)
    form.setValue('customerId', customerId)

    const customer = customersData?.data.find(c => c.id === customerId)
    setSelectedCustomer(customer)
  }

  const isLoading = createAppointment.isPending || updateAppointment.isPending

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Customer Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
          <CardDescription>
            Select an existing customer or enter details for a new customer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerId">Customer *</Label>
            <Select value={selectedCustomerId} onValueChange={handleCustomerSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customersData?.data.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>
                        {customer.type === 'PERSON'
                          ? `${customer.person?.firstName} ${customer.person?.lastName}`.trim()
                          : customer.business?.businessName}
                      </span>
                      <Badge variant="outline" className="ml-2">
                        {customer.type === 'PERSON' ? 'Individual' : 'Business'}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.customerId && (
              <p className="text-sm text-red-600">{form.formState.errors.customerId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                {...form.register('customerName')}
                placeholder="Full name or business name"
              />
              {form.formState.errors.customerName && (
                <p className="text-sm text-red-600">{form.formState.errors.customerName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                {...form.register('customerEmail')}
                placeholder="customer@example.com"
              />
              {form.formState.errors.customerEmail && (
                <p className="text-sm text-red-600">{form.formState.errors.customerEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone</Label>
              <Input
                id="customerPhone"
                {...form.register('customerPhone')}
                placeholder="(555) 123-4567"
              />
              {form.formState.errors.customerPhone && (
                <p className="text-sm text-red-600">{form.formState.errors.customerPhone.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Service Details
          </CardTitle>
          <CardDescription>
            Specify the type of service and appointment details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type *</Label>
              <Input
                id="serviceType"
                {...form.register('serviceType')}
                placeholder="e.g., Tax Consultation, Bookkeeping"
              />
              {form.formState.errors.serviceType && (
                <p className="text-sm text-red-600">{form.formState.errors.serviceType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Appointment Type *</Label>
              <Select value={form.watch('type')} onValueChange={(value) => form.setValue('type', value as AppointmentType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONSULTATION">Consultation</SelectItem>
                  <SelectItem value="SITE_VISIT">Site Visit</SelectItem>
                  <SelectItem value="FOLLOW_UP">Follow-up</SelectItem>
                  <SelectItem value="EMERGENCY">Emergency</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.type && (
                <p className="text-sm text-red-600">{form.formState.errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select value={form.watch('priority')} onValueChange={(value) => form.setValue('priority', value as AppointmentPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.priority && (
                <p className="text-sm text-red-600">{form.formState.errors.priority.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Brief description of the appointment purpose"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              {...form.register('requirements')}
              placeholder="Any special requirements or preparations needed"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Date & Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Date & Time
          </CardTitle>
          <CardDescription>
            Schedule the appointment date and time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Date *</Label>
              <Input
                id="scheduledDate"
                type="date"
                {...form.register('scheduledDate')}
                min={new Date().toISOString().split('T')[0]}
              />
              {form.formState.errors.scheduledDate && (
                <p className="text-sm text-red-600">{form.formState.errors.scheduledDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                {...form.register('startTime')}
              />
              {form.formState.errors.startTime && (
                <p className="text-sm text-red-600">{form.formState.errors.startTime.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedDuration">Duration (minutes) *</Label>
              <Select
                value={form.watch('estimatedDuration')?.toString()}
                onValueChange={(value) => form.setValue('estimatedDuration', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="180">3 hours</SelectItem>
                  <SelectItem value="240">4 hours</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.estimatedDuration && (
                <p className="text-sm text-red-600">{form.formState.errors.estimatedDuration.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                {...form.register('endTime')}
                readOnly
                className="bg-muted"
              />
              {form.formState.errors.endTime && (
                <p className="text-sm text-red-600">{form.formState.errors.endTime.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location
          </CardTitle>
          <CardDescription>
            Specify where the appointment will take place
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="locationType">Location Type *</Label>
            <Select
              value={form.watch('locationType')}
              onValueChange={(value) => form.setValue('locationType', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ON_SITE">Our Office</SelectItem>
                <SelectItem value="CLIENT_LOCATION">Client Location</SelectItem>
                <SelectItem value="REMOTE">Remote/Virtual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.watch('locationType') !== 'REMOTE' && (
            <div className="space-y-2">
              <Label htmlFor="locationAddress">Address *</Label>
              <Input
                id="locationAddress"
                {...form.register('locationAddress')}
                placeholder="Complete address with postal code"
              />
              {form.formState.errors.locationAddress && (
                <p className="text-sm text-red-600">{form.formState.errors.locationAddress.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="locationInstructions">Location Instructions</Label>
            <Textarea
              id="locationInstructions"
              {...form.register('locationInstructions')}
              placeholder="Parking instructions, office/suite number, access codes, etc."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Settings</CardTitle>
          <CardDescription>
            Configure appointment preferences and requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedCost">Estimated Cost</Label>
              <Input
                id="estimatedCost"
                type="number"
                step="0.01"
                min="0"
                {...form.register('estimatedCost', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="materialsNeeded">Materials Needed</Label>
              <Input
                id="materialsNeeded"
                {...form.register('materialsNeeded')}
                placeholder="Documents, equipment, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea
              id="specialInstructions"
              {...form.register('specialInstructions')}
              placeholder="Any special instructions for the appointment"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea
              id="notes"
              {...form.register('notes')}
              placeholder="Internal notes (not visible to customer)"
              rows={2}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="requiresConfirmation"
                checked={form.watch('requiresConfirmation')}
                onCheckedChange={(checked) => form.setValue('requiresConfirmation', !!checked)}
              />
              <Label htmlFor="requiresConfirmation">Requires customer confirmation</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendReminders"
                checked={form.watch('sendReminders')}
                onCheckedChange={(checked) => form.setValue('sendReminders', !!checked)}
              />
              <Label htmlFor="sendReminders">Send automatic reminders</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRecurring"
                checked={form.watch('isRecurring')}
                onCheckedChange={(checked) => form.setValue('isRecurring', !!checked)}
              />
              <Label htmlFor="isRecurring">Recurring appointment</Label>
            </div>

            {form.watch('isRecurring') && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="recurringPattern">Recurring Pattern</Label>
                <Select
                  value={form.watch('recurringPattern')}
                  onValueChange={(value) => form.setValue('recurringPattern', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="BIWEEKLY">Bi-weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                    <SelectItem value="ANNUALLY">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEditing ? 'Update Appointment' : 'Schedule Appointment'}
        </Button>
      </div>
    </form>
  )
}