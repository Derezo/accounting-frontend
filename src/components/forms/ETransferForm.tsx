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
import { CreateETransferRequest } from '@/types/api'
import toast from 'react-hot-toast'

const eTransferSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  recipientEmail: z.string().email('Valid email is required'),
  recipientName: z.string().min(1, 'Recipient name is required'),
  securityQuestion: z.string().min(1, 'Security question is required'),
  securityAnswer: z.string().min(1, 'Security answer is required'),
  description: z.string().optional(),
  autoDeposit: z.boolean().default(false),
  notifyRecipient: z.boolean().default(true),
})

type ETransferFormData = z.infer<typeof eTransferSchema>

interface ETransferFormProps {
  onSuccess?: () => void
  initialData?: Partial<ETransferFormData>
}

export function ETransferForm({ onSuccess, initialData }: ETransferFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ETransferFormData>({
    resolver: zodResolver(eTransferSchema),
    defaultValues: {
      autoDeposit: false,
      notifyRecipient: true,
      ...initialData,
    },
  })

  // Fetch customers for selection
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => apiService.getCustomers(),
  })

  // Create e-transfer mutation
  const createETransferMutation = useMutation({
    mutationFn: (data: CreateETransferRequest) => apiService.createETransfer(data),
    onSuccess: () => {
      toast.success('e-Transfer created successfully')
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create e-Transfer')
    },
  })

  const onSubmit = async (data: ETransferFormData) => {
    try {
      await createETransferMutation.mutateAsync({
        customerId: data.customerId,
        amount: data.amount,
        recipientEmail: data.recipientEmail,
        recipientName: data.recipientName,
        securityQuestion: data.securityQuestion,
        securityAnswer: data.securityAnswer,
        description: data.description,
        autoDeposit: data.autoDeposit,
        notifyRecipient: data.notifyRecipient,
      })
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const selectedCustomerId = watch('customerId')
  const selectedCustomer = customers?.find(c => c.id === selectedCustomerId)

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

      {/* Amount */}
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

      {/* Recipient Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recipient Information</CardTitle>
          <CardDescription>
            Enter the recipient's details for the e-Transfer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recipientName">Recipient Name *</Label>
              <Input
                id="recipientName"
                placeholder={selectedCustomer?.name || "Enter recipient name"}
                {...register('recipientName')}
              />
              {errors.recipientName && (
                <p className="text-sm text-red-600">{errors.recipientName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Recipient Email *</Label>
              <Input
                id="recipientEmail"
                type="email"
                placeholder={selectedCustomer?.email || "recipient@example.com"}
                {...register('recipientEmail')}
              />
              {errors.recipientEmail && (
                <p className="text-sm text-red-600">{errors.recipientEmail.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Security Information</CardTitle>
          <CardDescription>
            Set a security question and answer for the recipient
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="securityQuestion">Security Question *</Label>
            <Input
              id="securityQuestion"
              placeholder="e.g., What is your mother's maiden name?"
              {...register('securityQuestion')}
            />
            {errors.securityQuestion && (
              <p className="text-sm text-red-600">{errors.securityQuestion.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="securityAnswer">Security Answer *</Label>
            <Input
              id="securityAnswer"
              placeholder="Enter the security answer"
              {...register('securityAnswer')}
            />
            {errors.securityAnswer && (
              <p className="text-sm text-red-600">{errors.securityAnswer.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description for the e-Transfer"
              {...register('description')}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoDeposit"
              {...register('autoDeposit')}
              className="rounded border-gray-300"
            />
            <Label htmlFor="autoDeposit" className="text-sm">
              Enable auto-deposit (recipient doesn't need to answer security question)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="notifyRecipient"
              {...register('notifyRecipient')}
              className="rounded border-gray-300"
            />
            <Label htmlFor="notifyRecipient" className="text-sm">
              Send email notification to recipient
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Canadian Banking Notice */}
      <Alert>
        <AlertDescription>
          <strong>Important:</strong> e-Transfers are processed through the Interac e-Transfer
          system. Funds will be debited from your account immediately and the recipient will
          receive notification within minutes. Standard Interac fees may apply.
        </AlertDescription>
      </Alert>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || createETransferMutation.isPending}
        >
          {isSubmitting || createETransferMutation.isPending ? 'Creating...' : 'Create e-Transfer'}
        </Button>
      </div>
    </form>
  )
}