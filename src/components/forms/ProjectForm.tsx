import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { Loader2, FolderOpen, Calendar, DollarSign, User, Target, Clock } from 'lucide-react'
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
import { useCreateProject, useUpdateProject, useCustomers } from '@/hooks/useAPI'
import { Project, ProjectType, ProjectPriority, ProjectStatus } from '@/types/api'

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  customerId: z.string().min(1, 'Customer is required'),
  type: z.enum(['CONSULTING', 'DEVELOPMENT', 'MAINTENANCE', 'AUDIT', 'TRAINING', 'SUPPORT']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'ARCHIVED']),

  // Timeline
  startDate: z.string().min(1, 'Start date is required'),
  deadline: z.string().optional(),
  estimatedHours: z.number().min(0).optional(),

  // Budget and Billing
  budget: z.number().min(0).optional(),
  hourlyRate: z.number().min(0).optional(),
  billingType: z.enum(['HOURLY', 'FIXED', 'RETAINER', 'MILESTONE']),
  requiresApproval: z.boolean().optional(),

  // Customer Info
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email().optional().or(z.literal('')),
  customerPhone: z.string().optional(),

  // Project Details
  objectives: z.string().optional(),
  deliverables: z.string().optional(),
  requirements: z.string().optional(),
  assumptions: z.string().optional(),
  risks: z.string().optional(),

  // Team and Resources
  managerId: z.string().optional(),
  teamMemberIds: z.array(z.string()).optional(),
  requiredSkills: z.string().optional(),
  resources: z.string().optional(),

  // Settings
  isTemplate: z.boolean().optional(),
  isRecurring: z.boolean().optional(),
  recurringInterval: z.string().optional(),
  notificationSettings: z.object({
    milestones: z.boolean().optional(),
    deadlines: z.boolean().optional(),
    budgetAlerts: z.boolean().optional(),
    statusChanges: z.boolean().optional(),
  }).optional(),

  // Compliance and Documentation
  complianceRequirements: z.string().optional(),
  documentationLevel: z.enum(['MINIMAL', 'STANDARD', 'COMPREHENSIVE']).optional(),
  clientAccess: z.boolean().optional(),

  // Integration
  linkedQuoteId: z.string().optional(),
  linkedAppointmentIds: z.array(z.string()).optional(),

  // Notes
  notes: z.string().optional(),
  tags: z.string().optional(), // Comma-separated tags
}).refine((data) => {
  if (data.deadline && data.startDate) {
    return new Date(data.deadline) >= new Date(data.startDate)
  }
  return true
}, {
  message: 'Deadline must be after start date',
  path: ['deadline']
})

type ProjectFormData = z.infer<typeof projectSchema>

interface ProjectFormProps {
  project?: Project
  onSuccess: () => void
  onCancel: () => void
  initialCustomerId?: string
  linkedQuoteId?: string
}

export function ProjectForm({
  project,
  onSuccess,
  onCancel,
  initialCustomerId,
  linkedQuoteId
}: ProjectFormProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    initialCustomerId || project?.customerId || ''
  )
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)

  const isEditing = !!project
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()

  // Load customers for selection
  const { data: customersData } = useCustomers({ limit: 100 })

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: project ? {
      name: project.name,
      description: project.description || '',
      customerId: project.customerId,
      type: project.type as ProjectType,
      priority: project.priority as ProjectPriority,
      status: project.status as ProjectStatus,
      startDate: project.startDate,
      deadline: project.deadline || '',
      estimatedHours: project.estimatedHours || undefined,
      budget: project.budget || undefined,
      hourlyRate: project.hourlyRate || undefined,
      billingType: project.billingType || 'HOURLY',
      requiresApproval: project.requiresApproval || false,
      customerName: project.customerName,
      customerEmail: project.contactInfo?.email || '',
      customerPhone: project.contactInfo?.phone || '',
      objectives: project.objectives || '',
      deliverables: project.deliverables || '',
      requirements: project.requirements || '',
      assumptions: project.assumptions || '',
      risks: project.risks || '',
      managerId: project.managerId || '',
      teamMemberIds: project.teamMembers?.map(tm => tm.id).filter(Boolean) || [],
      requiredSkills: project.requiredSkills || '',
      resources: project.resources || '',
      isTemplate: project.isTemplate || false,
      isRecurring: project.isRecurring || false,
      recurringInterval: project.recurringInterval || '',
      notificationSettings: project.notificationSettings || {
        milestones: true,
        deadlines: true,
        budgetAlerts: true,
        statusChanges: false,
      },
      complianceRequirements: project.complianceRequirements || '',
      documentationLevel: project.documentationLevel || 'STANDARD',
      clientAccess: project.clientAccess || false,
      linkedQuoteId: project.linkedQuoteId || '',
      linkedAppointmentIds: project.linkedAppointmentIds || [],
      notes: project.notes || '',
      tags: project.tags?.join(', ') || '',
    } : {
      type: 'CONSULTING',
      priority: 'MEDIUM',
      status: 'PLANNING',
      startDate: new Date().toISOString().split('T')[0],
      deadline: '',
      billingType: 'HOURLY',
      requiresApproval: false,
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      objectives: '',
      deliverables: '',
      requirements: '',
      assumptions: '',
      risks: '',
      managerId: '',
      teamMemberIds: [],
      requiredSkills: '',
      resources: '',
      isTemplate: false,
      isRecurring: false,
      recurringInterval: '',
      notificationSettings: {
        milestones: true,
        deadlines: true,
        budgetAlerts: true,
        statusChanges: false,
      },
      complianceRequirements: '',
      documentationLevel: 'STANDARD',
      clientAccess: false,
      linkedQuoteId: linkedQuoteId || '',
      linkedAppointmentIds: [],
      notes: '',
      tags: '',
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
    }
  }, [selectedCustomer, form])

  const onSubmit = async (data: ProjectFormData) => {
    try {
      const projectData = {
        name: data.name,
        description: data.description || undefined,
        customerId: data.customerId,
        type: data.type,
        priority: data.priority,
        status: data.status,
        startDate: data.startDate,
        deadline: data.deadline || undefined,
        estimatedHours: data.estimatedHours || undefined,
        budget: data.budget || undefined,
        hourlyRate: data.hourlyRate || undefined,
        billingType: data.billingType,
        requiresApproval: data.requiresApproval || false,
        customerName: data.customerName,
        contactInfo: {
          email: data.customerEmail || undefined,
          phone: data.customerPhone || undefined,
        },
        objectives: data.objectives || undefined,
        deliverables: data.deliverables || undefined,
        requirements: data.requirements || undefined,
        assumptions: data.assumptions || undefined,
        risks: data.risks || undefined,
        managerId: data.managerId || undefined,
        teamMemberIds: data.teamMemberIds || [],
        requiredSkills: data.requiredSkills || undefined,
        resources: data.resources || undefined,
        isTemplate: data.isTemplate || false,
        isRecurring: data.isRecurring || false,
        recurringInterval: data.recurringInterval || undefined,
        notificationSettings: data.notificationSettings || {
          milestones: true,
          deadlines: true,
          budgetAlerts: true,
          statusChanges: false,
        },
        complianceRequirements: data.complianceRequirements || undefined,
        documentationLevel: data.documentationLevel || 'STANDARD',
        clientAccess: data.clientAccess || false,
        linkedQuoteId: data.linkedQuoteId || undefined,
        linkedAppointmentIds: data.linkedAppointmentIds || [],
        notes: data.notes || undefined,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
      }

      if (isEditing) {
        await updateProject.mutateAsync({
          projectId: project.id,
          data: projectData
        })
      } else {
        await createProject.mutateAsync(projectData)
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving project:', error)
    }
  }

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId)
    form.setValue('customerId', customerId)

    const customer = customersData?.data.find(c => c.id === customerId)
    setSelectedCustomer(customer)
  }

  const isLoading = createProject.isPending || updateProject.isPending

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Core project details and identification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="e.g., Website Redesign, Tax Audit"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Project Type *</Label>
              <Select value={form.watch('type')} onValueChange={(value) => form.setValue('type', value as ProjectType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONSULTING">Consulting</SelectItem>
                  <SelectItem value="DEVELOPMENT">Development</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="AUDIT">Audit</SelectItem>
                  <SelectItem value="TRAINING">Training</SelectItem>
                  <SelectItem value="SUPPORT">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Brief overview of the project scope and goals"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select value={form.watch('priority')} onValueChange={(value) => form.setValue('priority', value as ProjectPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={form.watch('status')} onValueChange={(value) => form.setValue('status', value as ProjectStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              {...form.register('tags')}
              placeholder="e.g., web, mobile, urgent (comma-separated)"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
          <CardDescription>
            Select customer and contact details
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone</Label>
              <Input
                id="customerPhone"
                {...form.register('customerPhone')}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline & Budget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timeline & Budget
          </CardTitle>
          <CardDescription>
            Project scheduling and financial planning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                {...form.register('startDate')}
              />
              {form.formState.errors.startDate && (
                <p className="text-sm text-red-600">{form.formState.errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                {...form.register('deadline')}
                min={form.watch('startDate')}
              />
              {form.formState.errors.deadline && (
                <p className="text-sm text-red-600">{form.formState.errors.deadline.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                step="0.5"
                min="0"
                {...form.register('estimatedHours', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                min="0"
                {...form.register('budget', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate</Label>
              <Input
                id="hourlyRate"
                type="number"
                step="0.01"
                min="0"
                {...form.register('hourlyRate', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingType">Billing Type</Label>
              <Select value={form.watch('billingType')} onValueChange={(value) => form.setValue('billingType', value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOURLY">Hourly</SelectItem>
                  <SelectItem value="FIXED">Fixed Price</SelectItem>
                  <SelectItem value="RETAINER">Retainer</SelectItem>
                  <SelectItem value="MILESTONE">Milestone-based</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Project Details
          </CardTitle>
          <CardDescription>
            Objectives, deliverables, and requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="objectives">Objectives</Label>
            <Textarea
              id="objectives"
              {...form.register('objectives')}
              placeholder="What are the main goals and objectives of this project?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliverables">Deliverables</Label>
            <Textarea
              id="deliverables"
              {...form.register('deliverables')}
              placeholder="What will be delivered to the client upon completion?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              {...form.register('requirements')}
              placeholder="Technical and business requirements"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assumptions">Assumptions</Label>
              <Textarea
                id="assumptions"
                {...form.register('assumptions')}
                placeholder="Project assumptions and dependencies"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="risks">Risks</Label>
              <Textarea
                id="risks"
                {...form.register('risks')}
                placeholder="Potential risks and mitigation strategies"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Project Settings</CardTitle>
          <CardDescription>
            Configuration and notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiresApproval"
                  checked={form.watch('requiresApproval')}
                  onCheckedChange={(checked) => form.setValue('requiresApproval', !!checked)}
                />
                <Label htmlFor="requiresApproval">Requires client approval for milestones</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="clientAccess"
                  checked={form.watch('clientAccess')}
                  onCheckedChange={(checked) => form.setValue('clientAccess', !!checked)}
                />
                <Label htmlFor="clientAccess">Give client access to project portal</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isTemplate"
                  checked={form.watch('isTemplate')}
                  onCheckedChange={(checked) => form.setValue('isTemplate', !!checked)}
                />
                <Label htmlFor="isTemplate">Save as project template</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRecurring"
                  checked={form.watch('isRecurring')}
                  onCheckedChange={(checked) => form.setValue('isRecurring', !!checked)}
                />
                <Label htmlFor="isRecurring">Recurring project</Label>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="documentationLevel">Documentation Level</Label>
                <Select
                  value={form.watch('documentationLevel')}
                  onValueChange={(value) => form.setValue('documentationLevel', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MINIMAL">Minimal</SelectItem>
                    <SelectItem value="STANDARD">Standard</SelectItem>
                    <SelectItem value="COMPREHENSIVE">Comprehensive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.watch('isRecurring') && (
                <div className="space-y-2">
                  <Label htmlFor="recurringInterval">Recurring Interval</Label>
                  <Select
                    value={form.watch('recurringInterval')}
                    onValueChange={(value) => form.setValue('recurringInterval', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                      <SelectItem value="ANNUALLY">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Notification Settings</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="milestones"
                  checked={form.watch('notificationSettings.milestones')}
                  onCheckedChange={(checked) => form.setValue('notificationSettings.milestones', !!checked)}
                />
                <Label htmlFor="milestones" className="text-sm">Milestones</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="deadlines"
                  checked={form.watch('notificationSettings.deadlines')}
                  onCheckedChange={(checked) => form.setValue('notificationSettings.deadlines', !!checked)}
                />
                <Label htmlFor="deadlines" className="text-sm">Deadlines</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="budgetAlerts"
                  checked={form.watch('notificationSettings.budgetAlerts')}
                  onCheckedChange={(checked) => form.setValue('notificationSettings.budgetAlerts', !!checked)}
                />
                <Label htmlFor="budgetAlerts" className="text-sm">Budget Alerts</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="statusChanges"
                  checked={form.watch('notificationSettings.statusChanges')}
                  onCheckedChange={(checked) => form.setValue('notificationSettings.statusChanges', !!checked)}
                />
                <Label htmlFor="statusChanges" className="text-sm">Status Changes</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complianceRequirements">Compliance Requirements</Label>
            <Textarea
              id="complianceRequirements"
              {...form.register('complianceRequirements')}
              placeholder="Any specific compliance or regulatory requirements"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea
              id="notes"
              {...form.register('notes')}
              placeholder="Internal notes and comments (not visible to client)"
              rows={3}
            />
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
          {isEditing ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  )
}