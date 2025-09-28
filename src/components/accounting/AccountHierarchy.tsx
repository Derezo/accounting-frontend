import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Plus, Edit, Trash2, DollarSign, Folder, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAccountHierarchy } from '@/hooks/useAccounting'
import { AccountHierarchy as AccountHierarchyType, AccountType, AccountStatus } from '@/types/accounting'
import { cn } from '@/lib/utils'

interface AccountHierarchyProps {
  onEdit: (accountId: string) => void
  onDelete: (accountId: string) => void
  onCreateChild: (parentAccountId?: string) => void
}

interface AccountNodeProps {
  node: AccountHierarchyType
  level: number
  onEdit: (accountId: string) => void
  onDelete: (accountId: string) => void
  onCreateChild: (parentAccountId?: string) => void
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

function AccountNode({ node, level, onEdit, onDelete, onCreateChild }: AccountNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2) // Auto-expand first two levels
  const { account, children } = node
  const hasChildren = children.length > 0

  const toggleExpanded = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    }
  }

  const indentStyle = {
    paddingLeft: `${level * 1.5 + 1}rem`
  }

  return (
    <div className="border-b border-border/50">
      <div
        className={cn(
          'flex items-center justify-between py-3 px-4 hover:bg-muted/50 transition-colors',
          account.status === 'INACTIVE' && 'opacity-60',
          account.status === 'ARCHIVED' && 'opacity-40'
        )}
        style={indentStyle}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Expand/Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={toggleExpanded}
            disabled={!hasChildren}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )
            ) : (
              <div className="h-4 w-4" />
            )}
          </Button>

          {/* Account Icon */}
          <div className="flex-shrink-0">
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Folder className="h-4 w-4 text-muted-foreground" />
              )
            ) : (
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          {/* Account Code */}
          <div className="font-mono text-sm font-medium flex-shrink-0">
            {account.code}
          </div>

          {/* Account Name and Description */}
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate">{account.name}</div>
            {account.description && (
              <div className="text-sm text-muted-foreground truncate">
                {account.description}
              </div>
            )}
          </div>

          {/* Account Type and Status */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className={ACCOUNT_TYPE_COLORS[account.type]} size="sm">
              {account.type}
            </Badge>
            <Badge className={STATUS_COLORS[account.status]} size="sm">
              {account.status}
            </Badge>
          </div>

          {/* Balance */}
          <div className="text-right flex-shrink-0 w-32">
            <div className="font-medium">
              ${account.currentBalance.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
            {account.allowTransactions && (
              <div className="text-xs text-muted-foreground">
                DR: ${account.debitBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} |
                CR: ${account.creditBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCreateChild(account.id)}
            title="Add Child Account"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(account.id)}
            title="Edit Account"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(account.id)}
            className="text-destructive hover:text-destructive"
            title="Delete Account"
            disabled={account.status === 'ARCHIVED' || hasChildren}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {children.map((child) => (
            <AccountNode
              key={child.account.id}
              node={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onCreateChild={onCreateChild}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function AccountHierarchy({ onEdit, onDelete, onCreateChild }: AccountHierarchyProps) {
  const { data: hierarchy, isLoading, error } = useAccountHierarchy()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 bg-muted/50 rounded mb-2" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          Failed to load account hierarchy. Please try again.
        </div>
      </div>
    )
  }

  if (!hierarchy?.length) {
    return (
      <div className="text-center py-12">
        <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">No accounts found</h3>
        <p className="text-muted-foreground mb-4">
          Create your first account to start building your chart of accounts hierarchy.
        </p>
        <Button onClick={() => onCreateChild()}>
          <Plus className="h-4 w-4 mr-2" />
          Create First Account
        </Button>
      </div>
    )
  }

  // Group hierarchy by account type for better organization
  const hierarchyByType = hierarchy.reduce((acc, node) => {
    const type = node.account.type
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(node)
    return acc
  }, {} as Record<AccountType, AccountHierarchyType[]>)

  const accountTypeOrder: AccountType[] = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']
  const accountTypeLabels: Record<AccountType, string> = {
    ASSET: 'Assets',
    LIABILITY: 'Liabilities',
    EQUITY: 'Equity',
    REVENUE: 'Revenue',
    EXPENSE: 'Expenses'
  }

  return (
    <div className="space-y-6">
      {accountTypeOrder.map(type => {
        const nodes = hierarchyByType[type] || []
        if (nodes.length === 0) return null

        const totalBalance = nodes.reduce((sum, node) => {
          const calculateNodeBalance = (n: AccountHierarchyType): number => {
            return n.account.currentBalance + n.children.reduce((childSum, child) => childSum + calculateNodeBalance(child), 0)
          }
          return sum + calculateNodeBalance(node)
        }, 0)

        return (
          <div key={type} className="border rounded-lg overflow-hidden">
            {/* Type Header */}
            <div className="bg-muted/50 p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={ACCOUNT_TYPE_COLORS[type]}>
                    {accountTypeLabels[type]}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {nodes.length} account{nodes.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    Total: ${totalBalance.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Accounts */}
            <div>
              {nodes.map((node) => (
                <AccountNode
                  key={node.account.id}
                  node={node}
                  level={0}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onCreateChild={onCreateChild}
                />
              ))}
            </div>
          </div>
        )
      })}

      {/* Quick Add Section */}
      <div className="border rounded-lg p-4 bg-muted/25">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Quick Actions</h3>
            <p className="text-sm text-muted-foreground">
              Add new accounts to your chart of accounts
            </p>
          </div>
          <Button onClick={() => onCreateChild()}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Account
          </Button>
        </div>
      </div>
    </div>
  )
}