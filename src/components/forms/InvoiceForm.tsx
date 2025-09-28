import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Loader2, Plus, Trash2, FileText, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCreateInvoice, useCustomers, useQuotes } from '@/hooks/useAPI'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Invoice, Customer, Quote } from '@/types/api'

const invoiceLineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  taxRate: z.number().min(0).max(1, 'Tax rate must be between 0 and 1'),
})

const invoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  quoteId: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  items: z.array(invoiceLineItemSchema).min(1, 'At least one line item is required'),
  notes: z.string().optional(),
  terms: z.string().optional(),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

interface InvoiceFormProps {
  invoice?: Invoice
  onSuccess?: () => void
  onCancel?: () => void
}

export function InvoiceForm({ invoice, onSuccess, onCancel }: InvoiceFormProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    invoice?.customer || null
  )
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(
    invoice?.quote || null
  )

  const createInvoice = useCreateInvoice()
  const { data: customersData } = useCustomers({ limit: 100 })
  const { data: quotesData } = useQuotes({
    status: 'APPROVED',
    customerId: selectedCustomer?.id,
    limit: 50
  })

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerId: invoice?.customerId || '',
      quoteId: invoice?.quoteId || '',
      dueDate: invoice?.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
      items: invoice?.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
      })) || [
        {
          description: '',
          quantity: 1,
          unitPrice: 0,
          taxRate: 0.13,
        }
      ],
      notes: invoice?.notes || '',
      terms: invoice?.terms || 'Payment due within 30 days of invoice date.',
    },
  })

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'items',
  })

  const watchedItems = watch('items')
  const watchedQuoteId = watch('quoteId')

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

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      const payload = {
        customerId: data.customerId,
        quoteId: data.quoteId || undefined,
        dueDate: new Date(data.dueDate).toISOString(),
        items: data.items,
        notes: data.notes || undefined,
        terms: data.terms || undefined,
      }

      await createInvoice.mutateAsync(payload)
      onSuccess?.()
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  }

  const handleCustomerChange = (customerId: string) => {
    setValue('customerId', customerId)
    const customer = customersData?.data.find(c => c.id === customerId)
    setSelectedCustomer(customer || null)

    // Clear quote selection when customer changes
    setValue('quoteId', '')
    setSelectedQuote(null)
  }

  const handleQuoteChange = (quoteId: string) => {
    setValue('quoteId', quoteId)
    const quote = quotesData?.data.find(q => q.id === quoteId)
    setSelectedQuote(quote || null)

    // If a quote is selected, populate line items from quote
    if (quote) {
      replace(quote.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
      })))

      // Set due date to 30 days from now if not already set
      if (!watch('dueDate')) {
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + 30)
        setValue('dueDate', dueDate.toISOString().split('T')[0])
      }
    }
  }

  const addLineItem = () => {
    append({
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0.13,
    })
  }

  const isLoading = createInvoice.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Invoice Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Invoice Information</span>
          </CardTitle>
          <CardDescription>
            {invoice ? 'View invoice details' : 'Create a new invoice from scratch or from an approved quote'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label htmlFor="customerId">Customer *</Label>
            <select
              {...register('customerId')}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading || !!invoice}
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

          {/* Quote Selection */}
          {selectedCustomer && !invoice && (
            <div className="space-y-2">
              <Label htmlFor="quoteId">Source Quote (Optional)</Label>
              <select
                {...register('quoteId')}
                onChange={(e) => handleQuoteChange(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              >
                <option value="">Create invoice manually</option>
                {quotesData?.data.map((quote) => (
                  <option key={quote.id} value={quote.id}>
                    {quote.quoteNumber} - {formatCurrency(quote.total)} (Valid until {formatDate(quote.validUntil)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="date"
              {...register('dueDate')}
              disabled={isLoading || !!invoice}
            />
            {errors.dueDate && (
              <p className="text-sm text-red-600">{errors.dueDate.message}</p>
            )}
          </div>

          {/* Customer Info Display */}
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
                  <p className="text-xs text-muted-foreground">
                    Payment Terms: {selectedCustomer.paymentTerms} days
                  </p>
                </div>
                <Badge variant="outline">{selectedCustomer.tier}</Badge>
              </div>
            </div>
          )}

          {/* Quote Info Display */}
          {selectedQuote && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Converting from Quote: {selectedQuote.quoteNumber}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Quote Total: {formatCurrency(selectedQuote.total)} • {selectedQuote.items.length} items
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Line Items */}
      {!invoice && (
        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
            <CardDescription>
              {selectedQuote ? 'Items from the selected quote' : 'Add products or services to this invoice'}
            </CardDescription>
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

            {!selectedQuote && (
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
            )}

            {errors.items && (
              <p className="text-sm text-red-600">{errors.items.message}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Invoice Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Invoice Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoice ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatCurrency(invoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between text-green-600">
                  <span>Amount Paid:</span>
                  <span>{formatCurrency(invoice.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-orange-600 font-medium">
                  <span>Amount Due:</span>
                  <span>{formatCurrency(invoice.amountDue)}</span>
                </div>
              </div>
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>

      {/* Additional Information */}
      {!invoice && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Notes and terms for this invoice</CardDescription>
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
                placeholder="Terms and conditions for this invoice"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Actions */}
      {!invoice && (
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Invoice
          </Button>
        </div>
      )}
    </form>
  )
}