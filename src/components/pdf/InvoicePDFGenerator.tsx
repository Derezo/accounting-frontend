import { useState, useRef } from 'react'
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, PDFViewer, Image } from '@react-pdf/renderer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Download,
  Eye,
  FileText,
  Printer,
  Mail,
  Settings,
  Palette,
  Layout,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface InvoiceData {
  id: string
  number: string
  date: string
  dueDate: string
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  currency: string

  // Company information
  company: {
    name: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
    phone?: string
    email?: string
    website?: string
    logo?: string
    taxId?: string
  }

  // Customer information
  customer: {
    id: string
    name: string
    email: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
    type: 'PERSON' | 'BUSINESS'
    taxId?: string
  }

  // Invoice items
  items: {
    id: string
    description: string
    quantity: number
    unitPrice: number
    amount: number
    taxRate?: number
    taxAmount?: number
  }[]

  // Totals
  subtotal: number
  taxTotal: number
  discountTotal: number
  total: number

  // Additional details
  notes?: string
  terms?: string
  paymentInstructions?: string

  // Metadata
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface PDFTemplate {
  id: string
  name: string
  description: string
  preview: string
  colors: {
    primary: string
    secondary: string
    text: string
    accent: string
  }
  layout: 'modern' | 'classic' | 'minimal' | 'professional'
}

export interface PDFGeneratorProps {
  invoice: InvoiceData
  className?: string
  onGenerated?: (pdfBlob: Blob) => void
  onEmailSent?: () => void
}

const templates: PDFTemplate[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean and contemporary design with bold typography',
    preview: '/templates/modern-preview.png',
    colors: {
      primary: '#2563eb',
      secondary: '#f8fafc',
      text: '#1e293b',
      accent: '#0ea5e9'
    },
    layout: 'modern'
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional business invoice with professional styling',
    preview: '/templates/classic-preview.png',
    colors: {
      primary: '#1f2937',
      secondary: '#f9fafb',
      text: '#374151',
      accent: '#6b7280'
    },
    layout: 'classic'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and clean design focused on content',
    preview: '/templates/minimal-preview.png',
    colors: {
      primary: '#000000',
      secondary: '#ffffff',
      text: '#404040',
      accent: '#666666'
    },
    layout: 'minimal'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Corporate design with structured layout',
    preview: '/templates/professional-preview.png',
    colors: {
      primary: '#059669',
      secondary: '#f0fdf4',
      text: '#065f46',
      accent: '#10b981'
    },
    layout: 'professional'
  }
]

// PDF Styles
const createStyles = (template: PDFTemplate) => StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    backgroundColor: template.colors.secondary,
    color: template.colors.text
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: template.colors.primary
  },
  companyInfo: {
    flex: 1
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: template.colors.primary,
    marginBottom: 5
  },
  companyDetails: {
    fontSize: 9,
    lineHeight: 1.4,
    color: template.colors.text
  },
  invoiceInfo: {
    alignItems: 'flex-end'
  },
  invoiceTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: template.colors.primary,
    marginBottom: 10
  },
  invoiceNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5
  },
  invoiceDate: {
    fontSize: 10,
    color: template.colors.text
  },
  billToSection: {
    marginBottom: 30
  },
  billToTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: template.colors.primary,
    marginBottom: 10
  },
  customerInfo: {
    fontSize: 10,
    lineHeight: 1.4
  },
  table: {
    marginBottom: 30
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: template.colors.primary,
    padding: 8,
    color: '#ffffff'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 8,
    minHeight: 35
  },
  tableColDescription: {
    flex: 3,
    fontSize: 9
  },
  tableColQuantity: {
    flex: 1,
    textAlign: 'center',
    fontSize: 9
  },
  tableColPrice: {
    flex: 1,
    textAlign: 'right',
    fontSize: 9
  },
  tableColAmount: {
    flex: 1,
    textAlign: 'right',
    fontSize: 9,
    fontWeight: 'bold'
  },
  totalsSection: {
    alignItems: 'flex-end',
    marginBottom: 30
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    paddingVertical: 3
  },
  totalLabel: {
    fontSize: 10
  },
  totalAmount: {
    fontSize: 10,
    fontWeight: 'bold'
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 200,
    paddingVertical: 5,
    borderTopWidth: 2,
    borderTopColor: template.colors.primary,
    marginTop: 5
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: template.colors.primary
  },
  grandTotalAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: template.colors.primary
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  notes: {
    fontSize: 9,
    lineHeight: 1.4,
    marginBottom: 15
  },
  terms: {
    fontSize: 8,
    lineHeight: 1.3,
    color: '#6b7280'
  }
})

// PDF Document Component
const InvoicePDFDocument = ({ invoice, template }: { invoice: InvoiceData; template: PDFTemplate }) => {
  const styles = createStyles(template)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{invoice.company.name}</Text>
            <View style={styles.companyDetails}>
              <Text>{invoice.company.address}</Text>
              <Text>{invoice.company.city}, {invoice.company.state} {invoice.company.zipCode}</Text>
              <Text>{invoice.company.country}</Text>
              {invoice.company.phone && <Text>Phone: {invoice.company.phone}</Text>}
              {invoice.company.email && <Text>Email: {invoice.company.email}</Text>}
              {invoice.company.website && <Text>Website: {invoice.company.website}</Text>}
              {invoice.company.taxId && <Text>Tax ID: {invoice.company.taxId}</Text>}
            </View>
          </View>

          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{invoice.number}</Text>
            <Text style={styles.invoiceDate}>Date: {new Date(invoice.date).toLocaleDateString()}</Text>
            <Text style={styles.invoiceDate}>Due: {new Date(invoice.dueDate).toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Bill To */}
        <View style={styles.billToSection}>
          <Text style={styles.billToTitle}>BILL TO:</Text>
          <View style={styles.customerInfo}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>{invoice.customer.name}</Text>
            <Text>{invoice.customer.address}</Text>
            <Text>{invoice.customer.city}, {invoice.customer.state} {invoice.customer.zipCode}</Text>
            <Text>{invoice.customer.country}</Text>
            <Text>Email: {invoice.customer.email}</Text>
            {invoice.customer.taxId && <Text>Tax ID: {invoice.customer.taxId}</Text>}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableColDescription}>DESCRIPTION</Text>
            <Text style={styles.tableColQuantity}>QTY</Text>
            <Text style={styles.tableColPrice}>RATE</Text>
            <Text style={styles.tableColAmount}>AMOUNT</Text>
          </View>

          {/* Table Rows */}
          {invoice.items.map((item, index) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.tableColDescription}>{item.description}</Text>
              <Text style={styles.tableColQuantity}>{item.quantity}</Text>
              <Text style={styles.tableColPrice}>{invoice.currency} {item.unitPrice.toFixed(2)}</Text>
              <Text style={styles.tableColAmount}>{invoice.currency} {item.amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalAmount}>{invoice.currency} {invoice.subtotal.toFixed(2)}</Text>
          </View>

          {invoice.discountTotal > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount:</Text>
              <Text style={styles.totalAmount}>-{invoice.currency} {invoice.discountTotal.toFixed(2)}</Text>
            </View>
          )}

          {invoice.taxTotal > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax:</Text>
              <Text style={styles.totalAmount}>{invoice.currency} {invoice.taxTotal.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>TOTAL:</Text>
            <Text style={styles.grandTotalAmount}>{invoice.currency} {invoice.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {invoice.notes && (
            <View style={styles.notes}>
              <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Notes:</Text>
              <Text>{invoice.notes}</Text>
            </View>
          )}

          {invoice.paymentInstructions && (
            <View style={styles.notes}>
              <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Payment Instructions:</Text>
              <Text>{invoice.paymentInstructions}</Text>
            </View>
          )}

          {invoice.terms && (
            <View style={styles.terms}>
              <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Terms & Conditions:</Text>
              <Text>{invoice.terms}</Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  )
}

export function InvoicePDFGenerator({ invoice, className, onGenerated, onEmailSent }: PDFGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate>(templates[0])
  const [showPreview, setShowPreview] = useState(false)
  const [includeAttachments, setIncludeAttachments] = useState(false)
  const [emailAfterGeneration, setEmailAfterGeneration] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const pdfRef = useRef<HTMLDivElement>(null)

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(template)
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      // In a real implementation, you'd generate the PDF blob here
      // const pdfBlob = await generatePDFBlob()
      // onGenerated?.(pdfBlob)

      if (emailAfterGeneration) {
        // Send email logic here
        onEmailSent?.()
      }
    } catch (error) {
      console.error('Failed to generate PDF:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      DRAFT: { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800' },
      SENT: { variant: 'default' as const, className: 'bg-blue-100 text-blue-800' },
      PAID: { variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      OVERDUE: { variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
      CANCELLED: { variant: 'outline' as const, className: 'bg-gray-100 text-gray-800' }
    }

    const config = variants[status as keyof typeof variants] || variants.DRAFT

    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Invoice Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice {invoice.number}
            </CardTitle>
            {getStatusBadge(invoice.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium mb-2">Customer</h4>
              <p className="text-sm text-muted-foreground">{invoice.customer.name}</p>
              <p className="text-sm text-muted-foreground">{invoice.customer.email}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Amount</h4>
              <p className="text-2xl font-bold">{invoice.currency} {invoice.total.toFixed(2)}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Due Date</h4>
              <p className="text-sm text-muted-foreground">
                {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PDF Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            PDF Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Template Style
            </Label>
            <Select value={selectedTemplate.id} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: template.colors.primary }}
                      />
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-muted-foreground">{template.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Options */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Generation Options
            </Label>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeAttachments"
                  checked={includeAttachments}
                  onCheckedChange={(checked) => setIncludeAttachments(checked as boolean)}
                />
                <Label htmlFor="includeAttachments" className="text-sm">
                  Include attachments in PDF
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emailAfterGeneration"
                  checked={emailAfterGeneration}
                  onCheckedChange={(checked) => setEmailAfterGeneration(checked as boolean)}
                />
                <Label htmlFor="emailAfterGeneration" className="text-sm">
                  Email PDF to customer after generation
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setShowPreview(!showPreview)}
              variant="outline"
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>

            <PDFDownloadLink
              document={<InvoicePDFDocument invoice={invoice} template={selectedTemplate} />}
              fileName={`invoice-${invoice.number}.pdf`}
            >
              {({ blob, url, loading, error }) => (
                <Button
                  disabled={loading || isGenerating}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {loading ? 'Generating...' : 'Download PDF'}
                </Button>
              )}
            </PDFDownloadLink>

            <Button variant="outline" className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>

            <Button variant="outline" className="gap-2">
              <Mail className="h-4 w-4" />
              Email to Customer
            </Button>
          </div>

          {emailAfterGeneration && (
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                The PDF will be automatically emailed to {invoice.customer.email} after generation.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* PDF Preview */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              PDF Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
              <PDFViewer width="100%" height="100%">
                <InvoicePDFDocument invoice={invoice} template={selectedTemplate} />
              </PDFViewer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}