import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './useAuth'
import type {
  ReportTemplate,
  ReportInstance,
  ReportFilter,
  ReportData,
  UseReportsOptions,
  ReportExportOptions,
  ReportStatus,
  ReportFormat,
  ReportCategory,
  ReportType
} from '@/types/reports'

interface ReportsState {
  templates: ReportTemplate[]
  instances: ReportInstance[]
  currentReport: ReportData | null
  isLoading: boolean
  error: string | null
  filter: ReportFilter
  currentPage: number
  totalPages: number
  totalInstances: number
  pageSize: number
  lastFetch: string | null
}

const defaultFilter: ReportFilter = {
  dateRange: {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  }
}

// Mock report templates
const mockTemplates: ReportTemplate[] = [
  {
    id: 'income-statement',
    name: 'Income Statement',
    description: 'Comprehensive income statement showing revenue, expenses, and net income',
    category: 'FINANCIAL',
    type: 'INCOME_STATEMENT',
    parameters: [
      {
        id: 'period',
        name: 'period',
        label: 'Reporting Period',
        type: 'dateRange',
        required: true
      },
      {
        id: 'includeComparisons',
        name: 'includeComparisons',
        label: 'Include Previous Period Comparisons',
        type: 'boolean',
        required: false,
        defaultValue: true
      }
    ],
    outputFormats: ['PDF', 'EXCEL', 'CSV'],
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system'
  },
  {
    id: 'balance-sheet',
    name: 'Balance Sheet',
    description: 'Statement of financial position showing assets, liabilities, and equity',
    category: 'FINANCIAL',
    type: 'BALANCE_SHEET',
    parameters: [
      {
        id: 'asOfDate',
        name: 'asOfDate',
        label: 'As of Date',
        type: 'date',
        required: true,
        defaultValue: new Date().toISOString().split('T')[0]
      },
      {
        id: 'includeComparisons',
        name: 'includeComparisons',
        label: 'Include Previous Year Comparison',
        type: 'boolean',
        required: false,
        defaultValue: false
      }
    ],
    outputFormats: ['PDF', 'EXCEL'],
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system'
  },
  {
    id: 'aged-receivables',
    name: 'Aged Receivables Report',
    description: 'Customer outstanding balances aged by days past due',
    category: 'CUSTOMER',
    type: 'AGED_RECEIVABLES',
    parameters: [
      {
        id: 'asOfDate',
        name: 'asOfDate',
        label: 'As of Date',
        type: 'date',
        required: true,
        defaultValue: new Date().toISOString().split('T')[0]
      },
      {
        id: 'agingPeriods',
        name: 'agingPeriods',
        label: 'Aging Periods',
        type: 'select',
        required: true,
        defaultValue: '30-60-90',
        options: [
          { value: '30-60-90', label: '30-60-90 Days' },
          { value: '15-30-60-90', label: '15-30-60-90 Days' },
          { value: '30-60-90-120', label: '30-60-90-120 Days' }
        ]
      },
      {
        id: 'includeZeroBalances',
        name: 'includeZeroBalances',
        label: 'Include Zero Balances',
        type: 'boolean',
        required: false,
        defaultValue: false
      }
    ],
    outputFormats: ['PDF', 'EXCEL', 'CSV'],
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system'
  },
  {
    id: 'sales-summary',
    name: 'Sales Summary Report',
    description: 'Summary of sales by customer, product, and time period',
    category: 'ANALYTICS',
    type: 'SALES_REPORT',
    parameters: [
      {
        id: 'period',
        name: 'period',
        label: 'Reporting Period',
        type: 'dateRange',
        required: true
      },
      {
        id: 'groupBy',
        name: 'groupBy',
        label: 'Group By',
        type: 'select',
        required: true,
        defaultValue: 'customer',
        options: [
          { value: 'customer', label: 'Customer' },
          { value: 'product', label: 'Product/Service' },
          { value: 'month', label: 'Month' },
          { value: 'salesperson', label: 'Salesperson' }
        ]
      },
      {
        id: 'includeCharts',
        name: 'includeCharts',
        label: 'Include Charts',
        type: 'boolean',
        required: false,
        defaultValue: true
      }
    ],
    outputFormats: ['PDF', 'EXCEL', 'CSV'],
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system'
  },
  {
    id: 'tax-summary',
    name: 'Tax Summary Report',
    description: 'Summary of tax collected and owing by period',
    category: 'TAX',
    type: 'TAX_SUMMARY',
    parameters: [
      {
        id: 'period',
        name: 'period',
        label: 'Tax Period',
        type: 'dateRange',
        required: true
      },
      {
        id: 'taxType',
        name: 'taxType',
        label: 'Tax Type',
        type: 'multiSelect',
        required: false,
        options: [
          { value: 'GST', label: 'GST/HST' },
          { value: 'PST', label: 'PST' },
          { value: 'QST', label: 'QST' },
          { value: 'sales', label: 'Sales Tax' }
        ]
      }
    ],
    outputFormats: ['PDF', 'EXCEL', 'CSV'],
    isCustom: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'system'
  }
]

const generateMockInstance = (index: number): ReportInstance => {
  const template = mockTemplates[Math.floor(Math.random() * mockTemplates.length)]
  const statuses: ReportStatus[] = ['COMPLETED', 'RUNNING', 'FAILED', 'PENDING']
  const formats: ReportFormat[] = ['PDF', 'EXCEL', 'CSV']
  const status = statuses[Math.floor(Math.random() * statuses.length)]

  const startTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  const endTime = status === 'COMPLETED' || status === 'FAILED'
    ? new Date(new Date(startTime).getTime() + Math.random() * 60000).toISOString()
    : undefined

  return {
    id: `report-${index}`,
    templateId: template.id,
    templateName: template.name,
    parameters: {
      period: { from: '2024-01-01', to: '2024-01-31' },
      includeComparisons: true
    },
    status,
    progress: status === 'RUNNING' ? Math.floor(Math.random() * 100) : undefined,
    startTime,
    endTime,
    duration: endTime ? new Date(endTime).getTime() - new Date(startTime).getTime() : undefined,
    fileUrl: status === 'COMPLETED' ? `/reports/download/${index}` : undefined,
    fileName: status === 'COMPLETED' ? `${template.name.replace(/\s+/g, '_')}_${Date.now()}.pdf` : undefined,
    fileSize: status === 'COMPLETED' ? Math.floor(Math.random() * 2000000) + 100000 : undefined,
    format: formats[Math.floor(Math.random() * formats.length)],
    generatedBy: 'Current User',
    error: status === 'FAILED' ? 'Database connection timeout' : undefined,
    downloadCount: status === 'COMPLETED' ? Math.floor(Math.random() * 10) : 0,
    expiresAt: status === 'COMPLETED'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : undefined
  }
}

const generateMockReportData = (templateId: string, parameters: Record<string, any>): ReportData => {
  return {
    title: mockTemplates.find(t => t.id === templateId)?.name || 'Report',
    subtitle: `Generated on ${new Date().toLocaleDateString()}`,
    generatedAt: new Date().toISOString(),
    parameters,
    sections: [
      {
        id: 'summary',
        title: 'Executive Summary',
        type: 'summary',
        data: {
          totalRevenue: 125000,
          totalExpenses: 85000,
          netIncome: 40000,
          margin: 32
        }
      },
      {
        id: 'details',
        title: 'Detailed Breakdown',
        type: 'table',
        columns: [
          { key: 'account', title: 'Account', type: 'text', align: 'left' },
          { key: 'amount', title: 'Amount', type: 'currency', align: 'right' },
          { key: 'percentage', title: 'Percentage', type: 'percentage', align: 'right' }
        ],
        data: [
          { account: 'Revenue', amount: 125000, percentage: 100 },
          { account: 'Cost of Goods Sold', amount: 50000, percentage: 40 },
          { account: 'Operating Expenses', amount: 35000, percentage: 28 },
          { account: 'Net Income', amount: 40000, percentage: 32 }
        ]
      },
      {
        id: 'chart',
        title: 'Revenue Trend',
        type: 'chart',
        chartConfig: {
          type: 'line',
          xAxis: 'month',
          yAxis: 'revenue'
        },
        data: [
          { month: 'Jan', revenue: 120000 },
          { month: 'Feb', revenue: 135000 },
          { month: 'Mar', revenue: 125000 },
          { month: 'Apr', revenue: 140000 },
          { month: 'May', revenue: 155000 },
          { month: 'Jun', revenue: 125000 }
        ]
      }
    ],
    summary: {
      totalRecords: 250,
      totalAmount: 125000,
      currency: 'USD',
      calculations: [
        { label: 'Total Revenue', value: 125000, type: 'currency' },
        { label: 'Total Expenses', value: 85000, type: 'currency' },
        { label: 'Net Margin', value: 32, type: 'percentage' }
      ]
    }
  }
}

export function useReports(options: UseReportsOptions = {}) {
  const { user } = useAuth()
  const {
    autoRefresh = false,
    refreshInterval = 30000,
    defaultFilter: userDefaultFilter = {},
    pageSize: defaultPageSize = 20
  } = options

  const [state, setState] = useState<ReportsState>({
    templates: [],
    instances: [],
    currentReport: null,
    isLoading: false,
    error: null,
    filter: { ...defaultFilter, ...userDefaultFilter },
    currentPage: 1,
    totalPages: 1,
    totalInstances: 0,
    pageSize: defaultPageSize,
    lastFetch: null
  })

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchReports()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, state.filter, state.currentPage])

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchReports()
      fetchTemplates()
    }
  }, [user, state.filter, state.currentPage])

  const fetchTemplates = useCallback(async () => {
    try {
      // In real implementation:
      // const response = await reportService.getTemplates()

      setState(prev => ({ ...prev, templates: mockTemplates }))
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message || 'Failed to fetch templates' }))
    }
  }, [])

  const fetchReports = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In real implementation:
      // const response = await reportService.getReports(state.filter, state.currentPage, state.pageSize)

      // Generate mock data
      const totalMockInstances = 50
      const startIndex = (state.currentPage - 1) * state.pageSize
      const endIndex = Math.min(startIndex + state.pageSize, totalMockInstances)

      const instances = Array.from({ length: endIndex - startIndex }, (_, i) =>
        generateMockInstance(startIndex + i)
      ).filter(instance => {
        // Apply filters
        if (state.filter.category) {
          const template = mockTemplates.find(t => t.id === instance.templateId)
          if (!template || template.category !== state.filter.category) return false
        }
        if (state.filter.status && instance.status !== state.filter.status) return false
        if (state.filter.search) {
          const search = state.filter.search.toLowerCase()
          const searchable = `${instance.templateName} ${instance.generatedBy}`.toLowerCase()
          if (!searchable.includes(search)) return false
        }

        // Date range filter
        if (state.filter.dateRange) {
          const instanceDate = new Date(instance.startTime)
          const fromDate = new Date(state.filter.dateRange.from)
          const toDate = new Date(state.filter.dateRange.to + 'T23:59:59')
          if (instanceDate < fromDate || instanceDate > toDate) return false
        }

        return true
      })

      setState(prev => ({
        ...prev,
        instances,
        isLoading: false,
        totalInstances: totalMockInstances,
        totalPages: Math.ceil(totalMockInstances / state.pageSize),
        lastFetch: new Date().toISOString()
      }))
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to fetch reports',
        isLoading: false
      }))
    }
  }, [state.filter, state.currentPage, state.pageSize])

  const generateReport = useCallback(async (templateId: string, parameters: Record<string, any>, format: ReportFormat = 'PDF') => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      // In real implementation:
      // const response = await reportService.generateReport(templateId, parameters, format)

      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000))

      const newInstance: ReportInstance = {
        id: `report-${Date.now()}`,
        templateId,
        templateName: mockTemplates.find(t => t.id === templateId)?.name || 'Report',
        parameters,
        status: 'COMPLETED',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: 2000,
        fileUrl: `/reports/download/${Date.now()}`,
        fileName: `report-${Date.now()}.${format.toLowerCase()}`,
        fileSize: 500000,
        format,
        generatedBy: user?.name || 'Unknown',
        downloadCount: 0,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }

      setState(prev => ({
        ...prev,
        instances: [newInstance, ...prev.instances],
        isLoading: false
      }))

      return newInstance
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to generate report',
        isLoading: false
      }))
      throw error
    }
  }, [user])

  const previewReport = useCallback(async (templateId: string, parameters: Record<string, any>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      // In real implementation:
      // const response = await reportService.previewReport(templateId, parameters)

      // Simulate preview generation
      await new Promise(resolve => setTimeout(resolve, 1000))

      const reportData = generateMockReportData(templateId, parameters)

      setState(prev => ({
        ...prev,
        currentReport: reportData,
        isLoading: false
      }))

      return reportData
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to preview report',
        isLoading: false
      }))
      throw error
    }
  }, [])

  const downloadReport = useCallback(async (instanceId: string) => {
    try {
      const instance = state.instances.find(i => i.id === instanceId)
      if (!instance || !instance.fileUrl) {
        throw new Error('Report file not found')
      }

      // In real implementation:
      // const response = await reportService.downloadReport(instanceId)

      // Simulate download
      const link = document.createElement('a')
      link.href = instance.fileUrl
      link.download = instance.fileName || 'report'
      link.click()

      // Update download count
      setState(prev => ({
        ...prev,
        instances: prev.instances.map(i =>
          i.id === instanceId ? { ...i, downloadCount: i.downloadCount + 1 } : i
        )
      }))

      return true
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to download report'
      }))
      throw error
    }
  }, [state.instances])

  const deleteReport = useCallback(async (instanceId: string) => {
    try {
      // In real implementation:
      // await reportService.deleteReport(instanceId)

      setState(prev => ({
        ...prev,
        instances: prev.instances.filter(i => i.id !== instanceId)
      }))

      return true
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to delete report'
      }))
      throw error
    }
  }, [])

  const updateFilter = useCallback((newFilter: Partial<ReportFilter>) => {
    setState(prev => ({
      ...prev,
      filter: { ...prev.filter, ...newFilter },
      currentPage: 1
    }))
  }, [])

  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }))
  }, [])

  const clearFilter = useCallback(() => {
    setState(prev => ({
      ...prev,
      filter: defaultFilter,
      currentPage: 1
    }))
  }, [])

  const getTemplateById = useCallback((id: string) => {
    return state.templates.find(template => template.id === id)
  }, [state.templates])

  const getTemplatesByCategory = useCallback((category: ReportCategory) => {
    return state.templates.filter(template => template.category === category)
  }, [state.templates])

  // Calculate summary metrics
  const metrics = useMemo(() => {
    const today = new Date()
    const todayInstances = state.instances.filter(i =>
      new Date(i.startTime).toDateString() === today.toDateString()
    )
    const completedInstances = state.instances.filter(i => i.status === 'COMPLETED')
    const runningInstances = state.instances.filter(i => i.status === 'RUNNING')
    const failedInstances = state.instances.filter(i => i.status === 'FAILED')

    return {
      totalReports: state.instances.length,
      todayReports: todayInstances.length,
      completedReports: completedInstances.length,
      runningReports: runningInstances.length,
      failedReports: failedInstances.length,
      successRate: state.instances.length > 0
        ? (completedInstances.length / state.instances.length) * 100
        : 0
    }
  }, [state.instances])

  return {
    // State
    templates: state.templates,
    instances: state.instances,
    currentReport: state.currentReport,
    isLoading: state.isLoading,
    error: state.error,
    filter: state.filter,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    totalInstances: state.totalInstances,
    pageSize: state.pageSize,
    lastFetch: state.lastFetch,
    metrics,

    // Actions
    fetchReports,
    fetchTemplates,
    generateReport,
    previewReport,
    downloadReport,
    deleteReport,
    updateFilter,
    setPage,
    clearFilter,

    // Utilities
    getTemplateById,
    getTemplatesByCategory
  }
}