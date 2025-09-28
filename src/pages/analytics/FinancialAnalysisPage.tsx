import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { BarChart3, TrendingUp, DollarSign, PieChart, Calculator, FileText, Calendar, Settings } from 'lucide-react'
import { useFinancialDashboards, useFinancialAnalyses, useFinancialRatios, useBudgets, useCashFlowForecasts, useCustomReports } from '@/hooks/useFinancialAnalysis'
import { LoadingSpinner } from '@/components/ui/loading'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const StatCard = ({ title, value, subtitle, icon: Icon, trend, className }: {
  title: string
  value: string | number
  subtitle?: string
  icon: any
  trend?: { value: number; label: string }
  className?: string
}) => (
  <Card className={cn('p-6', className)}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        {trend && (
          <div className={cn('flex items-center gap-1 text-xs',
            trend.value > 0 ? 'text-green-600' : trend.value < 0 ? 'text-red-600' : 'text-muted-foreground'
          )}>
            <TrendingUp className="h-3 w-3" />
            <span>{trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}</span>
          </div>
        )}
      </div>
      <Icon className="h-8 w-8 text-muted-foreground" />
    </div>
  </Card>
)

const QuickAnalysisCard = ({ title, description, icon: Icon, onClick, badge }: {
  title: string
  description: string
  icon: any
  onClick: () => void
  badge?: string
}) => (
  <Card className="cursor-pointer transition-colors hover:bg-muted/50" onClick={onClick}>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
        </div>
        {badge && <Badge variant="secondary">{badge}</Badge>}
      </div>
    </CardHeader>
  </Card>
)

export function FinancialAnalysisPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPeriod, setSelectedPeriod] = useState('current')

  const { data: dashboards, isLoading: loadingDashboards } = useFinancialDashboards()
  const { data: analyses, isLoading: loadingAnalyses } = useFinancialAnalyses()
  const { data: budgets, isLoading: loadingBudgets } = useBudgets()
  const { data: forecasts, isLoading: loadingForecasts } = useCashFlowForecasts()
  const { data: reports, isLoading: loadingReports } = useCustomReports()

  // Mock data for financial ratios - in real app, this would come from API
  const ratios = {
    profitability: {
      grossMargin: 0.35,
      netMargin: 0.12,
      roa: 0.08,
      roe: 0.15
    },
    liquidity: {
      currentRatio: 2.1,
      quickRatio: 1.8,
      cashRatio: 0.9
    },
    efficiency: {
      assetTurnover: 1.4,
      inventoryTurnover: 6.2,
      receivablesTurnover: 8.5
    },
    leverage: {
      debtToEquity: 0.4,
      debtToAssets: 0.25,
      interestCoverage: 12.5
    }
  }

  const handleCreateDashboard = () => {
    // TODO: Open create dashboard dialog
    console.log('Create dashboard')
  }

  const handleRunAnalysis = () => {
    // TODO: Open analysis configuration dialog
    console.log('Run analysis')
  }

  const handleCreateBudget = () => {
    // TODO: Open budget creation dialog
    console.log('Create budget')
  }

  const handleCreateForecast = () => {
    // TODO: Open forecast creation dialog
    console.log('Create forecast')
  }

  const handleCreateReport = () => {
    // TODO: Open report builder dialog
    console.log('Create report')
  }

  const handleViewSettings = () => {
    // TODO: Open analysis settings
    console.log('View settings')
  }

  if (loadingDashboards || loadingAnalyses || loadingBudgets || loadingForecasts || loadingReports) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Analysis</h1>
          <p className="text-muted-foreground">
            Comprehensive financial analytics, ratios, budgeting, and forecasting tools
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleViewSettings}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={handleCreateDashboard}>
            <BarChart3 className="h-4 w-4 mr-2" />
            New Dashboard
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ratios">Financial Ratios</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Revenue (YTD)"
              value="$2.4M"
              subtitle="vs $2.1M last year"
              icon={DollarSign}
              trend={{ value: 14.3, label: 'vs last year' }}
            />
            <StatCard
              title="Net Profit Margin"
              value="12.5%"
              subtitle="Industry avg: 10.2%"
              icon={TrendingUp}
              trend={{ value: 2.1, label: 'vs last quarter' }}
            />
            <StatCard
              title="Current Ratio"
              value="2.1"
              subtitle="Healthy liquidity"
              icon={Calculator}
              trend={{ value: 0.3, label: 'vs last quarter' }}
            />
            <StatCard
              title="ROE"
              value="15.2%"
              subtitle="Strong performance"
              icon={BarChart3}
              trend={{ value: 1.8, label: 'vs last year' }}
            />
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Quick Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <QuickAnalysisCard
                title="Profitability Analysis"
                description="Analyze margins, ROA, and ROE trends"
                icon={TrendingUp}
                onClick={handleRunAnalysis}
                badge="Most Used"
              />
              <QuickAnalysisCard
                title="Cash Flow Analysis"
                description="Operating, investing, and financing activities"
                icon={DollarSign}
                onClick={handleRunAnalysis}
              />
              <QuickAnalysisCard
                title="Budget vs Actual"
                description="Compare budgeted vs actual performance"
                icon={Calculator}
                onClick={handleRunAnalysis}
                badge="Updated"
              />
              <QuickAnalysisCard
                title="Ratio Analysis"
                description="Comprehensive financial ratio dashboard"
                icon={BarChart3}
                onClick={handleRunAnalysis}
              />
              <QuickAnalysisCard
                title="Trend Analysis"
                description="Multi-period financial trend analysis"
                icon={TrendingUp}
                onClick={handleRunAnalysis}
              />
              <QuickAnalysisCard
                title="Variance Analysis"
                description="Identify significant variances and trends"
                icon={PieChart}
                onClick={handleRunAnalysis}
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {analyses?.data?.slice(0, 5).map((analysis) => (
                    <div key={analysis.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <BarChart3 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{analysis.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {analysis.analysisType} • Last run {format(new Date(analysis.lastRunAt || analysis.updatedAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={analysis.status === 'COMPLETED' ? 'default' : 'secondary'}>
                          {analysis.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No recent analyses found</p>
                      <Button variant="outline" className="mt-2" onClick={handleRunAnalysis}>
                        Run Your First Analysis
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ratios" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Financial Ratios</h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Change Period
              </Button>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profitability Ratios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Profitability Ratios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Gross Margin</span>
                  <span className="font-mono">{(ratios.profitability.grossMargin * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Net Margin</span>
                  <span className="font-mono">{(ratios.profitability.netMargin * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Return on Assets (ROA)</span>
                  <span className="font-mono">{(ratios.profitability.roa * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Return on Equity (ROE)</span>
                  <span className="font-mono">{(ratios.profitability.roe * 100).toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Liquidity Ratios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Liquidity Ratios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Current Ratio</span>
                  <span className="font-mono">{ratios.liquidity.currentRatio.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Quick Ratio</span>
                  <span className="font-mono">{ratios.liquidity.quickRatio.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cash Ratio</span>
                  <span className="font-mono">{ratios.liquidity.cashRatio.toFixed(1)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Efficiency Ratios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Efficiency Ratios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Asset Turnover</span>
                  <span className="font-mono">{ratios.efficiency.assetTurnover.toFixed(1)}x</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Inventory Turnover</span>
                  <span className="font-mono">{ratios.efficiency.inventoryTurnover.toFixed(1)}x</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Receivables Turnover</span>
                  <span className="font-mono">{ratios.efficiency.receivablesTurnover.toFixed(1)}x</span>
                </div>
              </CardContent>
            </Card>

            {/* Leverage Ratios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Leverage Ratios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Debt-to-Equity</span>
                  <span className="font-mono">{ratios.leverage.debtToEquity.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Debt-to-Assets</span>
                  <span className="font-mono">{ratios.leverage.debtToAssets.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Interest Coverage</span>
                  <span className="font-mono">{ratios.leverage.interestCoverage.toFixed(1)}x</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Budget Management</h2>
            <Button onClick={handleCreateBudget}>
              <Calculator className="h-4 w-4 mr-2" />
              Create Budget
            </Button>
          </div>

          {budgets?.data && budgets.data.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {budgets.data.map((budget) => (
                <Card key={budget.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{budget.name}</CardTitle>
                        <CardDescription>
                          {format(new Date(budget.periodStart), 'MMM yyyy')} - {format(new Date(budget.periodEnd), 'MMM yyyy')} •
                          {budget.budgetType}
                        </CardDescription>
                      </div>
                      <Badge variant={budget.status === 'APPROVED' ? 'default' : 'secondary'}>
                        {budget.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Budget</p>
                        <p className="text-2xl font-bold">${budget.totalBudget.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Updated</p>
                        <p className="text-sm">{format(new Date(budget.updatedAt), 'MMM d, yyyy')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">View Details</Button>
                        <Button variant="outline" size="sm">Variance Analysis</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Budgets Found</h3>
                <p className="text-muted-foreground mb-4">Create your first budget to start planning and tracking financial performance.</p>
                <Button onClick={handleCreateBudget}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Create Your First Budget
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Financial Forecasts</h2>
            <Button onClick={handleCreateForecast}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Create Forecast
            </Button>
          </div>

          {forecasts?.data && forecasts.data.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {forecasts.data.map((forecast) => (
                <Card key={forecast.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{forecast.name}</CardTitle>
                        <CardDescription>
                          {forecast.forecastType} • {forecast.methodology} •
                          {format(new Date(forecast.forecastPeriodStart), 'MMM yyyy')} - {format(new Date(forecast.forecastPeriodEnd), 'MMM yyyy')}
                        </CardDescription>
                      </div>
                      <Badge variant={forecast.status === 'COMPLETED' ? 'default' : 'secondary'}>
                        {forecast.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Confidence Level</p>
                        <p className="text-lg font-semibold">{forecast.confidenceLevel}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Generated</p>
                        <p className="text-sm">
                          {forecast.lastGeneratedAt ? format(new Date(forecast.lastGeneratedAt), 'MMM d, yyyy') : 'Not generated'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">View Results</Button>
                        <Button variant="outline" size="sm">Generate</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Forecasts Found</h3>
                <p className="text-muted-foreground mb-4">Create financial forecasts to predict future performance and plan accordingly.</p>
                <Button onClick={handleCreateForecast}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Create Your First Forecast
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Custom Reports</h2>
            <Button onClick={handleCreateReport}>
              <FileText className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </div>

          {reports?.data && reports.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.data.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{report.name}</CardTitle>
                      <Badge variant={report.isPublic ? 'default' : 'secondary'}>
                        {report.isPublic ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                    <CardDescription>{report.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p className="text-sm font-medium">{report.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Generated</p>
                        <p className="text-sm">
                          {report.lastGeneratedAt ? format(new Date(report.lastGeneratedAt), 'MMM d, yyyy') : 'Never'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <Button variant="outline" size="sm">Generate</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Custom Reports Found</h3>
                <p className="text-muted-foreground mb-4">Build custom reports tailored to your specific analysis needs.</p>
                <Button onClick={handleCreateReport}>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Your First Report
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="dashboards" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Financial Dashboards</h2>
            <Button onClick={handleCreateDashboard}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Create Dashboard
            </Button>
          </div>

          {dashboards && dashboards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboards.map((dashboard) => (
                <Card key={dashboard.id} className="cursor-pointer transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{dashboard.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        {dashboard.isDefault && <Badge variant="default">Default</Badge>}
                        <Badge variant="outline">{dashboard.widgets.length} widgets</Badge>
                      </div>
                    </div>
                    {dashboard.description && (
                      <CardDescription>{dashboard.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Refresh Interval</p>
                        <p className="text-sm font-medium">{dashboard.refreshInterval}s</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date Range</p>
                        <p className="text-sm">{dashboard.defaultDateRange.period}</p>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <Button variant="outline" size="sm">Open</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Dashboards Found</h3>
                <p className="text-muted-foreground mb-4">Create custom dashboards to visualize your financial data in real-time.</p>
                <Button onClick={handleCreateDashboard}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Create Your First Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}