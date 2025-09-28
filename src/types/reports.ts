export interface ReportTemplate {
  id: string
  name: string
  description: string
  category: ReportCategory
  type: ReportType
  parameters: ReportParameter[]
  schedule?: ReportSchedule
  outputFormats: ReportFormat[]
  isCustom: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface ReportParameter {
  id: string
  name: string
  label: string
  type: 'date' | 'dateRange' | 'select' | 'multiSelect' | 'text' | 'number' | 'boolean'
  required: boolean
  defaultValue?: any
  options?: Array<{ value: string; label: string }>
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

export interface ReportSchedule {
  id: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  time: string // HH:mm format
  dayOfWeek?: number // 0-6, Sunday = 0
  dayOfMonth?: number // 1-31
  recipients: string[]
  isActive: boolean
  nextRun: string
  lastRun?: string
}

export interface ReportInstance {
  id: string
  templateId: string
  templateName: string
  parameters: Record<string, any>
  status: ReportStatus
  progress?: number
  startTime: string
  endTime?: string
  duration?: number
  fileUrl?: string
  fileName?: string
  fileSize?: number
  format: ReportFormat
  generatedBy: string
  error?: string
  downloadCount: number
  expiresAt?: string
}

export type ReportCategory =
  | 'FINANCIAL'
  | 'CUSTOMER'
  | 'INVOICE'
  | 'PAYMENT'
  | 'TAX'
  | 'ANALYTICS'
  | 'AUDIT'
  | 'COMPLIANCE'
  | 'CUSTOM'

export type ReportType =
  | 'INCOME_STATEMENT'
  | 'BALANCE_SHEET'
  | 'CASH_FLOW'
  | 'TRIAL_BALANCE'
  | 'AGED_RECEIVABLES'
  | 'AGED_PAYABLES'
  | 'CUSTOMER_STATEMENT'
  | 'INVOICE_SUMMARY'
  | 'PAYMENT_SUMMARY'
  | 'TAX_SUMMARY'
  | 'SALES_REPORT'
  | 'EXPENSE_REPORT'
  | 'PROFIT_LOSS'
  | 'BUDGET_VARIANCE'
  | 'CUSTOM_QUERY'

export type ReportStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'

export type ReportFormat =
  | 'PDF'
  | 'EXCEL'
  | 'CSV'
  | 'JSON'
  | 'HTML'

export interface ReportFilter {
  category?: ReportCategory
  type?: ReportType
  status?: ReportStatus
  createdBy?: string
  dateRange?: {
    from: string
    to: string
  }
  search?: string
}

export interface ReportData {
  title: string
  subtitle?: string
  generatedAt: string
  parameters: Record<string, any>
  sections: ReportSection[]
  summary?: ReportSummary
  metadata?: Record<string, any>
}

export interface ReportSection {
  id: string
  title: string
  type: 'table' | 'chart' | 'text' | 'summary' | 'breakdown'
  data: any
  columns?: ReportColumn[]
  chartConfig?: {
    type: 'bar' | 'line' | 'pie' | 'area'
    xAxis: string
    yAxis: string
    colors?: string[]
  }
}

export interface ReportColumn {
  key: string
  title: string
  type: 'text' | 'number' | 'currency' | 'date' | 'percentage'
  width?: number
  align?: 'left' | 'center' | 'right'
  format?: string
}

export interface ReportSummary {
  totalRecords: number
  totalAmount?: number
  currency?: string
  calculations?: Array<{
    label: string
    value: number
    type: 'currency' | 'number' | 'percentage'
  }>
}

export interface UseReportsOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  defaultFilter?: Partial<ReportFilter>
  pageSize?: number
}

export interface ReportExportOptions {
  format: ReportFormat
  includeCharts: boolean
  includeRawData: boolean
  templateId?: string
  customName?: string
}

export interface CustomReportBuilder {
  name: string
  description: string
  dataSource: string
  fields: ReportField[]
  filters: ReportFilterConfig[]
  groupBy?: string[]
  sortBy?: Array<{
    field: string
    direction: 'asc' | 'desc'
  }>
  aggregations?: ReportAggregation[]
}

export interface ReportField {
  id: string
  name: string
  label: string
  type: 'string' | 'number' | 'date' | 'boolean'
  source: string
  calculation?: 'sum' | 'count' | 'avg' | 'min' | 'max'
  format?: string
}

export interface ReportFilterConfig {
  field: string
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in'
  value: any
  label: string
}

export interface ReportAggregation {
  field: string
  function: 'sum' | 'count' | 'avg' | 'min' | 'max'
  label: string
}