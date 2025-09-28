// Advanced Financial Analysis and Reporting types for ACCOUNTANT role

export type AnalysisPeriod = 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM'
export type VarianceType = 'FAVORABLE' | 'UNFAVORABLE' | 'NEUTRAL'
export type TrendDirection = 'INCREASING' | 'DECREASING' | 'STABLE'
export type ReportFormat = 'PDF' | 'EXCEL' | 'CSV' | 'HTML'
export type ReportFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
export type FinancialRatioCategory = 'LIQUIDITY' | 'PROFITABILITY' | 'EFFICIENCY' | 'LEVERAGE' | 'MARKET'
export type BudgetStatus = 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'CLOSED' | 'REVISED'
export type ForecastScenario = 'CONSERVATIVE' | 'REALISTIC' | 'OPTIMISTIC' | 'WORST_CASE'

// Financial Dashboard interfaces
export interface FinancialDashboard {
  id: string
  name: string
  description?: string
  isDefault: boolean

  // KPI Widgets
  widgets: DashboardWidget[]

  // Layout configuration
  layout: WidgetLayout[]

  // User preferences
  refreshInterval: number // seconds
  defaultDateRange: {
    start: string
    end: string
    period: AnalysisPeriod
  }

  // Sharing and permissions
  isPublic: boolean
  sharedWith: string[]

  organizationId: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface DashboardWidget {
  id: string
  type: WidgetType
  title: string
  subtitle?: string

  // Configuration
  config: WidgetConfig

  // Visual settings
  chartType?: ChartType
  colorScheme?: string
  showTrend: boolean
  showComparison: boolean

  // Data settings
  dataSource: string
  filters: Record<string, any>
  aggregation: AggregationType

  // Thresholds and alerts
  thresholds?: WidgetThreshold[]
  alertsEnabled: boolean
}

export type WidgetType =
  | 'KPI_CARD'
  | 'LINE_CHART'
  | 'BAR_CHART'
  | 'PIE_CHART'
  | 'TABLE'
  | 'GAUGE'
  | 'WATERFALL'
  | 'HEATMAP'
  | 'FINANCIAL_RATIO'
  | 'CASH_FLOW_CHART'
  | 'BUDGET_VARIANCE'

export type ChartType =
  | 'line'
  | 'bar'
  | 'column'
  | 'pie'
  | 'donut'
  | 'area'
  | 'scatter'
  | 'gauge'
  | 'waterfall'

export type AggregationType = 'SUM' | 'AVERAGE' | 'COUNT' | 'MIN' | 'MAX' | 'MEDIAN'

export interface WidgetConfig {
  period: AnalysisPeriod
  comparison: ComparisonConfig
  formatting: FormattingConfig
  interactivity: InteractivityConfig
}

export interface ComparisonConfig {
  enabled: boolean
  type: 'PREVIOUS_PERIOD' | 'SAME_PERIOD_LAST_YEAR' | 'BUDGET' | 'FORECAST'
  showVariance: boolean
  showPercentChange: boolean
}

export interface FormattingConfig {
  currency: string
  decimals: number
  thousands: boolean
  prefix?: string
  suffix?: string
  colorCoding: boolean
}

export interface InteractivityConfig {
  drillDown: boolean
  export: boolean
  notes: boolean
  filters: boolean
}

export interface WidgetThreshold {
  id: string
  value: number
  operator: 'GT' | 'LT' | 'GTE' | 'LTE' | 'EQ'
  color: string
  label: string
  alertLevel: 'INFO' | 'WARNING' | 'CRITICAL'
}

export interface WidgetLayout {
  widgetId: string
  x: number
  y: number
  width: number
  height: number
  minWidth?: number
  minHeight?: number
}

// Financial Analysis interfaces
export interface FinancialAnalysis {
  id: string
  name: string
  type: AnalysisType
  description?: string

  // Analysis configuration
  config: AnalysisConfig

  // Results
  results: AnalysisResults

  // Metadata
  runDate: string
  runBy: string
  status: 'RUNNING' | 'COMPLETED' | 'FAILED'

  organizationId: string
  createdAt: string
  updatedAt: string
}

export type AnalysisType =
  | 'VARIANCE_ANALYSIS'
  | 'RATIO_ANALYSIS'
  | 'TREND_ANALYSIS'
  | 'BUDGET_ANALYSIS'
  | 'CASH_FLOW_ANALYSIS'
  | 'PROFITABILITY_ANALYSIS'
  | 'BREAK_EVEN_ANALYSIS'
  | 'WORKING_CAPITAL_ANALYSIS'

export interface AnalysisConfig {
  dateRange: {
    start: string
    end: string
  }
  comparisonPeriod?: {
    start: string
    end: string
  }
  accounts?: string[]
  departments?: string[]
  projects?: string[]
  includeSubAccounts: boolean
  consolidateSubsidiaries: boolean
}

export interface AnalysisResults {
  summary: AnalysisSummary
  details: AnalysisDetail[]
  charts: ChartData[]
  recommendations: Recommendation[]
}

export interface AnalysisSummary {
  totalAccounts: number
  significantVariances: number
  favorableVariances: number
  unfavorableVariances: number
  overallTrend: TrendDirection
  keyInsights: string[]
}

export interface AnalysisDetail {
  accountId: string
  accountName: string
  accountCode: string
  category: string

  // Values
  currentValue: number
  comparisonValue: number
  variance: number
  variancePercent: number
  varianceType: VarianceType

  // Analysis
  trend: TrendDirection
  significance: 'HIGH' | 'MEDIUM' | 'LOW'
  explanation?: string

  // Historical data
  historicalData: HistoricalDataPoint[]
}

export interface HistoricalDataPoint {
  date: string
  value: number
  period: string
}

export interface ChartData {
  id: string
  title: string
  type: ChartType
  data: any
  config: any
}

export interface Recommendation {
  id: string
  type: 'ACTION' | 'ATTENTION' | 'OPTIMIZATION' | 'RISK'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  impact: string
  effort: 'HIGH' | 'MEDIUM' | 'LOW'
  category: string
  relatedAccounts: string[]
}

// Financial Ratios interfaces
export interface FinancialRatios {
  id: string
  calculationDate: string
  period: AnalysisPeriod

  // Liquidity Ratios
  liquidityRatios: LiquidityRatios

  // Profitability Ratios
  profitabilityRatios: ProfitabilityRatios

  // Efficiency Ratios
  efficiencyRatios: EfficiencyRatios

  // Leverage Ratios
  leverageRatios: LeverageRatios

  // Market Ratios (if applicable)
  marketRatios?: MarketRatios

  organizationId: string
  calculatedBy: string
  createdAt: string
}

export interface LiquidityRatios {
  currentRatio: FinancialRatio
  quickRatio: FinancialRatio
  cashRatio: FinancialRatio
  workingCapital: FinancialRatio
  operatingCashFlowRatio?: FinancialRatio
}

export interface ProfitabilityRatios {
  grossProfitMargin: FinancialRatio
  operatingMargin: FinancialRatio
  netProfitMargin: FinancialRatio
  returnOnAssets: FinancialRatio
  returnOnEquity: FinancialRatio
  returnOnInvestment: FinancialRatio
  ebitdaMargin?: FinancialRatio
}

export interface EfficiencyRatios {
  assetTurnover: FinancialRatio
  inventoryTurnover: FinancialRatio
  receivablesTurnover: FinancialRatio
  payablesTurnover: FinancialRatio
  daysInInventory: FinancialRatio
  daysInReceivables: FinancialRatio
  daysInPayables: FinancialRatio
  cashConversionCycle: FinancialRatio
}

export interface LeverageRatios {
  debtToEquity: FinancialRatio
  debtRatio: FinancialRatio
  equityRatio: FinancialRatio
  interestCoverage: FinancialRatio
  debtServiceCoverage?: FinancialRatio
  capitalAdequacy?: FinancialRatio
}

export interface MarketRatios {
  priceToEarnings?: FinancialRatio
  priceToBook?: FinancialRatio
  dividendYield?: FinancialRatio
  earningsPerShare?: FinancialRatio
}

export interface FinancialRatio {
  value: number
  formula: string
  benchmark?: number
  industryAverage?: number
  trend: TrendDirection
  interpretation: RatioInterpretation
  components: RatioComponent[]
}

export interface RatioInterpretation {
  rating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL'
  explanation: string
  recommendation?: string
  benchmarkComparison?: string
}

export interface RatioComponent {
  name: string
  value: number
  source: string
}

// Budget and Forecasting interfaces
export interface Budget {
  id: string
  name: string
  description?: string
  type: 'OPERATING' | 'CAPITAL' | 'CASH_FLOW' | 'MASTER'
  status: BudgetStatus

  // Period
  fiscalYear: number
  startDate: string
  endDate: string

  // Budget lines
  budgetLines: BudgetLine[]

  // Versions and revisions
  version: number
  revisions: BudgetRevision[]

  // Approval workflow
  approvalWorkflow: ApprovalWorkflow

  // Analysis
  variance: BudgetVariance

  organizationId: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface BudgetLine {
  id: string
  accountId: string
  account?: any // Account from accounting types
  departmentId?: string
  projectId?: string

  // Budget amounts by period
  monthlyAmounts: MonthlyAmount[]
  totalAmount: number

  // Assumptions and notes
  assumptions: string[]
  notes?: string

  // Growth rates and calculations
  growthRate?: number
  calculationMethod: 'MANUAL' | 'FORMULA' | 'HISTORICAL_AVERAGE' | 'TREND_ANALYSIS'
  formula?: string

  // Approval status
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  approvedBy?: string
  approvedAt?: string
}

export interface MonthlyAmount {
  month: number // 1-12
  amount: number
  assumptions?: string
}

export interface BudgetRevision {
  id: string
  version: number
  reason: string
  changes: BudgetChange[]
  createdBy: string
  createdAt: string
}

export interface BudgetChange {
  budgetLineId: string
  field: string
  oldValue: any
  newValue: any
  reason: string
}

export interface ApprovalWorkflow {
  steps: ApprovalStep[]
  currentStep: number
  status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED'
}

export interface ApprovalStep {
  stepNumber: number
  approverRole: string
  approverUserId?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  comments?: string
  approvedAt?: string
}

export interface BudgetVariance {
  totalBudget: number
  totalActual: number
  totalVariance: number
  totalVariancePercent: number

  // Line item variances
  lineVariances: LineVariance[]

  // Summary by category
  categoryVariances: CategoryVariance[]

  // Period variances
  periodVariances: PeriodVariance[]
}

export interface LineVariance {
  budgetLineId: string
  accountName: string
  budget: number
  actual: number
  variance: number
  variancePercent: number
  varianceType: VarianceType
  explanation?: string
}

export interface CategoryVariance {
  category: string
  budget: number
  actual: number
  variance: number
  variancePercent: number
  varianceType: VarianceType
}

export interface PeriodVariance {
  period: string
  budget: number
  actual: number
  variance: number
  variancePercent: number
}

// Cash Flow Forecasting interfaces
export interface CashFlowForecast {
  id: string
  name: string
  description?: string
  scenario: ForecastScenario

  // Forecast period
  startDate: string
  endDate: string
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'

  // Forecast data
  projections: CashFlowProjection[]

  // Assumptions
  assumptions: ForecastAssumption[]

  // Model settings
  modelSettings: ForecastModelSettings

  // Analysis
  analysis: ForecastAnalysis

  organizationId: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CashFlowProjection {
  period: string
  date: string

  // Operating cash flow
  operatingCashFlow: OperatingCashFlow

  // Investing cash flow
  investingCashFlow: InvestingCashFlow

  // Financing cash flow
  financingCashFlow: FinancingCashFlow

  // Net cash flow
  netCashFlow: number
  cumulativeCashFlow: number
  endingBalance: number
}

export interface OperatingCashFlow {
  salesReceipts: number
  otherOperatingReceipts: number
  totalReceipts: number

  payrollPayments: number
  supplierPayments: number
  otherOperatingPayments: number
  totalPayments: number

  netOperatingCashFlow: number
}

export interface InvestingCashFlow {
  assetAcquisitions: number
  assetDisposals: number
  investments: number
  netInvestingCashFlow: number
}

export interface FinancingCashFlow {
  loanProceeds: number
  loanRepayments: number
  equityContributions: number
  dividendPayments: number
  netFinancingCashFlow: number
}

export interface ForecastAssumption {
  id: string
  category: string
  description: string
  value: number
  unit: string
  source: string
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface ForecastModelSettings {
  basedOnHistorical: boolean
  historicalPeriods: number
  seasonalityAdjustment: boolean
  trendAdjustment: boolean
  riskAdjustment: boolean
  monteCarloSimulation: boolean
  sensitivityAnalysis: boolean
}

export interface ForecastAnalysis {
  summary: ForecastSummary
  risks: ForecastRisk[]
  opportunities: ForecastOpportunity[]
  recommendations: Recommendation[]
  sensitivityResults?: SensitivityResult[]
}

export interface ForecastSummary {
  totalProjectedCashFlow: number
  averageMonthlyFlow: number
  minimumBalance: number
  maximumBalance: number
  daysWithNegativeBalance: number
  cashShortfalls: CashShortfall[]
}

export interface CashShortfall {
  startDate: string
  endDate: string
  maximumShortfall: number
  duration: number
}

export interface ForecastRisk {
  id: string
  category: string
  description: string
  impact: number
  probability: number
  mitigation: string
}

export interface ForecastOpportunity {
  id: string
  category: string
  description: string
  impact: number
  effort: string
}

export interface SensitivityResult {
  variable: string
  changePercent: number
  impactOnCashFlow: number
  impactPercent: number
}

// Advanced Reporting interfaces
export interface CustomReport {
  id: string
  name: string
  description?: string
  category: ReportCategory
  type: ReportType

  // Report configuration
  config: ReportConfig

  // Data sources and joins
  dataSources: DataSource[]

  // Layout and formatting
  layout: ReportLayout

  // Scheduling
  schedule?: ReportSchedule

  // Sharing and permissions
  isPublic: boolean
  sharedWith: string[]

  organizationId: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type ReportCategory =
  | 'FINANCIAL_STATEMENTS'
  | 'MANAGEMENT_REPORTS'
  | 'COMPLIANCE_REPORTS'
  | 'AUDIT_REPORTS'
  | 'TAX_REPORTS'
  | 'ANALYSIS_REPORTS'

export type ReportType =
  | 'TABULAR'
  | 'SUMMARY'
  | 'CROSSTAB'
  | 'DASHBOARD'
  | 'CHART'
  | 'FORM'

export interface ReportConfig {
  dateRange: {
    start: string
    end: string
    period: AnalysisPeriod
  }
  filters: ReportFilter[]
  groupBy: string[]
  sortBy: ReportSort[]
  aggregations: ReportAggregation[]
}

export interface ReportFilter {
  field: string
  operator: string
  value: any
  dataType: string
}

export interface ReportSort {
  field: string
  direction: 'ASC' | 'DESC'
}

export interface ReportAggregation {
  field: string
  function: AggregationType
  alias?: string
}

export interface DataSource {
  id: string
  name: string
  type: 'TABLE' | 'VIEW' | 'QUERY'
  source: string
  joins?: DataJoin[]
}

export interface DataJoin {
  sourceField: string
  targetDataSource: string
  targetField: string
  joinType: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL'
}

export interface ReportLayout {
  columns: ReportColumn[]
  groups: ReportGroup[]
  formatting: ReportFormatting
  pageSettings: PageSettings
}

export interface ReportColumn {
  id: string
  field: string
  header: string
  width?: number
  alignment: 'LEFT' | 'CENTER' | 'RIGHT'
  dataType: string
  format?: ColumnFormat
  conditional?: ConditionalFormat[]
}

export interface ColumnFormat {
  type: 'CURRENCY' | 'PERCENTAGE' | 'NUMBER' | 'DATE' | 'TEXT'
  decimals?: number
  currency?: string
  dateFormat?: string
}

export interface ConditionalFormat {
  condition: string
  style: {
    backgroundColor?: string
    textColor?: string
    fontWeight?: string
  }
}

export interface ReportGroup {
  field: string
  showHeader: boolean
  showFooter: boolean
  pageBreak: boolean
  aggregations: ReportAggregation[]
}

export interface ReportFormatting {
  font: string
  fontSize: number
  headerStyle: StyleConfig
  dataStyle: StyleConfig
  footerStyle: StyleConfig
}

export interface StyleConfig {
  backgroundColor?: string
  textColor?: string
  fontWeight?: string
  fontSize?: number
  border?: string
}

export interface PageSettings {
  orientation: 'PORTRAIT' | 'LANDSCAPE'
  paperSize: string
  margins: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

export interface ReportSchedule {
  enabled: boolean
  frequency: ReportFrequency
  time: string
  dayOfWeek?: number
  dayOfMonth?: number
  recipients: string[]
  format: ReportFormat
  includeData: boolean
}

// Filter and search interfaces
export interface FinancialAnalysisFilters {
  type?: AnalysisType
  dateFrom?: string
  dateTo?: string
  status?: string
  createdBy?: string
  search?: string
}

export interface BudgetFilters {
  status?: BudgetStatus
  fiscalYear?: number
  type?: string
  createdBy?: string
  search?: string
}

export interface ForecastFilters {
  scenario?: ForecastScenario
  dateFrom?: string
  dateTo?: string
  createdBy?: string
  search?: string
}

export interface ReportFilters {
  category?: ReportCategory
  type?: ReportType
  isPublic?: boolean
  createdBy?: string
  search?: string
}

// Create/Update request interfaces
export interface CreateDashboardRequest {
  name: string
  description?: string
  widgets: Omit<DashboardWidget, 'id'>[]
  layout: Omit<WidgetLayout, 'widgetId'>[]
  isDefault?: boolean
  refreshInterval?: number
}

export interface CreateAnalysisRequest {
  name: string
  type: AnalysisType
  description?: string
  config: AnalysisConfig
}

export interface CreateBudgetRequest {
  name: string
  description?: string
  type: 'OPERATING' | 'CAPITAL' | 'CASH_FLOW' | 'MASTER'
  fiscalYear: number
  startDate: string
  endDate: string
  budgetLines: Omit<BudgetLine, 'id'>[]
}

export interface CreateForecastRequest {
  name: string
  description?: string
  scenario: ForecastScenario
  startDate: string
  endDate: string
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  assumptions: Omit<ForecastAssumption, 'id'>[]
  modelSettings: ForecastModelSettings
}

export interface CreateReportRequest {
  name: string
  description?: string
  category: ReportCategory
  type: ReportType
  config: ReportConfig
  dataSources: DataSource[]
  layout: ReportLayout
  schedule?: ReportSchedule
}