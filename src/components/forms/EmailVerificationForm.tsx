import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Mail, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { authService } from '@/services/auth.service'
import { useLoadingState } from '@/hooks/useLoadingStates'
import { cn } from '@/lib/utils'

interface EmailVerificationFormProps {
  token?: string
  email?: string
  onSuccess?: () => void
  onResendSuccess?: () => void
  className?: string
  autoVerify?: boolean
}

export function EmailVerificationForm({
  token,
  email,
  onSuccess,
  onResendSuccess,
  className,
  autoVerify = true
}: EmailVerificationFormProps) {
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | 'expired'>('pending')
  const [error, setError] = useState<string | null>(null)
  const loadingState = useLoadingState()

  useEffect(() => {
    if (token && autoVerify) {
      verifyEmail()
    }
  }, [token, autoVerify])

  const verifyEmail = async () => {
    if (!token) {
      setVerificationStatus('error')
      setError('No verification token provided')
      return
    }

    try {
      setError(null)
      loadingState.startLoading({
        showProgress: true,
        estimatedDuration: 2000,
        progressMessage: 'Verifying email...'
      })

      await authService.verifyEmail(token)

      loadingState.stopLoading({ success: true })
      setVerificationStatus('success')

      // Redirect after a delay
      setTimeout(() => {
        onSuccess?.()
      }, 2000)
    } catch (error: any) {
      loadingState.stopLoading({ success: false })

      if (error.response?.status === 400) {
        setVerificationStatus('expired')
        setError('This verification link has expired or is invalid.')
      } else {
        setVerificationStatus('error')
        setError(error.response?.data?.message || 'Failed to verify email. Please try again.')
      }
    }
  }

  const resendVerification = async () => {
    if (!email) {
      setError('Email address is required to resend verification')
      return
    }

    try {
      setError(null)
      loadingState.startLoading({
        showProgress: true,
        estimatedDuration: 2000,
        progressMessage: 'Sending verification email...'
      })

      // This would need to be implemented in the auth service
      // await authService.resendVerificationEmail(email)

      loadingState.stopLoading({ success: true })
      onResendSuccess?.()
    } catch (error: any) {
      loadingState.stopLoading({ success: false })
      setError(error.response?.data?.message || 'Failed to resend verification email.')
    }
  }

  const renderContent = () => {
    switch (verificationStatus) {
      case 'success':
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">Email Verified!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Your email address has been successfully verified. You will be redirected shortly.
              </p>
            </div>
            <Button onClick={onSuccess}>
              Continue to Dashboard
            </Button>
          </div>
        )

      case 'error':
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <XCircle className="h-16 w-16 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">Verification Failed</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {error || 'Unable to verify your email address.'}
              </p>
            </div>
            {token && (
              <Button onClick={verifyEmail} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        )

      case 'expired':
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <XCircle className="h-16 w-16 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-800">Link Expired</h3>
              <p className="text-sm text-muted-foreground mt-2">
                This verification link has expired. Please request a new verification email.
              </p>
            </div>
            {email && (
              <Button onClick={resendVerification} disabled={loadingState.isLoading}>
                <Mail className="h-4 w-4 mr-2" />
                {loadingState.isLoading ? 'Sending...' : 'Resend Verification'}
              </Button>
            )}
          </div>
        )

      case 'pending':
      default:
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Verifying Email</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Please wait while we verify your email address...
              </p>
            </div>
          </div>
        )
    }
  }

  // If no token provided, show a resend form
  if (!token) {
    return (
      <Card className={cn('w-full max-w-md mx-auto', className)}>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center">
            <Mail className="h-6 w-6 mr-2" />
            Email Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Please check your email for a verification link. If you haven't received it, you can request a new one below.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {email && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Resend verification email to: <strong>{email}</strong>
              </p>
              <Button onClick={resendVerification} disabled={loadingState.isLoading}>
                <Mail className="h-4 w-4 mr-2" />
                {loadingState.isLoading ? 'Sending...' : 'Resend Verification'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Email Verification
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  )
}