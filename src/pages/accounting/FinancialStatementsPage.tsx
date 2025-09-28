import React, { useState } from 'react'
import { Download, FileText, TrendingUp, DollarSign, Calendar, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs } from '@/components/ui/tabs'
import { useBalanceSheet, useIncomeStatement, useCashFlowStatement, useTrialBalance } from '@/hooks/useAccounting'
import { BalanceSheetReport } from '@/components/accounting/BalanceSheetReport'
import { IncomeStatementReport } from '@/components/accounting/IncomeStatementReport'
import { CashFlowStatementReport } from '@/components/accounting/CashFlowStatementReport'
import { TrialBalanceReport } from '@/components/accounting/TrialBalanceReport'
import { FinancialStatementSettings } from '@/components/accounting/FinancialStatementSettings'
import { useAccessibility } from '@/components/accessibility'

type StatementType = 'balance-sheet' | 'income-statement' | 'cash-flow' | 'trial-balance'

const REPORT_TYPES = [
  { value: 'balance-sheet', label: 'Balance Sheet', icon: FileText },
  { value: 'income-statement', label: 'Income Statement', icon: TrendingUp },
  { value: 'cash-flow', label: 'Cash Flow Statement', icon: DollarSign },
  { value: 'trial-balance', label: 'Trial Balance', icon: DollarSign }
] as const

const PRESET_PERIODS = [
  { value: 'current-month', label: 'Current Month' },
  { value: 'current-quarter', label: 'Current Quarter' },
  { value: 'current-year', label: 'Current Year' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'last-quarter', label: 'Last Quarter' },
  { value: 'last-year', label: 'Last Year' },
  { value: 'year-to-date', label: 'Year to Date' },
  { value: 'custom', label: 'Custom Period' }
]

export function FinancialStatementsPage() {
  const { announceMessage } = useAccessibility()
  const [activeTab, setActiveTab] = useState<StatementType>('balance-sheet')
  const [showSettings, setShowSettings] = useState(false)
  const [period, setPeriod] = useState('current-month')
  const [customDates, setCustomDates] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    asOfDate: new Date().toISOString().split('T')[0]
  })

  // Calculate dates based on period
  const getDateRange = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    switch (period) {
      case 'current-month':
        return {
          startDate: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0],
          endDate: new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0],
          asOfDate: new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]
        }
      case 'current-quarter': {
        const quarterStart = Math.floor(currentMonth / 3) * 3
        return {
          startDate: new Date(currentYear, quarterStart, 1).toISOString().split('T')[0],
          endDate: new Date(currentYear, quarterStart + 3, 0).toISOString().split('T')[0],
          asOfDate: new Date(currentYear, quarterStart + 3, 0).toISOString().split('T')[0]
        }
      }
      case 'current-year':
        return {
          startDate: new Date(currentYear, 0, 1).toISOString().split('T')[0],
          endDate: new Date(currentYear, 11, 31).toISOString().split('T')[0],
          asOfDate: new Date(currentYear, 11, 31).toISOString().split('T')[0]
        }
      case 'last-month':
        return {
          startDate: new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0],
          endDate: new Date(currentYear, currentMonth, 0).toISOString().split('T')[0],
          asOfDate: new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]
        }
      case 'year-to-date':
        return {
          startDate: new Date(currentYear, 0, 1).toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0],
          asOfDate: now.toISOString().split('T')[0]
        }
      case 'custom':
        return customDates
      default:
        return customDates
    }
  }

  const { startDate, endDate, asOfDate } = getDateRange()

  // Fetch data based on active tab
  const { data: balanceSheet, isLoading: balanceSheetLoading } = useBalanceSheet(
    asOfDate,
    { enabled: activeTab === 'balance-sheet' }
  )
  const { data: incomeStatement, isLoading: incomeStatementLoading } = useIncomeStatement(
    startDate,
    endDate,
    { enabled: activeTab === 'income-statement' }
  )
  const { data: cashFlowStatement, isLoading: cashFlowLoading } = useCashFlowStatement(
    startDate,
    endDate,
    { enabled: activeTab === 'cash-flow' }
  )
  const { data: trialBalance, isLoading: trialBalanceLoading } = useTrialBalance(
    asOfDate,
    { enabled: activeTab === 'trial-balance' }
  )

  const handleTabChange = (tab: StatementType) => {
    setActiveTab(tab)
    announceMessage(`Switched to ${REPORT_TYPES.find(r => r.value === tab)?.label} report`)
  }

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod)
    announceMessage(`Period changed to ${PRESET_PERIODS.find(p => p.value === newPeriod)?.label}`)
  }

  const handleExport = (format: 'PDF' | 'EXCEL' | 'CSV') => {
    // Implementation for exporting reports
    announceMessage(`Exporting ${activeTab} as ${format}`)
  }

  const isLoading = balanceSheetLoading || incomeStatementLoading || cashFlowLoading || trialBalanceLoading

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Statements</h1>
          <p className="text-muted-foreground">
            Generate and view financial reports including balance sheet, income statement, and cash flow
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('PDF')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('EXCEL')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Period Selection */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Period:</span>
        </div>

        <Select value={period} onValueChange={handlePeriodChange}>
          {PRESET_PERIODS.map((preset) => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </Select>

        {period === 'custom' && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm">From:</span>
              <Input
                type="date"
                value={customDates.startDate}
                onChange={(e) => setCustomDates(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-40"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">To:</span>
              <Input
                type="date"
                value={customDates.endDate}
                onChange={(e) => setCustomDates(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-40"
              />
            </div>
          </>
        )}

        <div className="ml-auto text-sm text-muted-foreground">
          {activeTab === 'balance-sheet' || activeTab === 'trial-balance'
            ? `As of ${new Date(asOfDate).toLocaleDateString()}`
            : `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
          }
        </div>
      </div>

      <Separator />

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as StatementType)}>
        <Tabs.List className="grid w-full grid-cols-4">
          {REPORT_TYPES.map((report) => {
            const Icon = report.icon
            return (
              <Tabs.Trigger key={report.value} value={report.value} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {report.label}
              </Tabs.Trigger>
            )
          })}
        </Tabs.List>

        <div className="mt-6">
          <Tabs.Content value="balance-sheet">
            <BalanceSheetReport
              data={balanceSheet}
              isLoading={balanceSheetLoading}
              asOfDate={asOfDate}
            />
          </Tabs.Content>

          <Tabs.Content value="income-statement">
            <IncomeStatementReport
              data={incomeStatement}
              isLoading={incomeStatementLoading}
              periodStart={startDate}
              periodEnd={endDate}
            />
          </Tabs.Content>

          <Tabs.Content value="cash-flow">
            <CashFlowStatementReport
              data={cashFlowStatement}
              isLoading={cashFlowLoading}
              periodStart={startDate}
              periodEnd={endDate}
            />
          </Tabs.Content>

          <Tabs.Content value="trial-balance">
            <TrialBalanceReport
              data={trialBalance}
              isLoading={trialBalanceLoading}
              asOfDate={asOfDate}
            />
          </Tabs.Content>
        </div>
      </Tabs>

      {/* Financial Statement Settings Modal */}
      {showSettings && (
        <FinancialStatementSettings
          open={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}