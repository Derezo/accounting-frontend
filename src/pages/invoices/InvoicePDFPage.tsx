import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InvoicePDFGenerator, InvoiceData } from '@/components/pdf/InvoicePDFGenerator'
import { PDFPreviewModal } from '@/components/pdf/PDFPreviewModal'
import { BulkPDFGenerator, BulkPDFItem } from '@/components/pdf/BulkPDFGenerator'
import { LoadingSpinner } from '@/components/ui/loading'
import { useAuth } from '@/hooks/useAuth'
import { useLoadingState } from '@/hooks/useLoadingState'
import {
  ArrowLeft,
  FileText,
  Download,
  Eye,
  Mail,
  Share,
  Settings,
  Users,
  AlertTriangle,
  Package
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface InvoicePDFPageProps {
  className?: string
}

// Mock invoice data
const mockInvoice: InvoiceData = {
  id: 'inv_1234567890',
  number: 'INV-2024-001',
  date: '2024-01-15',
  dueDate: '2024-02-15',
  status: 'SENT',
  currency: 'USD',
  company: {
    name: 'Acme Corporation',
    address: '123 Business Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
    phone: '+1 (555) 123-4567',
    email: 'billing@acme.com',
    website: 'www.acme.com',
    taxId: 'TAX123456789'
  },
  customer: {
    id: 'cust_123',
    name: 'Tech Solutions Inc.',
    email: 'accounts@techsolutions.com',
    address: '456 Client Avenue',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90210',
    country: 'United States',
    type: 'BUSINESS',
    taxId: 'CLI987654321'
  },
  items: [
    {
      id: '1',
      description: 'Web Development Services - Q1 2024',
      quantity: 40,
      unitPrice: 150.00,
      amount: 6000.00,
      taxRate: 0.0875,
      taxAmount: 525.00
    },
    {
      id: '2',
      description: 'UI/UX Design Consultation',
      quantity: 20,
      unitPrice: 200.00,
      amount: 4000.00,
      taxRate: 0.0875,
      taxAmount: 350.00
    },
    {
      id: '3',
      description: 'Project Management Services',
      quantity: 15,
      unitPrice: 120.00,
      amount: 1800.00,
      taxRate: 0.0875,
      taxAmount: 157.50
    }
  ],
  subtotal: 11800.00,
  taxTotal: 1032.50,
  discountTotal: 0.00,
  total: 12832.50,
  notes: 'Thank you for your business. Please remit payment within 30 days.',
  terms: 'Payment is due within 30 days of invoice date. Late payments may incur a 1.5% monthly service charge.',
  paymentInstructions: 'Wire transfers: Account #12345678, Routing #987654321. Credit card payments accepted online.',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  createdBy: 'user_admin'
}

// Mock bulk items
const mockBulkItems: BulkPDFItem[] = [
  {
    id: 'inv_001',
    type: 'INVOICE',
    number: 'INV-2024-001',
    customerName: 'Tech Solutions Inc.',
    amount: 12832.50,
    currency: 'USD',
    date: '2024-01-15',
    status: 'PENDING',
    priority: 'HIGH'
  },
  {
    id: 'inv_002',
    type: 'INVOICE',
    number: 'INV-2024-002',
    customerName: 'Digital Marketing Co.',
    amount: 8450.00,
    currency: 'USD',
    date: '2024-01-16',
    status: 'PENDING',
    priority: 'NORMAL'
  },
  {
    id: 'inv_003',
    type: 'INVOICE',
    number: 'INV-2024-003',
    customerName: 'StartupXYZ',
    amount: 5200.00,
    currency: 'USD',
    date: '2024-01-17',
    status: 'PENDING',
    priority: 'LOW'
  },
  {
    id: 'quote_001',
    type: 'QUOTE',
    number: 'QUO-2024-001',
    customerName: 'Enterprise Corp',
    amount: 25000.00,
    currency: 'USD',
    date: '2024-01-18',
    status: 'PENDING',
    priority: 'HIGH'
  },
  {
    id: 'quote_002',
    type: 'QUOTE',
    number: 'QUO-2024-002',
    customerName: 'Small Business LLC',
    amount: 3500.00,
    currency: 'USD',
    date: '2024-01-19',
    status: 'PENDING',
    priority: 'NORMAL'
  }
]

export function InvoicePDFPage({ className }: InvoicePDFPageProps) {
  const { invoiceId } = useParams<{ invoiceId?: string }>()
  const navigate = useNavigate()
  const { user, canAccess } = useAuth()
  const loadingState = useLoadingState()

  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single')
  const [error, setError] = useState<string | null>(null)
  const [generatedPDF, setGeneratedPDF] = useState<Blob | null>(null)

  useEffect(() => {
    if (invoiceId) {
      setActiveTab('single')
      fetchInvoice(invoiceId)
    } else {
      setActiveTab('bulk')
    }
  }, [invoiceId])

  const fetchInvoice = async (id: string) => {
    try {
      loadingState.startLoading({
        showProgress: true,
        progressMessage: 'Loading invoice details...'
      })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In real implementation:
      // const response = await invoiceService.getInvoice(id)
      setInvoice(mockInvoice)
    } catch (err: any) {
      setError(err.message || 'Failed to load invoice')
    } finally {
      loadingState.stopLoading({ success: true })
    }
  }

  const handlePDFGenerated = (pdfBlob: Blob) => {
    setGeneratedPDF(pdfBlob)
  }

  const handleEmailSent = () => {
    // Handle email sent notification
    console.log('PDF emailed to customer')
  }

  const handleBulkJobComplete = (job: any) => {
    console.log('Bulk job completed:', job)
  }

  if (loadingState.isLoading) {
    return (
      <div className={cn('container mx-auto p-6', className)}>
        <LoadingSpinner size="lg" message="Loading invoice details..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('container mx-auto p-6 space-y-6', className)}>
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  if (activeTab === 'single' && !invoice) {
    return (
      <div className={cn('container mx-auto p-6', className)}>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Invoice not found. Please check the invoice ID and try again.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Check permissions
  if (!canAccess('invoices', 'read')) {
    return (
      <div className={cn('container mx-auto p-6', className)}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access invoice PDFs.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className={cn('container mx-auto p-6 space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <h1 className="text-2xl font-bold">
          {activeTab === 'single' ? 'Invoice PDF Generator' : 'Bulk PDF Generator'}
        </h1>
      </div>

      {/* Navigation Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'single' | 'bulk')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single" className="gap-2">
                <FileText className="h-4 w-4" />
                Single Invoice
              </TabsTrigger>
              <TabsTrigger value="bulk" className="gap-2">
                <Package className="h-4 w-4" />
                Bulk Generation
              </TabsTrigger>
            </TabsList>

            {/* Single Invoice Tab */}
            <TabsContent value="single" className="mt-6">
              {invoice ? (
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        <PDFPreviewModal
                          trigger={
                            <Button variant="outline" className="gap-2">
                              <Eye className="h-4 w-4" />
                              Preview PDF
                            </Button>
                          }
                          fileName={`invoice-${invoice.number}.pdf`}
                          title={`Invoice ${invoice.number} Preview`}
                          description={`${invoice.customer.name} - ${invoice.currency} ${invoice.total.toFixed(2)}`}
                          pdfBlob={generatedPDF}
                        />

                        <Button variant="outline" className="gap-2">
                          <Download className="h-4 w-4" />
                          Download PDF
                        </Button>

                        <Button variant="outline" className="gap-2">
                          <Mail className="h-4 w-4" />
                          Email to Customer
                        </Button>

                        <Button variant="outline" className="gap-2">
                          <Share className="h-4 w-4" />
                          Share Link
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* PDF Generator */}
                  <InvoicePDFGenerator
                    invoice={invoice}
                    onGenerated={handlePDFGenerated}
                    onEmailSent={handleEmailSent}
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Invoice Selected</h3>
                  <p className="text-muted-foreground mb-4">
                    Please select an invoice to generate PDF
                  </p>
                  <Button onClick={() => navigate('/invoices')}>
                    Browse Invoices
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Bulk Generation Tab */}
            <TabsContent value="bulk" className="mt-6">
              <div className="space-y-6">
                {/* Info Alert */}
                <Alert>
                  <Package className="h-4 w-4" />
                  <AlertDescription>
                    Generate PDFs for multiple invoices, quotes, and other documents in batches.
                    Configure templates, output formats, and delivery options.
                  </AlertDescription>
                </Alert>

                {/* Bulk Generator */}
                <BulkPDFGenerator
                  items={mockBulkItems}
                  onJobComplete={handleBulkJobComplete}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Tips & Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">PDF Generation</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• PDFs are generated with your company branding</li>
                <li>• Multiple template styles available</li>
                <li>• Automatic tax calculations included</li>
                <li>• Attachments can be embedded</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Delivery Options</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Direct download to your device</li>
                <li>• Email automatically to customers</li>
                <li>• Share via secure links</li>
                <li>• Bulk ZIP file downloads</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}