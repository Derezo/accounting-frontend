import React from 'react'
import { MoreHorizontal, Eye, CheckCircle, AlertTriangle, Clock, X, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/table'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BankReconciliation, ReconciliationStatus } from '@/types/accounting'
import { cn } from '@/lib/utils'

interface BankReconciliationListProps {
  reconciliations: BankReconciliation[]
  isLoading: boolean
  onViewDetails: (reconciliationId: string) => void
}

const STATUS_COLORS: Record<ReconciliationStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  DISCREPANCY: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

const STATUS_ICONS: Record<ReconciliationStatus, React.ReactNode> = {
  PENDING: <Clock className="h-4 w-4" />,
  IN_PROGRESS: <AlertTriangle className="h-4 w-4" />,
  COMPLETED: <CheckCircle className="h-4 w-4" />,
  DISCREPANCY: <X className="h-4 w-4" />
}

export function BankReconciliationList({
  reconciliations,
  isLoading,
  onViewDetails
}: BankReconciliationListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded mb-4" />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 bg-muted/50 rounded mb-2" />
          ))}
        </div>
      </div>
    )
  }

  if (!reconciliations.length) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">No bank reconciliations found</h3>
        <p className="text-muted-foreground">
          Create your first bank reconciliation to start matching transactions.
        </p>
      </div>
    )
  }

  const calculateMatchingProgress = (reconciliation: BankReconciliation) => {
    const totalTransactions = reconciliation.matchedTransactions.length +
      reconciliation.unmatchedBankTransactions.length +
      reconciliation.unmatchedBookTransactions.length

    if (totalTransactions === 0) return 0
    return (reconciliation.matchedTransactions.length / totalTransactions) * 100
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-4 font-semibold">Account</th>
            <th className="text-left p-4 font-semibold">Date</th>
            <th className="text-left p-4 font-semibold">Status</th>
            <th className="text-right p-4 font-semibold">Statement Balance</th>
            <th className="text-right p-4 font-semibold">Book Balance</th>
            <th className="text-right p-4 font-semibold">Difference</th>
            <th className="text-left p-4 font-semibold">Progress</th>
            <th className="text-center p-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reconciliations.map((reconciliation) => {
            const matchingProgress = calculateMatchingProgress(reconciliation)
            const bookBalance = reconciliation.reconciledAmount

            return (
              <tr
                key={reconciliation.id}
                className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onViewDetails(reconciliation.id)}
              >
                <td className="p-4">
                  <div>
                    <div className="font-medium">{reconciliation.account?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {reconciliation.account?.code}
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm">
                    {new Date(reconciliation.reconciliationDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </td>
                <td className="p-4">
                  <Badge className={STATUS_COLORS[reconciliation.status]}>
                    <div className="flex items-center gap-1">
                      {STATUS_ICONS[reconciliation.status]}
                      {reconciliation.status.replace('_', ' ')}
                    </div>
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <div className="font-medium">
                    ${reconciliation.statementBalance.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="font-medium">
                    ${bookBalance.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className={cn(
                    "font-medium",
                    reconciliation.discrepancyAmount === 0
                      ? "text-green-600"
                      : "text-red-600"
                  )}>
                    ${Math.abs(reconciliation.discrepancyAmount).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </div>
                </td>
                <td className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Matched</span>
                      <span>{matchingProgress.toFixed(0)}%</span>
                    </div>
                    <Progress value={matchingProgress} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {reconciliation.matchedTransactions.length} matched,{' '}
                      {reconciliation.unmatchedBankTransactions.length + reconciliation.unmatchedBookTransactions.length} unmatched
                    </div>
                  </div>
                </td>
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenu.Trigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu for reconciliation</span>
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="end">
                      <DropdownMenu.Item
                        onClick={() => onViewDetails(reconciliation.id)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </DropdownMenu.Item>

                      {reconciliation.status === 'IN_PROGRESS' && (
                        <>
                          <DropdownMenu.Separator />
                          <DropdownMenu.Item
                            className="flex items-center gap-2 text-green-600"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Complete Reconciliation
                          </DropdownMenu.Item>
                        </>
                      )}

                      <DropdownMenu.Separator />
                      <DropdownMenu.Item className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Export Report
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu>
                </td>
              </tr>
            )
          })}
        </tbody>
      </Table>

      {/* Table Footer with Summary */}
      <div className="bg-muted/25 p-4 border-t">
        <div className="flex justify-between items-center text-sm">
          <div className="text-muted-foreground">
            Showing {reconciliations.length} reconciliation{reconciliations.length !== 1 ? 's' : ''}
          </div>
          <div className="flex gap-6">
            <div>
              <span className="text-muted-foreground">Completed: </span>
              <span className="font-medium text-green-600">
                {reconciliations.filter(r => r.status === 'COMPLETED').length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">In Progress: </span>
              <span className="font-medium text-blue-600">
                {reconciliations.filter(r => r.status === 'IN_PROGRESS').length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Discrepancies: </span>
              <span className="font-medium text-red-600">
                {reconciliations.filter(r => r.status === 'DISCREPANCY').length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Unmatched: </span>
              <span className="font-medium">
                {reconciliations.reduce((sum, r) =>
                  sum + r.unmatchedBankTransactions.length + r.unmatchedBookTransactions.length, 0
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}