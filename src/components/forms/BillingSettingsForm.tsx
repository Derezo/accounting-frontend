import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Save, DollarSign, Calendar, CreditCard } from 'lucide-react'

const billingSchema = z.object({
  // Default Settings
  defaultCurrency: z.string().default('CAD'),
  defaultPaymentTerms: z.number().min(0).max(365).default(30),
  defaultLateFee: z.number().min(0).max(100).default(0),

  // Invoice Settings
  invoicePrefix: z.string().default('INV'),
  invoiceNumberFormat: z.string().default('{PREFIX}-{YYYY}-{NNNN}'),
  invoiceFooter: z.string().optional(),

  // Quote Settings
  quotePrefix: z.string().default('QUO'),
  quoteValidityDays: z.number().min(1).max(365).default(30),

  // Payment Settings
  acceptedPaymentMethods: z.array(z.string()).default(['CASH', 'CHEQUE', 'ETRANSFER']),
  requireDepositForProjects: z.boolean().default(false),
  defaultDepositPercentage: z.number().min(0).max(100).default(50),

  // Auto-billing
  enableAutoBilling: z.boolean().default(false),
  autoBillDay: z.number().min(1).max(31).default(1),

  // Late Fees
  enableLateFees: z.boolean().default(false),
  lateFeeDays: z.number().min(1).max(365).default(30),
  lateFeeType: z.enum(['PERCENTAGE', 'FIXED']).default('PERCENTAGE'),

  // Discounts
  enableEarlyPaymentDiscount: z.boolean().default(false),
  earlyPaymentDays: z.number().min(1).max(365).default(10),
  earlyPaymentDiscountPercentage: z.number().min(0).max(100).default(2),
})

type BillingFormData = z.infer<typeof billingSchema>

interface BillingSettingsFormProps {
  initialData?: Partial<BillingFormData>
  onSave: (data: Partial<BillingFormData>) => Promise<void>
  onChange?: () => void
  isLoading?: boolean
}

const currencies = [
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
]

const paymentMethods = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'ETRANSFER', label: 'e-Transfer' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'DEBIT_CARD', label: 'Debit Card' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'PAYPAL', label: 'PayPal' },
  { value: 'STRIPE', label: 'Stripe' },
]

export function BillingSettingsForm({
  initialData,
  onSave,
  onChange,
  isLoading = false
}: BillingSettingsFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<BillingFormData>({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      defaultCurrency: 'CAD',
      defaultPaymentTerms: 30,
      defaultLateFee: 0,
      invoicePrefix: 'INV',
      invoiceNumberFormat: '{PREFIX}-{YYYY}-{NNNN}',
      quotePrefix: 'QUO',
      quoteValidityDays: 30,
      acceptedPaymentMethods: ['CASH', 'CHEQUE', 'ETRANSFER'],
      requireDepositForProjects: false,
      defaultDepositPercentage: 50,
      enableAutoBilling: false,
      autoBillDay: 1,
      enableLateFees: false,
      lateFeeDays: 30,
      lateFeeType: 'PERCENTAGE',
      enableEarlyPaymentDiscount: false,
      earlyPaymentDays: 10,
      earlyPaymentDiscountPercentage: 2,
      ...initialData,
    },
  })

  const enableLateFees = watch('enableLateFees')
  const enableEarlyPaymentDiscount = watch('enableEarlyPaymentDiscount')
  const requireDepositForProjects = watch('requireDepositForProjects')
  const enableAutoBilling = watch('enableAutoBilling')

  // Notify parent of changes
  useEffect(() => {
    if (isDirty && onChange) {
      onChange()
    }
  }, [isDirty, onChange])

  const onSubmit = async (data: BillingFormData) => {
    try {
      await onSave(data)
    } catch (error) {
      // Error is handled by parent
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Default Settings */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Default Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="defaultCurrency">Default Currency</Label>
            <Select onValueChange={(value) => setValue('defaultCurrency', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name} ({currency.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultPaymentTerms">Default Payment Terms (days)</Label>
            <Input
              id="defaultPaymentTerms"
              type="number"
              min="0"
              max="365"
              {...register('defaultPaymentTerms', { valueAsNumber: true })}
            />
            {errors.defaultPaymentTerms && (
              <p className="text-sm text-red-600">{errors.defaultPaymentTerms.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultLateFee">Default Late Fee (%)</Label>
            <Input
              id="defaultLateFee"
              type="number"
              min="0"
              max="100"
              step="0.1"
              {...register('defaultLateFee', { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Invoice Settings */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Invoice Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
            <Input
              id="invoicePrefix"
              placeholder="INV"
              {...register('invoicePrefix')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoiceNumberFormat">Invoice Number Format</Label>
            <Input
              id="invoiceNumberFormat"
              placeholder="{PREFIX}-{YYYY}-{NNNN}"
              {...register('invoiceNumberFormat')}
            />
            <p className="text-xs text-muted-foreground">
              Use {'{PREFIX}'}, {'{YYYY}'}, {'{MM}'}, {'{NNNN}'} as placeholders
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoiceFooter">Invoice Footer</Label>
          <Textarea
            id="invoiceFooter"
            placeholder="Thank you for your business!"
            {...register('invoiceFooter')}
          />
        </div>
      </div>

      <Separator />

      {/* Quote Settings */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Quote Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="quotePrefix">Quote Prefix</Label>
            <Input
              id="quotePrefix"
              placeholder="QUO"
              {...register('quotePrefix')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quoteValidityDays">Quote Validity (days)</Label>
            <Input
              id="quoteValidityDays"
              type="number"
              min="1"
              max="365"
              {...register('quoteValidityDays', { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Payment Settings */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Payment Settings</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Accepted Payment Methods</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {paymentMethods.map((method) => (
                <div key={method.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={method.value}
                    value={method.value}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={method.value} className="text-sm">
                    {method.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="requireDepositForProjects"
              {...register('requireDepositForProjects')}
              className="rounded border-gray-300"
            />
            <Label htmlFor="requireDepositForProjects" className="text-sm">
              Require deposit for projects
            </Label>
          </div>

          {requireDepositForProjects && (
            <div className="space-y-2 pl-6">
              <Label htmlFor="defaultDepositPercentage">Default Deposit Percentage</Label>
              <Input
                id="defaultDepositPercentage"
                type="number"
                min="0"
                max="100"
                {...register('defaultDepositPercentage', { valueAsNumber: true })}
              />
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Auto-billing */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Auto-billing</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enableAutoBilling"
              {...register('enableAutoBilling')}
              className="rounded border-gray-300"
            />
            <Label htmlFor="enableAutoBilling" className="text-sm">
              Enable automatic billing for recurring services
            </Label>
          </div>

          {enableAutoBilling && (
            <div className="space-y-2 pl-6">
              <Label htmlFor="autoBillDay">Auto-bill Day of Month</Label>
              <Input
                id="autoBillDay"
                type="number"
                min="1"
                max="31"
                {...register('autoBillDay', { valueAsNumber: true })}
              />
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Late Fees */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Late Fees</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enableLateFees"
              {...register('enableLateFees')}
              className="rounded border-gray-300"
            />
            <Label htmlFor="enableLateFees" className="text-sm">
              Enable late fees for overdue invoices
            </Label>
          </div>

          {enableLateFees && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-6">
              <div className="space-y-2">
                <Label htmlFor="lateFeeDays">Days before late fee</Label>
                <Input
                  id="lateFeeDays"
                  type="number"
                  min="1"
                  max="365"
                  {...register('lateFeeDays', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lateFeeType">Late Fee Type</Label>
                <Select onValueChange={(value) => setValue('lateFeeType', value as 'PERCENTAGE' | 'FIXED')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Early Payment Discount */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Early Payment Discount</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enableEarlyPaymentDiscount"
              {...register('enableEarlyPaymentDiscount')}
              className="rounded border-gray-300"
            />
            <Label htmlFor="enableEarlyPaymentDiscount" className="text-sm">
              Offer discount for early payment
            </Label>
          </div>

          {enableEarlyPaymentDiscount && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6">
              <div className="space-y-2">
                <Label htmlFor="earlyPaymentDays">Early payment period (days)</Label>
                <Input
                  id="earlyPaymentDays"
                  type="number"
                  min="1"
                  max="365"
                  {...register('earlyPaymentDays', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="earlyPaymentDiscountPercentage">Discount Percentage</Label>
                <Input
                  id="earlyPaymentDiscountPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  {...register('earlyPaymentDiscountPercentage', { valueAsNumber: true })}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6">
        <Button type="button" variant="outline">
          Reset
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !isDirty}
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Billing Settings'}
        </Button>
      </div>
    </form>
  )
}