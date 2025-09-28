import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Save, FileText, Calculator, AlertCircle } from 'lucide-react'

const taxSchema = z.object({
  // GST/HST Configuration
  gstHstRate: z.number().min(0).max(100, 'Tax rate cannot exceed 100%'),
  gstHstNumber: z.string().optional(),
  isGstHstRegistered: z.boolean().default(false),

  // Provincial Tax Configuration
  province: z.string().min(1, 'Province is required'),
  pstRate: z.number().min(0).max(100, 'Tax rate cannot exceed 100%').optional(),
  pstNumber: z.string().optional(),
  isPstApplicable: z.boolean().default(false),

  // Quebec-specific (QST)
  qstRate: z.number().min(0).max(100, 'Tax rate cannot exceed 100%').optional(),
  qstNumber: z.string().optional(),
  isQstApplicable: z.boolean().default(false),

  // Tax Settings
  taxInclusive: z.boolean().default(false),
  defaultTaxCode: z.string().optional(),

  // Exempt Categories
  exemptServices: z.array(z.string()).default([]),
  exemptProducts: z.array(z.string()).default([]),
})

type TaxFormData = z.infer<typeof taxSchema>

interface TaxConfigurationFormProps {
  initialData?: Partial<TaxFormData>
  onSave: (data: Partial<TaxFormData>) => Promise<void>
  onChange?: () => void
  isLoading?: boolean
}

const canadianProvinces = [
  { code: 'AB', name: 'Alberta', gstHst: 5, pst: 0, hasHst: false },
  { code: 'BC', name: 'British Columbia', gstHst: 5, pst: 7, hasHst: false },
  { code: 'MB', name: 'Manitoba', gstHst: 5, pst: 7, hasHst: false },
  { code: 'NB', name: 'New Brunswick', gstHst: 15, pst: 0, hasHst: true },
  { code: 'NL', name: 'Newfoundland and Labrador', gstHst: 15, pst: 0, hasHst: true },
  { code: 'NT', name: 'Northwest Territories', gstHst: 5, pst: 0, hasHst: false },
  { code: 'NS', name: 'Nova Scotia', gstHst: 15, pst: 0, hasHst: true },
  { code: 'NU', name: 'Nunavut', gstHst: 5, pst: 0, hasHst: false },
  { code: 'ON', name: 'Ontario', gstHst: 13, pst: 0, hasHst: true },
  { code: 'PE', name: 'Prince Edward Island', gstHst: 15, pst: 0, hasHst: true },
  { code: 'QC', name: 'Quebec', gstHst: 5, pst: 9.975, hasHst: false, hasQst: true },
  { code: 'SK', name: 'Saskatchewan', gstHst: 5, pst: 6, hasHst: false },
  { code: 'YT', name: 'Yukon', gstHst: 5, pst: 0, hasHst: false },
]

const exemptServiceCategories = [
  'Basic healthcare services',
  'Educational services',
  'Financial services',
  'Legal services (some)',
  'Childcare services',
  'Municipal transit',
  'Residential rent',
  'Insurance services'
]

const exemptProductCategories = [
  'Basic groceries',
  'Prescription drugs',
  'Medical devices',
  'Books and magazines',
  'Agricultural products',
  'Export goods',
  'Zero-rated supplies'
]

export function TaxConfigurationForm({
  initialData,
  onSave,
  onChange,
  isLoading = false
}: TaxConfigurationFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<TaxFormData>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      isGstHstRegistered: false,
      isPstApplicable: false,
      isQstApplicable: false,
      taxInclusive: false,
      exemptServices: [],
      exemptProducts: [],
      ...initialData,
    },
  })

  const selectedProvince = watch('province')
  const isGstHstRegistered = watch('isGstHstRegistered')
  const isPstApplicable = watch('isPstApplicable')
  const isQstApplicable = watch('isQstApplicable')

  // Auto-populate tax rates based on selected province
  useEffect(() => {
    if (selectedProvince) {
      const provinceData = canadianProvinces.find(p => p.code === selectedProvince)
      if (provinceData) {
        setValue('gstHstRate', provinceData.gstHst)
        setValue('isPstApplicable', provinceData.pst > 0 && !provinceData.hasHst)
        if (provinceData.pst > 0) {
          setValue('pstRate', provinceData.pst)
        }
        setValue('isQstApplicable', provinceData.hasQst || false)
        if (provinceData.hasQst) {
          setValue('qstRate', provinceData.pst)
        }
      }
    }
  }, [selectedProvince, setValue])

  // Notify parent of changes
  useEffect(() => {
    if (isDirty && onChange) {
      onChange()
    }
  }, [isDirty, onChange])

  const onSubmit = async (data: TaxFormData) => {
    try {
      await onSave(data)
    } catch (error) {
      // Error is handled by parent
    }
  }

  const selectedProvinceData = canadianProvinces.find(p => p.code === selectedProvince)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Province Selection */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Tax Jurisdiction</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="province">Primary Business Province *</Label>
            <Select onValueChange={(value) => setValue('province', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your primary business province" />
              </SelectTrigger>
              <SelectContent>
                {canadianProvinces.map((province) => (
                  <SelectItem key={province.code} value={province.code}>
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.province && (
              <p className="text-sm text-red-600">{errors.province.message}</p>
            )}
          </div>

          {selectedProvinceData && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{selectedProvinceData.name}</strong> uses {' '}
                {selectedProvinceData.hasHst ? (
                  <>HST at {selectedProvinceData.gstHst}% (no separate PST)</>
                ) : selectedProvinceData.hasQst ? (
                  <>GST at {selectedProvinceData.gstHst}% + QST at {selectedProvinceData.pst}%</>
                ) : selectedProvinceData.pst > 0 ? (
                  <>GST at {selectedProvinceData.gstHst}% + PST at {selectedProvinceData.pst}%</>
                ) : (
                  <>GST only at {selectedProvinceData.gstHst}% (no provincial tax)</>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <Separator />

      {/* GST/HST Configuration */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">GST/HST Configuration</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isGstHstRegistered"
              {...register('isGstHstRegistered')}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isGstHstRegistered" className="text-sm">
              Business is registered for GST/HST
            </Label>
          </div>

          {isGstHstRegistered && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6">
              <div className="space-y-2">
                <Label htmlFor="gstHstRate">
                  {selectedProvinceData?.hasHst ? 'HST Rate (%)' : 'GST Rate (%)'}
                </Label>
                <Input
                  id="gstHstRate"
                  type="number"
                  step="0.001"
                  min="0"
                  max="100"
                  {...register('gstHstRate', { valueAsNumber: true })}
                />
                {errors.gstHstRate && (
                  <p className="text-sm text-red-600">{errors.gstHstRate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gstHstNumber">
                  {selectedProvinceData?.hasHst ? 'HST Registration Number' : 'GST Registration Number'}
                </Label>
                <Input
                  id="gstHstNumber"
                  placeholder="123456789RT0001"
                  {...register('gstHstNumber')}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Provincial Tax Configuration */}
      {selectedProvinceData && !selectedProvinceData.hasHst && (
        <>
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">
                {selectedProvinceData.hasQst ? 'QST Configuration' : 'PST Configuration'}
              </h3>
            </div>

            {selectedProvinceData.pst > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={selectedProvinceData.hasQst ? 'isQstApplicable' : 'isPstApplicable'}
                    {...register(selectedProvinceData.hasQst ? 'isQstApplicable' : 'isPstApplicable')}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={selectedProvinceData.hasQst ? 'isQstApplicable' : 'isPstApplicable'} className="text-sm">
                    Business is registered for {selectedProvinceData.hasQst ? 'QST' : 'PST'}
                  </Label>
                </div>

                {(selectedProvinceData.hasQst ? isQstApplicable : isPstApplicable) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor={selectedProvinceData.hasQst ? 'qstRate' : 'pstRate'}>
                        {selectedProvinceData.hasQst ? 'QST Rate (%)' : 'PST Rate (%)'}
                      </Label>
                      <Input
                        id={selectedProvinceData.hasQst ? 'qstRate' : 'pstRate'}
                        type="number"
                        step="0.001"
                        min="0"
                        max="100"
                        {...register(selectedProvinceData.hasQst ? 'qstRate' : 'pstRate', { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={selectedProvinceData.hasQst ? 'qstNumber' : 'pstNumber'}>
                        {selectedProvinceData.hasQst ? 'QST Registration Number' : 'PST Registration Number'}
                      </Label>
                      <Input
                        id={selectedProvinceData.hasQst ? 'qstNumber' : 'pstNumber'}
                        placeholder={selectedProvinceData.hasQst ? "1234567890TQ0001" : "PST-1234-5678"}
                        {...register(selectedProvinceData.hasQst ? 'qstNumber' : 'pstNumber')}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedProvinceData.pst === 0 && (
              <Alert>
                <AlertDescription>
                  {selectedProvinceData.name} does not have provincial sales tax.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Separator />
        </>
      )}

      {/* Tax Settings */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Tax Settings</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="taxInclusive"
              {...register('taxInclusive')}
              className="rounded border-gray-300"
            />
            <Label htmlFor="taxInclusive" className="text-sm">
              Prices include tax (tax-inclusive pricing)
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultTaxCode">Default Tax Code</Label>
            <Select onValueChange={(value) => setValue('defaultTaxCode', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select default tax code" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STANDARD">Standard Rate</SelectItem>
                <SelectItem value="ZERO_RATED">Zero-Rated</SelectItem>
                <SelectItem value="EXEMPT">Exempt</SelectItem>
                <SelectItem value="OUT_OF_SCOPE">Out of Scope</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Tax Exemptions */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Tax Exemptions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Exempt Services</CardTitle>
              <CardDescription>
                Services that are exempt from GST/HST
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {exemptServiceCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`service-${category}`}
                      value={category}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`service-${category}`} className="text-sm">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Exempt Products</CardTitle>
              <CardDescription>
                Products that are exempt from GST/HST
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {exemptProductCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`product-${category}`}
                      value={category}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`product-${category}`} className="text-sm">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Important Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Tax regulations can be complex and change frequently.
          Please consult with a qualified tax professional or the Canada Revenue Agency
          to ensure compliance with all applicable tax laws and regulations.
        </AlertDescription>
      </Alert>

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
          {isLoading ? 'Saving...' : 'Save Tax Configuration'}
        </Button>
      </div>
    </form>
  )
}