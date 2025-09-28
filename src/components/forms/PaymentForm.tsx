import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CreditCard, Building, DollarSign, Calendar, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCreatePayment, useUpdatePayment, useCustomers, useInvoices } from '@/hooks/useAPI'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Payment, Customer, Invoice } from '@/types/api'

const paymentSchema = z.object({
  invoiceId: z.string().min(1, 'Please select an invoice'),
  customerId: z.string().min(1, 'Please select a customer'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  method: z.enum(['CREDIT_CARD', 'BANK_TRANSFER', 'PAYPAL', 'STRIPE', 'CASH', 'CHECK', 'OTHER']),
  paymentDate: z.string().min(1, 'Payment date is required'),
  reference: z.string().optional(),
  transactionId: z.string().optional(),
  fees: z.number().min(0).optional(),
  notes: z.string().optional(),
})

type PaymentFormData = z.infer<typeof paymentSchema>

interface PaymentFormProps {
  payment?: Payment
  preselectedInvoiceId?: string
  preselectedCustomerId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function PaymentForm({
  payment,
  preselectedInvoiceId,
  preselectedCustomerId,
  onSuccess,
  onCancel
}: PaymentFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const createPayment = useCreatePayment()
  const updatePayment = useUpdatePayment()
  const { data: customersData } = useCustomers({ limit: 100 })
  const { data: invoicesData } = useInvoices({
    customerId: selectedCustomer?.id,
    status: 'SENT',
    limit: 50
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      invoiceId: preselectedInvoiceId || payment?.invoice?.id || '',
      customerId: preselectedCustomerId || payment?.customer?.id || '',
      amount: payment?.amount || 0,
      method: payment?.method || 'CREDIT_CARD',
      paymentDate: payment?.paymentDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      reference: payment?.reference || '',
      transactionId: payment?.transactionId || '',
      fees: payment?.fees || 0,
      notes: payment?.notes || '',
    },
  })

  const watchedCustomerId = watch('customerId')
  const watchedInvoiceId = watch('invoiceId')
  const watchedAmount = watch('amount')

  useEffect(() => {
    if (watchedCustomerId && customersData) {
      const customer = customersData.data.find(c => c.id === watchedCustomerId)
      setSelectedCustomer(customer || null)
    }
  }, [watchedCustomerId, customersData])

  useEffect(() => {
    if (watchedInvoiceId && invoicesData) {
      const invoice = invoicesData.data.find(i => i.id === watchedInvoiceId)
      setSelectedInvoice(invoice || null)
      if (invoice && !payment) {
        setValue('amount', invoice.amountDue)
      }
    }
  }, [watchedInvoiceId, invoicesData, setValue, payment])

  const onSubmit = async (data: PaymentFormData) => {
    try {
      const paymentData = {
        ...data,
        fees: data.fees || 0,
      }

      if (payment) {
        await updatePayment.mutateAsync({
          id: payment.id,
          ...paymentData,
        })
      } else {
        await createPayment.mutateAsync(paymentData)
      }
      onSuccess?.()
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  }

  const getMethodDisplay = (method: string) => {
    switch (method) {
      case 'CREDIT_CARD': return 'Credit Card'
      case 'BANK_TRANSFER': return 'Bank Transfer'
      case 'PAYPAL': return 'PayPal'
      case 'STRIPE': return 'Stripe'
      case 'CASH': return 'Cash'
      case 'CHECK': return 'Check'
      case 'OTHER': return 'Other'
      default: return method
    }
  }

  const getCustomerDisplay = (customer: Customer) => {
    return customer.type === 'PERSON'
      ? `${customer.person?.firstName} ${customer.person?.lastName}`
      : customer.business?.businessName
  }

  const isProcessing = createPayment.isPending || updatePayment.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Customer and Invoice Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customerId">Customer *</Label>
          <select
            {...register('customerId')}
            disabled={isProcessing || !!preselectedCustomerId}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select a customer...</option>
            {customersData?.data.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {getCustomerDisplay(customer)} {customer.email && `(${customer.email})`}
              </option>
            ))}
          </select>
          {errors.customerId && (
            <p className="text-sm text-red-600">{errors.customerId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoiceId">Invoice *</Label>
          <select
            {...register('invoiceId')}
            disabled={isProcessing || !watchedCustomerId || !!preselectedInvoiceId}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select an invoice...</option>
            {invoicesData?.data.map((invoice) => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.invoiceNumber} - {formatCurrency(invoice.amountDue)} due
              </option>
            ))}
          </select>
          {errors.invoiceId && (
            <p className="text-sm text-red-600">{errors.invoiceId.message}</p>
          )}
          {!watchedCustomerId && !preselectedCustomerId && (
            <p className="text-xs text-muted-foreground">Select a customer first</p>
          )}
        </div>
      </div>

      {/* Selected Invoice Details */}
      {selectedInvoice && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Invoice Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Invoice #</p>
                <p className="font-medium">{selectedInvoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Amount</p>
                <p className="font-medium">{formatCurrency(selectedInvoice.total)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Amount Due</p>
                <p className="font-medium text-green-600">{formatCurrency(selectedInvoice.amountDue)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Due Date</p>
                <p className="font-medium">{formatDate(selectedInvoice.dueDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Payment Amount *</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              {...register('amount', { valueAsNumber: true })}
              disabled={isProcessing}
              className="pl-10"
              placeholder="0.00"
            />
          </div>
          {errors.amount && (
            <p className="text-sm text-red-600">{errors.amount.message}</p>
          )}
          {selectedInvoice && watchedAmount > selectedInvoice.amountDue && (
            <p className="text-sm text-orange-600">
              Payment exceeds amount due. Overpayment will be recorded.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="method">Payment Method *</Label>
          <select
            {...register('method')}
            disabled={isProcessing}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="CREDIT_CARD">Credit Card</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="PAYPAL">PayPal</option>
            <option value="STRIPE">Stripe</option>
            <option value="CASH">Cash</option>
            <option value="CHECK">Check</option>
            <option value="OTHER">Other</option>
          </select>
          {errors.method && (
            <p className="text-sm text-red-600">{errors.method.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="paymentDate">Payment Date *</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="paymentDate"
              type="date"
              {...register('paymentDate')}
              disabled={isProcessing}
              className="pl-10"
            />
          </div>
          {errors.paymentDate && (
            <p className="text-sm text-red-600">{errors.paymentDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fees">Processing Fees</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="fees"
              type="number"
              step="0.01"
              min="0"
              {...register('fees', { valueAsNumber: true })}
              disabled={isProcessing}
              className="pl-10"
              placeholder="0.00"
            />
          </div>
          {errors.fees && (
            <p className="text-sm text-red-600">{errors.fees.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reference">Reference Number</Label>
          <Input
            id="reference"
            {...register('reference')}
            disabled={isProcessing}
            placeholder="Check number, confirmation code, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="transactionId">Transaction ID</Label>
          <Input
            id="transactionId"
            {...register('transactionId')}
            disabled={isProcessing}
            placeholder="External transaction identifier"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          {...register('notes')}
          disabled={isProcessing}
          rows={3}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Additional notes about this payment..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isProcessing}>
          Cancel
        </Button>
        <Button type="submit" disabled={isProcessing}>
          {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {payment ? 'Update Payment' : 'Record Payment'}
        </Button>
      </div>
    </form>
  )
}