import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, UserRole, CreateUserRequest, UpdateUserRequest } from '@/types/api'
import { Save, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useFormErrorHandling } from '@/hooks/useErrorHandling'
import { ValidationErrorSummary, FieldError } from '@/components/error/ErrorDisplay'
import { AppError } from '@/lib/error-handler'
import { useLoadingState } from '@/hooks/useLoadingStates'
import {
  createUserSchema,
  updateUserSchema,
  CreateUserFormData,
  UpdateUserFormData
} from '@/lib/validation-schemas'

const userRoles: { value: UserRole; label: string; description: string }[] = [
  { value: 'SUPER_ADMIN', label: 'Super Admin', description: 'Full system access with organization management' },
  { value: 'ADMIN', label: 'Admin', description: 'Administrative access to all features' },
  { value: 'MANAGER', label: 'Manager', description: 'Manage customers, quotes, invoices, and team' },
  { value: 'ACCOUNTANT', label: 'Accountant', description: 'Financial management and reporting access' },
  { value: 'EMPLOYEE', label: 'Employee', description: 'Basic access to assigned tasks and data' },
  { value: 'VIEWER', label: 'Viewer', description: 'Read-only access to permitted data' },
]


interface UserFormProps {
  initialData?: User
  onSave: (data: CreateUserRequest | UpdateUserRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

export function UserForm({ initialData, onSave, onCancel, isLoading = false }: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submissionErrors, setSubmissionErrors] = useState<Record<string, string>>({})
  const isEditing = !!initialData
  const { handleSubmissionError } = useFormErrorHandling()
  const loadingState = useLoadingState()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
    defaultValues: isEditing ? {
      email: initialData.email,
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      role: initialData.role,
      phone: initialData.phone || '',
      isActive: initialData.isActive,
    } : {
      isActive: true,
      sendInvite: true,
    },
  })

  const selectedRole = watch('role')
  const isActive = watch('isActive')
  const sendInvite = watch('sendInvite')

  const onSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
    try {
      // Clear previous errors and start loading
      setSubmissionErrors({})
      loadingState.startLoading({
        showProgress: true,
        estimatedDuration: 3000,
        progressMessage: isEditing ? 'Updating user...' : 'Creating user...'
      })

      if (isEditing) {
        // For updates, remove confirmPassword and only include password if it's provided
        const { confirmPassword, ...updateData } = data as UpdateUserFormData
        if (!updateData.password) {
          delete updateData.password
        }
        await onSave(updateData as UpdateUserRequest)
      } else {
        // For creation, remove confirmPassword
        const { confirmPassword, ...createData } = data as CreateUserFormData
        await onSave(createData as CreateUserRequest)
      }

      loadingState.stopLoading({
        success: true,
        message: isEditing ? 'User updated successfully!' : 'User created successfully!'
      })
    } catch (error) {
      loadingState.stopLoading({ success: false })

      // Handle form submission errors
      const formErrors = handleSubmissionError(
        error,
        'Please check your input and correct any errors.'
      )
      setSubmissionErrors(formErrors)
    }
  }

  const selectedRoleInfo = userRoles.find(role => role.value === selectedRole)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Validation Error Summary */}
      {Object.keys(submissionErrors).length > 0 && (
        <ValidationErrorSummary errors={submissionErrors} />
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                error={errors.firstName?.message}
              />
              <FieldError error={errors.firstName?.message || submissionErrors.firstName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                error={errors.lastName?.message}
              />
              <FieldError error={errors.lastName?.message || submissionErrors.lastName} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
            />
            <FieldError error={errors.email?.message || submissionErrors.email} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              {...register('phone')}
              error={errors.phone?.message}
            />
            <FieldError error={errors.phone?.message || submissionErrors.phone} />
          </div>
        </CardContent>
      </Card>

      {/* Role and Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Role and Permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">User Role *</Label>
            <Select
              value={selectedRole}
              onValueChange={(value: UserRole) => setValue('role', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {userRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{role.label}</span>
                      <span className="text-sm text-muted-foreground">{role.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role.message}</p>
            )}
            {selectedRoleInfo && (
              <p className="text-sm text-muted-foreground">
                {selectedRoleInfo.description}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
            <Label htmlFor="isActive">Active User</Label>
          </div>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Change Password (Optional)' : 'Password'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">
              {isEditing ? 'New Password' : 'Password'} {!isEditing && '*'}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                error={errors.password?.message}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirm Password {!isEditing && '*'}
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {!isEditing && (
            <div className="flex items-center space-x-2">
              <Switch
                id="sendInvite"
                checked={sendInvite}
                onCheckedChange={(checked) => setValue('sendInvite', checked)}
              />
              <Label htmlFor="sendInvite">Send invitation email to user</Label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || loadingState.isLoading}>
          <Save className="w-4 h-4 mr-2" />
          {(isLoading || loadingState.isLoading) ?
            (loadingState.message || 'Saving...') :
            isEditing ? 'Update User' : 'Create User'
          }
        </Button>
      </div>
    </form>
  )
}