import React, { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { X, Save, Loader2, Plus, Trash2, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Sheet } from '@/components/ui/sheet'
import { useJournalEntry, useAccounts, useCreateJournalEntry, useUpdateJournalEntry, useValidateJournalEntry } from '@/hooks/useAccounting'
import { CreateJournalEntryRequest, UpdateJournalEntryRequest, JournalEntryType } from '@/types/accounting'
import { AccessibleFormField } from '@/components/accessibility'
import { cn } from '@/lib/utils'

const ENTRY_TYPES: { value: JournalEntryType; label: string }[] = [
  { value: 'STANDARD', label: 'Standard Entry' },
  { value: 'ADJUSTING', label: 'Adjusting Entry' },
  { value: 'CLOSING', label: 'Closing Entry' },
  { value: 'REVERSING', label: 'Reversing Entry' }
]

const journalEntrySchema = z.object({
  date: z.string().min(1, 'Date is required'),
  type: z.enum(['STANDARD', 'ADJUSTING', 'CLOSING', 'REVERSING']),
  description: z.string().min(1, 'Description is required').max(255, 'Description must be 255 characters or less'),
  reference: z.string().optional(),
  lines: z.array(z.object({
    accountId: z.string().min(1, 'Account is required'),
    description: z.string().min(1, 'Line description is required'),
    debitAmount: z.number().min(0, 'Debit amount must be positive'),
    creditAmount: z.number().min(0, 'Credit amount must be positive'),
    reference: z.string().optional()
  })).min(2, 'At least 2 lines are required')
    .refine((lines) => {
      return lines.every(line =>
        (line.debitAmount > 0 && line.creditAmount === 0) ||
        (line.creditAmount > 0 && line.debitAmount === 0)
      )
    }, { message: 'Each line must have either a debit or credit amount, but not both' })
})

type JournalEntryFormData = z.infer<typeof journalEntrySchema>

interface JournalEntryFormProps {
  entryId?: string | null
  open: boolean
  onClose: () => void
}

export function JournalEntryForm({ entryId, open, onClose }: JournalEntryFormProps) {
  const isEditing = !!entryId
  const { data: entry } = useJournalEntry(entryId || '')
  const { data: accountsData } = useAccounts({ status: 'ACTIVE', allowTransactions: true })
  const createEntry = useCreateJournalEntry()
  const updateEntry = useUpdateJournalEntry()
  const validateEntry = useValidateJournalEntry()

  const [validationResult, setValidationResult] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    control,
    setValue
  } = useForm<JournalEntryFormData>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: 'STANDARD',
      description: '',
      reference: '',
      lines: [
        { accountId: '', description: '', debitAmount: 0, creditAmount: 0, reference: '' },
        { accountId: '', description: '', debitAmount: 0, creditAmount: 0, reference: '' }
      ]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines'
  })

  const watchedLines = watch('lines')

  // Calculate totals
  const totalDebits = watchedLines.reduce((sum, line) => sum + (line.debitAmount || 0), 0)
  const totalCredits = watchedLines.reduce((sum, line) => sum + (line.creditAmount || 0), 0)
  const isBalanced = totalDebits === totalCredits && totalDebits > 0

  // Reset form when entry data loads
  useEffect(() => {
    if (entry && isEditing) {
      reset({
        date: entry.date.split('T')[0],
        type: entry.type,
        description: entry.description,
        reference: entry.reference || '',
        lines: entry.lines.map(line => ({
          accountId: line.accountId,
          description: line.description,
          debitAmount: line.debitAmount,
          creditAmount: line.creditAmount,
          reference: line.reference || ''
        }))
      })
    }
  }, [entry, isEditing, reset])

  // Validate entry in real-time
  useEffect(() => {
    const subscription = watch(async (data) => {
      if (data.lines && data.lines.length >= 2) {
        try {
          const result = await validateEntry.mutateAsync({
            date: data.date || '',
            type: (data.type as JournalEntryType) || 'STANDARD',
            description: data.description || '',
            reference: data.reference,
            lines: data.lines.map(line => ({
              accountId: line?.accountId || '',
              description: line?.description || '',
              debitAmount: line?.debitAmount || 0,
              creditAmount: line?.creditAmount || 0,
              reference: line?.reference
            }))
          })
          setValidationResult(result)
        } catch (error) {
          // Ignore validation errors during typing
          setValidationResult(null)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [watch, validateEntry])

  const onSubmit = async (data: JournalEntryFormData) => {
    try {
      const payload: CreateJournalEntryRequest | UpdateJournalEntryRequest = {
        ...data,
        lines: data.lines.map(line => ({
          accountId: line.accountId,
          description: line.description,
          debitAmount: line.debitAmount,
          creditAmount: line.creditAmount,
          reference: line.reference || undefined
        }))
      }

      if (isEditing && entryId) {
        await updateEntry.mutateAsync({ entryId, data: payload })
      } else {
        await createEntry.mutateAsync(payload as CreateJournalEntryRequest)
      }
      onClose()
    } catch (error) {
      console.error('Failed to save journal entry:', error)
    }
  }

  const handleClose = () => {
    reset()
    setValidationResult(null)
    onClose()
  }

  const addLine = () => {
    append({ accountId: '', description: '', debitAmount: 0, creditAmount: 0, reference: '' })
  }

  const removeLine = (index: number) => {
    if (fields.length > 2) {
      remove(index)
    }
  }

  const handleAmountChange = (index: number, type: 'debit' | 'credit', value: string) => {
    const amount = parseFloat(value) || 0
    if (type === 'debit') {
      setValue(`lines.${index}.debitAmount`, amount)
      setValue(`lines.${index}.creditAmount`, 0)
    } else {
      setValue(`lines.${index}.creditAmount`, amount)
      setValue(`lines.${index}.debitAmount`, 0)
    }
  }

  const accounts = accountsData?.data || []

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <Sheet.Content className="w-full max-w-4xl">
        <Sheet.Header>
          <Sheet.Title>
            {isEditing ? 'Edit Journal Entry' : 'Create New Journal Entry'}
          </Sheet.Title>
          <Sheet.Description>
            {isEditing
              ? 'Update the journal entry details below.'
              : 'Record a new financial transaction through journal entries.'
            }
          </Sheet.Description>
        </Sheet.Header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          {/* Entry Header */}
          <div className="grid grid-cols-3 gap-4">
            <AccessibleFormField
              label="Date"
              error={errors.date?.message}
              required
            >
              <Input
                type="date"
                {...register('date')}
              />
            </AccessibleFormField>

            <AccessibleFormField
              label="Entry Type"
              error={errors.type?.message}
              required
            >
              <Select {...register('type')}>
                {ENTRY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </AccessibleFormField>

            <AccessibleFormField
              label="Reference"
              error={errors.reference?.message}
            >
              <Input
                {...register('reference')}
                placeholder="Optional reference"
              />
            </AccessibleFormField>
          </div>

          <AccessibleFormField
            label="Description"
            error={errors.description?.message}
            required
          >
            <Textarea
              {...register('description')}
              placeholder="Describe this journal entry"
              rows={2}
            />
          </AccessibleFormField>

          {/* Journal Lines */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Journal Lines</h3>
              <Button type="button" variant="outline" size="sm" onClick={addLine}>
                <Plus className="h-4 w-4 mr-2" />
                Add Line
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/50 p-3 grid grid-cols-12 gap-2 text-sm font-medium">
                <div className="col-span-3">Account</div>
                <div className="col-span-3">Description</div>
                <div className="col-span-2">Debit</div>
                <div className="col-span-2">Credit</div>
                <div className="col-span-1">Reference</div>
                <div className="col-span-1">Actions</div>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="p-3 border-t grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-3">
                    <Select {...register(`lines.${index}.accountId`)}>
                      <option value="">Select Account</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                    </Select>
                    {errors.lines?.[index]?.accountId && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.lines[index]?.accountId?.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-3">
                    <Input
                      {...register(`lines.${index}.description`)}
                      placeholder="Line description"
                    />
                    {errors.lines?.[index]?.description && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.lines[index]?.description?.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      onChange={(e) => handleAmountChange(index, 'debit', e.target.value)}
                      value={watchedLines[index]?.debitAmount || ''}
                    />
                  </div>

                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      onChange={(e) => handleAmountChange(index, 'credit', e.target.value)}
                      value={watchedLines[index]?.creditAmount || ''}
                    />
                  </div>

                  <div className="col-span-1">
                    <Input
                      {...register(`lines.${index}.reference`)}
                      placeholder="Ref"
                      className="text-xs"
                    />
                  </div>

                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLine(index)}
                      disabled={fields.length <= 2}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Totals Row */}
              <div className="bg-muted/25 p-3 border-t">
                <div className="grid grid-cols-12 gap-2 items-center font-medium">
                  <div className="col-span-6 text-right">Totals:</div>
                  <div className={cn(
                    "col-span-2 text-right",
                    !isBalanced && totalDebits > 0 && "text-destructive"
                  )}>
                    ${totalDebits.toFixed(2)}
                  </div>
                  <div className={cn(
                    "col-span-2 text-right",
                    !isBalanced && totalCredits > 0 && "text-destructive"
                  )}>
                    ${totalCredits.toFixed(2)}
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    {isBalanced ? (
                      <span className="text-green-600 text-sm">Balanced</span>
                    ) : (
                      <span className="text-destructive text-sm">
                        Diff: ${Math.abs(totalDebits - totalCredits).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {errors.lines?.root && (
              <p className="text-sm text-destructive">{errors.lines.root.message}</p>
            )}
          </div>

          {/* Validation Results */}
          {validationResult && (
            <div className={cn(
              "p-4 rounded-lg border",
              validationResult.isValid
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <div className="font-medium">
                  {validationResult.isValid ? 'Valid Entry' : 'Invalid Entry'}
                </div>
                {validationResult.isBalanced ? (
                  <span className="text-green-600">• Balanced</span>
                ) : (
                  <span className="text-red-600">• Unbalanced</span>
                )}
              </div>
              {validationResult.errors?.length > 0 && (
                <ul className="text-sm space-y-1">
                  {validationResult.errors.map((error: string, i: number) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              )}
              {validationResult.warnings?.length > 0 && (
                <ul className="text-sm space-y-1 text-yellow-600 mt-2">
                  {validationResult.warnings.map((warning: string, i: number) => (
                    <li key={i}>⚠ {warning}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isBalanced}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update Entry' : 'Create Entry'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Sheet.Content>
    </Sheet>
  )
}