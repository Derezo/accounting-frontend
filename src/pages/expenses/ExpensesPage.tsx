import React, { useState } from 'react'
import { Plus, Filter, Download, CheckCircle, X, DollarSign, Clock, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table } from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { useExpenses, useMyExpenses, usePendingApprovals } from '@/hooks/useExpenses'
import { useAuthStore } from '@/stores/auth.store'
import { ExpenseFilters, ExpenseStatus, PaymentMethod } from '@/types/expenses'
import { ExpenseForm } from '@/components/forms/ExpenseForm'
import { ExpenseDetails } from '@/components/expenses/ExpenseDetails'
import { ExpenseApprovalModal } from '@/components/expenses/ExpenseApprovalModal'
import { cn } from '@/lib/utils'

type ViewMode = 'all' | 'my-expenses' | 'pending-approvals'

const EXPENSE_STATUS_COLORS: Record<ExpenseStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  SUBMITTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  PAID: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
}

const VIEW_MODES = [
  { value: 'all', label: 'All Expenses', icon: FileText },
  { value: 'my-expenses', label: 'My Expenses', icon: DollarSign },
  { value: 'pending-approvals', label: 'Pending Approvals', icon: Clock },
]

export function ExpensesPage() {
  const { user } = useAuthStore()
  const [viewMode, setViewMode] = useState<ViewMode>('my-expenses')
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalExpenseId, setApprovalExpenseId] = useState<string | null>(null)

  const [filters, setFilters] = useState<ExpenseFilters>({})
  const [pagination, setPagination] = useState({ page: 1, limit: 20 })

  // Query data based on view mode
  const allExpensesQuery = useExpenses(viewMode === 'all' ? { ...filters, ...pagination } : undefined)
  const myExpensesQuery = useMyExpenses(viewMode === 'my-expenses' ? { ...filters, ...pagination } : undefined)
  const pendingApprovalsQuery = usePendingApprovals()

  // Get current data based on view mode
  const getCurrentData = () => {
    switch (viewMode) {
      case 'all':
        return allExpensesQuery
      case 'my-expenses':
        return myExpensesQuery
      case 'pending-approvals':
        return { data: { data: pendingApprovalsQuery.data || [], total: pendingApprovalsQuery.data?.length || 0 }, isLoading: pendingApprovalsQuery.isLoading, error: pendingApprovalsQuery.error }
      default:
        return myExpensesQuery
    }
  }

  const currentQuery = getCurrentData()
  const expenses = currentQuery.data?.data || []
  const totalExpenses = currentQuery.data?.total || 0

  const handleFilterChange = (key: keyof ExpenseFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    setFilters({})
    setPagination({ page: 1, limit: 20 })
  }

  const handleExpenseClick = (expenseId: string) => {
    setSelectedExpenseId(expenseId)
  }

  const handleApprovalClick = (expenseId: string) => {
    setApprovalExpenseId(expenseId)
    setShowApprovalModal(true)
  }

  const canApprove = (expense: any) => {
    return (
      expense.status === 'PENDING_APPROVAL' &&
      expense.currentApproverId === user?.id &&
      user?.permissions?.includes('expenses:approve')
    )
  }

  const canViewAll = user?.permissions?.includes('expenses:read') &&
                    (user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT' || user?.role === 'MANAGER')

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expense Management</h1>
          <p className="text-muted-foreground">
            Submit, track, and approve employee expenses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowExpenseForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Expense
          </Button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
        {VIEW_MODES.map((mode) => {
          if (mode.value === 'all' && !canViewAll) return null
          if (mode.value === 'pending-approvals' && !user?.permissions?.includes('expenses:approve')) return null

          const Icon = mode.icon
          return (
            <Button
              key={mode.value}
              variant={viewMode === mode.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange(mode.value as ViewMode)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {mode.label}
              {mode.value === 'pending-approvals' && pendingApprovalsQuery.data && (
                <Badge variant="destructive" className="ml-1">
                  {pendingApprovalsQuery.data.length}
                </Badge>
              )}
            </Button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        <Select
          value={filters.status?.[0] || ''}
          onValueChange={(value) => handleFilterChange('status', value ? [value] : undefined)}
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="PAID">Paid</option>
        </Select>

        <Select
          value={filters.paymentMethod || ''}
          onValueChange={(value) => handleFilterChange('paymentMethod', value || undefined)}
        >
          <option value="">All Payment Methods</option>
          <option value="PERSONAL_CREDIT_CARD">Personal Credit Card</option>
          <option value="CORPORATE_CARD">Corporate Card</option>
          <option value="CASH">Cash</option>
          <option value="CHECK">Check</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
        </Select>

        <Input
          placeholder="Search expenses..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
          className="w-64"
        />

        <div className="flex items-center gap-2">
          <Input
            type="date"
            placeholder="From Date"
            value={filters.dateFrom || ''}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
            className="w-40"
          />
          <Input
            type="date"
            placeholder="To Date"
            value={filters.dateTo || ''}
            onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
            className="w-40"
          />
        </div>

        <div className="ml-auto text-sm text-muted-foreground">
          {totalExpenses} total expenses
        </div>
      </div>

      {/* Expenses Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4">Expense #</th>
              <th className="text-left p-4">Title</th>
              <th className="text-left p-4">Submitter</th>
              <th className="text-left p-4">Date</th>
              <th className="text-right p-4">Amount</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Category</th>
              <th className="text-center p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentQuery.isLoading ? (
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
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center p-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No expenses found</h3>
                  <p>
                    {viewMode === 'my-expenses' ? 'You haven\'t submitted any expenses yet.' : 'No expenses match your current filters.'}
                  </p>
                  {viewMode === 'my-expenses' && (
                    <Button onClick={() => setShowExpenseForm(true)} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Your First Expense
                    </Button>
                  )}
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr
                  key={expense.id}
                  className="border-b hover:bg-muted/25 cursor-pointer"
                  onClick={() => handleExpenseClick(expense.id)}
                >
                  <td className="p-4">
                    <span className="font-mono text-sm font-medium">{expense.expenseNumber}</span>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium">{expense.title}</div>
                      {expense.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {expense.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium">{expense.submittedByUser?.name || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(expense.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm">
                      {new Date(expense.expenseDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-semibold">
                      ${expense.total.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                    {expense.currency !== 'USD' && (
                      <div className="text-xs text-muted-foreground">{expense.currency}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <Badge className={EXPENSE_STATUS_COLORS[expense.status]} size="sm">
                      {expense.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      {expense.lineItems.length === 1
                        ? expense.lineItems[0].category?.name || 'Unknown'
                        : `${expense.lineItems.length} categories`
                      }
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1">
                      {canApprove(expense) && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleApprovalClick(expense.id)
                            }}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleApprovalClick(expense.id)
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {expense.hasReceipts && (
                        <div className="text-green-600">
                          <FileText className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      {totalExpenses > pagination.limit && (
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.page}
            totalPages={Math.ceil(totalExpenses / pagination.limit)}
            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          />
        </div>
      )}

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <ExpenseForm
          open={showExpenseForm}
          onClose={() => setShowExpenseForm(false)}
        />
      )}

      {/* Expense Details Modal */}
      {selectedExpenseId && (
        <ExpenseDetails
          expenseId={selectedExpenseId}
          open={!!selectedExpenseId}
          onClose={() => setSelectedExpenseId(null)}
        />
      )}

      {/* Expense Approval Modal */}
      {approvalExpenseId && showApprovalModal && (
        <ExpenseApprovalModal
          expenseId={approvalExpenseId}
          open={showApprovalModal}
          onClose={() => {
            setApprovalExpenseId(null)
            setShowApprovalModal(false)
          }}
        />
      )}
    </div>
  )
}