import React from 'react'
import { Edit, CheckCircle, RotateCcw, FileText, Calendar, Hash, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { Sheet } from '@/components/ui/sheet'
import { useJournalEntry } from '@/hooks/useAccounting'
import { JournalEntryType, JournalEntryStatus } from '@/types/accounting'
import { cn } from '@/lib/utils'

interface JournalEntryDetailsProps {
  entryId: string
  open: boolean
  onClose: () => void
  onEdit: () => void
}

const ENTRY_TYPE_COLORS: Record<JournalEntryType, string> = {
  STANDARD: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  ADJUSTING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  CLOSING: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  REVERSING: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

const STATUS_COLORS: Record<JournalEntryStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  POSTED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  REVERSED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

const ENTRY_TYPE_LABELS: Record<JournalEntryType, string> = {
  STANDARD: 'Standard Entry',
  ADJUSTING: 'Adjusting Entry',
  CLOSING: 'Closing Entry',
  REVERSING: 'Reversing Entry'
}

export function JournalEntryDetails({ entryId, open, onClose, onEdit }: JournalEntryDetailsProps) {
  const { data: entry, isLoading, error } = useJournalEntry(entryId)

  if (error) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <Sheet.Content className="w-full max-w-3xl">
          <div className="p-6">
            <div className="bg-destructive/10 text-destructive p-4 rounded-md">
              Failed to load journal entry details. Please try again.
            </div>
          </div>
        </Sheet.Content>
      </Sheet>
    )
  }

  if (isLoading || !entry) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <Sheet.Content className="w-full max-w-3xl">
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-32 bg-muted rounded" />
            </div>
          </div>
        </Sheet.Content>
      </Sheet>
    )
  }

  const isBalanced = entry.totalDebits === entry.totalCredits

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <Sheet.Content className="w-full max-w-3xl">
        <Sheet.Header>
          <div className="flex items-center justify-between">
            <div>
              <Sheet.Title className="flex items-center gap-3">
                <FileText className="h-6 w-6" />
                Journal Entry {entry.entryNumber}
              </Sheet.Title>
              <Sheet.Description>
                View and manage journal entry details
              </Sheet.Description>
            </div>
            <div className="flex items-center gap-2">
              {entry.status === 'DRAFT' && (
                <Button onClick={onEdit} size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </Sheet.Header>

        <div className="space-y-6 mt-6">
          {/* Entry Overview */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Date</div>
                  <div className="font-medium">
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Entry Number</div>
                  <div className="font-mono font-medium">{entry.entryNumber}</div>
                </div>
              </div>

              {entry.reference && (
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Reference</div>
                    <div className="font-medium">{entry.reference}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Type & Status</div>
                <div className="flex items-center gap-2">
                  <Badge className={ENTRY_TYPE_COLORS[entry.type]}>
                    {ENTRY_TYPE_LABELS[entry.type]}
                  </Badge>
                  <Badge className={STATUS_COLORS[entry.status]}>
                    {entry.status}
                  </Badge>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">Balance Status</div>
                <div className="flex items-center gap-2">
                  {isBalanced ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">Balanced</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4 text-red-600" />
                      <span className="text-red-600 font-medium">
                        Unbalanced (Diff: ${Math.abs(entry.totalDebits - entry.totalCredits).toFixed(2)})
                      </span>
                    </>
                  )}
                </div>
              </div>

              {entry.createdBy && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Created By</div>
                    <div className="font-medium">{entry.createdBy}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="text-sm text-muted-foreground mb-2">Description</div>
            <div className="p-3 bg-muted/50 rounded-lg">
              {entry.description}
            </div>
          </div>

          <Separator />

          {/* Journal Lines */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Journal Lines</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Account</th>
                    <th className="text-left p-4 font-semibold">Description</th>
                    <th className="text-right p-4 font-semibold">Debit</th>
                    <th className="text-right p-4 font-semibold">Credit</th>
                    <th className="text-left p-4 font-semibold">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.lines.map((line, index) => (
                    <tr key={line.id || index} className="border-b">
                      <td className="p-4">
                        <div>
                          <div className="font-mono text-sm">{line.account?.code}</div>
                          <div className="font-medium">{line.account?.name}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="max-w-xs">{line.description}</div>
                      </td>
                      <td className="p-4 text-right">
                        {line.debitAmount > 0 ? (
                          <span className="font-medium">
                            ${line.debitAmount.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {line.creditAmount > 0 ? (
                          <span className="font-medium">
                            ${line.creditAmount.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {line.reference || '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Totals Footer */}
              <div className="bg-muted/25 p-4 border-t">
                <div className="flex justify-end gap-8">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total Debits</div>
                    <div className="font-semibold">
                      ${entry.totalDebits.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total Credits</div>
                    <div className="font-semibold">
                      ${entry.totalCredits.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Difference</div>
                    <div className={cn(
                      "font-semibold",
                      isBalanced ? "text-green-600" : "text-red-600"
                    )}>
                      ${Math.abs(entry.totalDebits - entry.totalCredits).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Information */}
          {(entry.createdAt || entry.approvedAt || entry.reversedAt) && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4">Audit Trail</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>
                      {new Date(entry.createdAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {entry.approvedAt && entry.approvedBy && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Posted by {entry.approvedBy}:</span>
                      <span>
                        {new Date(entry.approvedAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                  {entry.reversedAt && entry.reversedBy && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reversed by {entry.reversedBy}:</span>
                      <span>
                        {new Date(entry.reversedAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </Sheet.Content>
    </Sheet>
  )
}