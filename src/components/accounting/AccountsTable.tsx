import React from 'react'
import { MoreHorizontal, Edit, Trash2, Eye, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/table'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Account, AccountType, AccountStatus } from '@/types/accounting'
import { cn } from '@/lib/utils'

interface AccountsTableProps {
  accounts: Account[]
  isLoading: boolean
  onEdit: (accountId: string) => void
  onDelete: (accountId: string) => void
  onViewDetails?: (accountId: string) => void
}

const ACCOUNT_TYPE_COLORS: Record<AccountType, string> = {
  ASSET: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  LIABILITY: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  EQUITY: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  REVENUE: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  EXPENSE: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
}

const STATUS_COLORS: Record<AccountStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  INACTIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  ARCHIVED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

export function AccountsTable({
  accounts,
  isLoading,
  onEdit,
  onDelete,
  onViewDetails
}: AccountsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded mb-4" />
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-12 bg-muted/50 rounded mb-2" />
          ))}
        </div>
      </div>
    )
  }

  if (!accounts.length) {
    return (
      <div className="text-center py-12">
        <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">No accounts found</h3>
        <p className="text-muted-foreground">
          Create your first account to start managing your chart of accounts.
        </p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-4 font-semibold">Code</th>
            <th className="text-left p-4 font-semibold">Account Name</th>
            <th className="text-left p-4 font-semibold">Type</th>
            <th className="text-left p-4 font-semibold">Status</th>
            <th className="text-right p-4 font-semibold">Current Balance</th>
            <th className="text-left p-4 font-semibold">Parent Account</th>
            <th className="text-center p-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account, index) => (
            <tr
              key={account.id}
              className={cn(
                'border-b hover:bg-muted/50 transition-colors',
                account.status === 'INACTIVE' && 'opacity-60',
                account.status === 'ARCHIVED' && 'opacity-40'
              )}
            >
              <td className="p-4">
                <div className="font-mono text-sm">{account.code}</div>
              </td>
              <td className="p-4">
                <div className="flex flex-col">
                  <div className="font-medium">{account.name}</div>
                  {account.description && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {account.description}
                    </div>
                  )}
                </div>
              </td>
              <td className="p-4">
                <Badge className={ACCOUNT_TYPE_COLORS[account.type]}>
                  {account.type}
                </Badge>
              </td>
              <td className="p-4">
                <Badge className={STATUS_COLORS[account.status]}>
                  {account.status}
                </Badge>
              </td>
              <td className="p-4 text-right">
                <div className="font-medium">
                  ${account.currentBalance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
                <div className="text-sm text-muted-foreground">
                  DR: ${account.debitBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} |
                  CR: ${account.creditBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </td>
              <td className="p-4">
                {account.parentAccount ? (
                  <div className="text-sm">
                    <div>{account.parentAccount.code}</div>
                    <div className="text-muted-foreground">{account.parentAccount.name}</div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="p-4">
                <DropdownMenu>
                  <DropdownMenu.Trigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu for {account.name}</span>
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content align="end">
                    {onViewDetails && (
                      <DropdownMenu.Item
                        onClick={() => onViewDetails(account.id)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </DropdownMenu.Item>
                    )}
                    <DropdownMenu.Item
                      onClick={() => onEdit(account.id)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Account
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item
                      onClick={() => onDelete(account.id)}
                      className="flex items-center gap-2 text-destructive"
                      disabled={account.status === 'ARCHIVED'}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </DropdownMenu.Item>
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
            Showing {accounts.length} account{accounts.length !== 1 ? 's' : ''}
          </div>
          <div className="flex gap-6">
            <div>
              <span className="text-muted-foreground">Total Assets: </span>
              <span className="font-medium">
                ${accounts
                  .filter(a => a.type === 'ASSET')
                  .reduce((sum, a) => sum + a.currentBalance, 0)
                  .toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Liabilities: </span>
              <span className="font-medium">
                ${accounts
                  .filter(a => a.type === 'LIABILITY')
                  .reduce((sum, a) => sum + a.currentBalance, 0)
                  .toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Equity: </span>
              <span className="font-medium">
                ${accounts
                  .filter(a => a.type === 'EQUITY')
                  .reduce((sum, a) => sum + a.currentBalance, 0)
                  .toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}