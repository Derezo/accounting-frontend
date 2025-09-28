import React, { useState } from 'react'
import { CheckCircle, X, Link, Unlink, FileText, DollarSign, Calendar, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sheet } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useBankReconciliation, useMatchBankTransaction, useCompleteBankReconciliation, useGeneralLedger } from '@/hooks/useAccounting'
import { BankTransactionStatus, GeneralLedgerEntry } from '@/types/accounting'
import { cn } from '@/lib/utils'

interface BankReconciliationDetailsProps {
  reconciliationId: string
  open: boolean
  onClose: () => void
}

const TRANSACTION_STATUS_COLORS: Record<BankTransactionStatus, string> = {
  UNMATCHED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  MATCHED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  VERIFIED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  DISPUTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

export function BankReconciliationDetails({ reconciliationId, open, onClose }: BankReconciliationDetailsProps) {
  const [selectedBankTransaction, setSelectedBankTransaction] = useState<string | null>(null)
  const [selectedBookTransaction, setSelectedBookTransaction] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const { data: reconciliation, isLoading, error } = useBankReconciliation(reconciliationId)
  const { data: ledgerData } = useGeneralLedger({
    accountId: reconciliation?.accountId,
    dateFrom: reconciliation ? new Date(Date.parse(reconciliation.reconciliationDate) - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
    dateTo: reconciliation?.reconciliationDate
  })

  const matchTransaction = useMatchBankTransaction()
  const completeReconciliation = useCompleteBankReconciliation()

  if (error || (!isLoading && !reconciliation)) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <Sheet.Content className="w-full max-w-6xl">
          <div className="p-6">
            <div className="bg-destructive/10 text-destructive p-4 rounded-md">
              Failed to load bank reconciliation details. Please try again.
            </div>
          </div>
        </Sheet.Content>
      </Sheet>
    )
  }

  if (isLoading || !reconciliation) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <Sheet.Content className="w-full max-w-6xl">
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-64 bg-muted rounded" />
            </div>
          </div>
        </Sheet.Content>
      </Sheet>
    )
  }

  const handleMatchTransactions = async () => {
    if (!selectedBankTransaction || !selectedBookTransaction) return

    try {
      await matchTransaction.mutateAsync({
        reconciliationId,
        bankTransactionId: selectedBankTransaction,
        journalEntryId: selectedBookTransaction
      })
      setSelectedBankTransaction(null)
      setSelectedBookTransaction(null)
    } catch (error) {
      console.error('Failed to match transactions:', error)
    }
  }

  const handleCompleteReconciliation = async () => {
    try {
      await completeReconciliation.mutateAsync(reconciliationId)
    } catch (error) {
      console.error('Failed to complete reconciliation:', error)
    }
  }

  const filteredLedgerEntries = ledgerData?.data?.filter(entry =>
    entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const canComplete = reconciliation.unmatchedBankTransactions.length === 0 &&
                     reconciliation.unmatchedBookTransactions.length === 0

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <Sheet.Content className="w-full max-w-6xl">
        <Sheet.Header>
          <div className="flex items-center justify-between">
            <div>
              <Sheet.Title className="flex items-center gap-3">
                <FileText className="h-6 w-6" />
                Bank Reconciliation - {reconciliation.account?.name}
              </Sheet.Title>
              <Sheet.Description>
                Match bank transactions with book entries and resolve discrepancies
              </Sheet.Description>
            </div>
            <div className="flex items-center gap-2">
              {reconciliation.status === 'IN_PROGRESS' && canComplete && (
                <Button
                  onClick={handleCompleteReconciliation}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Reconciliation
                </Button>
              )}
            </div>
          </div>
        </Sheet.Header>

        <div className="space-y-6 mt-6">
          {/* Reconciliation Summary */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Date</span>
              </div>
              <div className="text-lg font-semibold">
                {new Date(reconciliation.reconciliationDate).toLocaleDateString()}
              </div>
            </div>

            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Statement Balance</span>
              </div>
              <div className="text-lg font-semibold">
                ${reconciliation.statementBalance.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
            </div>

            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Book Balance</span>
              </div>
              <div className="text-lg font-semibold">
                ${reconciliation.reconciledAmount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
            </div>

            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Difference</span>
              </div>
              <div className={cn(
                "text-lg font-semibold",
                reconciliation.discrepancyAmount === 0 ? "text-green-600" : "text-red-600"
              )}>
                ${Math.abs(reconciliation.discrepancyAmount).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
            </div>
          </div>

          <Separator />

          {/* Matching Interface */}
          <div className="grid grid-cols-2 gap-6">
            {/* Bank Transactions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Bank Transactions</h3>
                <Badge variant="outline">
                  {reconciliation.unmatchedBankTransactions.length} unmatched
                </Badge>
              </div>

              <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                <Table>
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Description</th>
                      <th className="text-right p-3">Amount</th>
                      <th className="text-left p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...reconciliation.unmatchedBankTransactions, ...reconciliation.matchedTransactions].map((transaction) => (
                      <tr
                        key={transaction.id}
                        className={cn(
                          "border-b cursor-pointer hover:bg-muted/50",
                          selectedBankTransaction === transaction.id && "bg-blue-50 border-blue-200",
                          transaction.status === 'MATCHED' && "opacity-60"
                        )}
                        onClick={() => {
                          if (transaction.status === 'UNMATCHED') {
                            setSelectedBankTransaction(
                              selectedBankTransaction === transaction.id ? null : transaction.id
                            )
                          }
                        }}
                      >
                        <td className="p-3 text-sm">
                          {new Date(transaction.transactionDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="p-3">
                          <div className="max-w-xs">
                            <div className="font-medium text-sm truncate">{transaction.description}</div>
                            <div className="text-xs text-muted-foreground">{transaction.bankReference}</div>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <span className={cn(
                            "font-medium",
                            transaction.type === 'CREDIT' ? "text-green-600" : "text-red-600"
                          )}>
                            {transaction.type === 'CREDIT' ? '+' : '-'}${transaction.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-3">
                          <Badge className={TRANSACTION_STATUS_COLORS[transaction.status]} size="sm">
                            {transaction.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>

            {/* Book Transactions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Book Transactions</h3>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-32 h-8"
                  />
                  <Badge variant="outline">
                    {reconciliation.unmatchedBookTransactions.length} unmatched
                  </Badge>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                <Table>
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Description</th>
                      <th className="text-right p-3">Amount</th>
                      <th className="text-left p-3">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLedgerEntries.map((entry) => (
                      <tr
                        key={entry.id}
                        className={cn(
                          "border-b cursor-pointer hover:bg-muted/50",
                          selectedBookTransaction === entry.journalEntryId && "bg-blue-50 border-blue-200"
                        )}
                        onClick={() => {
                          setSelectedBookTransaction(
                            selectedBookTransaction === entry.journalEntryId ? null : entry.journalEntryId
                          )
                        }}
                      >
                        <td className="p-3 text-sm">
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="p-3">
                          <div className="max-w-xs">
                            <div className="font-medium text-sm truncate">{entry.description}</div>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <span className={cn(
                            "font-medium",
                            entry.creditAmount > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {entry.creditAmount > 0 ? '+' : '-'}${Math.max(entry.debitAmount, entry.creditAmount).toFixed(2)}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {entry.reference || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          </div>

          {/* Match Button */}
          {(selectedBankTransaction || selectedBookTransaction) && (
            <div className="flex justify-center p-4 bg-muted/25 rounded-lg">
              <Button
                onClick={handleMatchTransactions}
                disabled={!selectedBankTransaction || !selectedBookTransaction || matchTransaction.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Link className="h-4 w-4 mr-2" />
                Match Selected Transactions
              </Button>
            </div>
          )}

          {/* Matched Transactions */}
          {reconciliation.matchedTransactions.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Matched Transactions</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3">Bank Transaction</th>
                        <th className="text-left p-3">Book Transaction</th>
                        <th className="text-right p-3">Amount</th>
                        <th className="text-center p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reconciliation.matchedTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b">
                          <td className="p-3">
                            <div>
                              <div className="font-medium text-sm">{transaction.description}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(transaction.transactionDate).toLocaleDateString()} • {transaction.bankReference}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div className="font-medium text-sm">
                                {transaction.matchedJournalEntry?.description || 'N/A'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Journal Entry
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <span className={cn(
                              "font-medium",
                              transaction.type === 'CREDIT' ? "text-green-600" : "text-red-600"
                            )}>
                              {transaction.type === 'CREDIT' ? '+' : '-'}${transaction.amount.toFixed(2)}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Unlink className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            </>
          )}

          {/* Completion Status */}
          {reconciliation.status === 'IN_PROGRESS' && (
            <div className={cn(
              "p-4 rounded-lg border",
              canComplete
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-yellow-50 border-yellow-200 text-yellow-800"
            )}>
              <div className="flex items-center gap-2 mb-2">
                {canComplete ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
                <span className="font-medium">
                  {canComplete ? 'Ready to Complete' : 'Reconciliation In Progress'}
                </span>
              </div>
              <p className="text-sm">
                {canComplete
                  ? 'All transactions have been matched. You can now complete this reconciliation.'
                  : `${reconciliation.unmatchedBankTransactions.length + reconciliation.unmatchedBookTransactions.length} transactions remain unmatched.`
                }
              </p>
            </div>
          )}
        </div>
      </Sheet.Content>
    </Sheet>
  )
}