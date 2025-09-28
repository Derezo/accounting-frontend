import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { apiService } from '@/services/api.service'
import { CreateManualPaymentRequest, PaymentMethod } from '@/types/api'
import { Upload, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const manualPaymentSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  method: z.enum(['CASH', 'CHEQUE', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'OTHER'] as const),
  paymentDate: z.string().min(1, 'Payment date is required'),
  referenceNumber: z.string().optional(),
  description: z.string().optional(),
  attachments: z.array(z.any()).optional(),
})

type ManualPaymentFormData = z.infer<typeof manualPaymentSchema>

interface ManualPaymentFormProps {
  onSuccess?: () => void
  initialData?: Partial<ManualPaymentFormData>
}

const paymentMethods: { value: PaymentMethod; label: string; description: string }[] = [
  { value: 'CASH', label: 'Cash', description: 'Physical cash payment' },
  { value: 'CHEQUE', label: 'Cheque', description: 'Bank cheque or money order' },
  { value: 'CREDIT_CARD', label: 'Credit Card', description: 'Credit card payment (offline)' },
  { value: 'DEBIT_CARD', label: 'Debit Card', description: 'Debit card payment (offline)' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', description: 'Direct bank transfer' },
  { value: 'OTHER', label: 'Other', description: 'Other payment method' },
]

export function ManualPaymentForm({ onSuccess, initialData }: ManualPaymentFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ManualPaymentFormData>({
    resolver: zodResolver(manualPaymentSchema),
    defaultValues: {
      paymentDate: new Date().toISOString().split('T')[0],
      ...initialData,
    },
  })

  // Fetch customers for selection
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => apiService.getCustomers(),
  })

  // Create manual payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: (data: CreateManualPaymentRequest) => apiService.createManualPayment(data),
    onSuccess: () => {
      toast.success('Manual payment recorded successfully')
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record payment')
    },
  })

  const onSubmit = async (data: ManualPaymentFormData) => {
    try {
      await createPaymentMutation.mutateAsync({
        customerId: data.customerId,
        amount: data.amount,
        method: data.method,
        paymentDate: data.paymentDate,
        referenceNumber: data.referenceNumber,
        description: data.description,
        attachments: data.attachments || [],
      })
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const selectedCustomerId = watch('customerId')
  const selectedCustomer = customers?.find(c => c.id === selectedCustomerId)
  const selectedMethod = watch('method')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Customer Selection */}
      <div className="space-y-2">
        <Label htmlFor="customerId">Customer *</Label>
        <Select onValueChange={(value) => setValue('customerId', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a customer" />
          </SelectTrigger>
          <SelectContent>
            {customers?.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name} - {customer.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.customerId && (
          <p className="text-sm text-red-600">{errors.customerId.message}</p>
        )}
      </div>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Details</CardTitle>
          <CardDescription>
            Enter the details of the payment received
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (CAD) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input
                id="paymentDate"
                type="date"
                {...register('paymentDate')}
              />
              {errors.paymentDate && (
                <p className="text-sm text-red-600">{errors.paymentDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method *</Label>
            <Select onValueChange={(value) => setValue('method', value as PaymentMethod)}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    <div>
                      <div className="font-medium">{method.label}</div>
                      <div className="text-sm text-muted-foreground">{method.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.method && (
              <p className="text-sm text-red-600">{errors.method.message}</p>
            )}
          </div>

          {(selectedMethod === 'CHEQUE' || selectedMethod === 'BANK_TRANSFER' || selectedMethod === 'OTHER') && (
            <div className="space-y-2">
              <Label htmlFor="referenceNumber">
                Reference Number
                {selectedMethod === 'CHEQUE' && ' (Cheque Number)'}
                {selectedMethod === 'BANK_TRANSFER' && ' (Transaction ID)'}
              </Label>
              <Input
                id="referenceNumber"
                placeholder={
                  selectedMethod === 'CHEQUE' ? 'Enter cheque number' :
                  selectedMethod === 'BANK_TRANSFER' ? 'Enter transaction ID' :
                  'Enter reference number'
                }
                {...register('referenceNumber')}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description or notes about this payment"
              {...register('description')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Attachments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Supporting Documents</CardTitle>
          <CardDescription>
            Upload receipts, photos, or other supporting documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <Button type="button" variant="outline">
                Choose Files
              </Button>
              <p className="mt-2 text-sm text-gray-600">
                or drag and drop files here
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              PNG, JPG, PDF up to 10MB each
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Manual payments require verification before being
          included in financial reports. Ensure all details are accurate and attach
          supporting documentation when possible.
        </AlertDescription>
      </Alert>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || createPaymentMutation.isPending}
        >
          {isSubmitting || createPaymentMutation.isPending ? 'Recording...' : 'Record Payment'}
        </Button>
      </div>
    </form>
  )
}