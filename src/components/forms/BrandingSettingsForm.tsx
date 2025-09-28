import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'

interface BrandingSettingsFormProps {
  initialData?: any
  onSave: (data: any) => Promise<void>
  onChange?: () => void
  isLoading?: boolean
}

export function BrandingSettingsForm({ onSave, onChange, isLoading = false }: BrandingSettingsFormProps) {
  const { handleSubmit, formState: { isDirty } } = useForm()

  useEffect(() => {
    if (isDirty && onChange) {
      onChange()
    }
  }, [isDirty, onChange])

  const onSubmit = async () => {
    await onSave({})
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <p className="text-muted-foreground">Branding settings coming soon...</p>

      <div className="flex justify-end space-x-4 pt-6">
        <Button type="button" variant="outline">Reset</Button>
        <Button type="submit" disabled={isLoading}>
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  )
}