import React, { useState } from 'react'
import { Plus, Search, Filter, Download, Upload, CheckCircle, AlertTriangle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useBankReconciliations, useAccounts } from '@/hooks/useAccounting'
import { BankReconciliationList } from '@/components/accounting/BankReconciliationList'
import { BankReconciliationForm } from '@/components/accounting/BankReconciliationForm'
import { BankReconciliationDetails } from '@/components/accounting/BankReconciliationDetails'
import { useAccessibility } from '@/components/accessibility'

export function BankReconciliationPage() {
  const { announceMessage } = useAccessibility()
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState<string | null>(null)
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')

  const { data: reconciliationsData, isLoading, error } = useBankReconciliations(selectedAccountId || undefined)
  const { data: accountsData } = useAccounts({
    type: 'ASSET',
    subType: 'CURRENT_ASSET',
    status: 'ACTIVE'
  })

  const handleCreateReconciliation = () => {
    setShowForm(true)
    announceMessage('Opening bank reconciliation creation form')
  }

  const handleViewDetails = (reconciliationId: string) => {
    setShowDetails(reconciliationId)
    announceMessage('Opening bank reconciliation details')
  }

  const handleFormClose = () => {
    setShowForm(false)
  }

  const handleDetailsClose = () => {
    setShowDetails(null)
  }

  const handleAccountFilter = (accountId: string) => {
    setSelectedAccountId(accountId)
    announceMessage(`Filtered by account: ${accountId || 'All accounts'}`)
  }

  // Filter accounts to show only bank/cash accounts
  const bankAccounts = accountsData?.data?.filter(account =>
    account.name.toLowerCase().includes('cash') ||
    account.name.toLowerCase().includes('bank') ||
    account.name.toLowerCase().includes('checking') ||
    account.name.toLowerCase().includes('savings')
  ) || []

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          Failed to load bank reconciliations. Please try again.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bank Reconciliation</h1>
          <p className="text-muted-foreground">
            Reconcile bank statements with recorded transactions and identify discrepancies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Bank Statement
          </Button>
          <Button onClick={handleCreateReconciliation}>
            <Plus className="h-4 w-4 mr-2" />
            New Reconciliation
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {reconciliationsData?.data?.filter(r => r.status === 'COMPLETED').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {reconciliationsData?.data?.filter(r => r.status === 'IN_PROGRESS').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {reconciliationsData?.data?.filter(r => r.status === 'DISCREPANCY').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Discrepancies</div>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {reconciliationsData?.data?.reduce((sum, r) =>
                  sum + (r.unmatchedBankTransactions?.length || 0), 0) || 0}
              </div>
              <div className="text-sm text-muted-foreground">Unmatched</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reconciliations..."
              className="pl-10"
            />
          </div>
        </div>

        <Select
          value={selectedAccountId}
          onValueChange={handleAccountFilter}
        >
          <option value="">All Bank Accounts</option>
          {bankAccounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.code} - {account.name}
            </option>
          ))}
        </Select>

        <Select defaultValue="">
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="DISCREPANCY">Has Discrepancies</option>
        </Select>

        <Input
          type="date"
          placeholder="Date From"
          className="w-40"
        />
        <Input
          type="date"
          placeholder="Date To"
          className="w-40"
        />
      </div>

      <Separator />

      {/* Content */}
      <BankReconciliationList
        reconciliations={reconciliationsData?.data || []}
        isLoading={isLoading}
        onViewDetails={handleViewDetails}
      />

      {/* Bank Reconciliation Form Modal */}
      {showForm && (
        <BankReconciliationForm
          open={showForm}
          onClose={handleFormClose}
        />
      )}

      {/* Bank Reconciliation Details Modal */}
      {showDetails && (
        <BankReconciliationDetails
          reconciliationId={showDetails}
          open={!!showDetails}
          onClose={handleDetailsClose}
        />
      )}
    </div>
  )
}