import { useNavigate } from 'react-router-dom'
import { PasswordResetForm } from '@/components/forms/PasswordResetForm'

export function PasswordResetPage() {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <PasswordResetForm onBack={handleBack} />
    </div>
  )
}