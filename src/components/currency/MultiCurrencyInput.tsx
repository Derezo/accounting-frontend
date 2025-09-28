import { useState, useEffect, forwardRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CurrencySelector, getCurrencySymbol, getCurrencyDecimals, formatCurrency } from './CurrencySelector'
import { CurrencyConverter } from './CurrencyConverter'
import {
  Calculator,
  DollarSign,
  AlertTriangle,
  Info,
  Plus,
  Minus,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MultiCurrencyValue {
  amount: number
  currency: string
  baseAmount?: number
  baseCurrency?: string
  exchangeRate?: number
}

export interface MultiCurrencyInputProps {
  value?: MultiCurrencyValue
  onChange?: (value: MultiCurrencyValue) => void
  label?: string
  placeholder?: string
  baseCurrency?: string
  allowedCurrencies?: string[]
  required?: boolean
  disabled?: boolean
  error?: string
  showConverter?: boolean
  showExchangeRate?: boolean
  autoConvert?: boolean
  validateRange?: {
    min?: number
    max?: number
  }
  className?: string
  size?: 'default' | 'sm' | 'lg'
}

const MultiCurrencyInput = forwardRef<HTMLInputElement, MultiCurrencyInputProps>(({
  value,
  onChange,
  label,
  placeholder = "Enter amount",
  baseCurrency = 'USD',
  allowedCurrencies,
  required = false,
  disabled = false,
  error,
  showConverter = true,
  showExchangeRate = true,
  autoConvert = true,
  validateRange,
  className,
  size = 'default'
}, ref) => {
  const [amount, setAmount] = useState<string>(value?.amount?.toString() || '')
  const [currency, setCurrency] = useState<string>(value?.currency || baseCurrency)
  const [showConverterPopover, setShowConverterPopover] = useState(false)
  const [exchangeRate, setExchangeRate] = useState<number>(1)
  const [baseAmount, setBaseAmount] = useState<number>(0)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Mock exchange rates (in real app, this would come from an API)
  const mockExchangeRates: Record<string, number> = {
    'USD': 1,
    'EUR': 0.92,
    'GBP': 0.79,
    'JPY': 149.50,
    'CAD': 1.34,
    'AUD': 1.52,
    'CHF': 0.88,
    'CNY': 7.23,
    'INR': 83.12
  }

  // Calculate exchange rate
  useEffect(() => {
    if (currency === baseCurrency) {
      setExchangeRate(1)
    } else {
      const currencyRate = mockExchangeRates[currency] || 1
      const baseRate = mockExchangeRates[baseCurrency] || 1
      const rate = baseRate / currencyRate
      setExchangeRate(rate)
    }
  }, [currency, baseCurrency])

  // Calculate base amount
  useEffect(() => {
    const numericAmount = parseFloat(amount) || 0
    const calculatedBaseAmount = numericAmount * exchangeRate
    setBaseAmount(calculatedBaseAmount)
  }, [amount, exchangeRate])

  // Validate amount
  useEffect(() => {
    const numericAmount = parseFloat(amount) || 0

    if (validateRange) {
      if (validateRange.min !== undefined && numericAmount < validateRange.min) {
        setValidationError(`Amount must be at least ${formatCurrency(validateRange.min, currency)}`)
      } else if (validateRange.max !== undefined && numericAmount > validateRange.max) {
        setValidationError(`Amount must not exceed ${formatCurrency(validateRange.max, currency)}`)
      } else {
        setValidationError(null)
      }
    } else {
      setValidationError(null)
    }
  }, [amount, currency, validateRange])

  // Update parent component
  useEffect(() => {
    if (onChange) {
      const numericAmount = parseFloat(amount) || 0
      const currencyValue: MultiCurrencyValue = {
        amount: numericAmount,
        currency,
        baseAmount,
        baseCurrency,
        exchangeRate
      }
      onChange(currencyValue)
    }
  }, [amount, currency, baseAmount, baseCurrency, exchangeRate, onChange])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // Allow empty string, numbers, and decimal points
    if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
      setAmount(inputValue)
    }
  }

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency)
  }

  const formatInputValue = () => {
    if (!amount) return ''
    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount)) return amount

    const decimals = getCurrencyDecimals(currency)
    return numericAmount.toFixed(decimals)
  }

  const incrementAmount = () => {
    const numericAmount = parseFloat(amount) || 0
    const increment = currency === 'JPY' ? 100 : 1
    setAmount((numericAmount + increment).toString())
  }

  const decrementAmount = () => {
    const numericAmount = parseFloat(amount) || 0
    const decrement = currency === 'JPY' ? 100 : 1
    const newAmount = Math.max(0, numericAmount - decrement)
    setAmount(newAmount.toString())
  }

  const sizeClasses = {
    sm: 'text-sm',
    default: '',
    lg: 'text-lg'
  }

  const inputSizeClasses = {
    sm: 'h-8',
    default: 'h-10',
    lg: 'h-12'
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className={cn(sizeClasses[size], required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
          {label}
        </Label>
      )}

      <div className="relative">
        <div className="flex space-x-2">
          {/* Amount Input */}
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {getCurrencySymbol(currency)}
            </div>
            <Input
              ref={ref}
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                'pl-8 pr-16',
                inputSizeClasses[size],
                (error || validationError) && 'border-red-500',
                sizeClasses[size]
              )}
              onBlur={() => {
                if (amount && !isNaN(parseFloat(amount))) {
                  setAmount(formatInputValue())
                }
              }}
            />

            {/* Increment/Decrement Buttons */}
            <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={incrementAmount}
                disabled={disabled}
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={decrementAmount}
                disabled={disabled}
              >
                <Minus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Currency Selector */}
          <CurrencySelector
            value={currency}
            onValueChange={handleCurrencyChange}
            currencies={allowedCurrencies ? undefined : undefined} // TODO: Filter currencies if needed
            disabled={disabled}
            className="w-32"
            variant="default"
          />
        </div>

        {/* Exchange Rate & Converter */}
        {(showExchangeRate || showConverter) && currency !== baseCurrency && (
          <div className="flex items-center justify-between mt-2">
            {showExchangeRate && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>
                  1 {currency} = {exchangeRate.toFixed(4)} {baseCurrency}
                </span>
                {baseAmount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    ≈ {formatCurrency(baseAmount, baseCurrency)}
                  </Badge>
                )}
              </div>
            )}

            {showConverter && (
              <Popover open={showConverterPopover} onOpenChange={setShowConverterPopover}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 text-xs">
                    <Calculator className="h-3 w-3 mr-1" />
                    Convert
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96">
                  <CurrencyConverter
                    fromCurrency={currency}
                    toCurrency={baseCurrency}
                    amount={parseFloat(amount) || 1}
                    size="compact"
                    onConversionChange={(result) => {
                      if (autoConvert) {
                        setAmount(result.fromAmount.toString())
                        setCurrency(result.fromCurrency)
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        )}
      </div>

      {/* Error Messages */}
      {(error || validationError) && (
        <Alert variant="destructive" className="py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {error || validationError}
          </AlertDescription>
        </Alert>
      )}

      {/* Help Text */}
      {!error && !validationError && validateRange && (
        <Alert className="py-2">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {validateRange.min !== undefined && validateRange.max !== undefined ? (
              <>Amount must be between {formatCurrency(validateRange.min, currency)} and {formatCurrency(validateRange.max, currency)}</>
            ) : validateRange.min !== undefined ? (
              <>Minimum amount: {formatCurrency(validateRange.min, currency)}</>
            ) : validateRange.max !== undefined ? (
              <>Maximum amount: {formatCurrency(validateRange.max, currency)}</>
            ) : null}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
})

MultiCurrencyInput.displayName = 'MultiCurrencyInput'

export { MultiCurrencyInput }

// Additional utility components for multi-currency forms

export interface CurrencyTotalProps {
  items: MultiCurrencyValue[]
  baseCurrency?: string
  showBreakdown?: boolean
  className?: string
}

export function CurrencyTotal({
  items,
  baseCurrency = 'USD',
  showBreakdown = false,
  className
}: CurrencyTotalProps) {
  const totalByCurrency = items.reduce((acc, item) => {
    if (!acc[item.currency]) {
      acc[item.currency] = 0
    }
    acc[item.currency] += item.amount
    return acc
  }, {} as Record<string, number>)

  const baseTotal = items.reduce((sum, item) => sum + (item.baseAmount || 0), 0)

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="font-medium">Total</span>
        <span className="text-lg font-bold">
          {formatCurrency(baseTotal, baseCurrency)}
        </span>
      </div>

      {showBreakdown && Object.keys(totalByurrency).length > 1 && (
        <div className="space-y-1 text-sm text-muted-foreground">
          <div>Breakdown:</div>
          {Object.entries(totalByurrency).map(([currency, amount]) => (
            <div key={currency} className="flex justify-between">
              <span>{currency}:</span>
              <span>{formatCurrency(amount, currency)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export interface CurrencyListProps {
  items: MultiCurrencyValue[]
  onItemChange?: (index: number, value: MultiCurrencyValue) => void
  onRemoveItem?: (index: number) => void
  baseCurrency?: string
  className?: string
}

export function CurrencyList({
  items,
  onItemChange,
  onRemoveItem,
  baseCurrency = 'USD',
  className
}: CurrencyListProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <MultiCurrencyInput
            value={item}
            onChange={(value) => onItemChange?.(index, value)}
            baseCurrency={baseCurrency}
            className="flex-1"
          />
          {onRemoveItem && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveItem(index)}
              className="text-red-500 hover:text-red-700"
            >
              <Minus className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}