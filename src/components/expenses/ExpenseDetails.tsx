import React from 'react'
import { CheckCircle, X, Download, Edit, Send, DollarSign, Calendar, User, FileText, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Table } from '@/components/ui/table'
import { useExpense, useSubmitExpense } from '@/hooks/useExpenses'
import { useAuthStore } from '@/stores/auth.store'
import { ExpenseStatus, PaymentMethod } from '@/types/expenses'
import { cn } from '@/lib/utils'

interface ExpenseDetailsProps {
  expenseId: string
  open: boolean
  onClose: () => void
  onEdit?: () => void
  onApprove?: () => void
}

const EXPENSE_STATUS_COLORS: Record<ExpenseStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  SUBMITTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  PAID: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  PERSONAL_CREDIT_CARD: 'Personal Credit Card',
  CORPORATE_CARD: 'Corporate Card',
  CASH: 'Cash',
  CHECK: 'Check',
  BANK_TRANSFER: 'Bank Transfer',
}

export function ExpenseDetails({ expenseId, open, onClose, onEdit, onApprove }: ExpenseDetailsProps) {
  const { user } = useAuthStore()
  const { data: expense, isLoading, error } = useExpense(expenseId)
  const submitExpense = useSubmitExpense()

  if (error || (!isLoading && !expense)) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <Sheet.Content className="w-full max-w-4xl">
          <div className="p-6">
            <div className="bg-destructive/10 text-destructive p-4 rounded-md">
              Failed to load expense details. Please try again.
            </div>
          </div>
        </Sheet.Content>
      </Sheet>
    )
  }

  if (isLoading || !expense) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <Sheet.Content className="w-full max-w-4xl">
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

  const canEdit = expense.submittedBy === user?.id && ['DRAFT', 'REJECTED'].includes(expense.status)
  const canSubmit = expense.submittedBy === user?.id && expense.status === 'DRAFT'
  const canApprove = expense.status === 'PENDING_APPROVAL' &&
                    expense.currentApproverId === user?.id &&
                    user?.permissions?.includes('expenses:approve')

  const handleSubmit = async () => {
    try {
      await submitExpense.mutateAsync(expenseId)
    } catch (error) {
      console.error('Failed to submit expense:', error)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <Sheet.Content className="w-full max-w-4xl">
        <Sheet.Header>
          <div className="flex items-center justify-between">
            <div>
              <Sheet.Title className="flex items-center gap-3">
                <FileText className="h-6 w-6" />
                Expense #{expense.expenseNumber}
              </Sheet.Title>
              <Sheet.Description>
                {expense.title}
              </Sheet.Description>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={EXPENSE_STATUS_COLORS[expense.status]}>
                {expense.status.replace('_', ' ')}
              </Badge>
              {canEdit && onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {canSubmit && (
                <Button variant="outline" size="sm" onClick={handleSubmit} disabled={submitExpense.isPending}>
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Approval
                </Button>
              )}
              {canApprove && onApprove && (
                <Button size="sm" onClick={onApprove}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Review
                </Button>
              )}
            </div>
          </div>
        </Sheet.Header>

        <div className="space-y-6 mt-6">
          {/* Basic Information */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Submitted By</span>
              </div>
              <div>
                <div className="font-semibold">{expense.submittedByUser?.name || 'Unknown'}</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(expense.submittedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Expense Date</span>
              </div>
              <div className="font-semibold">
                {new Date(expense.expenseDate).toLocaleDateString()}
              </div>
            </div>

            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Payment Method</span>
              </div>
              <div className="font-semibold">
                {PAYMENT_METHOD_LABELS[expense.paymentMethod]}
              </div>
            </div>
          </div>

          {/* Description */}
          {expense.description && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="text-muted-foreground">{expense.description}</p>
            </div>
          )}

          <Separator />

          {/* Line Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Expense Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3">Description</th>
                    <th className="text-left p-3">Category</th>
                    <th className="text-right p-3">Quantity</th>
                    <th className="text-right p-3">Amount</th>
                    <th className="text-right p-3">Tax</th>
                    <th className="text-right p-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {expense.lineItems.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{item.description}</div>
                          {item.notes && (
                            <div className="text-sm text-muted-foreground">{item.notes}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">
                          {item.category?.name || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        {item.quantity || 1}
                      </td>
                      <td className="p-3 text-right">
                        ${item.amount.toFixed(2)}
                      </td>
                      <td className="p-3 text-right">
                        ${(item.taxAmount || 0).toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-medium">
                        ${(item.amount + (item.taxAmount || 0)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/25">
                  <tr>
                    <td colSpan={4} className="p-3 text-right font-semibold">
                      Subtotal:
                    </td>
                    <td className="p-3 text-right font-semibold">
                      ${expense.taxTotal.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-semibold">
                      ${expense.total.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          </div>

          {/* Project & Client Info */}
          {(expense.projectId || expense.clientId) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Project & Billing</h3>
                <div className="grid grid-cols-3 gap-4">
                  {expense.projectId && (
                    <div>
                      <span className="text-sm text-muted-foreground">Project:</span>
                      <div className="font-medium">{expense.project?.name || 'Unknown Project'}</div>
                    </div>
                  )}
                  {expense.clientId && (
                    <div>
                      <span className="text-sm text-muted-foreground">Client:</span>
                      <div className="font-medium">{expense.client?.name || 'Unknown Client'}</div>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-muted-foreground">Billable:</span>
                    <div className="font-medium">
                      {expense.billable ? (
                        <Badge className="bg-green-100 text-green-800">Yes</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Attachments */}
          {expense.attachments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Receipts & Attachments</h3>
                <div className="grid grid-cols-2 gap-4">
                  {expense.attachments.map((attachment) => (
                    <div key={attachment.id} className="border rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{attachment.originalName}</div>
                        <div className="text-sm text-muted-foreground">
                          {(attachment.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Approval History */}
          {expense.approvalChain.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Approval History</h3>
                <div className="space-y-3">
                  {expense.approvalChain.map((approval) => (
                    <div key={approval.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{approval.approver?.name || 'Unknown'}</span>
                          <Badge variant="outline">Level {approval.level}</Badge>
                        </div>
                        {approval.action && (
                          <Badge className={approval.action === 'APPROVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {approval.action}
                          </Badge>
                        )}
                      </div>
                      {approval.comments && (
                        <p className="text-sm text-muted-foreground">{approval.comments}</p>
                      )}
                      {approval.approvedAt && (
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(approval.approvedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Reimbursement Info */}
          {expense.reimbursementStatus !== 'NOT_REQUIRED' && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Reimbursement</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <div>
                      <Badge variant="outline">
                        {expense.reimbursementStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  {expense.reimbursementAmount && (
                    <div>
                      <span className="text-sm text-muted-foreground">Amount:</span>
                      <div className="font-semibold">${expense.reimbursementAmount.toFixed(2)}</div>
                    </div>
                  )}
                  {expense.reimbursementDate && (
                    <div>
                      <span className="text-sm text-muted-foreground">Date:</span>
                      <div className="font-medium">
                        {new Date(expense.reimbursementDate).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
                {expense.reimbursementReference && (
                  <div>
                    <span className="text-sm text-muted-foreground">Reference:</span>
                    <div className="font-mono text-sm">{expense.reimbursementReference}</div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Sheet.Content>
    </Sheet>
  )
}