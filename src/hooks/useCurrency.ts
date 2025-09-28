import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './useAuth'

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

export interface ExchangeRate {
  from: string
  to: string
  rate: number
  lastUpdated: string
  source: string
  trend: 'up' | 'down' | 'stable'
  change24h: number
}

export interface CurrencySettings {
  baseCurrency: string
  allowedCurrencies: string[]
  autoRefreshRates: boolean
  refreshInterval: number
  showExchangeRates: boolean
  roundingPrecision: number
}

export interface UseCurrencyOptions {
  autoFetch?: boolean
  refreshInterval?: number
  baseCurrency?: string
}

interface CurrencyState {
  currencies: Currency[]
  exchangeRates: Record<string, Record<string, ExchangeRate>>
  settings: CurrencySettings
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
}

// Mock data
const defaultCurrencies: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2, isActive: true, region: 'North America', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2, isActive: true, region: 'Europe', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2, isActive: true, region: 'Europe', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0, isActive: true, region: 'Asia', flag: '🇯🇵' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimals: 2, isActive: true, region: 'North America', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimals: 2, isActive: true, region: 'Oceania', flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimals: 2, isActive: true, region: 'Europe', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimals: 2, isActive: true, region: 'Asia', flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2, isActive: true, region: 'Asia', flag: '🇮🇳' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimals: 2, isActive: true, region: 'South America', flag: '🇧🇷' }
]

const defaultSettings: CurrencySettings = {
  baseCurrency: 'USD',
  allowedCurrencies: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
  autoRefreshRates: true,
  refreshInterval: 300000, // 5 minutes
  showExchangeRates: true,
  roundingPrecision: 2
}

const mockExchangeRates: Record<string, Record<string, ExchangeRate>> = {
  USD: {
    EUR: { from: 'USD', to: 'EUR', rate: 0.92, lastUpdated: '2024-01-20T10:00:00Z', source: 'ECB', trend: 'down', change24h: -0.5 },
    GBP: { from: 'USD', to: 'GBP', rate: 0.79, lastUpdated: '2024-01-20T10:00:00Z', source: 'BOE', trend: 'up', change24h: 0.3 },
    JPY: { from: 'USD', to: 'JPY', rate: 149.50, lastUpdated: '2024-01-20T10:00:00Z', source: 'BOJ', trend: 'stable', change24h: 0.1 },
    CAD: { from: 'USD', to: 'CAD', rate: 1.34, lastUpdated: '2024-01-20T10:00:00Z', source: 'BOC', trend: 'down', change24h: -0.2 },
    AUD: { from: 'USD', to: 'AUD', rate: 1.52, lastUpdated: '2024-01-20T10:00:00Z', source: 'RBA', trend: 'up', change24h: 0.8 },
    CHF: { from: 'USD', to: 'CHF', rate: 0.88, lastUpdated: '2024-01-20T10:00:00Z', source: 'SNB', trend: 'stable', change24h: 0.0 },
    CNY: { from: 'USD', to: 'CNY', rate: 7.23, lastUpdated: '2024-01-20T10:00:00Z', source: 'PBOC', trend: 'down', change24h: -0.3 },
    INR: { from: 'USD', to: 'INR', rate: 83.12, lastUpdated: '2024-01-20T10:00:00Z', source: 'RBI', trend: 'up', change24h: 0.4 },
    BRL: { from: 'USD', to: 'BRL', rate: 4.98, lastUpdated: '2024-01-20T10:00:00Z', source: 'BCB', trend: 'down', change24h: -0.8 }
  }
}

export function useCurrency(options: UseCurrencyOptions = {}) {
  const { user } = useAuth()
  const {
    autoFetch = true,
    refreshInterval = 300000,
    baseCurrency = 'USD'
  } = options

  const [state, setState] = useState<CurrencyState>({
    currencies: defaultCurrencies,
    exchangeRates: mockExchangeRates,
    settings: { ...defaultSettings, baseCurrency },
    isLoading: false,
    error: null,
    lastUpdated: null
  })

  // Fetch currencies and exchange rates
  const fetchCurrencyData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In real implementation:
      // const [currenciesResponse, ratesResponse, settingsResponse] = await Promise.all([
      //   currencyService.getCurrencies(),
      //   currencyService.getExchangeRates(baseCurrency),
      //   currencyService.getUserSettings(user?.id)
      // ])

      // Mock successful response
      setState(prev => ({
        ...prev,
        currencies: defaultCurrencies,
        exchangeRates: mockExchangeRates,
        lastUpdated: new Date().toISOString(),
        isLoading: false
      }))

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to fetch currency data',
        isLoading: false
      }))
    }
  }, [baseCurrency, user?.id])

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchCurrencyData()
    }
  }, [autoFetch, fetchCurrencyData])

  // Auto-refresh exchange rates
  useEffect(() => {
    if (!state.settings.autoRefreshRates) return

    const interval = setInterval(() => {
      fetchCurrencyData()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [state.settings.autoRefreshRates, refreshInterval, fetchCurrencyData])

  // Get exchange rate between two currencies
  const getExchangeRate = useCallback((from: string, to: string): number => {
    if (from === to) return 1

    // Direct rate
    const directRate = state.exchangeRates[from]?.[to]
    if (directRate) return directRate.rate

    // Inverse rate
    const inverseRate = state.exchangeRates[to]?.[from]
    if (inverseRate) return 1 / inverseRate.rate

    // Via base currency
    if (from !== state.settings.baseCurrency && to !== state.settings.baseCurrency) {
      const fromToBase = getExchangeRate(from, state.settings.baseCurrency)
      const baseToTo = getExchangeRate(state.settings.baseCurrency, to)
      return fromToBase * baseToTo
    }

    // Fallback
    return 1
  }, [state.exchangeRates, state.settings.baseCurrency])

  // Convert amount between currencies
  const convertAmount = useCallback((
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): number => {
    const rate = getExchangeRate(fromCurrency, toCurrency)
    const converted = amount * rate
    const decimals = state.currencies.find(c => c.code === toCurrency)?.decimals || 2
    return Math.round(converted * Math.pow(10, decimals)) / Math.pow(10, decimals)
  }, [getExchangeRate, state.currencies])

  // Format currency amount
  const formatCurrency = useCallback((
    amount: number,
    currencyCode: string,
    options: {
      showSymbol?: boolean
      showCode?: boolean
      precision?: number
    } = {}
  ): string => {
    const currency = state.currencies.find(c => c.code === currencyCode)
    if (!currency) return `${amount} ${currencyCode}`

    const {
      showSymbol = true,
      showCode = false,
      precision = currency.decimals
    } = options

    const formattedAmount = amount.toLocaleString(undefined, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    })

    if (showSymbol && showCode) {
      return `${currency.symbol} ${formattedAmount} ${currency.code}`
    } else if (showSymbol) {
      return `${currency.symbol} ${formattedAmount}`
    } else if (showCode) {
      return `${formattedAmount} ${currency.code}`
    } else {
      return formattedAmount
    }
  }, [state.currencies])

  // Get currency by code
  const getCurrency = useCallback((code: string): Currency | undefined => {
    return state.currencies.find(c => c.code === code)
  }, [state.currencies])

  // Get allowed currencies
  const allowedCurrencies = useMemo(() => {
    return state.currencies.filter(c =>
      c.isActive && state.settings.allowedCurrencies.includes(c.code)
    )
  }, [state.currencies, state.settings.allowedCurrencies])

  // Get popular currencies (top 6 by usage)
  const popularCurrencies = useMemo(() => {
    const popular = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']
    return state.currencies.filter(c => popular.includes(c.code) && c.isActive)
  }, [state.currencies])

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<CurrencySettings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }))

    try {
      // In real implementation:
      // await currencyService.updateUserSettings(user?.id, newSettings)
    } catch (error) {
      console.error('Failed to update currency settings:', error)
    }
  }, [user?.id])

  // Refresh exchange rates manually
  const refreshRates = useCallback(() => {
    return fetchCurrencyData()
  }, [fetchCurrencyData])

  // Get rate trend
  const getRateTrend = useCallback((from: string, to: string): {
    trend: 'up' | 'down' | 'stable'
    change24h: number
  } | null => {
    const rateInfo = state.exchangeRates[from]?.[to] || state.exchangeRates[to]?.[from]
    if (!rateInfo) return null

    return {
      trend: rateInfo.trend,
      change24h: rateInfo.change24h
    }
  }, [state.exchangeRates])

  // Validate currency amount
  const validateAmount = useCallback((
    amount: number,
    currencyCode: string,
    constraints?: {
      min?: number
      max?: number
      allowZero?: boolean
    }
  ): { isValid: boolean; error?: string } => {
    const { min, max, allowZero = true } = constraints || {}

    if (!allowZero && amount === 0) {
      return { isValid: false, error: 'Amount cannot be zero' }
    }

    if (amount < 0) {
      return { isValid: false, error: 'Amount cannot be negative' }
    }

    if (min !== undefined && amount < min) {
      return {
        isValid: false,
        error: `Amount must be at least ${formatCurrency(min, currencyCode)}`
      }
    }

    if (max !== undefined && amount > max) {
      return {
        isValid: false,
        error: `Amount cannot exceed ${formatCurrency(max, currencyCode)}`
      }
    }

    return { isValid: true }
  }, [formatCurrency])

  // Calculate total in base currency
  const calculateTotal = useCallback((
    amounts: Array<{ amount: number; currency: string }>
  ): number => {
    return amounts.reduce((total, item) => {
      const converted = convertAmount(item.amount, item.currency, state.settings.baseCurrency)
      return total + converted
    }, 0)
  }, [convertAmount, state.settings.baseCurrency])

  return {
    // State
    currencies: state.currencies,
    allowedCurrencies,
    popularCurrencies,
    exchangeRates: state.exchangeRates,
    settings: state.settings,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdated: state.lastUpdated,

    // Actions
    refreshRates,
    updateSettings,

    // Utilities
    getExchangeRate,
    convertAmount,
    formatCurrency,
    getCurrency,
    getRateTrend,
    validateAmount,
    calculateTotal
  }
}

// Hook for managing multi-currency form state
export function useMultiCurrencyForm(initialCurrency = 'USD') {
  const { settings, convertAmount, formatCurrency } = useCurrency()
  const [items, setItems] = useState<Array<{ amount: number; currency: string }>>([])

  const addItem = useCallback((amount: number, currency: string) => {
    setItems(prev => [...prev, { amount, currency }])
  }, [])

  const updateItem = useCallback((index: number, amount: number, currency: string) => {
    setItems(prev => prev.map((item, i) =>
      i === index ? { amount, currency } : item
    ))
  }, [])

  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }, [])

  const getTotalInBaseCurrency = useCallback(() => {
    return items.reduce((total, item) => {
      const converted = convertAmount(item.amount, item.currency, settings.baseCurrency)
      return total + converted
    }, 0)
  }, [items, convertAmount, settings.baseCurrency])

  const getTotalByCurrency = useCallback(() => {
    return items.reduce((acc, item) => {
      if (!acc[item.currency]) {
        acc[item.currency] = 0
      }
      acc[item.currency] += item.amount
      return acc
    }, {} as Record<string, number>)
  }, [items])

  const getFormattedTotal = useCallback(() => {
    const total = getTotalInBaseCurrency()
    return formatCurrency(total, settings.baseCurrency)
  }, [getTotalInBaseCurrency, formatCurrency, settings.baseCurrency])

  return {
    items,
    addItem,
    updateItem,
    removeItem,
    getTotalInBaseCurrency,
    getTotalByCurrency,
    getFormattedTotal
  }
}