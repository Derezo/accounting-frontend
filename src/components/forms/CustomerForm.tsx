import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/useAPI'
import { Customer, CustomerType, CustomerTier, BusinessType } from '@/types/api'

const customerSchema = z.object({
  type: z.enum(['PERSON', 'BUSINESS']),
  tier: z.enum(['PERSONAL', 'SMALL_BUSINESS', 'ENTERPRISE', 'EMERGENCY']).optional(),

  // Person fields
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dateOfBirth: z.string().optional(),

  // Business fields
  businessName: z.string().optional(),
  legalName: z.string().optional(),
  businessNumber: z.string().optional(),
  taxNumber: z.string().optional(),
  businessType: z.enum(['SOLE_PROPRIETORSHIP', 'PARTNERSHIP', 'CORPORATION', 'LLC', 'NON_PROFIT', 'GOVERNMENT']).optional(),

  // Contact fields
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),

  // Address fields
  street: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),

  // Financial settings
  creditLimit: z.number().optional(),
  paymentTerms: z.number().min(1).optional(),
  taxExempt: z.boolean().optional(),

  // Metadata
  notes: z.string().optional(),
  tags: z.string().optional(), // Comma-separated tags
}).refine((data) => {
  if (data.type === 'PERSON') {
    return data.firstName && data.lastName
  } else {
    return data.businessName
  }
}, {
  message: "Required fields missing for customer type",
  path: ["type"]
})

type CustomerFormData = z.infer<typeof customerSchema>

interface CustomerFormProps {
  customer?: Customer
  onSuccess?: () => void
  onCancel?: () => void
}

export function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const [customerType, setCustomerType] = useState<CustomerType>(customer?.type || 'PERSON')

  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      type: customer?.type || 'PERSON',
      tier: customer?.tier,
      firstName: customer?.person?.firstName || '',
      lastName: customer?.person?.lastName || '',
      dateOfBirth: customer?.person?.dateOfBirth || '',
      businessName: customer?.business?.businessName || '',
      legalName: customer?.business?.legalName || '',
      businessNumber: customer?.business?.businessNumber || '',
      taxNumber: customer?.business?.taxNumber || '',
      businessType: customer?.business?.businessType,
      email: customer?.email || '',
      phone: customer?.phone || '',
      website: customer?.website || '',
      street: customer?.address?.street || '',
      city: customer?.address?.city || '',
      province: customer?.address?.province || '',
      postalCode: customer?.address?.postalCode || '',
      country: customer?.address?.country || 'Canada',
      creditLimit: customer?.creditLimit,
      paymentTerms: customer?.paymentTerms || 15,
      taxExempt: customer?.taxExempt || false,
      notes: customer?.notes || '',
      tags: customer?.tags?.join(', ') || '',
    },
  })

  const watchedType = watch('type')

  const onSubmit = async (data: CustomerFormData) => {
    try {
      const payload = {
        type: data.type,
        tier: data.tier,
        email: data.email || undefined,
        phone: data.phone || undefined,
        website: data.website || undefined,
        person: data.type === 'PERSON' ? {
          firstName: data.firstName!,
          lastName: data.lastName!,
          dateOfBirth: data.dateOfBirth || undefined,
        } : undefined,
        business: data.type === 'BUSINESS' ? {
          businessName: data.businessName!,
          legalName: data.legalName || undefined,
          businessNumber: data.businessNumber || undefined,
          taxNumber: data.taxNumber || undefined,
          businessType: data.businessType!,
        } : undefined,
        address: (data.street || data.city || data.province || data.postalCode) ? {
          street: data.street || '',
          city: data.city || '',
          province: data.province || '',
          postalCode: data.postalCode || '',
          country: data.country || 'Canada',
        } : undefined,
        creditLimit: data.creditLimit,
        paymentTerms: data.paymentTerms || 15,
        taxExempt: data.taxExempt || false,
        notes: data.notes || undefined,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      }

      if (customer) {
        await updateCustomer.mutateAsync({
          customerId: customer.id,
          data: payload,
        })
      } else {
        await createCustomer.mutateAsync(payload)
      }

      onSuccess?.()
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  }

  const isLoading = createCustomer.isPending || updateCustomer.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Customer Type & Tier */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Customer Type</Label>
          <select
            {...register('type')}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            onChange={(e) => {
              const newType = e.target.value as CustomerType
              setCustomerType(newType)
              setValue('type', newType)
            }}
          >
            <option value="PERSON">Individual Person</option>
            <option value="BUSINESS">Business Entity</option>
          </select>
          {errors.type && (
            <p className="text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tier">Customer Tier</Label>
          <select
            {...register('tier')}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="PERSONAL">Personal</option>
            <option value="SMALL_BUSINESS">Small Business</option>
            <option value="ENTERPRISE">Enterprise</option>
            <option value="EMERGENCY">Emergency</option>
          </select>
        </div>
      </div>

      {/* Person Information */}
      {watchedType === 'PERSON' && (
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Individual customer details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  disabled={isLoading}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  disabled={isLoading}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register('dateOfBirth')}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Information */}
      {watchedType === 'BUSINESS' && (
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Business entity details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                {...register('businessName')}
                disabled={isLoading}
              />
              {errors.businessName && (
                <p className="text-sm text-red-600">{errors.businessName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="legalName">Legal Name</Label>
              <Input
                id="legalName"
                {...register('legalName')}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessNumber">Business Number</Label>
                <Input
                  id="businessNumber"
                  {...register('businessNumber')}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxNumber">Tax Number</Label>
                <Input
                  id="taxNumber"
                  {...register('taxNumber')}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <select
                {...register('businessType')}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="SOLE_PROPRIETORSHIP">Sole Proprietorship</option>
                <option value="PARTNERSHIP">Partnership</option>
                <option value="CORPORATION">Corporation</option>
                <option value="LLC">LLC</option>
                <option value="NON_PROFIT">Non-Profit</option>
                <option value="GOVERNMENT">Government</option>
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>How to reach this customer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register('phone')}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              {...register('website')}
              disabled={isLoading}
            />
            {errors.website && (
              <p className="text-sm text-red-600">{errors.website.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle>Address</CardTitle>
          <CardDescription>Physical location information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              {...register('street')}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                {...register('city')}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">Province/State</Label>
              <Input
                id="province"
                {...register('province')}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                {...register('postalCode')}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                {...register('country')}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Settings</CardTitle>
          <CardDescription>Payment terms and credit information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="creditLimit">Credit Limit ($)</Label>
              <Input
                id="creditLimit"
                type="number"
                step="0.01"
                {...register('creditLimit', { valueAsNumber: true })}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Payment Terms (days)</Label>
              <Input
                id="paymentTerms"
                type="number"
                {...register('paymentTerms', { valueAsNumber: true })}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="taxExempt"
              type="checkbox"
              {...register('taxExempt')}
              disabled={isLoading}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="taxExempt">Tax Exempt</Label>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>Notes and tags for organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              {...register('notes')}
              disabled={isLoading}
              rows={3}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              {...register('tags')}
              disabled={isLoading}
              placeholder="important, vip, referral"
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
          {customer ? 'Update Customer' : 'Create Customer'}
        </Button>
      </div>
    </form>
  )
}