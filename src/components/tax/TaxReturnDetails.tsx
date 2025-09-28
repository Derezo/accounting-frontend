import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading'
import {
  FileText,
  Download,
  Edit,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  User,
  Building,
  Clock,
  Receipt
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface TaxReturn {
  id: string
  jurisdiction: string
  taxYear: number
  returnType: 'INCOME_TAX' | 'SALES_TAX' | 'PAYROLL_TAX' | 'PROPERTY_TAX' | 'OTHER'
  filingStatus: 'SINGLE' | 'MARRIED_FILING_JOINTLY' | 'MARRIED_FILING_SEPARATELY' | 'HEAD_OF_HOUSEHOLD' | 'QUALIFYING_WIDOW'
  status: 'DRAFT' | 'FILED' | 'ACCEPTED' | 'REJECTED' | 'AMENDED'
  dueDate: string
  extensionDate?: string
  filedDate?: string
  totalIncome: number
  totalDeductions: number
  taxableIncome: number
  taxOwed: number
  taxPaid: number
  refundAmount?: number
  amountDue?: number
  preparerName?: string
  preparerLicense?: string
  notes?: string
  attachments: Array<{
    id: string
    fileName: string
    fileSize: number
    uploadedAt: string
    type: string
  }>
  filingHistory: Array<{
    id: string
    action: string
    date: string
    user: string
    notes?: string
  }>
  createdAt: string
  updatedAt: string
}

interface TaxReturnDetailsProps {
  taxReturn: TaxReturn
  onEdit?: () => void
  onDownload?: (format: 'PDF' | 'XML') => void
  onAmend?: () => void
  onDelete?: () => void
  isLoading?: boolean
}

export function TaxReturnDetails({
  taxReturn,
  onEdit,
  onDownload,
  onAmend,
  onDelete,
  isLoading = false
}: TaxReturnDetailsProps) {
  const [activeTab, setActiveTab] = useState('details')

  const getStatusColor = (status: TaxReturn['status']) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'FILED':
        return 'bg-blue-100 text-blue-800'
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'AMENDED':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: TaxReturn['status']) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircle className="h-4 w-4" />
      case 'REJECTED':
        return <AlertTriangle className="h-4 w-4" />
      case 'FILED':
        return <FileText className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const balance = (taxReturn.taxOwed || 0) - (taxReturn.taxPaid || 0)
  const isRefund = balance < 0
  const isAmountDue = balance > 0

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground mt-4">Loading tax return details...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Tax Return #{taxReturn.id.slice(-8)}
              </CardTitle>
              <CardDescription>
                {taxReturn.jurisdiction} • {taxReturn.taxYear} • {taxReturn.returnType.replace('_', ' ')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn('flex items-center gap-1', getStatusColor(taxReturn.status))}>
                {getStatusIcon(taxReturn.status)}
                {taxReturn.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-medium">{format(new Date(taxReturn.dueDate), 'MMM d, yyyy')}</p>
              </div>
            </div>
            {taxReturn.filedDate && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Filed Date</p>
                  <p className="font-medium">{format(new Date(taxReturn.filedDate), 'MMM d, yyyy')}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Tax Owed</p>
                <p className="font-medium">${taxReturn.taxOwed.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className={cn('font-medium',
                  isRefund ? 'text-green-600' : isAmountDue ? 'text-red-600' : 'text-muted-foreground'
                )}>
                  {isRefund ? `Refund: $${Math.abs(balance).toLocaleString()}` :
                   isAmountDue ? `Due: $${balance.toLocaleString()}` :
                   '$0.00'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {onEdit && (
          <Button onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Return
          </Button>
        )}
        {onDownload && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onDownload('PDF')}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={() => onDownload('XML')}>
              <Download className="h-4 w-4 mr-2" />
              Download XML
            </Button>
          </div>
        )}
        {onAmend && taxReturn.status === 'ACCEPTED' && (
          <Button variant="outline" onClick={onAmend}>
            <FileText className="h-4 w-4 mr-2" />
            File Amendment
          </Button>
        )}
        {onDelete && taxReturn.status === 'DRAFT' && (
          <Button variant="destructive" onClick={onDelete}>
            Delete Draft
          </Button>
        )}
      </div>

      {/* Balance Alert */}
      {balance !== 0 && (
        <Alert className={isAmountDue ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {isAmountDue
              ? `Amount due: $${balance.toLocaleString()}. Payment is required by ${format(new Date(taxReturn.dueDate), 'MMM d, yyyy')}.`
              : `Refund expected: $${Math.abs(balance).toLocaleString()}. This will be processed after acceptance.`
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Information */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Financial Details</TabsTrigger>
          <TabsTrigger value="preparer">Preparer Info</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="history">Filing History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Income</span>
                    <span className="font-medium">${taxReturn.totalIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Deductions</span>
                    <span className="font-medium">${taxReturn.totalDeductions.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Taxable Income</span>
                    <span className="font-bold">${taxReturn.taxableIncome.toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tax Owed</span>
                    <span className="font-medium">${taxReturn.taxOwed.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tax Paid</span>
                    <span className="font-medium">${taxReturn.taxPaid.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {isRefund ? 'Refund Amount' : isAmountDue ? 'Amount Due' : 'Balance'}
                    </span>
                    <span className={cn('font-bold',
                      isRefund ? 'text-green-600' : isAmountDue ? 'text-red-600' : 'text-muted-foreground'
                    )}>
                      ${Math.abs(balance).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Return Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Filing Status</p>
                  <p className="font-medium">{taxReturn.filingStatus.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Return Type</p>
                  <p className="font-medium">{taxReturn.returnType.replace('_', ' ')}</p>
                </div>
                {taxReturn.extensionDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Extension Date</p>
                    <p className="font-medium">{format(new Date(taxReturn.extensionDate), 'MMM d, yyyy')}</p>
                  </div>
                )}
              </div>
              {taxReturn.notes && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="mt-1">{taxReturn.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preparer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Tax Preparer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {taxReturn.preparerName ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Preparer Name</p>
                    <p className="font-medium">{taxReturn.preparerName}</p>
                  </div>
                  {taxReturn.preparerLicense && (
                    <div>
                      <p className="text-sm text-muted-foreground">License Number</p>
                      <p className="font-medium">{taxReturn.preparerLicense}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No preparer information available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attachments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supporting Documents</CardTitle>
              <CardDescription>
                {taxReturn.attachments.length} attachment{taxReturn.attachments.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {taxReturn.attachments.length > 0 ? (
                <div className="space-y-3">
                  {taxReturn.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{attachment.fileName}</p>
                          <p className="text-sm text-muted-foreground">
                            {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB •
                            Uploaded {format(new Date(attachment.uploadedAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No attachments uploaded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filing History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taxReturn.filingHistory.map((entry, index) => (
                  <div key={entry.id} className="flex items-start gap-3 pb-4 border-b last:border-b-0">
                    <div className="p-2 bg-muted rounded-lg">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{entry.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(entry.date), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">by {entry.user}</p>
                      {entry.notes && (
                        <p className="text-sm mt-1">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}