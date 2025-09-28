import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, CheckCircle, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { authService } from '@/services/auth.service'
import { useLoadingState } from '@/hooks/useLoadingStates'
import { FieldError } from '@/components/error/ErrorDisplay'
import { cn } from '@/lib/utils'

const newPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type NewPasswordFormData = z.infer<typeof newPasswordSchema>

interface NewPasswordFormProps {
  token: string
  onSuccess?: () => void
  className?: string
}

export function NewPasswordForm({ token, onSuccess, className }: NewPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const loadingState = useLoadingState()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
  })

  const onSubmit = async (data: NewPasswordFormData) => {
    try {
      setError(null)
      loadingState.startLoading({
        showProgress: true,
        estimatedDuration: 2000,
        progressMessage: 'Updating password...'
      })

      await authService.resetPassword(token, data.password)

      loadingState.stopLoading({ success: true })
      setIsSuccess(true)

      // Redirect to login after a delay
      setTimeout(() => {
        onSuccess?.()
      }, 2000)
    } catch (error: any) {
      loadingState.stopLoading({ success: false })

      if (error.response?.status === 400) {
        setError('Invalid or expired reset token. Please request a new password reset.')
      } else {
        setError(error.response?.data?.message || 'Failed to reset password. Please try again.')
      }
    }
  }

  if (isSuccess) {
    return (
      <Card className={cn('w-full max-w-md mx-auto', className)}>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
            Password Updated
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your password has been successfully updated. You will be redirected to the login page shortly.
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <Button onClick={onSuccess}>
              Continue to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center">
          <Lock className="h-6 w-6 mr-2" />
          Set New Password
        </CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          Please enter your new password below.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your new password"
                {...register('password')}
                disabled={loadingState.isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loadingState.isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <FieldError error={errors.password?.message} />

            {/* Password requirements */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Password must contain:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>At least 8 characters</li>
                <li>One uppercase letter</li>
                <li>One lowercase letter</li>
                <li>One number</li>
                <li>One special character (@$!%*?&)</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your new password"
                {...register('confirmPassword')}
                disabled={loadingState.isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loadingState.isLoading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <FieldError error={errors.confirmPassword?.message} />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loadingState.isLoading}
          >
            {loadingState.isLoading ? loadingState.message : 'Update Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}