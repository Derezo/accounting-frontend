// Advanced Analytics and Reporting Types for Financial Analysis

export interface AnalyticsDashboard {
  id: string
  name: string
  description?: string
  isDefault: boolean
  isPublic: boolean
  createdBy: string
  widgets: DashboardWidget[]
  layout: WidgetLayout[]
  refreshInterval: number // seconds
  dateRange: {
    start: string
    end: string
    preset: 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_90_DAYS' | 'LAST_YEAR' | 'YEAR_TO_DATE' | 'CUSTOM'
  }
  filters: DashboardFilter[]
  permissions: {
    canView: string[]
    canEdit: string[]
    canShare: string[]
  }
  metadata: {
    tags: string[]
    category: string
    industry?: string
    businessSize?: 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE'
  }
  createdAt: string
  updatedAt: string
}

export interface DashboardWidget {
  id: string
  type: WidgetType
  title: string
  description?: string
  dataSource: string
  query: AnalyticsQuery
  visualization: VisualizationConfig
  position: { x: number; y: number; width: number; height: number }
  refreshInterval?: number
  alerts?: WidgetAlert[]
  drillDownConfig?: DrillDownConfig
  exportConfig?: ExportConfig
  isVisible: boolean
  createdAt: string
  updatedAt: string
}

export type WidgetType =
  | 'KPI_CARD'
  | 'LINE_CHART'
  | 'BAR_CHART'
  | 'PIE_CHART'
  | 'AREA_CHART'
  | 'SCATTER_PLOT'
  | 'HEATMAP'
  | 'TABLE'
  | 'PIVOT_TABLE'
  | 'GAUGE'
  | 'WATERFALL'
  | 'FUNNEL'
  | 'SANKEY'
  | 'TREEMAP'
  | 'CALENDAR_HEATMAP'
  | 'GEOGRAPHIC_MAP'
  | 'COHORT_ANALYSIS'
  | 'RETENTION_CHART'

export interface VisualizationConfig {
  chartType: WidgetType
  xAxis?: AxisConfig
  yAxis?: AxisConfig
  series: SeriesConfig[]
  colors: ColorScheme
  legend: LegendConfig
  grid: GridConfig
  annotations?: AnnotationConfig[]
  interaction: InteractionConfig
  responsive: boolean
  animation: AnimationConfig
}

export interface AxisConfig {
  field: string
  label?: string
  type: 'CATEGORY' | 'VALUE' | 'TIME' | 'LOG'
  format?: string
  min?: number
  max?: number
  tickInterval?: number
  reversed?: boolean
  gridLines: boolean
}

export interface SeriesConfig {
  name: string
  field: string
  type: 'LINE' | 'BAR' | 'AREA' | 'SCATTER' | 'PIE'
  color?: string
  visible: boolean
  yAxisIndex?: number
  stack?: string
  smooth?: boolean
  aggregation?: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX' | 'DISTINCT_COUNT'
  format?: string
}

export interface ColorScheme {
  type: 'GRADIENT' | 'CATEGORICAL' | 'SEQUENTIAL' | 'DIVERGING'
  colors: string[]
  opacity?: number
}

export interface LegendConfig {
  show: boolean
  position: 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT'
  orientation: 'HORIZONTAL' | 'VERTICAL'
  align: 'START' | 'CENTER' | 'END'
}

export interface GridConfig {
  show: boolean
  x: boolean
  y: boolean
  lineStyle: 'SOLID' | 'DASHED' | 'DOTTED'
  color: string
  opacity: number
}

export interface AnnotationConfig {
  type: 'LINE' | 'BAND' | 'POINT' | 'TEXT'
  value: any
  label?: string
  color: string
  style?: 'SOLID' | 'DASHED' | 'DOTTED'
}

export interface InteractionConfig {
  zoom: boolean
  pan: boolean
  brush: boolean
  tooltip: TooltipConfig
  crossfilter: boolean
  clickAction?: 'DRILL_DOWN' | 'FILTER' | 'NAVIGATE' | 'CUSTOM'
}

export interface TooltipConfig {
  show: boolean
  trigger: 'HOVER' | 'CLICK'
  format: string
  fields: string[]
  customTemplate?: string
}

export interface AnimationConfig {
  enabled: boolean
  duration: number
  easing: 'LINEAR' | 'EASE_IN' | 'EASE_OUT' | 'EASE_IN_OUT' | 'BOUNCE'
  delay?: number
}

export interface WidgetLayout {
  widgetId: string
  x: number
  y: number
  width: number
  height: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  isResizable: boolean
  isDraggable: boolean
}

export interface DashboardFilter {
  id: string
  name: string
  type: 'DATE_RANGE' | 'DROPDOWN' | 'MULTI_SELECT' | 'TEXT' | 'NUMBER_RANGE' | 'BOOLEAN'
  field: string
  options?: FilterOption[]
  defaultValue?: any
  isRequired: boolean
  appliedTo: string[] // widget IDs
}

export interface FilterOption {
  label: string
  value: any
  group?: string
}

export interface AnalyticsQuery {
  dataSource: string
  metrics: MetricDefinition[]
  dimensions: DimensionDefinition[]
  filters: QueryFilter[]
  timeGrain?: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR'
  limit?: number
  offset?: number
  orderBy?: OrderByClause[]
  having?: QueryFilter[]
  groupBy?: string[]
}

export interface MetricDefinition {
  name: string
  field: string
  aggregation: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX' | 'DISTINCT_COUNT' | 'PERCENTILE' | 'CUSTOM'
  percentile?: number
  customExpression?: string
  format?: string
  label?: string
}

export interface DimensionDefinition {
  name: string
  field: string
  type: 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN'
  format?: string
  label?: string
  hierarchy?: string[]
}

export interface QueryFilter {
  field: string
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'GREATER_EQUAL' | 'LESS_EQUAL' | 'IN' | 'NOT_IN' | 'CONTAINS' | 'NOT_CONTAINS' | 'BETWEEN' | 'IS_NULL' | 'IS_NOT_NULL'
  value: any
  logicalOperator?: 'AND' | 'OR'
}

export interface OrderByClause {
  field: string
  direction: 'ASC' | 'DESC'
}

export interface WidgetAlert {
  id: string
  name: string
  condition: AlertCondition
  notification: AlertNotification
  isActive: boolean
  lastTriggered?: string
  createdAt: string
}

export interface AlertCondition {
  metric: string
  operator: 'GREATER_THAN' | 'LESS_THAN' | 'EQUALS' | 'BETWEEN' | 'CHANGE_PERCENTAGE'
  threshold: number | [number, number]
  timeWindow?: number // minutes
  frequency: 'REAL_TIME' | 'HOURLY' | 'DAILY' | 'WEEKLY'
}

export interface AlertNotification {
  channels: ('EMAIL' | 'SMS' | 'SLACK' | 'WEBHOOK')[]
  recipients: string[]
  message?: string
  webhookUrl?: string
  slackChannel?: string
}

export interface DrillDownConfig {
  enabled: boolean
  targetDashboard?: string
  targetWidget?: string
  passFilters: boolean
  customParams?: Record<string, any>
}

export interface ExportConfig {
  formats: ('PDF' | 'PNG' | 'SVG' | 'CSV' | 'EXCEL')[]
  schedule?: ExportSchedule
  recipients?: string[]
}

export interface ExportSchedule {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  time: string // HH:mm format
  timezone: string
  dayOfWeek?: number // 0-6, Sunday = 0
  dayOfMonth?: number // 1-31
}

// KPI and Performance Metrics
export interface KPIDefinition {
  id: string
  name: string
  description?: string
  category: string
  metric: MetricDefinition
  target?: KPITarget
  benchmark?: KPIBenchmark
  format: string
  unit?: string
  color?: string
  icon?: string
  trend: TrendConfig
  isPublic: boolean
  tags: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface KPITarget {
  value: number
  type: 'MINIMUM' | 'MAXIMUM' | 'EXACT' | 'RANGE'
  range?: [number, number]
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
}

export interface KPIBenchmark {
  value: number
  source: 'INDUSTRY' | 'INTERNAL' | 'COMPETITOR' | 'CUSTOM'
  description?: string
  lastUpdated: string
}

export interface TrendConfig {
  enabled: boolean
  period: 'LAST_PERIOD' | 'YEAR_OVER_YEAR' | 'MONTH_OVER_MONTH' | 'WEEK_OVER_WEEK'
  showPercentage: boolean
  showAbsolute: boolean
  invertColors?: boolean
}

// Advanced Analytics Features
export interface CohortAnalysis {
  id: string
  name: string
  cohortType: 'CUSTOMER' | 'REVENUE' | 'PRODUCT' | 'CUSTOM'
  timeUnit: 'DAY' | 'WEEK' | 'MONTH'
  cohortSize: number
  retentionPeriods: number
  startDate: string
  endDate: string
  segments: CohortSegment[]
  results?: CohortResults
  createdAt: string
}

export interface CohortSegment {
  name: string
  filters: QueryFilter[]
  color: string
}

export interface CohortResults {
  cohorts: CohortData[]
  aggregatedMetrics: {
    averageRetention: number[]
    totalCustomers: number
    averageLifetimeValue: number
  }
  generatedAt: string
}

export interface CohortData {
  period: string
  cohortSize: number
  retentionRates: number[]
  retentionCounts: number[]
  revenue?: number[]
}

export interface FunnelAnalysis {
  id: string
  name: string
  steps: FunnelStep[]
  timeWindow: number // days
  startDate: string
  endDate: string
  segments: FunnelSegment[]
  results?: FunnelResults
  createdAt: string
}

export interface FunnelStep {
  name: string
  event: string
  filters?: QueryFilter[]
  order: number
}

export interface FunnelSegment {
  name: string
  filters: QueryFilter[]
  color: string
}

export interface FunnelResults {
  overall: FunnelStepResult[]
  bySegment: Record<string, FunnelStepResult[]>
  conversionRates: number[]
  dropoffPoints: string[]
  generatedAt: string
}

export interface FunnelStepResult {
  step: string
  count: number
  percentage: number
  conversionFromPrevious?: number
  dropoffCount?: number
}

// Real-time Analytics
export interface RealTimeMetric {
  id: string
  name: string
  value: number
  unit?: string
  change?: {
    value: number
    percentage: number
    direction: 'UP' | 'DOWN' | 'STABLE'
    period: string
  }
  timestamp: string
  status: 'NORMAL' | 'WARNING' | 'CRITICAL'
  alerts?: string[]
}

export interface RealTimeEvent {
  id: string
  type: string
  timestamp: string
  data: Record<string, any>
  userId?: string
  sessionId?: string
  metadata?: Record<string, any>
}

// Advanced Reporting
export interface AdvancedReport {
  id: string
  name: string
  description?: string
  type: 'FINANCIAL' | 'OPERATIONAL' | 'CUSTOM' | 'REGULATORY' | 'EXECUTIVE'
  template?: string
  sections: ReportSection[]
  parameters: ReportParameter[]
  schedule?: ReportSchedule
  distribution: ReportDistribution
  branding: ReportBranding
  isPublic: boolean
  tags: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface ReportSection {
  id: string
  name: string
  type: 'TEXT' | 'CHART' | 'TABLE' | 'KPI_GRID' | 'IMAGE' | 'PAGE_BREAK'
  order: number
  content?: string
  widgetId?: string
  query?: AnalyticsQuery
  formatting: SectionFormatting
  conditions?: DisplayCondition[]
}

export interface SectionFormatting {
  fontSize?: number
  fontFamily?: string
  color?: string
  backgroundColor?: string
  alignment?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFY'
  margins?: { top: number; right: number; bottom: number; left: number }
  borders?: { width: number; style: string; color: string }
}

export interface DisplayCondition {
  field: string
  operator: string
  value: any
  action: 'SHOW' | 'HIDE' | 'HIGHLIGHT'
}

export interface ReportParameter {
  name: string
  type: 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'LIST'
  label: string
  defaultValue?: any
  options?: { label: string; value: any }[]
  required: boolean
  description?: string
}

export interface ReportSchedule {
  enabled: boolean
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY'
  time: string
  timezone: string
  dayOfWeek?: number
  dayOfMonth?: number
  recipients: string[]
  format: 'PDF' | 'EXCEL' | 'HTML'
  attachData?: boolean
}

export interface ReportDistribution {
  internal: string[]
  external: string[]
  publicUrl?: string
  passwordProtected: boolean
  expirationDate?: string
}

export interface ReportBranding {
  logo?: string
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  headerTemplate?: string
  footerTemplate?: string
  watermark?: string
}

// Data Sources and Connections
export interface DataSource {
  id: string
  name: string
  type: 'DATABASE' | 'API' | 'FILE' | 'WAREHOUSE' | 'THIRD_PARTY'
  connectionConfig: ConnectionConfig
  schema: DataSourceSchema
  refreshInterval: number
  lastRefresh?: string
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'REFRESHING'
  metadata: {
    description?: string
    tags: string[]
    owner: string
    department?: string
  }
  permissions: {
    canRead: string[]
    canWrite: string[]
    canAdmin: string[]
  }
  createdAt: string
  updatedAt: string
}

export interface ConnectionConfig {
  host?: string
  port?: number
  database?: string
  username?: string
  apiKey?: string
  endpoint?: string
  filePath?: string
  customConfig?: Record<string, any>
}

export interface DataSourceSchema {
  tables: TableSchema[]
  relationships: Relationship[]
  calculatedFields: CalculatedField[]
}

export interface TableSchema {
  name: string
  displayName?: string
  columns: ColumnSchema[]
  primaryKey?: string[]
  indexes?: IndexSchema[]
}

export interface ColumnSchema {
  name: string
  displayName?: string
  type: 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'JSON'
  nullable: boolean
  format?: string
  description?: string
  tags?: string[]
}

export interface IndexSchema {
  name: string
  columns: string[]
  unique: boolean
}

export interface Relationship {
  name: string
  fromTable: string
  fromColumn: string
  toTable: string
  toColumn: string
  type: 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_MANY'
}

export interface CalculatedField {
  name: string
  expression: string
  type: 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN'
  description?: string
  dependencies: string[]
}

// Analytics Insights and AI
export interface AnalyticsInsight {
  id: string
  type: 'ANOMALY' | 'TREND' | 'CORRELATION' | 'FORECAST' | 'RECOMMENDATION'
  title: string
  description: string
  metric: string
  confidence: number // 0-1
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  data: {
    current: number
    expected?: number
    deviation?: number
    timeframe: string
    context?: Record<string, any>
  }
  actions?: InsightAction[]
  dismissed: boolean
  createdAt: string
  expiresAt?: string
}

export interface InsightAction {
  type: 'VIEW_DASHBOARD' | 'CREATE_ALERT' | 'INVESTIGATE' | 'CUSTOM'
  label: string
  url?: string
  parameters?: Record<string, any>
}

// Request/Response Types
export interface CreateDashboardRequest {
  name: string
  description?: string
  isPublic?: boolean
  widgets?: Partial<DashboardWidget>[]
  dateRange?: AnalyticsDashboard['dateRange']
  filters?: DashboardFilter[]
  metadata?: AnalyticsDashboard['metadata']
}

export interface UpdateDashboardRequest {
  name?: string
  description?: string
  isPublic?: boolean
  widgets?: Partial<DashboardWidget>[]
  layout?: WidgetLayout[]
  dateRange?: AnalyticsDashboard['dateRange']
  filters?: DashboardFilter[]
  refreshInterval?: number
  metadata?: AnalyticsDashboard['metadata']
}

export interface CreateWidgetRequest {
  dashboardId: string
  type: WidgetType
  title: string
  description?: string
  dataSource: string
  query: AnalyticsQuery
  visualization: VisualizationConfig
  position: WidgetLayout['position']
  alerts?: WidgetAlert[]
}

export interface UpdateWidgetRequest {
  title?: string
  description?: string
  query?: AnalyticsQuery
  visualization?: VisualizationConfig
  position?: WidgetLayout['position']
  alerts?: WidgetAlert[]
  isVisible?: boolean
}

export interface CreateKPIRequest {
  name: string
  description?: string
  category: string
  metric: MetricDefinition
  target?: KPITarget
  benchmark?: KPIBenchmark
  format: string
  unit?: string
  trend?: TrendConfig
  isPublic?: boolean
  tags?: string[]
}

export interface CreateReportRequest {
  name: string
  description?: string
  type: AdvancedReport['type']
  template?: string
  sections: ReportSection[]
  parameters?: ReportParameter[]
  schedule?: ReportSchedule
  distribution?: ReportDistribution
  branding?: ReportBranding
  isPublic?: boolean
  tags?: string[]
}

// Filter Types
export interface DashboardFilters {
  name?: string
  createdBy?: string
  isPublic?: boolean
  tags?: string[]
  category?: string
  dateFrom?: string
  dateTo?: string
}

export interface WidgetFilters {
  dashboardId?: string
  type?: WidgetType
  dataSource?: string
  isVisible?: boolean
}

export interface KPIFilters {
  category?: string
  tags?: string[]
  isPublic?: boolean
  createdBy?: string
}

export interface ReportFilters {
  type?: AdvancedReport['type']
  tags?: string[]
  isPublic?: boolean
  createdBy?: string
}

export interface AnalyticsFilters {
  dateFrom: string
  dateTo: string
  granularity?: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR'
  metrics?: string[]
  dimensions?: string[]
  segments?: string[]
}