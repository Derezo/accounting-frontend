import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading'
import { Separator } from '@/components/ui/separator'
import {
  FileText,
  Download,
  Eye,
  Play,
  AlertTriangle,
  Calendar,
  Settings,
  Filter,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReports } from '@/hooks/useReports'
import type {
  ReportTemplate,
  ReportParameter,
  ReportFormat,
  ReportInstance
} from '@/types/reports'

export interface ReportGeneratorProps {
  template?: ReportTemplate
  onReportGenerated?: (instance: ReportInstance) => void
  onPreview?: (template: ReportTemplate, parameters: Record<string, any>) => void
  className?: string
}

export function ReportGenerator({
  template,
  onReportGenerated,
  onPreview,
  className
}: ReportGeneratorProps) {
  const { generateReport, previewReport, isLoading, error } = useReports()
  const [parameters, setParameters] = useState<Record<string, any>>({})
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('PDF')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const handleParameterChange = useCallback((paramId: string, value: any) => {
    setParameters(prev => ({ ...prev, [paramId]: value }))

    // Clear validation error when user starts typing
    if (validationErrors[paramId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[paramId]
        return newErrors
      })
    }
  }, [validationErrors])

  const validateParameters = useCallback(() => {
    if (!template) return true

    const errors: Record<string, string> = {}

    template.parameters.forEach(param => {
      const value = parameters[param.id]

      // Required field validation
      if (param.required && (value === undefined || value === null || value === '')) {
        errors[param.id] = `${param.label} is required`
        return
      }

      // Skip validation for empty optional fields
      if (!param.required && (value === undefined || value === null || value === '')) {
        return
      }

      // Type-specific validation
      switch (param.type) {
        case 'number':
          if (isNaN(Number(value))) {
            errors[param.id] = `${param.label} must be a valid number`
          } else if (param.validation?.min !== undefined && Number(value) < param.validation.min) {
            errors[param.id] = `${param.label} must be at least ${param.validation.min}`
          } else if (param.validation?.max !== undefined && Number(value) > param.validation.max) {
            errors[param.id] = `${param.label} must be at most ${param.validation.max}`
          }
          break

        case 'text':
          if (param.validation?.pattern) {
            const regex = new RegExp(param.validation.pattern)
            if (!regex.test(value)) {
              errors[param.id] = param.validation.message || `${param.label} format is invalid`
            }
          }
          break

        case 'dateRange':
          if (value && (!value.from || !value.to)) {
            errors[param.id] = `${param.label} must include both start and end dates`
          } else if (value && new Date(value.from) > new Date(value.to)) {
            errors[param.id] = `Start date must be before end date`
          }
          break
      }
    })

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [template, parameters])

  const handleGenerate = useCallback(async () => {
    if (!template || !validateParameters()) {
      return
    }

    try {
      const instance = await generateReport(template.id, parameters, selectedFormat)
      onReportGenerated?.(instance)
    } catch (error) {
      console.error('Failed to generate report:', error)
    }
  }, [template, parameters, selectedFormat, validateParameters, generateReport, onReportGenerated])

  const handlePreview = useCallback(async () => {
    if (!template || !validateParameters()) {
      return
    }

    try {
      await previewReport(template.id, parameters)
      onPreview?.(template, parameters)
    } catch (error) {
      console.error('Failed to preview report:', error)
    }
  }, [template, parameters, validateParameters, previewReport, onPreview])

  const renderParameterInput = useCallback((param: ReportParameter) => {
    const value = parameters[param.id] ?? param.defaultValue
    const hasError = validationErrors[param.id]

    switch (param.type) {
      case 'text':
        return (
          <div key={param.id} className="space-y-2">
            <Label htmlFor={param.id}>
              {param.label}
              {param.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={param.id}
              value={value || ''}
              onChange={(e) => handleParameterChange(param.id, e.target.value)}
              placeholder={`Enter ${param.label.toLowerCase()}`}
              className={cn(hasError && 'border-red-500')}
            />
            {hasError && (
              <p className="text-sm text-red-600">{validationErrors[param.id]}</p>
            )}
          </div>
        )

      case 'number':
        return (
          <div key={param.id} className="space-y-2">
            <Label htmlFor={param.id}>
              {param.label}
              {param.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={param.id}
              type="number"
              value={value || ''}
              onChange={(e) => handleParameterChange(param.id, Number(e.target.value))}
              placeholder={`Enter ${param.label.toLowerCase()}`}
              min={param.validation?.min}
              max={param.validation?.max}
              className={cn(hasError && 'border-red-500')}
            />
            {hasError && (
              <p className="text-sm text-red-600">{validationErrors[param.id]}</p>
            )}
          </div>
        )

      case 'date':
        return (
          <div key={param.id} className="space-y-2">
            <Label htmlFor={param.id}>
              {param.label}
              {param.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={param.id}
              type="date"
              value={value || ''}
              onChange={(e) => handleParameterChange(param.id, e.target.value)}
              className={cn(hasError && 'border-red-500')}
            />
            {hasError && (
              <p className="text-sm text-red-600">{validationErrors[param.id]}</p>
            )}
          </div>
        )

      case 'dateRange':
        return (
          <div key={param.id} className="space-y-2">
            <Label htmlFor={param.id}>
              {param.label}
              {param.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <DatePickerWithRange
              date={value ? { from: new Date(value.from), to: new Date(value.to) } : undefined}
              onDateChange={(range) => handleParameterChange(param.id, {
                from: range.from?.toISOString().split('T')[0],
                to: range.to?.toISOString().split('T')[0]
              })}
              className={cn(hasError && 'border-red-500')}
            />
            {hasError && (
              <p className="text-sm text-red-600">{validationErrors[param.id]}</p>
            )}
          </div>
        )

      case 'select':
        return (
          <div key={param.id} className="space-y-2">
            <Label htmlFor={param.id}>
              {param.label}
              {param.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value || ''}
              onValueChange={(newValue) => handleParameterChange(param.id, newValue)}
            >
              <SelectTrigger className={cn(hasError && 'border-red-500')}>
                <SelectValue placeholder={`Select ${param.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {param.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && (
              <p className="text-sm text-red-600">{validationErrors[param.id]}</p>
            )}
          </div>
        )

      case 'multiSelect':
        return (
          <div key={param.id} className="space-y-2">
            <Label>
              {param.label}
              {param.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {param.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${param.id}-${option.value}`}
                    checked={Array.isArray(value) && value.includes(option.value)}
                    onCheckedChange={(checked) => {
                      const currentValues = Array.isArray(value) ? value : []
                      if (checked) {
                        handleParameterChange(param.id, [...currentValues, option.value])
                      } else {
                        handleParameterChange(param.id, currentValues.filter(v => v !== option.value))
                      }
                    }}
                  />
                  <Label htmlFor={`${param.id}-${option.value}`} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
            {hasError && (
              <p className="text-sm text-red-600">{validationErrors[param.id]}</p>
            )}
          </div>
        )

      case 'boolean':
        return (
          <div key={param.id} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={param.id}
                checked={value || false}
                onCheckedChange={(checked) => handleParameterChange(param.id, checked)}
              />
              <Label htmlFor={param.id}>
                {param.label}
                {param.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            {hasError && (
              <p className="text-sm text-red-600">{validationErrors[param.id]}</p>
            )}
          </div>
        )

      default:
        return null
    }
  }, [parameters, validationErrors, handleParameterChange])

  if (!template) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Template Selected</h3>
            <p className="text-muted-foreground">
              Please select a report template to configure and generate
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {template.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {template.description}
            </p>
          </div>
          <Badge variant="outline">
            {template.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Parameters Section */}
        {template.parameters.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <h4 className="font-medium">Report Parameters</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {template.parameters.map(renderParameterInput)}
            </div>
          </div>
        )}

        <Separator />

        {/* Output Format Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <h4 className="font-medium">Output Format</h4>
          </div>

          <Select value={selectedFormat} onValueChange={(value) => setSelectedFormat(value as ReportFormat)}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {template.outputFormats.map((format) => (
                <SelectItem key={format} value={format}>
                  {format}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={isLoading}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Parameter Summary */}
        {Object.keys(parameters).length > 0 && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h5 className="font-medium mb-2">Parameter Summary</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {Object.entries(parameters).map(([key, value]) => {
                const param = template.parameters.find(p => p.id === key)
                if (!param || value === undefined || value === null || value === '') return null

                return (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground">{param.label}:</span>
                    <span className="font-medium">
                      {typeof value === 'object' && value.from && value.to
                        ? `${value.from} to ${value.to}`
                        : Array.isArray(value)
                        ? value.join(', ')
                        : String(value)
                      }
                    </span>
                  </div>
                )
              })}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Output Format:</span>
                <span className="font-medium">{selectedFormat}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}