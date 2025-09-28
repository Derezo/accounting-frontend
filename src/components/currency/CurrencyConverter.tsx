import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { CurrencySelector, Currency, formatCurrency } from './CurrencySelector'
import {
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calculator,
  Clock,
  AlertTriangle,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ExchangeRate {
  from: string
  to: string
  rate: number
  lastUpdated: string
  source: string
  trend: 'up' | 'down' | 'stable'
  change24h: number
  changePeriod: '1h' | '24h' | '7d' | '30d'
}

export interface CurrencyConverterProps {
  fromCurrency?: string
  toCurrency?: string
  amount?: number
  onConversionChange?: (result: ConversionResult) => void
  showTrends?: boolean
  showHistory?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
  className?: string
  size?: 'default' | 'compact' | 'large'
}

export interface ConversionResult {
  fromAmount: number
  fromCurrency: string
  toAmount: number
  toCurrency: string
  exchangeRate: number
  lastUpdated: string
  margin?: number
  fees?: number
}

// Mock exchange rates with more comprehensive data
const mockExchangeRates: Record<string, Record<string, ExchangeRate>> = {
  USD: {
    EUR: { from: 'USD', to: 'EUR', rate: 0.92, lastUpdated: '2024-01-20T10:00:00Z', source: 'ECB', trend: 'down', change24h: -0.5, changePeriod: '24h' },
    GBP: { from: 'USD', to: 'GBP', rate: 0.79, lastUpdated: '2024-01-20T10:00:00Z', source: 'BOE', trend: 'up', change24h: 0.3, changePeriod: '24h' },
    JPY: { from: 'USD', to: 'JPY', rate: 149.50, lastUpdated: '2024-01-20T10:00:00Z', source: 'BOJ', trend: 'stable', change24h: 0.1, changePeriod: '24h' },
    CAD: { from: 'USD', to: 'CAD', rate: 1.34, lastUpdated: '2024-01-20T10:00:00Z', source: 'BOC', trend: 'down', change24h: -0.2, changePeriod: '24h' },
    AUD: { from: 'USD', to: 'AUD', rate: 1.52, lastUpdated: '2024-01-20T10:00:00Z', source: 'RBA', trend: 'up', change24h: 0.8, changePeriod: '24h' },
    CHF: { from: 'USD', to: 'CHF', rate: 0.88, lastUpdated: '2024-01-20T10:00:00Z', source: 'SNB', trend: 'stable', change24h: 0.0, changePeriod: '24h' },
    CNY: { from: 'USD', to: 'CNY', rate: 7.23, lastUpdated: '2024-01-20T10:00:00Z', source: 'PBOC', trend: 'down', change24h: -0.3, changePeriod: '24h' },
    INR: { from: 'USD', to: 'INR', rate: 83.12, lastUpdated: '2024-01-20T10:00:00Z', source: 'RBI', trend: 'up', change24h: 0.4, changePeriod: '24h' }
  },
  EUR: {
    USD: { from: 'EUR', to: 'USD', rate: 1.087, lastUpdated: '2024-01-20T10:00:00Z', source: 'ECB', trend: 'up', change24h: 0.5, changePeriod: '24h' },
    GBP: { from: 'EUR', to: 'GBP', rate: 0.86, lastUpdated: '2024-01-20T10:00:00Z', source: 'BOE', trend: 'stable', change24h: 0.1, changePeriod: '24h' },
    JPY: { from: 'EUR', to: 'JPY', rate: 162.58, lastUpdated: '2024-01-20T10:00:00Z', source: 'BOJ', trend: 'up', change24h: 0.6, changePeriod: '24h' }
  }
}

const historicalRates = [
  { date: '2024-01-19', rate: 0.925 },
  { date: '2024-01-18', rate: 0.923 },
  { date: '2024-01-17', rate: 0.921 },
  { date: '2024-01-16', rate: 0.919 },
  { date: '2024-01-15', rate: 0.917 },
  { date: '2024-01-14', rate: 0.920 },
  { date: '2024-01-13', rate: 0.922 }
]

export function CurrencyConverter({
  fromCurrency = 'USD',
  toCurrency = 'EUR',
  amount = 1,
  onConversionChange,
  showTrends = true,
  showHistory = false,
  autoRefresh = true,
  refreshInterval = 30000,
  className,
  size = 'default'
}: CurrencyConverterProps) {
  const [fromAmount, setFromAmount] = useState<number>(amount)
  const [fromCurr, setFromCurr] = useState<string>(fromCurrency)
  const [toCurr, setToCurr] = useState<string>(toCurrency)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [refreshProgress, setRefreshProgress] = useState(0)

  // Get exchange rate
  const exchangeRate = useMemo(() => {
    if (fromCurr === toCurr) return 1

    const directRate = mockExchangeRates[fromCurr]?.[toCurr]
    if (directRate) return directRate.rate

    // Try inverse rate
    const inverseRate = mockExchangeRates[toCurr]?.[fromCurr]
    if (inverseRate) return 1 / inverseRate.rate

    // Default fallback rate (via USD)
    if (fromCurr !== 'USD' && toCurr !== 'USD') {
      const fromUsdRate = mockExchangeRates['USD']?.[fromCurr]
      const toUsdRate = mockExchangeRates['USD']?.[toCurr]
      if (fromUsdRate && toUsdRate) {
        return toUsdRate.rate / fromUsdRate.rate
      }
    }

    return 1
  }, [fromCurr, toCurr])

  // Get rate info
  const rateInfo = useMemo(() => {
    if (fromCurr === toCurr) return null
    return mockExchangeRates[fromCurr]?.[toCurr] || mockExchangeRates[toCurr]?.[fromCurr]
  }, [fromCurr, toCurr])

  // Calculate converted amount
  const convertedAmount = useMemo(() => {
    return fromAmount * exchangeRate
  }, [fromAmount, exchangeRate])

  // Update conversion result
  useEffect(() => {
    const result: ConversionResult = {
      fromAmount,
      fromCurrency: fromCurr,
      toAmount: convertedAmount,
      toCurrency: toCurr,
      exchangeRate,
      lastUpdated: rateInfo?.lastUpdated || new Date().toISOString()
    }

    onConversionChange?.(result)
  }, [fromAmount, fromCurr, convertedAmount, toCurr, exchangeRate, rateInfo, onConversionChange])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refreshRates()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  // Progress bar for refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      setRefreshProgress(prev => {
        const newProgress = prev + (100 / (refreshInterval / 1000))
        return newProgress >= 100 ? 0 : newProgress
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  const refreshRates = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In real implementation, fetch fresh rates
      setLastUpdated(new Date().toISOString())
      setRefreshProgress(0)
    } catch (err: any) {
      setError(err.message || 'Failed to refresh exchange rates')
    } finally {
      setIsLoading(false)
    }
  }

  const swapCurrencies = () => {
    setFromCurr(toCurr)
    setToCurr(fromCurr)
    setFromAmount(convertedAmount)
  }

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up' || change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />
    } else if (trend === 'down' || change < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />
    }
    return <div className="h-4 w-4" />
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-muted-foreground'
  }

  if (size === 'compact') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Input
          type="number"
          value={fromAmount}
          onChange={(e) => setFromAmount(parseFloat(e.target.value) || 0)}
          className="w-24"
          step="0.01"
        />
        <CurrencySelector
          value={fromCurr}
          onValueChange={setFromCurr}
          variant="compact"
        />
        <Button variant="ghost" size="sm" onClick={swapCurrencies}>
          <ArrowUpDown className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium">
          {formatCurrency(convertedAmount, toCurr)}
        </div>
        <CurrencySelector
          value={toCurr}
          onValueChange={setToCurr}
          variant="compact"
        />
      </div>
    )
  }

  return (
    <Card className={cn(size === 'large' ? 'max-w-2xl' : 'max-w-lg', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Currency Converter
          </CardTitle>
          <div className="flex items-center space-x-2">
            {autoRefresh && (
              <div className="flex items-center space-x-2">
                <Progress value={refreshProgress} className="w-16 h-2" />
                <span className="text-xs text-muted-foreground">
                  {Math.ceil((100 - refreshProgress) * (refreshInterval / 100000))}s
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshRates}
              disabled={isLoading}
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Conversion Form */}
        <div className="space-y-4">
          {/* From Currency */}
          <div className="space-y-2">
            <Label>From</Label>
            <div className="flex space-x-2">
              <Input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(parseFloat(e.target.value) || 0)}
                className="flex-1"
                step="0.01"
                min="0"
              />
              <CurrencySelector
                value={fromCurr}
                onValueChange={setFromCurr}
                className="w-40"
                showSymbols={true}
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={swapCurrencies}
              className="gap-2"
            >
              <ArrowUpDown className="h-4 w-4" />
              Swap
            </Button>
          </div>

          {/* To Currency */}
          <div className="space-y-2">
            <Label>To</Label>
            <div className="flex space-x-2">
              <Input
                value={formatCurrency(convertedAmount, toCurr, { showSymbol: false })}
                readOnly
                className="flex-1 font-medium"
              />
              <CurrencySelector
                value={toCurr}
                onValueChange={setToCurr}
                className="w-40"
                showSymbols={true}
              />
            </div>
          </div>
        </div>

        {/* Exchange Rate Info */}
        {rateInfo && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Exchange Rate</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono">
                      1 {fromCurr} = {exchangeRate.toFixed(4)} {toCurr}
                    </span>
                    {showTrends && (
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(rateInfo.trend, rateInfo.change24h)}
                        <span className={cn('text-sm', getChangeColor(rateInfo.change24h))}>
                          {rateInfo.change24h > 0 ? '+' : ''}{rateInfo.change24h.toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Source: {rateInfo.source}</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      Updated: {new Date(rateInfo.lastUpdated).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Historical Chart (simplified) */}
        {showHistory && size === 'large' && (
          <div className="space-y-2">
            <Label>7-Day Trend</Label>
            <div className="h-20 bg-muted rounded-lg p-2">
              <div className="h-full flex items-end justify-between">
                {historicalRates.map((data, index) => (
                  <div
                    key={data.date}
                    className="bg-primary/60 w-8 rounded-t"
                    style={{
                      height: `${((data.rate - Math.min(...historicalRates.map(r => r.rate))) /
                        (Math.max(...historicalRates.map(r => r.rate)) - Math.min(...historicalRates.map(r => r.rate)))) * 100}%`
                    }}
                    title={`${data.date}: ${data.rate}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{historicalRates[0]?.date}</span>
              <span>{historicalRates[historicalRates.length - 1]?.date}</span>
            </div>
          </div>
        )}

        {/* Quick Amounts */}
        <div className="space-y-2">
          <Label>Quick Convert</Label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 10, 100, 1000].map((quickAmount) => (
              <Button
                key={quickAmount}
                variant="outline"
                size="sm"
                onClick={() => setFromAmount(quickAmount)}
                className="text-xs"
              >
                {quickAmount}
              </Button>
            ))}
          </div>
        </div>

        {/* Conversion Summary */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-1">
          <div className="text-sm font-medium">Conversion Summary</div>
          <div className="text-lg font-bold">
            {formatCurrency(fromAmount, fromCurr)} = {formatCurrency(convertedAmount, toCurr)}
          </div>
          <div className="text-xs text-muted-foreground">
            Rate: 1 {fromCurr} = {exchangeRate.toFixed(4)} {toCurr}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}