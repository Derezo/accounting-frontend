import React, { useState } from 'react'
import { Plus, Search, Filter, Download, Upload, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useAccounts, useDeleteAccount } from '@/hooks/useAccounting'
import { AccountType, AccountStatus, AccountFilters } from '@/types/accounting'
import { AccountsTable } from '@/components/accounting/AccountsTable'
import { AccountForm } from '@/components/accounting/AccountForm'
import { AccountHierarchy } from '@/components/accounting/AccountHierarchy'
import { ConfirmDialog } from '@/components/ui/dialog'
import { useAccessibility } from '@/components/accessibility'

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'ASSET', label: 'Assets' },
  { value: 'LIABILITY', label: 'Liabilities' },
  { value: 'EQUITY', label: 'Equity' },
  { value: 'REVENUE', label: 'Revenue' },
  { value: 'EXPENSE', label: 'Expenses' }
]

const ACCOUNT_STATUSES: { value: AccountStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'ARCHIVED', label: 'Archived' }
]

export function ChartOfAccountsPage() {
  const { announceMessage } = useAccessibility()
  const [view, setView] = useState<'table' | 'hierarchy'>('table')
  const [showForm, setShowForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [filters, setFilters] = useState<AccountFilters>({
    status: 'ACTIVE',
    includeInactive: false
  })

  const { data: accountsData, isLoading, error } = useAccounts(filters)
  const deleteAccount = useDeleteAccount()

  const handleFilterChange = (key: keyof AccountFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    if (key === 'includeInactive' && value) {
      delete newFilters.status
    }
    setFilters(newFilters)
    announceMessage(`Filter updated: ${key}`)
  }

  const handleCreateAccount = () => {
    setEditingAccount(null)
    setShowForm(true)
    announceMessage('Opening account creation form')
  }

  const handleEditAccount = (accountId: string) => {
    setEditingAccount(accountId)
    setShowForm(true)
    announceMessage('Opening account edit form')
  }

  const handleDeleteAccount = async (accountId: string) => {
    try {
      await deleteAccount.mutateAsync(accountId)
      setDeleteConfirm(null)
      announceMessage('Account deleted successfully')
    } catch (error) {
      console.error('Failed to delete account:', error)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingAccount(null)
  }

  const handleViewChange = (newView: 'table' | 'hierarchy') => {
    setView(newView)
    announceMessage(`Switched to ${newView} view`)
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          Failed to load accounts. Please try again.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chart of Accounts</h1>
          <p className="text-muted-foreground">
            Manage your organization's chart of accounts and account structure
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewChange(view === 'table' ? 'hierarchy' : 'table')}
          >
            {view === 'table' ? 'Hierarchy View' : 'Table View'}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={handleCreateAccount}>
            <Plus className="h-4 w-4 mr-2" />
            New Account
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search accounts..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select
          value={filters.type || ''}
          onValueChange={(value) => handleFilterChange('type', value || undefined)}
        >
          <option value="">All Types</option>
          {ACCOUNT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>
        <Select
          value={filters.status || ''}
          onValueChange={(value) => handleFilterChange('status', value || undefined)}
          disabled={filters.includeInactive}
        >
          <option value="">All Statuses</option>
          {ACCOUNT_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </Select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.includeInactive || false}
            onChange={(e) => handleFilterChange('includeInactive', e.target.checked)}
            className="rounded"
          />
          Include Inactive
        </label>
      </div>

      <Separator />

      {/* Content */}
      {view === 'table' ? (
        <AccountsTable
          accounts={accountsData?.data || []}
          isLoading={isLoading}
          onEdit={handleEditAccount}
          onDelete={(accountId) => setDeleteConfirm(accountId)}
        />
      ) : (
        <AccountHierarchy
          onEdit={handleEditAccount}
          onDelete={(accountId) => setDeleteConfirm(accountId)}
          onCreateChild={handleCreateAccount}
        />
      )}

      {/* Account Form Modal */}
      {showForm && (
        <AccountForm
          accountId={editingAccount}
          open={showForm}
          onClose={handleFormClose}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <ConfirmDialog
          open={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDeleteAccount(deleteConfirm)}
          title="Delete Account"
          description="Are you sure you want to delete this account? This action cannot be undone and may affect your financial reports."
          confirmText="Delete"
          variant="destructive"
        />
      )}
    </div>
  )
}