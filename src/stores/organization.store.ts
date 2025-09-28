import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { OrganizationSettings, InvoiceTemplate } from '@/types/api'

interface OrganizationState {
  // Organization settings
  settings: OrganizationSettings | null
  templates: InvoiceTemplate[]
  currentTemplate: InvoiceTemplate | null

  // Loading states
  isLoadingSettings: boolean
  isLoadingTemplates: boolean

  // Actions
  setSettings: (settings: OrganizationSettings) => void
  updateSettings: (updates: Partial<OrganizationSettings>) => void
  setTemplates: (templates: InvoiceTemplate[]) => void
  addTemplate: (template: InvoiceTemplate) => void
  updateTemplate: (id: string, updates: Partial<InvoiceTemplate>) => void
  deleteTemplate: (id: string) => void
  setCurrentTemplate: (template: InvoiceTemplate | null) => void
  setLoadingSettings: (loading: boolean) => void
  setLoadingTemplates: (loading: boolean) => void

  // Getters
  getDefaultTemplate: () => InvoiceTemplate | null
  getTemplateById: (id: string) => InvoiceTemplate | null
}

// Default template for new organizations
const createDefaultTemplate = (organizationId: string): InvoiceTemplate => ({
  id: 'default',
  name: 'Professional',
  layout: 'modern',
  showLogo: true,
  logoPosition: 'left',
  headerLayout: 'horizontal',
  primaryColor: '#2563EB',
  secondaryColor: '#64748B',
  accentColor: '#F59E0B',
  fontFamily: 'Inter',
  fontSize: 10,
  sections: {
    customerDetails: true,
    invoiceDetails: true,
    lineItems: true,
    subtotals: true,
    taxBreakdown: true,
    paymentTerms: true,
    notes: true,
    termsAndConditions: true,
    bankingDetails: true,
    footer: true,
  },
  lineItemColumns: {
    description: true,
    quantity: true,
    unitPrice: true,
    taxRate: true,
    total: true,
  },
  customFields: [],
  isDefault: true,
  organizationId,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

// Default organization settings
const createDefaultSettings = (): Partial<OrganizationSettings> => ({
  companyName: 'Your Company Name',
  primaryColor: '#2563EB',
  secondaryColor: '#64748B',
  accentColor: '#F59E0B',
  invoiceSettings: {
    invoicePrefix: 'INV',
    invoiceNumberFormat: 'INV-{YYYY}-{MM}-{###}',
    nextInvoiceNumber: 1,
    defaultPaymentTerms: 30,
    emailSubject: 'Invoice #{invoiceNumber} from {companyName}',
    emailTemplate: `Dear {customerName},

Please find attached invoice #{invoiceNumber} in the amount of {total}.

Payment is due within {paymentTerms} days.

Thank you for your business!

Best regards,
{companyName}`,
    showBankingDetails: true,
    template: createDefaultTemplate(''),
  },
})

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: null,
      templates: [],
      currentTemplate: null,
      isLoadingSettings: false,
      isLoadingTemplates: false,

      // Actions
      setSettings: (settings) => set({ settings }),

      updateSettings: (updates) => set((state) => ({
        settings: state.settings ? { ...state.settings, ...updates } : null,
      })),

      setTemplates: (templates) => set({ templates }),

      addTemplate: (template) => set((state) => ({
        templates: [...state.templates, template],
      })),

      updateTemplate: (id, updates) => set((state) => ({
        templates: state.templates.map((template) =>
          template.id === id ? { ...template, ...updates, updatedAt: new Date().toISOString() } : template
        ),
        currentTemplate: state.currentTemplate?.id === id
          ? { ...state.currentTemplate, ...updates, updatedAt: new Date().toISOString() }
          : state.currentTemplate,
      })),

      deleteTemplate: (id) => set((state) => ({
        templates: state.templates.filter((template) => template.id !== id),
        currentTemplate: state.currentTemplate?.id === id ? null : state.currentTemplate,
      })),

      setCurrentTemplate: (template) => set({ currentTemplate: template }),

      setLoadingSettings: (loading) => set({ isLoadingSettings: loading }),

      setLoadingTemplates: (loading) => set({ isLoadingTemplates: loading }),

      // Getters
      getDefaultTemplate: () => {
        const { templates } = get()
        return templates.find((template) => template.isDefault) || null
      },

      getTemplateById: (id) => {
        const { templates } = get()
        return templates.find((template) => template.id === id) || null
      },
    }),
    {
      name: 'organization-settings',
      partialize: (state) => ({
        settings: state.settings,
        templates: state.templates,
        currentTemplate: state.currentTemplate,
      }),
    }
  )
)

// Utility functions for template management
export const createNewTemplate = (organizationId: string, name: string, baseTemplate?: InvoiceTemplate): InvoiceTemplate => {
  const base = baseTemplate || createDefaultTemplate(organizationId)
  return {
    ...base,
    id: `template_${Date.now()}`,
    name,
    isDefault: false,
    organizationId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export const duplicateTemplate = (template: InvoiceTemplate, name: string): InvoiceTemplate => {
  return {
    ...template,
    id: `template_${Date.now()}`,
    name,
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export const getTemplatePresets = (): Array<{ name: string; template: Partial<InvoiceTemplate> }> => [
  {
    name: 'Classic',
    template: {
      layout: 'classic',
      primaryColor: '#1F2937',
      secondaryColor: '#6B7280',
      accentColor: '#F59E0B',
      fontFamily: 'Inter',
      fontSize: 10,
      headerLayout: 'horizontal',
      logoPosition: 'left',
    },
  },
  {
    name: 'Modern',
    template: {
      layout: 'modern',
      primaryColor: '#2563EB',
      secondaryColor: '#64748B',
      accentColor: '#10B981',
      fontFamily: 'Inter',
      fontSize: 10,
      headerLayout: 'horizontal',
      logoPosition: 'left',
    },
  },
  {
    name: 'Minimal',
    template: {
      layout: 'minimal',
      primaryColor: '#374151',
      secondaryColor: '#9CA3AF',
      accentColor: '#6366F1',
      fontFamily: 'Inter',
      fontSize: 9,
      headerLayout: 'vertical',
      logoPosition: 'center',
    },
  },
  {
    name: 'Creative',
    template: {
      layout: 'creative',
      primaryColor: '#7C3AED',
      secondaryColor: '#A78BFA',
      accentColor: '#F59E0B',
      fontFamily: 'Playfair Display',
      fontSize: 11,
      headerLayout: 'vertical',
      logoPosition: 'center',
    },
  },
]