import React, { useState } from 'react'
import { Settings, Save, X, Calendar, FileText, DollarSign, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Sheet } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'

interface FinancialStatementSettingsProps {
  open: boolean
  onClose: () => void
}

interface FinancialStatementConfig {
  // Report Settings
  reportName: string
  includeComparativePeriod: boolean
  comparativePeriodMonths: number
  roundToNearestDollar: boolean

  // Display Settings
  showAccountCodes: boolean
  showZeroBalances: boolean
  includeInactiveAccounts: boolean
  groupByAccountType: boolean

  // Header Settings
  companyName: string
  reportPreparedBy: string
  includeDisclaimer: boolean
  customDisclaimer: string

  // Export Settings
  defaultExportFormat: 'PDF' | 'EXCEL' | 'CSV'
  includeDetailedNotes: boolean
  watermarkDrafts: boolean

  // Period Settings
  fiscalYearEnd: string
  defaultPeriod: 'current-month' | 'current-quarter' | 'current-year' | 'year-to-date'

  // Approval Settings
  requireApprovalForFinalReports: boolean
  approverEmail: string
  autoEmailReports: boolean
}

const DEFAULT_CONFIG: FinancialStatementConfig = {
  reportName: 'Financial Statements',
  includeComparativePeriod: false,
  comparativePeriodMonths: 12,
  roundToNearestDollar: false,
  showAccountCodes: true,
  showZeroBalances: false,
  includeInactiveAccounts: false,
  groupByAccountType: true,
  companyName: '',
  reportPreparedBy: '',
  includeDisclaimer: true,
  customDisclaimer: 'These financial statements have been prepared in accordance with generally accepted accounting principles (GAAP) and are for internal use only.',
  defaultExportFormat: 'PDF',
  includeDetailedNotes: true,
  watermarkDrafts: true,
  fiscalYearEnd: '12-31',
  defaultPeriod: 'current-month',
  requireApprovalForFinalReports: false,
  approverEmail: '',
  autoEmailReports: false
}

export function FinancialStatementSettings({ open, onClose }: FinancialStatementSettingsProps) {
  const [config, setConfig] = useState<FinancialStatementConfig>(DEFAULT_CONFIG)
  const [hasChanges, setHasChanges] = useState(false)

  const handleConfigChange = <K extends keyof FinancialStatementConfig>(
    key: K,
    value: FinancialStatementConfig[K]
  ) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      // Save configuration to backend
      // await apiService.updateFinancialStatementSettings(config)
      console.log('Saving financial statement configuration:', config)
      setHasChanges(false)
      onClose()
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG)
    setHasChanges(false)
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <Sheet.Content className="w-full max-w-4xl">
        <Sheet.Header>
          <div className="flex items-center justify-between">
            <div>
              <Sheet.Title className="flex items-center gap-3">
                <Settings className="h-6 w-6" />
                Financial Statement Settings
              </Sheet.Title>
              <Sheet.Description>
                Configure how financial statements are generated and displayed
              </Sheet.Description>
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Button variant="outline" onClick={handleReset} size="sm">
                  Reset
                </Button>
              )}
              <Button onClick={handleSave} disabled={!hasChanges} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </Sheet.Header>

        <div className="space-y-8 mt-6">
          {/* Report Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Report Configuration</h3>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="reportName">Report Name</Label>
                <Input
                  id="reportName"
                  value={config.reportName}
                  onChange={(e) => handleConfigChange('reportName', e.target.value)}
                  placeholder="Financial Statements"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultPeriod">Default Period</Label>
                <Select
                  value={config.defaultPeriod}
                  onValueChange={(value) => handleConfigChange('defaultPeriod', value as any)}
                >
                  <option value="current-month">Current Month</option>
                  <option value="current-quarter">Current Quarter</option>
                  <option value="current-year">Current Year</option>
                  <option value="year-to-date">Year to Date</option>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeComparativePeriod"
                    checked={config.includeComparativePeriod}
                    onCheckedChange={(checked) => handleConfigChange('includeComparativePeriod', checked as boolean)}
                  />
                  <Label htmlFor="includeComparativePeriod">Include comparative period</Label>
                </div>

                {config.includeComparativePeriod && (
                  <div className="ml-6">
                    <Label htmlFor="comparativePeriodMonths">Months prior</Label>
                    <Input
                      id="comparativePeriodMonths"
                      type="number"
                      min="1"
                      max="60"
                      value={config.comparativePeriodMonths}
                      onChange={(e) => handleConfigChange('comparativePeriodMonths', parseInt(e.target.value))}
                      className="w-20"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fiscalYearEnd">Fiscal Year End</Label>
                <Input
                  id="fiscalYearEnd"
                  type="date"
                  value={`2024-${config.fiscalYearEnd}`}
                  onChange={(e) => {
                    const date = new Date(e.target.value)
                    const month = (date.getMonth() + 1).toString().padStart(2, '0')
                    const day = date.getDate().toString().padStart(2, '0')
                    handleConfigChange('fiscalYearEnd', `${month}-${day}`)
                  }}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Display Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Display Settings</h3>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showAccountCodes"
                    checked={config.showAccountCodes}
                    onCheckedChange={(checked) => handleConfigChange('showAccountCodes', checked as boolean)}
                  />
                  <Label htmlFor="showAccountCodes">Show account codes</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showZeroBalances"
                    checked={config.showZeroBalances}
                    onCheckedChange={(checked) => handleConfigChange('showZeroBalances', checked as boolean)}
                  />
                  <Label htmlFor="showZeroBalances">Show zero balances</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeInactiveAccounts"
                    checked={config.includeInactiveAccounts}
                    onCheckedChange={(checked) => handleConfigChange('includeInactiveAccounts', checked as boolean)}
                  />
                  <Label htmlFor="includeInactiveAccounts">Include inactive accounts</Label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="groupByAccountType"
                    checked={config.groupByAccountType}
                    onCheckedChange={(checked) => handleConfigChange('groupByAccountType', checked as boolean)}
                  />
                  <Label htmlFor="groupByAccountType">Group by account type</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="roundToNearestDollar"
                    checked={config.roundToNearestDollar}
                    onCheckedChange={(checked) => handleConfigChange('roundToNearestDollar', checked as boolean)}
                  />
                  <Label htmlFor="roundToNearestDollar">Round to nearest dollar</Label>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Header & Company Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Header & Company Information</h3>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={config.companyName}
                  onChange={(e) => handleConfigChange('companyName', e.target.value)}
                  placeholder="Your Company Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportPreparedBy">Report Prepared By</Label>
                <Input
                  id="reportPreparedBy"
                  value={config.reportPreparedBy}
                  onChange={(e) => handleConfigChange('reportPreparedBy', e.target.value)}
                  placeholder="Accountant Name"
                />
              </div>

              <div className="col-span-2 space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeDisclaimer"
                    checked={config.includeDisclaimer}
                    onCheckedChange={(checked) => handleConfigChange('includeDisclaimer', checked as boolean)}
                  />
                  <Label htmlFor="includeDisclaimer">Include disclaimer</Label>
                </div>

                {config.includeDisclaimer && (
                  <div className="space-y-2">
                    <Label htmlFor="customDisclaimer">Custom Disclaimer</Label>
                    <Textarea
                      id="customDisclaimer"
                      value={config.customDisclaimer}
                      onChange={(e) => handleConfigChange('customDisclaimer', e.target.value)}
                      placeholder="Enter custom disclaimer text..."
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Export Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Export & Approval Settings</h3>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="defaultExportFormat">Default Export Format</Label>
                <Select
                  value={config.defaultExportFormat}
                  onValueChange={(value) => handleConfigChange('defaultExportFormat', value as any)}
                >
                  <option value="PDF">PDF</option>
                  <option value="EXCEL">Excel</option>
                  <option value="CSV">CSV</option>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeDetailedNotes"
                    checked={config.includeDetailedNotes}
                    onCheckedChange={(checked) => handleConfigChange('includeDetailedNotes', checked as boolean)}
                  />
                  <Label htmlFor="includeDetailedNotes">Include detailed notes</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="watermarkDrafts"
                    checked={config.watermarkDrafts}
                    onCheckedChange={(checked) => handleConfigChange('watermarkDrafts', checked as boolean)}
                  />
                  <Label htmlFor="watermarkDrafts">Watermark draft reports</Label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requireApprovalForFinalReports"
                    checked={config.requireApprovalForFinalReports}
                    onCheckedChange={(checked) => handleConfigChange('requireApprovalForFinalReports', checked as boolean)}
                  />
                  <Label htmlFor="requireApprovalForFinalReports">Require approval for final reports</Label>
                </div>

                {config.requireApprovalForFinalReports && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="approverEmail">Approver Email</Label>
                    <Input
                      id="approverEmail"
                      type="email"
                      value={config.approverEmail}
                      onChange={(e) => handleConfigChange('approverEmail', e.target.value)}
                      placeholder="approver@company.com"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoEmailReports"
                    checked={config.autoEmailReports}
                    onCheckedChange={(checked) => handleConfigChange('autoEmailReports', checked as boolean)}
                  />
                  <Label htmlFor="autoEmailReports">Auto-email reports when generated</Label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Sheet.Content>
    </Sheet>
  )
}