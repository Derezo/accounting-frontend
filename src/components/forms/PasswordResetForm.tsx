import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { authService } from '@/services/auth.service'
import { useLoadingState } from '@/hooks/useLoadingStates'
import { FieldError } from '@/components/error/ErrorDisplay'
import { cn } from '@/lib/utils'

const passwordResetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type PasswordResetFormData = z.infer<typeof passwordResetSchema>

interface PasswordResetFormProps {
  onBack?: () => void
  className?: string
}

export function PasswordResetForm({ onBack, className }: PasswordResetFormProps) {
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const loadingState = useLoadingState()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
  })

  const onSubmit = async (data: PasswordResetFormData) => {
    try {
      setError(null)
      loadingState.startLoading({
        showProgress: true,
        estimatedDuration: 2000,
        progressMessage: 'Sending reset email...'
      })

      await authService.requestPasswordReset(data.email)

      loadingState.stopLoading({ success: true })
      setIsSuccess(true)
    } catch (error: any) {
      loadingState.stopLoading({ success: false })
      setError(error.response?.data?.message || 'Failed to send reset email. Please try again.')
    }
  }

  const handleResend = async () => {
    const email = getValues('email')
    if (email) {
      await onSubmit({ email })
    }
  }

  if (isSuccess) {
    return (
      <Card className={cn('w-full max-w-md mx-auto', className)}>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
            Email Sent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              We've sent a password reset link to <strong>{getValues('email')}</strong>.
              Please check your email and follow the instructions to reset your password.
            </AlertDescription>
          </Alert>

          <div className="text-sm text-muted-foreground text-center">
            Didn't receive the email? Check your spam folder or{' '}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={handleResend}
              disabled={loadingState.isLoading}
            >
              resend the email
            </button>
          </div>

          <div className="flex justify-center">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Reset Password
        </CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          Enter your email address and we'll send you a link to reset your password.
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
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email')}
              disabled={loadingState.isLoading}
            />
            <FieldError error={errors.email?.message} />
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full"
              disabled={loadingState.isLoading}
            >
              {loadingState.isLoading ? loadingState.message : 'Send Reset Link'}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onBack}
              disabled={loadingState.isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}