import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, MessageSquare, Calendar, User, FileText, Clock, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePicker } from '@/components/ui/date-range-picker'
import { FileUpload } from '@/components/forms/FileUpload'
import { useCreateCommunication, useUploadCommunicationAttachment } from '@/hooks/useCustomerLifecycle'
import { useAuthStore } from '@/stores/auth.store'
import {
  CommunicationType,
  CommunicationDirection,
  CreateCommunicationRequest
} from '@/types/customer-lifecycle'

const communicationSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  type: z.enum(['EMAIL', 'PHONE', 'SMS', 'IN_PERSON', 'VIDEO_CALL', 'CHAT', 'LETTER']),
  direction: z.enum(['INBOUND', 'OUTBOUND']),
  subject: z.string().min(1, 'Subject is required'),
  summary: z.string().optional(),
  notes: z.string().optional(),
  scheduledAt: z.string().optional(),
  contactPersonName: z.string().optional(),
  contactPersonRole: z.string().optional(),
  requiresFollowUp: z.boolean().default(false),
  followUpDate: z.string().optional(),
})

type CommunicationFormData = z.infer<typeof communicationSchema>

interface CommunicationFormProps {
  open: boolean
  onClose: () => void
  customerId?: string
  onSuccess?: () => void
}

const COMMUNICATION_TYPES: { value: CommunicationType; label: string; icon: string }[] = [
  { value: 'EMAIL', label: 'Email', icon: '📧' },
  { value: 'PHONE', label: 'Phone Call', icon: '📞' },
  { value: 'SMS', label: 'SMS/Text', icon: '💬' },
  { value: 'IN_PERSON', label: 'In Person', icon: '👥' },
  { value: 'VIDEO_CALL', label: 'Video Call', icon: '📹' },
  { value: 'CHAT', label: 'Chat/IM', icon: '💭' },
  { value: 'LETTER', label: 'Letter/Mail', icon: '✉️' },
]

const COMMUNICATION_DIRECTIONS: { value: CommunicationDirection; label: string }[] = [
  { value: 'INBOUND', label: 'Inbound (Customer contacted us)' },
  { value: 'OUTBOUND', label: 'Outbound (We contacted customer)' },
]

export function CommunicationForm({ open, onClose, customerId, onSuccess }: CommunicationFormProps) {
  const { user } = useAuthStore()
  const [attachments, setAttachments] = useState<File[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset
  } = useForm<CommunicationFormData>({
    resolver: zodResolver(communicationSchema),
    defaultValues: {
      customerId: customerId || '',
      type: 'EMAIL',
      direction: 'OUTBOUND',
      requiresFollowUp: false,
    }
  })

  const createCommunication = useCreateCommunication()
  const uploadAttachment = useUploadCommunicationAttachment()

  const watchType = watch('type')
  const watchRequiresFollowUp = watch('requiresFollowUp')

  const handleClose = () => {
    reset()
    setAttachments([])
    onClose()
  }

  const onSubmit = async (data: CommunicationFormData) => {
    try {
      const communication = await createCommunication.mutateAsync(data)

      // Upload attachments if any
      if (attachments.length > 0) {
        await Promise.all(
          attachments.map(file =>
            uploadAttachment.mutateAsync({
              communicationId: communication.id,
              file
            })
          )
        )
      }

      onSuccess?.()
      handleClose()
    } catch (error) {
      console.error('Error creating communication:', error)
    }
  }

  const handleFileSelect = (files: File[]) => {
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Log Customer Communication</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {/* Customer Selection */}
            {!customerId && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer *</label>
                <Input
                  {...register('customerId')}
                  placeholder="Enter customer ID or search..."
                  error={errors.customerId?.message}
                />
              </div>
            )}

            {/* Communication Type and Direction */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Communication Type *</label>
                <Select
                  value={watchType}
                  onValueChange={(value) => setValue('type', value as CommunicationType)}
                >
                  {COMMUNICATION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Direction *</label>
                <Select
                  value={watch('direction')}
                  onValueChange={(value) => setValue('direction', value as CommunicationDirection)}
                >
                  {COMMUNICATION_DIRECTIONS.map(direction => (
                    <option key={direction.value} value={direction.value}>
                      {direction.label}
                    </option>
                  ))}
                </Select>
                {errors.direction && (
                  <p className="text-sm text-red-600">{errors.direction.message}</p>
                )}
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject *</label>
              <Input
                {...register('subject')}
                placeholder="Brief subject or title of the communication"
                error={errors.subject?.message}
              />
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Summary</label>
              <Textarea
                {...register('summary')}
                placeholder="Brief summary of the communication"
                rows={3}
              />
            </div>

            {/* Contact Person Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Person Name</label>
                <Input
                  {...register('contactPersonName')}
                  placeholder="Name of person contacted"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Person Role</label>
                <Input
                  {...register('contactPersonRole')}
                  placeholder="Their role/title"
                />
              </div>
            </div>

            {/* Scheduled Date (for future communications) */}
            {watchType !== 'SMS' && watchType !== 'CHAT' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {watch('direction') === 'OUTBOUND' ? 'Scheduled Date/Time' : 'Date/Time of Communication'}
                </label>
                <Input
                  {...register('scheduledAt')}
                  type="datetime-local"
                  placeholder="When did this communication occur or when is it scheduled?"
                />
              </div>
            )}

            {/* Detailed Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Detailed Notes</label>
              <Textarea
                {...register('notes')}
                placeholder="Detailed notes about the communication, outcomes, action items, etc."
                rows={4}
              />
            </div>

            {/* Follow-up */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={watchRequiresFollowUp}
                  onCheckedChange={(checked) => setValue('requiresFollowUp', !!checked)}
                />
                <label className="text-sm font-medium">Requires follow-up</label>
              </div>

              {watchRequiresFollowUp && (
                <div className="space-y-2 ml-6">
                  <label className="text-sm font-medium">Follow-up Date</label>
                  <Input
                    {...register('followUpDate')}
                    type="date"
                    placeholder="When should we follow up?"
                  />
                </div>
              )}
            </div>

            {/* Attachments */}
            <div className="space-y-4">
              <label className="text-sm font-medium">Attachments</label>

              <FileUpload
                onFileSelect={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx,.txt,.rtf"
                multiple={true}
                maxSize={10 * 1024 * 1024} // 10MB
              />

              {attachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {attachments.length} file(s) selected:
                  </p>
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-4 p-6 border-t bg-muted/25">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createCommunication.isPending}
            >
              {isSubmitting || createCommunication.isPending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Log Communication
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}