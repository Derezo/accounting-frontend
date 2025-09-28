import { useState, useEffect, useRef } from 'react'
import DOMPurify from 'dompurify'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import {
  Download,
  Send,
  Eye,
  Settings,
  Palette,
  Layout,
  FileText,
  Mail,
  Loader2,
  Copy,
  Save,
  RefreshCw,
} from 'lucide-react'
import { Invoice, InvoiceTemplate, OrganizationSettings } from '@/types/api'
import { useOrganizationStore } from '@/stores/organization.store'
import { useSendInvoiceEmail } from '@/hooks/useAPI'
import { InvoicePdfService } from '@/services/invoice-pdf.service'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface InvoicePreviewProps {
  invoice: Invoice
  organization?: OrganizationSettings
  onTemplateChange?: (template: InvoiceTemplate) => void
  onClose?: () => void
}

export function InvoicePreview({
  invoice,
  organization,
  onTemplateChange,
  onClose
}: InvoicePreviewProps) {
  const [activeTab, setActiveTab] = useState('preview')
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [emailDetails, setEmailDetails] = useState({
    recipientEmail: invoice.customer?.email || '',
    subject: `Invoice ${invoice.invoiceNumber} from ${organization?.companyName || 'Your Company'}`,
    message: ''
  })

  const {
    currentTemplate,
    templates,
    setCurrentTemplate,
    updateTemplate
  } = useOrganizationStore()

  const sendEmail = useSendInvoiceEmail()
  const previewRef = useRef<HTMLDivElement>(null)

  // Use default template if none selected
  useEffect(() => {
    if (!currentTemplate && templates.length > 0) {
      const defaultTemplate = templates.find(t => t.isDefault) || templates[0]
      setCurrentTemplate(defaultTemplate)
    }
  }, [templates, currentTemplate, setCurrentTemplate])

  // Generate preview HTML for the invoice
  const generatePreviewHTML = () => {
    if (!currentTemplate || !organization) return ''

    return `
      <div style="font-family: ${currentTemplate.fontFamily}; font-size: ${currentTemplate.fontSize}px; line-height: 1.4; color: #111827; max-width: 800px; margin: 0 auto; padding: 30px; background: white;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: ${currentTemplate.headerLayout === 'horizontal' ? 'flex-start' : 'center'}; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid ${currentTemplate.primaryColor};">
          <div style="text-align: ${currentTemplate.logoPosition};">
            ${organization.logo ? `<img src="${organization.logo}" style="width: 120px; height: 40px; object-fit: contain; margin-bottom: ${currentTemplate.headerLayout === 'vertical' ? '10px' : '0'};" />` : ''}
            <h1 style="font-size: ${currentTemplate.layout === 'creative' ? '24px' : '18px'}; font-weight: bold; color: ${currentTemplate.primaryColor}; margin: 5px 0; font-family: ${currentTemplate.layout === 'creative' ? 'Playfair Display' : currentTemplate.fontFamily};">${organization.companyName}</h1>
            <div style="font-size: 9px; color: #6B7280;">
              ${organization.address ? `
                <div>${organization.address.street}</div>
                <div>${organization.address.city}, ${organization.address.province} ${organization.address.postalCode}</div>
                <div>${organization.address.country}</div>
              ` : ''}
              ${organization.email ? `<div>Email: ${organization.email}</div>` : ''}
              ${organization.phone ? `<div>Phone: ${organization.phone}</div>` : ''}
            </div>
          </div>
        </div>

        <!-- Invoice Title and Details -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <h2 style="font-size: ${currentTemplate.layout === 'creative' ? '28px' : '24px'}; font-weight: bold; color: ${currentTemplate.primaryColor}; margin-bottom: 10px; font-family: ${currentTemplate.layout === 'creative' ? 'Playfair Display' : currentTemplate.fontFamily};">INVOICE</h2>

            ${currentTemplate.sections.customerDetails && invoice.customer ? `
              <div style="margin-bottom: 20px;">
                <h3 style="font-size: 12px; font-weight: bold; color: ${currentTemplate.secondaryColor}; margin-bottom: 8px; text-transform: uppercase;">Bill To</h3>
                <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">
                  ${invoice.customer.type === 'PERSON'
                    ? `${invoice.customer.person?.firstName} ${invoice.customer.person?.lastName}`
                    : invoice.customer.business?.businessName
                  }
                </div>
                ${invoice.customer.address ? `
                  <div style="font-size: 9px; color: #6B7280;">
                    <div>${invoice.customer.address.street}</div>
                    <div>${invoice.customer.address.city}, ${invoice.customer.address.province} ${invoice.customer.address.postalCode}</div>
                    <div>${invoice.customer.address.country}</div>
                    ${invoice.customer.email ? `<div>Email: ${invoice.customer.email}</div>` : ''}
                    ${invoice.customer.phone ? `<div>Phone: ${invoice.customer.phone}</div>` : ''}
                  </div>
                ` : ''}
              </div>
            ` : ''}
          </div>

          ${currentTemplate.sections.invoiceDetails ? `
            <div style="background: ${currentTemplate.layout === 'modern' ? '#F9FAFB' : 'transparent'}; padding: ${currentTemplate.layout === 'modern' ? '15px' : '0'}; border-radius: ${currentTemplate.layout === 'modern' ? '8px' : '0'}; border: ${currentTemplate.layout === 'classic' ? '1px solid #E5E7EB' : 'none'};">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 9px; color: #6B7280; font-weight: bold;">Invoice Number</span>
                <span style="font-size: 9px;">${invoice.invoiceNumber}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 9px; color: #6B7280; font-weight: bold;">Issue Date</span>
                <span style="font-size: 9px;">${formatDate(invoice.issueDate)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 9px; color: #6B7280; font-weight: bold;">Due Date</span>
                <span style="font-size: 9px;">${formatDate(invoice.dueDate)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 9px; color: #6B7280; font-weight: bold;">Status</span>
                <span style="font-size: 9px; color: ${invoice.status === 'PAID' ? '#10B981' : '#F59E0B'};">${invoice.status}</span>
              </div>
              ${invoice.quote ? `
                <div style="display: flex; justify-content: space-between;">
                  <span style="font-size: 9px; color: #6B7280; font-weight: bold;">Quote Reference</span>
                  <span style="font-size: 9px;">${invoice.quote.quoteNumber}</span>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>

        <!-- Line Items -->
        ${currentTemplate.sections.lineItems ? `
          <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
            <thead>
              <tr style="background: ${currentTemplate.layout === 'modern' ? currentTemplate.primaryColor : '#F9FAFB'};">
                ${currentTemplate.lineItemColumns.description ? `<th style="padding: 10px; font-size: 9px; font-weight: bold; color: ${currentTemplate.layout === 'modern' ? '#FFFFFF' : '#374151'}; text-transform: uppercase; text-align: left;">Description</th>` : ''}
                ${currentTemplate.lineItemColumns.quantity ? `<th style="padding: 10px; font-size: 9px; font-weight: bold; color: ${currentTemplate.layout === 'modern' ? '#FFFFFF' : '#374151'}; text-transform: uppercase; text-align: center;">Qty</th>` : ''}
                ${currentTemplate.lineItemColumns.unitPrice ? `<th style="padding: 10px; font-size: 9px; font-weight: bold; color: ${currentTemplate.layout === 'modern' ? '#FFFFFF' : '#374151'}; text-transform: uppercase; text-align: right;">Unit Price</th>` : ''}
                ${currentTemplate.lineItemColumns.taxRate ? `<th style="padding: 10px; font-size: 9px; font-weight: bold; color: ${currentTemplate.layout === 'modern' ? '#FFFFFF' : '#374151'}; text-transform: uppercase; text-align: center;">Tax %</th>` : ''}
                ${currentTemplate.lineItemColumns.total ? `<th style="padding: 10px; font-size: 9px; font-weight: bold; color: ${currentTemplate.layout === 'modern' ? '#FFFFFF' : '#374151'}; text-transform: uppercase; text-align: right;">Total</th>` : ''}
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map((item, index) => `
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  ${currentTemplate.lineItemColumns.description ? `<td style="padding: 10px; font-size: 9px;">${item.description}</td>` : ''}
                  ${currentTemplate.lineItemColumns.quantity ? `<td style="padding: 10px; font-size: 9px; text-align: center;">${item.quantity}</td>` : ''}
                  ${currentTemplate.lineItemColumns.unitPrice ? `<td style="padding: 10px; font-size: 9px; text-align: right;">${formatCurrency(item.unitPrice)}</td>` : ''}
                  ${currentTemplate.lineItemColumns.taxRate ? `<td style="padding: 10px; font-size: 9px; text-align: center;">${(item.taxRate * 100).toFixed(1)}%</td>` : ''}
                  ${currentTemplate.lineItemColumns.total ? `<td style="padding: 10px; font-size: 9px; text-align: right;">${formatCurrency(item.quantity * item.unitPrice)}</td>` : ''}
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}

        <!-- Totals -->
        ${currentTemplate.sections.subtotals ? `
          <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
            <div style="width: 200px;">
              <div style="display: flex; justify-content: space-between; padding: 4px 10px;">
                <span style="font-size: 10px; color: #6B7280;">Subtotal</span>
                <span style="font-size: 10px; font-weight: bold;">${formatCurrency(invoice.subtotal)}</span>
              </div>
              ${currentTemplate.sections.taxBreakdown ? `
                <div style="display: flex; justify-content: space-between; padding: 4px 10px;">
                  <span style="font-size: 10px; color: #6B7280;">Tax</span>
                  <span style="font-size: 10px; font-weight: bold;">${formatCurrency(invoice.taxAmount)}</span>
                </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; padding: 8px 10px; background: ${currentTemplate.primaryColor}; margin-top: 5px; border-radius: 4px;">
                <span style="font-size: 12px; color: #FFFFFF; font-weight: bold;">Total</span>
                <span style="font-size: 12px; color: #FFFFFF; font-weight: bold;">${formatCurrency(invoice.total)}</span>
              </div>
              ${invoice.amountDue > 0 ? `
                <div style="display: flex; justify-content: space-between; padding: 4px 10px;">
                  <span style="font-size: 10px; color: #DC2626;">Amount Due</span>
                  <span style="font-size: 10px; font-weight: bold; color: #DC2626;">${formatCurrency(invoice.amountDue)}</span>
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}

        <!-- Notes -->
        ${currentTemplate.sections.notes && invoice.notes ? `
          <div style="margin-top: 30px;">
            <h3 style="font-size: 11px; font-weight: bold; color: ${currentTemplate.secondaryColor}; margin-bottom: 8px;">Notes</h3>
            <p style="font-size: 9px; color: #6B7280; line-height: 1.4;">${invoice.notes}</p>
          </div>
        ` : ''}

        <!-- Terms -->
        ${currentTemplate.sections.termsAndConditions && invoice.terms ? `
          <div style="margin-top: 20px;">
            <h3 style="font-size: 11px; font-weight: bold; color: ${currentTemplate.secondaryColor}; margin-bottom: 8px;">Terms and Conditions</h3>
            <p style="font-size: 9px; color: #6B7280; line-height: 1.4;">${invoice.terms}</p>
          </div>
        ` : ''}

        <!-- Banking Details -->
        ${currentTemplate.sections.bankingDetails && organization.bankingDetails ? `
          <div style="margin-top: 20px; padding: 15px; background: #F9FAFB; border-radius: 8px; border: 1px solid #E5E7EB;">
            <h3 style="font-size: 11px; font-weight: bold; color: ${currentTemplate.secondaryColor}; margin-bottom: 8px;">Banking Details</h3>
            <div style="font-size: 9px; color: #6B7280; line-height: 1.3;">
              <div>Bank: ${organization.bankingDetails.bankName}</div>
              <div>Account: ${organization.bankingDetails.accountName}</div>
              <div>Number: ${organization.bankingDetails.accountNumber}</div>
              <div>Routing: ${organization.bankingDetails.routingNumber}</div>
              ${organization.bankingDetails.swiftCode ? `<div>SWIFT: ${organization.bankingDetails.swiftCode}</div>` : ''}
            </div>
          </div>
        ` : ''}

        <!-- Footer -->
        ${currentTemplate.sections.footer && organization.invoiceSettings.footerText ? `
          <div style="text-align: center; margin-top: 40px; padding-top: 15px; border-top: 1px solid #E5E7EB; font-size: 8px; color: #6B7280;">
            ${organization.invoiceSettings.footerText}
          </div>
        ` : ''}
      </div>
    `
  }

  const handleDownloadPdf = async () => {
    if (!currentTemplate || !organization) {
      toast.error('Template or organization settings not available')
      return
    }

    setIsGeneratingPdf(true)
    try {
      await InvoicePdfService.downloadPdf({
        invoice,
        template: currentTemplate,
        organization,
      })
      toast.success('Invoice PDF downloaded successfully')
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const handleSendEmail = async () => {
    if (!emailDetails.recipientEmail) {
      toast.error('Please enter a recipient email address')
      return
    }

    setIsSending(true)
    try {
      await sendEmail.mutateAsync({
        invoiceId: invoice.id,
        recipientEmail: emailDetails.recipientEmail,
        subject: emailDetails.subject,
        message: emailDetails.message,
        attachPdf: true,
      })
      toast.success('Invoice sent successfully')
      onClose?.()
    } catch (error) {
      console.error('Email sending error:', error)
      toast.error('Failed to send invoice')
    } finally {
      setIsSending(false)
    }
  }

  const handleTemplateUpdate = (updates: Partial<InvoiceTemplate>) => {
    if (!currentTemplate) return

    const updatedTemplate = { ...currentTemplate, ...updates }
    updateTemplate(currentTemplate.id, updates)
    onTemplateChange?.(updatedTemplate)
  }

  if (!currentTemplate || !organization) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading template...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Invoice Preview</h2>
          <p className="text-muted-foreground">
            Preview and customize invoice {invoice.invoiceNumber}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
          >
            {isGeneratingPdf ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download PDF
          </Button>
          <Button onClick={() => setActiveTab('email')}>
            <Send className="h-4 w-4 mr-2" />
            Send Invoice
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="customize">
            <Settings className="h-4 w-4 mr-2" />
            Customize
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </TabsTrigger>
        </TabsList>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Invoice Preview</CardTitle>
                  <CardDescription>
                    Preview of how your invoice will appear to customers
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  {currentTemplate.name} Template
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div
                ref={previewRef}
                className="border rounded-lg bg-white p-8 shadow-sm"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(generatePreviewHTML()) }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customize Tab */}
        <TabsContent value="customize">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customization Controls */}
            <div className="lg:col-span-1 space-y-4">
              {/* Template Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Layout className="h-4 w-4" />
                    <span>Template</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Layout Style</Label>
                    <Select
                      value={currentTemplate.layout}
                      onValueChange={(value) => handleTemplateUpdate({ layout: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Header Layout</Label>
                    <Select
                      value={currentTemplate.headerLayout}
                      onValueChange={(value) => handleTemplateUpdate({ headerLayout: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="horizontal">Horizontal</SelectItem>
                        <SelectItem value="vertical">Vertical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Logo Position</Label>
                    <Select
                      value={currentTemplate.logoPosition}
                      onValueChange={(value) => handleTemplateUpdate({ logoPosition: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="h-4 w-4" />
                    <span>Colors</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Primary Color</Label>
                    <Input
                      type="color"
                      value={currentTemplate.primaryColor}
                      onChange={(e) => handleTemplateUpdate({ primaryColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Secondary Color</Label>
                    <Input
                      type="color"
                      value={currentTemplate.secondaryColor}
                      onChange={(e) => handleTemplateUpdate({ secondaryColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Accent Color</Label>
                    <Input
                      type="color"
                      value={currentTemplate.accentColor}
                      onChange={(e) => handleTemplateUpdate({ accentColor: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Sections */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Sections</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(currentTemplate.sections).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="text-sm capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </Label>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) =>
                          handleTemplateUpdate({
                            sections: { ...currentTemplate.sections, [key]: checked }
                          })
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Live Preview */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Live Preview</CardTitle>
                  <CardDescription>
                    See your changes in real-time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="border rounded-lg bg-white p-4 shadow-sm max-h-96 overflow-y-auto"
                    style={{ transform: 'scale(0.7)', transformOrigin: 'top left', width: '142.86%' }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(generatePreviewHTML()) }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Email Tab */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Send Invoice via Email</CardTitle>
              <CardDescription>
                Send this invoice directly to your customer with a professional email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recipientEmail">Recipient Email *</Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    value={emailDetails.recipientEmail}
                    onChange={(e) => setEmailDetails(prev => ({ ...prev, recipientEmail: e.target.value }))}
                    placeholder="customer@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={emailDetails.subject}
                    onChange={(e) => setEmailDetails(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Invoice subject"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message">Message (Optional)</Label>
                <textarea
                  id="message"
                  value={emailDetails.message}
                  onChange={(e) => setEmailDetails(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Optional message to include with the invoice..."
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Invoice PDF will be automatically attached
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendEmail}
                    disabled={isSending || !emailDetails.recipientEmail}
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Invoice
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}