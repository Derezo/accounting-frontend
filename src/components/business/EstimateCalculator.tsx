import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calculator, Loader2, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCalculateEstimate } from '@/hooks/useAPI'
import { formatCurrency } from '@/lib/utils'

const estimateSchema = z.object({
  requirements: z.string().min(10, 'Please provide detailed requirements (minimum 10 characters)'),
  projectType: z.string().optional(),
})

type EstimateFormData = z.infer<typeof estimateSchema>

interface EstimateResult {
  estimatedHours: number
  estimatedCost: number
  breakdown: Array<{ task: string; hours: number; cost: number }>
}

interface EstimateCalculatorProps {
  onEstimateComplete?: (estimate: EstimateResult) => void
}

export function EstimateCalculator({ onEstimateComplete }: EstimateCalculatorProps) {
  const [estimate, setEstimate] = useState<EstimateResult | null>(null)
  const calculateEstimate = useCalculateEstimate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<EstimateFormData>({
    resolver: zodResolver(estimateSchema),
    defaultValues: {
      requirements: '',
      projectType: '',
    },
  })

  const requirements = watch('requirements')

  const onSubmit = async (data: EstimateFormData) => {
    try {
      const result = await calculateEstimate.mutateAsync({
        requirements: data.requirements,
        projectType: data.projectType || undefined,
      })
      setEstimate(result)
      onEstimateComplete?.(result)
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  }

  const exampleRequirements = [
    "E-commerce website with product catalog, shopping cart, payment processing, and admin dashboard",
    "Mobile app for task management with user authentication, real-time sync, and offline capabilities",
    "Company website redesign with 10 pages, contact forms, blog, and SEO optimization",
    "Custom CRM system with lead tracking, email integration, reporting, and user management",
  ]

  const handleExampleClick = (example: string) => {
    // This would set the requirements field with the example
    // For now, we'll just show it as a placeholder feature
  }

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Calculator className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-semibold">AI-Powered Project Estimator</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Get intelligent cost and time estimates based on your project requirements
        </p>
      </div>

      {/* Estimate Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="requirements">Project Requirements *</Label>
          <textarea
            id="requirements"
            {...register('requirements')}
            disabled={calculateEstimate.isPending}
            rows={6}
            className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Describe your project in detail. Include features, functionality, design requirements, technical specifications, and any special considerations..."
          />
          {errors.requirements && (
            <p className="text-sm text-red-600">{errors.requirements.message}</p>
          )}
          <div className="text-xs text-muted-foreground">
            {requirements.length}/500 characters recommended
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="projectType">Project Type</Label>
          <select
            {...register('projectType')}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            disabled={calculateEstimate.isPending}
          >
            <option value="">Auto-detect from requirements</option>
            <option value="website">Website Development</option>
            <option value="mobile-app">Mobile Application</option>
            <option value="web-app">Web Application</option>
            <option value="e-commerce">E-commerce Platform</option>
            <option value="crm">CRM System</option>
            <option value="api">API Development</option>
            <option value="integration">System Integration</option>
            <option value="migration">Data Migration</option>
            <option value="maintenance">Maintenance & Support</option>
            <option value="consulting">Consulting Services</option>
          </select>
        </div>

        <Button
          type="submit"
          disabled={calculateEstimate.isPending || !requirements.trim()}
          className="w-full"
        >
          {calculateEstimate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Calculate Estimate
        </Button>
      </form>

      {/* Example Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-4 w-4" />
            <span>Example Requirements</span>
          </CardTitle>
          <CardDescription>
            Click any example to see how detailed requirements help generate better estimates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {exampleRequirements.map((example, index) => (
              <div
                key={index}
                className="p-3 text-sm bg-muted rounded-md hover:bg-muted/80 cursor-pointer transition-colors"
                onClick={() => handleExampleClick(example)}
              >
                {example}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estimate Results */}
      {estimate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Estimate Generated</CardTitle>
            <CardDescription>
              AI-powered analysis of your project requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-primary/10 rounded-md">
                <p className="text-2xl font-bold text-primary">{estimate.estimatedHours}h</p>
                <p className="text-sm text-muted-foreground">Estimated Hours</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-md">
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(estimate.estimatedCost)}
                </p>
                <p className="text-sm text-muted-foreground">Estimated Cost</p>
              </div>
            </div>

            {/* Breakdown */}
            <div>
              <h4 className="font-medium mb-3">Task Breakdown</h4>
              <div className="space-y-2">
                {estimate.breakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{item.task}</span>
                    <div className="flex items-center space-x-4 text-sm">
                      <Badge variant="outline">{item.hours}h</Badge>
                      <span className="font-medium">{formatCurrency(item.cost)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-xs text-yellow-800">
                <strong>Note:</strong> This is an AI-generated estimate based on the provided requirements.
                Actual project costs may vary depending on specific implementation details, scope changes,
                and unforeseen complexities. Use this as a starting point for more detailed project planning.
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Copy estimate to clipboard or export
                  navigator.clipboard.writeText(JSON.stringify(estimate, null, 2))
                }}
              >
                Copy Estimate
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  // Create quote from estimate
                  onEstimateComplete?.(estimate)
                }}
              >
                Create Quote from Estimate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {calculateEstimate.isError && (
        <Card>
          <CardContent className="p-4">
            <div className="text-center text-red-600">
              <p className="text-sm">Failed to generate estimate</p>
              <p className="text-xs text-muted-foreground mt-1">
                Please try again with more detailed requirements
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}