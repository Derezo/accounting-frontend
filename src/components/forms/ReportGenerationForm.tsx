import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Clock, Settings } from 'lucide-react'

interface ReportTemplate {
  id: string
  name: string
  description: string
  category: string
  parameters: Array<{
    name: string
    type: 'date' | 'select' | 'text' | 'number'
    label: string
    required: boolean
    options?: string[]
  }>
  estimatedTime: string
  permissions: string[]
}

interface ReportGenerationFormProps {
  template: ReportTemplate
  onGenerate: (parameters: Record<string, any>) => void
  onCancel: () => void
  isGenerating: boolean
}

export function ReportGenerationForm({
  template,
  onGenerate,
  onCancel,
  isGenerating
}: ReportGenerationFormProps) {
  // Create dynamic schema based on template parameters
  const createSchema = () => {
    const schemaObject: Record<string, any> = {}

    template.parameters.forEach(param => {
      switch (param.type) {
        case 'date':
          schemaObject[param.name] = param.required
            ? z.string().min(1, `${param.label} is required`)
            : z.string().optional()
          break
        case 'number':
          schemaObject[param.name] = param.required
            ? z.number().min(0, `${param.label} must be positive`)
            : z.number().optional()
          break
        case 'select':
          if (param.options && param.required) {
            schemaObject[param.name] = z.enum(param.options as [string, ...string[]])
          } else {
            schemaObject[param.name] = z.string().optional()
          }
          break
        default:
          schemaObject[param.name] = param.required
            ? z.string().min(1, `${param.label} is required`)
            : z.string().optional()
      }
    })

    return z.object(schemaObject)
  }

  const schema = createSchema()
  type FormData = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: (() => {
      const defaults: any = {}
      template.parameters.forEach(param => {
        if (param.type === 'date') {
          if (param.name.includes('start') || param.name.includes('Start')) {
            defaults[param.name] = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
          } else if (param.name.includes('end') || param.name.includes('End')) {
            defaults[param.name] = new Date().toISOString().split('T')[0]
          } else {
            defaults[param.name] = new Date().toISOString().split('T')[0]
          }
        }
      })
      return defaults
    })(),
  })

  const onSubmit = (data: FormData) => {
    // Convert string numbers to actual numbers for number fields
    const processedData = { ...data }
    template.parameters.forEach(param => {
      if (param.type === 'number' && processedData[param.name]) {
        processedData[param.name] = parseFloat(processedData[param.name] as string)
      }
    })

    onGenerate(processedData)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Template Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Report Configuration
          </CardTitle>
          <CardDescription>
            {template.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Est. time: {template.estimatedTime}
            </div>
            <div className="flex items-center gap-1">
              <Settings className="w-4 h-4" />
              Category: {template.category}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Parameters</CardTitle>
          <CardDescription>
            Configure the parameters for your report generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {template.parameters.map((param) => (
            <div key={param.name} className="space-y-2">
              <Label htmlFor={param.name}>
                {param.label}
                {param.required && <span className="text-red-500 ml-1">*</span>}
              </Label>

              {param.type === 'select' && param.options ? (
                <Select onValueChange={(value) => setValue(param.name as any, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${param.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {param.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : param.type === 'date' ? (
                <Input
                  id={param.name}
                  type="date"
                  {...register(param.name as any)}
                />
              ) : param.type === 'number' ? (
                <Input
                  id={param.name}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={`Enter ${param.label.toLowerCase()}`}
                  {...register(param.name as any, { valueAsNumber: true })}
                />
              ) : (
                <Input
                  id={param.name}
                  type="text"
                  placeholder={`Enter ${param.label.toLowerCase()}`}
                  {...register(param.name as any)}
                />
              )}

              {errors[param.name as keyof typeof errors] && (
                <p className="text-sm text-red-600">
                  {errors[param.name as keyof typeof errors]?.message as string}
                </p>
              )}
            </div>
          ))}

          {template.parameters.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              This report doesn't require any additional parameters.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isGenerating}>
          Cancel
        </Button>
        <Button type="submit" disabled={isGenerating}>
          <Play className="w-4 h-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Generate Report'}
        </Button>
      </div>
    </form>
  )
}