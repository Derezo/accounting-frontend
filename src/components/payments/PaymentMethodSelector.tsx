import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  CreditCard,
  Building2,
  Smartphone,
  DollarSign,
  Calendar,
  Lock,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PaymentMethod {
  id: string
  type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'ACH' | 'WIRE' | 'CHECK' | 'CASH' | 'PAYPAL' | 'STRIPE' | 'SQUARE'
  name: string
  description: string
  icon: React.ReactNode
  processingTime: string
  fees: string
  isEnabled: boolean
  supportedCurrencies: string[]
  requiresVerification?: boolean
}

export interface CreditCardInfo {
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  cardholderName: string
  billingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export interface BankTransferInfo {
  bankName: string
  accountNumber: string
  routingNumber: string
  accountType: 'CHECKING' | 'SAVINGS'
  accountHolderName: string
}

export interface PaymentMethodSelectorProps {
  selectedMethod?: string
  onMethodSelect: (methodId: string) => void
  onPaymentInfoChange: (info: CreditCardInfo | BankTransferInfo | null) => void
  amount: number
  currency: string
  className?: string
  showSavedMethods?: boolean
  allowSaveMethod?: boolean
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'credit_card',
    type: 'CREDIT_CARD',
    name: 'Credit Card',
    description: 'Pay with Visa, MasterCard, or American Express',
    icon: <CreditCard className="h-5 w-5" />,
    processingTime: 'Instant',
    fees: '2.9% + $0.30',
    isEnabled: true,
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD'],
    requiresVerification: false
  },
  {
    id: 'debit_card',
    type: 'DEBIT_CARD',
    name: 'Debit Card',
    description: 'Pay directly from your bank account',
    icon: <CreditCard className="h-5 w-5" />,
    processingTime: 'Instant',
    fees: '1.4% + $0.30',
    isEnabled: true,
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD']
  },
  {
    id: 'bank_transfer',
    type: 'BANK_TRANSFER',
    name: 'Bank Transfer (ACH)',
    description: 'Direct transfer from your bank account',
    icon: <Building2 className="h-5 w-5" />,
    processingTime: '1-3 business days',
    fees: '$0.80',
    isEnabled: true,
    supportedCurrencies: ['USD'],
    requiresVerification: true
  },
  {
    id: 'wire_transfer',
    type: 'WIRE',
    name: 'Wire Transfer',
    description: 'Secure bank-to-bank transfer',
    icon: <Building2 className="h-5 w-5" />,
    processingTime: 'Same day',
    fees: '$25.00',
    isEnabled: true,
    supportedCurrencies: ['USD', 'EUR', 'GBP']
  },
  {
    id: 'paypal',
    type: 'PAYPAL',
    name: 'PayPal',
    description: 'Pay with your PayPal account',
    icon: <Smartphone className="h-5 w-5" />,
    processingTime: 'Instant',
    fees: '3.49% + $0.49',
    isEnabled: true,
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD']
  },
  {
    id: 'check',
    type: 'CHECK',
    name: 'Check Payment',
    description: 'Pay by mailing a physical check',
    icon: <DollarSign className="h-5 w-5" />,
    processingTime: '5-7 business days',
    fees: 'Free',
    isEnabled: true,
    supportedCurrencies: ['USD']
  }
]

export function PaymentMethodSelector({
  selectedMethod,
  onMethodSelect,
  onPaymentInfoChange,
  amount,
  currency,
  className,
  showSavedMethods = true,
  allowSaveMethod = true
}: PaymentMethodSelectorProps) {
  const [creditCardInfo, setCreditCardInfo] = useState<CreditCardInfo>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  })

  const [bankTransferInfo, setBankTransferInfo] = useState<BankTransferInfo>({
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountType: 'CHECKING',
    accountHolderName: ''
  })

  const [savePaymentMethod, setSavePaymentMethod] = useState(false)

  const availableMethods = paymentMethods.filter(method =>
    method.isEnabled && method.supportedCurrencies.includes(currency)
  )

  const selectedMethodData = availableMethods.find(method => method.id === selectedMethod)

  const handleMethodSelect = (methodId: string) => {
    onMethodSelect(methodId)

    const method = availableMethods.find(m => m.id === methodId)
    if (method?.type === 'CREDIT_CARD' || method?.type === 'DEBIT_CARD') {
      onPaymentInfoChange(creditCardInfo)
    } else if (method?.type === 'BANK_TRANSFER' || method?.type === 'ACH') {
      onPaymentInfoChange(bankTransferInfo)
    } else {
      onPaymentInfoChange(null)
    }
  }

  const handleCreditCardChange = (field: keyof CreditCardInfo | string, value: string) => {
    const newInfo = { ...creditCardInfo }

    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      if (parent === 'billingAddress') {
        newInfo.billingAddress = {
          ...newInfo.billingAddress,
          [child]: value
        }
      }
    } else {
      (newInfo as any)[field] = value
    }

    setCreditCardInfo(newInfo)
    onPaymentInfoChange(newInfo)
  }

  const handleBankTransferChange = (field: keyof BankTransferInfo, value: string) => {
    const newInfo = {
      ...bankTransferInfo,
      [field]: value
    }
    setBankTransferInfo(newInfo)
    onPaymentInfoChange(newInfo)
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const calculateFee = (method: PaymentMethod) => {
    if (method.fees === 'Free') return 0

    const feeMatch = method.fees.match(/([\d.]+)%(?:\s*\+\s*\$?([\d.]+))?|\$?([\d.]+)/)
    if (!feeMatch) return 0

    const percentageFee = feeMatch[1] ? (parseFloat(feeMatch[1]) / 100) * amount : 0
    const fixedFee = feeMatch[2] ? parseFloat(feeMatch[2]) : feeMatch[3] ? parseFloat(feeMatch[3]) : 0

    return percentageFee + fixedFee
  }

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let i = 0; i < 20; i++) {
      years.push(currentYear + i)
    }
    return years
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Select Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {availableMethods.map((method) => {
              const fee = calculateFee(method)
              const isSelected = selectedMethod === method.id

              return (
                <div
                  key={method.id}
                  className={cn(
                    'border rounded-lg p-4 cursor-pointer transition-colors hover:bg-accent',
                    isSelected && 'border-primary bg-primary/5'
                  )}
                  onClick={() => handleMethodSelect(method.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      )}>
                        {method.icon}
                      </div>
                      <div>
                        <h4 className="font-medium">{method.name}</h4>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {method.processingTime}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Fee: {method.fees}
                            {fee > 0 && ` (${currency} ${fee.toFixed(2)})`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {method.requiresVerification && (
                        <Badge variant="outline" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Verification Required
                        </Badge>
                      )}
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Payment Details Forms */}
      {selectedMethodData && (selectedMethodData.type === 'CREDIT_CARD' || selectedMethodData.type === 'DEBIT_CARD') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Card Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  value={creditCardInfo.cardNumber}
                  onChange={(e) => handleCreditCardChange('cardNumber', formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  value={creditCardInfo.cardholderName}
                  onChange={(e) => handleCreditCardChange('cardholderName', e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="expiryMonth">Expiry Month</Label>
                <Select value={creditCardInfo.expiryMonth} onValueChange={(value) => handleCreditCardChange('expiryMonth', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                        {month.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expiryYear">Expiry Year</Label>
                <Select value={creditCardInfo.expiryYear} onValueChange={(value) => handleCreditCardChange('expiryYear', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {getYearOptions().map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  value={creditCardInfo.cvv}
                  onChange={(e) => handleCreditCardChange('cvv', e.target.value.replace(/\D/g, ''))}
                  placeholder="123"
                  maxLength={4}
                />
              </div>
            </div>

            {/* Billing Address */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Billing Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={creditCardInfo.billingAddress.street}
                    onChange={(e) => handleCreditCardChange('billingAddress.street', e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={creditCardInfo.billingAddress.city}
                    onChange={(e) => handleCreditCardChange('billingAddress.city', e.target.value)}
                    placeholder="New York"
                  />
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={creditCardInfo.billingAddress.state}
                    onChange={(e) => handleCreditCardChange('billingAddress.state', e.target.value)}
                    placeholder="NY"
                  />
                </div>

                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={creditCardInfo.billingAddress.zipCode}
                    onChange={(e) => handleCreditCardChange('billingAddress.zipCode', e.target.value)}
                    placeholder="10001"
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select value={creditCardInfo.billingAddress.country} onValueChange={(value) => handleCreditCardChange('billingAddress.country', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="EU">European Union</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {allowSaveMethod && (
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="savePaymentMethod"
                  checked={savePaymentMethod}
                  onCheckedChange={(checked) => setSavePaymentMethod(checked as boolean)}
                />
                <Label htmlFor="savePaymentMethod" className="text-sm">
                  Save this payment method for future use
                </Label>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedMethodData && (selectedMethodData.type === 'BANK_TRANSFER' || selectedMethodData.type === 'ACH') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Bank Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={bankTransferInfo.bankName}
                  onChange={(e) => handleBankTransferChange('bankName', e.target.value)}
                  placeholder="Chase Bank"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="accountHolderName">Account Holder Name</Label>
                <Input
                  id="accountHolderName"
                  value={bankTransferInfo.accountHolderName}
                  onChange={(e) => handleBankTransferChange('accountHolderName', e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="routingNumber">Routing Number</Label>
                <Input
                  id="routingNumber"
                  value={bankTransferInfo.routingNumber}
                  onChange={(e) => handleBankTransferChange('routingNumber', e.target.value.replace(/\D/g, ''))}
                  placeholder="123456789"
                  maxLength={9}
                />
              </div>

              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={bankTransferInfo.accountNumber}
                  onChange={(e) => handleBankTransferChange('accountNumber', e.target.value.replace(/\D/g, ''))}
                  placeholder="1234567890"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="accountType">Account Type</Label>
                <Select value={bankTransferInfo.accountType} onValueChange={(value) => handleBankTransferChange('accountType', value as 'CHECKING' | 'SAVINGS')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CHECKING">Checking Account</SelectItem>
                    <SelectItem value="SAVINGS">Savings Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedMethodData.requiresVerification && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Verification Required</h4>
                  <p className="text-sm text-yellow-700">
                    Bank transfers require verification through micro-deposits.
                    This process typically takes 1-2 business days.
                  </p>
                </div>
              </div>
            )}

            {allowSaveMethod && (
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="saveBankMethod"
                  checked={savePaymentMethod}
                  onCheckedChange={(checked) => setSavePaymentMethod(checked as boolean)}
                />
                <Label htmlFor="saveBankMethod" className="text-sm">
                  Save this bank account for future use
                </Label>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Summary */}
      {selectedMethodData && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{currency} {amount.toFixed(2)}</span>
              </div>
              {calculateFee(selectedMethodData) > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Processing Fee:</span>
                  <span>{currency} {calculateFee(selectedMethodData).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total:</span>
                <span>{currency} {(amount + calculateFee(selectedMethodData)).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}