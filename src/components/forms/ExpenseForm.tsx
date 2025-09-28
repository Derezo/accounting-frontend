import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X, Upload, DollarSign, Calendar, Save, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Sheet } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { useCreateExpense, useUpdateExpense, useSubmitExpense, useExpenseCategories } from '@/hooks/useExpenses'
import { CreateExpenseRequest, PaymentMethod, ExpenseLineItem } from '@/types/expenses'
import { FileUpload } from '@/components/forms/FileUpload'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const expenseLineSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  categoryId: z.string().min(1, 'Category is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  quantity: z.number().optional(),
  unitPrice: z.number().optional(),
  taxAmount: z.number().optional(),
  notes: z.string().optional(),
})

const expenseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  expenseDate: z.string().min(1, 'Expense date is required'),
  paymentMethod: z.enum(['PERSONAL_CREDIT_CARD', 'CORPORATE_CARD', 'CASH', 'CHECK', 'BANK_TRANSFER']),
  currency: z.string().default('USD'),
  exchangeRate: z.number().optional(),
  lineItems: z.array(expenseLineSchema).min(1, 'At least one line item is required'),
  projectId: z.string().optional(),
  clientId: z.string().optional(),
  billable: z.boolean().default(false),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

interface ExpenseFormProps {
  open: boolean
  onClose: () => void
  expenseId?: string
  initialData?: Partial<ExpenseFormData>
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'PERSONAL_CREDIT_CARD', label: 'Personal Credit Card' },
  { value: 'CORPORATE_CARD', label: 'Corporate Card' },
  { value: 'CASH', label: 'Cash' },
  { value: 'CHECK', label: 'Check' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
]

export function ExpenseForm({ open, onClose, expenseId, initialData }: ExpenseFormProps) {
  const [submitAndSend, setSubmitAndSend] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const { data: categories = [] } = useExpenseCategories()
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()
  const submitExpense = useSubmitExpense()

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: '',
      description: '',
      expenseDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'PERSONAL_CREDIT_CARD',
      currency: 'USD',
      lineItems: [
        {
          description: '',
          categoryId: '',
          amount: 0,
          quantity: 1,
          notes: '',
        }
      ],
      billable: false,
      ...initialData,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lineItems',
  })

  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    }
  }, [initialData, form])

  const watchedLineItems = form.watch('lineItems')
  const subtotal = watchedLineItems.reduce((sum, item) => sum + (item.amount || 0), 0)
  const taxTotal = watchedLineItems.reduce((sum, item) => sum + (item.taxAmount || 0), 0)
  const total = subtotal + taxTotal

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      let expense

      if (expenseId) {
        // Update existing expense
        expense = await updateExpense.mutateAsync({
          id: expenseId,
          data: data as CreateExpenseRequest,
        })
      } else {
        // Create new expense
        expense = await createExpense.mutateAsync(data as CreateExpenseRequest)
      }

      // If submitAndSend is true, also submit the expense for approval
      if (submitAndSend && expense) {
        await submitExpense.mutateAsync(expense.id)
        toast.success('Expense created and submitted for approval!')
      } else {
        toast.success(expenseId ? 'Expense updated successfully!' : 'Expense saved as draft!')
      }

      onClose()
    } catch (error) {
      console.error('Failed to save expense:', error)
      toast.error('Failed to save expense. Please try again.')
    }
  }

  const addLineItem = () => {
    append({
      description: '',
      categoryId: '',
      amount: 0,
      quantity: 1,
      notes: '',
    })
  }

  const removeLineItem = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <Sheet.Content className="w-full max-w-4xl">
        <Sheet.Header>
          <Sheet.Title>
            {expenseId ? 'Edit Expense' : 'New Expense'}
          </Sheet.Title>
          <Sheet.Description>
            {expenseId ? 'Update expense details and line items' : 'Create a new expense report with receipts and supporting documentation'}
          </Sheet.Description>
        </Sheet.Header>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...form.register('title')}
                  placeholder="Business lunch with client"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expenseDate">Expense Date *</Label>
                <Input
                  id="expenseDate"
                  type="date"
                  {...form.register('expenseDate')}
                />
                {form.formState.errors.expenseDate && (
                  <p className="text-sm text-destructive">{form.formState.errors.expenseDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select
                  value={form.watch('paymentMethod')}
                  onValueChange={(value) => form.setValue('paymentMethod', value as PaymentMethod)}
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={form.watch('currency')}
                  onValueChange={(value) => form.setValue('currency', value)}
                >
                  <option value="USD">USD</option>
                  <option value="CAD">CAD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="Additional details about this expense..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="billable"
                checked={form.watch('billable')}
                onCheckedChange={(checked) => form.setValue('billable', checked as boolean)}
              />
              <Label htmlFor="billable">This expense is billable to a client</Label>
            </div>
          </div>

          <Separator />

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Expense Items</h3>
              <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Item {index + 1}</span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                        className="text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Description *</Label>
                      <Input
                        {...form.register(`lineItems.${index}.description`)}
                        placeholder="Lunch at restaurant"
                      />
                      {form.formState.errors.lineItems?.[index]?.description && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.lineItems[index]?.description?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select
                        value={form.watch(`lineItems.${index}.categoryId`)}
                        onValueChange={(value) => form.setValue(`lineItems.${index}.categoryId`, value)}
                      >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Select>
                      {form.formState.errors.lineItems?.[index]?.categoryId && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.lineItems[index]?.categoryId?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Amount *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...form.register(`lineItems.${index}.amount`, { valueAsNumber: true })}
                        placeholder="0.00"
                      />
                      {form.formState.errors.lineItems?.[index]?.amount && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.lineItems[index]?.amount?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        {...form.register(`lineItems.${index}.quantity`, { valueAsNumber: true })}
                        placeholder="1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tax Amount</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...form.register(`lineItems.${index}.taxAmount`, { valueAsNumber: true })}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Input
                        {...form.register(`lineItems.${index}.notes`)}
                        placeholder="Additional notes"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Summary */}
            <div className="bg-muted/25 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax Total:</span>
                <span>${taxTotal.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Attachments */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Receipts & Attachments</h3>

            <FileUpload
              onFilesSelect={handleFileUpload}
              accept="image/*,.pdf"
              multiple
              maxSize={10 * 1024 * 1024} // 10MB
            />

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Files</Label>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="submitAndSend"
                checked={submitAndSend}
                onCheckedChange={(checked) => setSubmitAndSend(checked as boolean)}
              />
              <Label htmlFor="submitAndSend">Submit for approval after saving</Label>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createExpense.isPending || updateExpense.isPending || submitExpense.isPending}
              >
                {submitAndSend ? (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Save & Submit
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Sheet.Content>
    </Sheet>
  )
}