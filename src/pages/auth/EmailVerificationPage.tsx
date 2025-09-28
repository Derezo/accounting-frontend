import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { EmailVerificationForm } from '@/components/forms/EmailVerificationForm'

export function EmailVerificationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    const emailParam = searchParams.get('email')

    if (tokenParam) {
      setToken(tokenParam)
    }

    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleSuccess = () => {
    navigate('/login', {
      state: {
        message: 'Email verified successfully. You can now sign in.',
        type: 'success'
      }
    })
  }

  const handleResendSuccess = () => {
    navigate('/login', {
      state: {
        message: 'Verification email sent. Please check your inbox.',
        type: 'info'
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <EmailVerificationForm
        token={token}
        email={email}
        onSuccess={handleSuccess}
        onResendSuccess={handleResendSuccess}
      />
    </div>
  )
}