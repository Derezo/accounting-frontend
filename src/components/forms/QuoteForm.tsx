import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Loader2, Plus, Trash2, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCreateQuote, useUpdateQuote, useCustomers } from '@/hooks/useAPI'
import { formatCurrency } from '@/lib/utils'
import { Quote, Customer } from '@/types/api'

const quoteLineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  taxRate: z.number().min(0).max(1, 'Tax rate must be between 0 and 1'),
})

const quoteSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  validUntil: z.string().min(1, 'Valid until date is required'),
  items: z.array(quoteLineItemSchema).min(1, 'At least one line item is required'),
  notes: z.string().optional(),
  terms: z.string().optional(),
})

type QuoteFormData = z.infer<typeof quoteSchema>

interface QuoteFormProps {
  quote?: Quote
  onSuccess?: () => void
  onCancel?: () => void
}

export function QuoteForm({ quote, onSuccess, onCancel }: QuoteFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    quote?.customer || null
  )

  const createQuote = useCreateQuote()
  const updateQuote = useUpdateQuote()
  const { data: customersData } = useCustomers({ limit: 100 })

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      customerId: quote?.customerId || '',
      validUntil: quote?.validUntil ? new Date(quote.validUntil).toISOString().split('T')[0] : '',
      items: quote?.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
      })) || [
        {
          description: '',
          quantity: 1,
          unitPrice: 0,
          taxRate: 0.13, // Default 13% tax rate (HST in Canada)
        }
      ],
      notes: quote?.notes || '',
      terms: quote?.terms || 'Payment due within 30 days of invoice date.',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const watchedItems = watch('items')

  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0
    let taxAmount = 0

    watchedItems.forEach((item) => {
      const lineTotal = (item.quantity || 0) * (item.unitPrice || 0)
      const lineTax = lineTotal * (item.taxRate || 0)
      subtotal += lineTotal
      taxAmount += lineTax
    })

    return {
      subtotal,
      taxAmount,
      total: subtotal + taxAmount,
    }
  }

  const totals = calculateTotals()

  const onSubmit = async (data: QuoteFormData) => {
    try {
      const payload = {
        customerId: data.customerId,
        validUntil: new Date(data.validUntil).toISOString(),
        items: data.items,
        notes: data.notes || undefined,
        terms: data.terms || undefined,
      }

      if (quote) {
        await updateQuote.mutateAsync({
          quoteId: quote.id,
          data: payload,
        })
      } else {
        await createQuote.mutateAsync(payload)
      }

      onSuccess?.()
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  }

  const handleCustomerChange = (customerId: string) => {
    setValue('customerId', customerId)
    const customer = customersData?.data.find(c => c.id === customerId)
    setSelectedCustomer(customer || null)
  }

  const addLineItem = () => {
    append({
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0.13,
    })
  }

  const isLoading = createQuote.isPending || updateQuote.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Customer Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>Select the customer for this quote</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerId">Customer *</Label>
            <select
              {...register('customerId')}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            >
              <option value="">Select a customer...</option>
              {customersData?.data.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.type === 'PERSON'
                    ? `${customer.person?.firstName} ${customer.person?.lastName}`
                    : customer.business?.businessName
                  } - {customer.email}
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="text-sm text-red-600">{errors.customerId.message}</p>
            )}
          </div>

          {selectedCustomer && (
            <div className="p-3 bg-muted rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {selectedCustomer.type === 'PERSON'
                      ? `${selectedCustomer.person?.firstName} ${selectedCustomer.person?.lastName}`
                      : selectedCustomer.business?.businessName
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                </div>
                <Badge variant="outline">{selectedCustomer.tier}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quote Details */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Details</CardTitle>
          <CardDescription>Basic quote information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="validUntil">Valid Until *</Label>
            <Input
              id="validUntil"
              type="date"
              {...register('validUntil')}
              disabled={isLoading}
            />
            {errors.validUntil && (
              <p className="text-sm text-red-600">{errors.validUntil.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
          <CardDescription>Add products or services to this quote</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-md space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Item {index + 1}</h4>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2 space-y-2">
                  <Label htmlFor={`items.${index}.description`}>Description *</Label>
                  <Input
                    {...register(`items.${index}.description`)}
                    placeholder="Product or service description"
                    disabled={isLoading}
                  />
                  {errors.items?.[index]?.description && (
                    <p className="text-sm text-red-600">
                      {errors.items[index]?.description?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`items.${index}.quantity`}>Quantity *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    disabled={isLoading}
                  />
                  {errors.items?.[index]?.quantity && (
                    <p className="text-sm text-red-600">
                      {errors.items[index]?.quantity?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`items.${index}.unitPrice`}>Unit Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                    disabled={isLoading}
                  />
                  {errors.items?.[index]?.unitPrice && (
                    <p className="text-sm text-red-600">
                      {errors.items[index]?.unitPrice?.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`items.${index}.taxRate`}>Tax Rate</Label>
                  <select
                    {...register(`items.${index}.taxRate`, { valueAsNumber: true })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isLoading}
                  >
                    <option value={0}>0% (Tax exempt)</option>
                    <option value={0.05}>5% (GST)</option>
                    <option value={0.13}>13% (HST)</option>
                    <option value={0.15}>15% (HST)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Line Total</Label>
                  <div className="flex h-9 items-center px-3 py-1 text-sm bg-muted rounded-md">
                    {formatCurrency(
                      ((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unitPrice || 0)) *
                      (1 + (watchedItems[index]?.taxRate || 0))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addLineItem}
            disabled={isLoading}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Line Item
          </Button>

          {errors.items && (
            <p className="text-sm text-red-600">{errors.items.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Quote Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>{formatCurrency(totals.taxAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>Notes and terms for this quote</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Internal Notes</Label>
            <textarea
              id="notes"
              {...register('notes')}
              disabled={isLoading}
              rows={3}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Internal notes (not visible to customer)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">Terms & Conditions</Label>
            <textarea
              id="terms"
              {...register('terms')}
              disabled={isLoading}
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Terms and conditions for this quote"
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {quote ? 'Update Quote' : 'Create Quote'}
        </Button>
      </div>
    </form>
  )
}