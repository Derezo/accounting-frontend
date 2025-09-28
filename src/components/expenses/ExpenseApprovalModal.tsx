import React, { useState } from 'react'
import { CheckCircle, X, AlertTriangle, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sheet } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useExpense, useApproveExpense, useRejectExpense } from '@/hooks/useExpenses'
import { ApprovalAction } from '@/types/expenses'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ExpenseApprovalModalProps {
  expenseId: string
  open: boolean
  onClose: () => void
}

export function ExpenseApprovalModal({ expenseId, open, onClose }: ExpenseApprovalModalProps) {
  const [action, setAction] = useState<ApprovalAction | null>(null)
  const [comments, setComments] = useState('')
  const [approvedAmount, setApprovedAmount] = useState<number | null>(null)

  const { data: expense, isLoading } = useExpense(expenseId)
  const approveExpense = useApproveExpense()
  const rejectExpense = useRejectExpense()

  if (isLoading || !expense) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <Sheet.Content className="w-full max-w-2xl">
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

  const handleSubmit = async () => {
    if (!action) return

    try {
      const data = {
        action,
        comments: comments.trim() || undefined,
        approvedAmount: action === 'APPROVE' && approvedAmount !== null ? approvedAmount : undefined,
      }

      if (action === 'APPROVE') {
        await approveExpense.mutateAsync({ id: expenseId, data })
        toast.success('Expense approved successfully!')
      } else if (action === 'REJECT') {
        await rejectExpense.mutateAsync({ id: expenseId, data })
        toast.success('Expense rejected successfully!')
      }

      onClose()
    } catch (error) {
      console.error('Failed to process approval:', error)
      toast.error('Failed to process approval. Please try again.')
    }
  }

  const isProcessing = approveExpense.isPending || rejectExpense.isPending

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <Sheet.Content className="w-full max-w-2xl">
        <Sheet.Header>
          <Sheet.Title>Review Expense</Sheet.Title>
          <Sheet.Description>
            Review and approve or reject expense #{expense.expenseNumber}
          </Sheet.Description>
        </Sheet.Header>

        <div className="space-y-6 mt-6">
          {/* Expense Summary */}
          <div className="bg-muted/25 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{expense.title}</h3>
              <Badge variant="outline">
                {expense.status.replace('_', ' ')}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Submitted by:</span>
                <div className="font-medium">{expense.submittedByUser?.name || 'Unknown'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Expense Date:</span>
                <div className="font-medium">
                  {new Date(expense.expenseDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Total Amount:</span>
                <div className="font-semibold text-lg">
                  ${expense.total.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Payment Method:</span>
                <div className="font-medium">{expense.paymentMethod.replace('_', ' ')}</div>
              </div>
            </div>

            {expense.description && (
              <div>
                <span className="text-muted-foreground text-sm">Description:</span>
                <p className="text-sm mt-1">{expense.description}</p>
              </div>
            )}
          </div>

          {/* Line Items Summary */}
          <div className="space-y-3">
            <h3 className="font-semibold">Expense Items</h3>
            <div className="space-y-2">
              {expense.lineItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{item.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.category?.name || 'Unknown Category'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${item.amount.toFixed(2)}</div>
                    {item.taxAmount && item.taxAmount > 0 && (
                      <div className="text-sm text-muted-foreground">
                        +${item.taxAmount.toFixed(2)} tax
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Action Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold">Approval Decision</h3>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={action === 'APPROVE' ? 'default' : 'outline'}
                onClick={() => {
                  setAction('APPROVE')
                  setApprovedAmount(expense.total)
                }}
                className={cn(
                  'h-auto p-4 flex flex-col gap-2',
                  action === 'APPROVE' && 'bg-green-600 hover:bg-green-700'
                )}
              >
                <CheckCircle className="h-6 w-6" />
                <span>Approve</span>
              </Button>

              <Button
                variant={action === 'REJECT' ? 'default' : 'outline'}
                onClick={() => setAction('REJECT')}
                className={cn(
                  'h-auto p-4 flex flex-col gap-2',
                  action === 'REJECT' && 'bg-red-600 hover:bg-red-700'
                )}
              >
                <X className="h-6 w-6" />
                <span>Reject</span>
              </Button>
            </div>
          </div>

          {/* Approved Amount (only for approval) */}
          {action === 'APPROVE' && (
            <div className="space-y-2">
              <Label htmlFor="approvedAmount">Approved Amount</Label>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="approvedAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={expense.total}
                  value={approvedAmount || ''}
                  onChange={(e) => setApprovedAmount(parseFloat(e.target.value) || null)}
                  placeholder="0.00"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Maximum approvable amount: ${expense.total.toFixed(2)}
              </p>
              {approvedAmount !== null && approvedAmount < expense.total && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    You are approving a partial amount. Please provide comments explaining the reduction.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments">
              Comments {action === 'REJECT' ? '(Required)' : '(Optional)'}
            </Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={
                action === 'APPROVE'
                  ? 'Any additional notes about this approval...'
                  : action === 'REJECT'
                  ? 'Please explain why this expense is being rejected...'
                  : 'Comments about this expense...'
              }
              rows={4}
            />
            {action === 'REJECT' && !comments.trim() && (
              <p className="text-sm text-destructive">
                Comments are required when rejecting an expense.
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !action ||
                isProcessing ||
                (action === 'REJECT' && !comments.trim()) ||
                (action === 'APPROVE' && (approvedAmount === null || approvedAmount <= 0))
              }
              className={cn(
                action === 'APPROVE' && 'bg-green-600 hover:bg-green-700',
                action === 'REJECT' && 'bg-red-600 hover:bg-red-700'
              )}
            >
              {isProcessing ? (
                'Processing...'
              ) : action === 'APPROVE' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Expense
                </>
              ) : action === 'REJECT' ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Reject Expense
                </>
              ) : (
                'Select Action'
              )}
            </Button>
          </div>
        </div>
      </Sheet.Content>
    </Sheet>
  )
}