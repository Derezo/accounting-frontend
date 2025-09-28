import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { X, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Sheet } from '@/components/ui/sheet'
import { useAccount, useAccounts, useCreateAccount, useUpdateAccount } from '@/hooks/useAccounting'
import { CreateAccountRequest, UpdateAccountRequest, AccountType, AccountSubType } from '@/types/accounting'
import { AccessibleFormField } from '@/components/accessibility'

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'ASSET', label: 'Asset' },
  { value: 'LIABILITY', label: 'Liability' },
  { value: 'EQUITY', label: 'Equity' },
  { value: 'REVENUE', label: 'Revenue' },
  { value: 'EXPENSE', label: 'Expense' }
]

const ACCOUNT_SUBTYPES: Record<AccountType, { value: AccountSubType; label: string }[]> = {
  ASSET: [
    { value: 'CURRENT_ASSET', label: 'Current Asset' },
    { value: 'FIXED_ASSET', label: 'Fixed Asset' },
    { value: 'OTHER_ASSET', label: 'Other Asset' }
  ],
  LIABILITY: [
    { value: 'CURRENT_LIABILITY', label: 'Current Liability' },
    { value: 'LONG_TERM_LIABILITY', label: 'Long-term Liability' },
    { value: 'OTHER_LIABILITY', label: 'Other Liability' }
  ],
  EQUITY: [
    { value: 'OWNERS_EQUITY', label: "Owner's Equity" },
    { value: 'RETAINED_EARNINGS', label: 'Retained Earnings' },
    { value: 'CAPITAL', label: 'Capital' }
  ],
  REVENUE: [
    { value: 'OPERATING_REVENUE', label: 'Operating Revenue' },
    { value: 'OTHER_REVENUE', label: 'Other Revenue' }
  ],
  EXPENSE: [
    { value: 'OPERATING_EXPENSE', label: 'Operating Expense' },
    { value: 'OTHER_EXPENSE', label: 'Other Expense' },
    { value: 'COST_OF_GOODS_SOLD', label: 'Cost of Goods Sold' }
  ]
}

const accountSchema = z.object({
  code: z.string().min(1, 'Account code is required').max(20, 'Account code must be 20 characters or less'),
  name: z.string().min(1, 'Account name is required').max(100, 'Account name must be 100 characters or less'),
  description: z.string().optional(),
  type: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']),
  subType: z.string().min(1, 'Account subtype is required'),
  parentAccountId: z.string().optional(),
  statementSection: z.string().optional(),
  allowTransactions: z.boolean().default(true),
  requireSubAccounts: z.boolean().default(false),
  taxDeductible: z.boolean().optional()
})

type AccountFormData = z.infer<typeof accountSchema>

interface AccountFormProps {
  accountId?: string | null
  open: boolean
  onClose: () => void
}

export function AccountForm({ accountId, open, onClose }: AccountFormProps) {
  const isEditing = !!accountId
  const { data: account } = useAccount(accountId || '')
  const { data: accountsData } = useAccounts()
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      allowTransactions: true,
      requireSubAccounts: false
    }
  })

  const watchedType = watch('type')

  // Reset form when account data loads
  useEffect(() => {
    if (account && isEditing) {
      reset({
        code: account.code,
        name: account.name,
        description: account.description || '',
        type: account.type,
        subType: account.subType,
        parentAccountId: account.parentAccountId || '',
        statementSection: account.statementSection || '',
        allowTransactions: account.allowTransactions,
        requireSubAccounts: account.requireSubAccounts,
        taxDeductible: account.taxDeductible || false
      })
    } else if (!isEditing) {
      reset({
        code: '',
        name: '',
        description: '',
        type: 'ASSET',
        subType: 'CURRENT_ASSET',
        parentAccountId: '',
        statementSection: '',
        allowTransactions: true,
        requireSubAccounts: false,
        taxDeductible: false
      })
    }
  }, [account, isEditing, reset])

  // Update subtype options when type changes
  useEffect(() => {
    if (watchedType && ACCOUNT_SUBTYPES[watchedType]?.[0]) {
      setValue('subType', ACCOUNT_SUBTYPES[watchedType][0].value)
    }
  }, [watchedType, setValue])

  const onSubmit = async (data: AccountFormData) => {
    try {
      const payload: CreateAccountRequest | UpdateAccountRequest = {
        ...data,
        subType: data.subType as AccountSubType,
        parentAccountId: data.parentAccountId || undefined,
        statementSection: data.statementSection || undefined
      }

      if (isEditing && accountId) {
        await updateAccount.mutateAsync({ accountId, data: payload })
      } else {
        await createAccount.mutateAsync(payload as CreateAccountRequest)
      }
      onClose()
    } catch (error) {
      console.error('Failed to save account:', error)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  // Get potential parent accounts (exclude current account and its children)
  const parentAccountOptions = accountsData?.data?.filter(acc =>
    acc.id !== accountId &&
    acc.status === 'ACTIVE' &&
    acc.allowTransactions // Only allow parent accounts that allow transactions
  ) || []

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <Sheet.Content className="w-full max-w-2xl">
        <Sheet.Header>
          <Sheet.Title>
            {isEditing ? 'Edit Account' : 'Create New Account'}
          </Sheet.Title>
          <Sheet.Description>
            {isEditing
              ? 'Update the account information below.'
              : 'Fill in the details to create a new account in your chart of accounts.'
            }
          </Sheet.Description>
        </Sheet.Header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <AccessibleFormField
              label="Account Code"
              error={errors.code?.message}
              required
            >
              <Input
                {...register('code')}
                placeholder="e.g., 1000"
                className="font-mono"
              />
            </AccessibleFormField>

            <AccessibleFormField
              label="Account Name"
              error={errors.name?.message}
              required
            >
              <Input
                {...register('name')}
                placeholder="e.g., Cash and Cash Equivalents"
              />
            </AccessibleFormField>
          </div>

          <AccessibleFormField
            label="Description"
            error={errors.description?.message}
          >
            <Textarea
              {...register('description')}
              placeholder="Optional description for this account"
              rows={3}
            />
          </AccessibleFormField>

          <div className="grid grid-cols-2 gap-4">
            <AccessibleFormField
              label="Account Type"
              error={errors.type?.message}
              required
            >
              <Select {...register('type')}>
                {ACCOUNT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </AccessibleFormField>

            <AccessibleFormField
              label="Account Subtype"
              error={errors.subType?.message}
              required
            >
              <Select {...register('subType')}>
                {watchedType && ACCOUNT_SUBTYPES[watchedType]?.map((subtype) => (
                  <option key={subtype.value} value={subtype.value}>
                    {subtype.label}
                  </option>
                ))}
              </Select>
            </AccessibleFormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <AccessibleFormField
              label="Parent Account"
              error={errors.parentAccountId?.message}
            >
              <Select {...register('parentAccountId')}>
                <option value="">No Parent Account</option>
                {parentAccountOptions.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </option>
                ))}
              </Select>
            </AccessibleFormField>

            <AccessibleFormField
              label="Statement Section"
              error={errors.statementSection?.message}
            >
              <Input
                {...register('statementSection')}
                placeholder="e.g., Current Assets"
              />
            </AccessibleFormField>
          </div>

          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-medium">Account Settings</h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <Checkbox {...register('allowTransactions')} />
                <div>
                  <div className="font-medium">Allow Transactions</div>
                  <div className="text-sm text-muted-foreground">
                    Allow journal entries to be posted to this account
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <Checkbox {...register('requireSubAccounts')} />
                <div>
                  <div className="font-medium">Require Sub-accounts</div>
                  <div className="text-sm text-muted-foreground">
                    Transactions must be posted to sub-accounts only
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <Checkbox {...register('taxDeductible')} />
                <div>
                  <div className="font-medium">Tax Deductible</div>
                  <div className="text-sm text-muted-foreground">
                    Expenses in this account are tax deductible
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update Account' : 'Create Account'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Sheet.Content>
    </Sheet>
  )
}