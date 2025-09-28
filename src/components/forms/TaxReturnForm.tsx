import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { LoadingSpinner } from '@/components/ui/loading'
import { Calendar, FileText, Calculator, AlertTriangle, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const taxReturnSchema = z.object({
  jurisdiction: z.string().min(1, 'Jurisdiction is required'),
  taxYear: z.number().min(2020).max(new Date().getFullYear()),
  returnType: z.enum(['INCOME_TAX', 'SALES_TAX', 'PAYROLL_TAX', 'PROPERTY_TAX', 'OTHER']),
  filingStatus: z.enum(['SINGLE', 'MARRIED_FILING_JOINTLY', 'MARRIED_FILING_SEPARATELY', 'HEAD_OF_HOUSEHOLD', 'QUALIFYING_WIDOW']),
  dueDate: z.string(),
  extensionDate: z.string().optional(),
  totalIncome: z.number().min(0),
  totalDeductions: z.number().min(0),
  taxableIncome: z.number().min(0),
  taxOwed: z.number().min(0),
  taxPaid: z.number().min(0),
  refundAmount: z.number().min(0).optional(),
  amountDue: z.number().min(0).optional(),
  preparerName: z.string().optional(),
  preparerLicense: z.string().optional(),
  notes: z.string().optional(),
  attachments: z.array(z.string()).optional()
})

type TaxReturnFormData = z.infer<typeof taxReturnSchema>

interface TaxReturnFormProps {
  initialData?: Partial<TaxReturnFormData>
  onSubmit: (data: TaxReturnFormData) => Promise<void>
  onCancel?: () => void
  isEditing?: boolean
  isLoading?: boolean
}

export function TaxReturnForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
  isLoading = false
}: TaxReturnFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachments, setAttachments] = useState<string[]>(initialData?.attachments || [])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm<TaxReturnFormData>({
    resolver: zodResolver(taxReturnSchema),
    defaultValues: {
      taxYear: new Date().getFullYear(),
      returnType: 'INCOME_TAX',
      filingStatus: 'SINGLE',
      totalIncome: 0,
      totalDeductions: 0,
      taxableIncome: 0,
      taxOwed: 0,
      taxPaid: 0,
      ...initialData
    }
  })

  const watchedValues = watch()
  const calculatedTaxableIncome = Math.max(0, (watchedValues.totalIncome || 0) - (watchedValues.totalDeductions || 0))
  const calculatedBalance = (watchedValues.taxOwed || 0) - (watchedValues.taxPaid || 0)

  const handleFormSubmit = async (data: TaxReturnFormData) => {
    try {
      setIsSubmitting(true)

      // Calculate final values
      const finalData = {
        ...data,
        taxableIncome: calculatedTaxableIncome,
        refundAmount: calculatedBalance < 0 ? Math.abs(calculatedBalance) : 0,
        amountDue: calculatedBalance > 0 ? calculatedBalance : 0,
        attachments
      }

      await onSubmit(finalData)
    } catch (error) {
      console.error('Error submitting tax return:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddAttachment = () => {
    // TODO: Implement file upload
    console.log('Add attachment')
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground mt-4">Loading tax return form...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {isEditing ? 'Edit Tax Return' : 'New Tax Return'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jurisdiction">Tax Jurisdiction *</Label>
                <Input
                  id="jurisdiction"
                  {...register('jurisdiction')}
                  placeholder="e.g., Federal, State of California"
                  className={cn(errors.jurisdiction && 'border-red-500')}
                />
                {errors.jurisdiction && (
                  <p className="text-sm text-red-500 mt-1">{errors.jurisdiction.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="taxYear">Tax Year *</Label>
                <Input
                  id="taxYear"
                  type="number"
                  min="2020"
                  max={new Date().getFullYear()}
                  {...register('taxYear', { valueAsNumber: true })}
                  className={cn(errors.taxYear && 'border-red-500')}
                />
                {errors.taxYear && (
                  <p className="text-sm text-red-500 mt-1">{errors.taxYear.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="returnType">Return Type *</Label>
                <Select onValueChange={(value) => setValue('returnType', value as any)}>
                  <SelectTrigger className={cn(errors.returnType && 'border-red-500')}>
                    <SelectValue placeholder="Select return type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME_TAX">Income Tax</SelectItem>
                    <SelectItem value="SALES_TAX">Sales Tax</SelectItem>
                    <SelectItem value="PAYROLL_TAX">Payroll Tax</SelectItem>
                    <SelectItem value="PROPERTY_TAX">Property Tax</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.returnType && (
                  <p className="text-sm text-red-500 mt-1">{errors.returnType.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="filingStatus">Filing Status *</Label>
                <Select onValueChange={(value) => setValue('filingStatus', value as any)}>
                  <SelectTrigger className={cn(errors.filingStatus && 'border-red-500')}>
                    <SelectValue placeholder="Select filing status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLE">Single</SelectItem>
                    <SelectItem value="MARRIED_FILING_JOINTLY">Married Filing Jointly</SelectItem>
                    <SelectItem value="MARRIED_FILING_SEPARATELY">Married Filing Separately</SelectItem>
                    <SelectItem value="HEAD_OF_HOUSEHOLD">Head of Household</SelectItem>
                    <SelectItem value="QUALIFYING_WIDOW">Qualifying Widow(er)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.filingStatus && (
                  <p className="text-sm text-red-500 mt-1">{errors.filingStatus.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  {...register('dueDate')}
                  className={cn(errors.dueDate && 'border-red-500')}
                />
                {errors.dueDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.dueDate.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="extensionDate">Extension Date</Label>
                <Input
                  id="extensionDate"
                  type="date"
                  {...register('extensionDate')}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Financial Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Financial Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalIncome">Total Income *</Label>
                <Input
                  id="totalIncome"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('totalIncome', { valueAsNumber: true })}
                  className={cn(errors.totalIncome && 'border-red-500')}
                />
                {errors.totalIncome && (
                  <p className="text-sm text-red-500 mt-1">{errors.totalIncome.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="totalDeductions">Total Deductions *</Label>
                <Input
                  id="totalDeductions"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('totalDeductions', { valueAsNumber: true })}
                  className={cn(errors.totalDeductions && 'border-red-500')}
                />
                {errors.totalDeductions && (
                  <p className="text-sm text-red-500 mt-1">{errors.totalDeductions.message}</p>
                )}
              </div>

              <div>
                <Label>Taxable Income (Calculated)</Label>
                <Input
                  value={`$${calculatedTaxableIncome.toLocaleString()}`}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div>
                <Label htmlFor="taxOwed">Tax Owed *</Label>
                <Input
                  id="taxOwed"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('taxOwed', { valueAsNumber: true })}
                  className={cn(errors.taxOwed && 'border-red-500')}
                />
                {errors.taxOwed && (
                  <p className="text-sm text-red-500 mt-1">{errors.taxOwed.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="taxPaid">Tax Paid *</Label>
                <Input
                  id="taxPaid"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('taxPaid', { valueAsNumber: true })}
                  className={cn(errors.taxPaid && 'border-red-500')}
                />
                {errors.taxPaid && (
                  <p className="text-sm text-red-500 mt-1">{errors.taxPaid.message}</p>
                )}
              </div>

              <div>
                <Label>Balance (Calculated)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={calculatedBalance < 0
                      ? `Refund: $${Math.abs(calculatedBalance).toLocaleString()}`
                      : calculatedBalance > 0
                        ? `Amount Due: $${calculatedBalance.toLocaleString()}`
                        : '$0.00'
                    }
                    disabled
                    className={cn(
                      'bg-muted',
                      calculatedBalance < 0 && 'text-green-600',
                      calculatedBalance > 0 && 'text-red-600'
                    )}
                  />
                  {calculatedBalance < 0 ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : calculatedBalance > 0 ? (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Preparer Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Preparer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preparerName">Preparer Name</Label>
                <Input
                  id="preparerName"
                  {...register('preparerName')}
                  placeholder="Tax preparer or CPA name"
                />
              </div>

              <div>
                <Label htmlFor="preparerLicense">Preparer License Number</Label>
                <Input
                  id="preparerLicense"
                  {...register('preparerLicense')}
                  placeholder="CPA license or PTIN"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional notes or special circumstances"
              rows={3}
            />
          </div>

          {/* Attachments */}
          <div>
            <Label>Attachments</Label>
            <div className="space-y-2">
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attachments.map((attachment, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {attachment}
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <Button type="button" variant="outline" onClick={handleAddAttachment}>
                Add Attachment
              </Button>
            </div>
          </div>

          {/* Balance Alert */}
          {calculatedBalance !== 0 && (
            <Alert className={calculatedBalance > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {calculatedBalance > 0
                  ? `Amount due: $${calculatedBalance.toLocaleString()}. Payment will be required by the due date.`
                  : `Refund expected: $${Math.abs(calculatedBalance).toLocaleString()}. This will be processed after filing.`
                }
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Return' : 'Create Return'
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
            >
              Reset Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}