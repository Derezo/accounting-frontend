import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './useAuth'

// Types for analytics data
export interface AnalyticsMetric {
  name: string
  value: number
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  period: string
  currency?: string
  format?: 'currency' | 'number' | 'percentage'
}

export interface TimeSeriesData {
  date: string
  value: number
  category?: string
  [key: string]: any
}

export interface AnalyticsFilter {
  dateRange: string
  period: 'day' | 'week' | 'month' | 'quarter' | 'year'
  categories?: string[]
  customerSegment?: string
  paymentMethod?: string
}

export interface AnalyticsData {
  metrics: AnalyticsMetric[]
  revenue: TimeSeriesData[]
  customers: TimeSeriesData[]
  invoices: TimeSeriesData[]
  payments: TimeSeriesData[]
  cashFlow: TimeSeriesData[]
  lastUpdated: string
}

export interface UseAnalyticsOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  defaultFilter?: Partial<AnalyticsFilter>
}

interface AnalyticsState {
  data: AnalyticsData | null
  isLoading: boolean
  error: string | null
  filter: AnalyticsFilter
  lastFetch: string | null
}

// Mock analytics data
const generateMockTimeSeriesData = (
  days: number,
  baseValue: number,
  volatility: number = 0.1
): TimeSeriesData[] => {
  const data: TimeSeriesData[] = []
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)

    const randomFactor = 1 + (Math.random() - 0.5) * volatility
    const trendFactor = 1 + (i / days) * 0.2 // 20% growth over period
    const value = baseValue * randomFactor * trendFactor

    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value)
    })
  }

  return data
}

const mockAnalyticsData: AnalyticsData = {
  metrics: [
    {
      name: 'Total Revenue',
      value: 245680,
      change: 12.5,
      changeType: 'increase',
      period: 'month',
      currency: 'USD',
      format: 'currency'
    },
    {
      name: 'Outstanding Amount',
      value: 18450,
      change: -8.2,
      changeType: 'decrease',
      period: 'month',
      currency: 'USD',
      format: 'currency'
    },
    {
      name: 'Active Customers',
      value: 1247,
      change: 15.3,
      changeType: 'increase',
      period: 'month',
      format: 'number'
    },
    {
      name: 'Collection Rate',
      value: 94.2,
      change: 2.1,
      changeType: 'increase',
      period: 'month',
      format: 'percentage'
    },
    {
      name: 'Average Deal Size',
      value: 1847,
      change: 8.7,
      changeType: 'increase',
      period: 'month',
      currency: 'USD',
      format: 'currency'
    },
    {
      name: 'Monthly Recurring Revenue',
      value: 89450,
      change: 6.3,
      changeType: 'increase',
      period: 'month',
      currency: 'USD',
      format: 'currency'
    }
  ],
  revenue: generateMockTimeSeriesData(30, 8000, 0.15),
  customers: generateMockTimeSeriesData(30, 40, 0.2),
  invoices: generateMockTimeSeriesData(30, 35, 0.25),
  payments: generateMockTimeSeriesData(30, 32, 0.2),
  cashFlow: generateMockTimeSeriesData(30, 5000, 0.3),
  lastUpdated: new Date().toISOString()
}

const defaultFilter: AnalyticsFilter = {
  dateRange: '30d',
  period: 'day'
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { user } = useAuth()
  const {
    autoRefresh = false,
    refreshInterval = 300000, // 5 minutes
    defaultFilter: userDefaultFilter = {}
  } = options

  const [state, setState] = useState<AnalyticsState>({
    data: null,
    isLoading: false,
    error: null,
    filter: { ...defaultFilter, ...userDefaultFilter },
    lastFetch: null
  })

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchAnalytics()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, state.filter])

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchAnalytics()
    }
  }, [user, state.filter])

  const fetchAnalytics = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In real implementation:
      // const response = await analyticsService.getAnalytics(state.filter)

      // For now, return mock data
      const data = mockAnalyticsData

      setState(prev => ({
        ...prev,
        data,
        isLoading: false,
        lastFetch: new Date().toISOString()
      }))
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to fetch analytics data',
        isLoading: false
      }))
    }
  }, [state.filter])

  const updateFilter = useCallback((newFilter: Partial<AnalyticsFilter>) => {
    setState(prev => ({
      ...prev,
      filter: { ...prev.filter, ...newFilter }
    }))
  }, [])

  const getMetricByName = useCallback((name: string): AnalyticsMetric | undefined => {
    return state.data?.metrics.find(metric => metric.name === name)
  }, [state.data])

  const getTimeSeriesData = useCallback((type: keyof Omit<AnalyticsData, 'metrics' | 'lastUpdated'>) => {
    return state.data?.[type] || []
  }, [state.data])

  // Calculate derived metrics
  const derivedMetrics = useMemo(() => {
    if (!state.data) return null

    const { revenue, customers, payments } = state.data

    // Calculate growth rates
    const revenueGrowth = revenue.length >= 2
      ? ((revenue[revenue.length - 1].value - revenue[revenue.length - 2].value) / revenue[revenue.length - 2].value) * 100
      : 0

    const customerGrowth = customers.length >= 2
      ? ((customers[customers.length - 1].value - customers[customers.length - 2].value) / customers[customers.length - 2].value) * 100
      : 0

    // Calculate totals
    const totalRevenue = revenue.reduce((sum, item) => sum + item.value, 0)
    const totalCustomers = customers[customers.length - 1]?.value || 0
    const totalPayments = payments.reduce((sum, item) => sum + item.value, 0)

    // Calculate averages
    const avgDailyRevenue = totalRevenue / revenue.length
    const avgCustomerValue = totalRevenue / totalCustomers

    return {
      revenueGrowth,
      customerGrowth,
      totalRevenue,
      totalCustomers,
      totalPayments,
      avgDailyRevenue,
      avgCustomerValue
    }
  }, [state.data])

  // Get data for specific date range
  const getDataForDateRange = useCallback((
    data: TimeSeriesData[],
    startDate: string,
    endDate: string
  ): TimeSeriesData[] => {
    return data.filter(item => {
      const itemDate = new Date(item.date)
      const start = new Date(startDate)
      const end = new Date(endDate)
      return itemDate >= start && itemDate <= end
    })
  }, [])

  // Export data functionality
  const exportData = useCallback(async (format: 'csv' | 'json' | 'excel') => {
    if (!state.data) throw new Error('No data to export')

    try {
      // In real implementation:
      // return await analyticsService.exportData(state.data, format, state.filter)

      // Mock export
      const exportData = {
        metrics: state.data.metrics,
        revenue: state.data.revenue,
        customers: state.data.customers,
        filter: state.filter,
        exportedAt: new Date().toISOString()
      }

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)
      } else if (format === 'csv') {
        // Convert to CSV format
        const csvContent = convertToCSV(state.data.revenue)
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-${Date.now()}.csv`
        a.click()
        URL.revokeObjectURL(url)
      }

      return true
    } catch (error: any) {
      throw new Error(error.message || 'Failed to export data')
    }
  }, [state.data, state.filter])

  // Helper function to convert data to CSV
  const convertToCSV = (data: TimeSeriesData[]): string => {
    if (data.length === 0) return ''

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n')

    return csvContent
  }

  // Compare periods functionality
  const comparePeriods = useCallback((
    currentPeriod: { start: string; end: string },
    previousPeriod: { start: string; end: string }
  ) => {
    if (!state.data) return null

    const currentData = getDataForDateRange(state.data.revenue, currentPeriod.start, currentPeriod.end)
    const previousData = getDataForDateRange(state.data.revenue, previousPeriod.start, previousPeriod.end)

    const currentTotal = currentData.reduce((sum, item) => sum + item.value, 0)
    const previousTotal = previousData.reduce((sum, item) => sum + item.value, 0)

    const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0

    return {
      current: currentTotal,
      previous: previousTotal,
      change,
      changeType: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral'
    }
  }, [state.data, getDataForDateRange])

  // Forecast functionality (simple linear regression)
  const generateForecast = useCallback((
    data: TimeSeriesData[],
    days: number
  ): TimeSeriesData[] => {
    if (data.length < 2) return []

    // Simple linear trend calculation
    const n = data.length
    const sumX = data.reduce((sum, _, index) => sum + index, 0)
    const sumY = data.reduce((sum, item) => sum + item.value, 0)
    const sumXY = data.reduce((sum, item, index) => sum + index * item.value, 0)
    const sumXX = data.reduce((sum, _, index) => sum + index * index, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    const forecast: TimeSeriesData[] = []
    const lastDate = new Date(data[data.length - 1].date)

    for (let i = 1; i <= days; i++) {
      const futureDate = new Date(lastDate)
      futureDate.setDate(futureDate.getDate() + i)

      const forecastValue = slope * (n + i - 1) + intercept

      forecast.push({
        date: futureDate.toISOString().split('T')[0],
        value: Math.max(0, Math.round(forecastValue)) // Ensure non-negative
      })
    }

    return forecast
  }, [])

  return {
    // State
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    filter: state.filter,
    lastFetch: state.lastFetch,
    derivedMetrics,

    // Actions
    fetchAnalytics,
    updateFilter,
    exportData,

    // Utilities
    getMetricByName,
    getTimeSeriesData,
    getDataForDateRange,
    comparePeriods,
    generateForecast
  }
}

// Hook for specific metric tracking
export function useMetricTracking(metricName: string, options: UseAnalyticsOptions = {}) {
  const { data, isLoading, error, getMetricByName, fetchAnalytics } = useAnalytics(options)

  const metric = useMemo(() => {
    return getMetricByName(metricName)
  }, [data, metricName, getMetricByName])

  const refresh = useCallback(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return {
    metric,
    isLoading,
    error,
    refresh
  }
}

// Hook for revenue analytics
export function useRevenueAnalytics(options: UseAnalyticsOptions = {}) {
  const { data, isLoading, error, getTimeSeriesData, derivedMetrics, updateFilter, filter } = useAnalytics(options)

  const revenueData = useMemo(() => {
    return getTimeSeriesData('revenue')
  }, [data, getTimeSeriesData])

  const revenueMetrics = useMemo(() => {
    if (!derivedMetrics) return null

    return {
      totalRevenue: derivedMetrics.totalRevenue,
      avgDailyRevenue: derivedMetrics.avgDailyRevenue,
      revenueGrowth: derivedMetrics.revenueGrowth
    }
  }, [derivedMetrics])

  return {
    revenueData,
    revenueMetrics,
    isLoading,
    error,
    filter,
    updateFilter
  }
}

// Hook for customer analytics
export function useCustomerAnalytics(options: UseAnalyticsOptions = {}) {
  const { data, isLoading, error, getTimeSeriesData, derivedMetrics, updateFilter, filter } = useAnalytics(options)

  const customerData = useMemo(() => {
    return getTimeSeriesData('customers')
  }, [data, getTimeSeriesData])

  const customerMetrics = useMemo(() => {
    if (!derivedMetrics) return null

    return {
      totalCustomers: derivedMetrics.totalCustomers,
      customerGrowth: derivedMetrics.customerGrowth,
      avgCustomerValue: derivedMetrics.avgCustomerValue
    }
  }, [derivedMetrics])

  return {
    customerData,
    customerMetrics,
    isLoading,
    error,
    filter,
    updateFilter
  }
}