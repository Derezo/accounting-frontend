import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { z } from 'zod'
import { ResponsiveForm, FormSection, FormFieldGroup, FormField } from './ResponsiveForm'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/useAPI'
import { Customer } from '@/types/api'

const mobileCustomerSchema = z.object({
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

  // Settings
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.type === 'PERSON') {
    return data.firstName && data.lastName
  }
  if (data.type === 'BUSINESS') {
    return data.businessName
  }
  return true
}, {
  message: "Required fields must be filled based on customer type"
})

type FormData = z.infer<typeof mobileCustomerSchema>

interface MobileOptimizedCustomerFormProps {
  customer?: Customer
  onSuccess?: (customer: Customer) => void
  onCancel?: () => void
}

export function MobileOptimizedCustomerForm({
  customer,
  onSuccess,
  onCancel
}: MobileOptimizedCustomerFormProps) {
  const { isMobile, isTablet } = useBreakpoint()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty }
  } = useForm<FormData>({
    resolver: zodResolver(mobileCustomerSchema),
    defaultValues: {
      type: customer?.type || 'PERSON',
      tier: customer?.tier,
      firstName: customer?.person?.firstName,
      lastName: customer?.person?.lastName,
      dateOfBirth: customer?.person?.dateOfBirth,
      businessName: customer?.business?.businessName,
      legalName: customer?.business?.legalName,
      businessNumber: customer?.business?.businessNumber,
      taxNumber: customer?.business?.taxNumber,
      businessType: customer?.business?.businessType,
      email: customer?.contact?.email,
      phone: customer?.contact?.phone,
      website: customer?.contact?.website,
      street: customer?.address?.street,
      city: customer?.address?.city,
      province: customer?.address?.province,
      postalCode: customer?.address?.postalCode,
      country: customer?.address?.country || 'CA',
      isActive: customer?.status === 'ACTIVE' || true,
      notes: customer?.notes
    }
  })

  const customerType = watch('type')

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true)

      const customerData = {
        type: data.type,
        tier: data.tier,
        person: data.type === 'PERSON' ? {
          firstName: data.firstName!,
          lastName: data.lastName!,
          dateOfBirth: data.dateOfBirth
        } : undefined,
        business: data.type === 'BUSINESS' ? {
          businessName: data.businessName!,
          legalName: data.legalName,
          businessNumber: data.businessNumber,
          taxNumber: data.taxNumber,
          businessType: data.businessType
        } : undefined,
        contact: {
          email: data.email || undefined,
          phone: data.phone,
          website: data.website || undefined
        },
        address: {
          street: data.street,
          city: data.city,
          province: data.province,
          postalCode: data.postalCode,
          country: data.country || 'CA'
        },
        status: data.isActive ? 'ACTIVE' : 'INACTIVE',
        notes: data.notes
      }

      let result: Customer
      if (customer) {
        result = await updateCustomer.mutateAsync({
          id: customer.id,
          ...customerData
        })
      } else {
        result = await createCustomer.mutateAsync(customerData)
      }

      onSuccess?.(result)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ResponsiveForm
      title={customer ? 'Edit Customer' : 'New Customer'}
      description={`${customer ? 'Update' : 'Create'} customer information for your business.`}
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isSubmitting}
      isValid={isValid && isDirty}
      submitLabel={customer ? 'Update Customer' : 'Create Customer'}
      onCancel={onCancel}
      showCancel={!!onCancel}
      stickyButtons={isMobile}
      compactMode={isMobile}
    >
      {/* Customer Type Selection */}
      <FormSection
        title="Customer Type"
        description="Select whether this is a person or business customer"
      >
        <FormField
          label="Customer Type"
          error={errors.type?.message}
          required
        >
          <Select
            value={customerType}
            onValueChange={(value: 'PERSON' | 'BUSINESS') => setValue('type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select customer type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERSON">Individual Person</SelectItem>
              <SelectItem value="BUSINESS">Business/Company</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          label="Customer Tier"
          description="Optional tier for pricing and service levels"
          error={errors.tier?.message}
        >
          <Select
            value={watch('tier') || ''}
            onValueChange={(value) => setValue('tier', value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tier (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERSONAL">Personal</SelectItem>
              <SelectItem value="SMALL_BUSINESS">Small Business</SelectItem>
              <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
              <SelectItem value="EMERGENCY">Emergency</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </FormSection>

      {/* Person Information */}
      {customerType === 'PERSON' && (
        <FormSection
          title="Personal Information"
          description="Individual customer details"
        >
          <FormFieldGroup columns={isMobile ? 1 : 2}>
            <FormField
              label="First Name"
              error={errors.firstName?.message}
              required
            >
              <Input
                {...register('firstName')}
                placeholder="Enter first name"
                autoComplete="given-name"
              />
            </FormField>

            <FormField
              label="Last Name"
              error={errors.lastName?.message}
              required
            >
              <Input
                {...register('lastName')}
                placeholder="Enter last name"
                autoComplete="family-name"
              />
            </FormField>
          </FormFieldGroup>

          <FormField
            label="Date of Birth"
            description="Optional for age verification"
            error={errors.dateOfBirth?.message}
          >
            <Input
              {...register('dateOfBirth')}
              type="date"
              max={new Date().toISOString().split('T')[0]}
            />
          </FormField>
        </FormSection>
      )}

      {/* Business Information */}
      {customerType === 'BUSINESS' && (
        <FormSection
          title="Business Information"
          description="Company and business details"
        >
          <FormField
            label="Business Name"
            error={errors.businessName?.message}
            required
          >
            <Input
              {...register('businessName')}
              placeholder="Enter business name"
              autoComplete="organization"
            />
          </FormField>

          <FormField
            label="Legal Name"
            description="Official registered name if different"
            error={errors.legalName?.message}
          >
            <Input
              {...register('legalName')}
              placeholder="Enter legal name"
            />
          </FormField>

          <FormFieldGroup columns={isMobile ? 1 : 2}>
            <FormField
              label="Business Number"
              description="Registration number"
              error={errors.businessNumber?.message}
            >
              <Input
                {...register('businessNumber')}
                placeholder="123456789"
              />
            </FormField>

            <FormField
              label="Tax Number"
              description="HST/GST number"
              error={errors.taxNumber?.message}
            >
              <Input
                {...register('taxNumber')}
                placeholder="123456789RT0001"
              />
            </FormField>
          </FormFieldGroup>

          <FormField
            label="Business Type"
            error={errors.businessType?.message}
          >
            <Select
              value={watch('businessType') || ''}
              onValueChange={(value) => setValue('businessType', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SOLE_PROPRIETORSHIP">Sole Proprietorship</SelectItem>
                <SelectItem value="PARTNERSHIP">Partnership</SelectItem>
                <SelectItem value="CORPORATION">Corporation</SelectItem>
                <SelectItem value="LLC">LLC</SelectItem>
                <SelectItem value="NON_PROFIT">Non-Profit</SelectItem>
                <SelectItem value="GOVERNMENT">Government</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </FormSection>
      )}

      {/* Contact Information */}
      <FormSection
        title="Contact Information"
        description="Phone, email, and website details"
      >
        <FormField
          label="Email Address"
          error={errors.email?.message}
        >
          <Input
            {...register('email')}
            type="email"
            placeholder="customer@example.com"
            autoComplete="email"
          />
        </FormField>

        <FormFieldGroup columns={isMobile ? 1 : 2}>
          <FormField
            label="Phone Number"
            error={errors.phone?.message}
          >
            <Input
              {...register('phone')}
              type="tel"
              placeholder="+1 (555) 123-4567"
              autoComplete="tel"
            />
          </FormField>

          <FormField
            label="Website"
            error={errors.website?.message}
          >
            <Input
              {...register('website')}
              type="url"
              placeholder="https://example.com"
              autoComplete="url"
            />
          </FormField>
        </FormFieldGroup>
      </FormSection>

      {/* Address Information */}
      <FormSection
        title="Address"
        description="Billing and service address"
      >
        <FormField
          label="Street Address"
          error={errors.street?.message}
        >
          <Input
            {...register('street')}
            placeholder="123 Main Street"
            autoComplete="street-address"
          />
        </FormField>

        <FormFieldGroup columns={isMobile ? 1 : 3}>
          <FormField
            label="City"
            error={errors.city?.message}
          >
            <Input
              {...register('city')}
              placeholder="Toronto"
              autoComplete="address-level2"
            />
          </FormField>

          <FormField
            label="Province"
            error={errors.province?.message}
          >
            <Select
              value={watch('province') || ''}
              onValueChange={(value) => setValue('province', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ON">Ontario</SelectItem>
                <SelectItem value="QC">Quebec</SelectItem>
                <SelectItem value="BC">British Columbia</SelectItem>
                <SelectItem value="AB">Alberta</SelectItem>
                <SelectItem value="MB">Manitoba</SelectItem>
                <SelectItem value="SK">Saskatchewan</SelectItem>
                <SelectItem value="NS">Nova Scotia</SelectItem>
                <SelectItem value="NB">New Brunswick</SelectItem>
                <SelectItem value="NL">Newfoundland and Labrador</SelectItem>
                <SelectItem value="PE">Prince Edward Island</SelectItem>
                <SelectItem value="NT">Northwest Territories</SelectItem>
                <SelectItem value="YT">Yukon</SelectItem>
                <SelectItem value="NU">Nunavut</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Postal Code"
            error={errors.postalCode?.message}
          >
            <Input
              {...register('postalCode')}
              placeholder="K1A 0A9"
              autoComplete="postal-code"
            />
          </FormField>
        </FormFieldGroup>

        <FormField
          label="Country"
          error={errors.country?.message}
        >
          <Select
            value={watch('country') || 'CA'}
            onValueChange={(value) => setValue('country', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CA">Canada</SelectItem>
              <SelectItem value="US">United States</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </FormSection>

      {/* Additional Settings */}
      <FormSection
        title="Settings"
        description="Customer status and additional notes"
      >
        <FormField
          label="Customer Status"
          description="Active customers can receive invoices and quotes"
        >
          <div className="flex items-center space-x-3">
            <Switch
              checked={watch('isActive')}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
            <div className="flex items-center space-x-2">
              <Label>Active Customer</Label>
              <Badge variant={watch('isActive') ? 'default' : 'secondary'}>
                {watch('isActive') ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </FormField>

        <FormField
          label="Notes"
          description="Internal notes about this customer"
          error={errors.notes?.message}
        >
          <Textarea
            {...register('notes')}
            placeholder="Add any notes about this customer..."
            rows={isMobile ? 3 : 4}
          />
        </FormField>
      </FormSection>
    </ResponsiveForm>
  )
}