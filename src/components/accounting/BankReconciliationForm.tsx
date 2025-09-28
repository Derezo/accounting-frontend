import React, { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { X, Save, Loader2, Plus, Trash2, Upload, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Sheet } from '@/components/ui/sheet'
import { Table } from '@/components/ui/table'
import { useAccounts, useCreateBankReconciliation } from '@/hooks/useAccounting'
import { CreateBankReconciliationRequest, BankTransaction } from '@/types/accounting'
import { AccessibleFormField } from '@/components/accessibility'
import { cn } from '@/lib/utils'

const reconciliationSchema = z.object({
  accountId: z.string().min(1, 'Bank account is required'),
  reconciliationDate: z.string().min(1, 'Reconciliation date is required'),
  statementBalance: z.number().min(0, 'Statement balance must be positive'),
  bankTransactions: z.array(z.object({
    transactionDate: z.string().min(1, 'Transaction date is required'),
    description: z.string().min(1, 'Description is required'),
    amount: z.number().refine((val) => val !== 0, 'Amount cannot be zero'),
    type: z.enum(['DEBIT', 'CREDIT']),
    bankReference: z.string().min(1, 'Bank reference is required'),
    checkNumber: z.string().optional(),
    counterparty: z.string().optional()
  })).min(1, 'At least one bank transaction is required')
})

type ReconciliationFormData = z.infer<typeof reconciliationSchema>

interface BankReconciliationFormProps {
  open: boolean
  onClose: () => void
}

export function BankReconciliationForm({ open, onClose }: BankReconciliationFormProps) {
  const [csvData, setCsvData] = useState<string>('')
  const [importStep, setImportStep] = useState<'form' | 'import' | 'review'>('form')

  const { data: accountsData } = useAccounts({
    type: 'ASSET',
    subType: 'CURRENT_ASSET',
    status: 'ACTIVE'
  })
  const createReconciliation = useCreateBankReconciliation()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
    watch,
    setValue
  } = useForm<ReconciliationFormData>({
    resolver: zodResolver(reconciliationSchema),
    defaultValues: {
      accountId: '',
      reconciliationDate: new Date().toISOString().split('T')[0],
      statementBalance: 0,
      bankTransactions: []
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'bankTransactions'
  })

  const watchedTransactions = watch('bankTransactions')

  // Calculate transaction totals
  const totalCredits = watchedTransactions.reduce((sum, tx) =>
    sum + (tx.type === 'CREDIT' ? Math.abs(tx.amount || 0) : 0), 0
  )
  const totalDebits = watchedTransactions.reduce((sum, tx) =>
    sum + (tx.type === 'DEBIT' ? Math.abs(tx.amount || 0) : 0), 0
  )
  const netChange = totalCredits - totalDebits

  const onSubmit = async (data: ReconciliationFormData) => {
    try {
      const payload: CreateBankReconciliationRequest = {
        accountId: data.accountId,
        reconciliationDate: data.reconciliationDate,
        statementBalance: data.statementBalance,
        bankTransactions: data.bankTransactions.map(tx => ({
          accountId: data.accountId,
          transactionDate: tx.transactionDate,
          description: tx.description,
          amount: Math.abs(tx.amount),
          type: tx.type,
          bankReference: tx.bankReference,
          checkNumber: tx.checkNumber || undefined,
          counterparty: tx.counterparty || undefined,
          status: 'UNMATCHED' as const,
          organizationId: '', // Will be set by the API
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }))
      }

      await createReconciliation.mutateAsync(payload)
      onClose()
    } catch (error) {
      console.error('Failed to create bank reconciliation:', error)
    }
  }

  const handleClose = () => {
    reset()
    setImportStep('form')
    setCsvData('')
    onClose()
  }

  const addTransaction = () => {
    append({
      transactionDate: new Date().toISOString().split('T')[0],
      description: '',
      amount: 0,
      type: 'DEBIT',
      bankReference: '',
      checkNumber: '',
      counterparty: ''
    })
  }

  const removeTransaction = (index: number) => {
    remove(index)
  }

  const handleAmountChange = (index: number, value: string, type: 'DEBIT' | 'CREDIT') => {
    const amount = parseFloat(value) || 0
    setValue(`bankTransactions.${index}.amount`, amount)
    setValue(`bankTransactions.${index}.type`, type)
  }

  const parseCsvData = () => {
    if (!csvData.trim()) return

    const lines = csvData.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())

    // Expected CSV format: Date, Description, Amount, Reference, Check Number, Counterparty
    const transactions = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim())
      const amount = parseFloat(values[2]) || 0

      return {
        transactionDate: values[0] || new Date().toISOString().split('T')[0],
        description: values[1] || 'Bank transaction',
        amount: Math.abs(amount),
        type: amount >= 0 ? 'CREDIT' as const : 'DEBIT' as const,
        bankReference: values[3] || `REF-${Date.now()}`,
        checkNumber: values[4] || '',
        counterparty: values[5] || ''
      }
    }).filter(tx => tx.description && tx.amount > 0)

    // Clear existing transactions and add imported ones
    setValue('bankTransactions', transactions)
    setImportStep('review')
  }

  // Filter accounts to show only bank/cash accounts
  const bankAccounts = accountsData?.data?.filter(account =>
    account.name.toLowerCase().includes('cash') ||
    account.name.toLowerCase().includes('bank') ||
    account.name.toLowerCase().includes('checking') ||
    account.name.toLowerCase().includes('savings')
  ) || []

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <Sheet.Content className="w-full max-w-5xl">
        <Sheet.Header>
          <Sheet.Title>Create Bank Reconciliation</Sheet.Title>
          <Sheet.Description>
            Import bank statement transactions and start the reconciliation process
          </Sheet.Description>
        </Sheet.Header>

        <div className="mt-6">
          {importStep === 'form' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-3 gap-4">
                <AccessibleFormField
                  label="Bank Account"
                  error={errors.accountId?.message}
                  required
                >
                  <Select {...register('accountId')}>
                    <option value="">Select Bank Account</option>
                    {bankAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.code} - {account.name}
                      </option>
                    ))}
                  </Select>
                </AccessibleFormField>

                <AccessibleFormField
                  label="Reconciliation Date"
                  error={errors.reconciliationDate?.message}
                  required
                >
                  <Input
                    type="date"
                    {...register('reconciliationDate')}
                  />
                </AccessibleFormField>

                <AccessibleFormField
                  label="Statement Balance"
                  error={errors.statementBalance?.message}
                  required
                >
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('statementBalance', { valueAsNumber: true })}
                  />
                </AccessibleFormField>
              </div>

              {/* Import Options */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Import Bank Transactions</h3>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setImportStep('import')}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import CSV
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTransaction}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Manually
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </div>

              {/* Manual Transaction Entry */}
              {fields.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Bank Transactions</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3">Date</th>
                          <th className="text-left p-3">Description</th>
                          <th className="text-left p-3">Debit</th>
                          <th className="text-left p-3">Credit</th>
                          <th className="text-left p-3">Reference</th>
                          <th className="text-left p-3">Check #</th>
                          <th className="text-center p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fields.map((field, index) => (
                          <tr key={field.id} className="border-b">
                            <td className="p-3">
                              <Input
                                type="date"
                                {...register(`bankTransactions.${index}.transactionDate`)}
                                className="w-36"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                {...register(`bankTransactions.${index}.description`)}
                                placeholder="Transaction description"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                onChange={(e) => handleAmountChange(index, e.target.value, 'DEBIT')}
                                disabled={watchedTransactions[index]?.type === 'CREDIT'}
                                className="w-28"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                onChange={(e) => handleAmountChange(index, e.target.value, 'CREDIT')}
                                disabled={watchedTransactions[index]?.type === 'DEBIT'}
                                className="w-28"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                {...register(`bankTransactions.${index}.bankReference`)}
                                placeholder="Reference"
                                className="w-32"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                {...register(`bankTransactions.${index}.checkNumber`)}
                                placeholder="Check #"
                                className="w-24"
                              />
                            </td>
                            <td className="p-3 text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTransaction(index)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>

                    {/* Totals */}
                    <div className="bg-muted/25 p-3 border-t">
                      <div className="flex justify-end gap-8 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total Debits: </span>
                          <span className="font-medium">${totalDebits.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Credits: </span>
                          <span className="font-medium">${totalCredits.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Net Change: </span>
                          <span className={cn(
                            "font-medium",
                            netChange >= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            ${netChange.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {errors.bankTransactions?.root && (
                <p className="text-sm text-destructive">{errors.bankTransactions.root.message}</p>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || fields.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Reconciliation
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {importStep === 'import' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Import CSV Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Paste CSV data with columns: Date, Description, Amount, Reference, Check Number, Counterparty
                </p>
                <textarea
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder="Date,Description,Amount,Reference,Check Number,Counterparty
2024-01-15,Deposit,1000.00,DEP123,,Customer ABC
2024-01-16,Check Payment,-250.00,CHK456,1001,Vendor XYZ"
                  className="w-full h-64 p-3 border rounded-lg font-mono text-sm"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setImportStep('form')}>
                  Back
                </Button>
                <Button onClick={parseCsvData} disabled={!csvData.trim()}>
                  Parse CSV Data
                </Button>
              </div>
            </div>
          )}

          {importStep === 'review' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Review Imported Transactions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Review and edit the imported transactions before creating the reconciliation
                </p>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Description</th>
                      <th className="text-left p-3">Type</th>
                      <th className="text-right p-3">Amount</th>
                      <th className="text-left p-3">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {watchedTransactions.map((transaction, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3">{transaction.transactionDate}</td>
                        <td className="p-3">{transaction.description}</td>
                        <td className="p-3">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            transaction.type === 'CREDIT'
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          )}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="p-3 text-right">${Math.abs(transaction.amount).toFixed(2)}</td>
                        <td className="p-3">{transaction.bankReference}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setImportStep('import')}>
                  Back to Import
                </Button>
                <Button variant="outline" onClick={() => setImportStep('form')}>
                  Edit Manually
                </Button>
                <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Reconciliation
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Sheet.Content>
    </Sheet>
  )
}