import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Check, ChevronsUpDown, DollarSign, TrendingUp, AlertTriangle, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Currency {
  code: string
  name: string
  symbol: string
  decimals: number
  isActive: boolean
  exchangeRate?: number
  lastUpdated?: string
  region: string
  flag?: string
}

export interface CurrencySelectorProps {
  value?: string
  onValueChange: (currency: string) => void
  currencies?: Currency[]
  showExchangeRates?: boolean
  showSymbols?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
}

export interface ExchangeRate {
  from: string
  to: string
  rate: number
  lastUpdated: string
  trend: 'up' | 'down' | 'stable'
  change24h: number
}

// Comprehensive currency data
const defaultCurrencies: Currency[] = [
  // Major currencies
  { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2, isActive: true, region: 'North America', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2, isActive: true, region: 'Europe', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2, isActive: true, region: 'Europe', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0, isActive: true, region: 'Asia', flag: '🇯🇵' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimals: 2, isActive: true, region: 'Europe', flag: '🇨🇭' },

  // Asia Pacific
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimals: 2, isActive: true, region: 'Oceania', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimals: 2, isActive: true, region: 'North America', flag: '🇨🇦' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimals: 2, isActive: true, region: 'Asia', flag: '🇨🇳' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimals: 2, isActive: true, region: 'Asia', flag: '🇭🇰' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimals: 2, isActive: true, region: 'Asia', flag: '🇸🇬' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', decimals: 0, isActive: true, region: 'Asia', flag: '🇰🇷' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2, isActive: true, region: 'Asia', flag: '🇮🇳' },

  // Latin America
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimals: 2, isActive: true, region: 'South America', flag: '🇧🇷' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', decimals: 2, isActive: true, region: 'North America', flag: '🇲🇽' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', decimals: 2, isActive: false, region: 'South America', flag: '🇦🇷' },

  // Africa & Middle East
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', decimals: 2, isActive: true, region: 'Africa', flag: '🇿🇦' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimals: 2, isActive: true, region: 'Middle East', flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', decimals: 2, isActive: true, region: 'Middle East', flag: '🇸🇦' },

  // Nordic countries
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimals: 2, isActive: true, region: 'Europe', flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimals: 2, isActive: true, region: 'Europe', flag: '🇳🇴' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', decimals: 2, isActive: true, region: 'Europe', flag: '🇩🇰' },

  // Eastern Europe
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', decimals: 2, isActive: true, region: 'Europe', flag: '🇵🇱' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', decimals: 2, isActive: true, region: 'Europe', flag: '🇨🇿' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', decimals: 2, isActive: false, region: 'Europe', flag: '🇷🇺' },

  // Other
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', decimals: 2, isActive: true, region: 'Oceania', flag: '🇳🇿' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', decimals: 2, isActive: true, region: 'Asia', flag: '🇹🇭' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', decimals: 2, isActive: true, region: 'Europe', flag: '🇹🇷' }
]

// Mock exchange rates
const mockExchangeRates: ExchangeRate[] = [
  { from: 'USD', to: 'EUR', rate: 0.92, lastUpdated: '2024-01-20T10:00:00Z', trend: 'down', change24h: -0.5 },
  { from: 'USD', to: 'GBP', rate: 0.79, lastUpdated: '2024-01-20T10:00:00Z', trend: 'up', change24h: 0.3 },
  { from: 'USD', to: 'JPY', rate: 149.50, lastUpdated: '2024-01-20T10:00:00Z', trend: 'stable', change24h: 0.1 },
  { from: 'USD', to: 'CAD', rate: 1.34, lastUpdated: '2024-01-20T10:00:00Z', trend: 'down', change24h: -0.2 },
  { from: 'USD', to: 'AUD', rate: 1.52, lastUpdated: '2024-01-20T10:00:00Z', trend: 'up', change24h: 0.8 }
]

export function CurrencySelector({
  value,
  onValueChange,
  currencies = defaultCurrencies,
  showExchangeRates = false,
  showSymbols = true,
  disabled = false,
  placeholder = "Select currency",
  className,
  variant = 'default'
}: CurrencySelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>(mockExchangeRates)

  const activeCurrencies = currencies.filter(c => c.isActive)
  const selectedCurrency = currencies.find(c => c.code === value)

  // Filter currencies based on search term
  const filteredCurrencies = activeCurrencies.filter(currency =>
    currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.region.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Group currencies by region
  const currenciesByRegion = filteredCurrencies.reduce((acc, currency) => {
    if (!acc[currency.region]) {
      acc[currency.region] = []
    }
    acc[currency.region].push(currency)
    return acc
  }, {} as Record<string, Currency[]>)

  const getExchangeRate = (fromCurrency: string, toCurrency: string): ExchangeRate | null => {
    return exchangeRates.find(rate =>
      (rate.from === fromCurrency && rate.to === toCurrency) ||
      (rate.from === toCurrency && rate.to === fromCurrency)
    ) || null
  }

  const formatExchangeRate = (rate: ExchangeRate) => {
    const isInverse = rate.to === 'USD'
    const displayRate = isInverse ? (1 / rate.rate) : rate.rate
    const decimals = displayRate < 1 ? 4 : 2

    return {
      rate: displayRate.toFixed(decimals),
      change: rate.change24h,
      trend: rate.trend,
      lastUpdated: rate.lastUpdated
    }
  }

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up' || change > 0) {
      return <TrendingUp className="h-3 w-3 text-green-500" />
    } else if (trend === 'down' || change < 0) {
      return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
    }
    return <div className="h-3 w-3" />
  }

  if (variant === 'compact') {
    return (
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={cn("w-24", className)}>
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent>
          {activeCurrencies.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              {showSymbols ? currency.symbol : currency.code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  if (variant === 'detailed') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Currency Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
                disabled={disabled}
              >
                {selectedCurrency ? (
                  <div className="flex items-center gap-2">
                    <span>{selectedCurrency.flag}</span>
                    <span className="font-medium">{selectedCurrency.code}</span>
                    <span className="text-muted-foreground">-</span>
                    <span>{selectedCurrency.name}</span>
                    {showSymbols && (
                      <Badge variant="outline" className="ml-auto">
                        {selectedCurrency.symbol}
                      </Badge>
                    )}
                  </div>
                ) : (
                  placeholder
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Search currencies..."
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                />
                <CommandEmpty>No currency found.</CommandEmpty>
                {Object.entries(currenciesByRegion).map(([region, regionCurrencies]) => (
                  <CommandGroup key={region} heading={region}>
                    {regionCurrencies.map((currency) => {
                      const exchangeRate = showExchangeRates && value !== currency.code
                        ? getExchangeRate('USD', currency.code)
                        : null

                      return (
                        <CommandItem
                          key={currency.code}
                          value={currency.code}
                          onSelect={() => {
                            onValueChange(currency.code)
                            setOpen(false)
                          }}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                value === currency.code ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <span>{currency.flag}</span>
                            <div>
                              <div className="font-medium">{currency.code}</div>
                              <div className="text-sm text-muted-foreground">{currency.name}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {showSymbols && (
                              <Badge variant="outline">{currency.symbol}</Badge>
                            )}
                            {exchangeRate && (
                              <div className="text-right text-sm">
                                <div className="flex items-center gap-1">
                                  {getTrendIcon(exchangeRate.trend, exchangeRate.change24h)}
                                  <span>{formatExchangeRate(exchangeRate).rate}</span>
                                </div>
                                <div className={cn(
                                  "text-xs",
                                  exchangeRate.change24h > 0 ? "text-green-600" :
                                  exchangeRate.change24h < 0 ? "text-red-600" :
                                  "text-muted-foreground"
                                )}>
                                  {exchangeRate.change24h > 0 ? '+' : ''}{exchangeRate.change24h.toFixed(2)}%
                                </div>
                              </div>
                            )}
                          </div>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                ))}
              </Command>
            </PopoverContent>
          </Popover>

          {selectedCurrency && showExchangeRates && (
            <Alert>
              <DollarSign className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">Exchange Rates (vs USD)</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {exchangeRates
                      .filter(rate => rate.to === selectedCurrency.code || rate.from === selectedCurrency.code)
                      .slice(0, 3)
                      .map((rate) => {
                        const formatted = formatExchangeRate(rate)
                        return (
                          <div key={`${rate.from}-${rate.to}`} className="flex items-center justify-between">
                            <span>1 USD =</span>
                            <div className="flex items-center gap-1">
                              <span>{formatted.rate} {selectedCurrency.code}</span>
                              {getTrendIcon(rate.trend, rate.change24h)}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last updated: {new Date(exchangeRates[0]?.lastUpdated || '').toLocaleString()}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  }

  // Default variant
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
          disabled={disabled}
        >
          {selectedCurrency ? (
            <div className="flex items-center gap-2">
              <span>{selectedCurrency.flag}</span>
              <span>{selectedCurrency.code}</span>
              {showSymbols && <span className="text-muted-foreground">{selectedCurrency.symbol}</span>}
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <Command>
          <CommandInput placeholder="Search currencies..." />
          <CommandEmpty>No currency found.</CommandEmpty>
          {Object.entries(currenciesByRegion).map(([region, regionCurrencies]) => (
            <CommandGroup key={region} heading={region}>
              {regionCurrencies.map((currency) => (
                <CommandItem
                  key={currency.code}
                  value={currency.code}
                  onSelect={() => {
                    onValueChange(currency.code)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === currency.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="mr-2">{currency.flag}</span>
                  <span className="font-medium mr-2">{currency.code}</span>
                  <span className="text-muted-foreground mr-2">-</span>
                  <span>{currency.name}</span>
                  {showSymbols && (
                    <Badge variant="outline" className="ml-auto">
                      {currency.symbol}
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Currency utilities
export const getCurrencySymbol = (currencyCode: string): string => {
  const currency = defaultCurrencies.find(c => c.code === currencyCode)
  return currency?.symbol || currencyCode
}

export const getCurrencyDecimals = (currencyCode: string): number => {
  const currency = defaultCurrencies.find(c => c.code === currencyCode)
  return currency?.decimals || 2
}

export const formatCurrency = (amount: number, currencyCode: string, options?: {
  showSymbol?: boolean
  showCode?: boolean
}): string => {
  const currency = defaultCurrencies.find(c => c.code === currencyCode)
  if (!currency) return `${amount} ${currencyCode}`

  const { showSymbol = true, showCode = false } = options || {}
  const formattedAmount = amount.toFixed(currency.decimals)

  if (showSymbol && showCode) {
    return `${currency.symbol} ${formattedAmount} ${currency.code}`
  } else if (showSymbol) {
    return `${currency.symbol} ${formattedAmount}`
  } else if (showCode) {
    return `${formattedAmount} ${currency.code}`
  } else {
    return formattedAmount
  }
}