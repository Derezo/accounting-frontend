import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { NewPasswordForm } from '@/components/forms/NewPasswordForm'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle } from 'lucide-react'

export function NewPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
    }
  }, [searchParams])

  const handleSuccess = () => {
    navigate('/login', {
      state: {
        message: 'Password updated successfully. Please sign in with your new password.',
        type: 'success'
      }
    })
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600 mr-2" />
              Invalid Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                This password reset link is invalid or missing required parameters.
                Please request a new password reset.
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <Button onClick={() => navigate('/password-reset')}>
                Request New Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <NewPasswordForm token={token} onSuccess={handleSuccess} />
    </div>
  )
}