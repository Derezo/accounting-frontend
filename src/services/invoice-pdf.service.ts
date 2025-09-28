import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image, pdf, Font } from '@react-pdf/renderer'
import { saveAs } from 'file-saver'
import { Invoice, InvoiceTemplate, OrganizationSettings, InvoicePdfOptions } from '@/types/api'
import { formatCurrency, formatDate } from '@/lib/utils'

// Register fonts for better typography
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2' },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2', fontWeight: 'bold' },
  ]
})

interface InvoicePDFProps {
  invoice: Invoice
  template: InvoiceTemplate
  organization: OrganizationSettings
  watermark?: string
}

// Dynamic styles based on template
const createStyles = (template: InvoiceTemplate) => StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: template.fontFamily || 'Inter',
    fontSize: template.fontSize || 10,
    lineHeight: 1.4,
  },

  header: {
    flexDirection: template.headerLayout === 'horizontal' ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: template.primaryColor,
  },

  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: template.primaryColor,
    marginBottom: 5,
  },

  companyDetails: {
    fontSize: 9,
    color: '#6B7280',
    lineHeight: 1.3,
  },

  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: template.primaryColor,
    marginBottom: 10,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  detailLabel: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: 'bold',
  },

  detailValue: {
    fontSize: 9,
    color: '#111827',
  },

  table: {
    marginBottom: 20,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: template.primaryColor,
    padding: 10,
  },

  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },

  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  tableCell: {
    fontSize: 9,
    color: '#111827',
  },

  descriptionColumn: { flex: 4 },
  quantityColumn: { flex: 1, textAlign: 'center' },
  priceColumn: { flex: 1.5, textAlign: 'right' },
  totalColumn: { flex: 1.5, textAlign: 'right' },

  totalsContainer: {
    alignItems: 'flex-end',
    marginTop: 20,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 10,
    width: 200,
  },

  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: template.primaryColor,
    marginTop: 5,
    width: 200,
  },

  grandTotalLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 8,
    color: '#6B7280',
    textAlign: 'center',
  },
})

// Simple PDF Document Component
const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, template, organization, watermark }) => {
  const styles = createStyles(template)

  return React.createElement(Document, {},
    React.createElement(Page, { size: "A4", style: styles.page },
      // Header
      React.createElement(View, { style: styles.header },
        React.createElement(View, {},
          React.createElement(Text, { style: styles.companyName }, organization.companyName),
          React.createElement(View, { style: styles.companyDetails },
            organization.address && React.createElement(Text, {}, organization.address.street),
            organization.address && React.createElement(Text, {}, `${organization.address.city}, ${organization.address.province}`),
            organization.email && React.createElement(Text, {}, `Email: ${organization.email}`)
          )
        )
      ),

      // Invoice Title
      React.createElement(Text, { style: styles.invoiceTitle }, "INVOICE"),

      // Invoice Details
      React.createElement(View, { style: { marginBottom: 20 } },
        React.createElement(View, { style: styles.detailRow },
          React.createElement(Text, { style: styles.detailLabel }, "Invoice Number"),
          React.createElement(Text, { style: styles.detailValue }, invoice.invoiceNumber)
        ),
        React.createElement(View, { style: styles.detailRow },
          React.createElement(Text, { style: styles.detailLabel }, "Issue Date"),
          React.createElement(Text, { style: styles.detailValue }, formatDate(invoice.issueDate))
        ),
        React.createElement(View, { style: styles.detailRow },
          React.createElement(Text, { style: styles.detailLabel }, "Due Date"),
          React.createElement(Text, { style: styles.detailValue }, formatDate(invoice.dueDate))
        )
      ),

      // Customer Details
      invoice.customer && React.createElement(View, { style: { marginBottom: 20 } },
        React.createElement(Text, { style: { fontSize: 12, fontWeight: 'bold', marginBottom: 8 } }, "Bill To"),
        React.createElement(Text, { style: { fontSize: 14, fontWeight: 'bold' } },
          invoice.customer.type === 'PERSON'
            ? `${invoice.customer.person?.firstName} ${invoice.customer.person?.lastName}`
            : invoice.customer.business?.businessName
        ),
        invoice.customer.email && React.createElement(Text, { style: styles.companyDetails }, invoice.customer.email)
      ),

      // Line Items Table
      React.createElement(View, { style: styles.table },
        // Header
        React.createElement(View, { style: styles.tableHeader },
          React.createElement(View, { style: [styles.tableHeaderCell, styles.descriptionColumn] },
            React.createElement(Text, {}, "Description")
          ),
          React.createElement(View, { style: [styles.tableHeaderCell, styles.quantityColumn] },
            React.createElement(Text, {}, "Qty")
          ),
          React.createElement(View, { style: [styles.tableHeaderCell, styles.priceColumn] },
            React.createElement(Text, {}, "Price")
          ),
          React.createElement(View, { style: [styles.tableHeaderCell, styles.totalColumn] },
            React.createElement(Text, {}, "Total")
          )
        ),
        // Rows
        ...invoice.items.map((item, index) =>
          React.createElement(View, { key: index, style: styles.tableRow },
            React.createElement(View, { style: [styles.tableCell, styles.descriptionColumn] },
              React.createElement(Text, {}, item.description)
            ),
            React.createElement(View, { style: [styles.tableCell, styles.quantityColumn] },
              React.createElement(Text, {}, item.quantity.toString())
            ),
            React.createElement(View, { style: [styles.tableCell, styles.priceColumn] },
              React.createElement(Text, {}, formatCurrency(item.unitPrice))
            ),
            React.createElement(View, { style: [styles.tableCell, styles.totalColumn] },
              React.createElement(Text, {}, formatCurrency(item.quantity * item.unitPrice))
            )
          )
        )
      ),

      // Totals
      React.createElement(View, { style: styles.totalsContainer },
        React.createElement(View, { style: styles.totalRow },
          React.createElement(Text, {}, "Subtotal"),
          React.createElement(Text, {}, formatCurrency(invoice.subtotal))
        ),
        React.createElement(View, { style: styles.totalRow },
          React.createElement(Text, {}, "Tax"),
          React.createElement(Text, {}, formatCurrency(invoice.taxAmount))
        ),
        React.createElement(View, { style: styles.grandTotalRow },
          React.createElement(Text, { style: styles.grandTotalLabel }, "Total"),
          React.createElement(Text, { style: styles.grandTotalLabel }, formatCurrency(invoice.total))
        )
      ),

      // Notes
      invoice.notes && React.createElement(View, { style: { marginTop: 30 } },
        React.createElement(Text, { style: { fontSize: 11, fontWeight: 'bold', marginBottom: 8 } }, "Notes"),
        React.createElement(Text, { style: { fontSize: 9, color: '#6B7280' } }, invoice.notes)
      ),

      // Footer
      organization.invoiceSettings.footerText && React.createElement(Text, { style: styles.footer },
        organization.invoiceSettings.footerText
      )
    )
  )
}

// PDF Generation Service
export class InvoicePdfService {
  static async generatePdf(options: InvoicePdfOptions): Promise<Blob> {
    const { invoice, template, organization, watermark } = options

    const doc = React.createElement(InvoicePDF, {
      invoice,
      template,
      organization,
      watermark,
    } as any)

    const blob = await pdf(doc as any).toBlob()
    return blob
  }

  static async downloadPdf(options: InvoicePdfOptions, filename?: string): Promise<void> {
    const blob = await this.generatePdf(options)
    const fileName = filename || `invoice-${options.invoice.invoiceNumber}.pdf`
    saveAs(blob, fileName)
  }

  static async getPdfDataUrl(options: InvoicePdfOptions): Promise<string> {
    const blob = await this.generatePdf(options)
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })
  }

  static async getPdfBase64(options: InvoicePdfOptions): Promise<string> {
    const dataUrl = await this.getPdfDataUrl(options)
    return dataUrl.split(',')[1] // Remove data:application/pdf;base64, prefix
  }
}