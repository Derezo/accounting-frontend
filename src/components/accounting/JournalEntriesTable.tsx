import React from 'react'
import { MoreHorizontal, Edit, Eye, CheckCircle, RotateCcw, FileText, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/table'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { JournalEntry, JournalEntryType, JournalEntryStatus } from '@/types/accounting'
import { cn } from '@/lib/utils'

interface JournalEntriesTableProps {
  entries: JournalEntry[]
  isLoading: boolean
  onEdit: (entryId: string) => void
  onViewDetails: (entryId: string) => void
  onPost: (entryId: string) => void
  onReverse: (entryId: string) => void
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
  STANDARD: 'Standard',
  ADJUSTING: 'Adjusting',
  CLOSING: 'Closing',
  REVERSING: 'Reversing'
}

export function JournalEntriesTable({
  entries,
  isLoading,
  onEdit,
  onViewDetails,
  onPost,
  onReverse
}: JournalEntriesTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded mb-4" />
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-muted/50 rounded mb-2" />
          ))}
        </div>
      </div>
    )
  }

  if (!entries.length) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">No journal entries found</h3>
        <p className="text-muted-foreground">
          Create your first journal entry to start recording transactions.
        </p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-4 font-semibold">Entry Number</th>
            <th className="text-left p-4 font-semibold">Date</th>
            <th className="text-left p-4 font-semibold">Description</th>
            <th className="text-left p-4 font-semibold">Type</th>
            <th className="text-left p-4 font-semibold">Status</th>
            <th className="text-right p-4 font-semibold">Amount</th>
            <th className="text-left p-4 font-semibold">Reference</th>
            <th className="text-center p-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.id}
              className={cn(
                'border-b hover:bg-muted/50 transition-colors cursor-pointer',
                entry.status === 'REVERSED' && 'opacity-60'
              )}
              onClick={() => onViewDetails(entry.id)}
            >
              <td className="p-4">
                <div className="font-mono text-sm font-medium">{entry.entryNumber}</div>
              </td>
              <td className="p-4">
                <div className="text-sm">
                  {new Date(entry.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </td>
              <td className="p-4">
                <div className="max-w-xs">
                  <div className="font-medium truncate">{entry.description}</div>
                  {entry.lines.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {entry.lines.length} line{entry.lines.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </td>
              <td className="p-4">
                <Badge className={ENTRY_TYPE_COLORS[entry.type]}>
                  {ENTRY_TYPE_LABELS[entry.type]}
                </Badge>
              </td>
              <td className="p-4">
                <Badge className={STATUS_COLORS[entry.status]}>
                  {entry.status}
                </Badge>
              </td>
              <td className="p-4 text-right">
                <div className="font-medium">
                  ${entry.totalDebits.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {entry.totalDebits === entry.totalCredits ? (
                    <span className="text-green-600">Balanced</span>
                  ) : (
                    <span className="text-red-600">Unbalanced</span>
                  )}
                </div>
              </td>
              <td className="p-4">
                <div className="text-sm text-muted-foreground">
                  {entry.reference || '—'}
                </div>
              </td>
              <td className="p-4" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenu.Trigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu for entry {entry.entryNumber}</span>
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content align="end">
                    <DropdownMenu.Item
                      onClick={() => onViewDetails(entry.id)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </DropdownMenu.Item>

                    {entry.status === 'DRAFT' && (
                      <>
                        <DropdownMenu.Item
                          onClick={() => onEdit(entry.id)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Entry
                        </DropdownMenu.Item>

                        <DropdownMenu.Separator />

                        <DropdownMenu.Item
                          onClick={() => onPost(entry.id)}
                          className="flex items-center gap-2 text-green-600"
                          disabled={entry.totalDebits !== entry.totalCredits}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Post Entry
                        </DropdownMenu.Item>
                      </>
                    )}

                    {entry.status === 'POSTED' && !entry.reversalEntryId && (
                      <>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item
                          onClick={() => onReverse(entry.id)}
                          className="flex items-center gap-2 text-orange-600"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Reverse Entry
                        </DropdownMenu.Item>
                      </>
                    )}
                  </DropdownMenu.Content>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Table Footer with Summary */}
      <div className="bg-muted/25 p-4 border-t">
        <div className="flex justify-between items-center text-sm">
          <div className="text-muted-foreground">
            Showing {entries.length} entr{entries.length !== 1 ? 'ies' : 'y'}
          </div>
          <div className="flex gap-6">
            <div>
              <span className="text-muted-foreground">Draft: </span>
              <span className="font-medium">
                {entries.filter(e => e.status === 'DRAFT').length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Posted: </span>
              <span className="font-medium">
                {entries.filter(e => e.status === 'POSTED').length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Amount: </span>
              <span className="font-medium">
                ${entries
                  .filter(e => e.status === 'POSTED')
                  .reduce((sum, e) => sum + e.totalDebits, 0)
                  .toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}