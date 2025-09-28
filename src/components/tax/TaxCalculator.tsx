import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { LoadingSpinner } from '@/components/ui/loading'
import {
  Calculator,
  DollarSign,
  FileText,
  TrendingUp,
  Info,
  Download,
  Save,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const taxCalculatorSchema = z.object({
  taxYear: z.number().min(2020).max(new Date().getFullYear() + 1),
  jurisdiction: z.string().min(1, 'Jurisdiction is required'),
  taxType: z.enum(['INCOME_TAX', 'SALES_TAX', 'PAYROLL_TAX', 'PROPERTY_TAX']),
  filingStatus: z.enum(['SINGLE', 'MARRIED_FILING_JOINTLY', 'MARRIED_FILING_SEPARATELY', 'HEAD_OF_HOUSEHOLD', 'QUALIFYING_WIDOW']).optional(),
  grossIncome: z.number().min(0),
  deductions: z.number().min(0),
  exemptions: z.number().min(0),
  credits: z.number().min(0),
  previouslyPaid: z.number().min(0),
  additionalParameters: z.record(z.any()).optional()
})

type TaxCalculatorFormData = z.infer<typeof taxCalculatorSchema>

interface TaxCalculationResult {
  taxableIncome: number
  grossTaxOwed: number
  netTaxOwed: number
  effectiveRate: number
  marginalRate: number
  totalCredits: number
  totalDeductions: number
  refundAmount?: number
  amountDue?: number
  breakdown: {
    category: string
    description: string
    amount: number
    rate?: number
  }[]
  warnings: string[]
  suggestions: string[]
  calculatedAt: string
}

interface TaxBracket {
  min: number
  max: number | null
  rate: number
}

interface TaxCalculatorProps {
  onCalculationComplete?: (result: TaxCalculationResult) => void
  onSaveCalculation?: (data: TaxCalculatorFormData, result: TaxCalculationResult) => void
  isLoading?: boolean
  savedCalculations?: Array<{
    id: string
    name: string
    data: TaxCalculatorFormData
    result: TaxCalculationResult
    savedAt: string
  }>
}

export function TaxCalculator({
  onCalculationComplete,
  onSaveCalculation,
  isLoading = false,
  savedCalculations = []
}: TaxCalculatorProps) {
  const [activeTab, setActiveTab] = useState('calculator')
  const [calculationResult, setCalculationResult] = useState<TaxCalculationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<TaxCalculatorFormData>({
    resolver: zodResolver(taxCalculatorSchema),
    defaultValues: {
      taxYear: new Date().getFullYear(),
      taxType: 'INCOME_TAX',
      filingStatus: 'SINGLE',
      grossIncome: 0,
      deductions: 0,
      exemptions: 0,
      credits: 0,
      previouslyPaid: 0
    }
  })

  const watchedValues = watch()

  // Mock tax brackets for demonstration (in real implementation, these would come from API)
  const getTaxBrackets = (taxYear: number, filingStatus: string): TaxBracket[] => {
    // Federal tax brackets for 2024 (example)
    const brackets: Record<string, TaxBracket[]> = {
      SINGLE: [
        { min: 0, max: 11000, rate: 0.10 },
        { min: 11000, max: 44725, rate: 0.12 },
        { min: 44725, max: 95375, rate: 0.22 },
        { min: 95375, max: 182050, rate: 0.24 },
        { min: 182050, max: 231250, rate: 0.32 },
        { min: 231250, max: 578125, rate: 0.35 },
        { min: 578125, max: null, rate: 0.37 }
      ],
      MARRIED_FILING_JOINTLY: [
        { min: 0, max: 22000, rate: 0.10 },
        { min: 22000, max: 89450, rate: 0.12 },
        { min: 89450, max: 190750, rate: 0.22 },
        { min: 190750, max: 364200, rate: 0.24 },
        { min: 364200, max: 462500, rate: 0.32 },
        { min: 462500, max: 693750, rate: 0.35 },
        { min: 693750, max: null, rate: 0.37 }
      ]
    }
    return brackets[filingStatus] || brackets.SINGLE
  }

  const calculateTax = (data: TaxCalculatorFormData): TaxCalculationResult => {
    const taxableIncome = Math.max(0, data.grossIncome - data.deductions - data.exemptions)

    let grossTaxOwed = 0
    let marginalRate = 0
    const breakdown: TaxCalculationResult['breakdown'] = []

    if (data.taxType === 'INCOME_TAX' && data.filingStatus) {
      const brackets = getTaxBrackets(data.taxYear, data.filingStatus)

      for (const bracket of brackets) {
        const bracketMin = bracket.min
        const bracketMax = bracket.max || Infinity

        if (taxableIncome > bracketMin) {
          const taxableInBracket = Math.min(taxableIncome - bracketMin, bracketMax - bracketMin)
          const taxInBracket = taxableInBracket * bracket.rate

          grossTaxOwed += taxInBracket
          marginalRate = bracket.rate

          breakdown.push({
            category: 'Tax Bracket',
            description: `${bracket.rate * 100}% on income ${bracketMin.toLocaleString()} - ${bracketMax === Infinity ? '∞' : bracketMax.toLocaleString()}`,
            amount: taxInBracket,
            rate: bracket.rate
          })
        }
      }
    } else {
      // Simplified calculation for other tax types
      const rate = data.taxType === 'SALES_TAX' ? 0.08 :
                   data.taxType === 'PAYROLL_TAX' ? 0.153 : 0.02
      grossTaxOwed = taxableIncome * rate
      marginalRate = rate

      breakdown.push({
        category: data.taxType.replace('_', ' '),
        description: `${rate * 100}% on taxable income`,
        amount: grossTaxOwed,
        rate
      })
    }

    const netTaxOwed = Math.max(0, grossTaxOwed - data.credits)
    const effectiveRate = taxableIncome > 0 ? grossTaxOwed / taxableIncome : 0
    const balance = netTaxOwed - data.previouslyPaid

    const warnings: string[] = []
    const suggestions: string[] = []

    if (balance > data.grossIncome * 0.1) {
      warnings.push('Amount due is more than 10% of gross income. Consider quarterly payments next year.')
    }

    if (data.deductions < data.grossIncome * 0.1) {
      suggestions.push('You may benefit from reviewing potential additional deductions.')
    }

    if (effectiveRate > 0.25) {
      suggestions.push('Consider tax planning strategies to reduce your effective rate.')
    }

    return {
      taxableIncome,
      grossTaxOwed,
      netTaxOwed,
      effectiveRate,
      marginalRate,
      totalCredits: data.credits,
      totalDeductions: data.deductions,
      refundAmount: balance < 0 ? Math.abs(balance) : undefined,
      amountDue: balance > 0 ? balance : undefined,
      breakdown,
      warnings,
      suggestions,
      calculatedAt: new Date().toISOString()
    }
  }

  const handleCalculate = async (data: TaxCalculatorFormData) => {
    try {
      setIsCalculating(true)

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      const result = calculateTax(data)
      setCalculationResult(result)
      onCalculationComplete?.(result)
    } catch (error) {
      console.error('Tax calculation failed:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleSave = () => {
    if (calculationResult) {
      onSaveCalculation?.(watchedValues, calculationResult)
    }
  }

  const handleLoadCalculation = (saved: typeof savedCalculations[0]) => {
    reset(saved.data)
    setCalculationResult(saved.result)
    setActiveTab('calculator')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground mt-4">Loading tax calculator...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Tax Calculator
          </h2>
          <p className="text-muted-foreground">Calculate tax liabilities and estimates</p>
        </div>
        {calculationResult && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setCalculationResult(null)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              New Calculation
            </Button>
            <Button variant="outline" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="saved">Saved Calculations</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <form onSubmit={handleSubmit(handleCalculate)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter basic tax calculation parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="taxYear">Tax Year *</Label>
                    <Input
                      id="taxYear"
                      type="number"
                      min="2020"
                      max={new Date().getFullYear() + 1}
                      {...register('taxYear', { valueAsNumber: true })}
                      className={cn(errors.taxYear && 'border-red-500')}
                    />
                    {errors.taxYear && (
                      <p className="text-sm text-red-500 mt-1">{errors.taxYear.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="jurisdiction">Jurisdiction *</Label>
                    <Input
                      id="jurisdiction"
                      {...register('jurisdiction')}
                      placeholder="e.g., Federal, California"
                      className={cn(errors.jurisdiction && 'border-red-500')}
                    />
                    {errors.jurisdiction && (
                      <p className="text-sm text-red-500 mt-1">{errors.jurisdiction.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="taxType">Tax Type *</Label>
                    <Select onValueChange={(value) => setValue('taxType', value as any)}>
                      <SelectTrigger className={cn(errors.taxType && 'border-red-500')}>
                        <SelectValue placeholder="Select tax type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INCOME_TAX">Income Tax</SelectItem>
                        <SelectItem value="SALES_TAX">Sales Tax</SelectItem>
                        <SelectItem value="PAYROLL_TAX">Payroll Tax</SelectItem>
                        <SelectItem value="PROPERTY_TAX">Property Tax</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.taxType && (
                      <p className="text-sm text-red-500 mt-1">{errors.taxType.message}</p>
                    )}
                  </div>
                </div>

                {watchedValues.taxType === 'INCOME_TAX' && (
                  <div>
                    <Label htmlFor="filingStatus">Filing Status</Label>
                    <Select onValueChange={(value) => setValue('filingStatus', value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select filing status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SINGLE">Single</SelectItem>
                        <SelectItem value="MARRIED_FILING_JOINTLY">Married Filing Jointly</SelectItem>
                        <SelectItem value="MARRIED_FILING_SEPARATELY">Married Filing Separately</SelectItem>
                        <SelectItem value="HEAD_OF_HOUSEHOLD">Head of Household</SelectItem>
                        <SelectItem value="QUALIFYING_WIDOW">Qualifying Widow(er)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
                <CardDescription>Enter income, deductions, and other financial details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="grossIncome">Gross Income *</Label>
                    <Input
                      id="grossIncome"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('grossIncome', { valueAsNumber: true })}
                      className={cn(errors.grossIncome && 'border-red-500')}
                    />
                    {errors.grossIncome && (
                      <p className="text-sm text-red-500 mt-1">{errors.grossIncome.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="deductions">Total Deductions</Label>
                    <Input
                      id="deductions"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('deductions', { valueAsNumber: true })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="exemptions">Exemptions</Label>
                    <Input
                      id="exemptions"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('exemptions', { valueAsNumber: true })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="credits">Tax Credits</Label>
                    <Input
                      id="credits"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('credits', { valueAsNumber: true })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="previouslyPaid">Previously Paid</Label>
                    <Input
                      id="previouslyPaid"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('previouslyPaid', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="flex items-end">
                    <div>
                      <Label>Taxable Income (Calculated)</Label>
                      <Input
                        value={formatCurrency(Math.max(0, (watchedValues.grossIncome || 0) - (watchedValues.deductions || 0) - (watchedValues.exemptions || 0)))}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={isCalculating}
                className="min-w-[150px]"
              >
                {isCalculating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Tax
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => reset()}>
                Reset Form
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {calculationResult ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Taxable Income</p>
                        <p className="text-2xl font-bold">{formatCurrency(calculationResult.taxableIncome)}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Tax Owed</p>
                        <p className="text-2xl font-bold">{formatCurrency(calculationResult.netTaxOwed)}</p>
                      </div>
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Effective Rate</p>
                        <p className="text-2xl font-bold">{(calculationResult.effectiveRate * 100).toFixed(2)}%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {calculationResult.refundAmount ? 'Refund' : 'Amount Due'}
                        </p>
                        <p className={cn('text-2xl font-bold',
                          calculationResult.refundAmount ? 'text-green-600' : calculationResult.amountDue ? 'text-red-600' : ''
                        )}>
                          {calculationResult.refundAmount
                            ? formatCurrency(calculationResult.refundAmount)
                            : calculationResult.amountDue
                              ? formatCurrency(calculationResult.amountDue)
                              : '$0.00'
                          }
                        </p>
                      </div>
                      <DollarSign className={cn('h-8 w-8',
                        calculationResult.refundAmount ? 'text-green-500' :
                        calculationResult.amountDue ? 'text-red-500' : 'text-muted-foreground'
                      )} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Calculation Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Calculation Breakdown</CardTitle>
                  <CardDescription>Detailed tax calculation steps</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {calculationResult.breakdown.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div>
                          <p className="font-medium">{item.category}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(item.amount)}</p>
                          {item.rate && (
                            <p className="text-sm text-muted-foreground">{(item.rate * 100).toFixed(2)}%</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Warnings and Suggestions */}
              {(calculationResult.warnings.length > 0 || calculationResult.suggestions.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {calculationResult.warnings.length > 0 && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <p className="font-medium">Warnings:</p>
                          {calculationResult.warnings.map((warning, index) => (
                            <p key={index} className="text-sm">• {warning}</p>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {calculationResult.suggestions.length > 0 && (
                    <Alert className="border-blue-200 bg-blue-50">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <p className="font-medium">Suggestions:</p>
                          {calculationResult.suggestions.map((suggestion, index) => (
                            <p key={index} className="text-sm">• {suggestion}</p>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Calculation
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Create Tax Return
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Calculated on {format(new Date(calculationResult.calculatedAt), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Calculation Results</h3>
                <p className="text-muted-foreground mb-4">Use the calculator tab to perform a tax calculation.</p>
                <Button onClick={() => setActiveTab('calculator')}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Go to Calculator
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Calculations</CardTitle>
              <CardDescription>
                {savedCalculations.length} saved calculation{savedCalculations.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedCalculations.length > 0 ? (
                <div className="space-y-4">
                  {savedCalculations.map((saved) => (
                    <div key={saved.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{saved.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {saved.data.jurisdiction} • {saved.data.taxYear} • {saved.data.taxType.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Saved {format(new Date(saved.savedAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(saved.result.netTaxOwed)}</p>
                          <p className="text-sm text-muted-foreground">
                            {saved.result.refundAmount ? 'Refund' : saved.result.amountDue ? 'Amount Due' : 'Balanced'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Button size="sm" onClick={() => handleLoadCalculation(saved)}>
                          Load
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                        <Button variant="outline" size="sm">
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Saved Calculations</h3>
                  <p className="text-muted-foreground">Calculations you save will appear here for future reference.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}