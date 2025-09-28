import React, { useState } from 'react'
import { Calendar, AlertTriangle, CheckCircle, DollarSign, FileText, Plus, Filter, Download, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table } from '@/components/ui/table'
import { Tabs } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useTaxReturns, useTaxCompliance, useTaxAnalytics, useTaxCalendar } from '@/hooks/useTax'
import { useAuthStore } from '@/stores/auth.store'
import { TaxFilters, TaxFilingStatus, TaxPaymentStatus, ComplianceStatus, TaxType } from '@/types/tax'
import { TaxReturnForm } from '@/components/forms/TaxReturnForm'
import { TaxReturnDetails } from '@/components/tax/TaxReturnDetails'
import { TaxComplianceDashboard } from '@/components/tax/TaxComplianceDashboard'
import { TaxCalculator } from '@/components/tax/TaxCalculator'
import { cn } from '@/lib/utils'

type TabValue = 'returns' | 'compliance' | 'analytics' | 'calculator'

const TAX_FILING_STATUS_COLORS: Record<TaxFilingStatus, string> = {
  NOT_FILED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  DRAFT: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  SUBMITTED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  ACCEPTED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  AMENDED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
}

const COMPLIANCE_STATUS_COLORS: Record<ComplianceStatus, string> = {
  COMPLIANT: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  AT_RISK: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  NON_COMPLIANT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  PENDING_REVIEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
}

export function TaxManagementPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabValue>('returns')
  const [showTaxReturnForm, setShowTaxReturnForm] = useState(false)
  const [selectedReturnId, setSelectedReturnId] = useState<string | null>(null)
  const [showCalculator, setShowCalculator] = useState(false)

  const [filters, setFilters] = useState<TaxFilters>({})
  const currentYear = new Date().getFullYear()

  // Query data
  const { data: taxReturns = { data: [], total: 0 }, isLoading: returnsLoading } = useTaxReturns(filters)
  const { data: compliance = [], isLoading: complianceLoading } = useTaxCompliance()
  const { data: analytics, isLoading: analyticsLoading } = useTaxAnalytics(filters)
  const { data: taxCalendar = [] } = useTaxCalendar(currentYear)

  const handleFilterChange = (key: keyof TaxFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const upcomingDeadlines = taxCalendar
    .filter((item: any) => new Date(item.dueDate) > new Date())
    .slice(0, 5)

  const criticalCompliance = compliance.filter(item =>
    item.status === 'NON_COMPLIANT' || item.riskLevel === 'CRITICAL'
  )

  const canManageTax = user?.permissions?.includes('tax:write') &&
                       (user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT')

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tax Management</h1>
          <p className="text-muted-foreground">
            Manage tax returns, compliance requirements, and tax calculations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowCalculator(true)}>
            <Calculator className="h-4 w-4 mr-2" />
            Tax Calculator
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
          {canManageTax && (
            <Button onClick={() => setShowTaxReturnForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Tax Return
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Tax Returns</span>
          </div>
          <div className="text-2xl font-bold">{taxReturns.total}</div>
          <div className="text-sm text-muted-foreground">
            {taxReturns.data.filter(r => r.status === 'DRAFT').length} drafts
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Tax Liability</span>
          </div>
          <div className="text-2xl font-bold">
            ${analytics?.totalTaxLiability?.toLocaleString() || '0'}
          </div>
          <div className="text-sm text-muted-foreground">
            ${analytics?.outstandingBalance?.toLocaleString() || '0'} outstanding
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            {criticalCompliance.length > 0 ? (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            <span className="text-sm font-medium">Compliance</span>
          </div>
          <div className="text-2xl font-bold">
            {compliance.filter(c => c.status === 'COMPLIANT').length}
          </div>
          <div className="text-sm text-muted-foreground">
            {criticalCompliance.length} critical issues
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">Upcoming Deadlines</span>
          </div>
          <div className="text-2xl font-bold">{upcomingDeadlines.length}</div>
          <div className="text-sm text-muted-foreground">
            Next: {upcomingDeadlines[0] ? new Date(upcomingDeadlines[0].dueDate).toLocaleDateString() : 'None'}
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalCompliance.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="font-semibold text-red-800">Critical Compliance Issues</span>
          </div>
          <div className="space-y-2">
            {criticalCompliance.slice(0, 3).map((item) => (
              <div key={item.id} className="text-sm text-red-700">
                • {item.requirement?.name}: {item.status} (Due: {new Date(item.dueDate).toLocaleDateString()})
              </div>
            ))}
            {criticalCompliance.length > 3 && (
              <div className="text-sm text-red-600">
                +{criticalCompliance.length - 3} more issues
              </div>
            )}
          </div>
        </div>
      )}

      <Separator />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
        <Tabs.List className="grid w-full grid-cols-4">
          <Tabs.Trigger value="returns" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Tax Returns
          </Tabs.Trigger>
          <Tabs.Trigger value="compliance" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Compliance
          </Tabs.Trigger>
          <Tabs.Trigger value="analytics" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Analytics
          </Tabs.Trigger>
          <Tabs.Trigger value="calculator" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Calculator
          </Tabs.Trigger>
        </Tabs.List>

        <div className="mt-6">
          {/* Tax Returns Tab */}
          <Tabs.Content value="returns">
            {/* Filters */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg mb-6">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <Select
                value={filters.status || ''}
                onValueChange={(value) => handleFilterChange('status', value || undefined)}
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
                <option value="AMENDED">Amended</option>
              </Select>

              <Select
                value={filters.taxType || ''}
                onValueChange={(value) => handleFilterChange('taxType', value || undefined)}
              >
                <option value="">All Tax Types</option>
                <option value="SALES_TAX">Sales Tax</option>
                <option value="INCOME_TAX">Income Tax</option>
                <option value="PAYROLL_TAX">Payroll Tax</option>
                <option value="PROPERTY_TAX">Property Tax</option>
              </Select>

              <Input
                placeholder="Search returns..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
                className="w-64"
              />

              <div className="ml-auto text-sm text-muted-foreground">
                {taxReturns.total} total returns
              </div>
            </div>

            {/* Tax Returns Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4">Return #</th>
                    <th className="text-left p-4">Type</th>
                    <th className="text-left p-4">Jurisdiction</th>
                    <th className="text-left p-4">Period</th>
                    <th className="text-left p-4">Due Date</th>
                    <th className="text-right p-4">Tax Amount</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-center p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {returnsLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                        <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                        <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                        <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                        <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                        <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                        <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                        <td className="p-4"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                      </tr>
                    ))
                  ) : taxReturns.data.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center p-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No tax returns found</h3>
                        <p>No tax returns match your current filters.</p>
                        {canManageTax && (
                          <Button onClick={() => setShowTaxReturnForm(true)} className="mt-4">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First Tax Return
                          </Button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    taxReturns.data.map((taxReturn) => (
                      <tr
                        key={taxReturn.id}
                        className="border-b hover:bg-muted/25 cursor-pointer"
                        onClick={() => setSelectedReturnId(taxReturn.id)}
                      >
                        <td className="p-4">
                          <span className="font-mono text-sm font-medium">{taxReturn.returnNumber}</span>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">
                            {taxReturn.type.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{taxReturn.jurisdiction?.name}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            {new Date(taxReturn.periodStart).toLocaleDateString()} -
                            {new Date(taxReturn.periodEnd).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className={cn(
                            "text-sm",
                            new Date(taxReturn.dueDate) < new Date() && taxReturn.status !== 'ACCEPTED' && "text-red-600 font-medium"
                          )}>
                            {new Date(taxReturn.dueDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <span className="font-semibold">
                            ${taxReturn.calculatedTax.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge className={TAX_FILING_STATUS_COLORS[taxReturn.status]} size="sm">
                            {taxReturn.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-4 text-center">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Tabs.Content>

          {/* Compliance Tab */}
          <Tabs.Content value="compliance">
            <TaxComplianceDashboard compliance={compliance} isLoading={complianceLoading} />
          </Tabs.Content>

          {/* Analytics Tab */}
          <Tabs.Content value="analytics">
            {analyticsLoading ? (
              <div className="space-y-4">
                <div className="animate-pulse">
                  <div className="h-8 bg-muted rounded w-1/3 mb-4" />
                  <div className="grid grid-cols-2 gap-6">
                    <div className="h-64 bg-muted rounded" />
                    <div className="h-64 bg-muted rounded" />
                  </div>
                </div>
              </div>
            ) : analytics ? (
              <div className="space-y-6">
                {/* Tax Summary */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-card border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Tax Liability by Type</h3>
                    <div className="space-y-3">
                      {analytics.liabilityByType.map((item) => (
                        <div key={item.type} className="flex items-center justify-between">
                          <span className="text-sm">{item.type.replace('_', ' ')}</span>
                          <div className="text-right">
                            <div className="font-semibold">${item.amount.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-card border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Compliance Overview</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Compliant</span>
                        <Badge className="bg-green-100 text-green-800">{analytics.complianceOverview.compliant}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">At Risk</span>
                        <Badge className="bg-yellow-100 text-yellow-800">{analytics.complianceOverview.atRisk}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Non-Compliant</span>
                        <Badge className="bg-red-100 text-red-800">{analytics.complianceOverview.nonCompliant}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Upcoming Deadlines</h3>
                    <div className="space-y-3">
                      {analytics.upcomingDeadlines.slice(0, 5).map((deadline, index) => (
                        <div key={index} className="text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{new Date(deadline.date).toLocaleDateString()}</span>
                            <Badge variant="outline" className={
                              deadline.priority === 'URGENT' ? 'border-red-500 text-red-700' :
                              deadline.priority === 'HIGH' ? 'border-orange-500 text-orange-700' :
                              'border-gray-500 text-gray-700'
                            }>
                              {deadline.priority}
                            </Badge>
                          </div>
                          <div className="text-muted-foreground">{deadline.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Monthly Trend Chart */}
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Monthly Tax Trends</h3>
                  <div className="h-64 flex items-end justify-center text-muted-foreground">
                    Chart visualization would go here
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-12 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No analytics data available</h3>
                <p>Tax analytics will appear here once you have tax data.</p>
              </div>
            )}
          </Tabs.Content>

          {/* Calculator Tab */}
          <Tabs.Content value="calculator">
            <TaxCalculator />
          </Tabs.Content>
        </div>
      </Tabs>

      {/* Tax Return Form Modal */}
      {showTaxReturnForm && (
        <TaxReturnForm
          open={showTaxReturnForm}
          onClose={() => setShowTaxReturnForm(false)}
        />
      )}

      {/* Tax Return Details Modal */}
      {selectedReturnId && (
        <TaxReturnDetails
          returnId={selectedReturnId}
          open={!!selectedReturnId}
          onClose={() => setSelectedReturnId(null)}
        />
      )}

      {/* Tax Calculator Modal */}
      {showCalculator && (
        <TaxCalculator
          open={showCalculator}
          onClose={() => setShowCalculator(false)}
        />
      )}
    </div>
  )
}