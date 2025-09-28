import React, { useState } from 'react'
import { CheckCircle, AlertTriangle, FileText, Filter, Download } from 'lucide-react'
import { Table } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { TrialBalance, AccountType } from '@/types/accounting'
import { cn } from '@/lib/utils'

interface TrialBalanceReportProps {
  data?: TrialBalance
  isLoading: boolean
  asOfDate: string
}

const ACCOUNT_TYPE_COLORS: Record<AccountType, string> = {
  ASSET: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  LIABILITY: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  EQUITY: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  REVENUE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  EXPENSE: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
}

export function TrialBalanceReport({ data, isLoading, asOfDate }: TrialBalanceReportProps) {
  const [filterAccountType, setFilterAccountType] = useState<AccountType | 'ALL'>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [showZeroBalances, setShowZeroBalances] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4" />
          <div className="space-y-2">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="h-6 bg-muted/50 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">No trial balance data available</h3>
        <p className="text-muted-foreground">
          Unable to generate trial balance for the selected date.
        </p>
      </div>
    )
  }

  // Filter accounts based on search term, account type, and zero balance settings
  const filteredAccounts = data.accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterAccountType === 'ALL' || account.type === filterAccountType
    const hasBalance = showZeroBalances || account.debitBalance !== 0 || account.creditBalance !== 0

    return matchesSearch && matchesType && hasBalance
  })

  // Group accounts by type for better organization
  const groupedAccounts = filteredAccounts.reduce((groups, account) => {
    if (!groups[account.type]) {
      groups[account.type] = []
    }
    groups[account.type].push(account)
    return groups
  }, {} as Record<AccountType, typeof filteredAccounts>)

  const accountTypeOrder: AccountType[] = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Trial Balance</h2>
        <p className="text-muted-foreground">
          As of {new Date(asOfDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Generated on {new Date(data.generatedAt).toLocaleString()}
        </p>
      </div>

      {/* Balance Verification */}
      <div className={cn(
        "p-4 rounded-lg border flex items-center gap-3",
        data.isBalanced
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-red-50 border-red-200 text-red-800"
      )}>
        {data.isBalanced ? (
          <CheckCircle className="h-5 w-5" />
        ) : (
          <AlertTriangle className="h-5 w-5" />
        )}
        <div>
          <div className="font-medium">
            {data.isBalanced ? 'Trial Balance is Balanced' : 'Trial Balance is NOT Balanced'}
          </div>
          <div className="text-sm">
            Total Debits: ${data.totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })} |
            Total Credits: ${data.totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            {!data.isBalanced && (
              <span className="ml-2">
                (Difference: ${Math.abs(data.totalDebits - data.totalCredits).toLocaleString('en-US', { minimumFractionDigits: 2 })})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          <Select value={filterAccountType} onValueChange={(value) => setFilterAccountType(value as AccountType | 'ALL')}>
            <option value="ALL">All Account Types</option>
            <option value="ASSET">Assets</option>
            <option value="LIABILITY">Liabilities</option>
            <option value="EQUITY">Equity</option>
            <option value="REVENUE">Revenue</option>
            <option value="EXPENSE">Expenses</option>
          </Select>

          <Input
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-48"
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showZeroBalances}
              onChange={(e) => setShowZeroBalances(e.target.checked)}
              className="rounded"
            />
            Show zero balances
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {filteredAccounts.length} accounts
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Trial Balance Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-semibold">Account Code</th>
              <th className="text-left p-4 font-semibold">Account Name</th>
              <th className="text-left p-4 font-semibold">Type</th>
              <th className="text-right p-4 font-semibold">Debit Balance</th>
              <th className="text-right p-4 font-semibold">Credit Balance</th>
            </tr>
          </thead>
          <tbody>
            {accountTypeOrder.map(accountType => {
              const accounts = groupedAccounts[accountType]
              if (!accounts || accounts.length === 0) return null

              return (
                <React.Fragment key={accountType}>
                  {/* Account Type Header */}
                  <tr className="bg-primary/5 border-t-2 border-primary/20">
                    <td colSpan={5} className="p-3 font-semibold text-primary">
                      {accountType.charAt(0) + accountType.slice(1).toLowerCase().replace('_', ' ')}s
                    </td>
                  </tr>

                  {/* Account Rows */}
                  {accounts.map((account) => (
                    <tr key={account.id} className="border-b hover:bg-muted/25">
                      <td className="p-3">
                        <span className="font-mono text-sm font-medium">
                          {account.code}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{account.name}</span>
                          {account.isActive === false && (
                            <Badge variant="outline" className="text-xs">Inactive</Badge>
                          )}
                        </div>
                        {account.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {account.description}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge className={ACCOUNT_TYPE_COLORS[account.type]} size="sm">
                          {account.type}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        {account.debitBalance > 0 ? (
                          <span className="font-medium">
                            ${account.debitBalance.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {account.creditBalance > 0 ? (
                          <span className="font-medium">
                            ${account.creditBalance.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* Subtotal for each account type */}
                  <tr className="bg-muted/25 border-t">
                    <td colSpan={3} className="p-3 font-semibold text-right">
                      {accountType.charAt(0) + accountType.slice(1).toLowerCase()} Subtotal:
                    </td>
                    <td className="p-3 text-right font-semibold">
                      ${accounts.reduce((sum, acc) => sum + acc.debitBalance, 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </td>
                    <td className="p-3 text-right font-semibold">
                      ${accounts.reduce((sum, acc) => sum + acc.creditBalance, 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </td>
                  </tr>
                </React.Fragment>
              )
            })}

            {/* Grand Total */}
            <tr className="bg-primary/10 border-t-2 border-primary">
              <td colSpan={3} className="p-4 font-bold text-lg">
                GRAND TOTAL
              </td>
              <td className="p-4 text-right font-bold text-lg">
                ${data.totalDebits.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </td>
              <td className="p-4 text-right font-bold text-lg">
                ${data.totalCredits.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </td>
            </tr>
          </tbody>
        </Table>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Total Accounts</div>
          <div className="text-2xl font-bold">
            {data.accounts.length}
          </div>
          <div className="text-xs text-muted-foreground">
            {data.accounts.filter(a => a.isActive !== false).length} active
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Active Accounts</div>
          <div className="text-2xl font-bold">
            {filteredAccounts.filter(a => a.debitBalance !== 0 || a.creditBalance !== 0).length}
          </div>
          <div className="text-xs text-muted-foreground">
            with non-zero balances
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Largest Debit</div>
          <div className="text-2xl font-bold">
            ${Math.max(...data.accounts.map(a => a.debitBalance)).toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            })}
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Largest Credit</div>
          <div className="text-2xl font-bold">
            ${Math.max(...data.accounts.map(a => a.creditBalance)).toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            })}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="text-xs text-muted-foreground p-4 bg-muted/25 rounded-lg">
        <p className="font-medium mb-2">Notes:</p>
        <ul className="space-y-1">
          <li>• Trial balance lists all accounts with their debit and credit balances</li>
          <li>• Total debits must equal total credits for the books to be in balance</li>
          <li>• This report is generated directly from the general ledger</li>
          <li>• Asset and expense accounts typically have debit balances</li>
          <li>• Liability, equity, and revenue accounts typically have credit balances</li>
          <li>• All amounts are shown in the organization's base currency</li>
        </ul>
      </div>
    </div>
  )
}