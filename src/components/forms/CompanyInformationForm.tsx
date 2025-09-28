import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Save, Building, MapPin, Phone, Mail, Globe } from 'lucide-react'

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  legalName: z.string().optional(),
  businessNumber: z.string().optional(),
  gstHstNumber: z.string().optional(),
  industry: z.string().optional(),
  description: z.string().optional(),

  // Contact Information
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url('Valid website URL is required').optional().or(z.literal('')),

  // Address
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().default('Canada'),
  }),

  // Billing Address (if different)
  billingAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().default('Canada'),
  }).optional(),

  useSameAddressForBilling: z.boolean().default(true),
})

type CompanyFormData = z.infer<typeof companySchema>

interface CompanyInformationFormProps {
  initialData?: Partial<CompanyFormData>
  onSave: (data: Partial<CompanyFormData>) => Promise<void>
  onChange?: () => void
  isLoading?: boolean
}

const canadianProvinces = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
  'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
  'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec',
  'Saskatchewan', 'Yukon'
]

const industries = [
  'Accounting & Finance', 'Consulting', 'Construction', 'Healthcare',
  'Information Technology', 'Legal Services', 'Manufacturing',
  'Professional Services', 'Real Estate', 'Retail', 'Other'
]

export function CompanyInformationForm({
  initialData,
  onSave,
  onChange,
  isLoading = false
}: CompanyInformationFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      useSameAddressForBilling: true,
      address: { country: 'Canada' },
      billingAddress: { country: 'Canada' },
      ...initialData,
    },
  })

  const useSameAddress = watch('useSameAddressForBilling')

  // Notify parent of changes
  useEffect(() => {
    if (isDirty && onChange) {
      onChange()
    }
  }, [isDirty, onChange])

  const onSubmit = async (data: CompanyFormData) => {
    try {
      // If using same address for billing, copy main address
      if (data.useSameAddressForBilling) {
        data.billingAddress = { ...data.address }
      }

      await onSave(data)
    } catch (error) {
      // Error is handled by parent
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Company Information */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Building className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Basic Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              placeholder="Your Company Name"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="legalName">Legal Name</Label>
            <Input
              id="legalName"
              placeholder="Legal business name (if different)"
              {...register('legalName')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessNumber">Business Number</Label>
            <Input
              id="businessNumber"
              placeholder="9-digit CRA business number"
              {...register('businessNumber')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gstHstNumber">GST/HST Number</Label>
            <Input
              id="gstHstNumber"
              placeholder="15-digit GST/HST registration number"
              {...register('gstHstNumber')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select onValueChange={(value) => setValue('industry', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Company Description</Label>
          <Textarea
            id="description"
            placeholder="Brief description of your business"
            {...register('description')}
          />
        </div>
      </div>

      <Separator />

      {/* Contact Information */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Phone className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Contact Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="company@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number
            </Label>
            <Input
              id="phone"
              placeholder="(555) 123-4567"
              {...register('phone')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">
              <Globe className="w-4 h-4 inline mr-2" />
              Website
            </Label>
            <Input
              id="website"
              placeholder="https://www.example.com"
              {...register('website')}
            />
            {errors.website && (
              <p className="text-sm text-red-600">{errors.website.message}</p>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Business Address */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Business Address</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address.street">Street Address</Label>
            <Input
              id="address.street"
              placeholder="123 Main Street"
              {...register('address.street')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address.city">City</Label>
            <Input
              id="address.city"
              placeholder="Toronto"
              {...register('address.city')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address.province">Province</Label>
            <Select onValueChange={(value) => setValue('address.province', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {canadianProvinces.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address.postalCode">Postal Code</Label>
            <Input
              id="address.postalCode"
              placeholder="A1A 1A1"
              {...register('address.postalCode')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address.country">Country</Label>
            <Input
              id="address.country"
              value="Canada"
              disabled
              {...register('address.country')}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Billing Address */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Billing Address</h3>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="useSameAddressForBilling"
              {...register('useSameAddressForBilling')}
              className="rounded border-gray-300"
            />
            <Label htmlFor="useSameAddressForBilling" className="text-sm">
              Same as business address
            </Label>
          </div>
        </div>

        {!useSameAddress && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="billingAddress.street">Street Address</Label>
              <Input
                id="billingAddress.street"
                placeholder="123 Billing Street"
                {...register('billingAddress.street')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingAddress.city">City</Label>
              <Input
                id="billingAddress.city"
                placeholder="Toronto"
                {...register('billingAddress.city')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingAddress.province">Province</Label>
              <Select onValueChange={(value) => setValue('billingAddress.province', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {canadianProvinces.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingAddress.postalCode">Postal Code</Label>
              <Input
                id="billingAddress.postalCode"
                placeholder="A1A 1A1"
                {...register('billingAddress.postalCode')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingAddress.country">Country</Label>
              <Input
                id="billingAddress.country"
                value="Canada"
                disabled
                {...register('billingAddress.country')}
              />
            </div>
          </div>
        )}
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
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}