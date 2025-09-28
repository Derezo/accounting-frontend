import * as z from 'zod'
import { UserRole, CustomerType, CustomerTier, CustomerStatus, QuoteStatus, InvoiceStatus, PaymentStatus, PaymentMethod } from '@/types/api'

// Common validation rules
const emailSchema = z.string().email('Valid email is required').transform(val => val.toLowerCase())
const phoneSchema = z.string().optional().refine((val) => {
  if (!val) return true
  // Basic phone validation - accepts international formats
  return /^[+]?[\d\s\-()./]{7,15}$/.test(val)
}, { message: 'Valid phone number is required' })
const urlSchema = z.string().optional().refine((val) => {
  if (!val) return true
  try {
    new URL(val)
    return true
  } catch {
    return false
  }
}, { message: 'Valid URL is required' })

// Password validation matching backend requirements
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
  )

// User validation schemas
export const createUserSchema = z.object({
  email: emailSchema,
  firstName: z.string()
    .trim()
    .min(1, 'First name is required')
    .max(50, 'First name must be 50 characters or less'),
  lastName: z.string()
    .trim()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be 50 characters or less'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'EMPLOYEE', 'VIEWER'] as const),
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  isActive: z.boolean().default(true),
  sendInvite: z.boolean().default(true),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const updateUserSchema = z.object({
  email: emailSchema.optional(),
  firstName: z.string()
    .trim()
    .min(1, 'First name is required')
    .max(50, 'First name must be 50 characters or less')
    .optional(),
  lastName: z.string()
    .trim()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be 50 characters or less')
    .optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'EMPLOYEE', 'VIEWER'] as const).optional(),
  phone: phoneSchema,
  password: passwordSchema.optional(),
  confirmPassword: z.string().optional(),
  isActive: z.boolean().optional(),
}).refine((data) => {
  if (data.password && data.confirmPassword) {
    return data.password === data.confirmPassword
  }
  if (data.password && !data.confirmPassword) {
    return false
  }
  return true
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const inviteUserSchema = z.object({
  email: emailSchema,
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'EMPLOYEE', 'VIEWER'] as const),
})

// Customer validation schemas
export const createCustomerSchema = z.object({
  type: z.enum(['PERSON', 'BUSINESS'] as const),
  tier: z.enum(['PERSONAL', 'BUSINESS', 'ENTERPRISE', 'EMERGENCY'] as const).optional(),
  notes: z.string().trim().optional(),
  tags: z.array(z.string()).optional(),
  creditLimit: z.number().min(0).optional(),
  paymentTerms: z.number().min(0).max(365).optional(),
  taxExempt: z.boolean().optional(),
  preferredCurrency: z.string().length(3).optional(),

  // Person data (required when type is PERSON)
  person: z.object({
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().min(1, 'Last name is required'),
    email: emailSchema.optional(),
    phone: phoneSchema,
    dateOfBirth: z.string().optional().refine((val) => {
      if (!val) return true
      return !isNaN(Date.parse(val))
    }, { message: 'Valid date is required' }),
    preferredName: z.string().trim().optional(),
  }).optional(),

  // Business data (required when type is BUSINESS)
  businessData: z.object({
    legalName: z.string().trim().min(1, 'Legal name is required'),
    tradingName: z.string().trim().optional(),
    businessNumber: z.string().trim().optional(),
    taxNumber: z.string().trim().optional(),
    email: emailSchema.optional(),
    phone: phoneSchema,
    website: urlSchema,
    industry: z.string().trim().optional(),
  }).optional(),

  // Address data
  address: z.object({
    street: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    postalCode: z.string().trim().optional(),
    country: z.string().trim().optional(),
    type: z.string().trim().optional(),
  }).optional(),
}).refine((data) => {
  if (data.type === 'PERSON' && !data.person) {
    return false
  }
  if (data.type === 'BUSINESS' && !data.businessData) {
    return false
  }
  return true
}, {
  message: 'Person data is required for person customers, business data is required for business customers',
  path: ['type'],
})

export const updateCustomerSchema = z.object({
  tier: z.enum(['PERSONAL', 'BUSINESS', 'ENTERPRISE', 'EMERGENCY'] as const).optional(),
  notes: z.string().trim().optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  creditLimit: z.number().min(0).optional(),
  paymentTerms: z.number().min(0).max(365).optional(),
  taxExempt: z.boolean().optional(),
  preferredCurrency: z.string().length(3).optional(),

  personData: z.object({
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().min(1, 'Last name is required'),
    email: emailSchema.optional(),
    phone: phoneSchema,
    dateOfBirth: z.string().optional().refine((val) => {
      if (!val) return true
      return !isNaN(Date.parse(val))
    }, { message: 'Valid date is required' }),
    preferredName: z.string().trim().optional(),
  }).optional(),

  businessData: z.object({
    legalName: z.string().trim().min(1, 'Legal name is required'),
    tradingName: z.string().trim().optional(),
    businessNumber: z.string().trim().optional(),
    taxNumber: z.string().trim().optional(),
    email: emailSchema.optional(),
    phone: phoneSchema,
    website: urlSchema,
    industry: z.string().trim().optional(),
  }).optional(),
})

// Quote validation schemas
export const createQuoteSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().trim().optional(),
  validUntil: z.string().refine((val) => {
    const date = new Date(val)
    return date > new Date()
  }, { message: 'Valid until date must be in the future' }),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  taxRate: z.number().min(0).max(1, 'Tax rate must be between 0 and 1'),
  notes: z.string().trim().optional(),
  terms: z.string().trim().optional(),

  items: z.array(z.object({
    description: z.string().trim().min(1, 'Description is required'),
    quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
    unitPrice: z.number().min(0, 'Unit price must be positive'),
    taxable: z.boolean().default(true),
  })).min(1, 'At least one item is required'),
})

export const updateQuoteSchema = createQuoteSchema.partial().extend({
  status: z.enum(['DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'REVISED'] as const).optional(),
})

export const quoteActionSchema = z.object({
  acceptanceNote: z.string().trim().optional(),
  rejectionReason: z.string().trim().optional(),
})

// Invoice validation schemas
export const createInvoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  quoteId: z.string().optional(),
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().trim().optional(),
  dueDate: z.string().refine((val) => {
    const date = new Date(val)
    return date > new Date()
  }, { message: 'Due date must be in the future' }),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  taxRate: z.number().min(0).max(1, 'Tax rate must be between 0 and 1'),
  notes: z.string().trim().optional(),
  terms: z.string().trim().optional(),

  items: z.array(z.object({
    description: z.string().trim().min(1, 'Description is required'),
    quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
    unitPrice: z.number().min(0, 'Unit price must be positive'),
    taxable: z.boolean().default(true),
  })).min(1, 'At least one item is required'),
})

export const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  status: z.enum(['DRAFT', 'SENT', 'VIEWED', 'PAID', 'OVERDUE', 'CANCELLED'] as const).optional(),
})

// Payment validation schemas
export const createPaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  method: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CHECK', 'PAYPAL', 'STRIPE', 'OTHER'] as const),
  reference: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  paidAt: z.string().optional().refine((val) => {
    if (!val) return true
    return !isNaN(Date.parse(val))
  }, { message: 'Valid date is required' }),
})

export const updatePaymentSchema = createPaymentSchema.partial().extend({
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'] as const).optional(),
})

// Organization validation schemas
export const createOrganizationSchema = z.object({
  name: z.string().trim().min(1, 'Organization name is required').max(100, 'Name must be 100 characters or less'),
  email: emailSchema,
  phone: phoneSchema,
  website: urlSchema,
  industry: z.string().trim().optional(),
  description: z.string().trim().optional(),

  address: z.object({
    street: z.string().trim().min(1, 'Street address is required'),
    city: z.string().trim().min(1, 'City is required'),
    state: z.string().trim().min(1, 'State is required'),
    postalCode: z.string().trim().min(1, 'Postal code is required'),
    country: z.string().trim().min(1, 'Country is required'),
  }),

  settings: z.object({
    currency: z.string().length(3, 'Currency must be 3 characters'),
    timezone: z.string().min(1, 'Timezone is required'),
    fiscalYearStart: z.number().min(1).max(12, 'Fiscal year start must be between 1 and 12'),
    taxRate: z.number().min(0).max(1, 'Tax rate must be between 0 and 1'),
  }).optional(),
})

export const updateOrganizationSchema = createOrganizationSchema.partial()

// Search and filter schemas
export const userFiltersSchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'EMPLOYEE', 'VIEWER'] as const).optional(),
  isActive: z.boolean().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
})

export const customerFiltersSchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  type: z.enum(['PERSON', 'BUSINESS'] as const).optional(),
  tier: z.enum(['PERSONAL', 'BUSINESS', 'ENTERPRISE', 'EMERGENCY'] as const).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED'] as const).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
})

export const quoteFiltersSchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  status: z.enum(['DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'REVISED'] as const).optional(),
  customerId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
})

export const invoiceFiltersSchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  status: z.enum(['DRAFT', 'SENT', 'VIEWED', 'PAID', 'OVERDUE', 'CANCELLED'] as const).optional(),
  customerId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
})

export const paymentFiltersSchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'] as const).optional(),
  method: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CHECK', 'PAYPAL', 'STRIPE', 'OTHER'] as const).optional(),
  invoiceId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
})

// File upload validation schemas
export const fileUploadSchema = z.object({
  file: z.any().refine((file) => {
    if (!file) return false
    return file instanceof File
  }, { message: 'File is required' }),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB default
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'application/pdf', 'text/csv']),
}).refine((data) => {
  if (data.file && data.file instanceof File) {
    return data.file.size <= data.maxSize
  }
  return true
}, {
  message: 'File size exceeds maximum allowed size',
  path: ['file'],
}).refine((data) => {
  if (data.file && data.file instanceof File) {
    return data.allowedTypes.includes(data.file.type)
  }
  return true
}, {
  message: 'File type not allowed',
  path: ['file'],
})

// Report generation schemas
export const reportParamsSchema = z.object({
  type: z.enum(['FINANCIAL', 'CUSTOMER', 'INVOICE', 'PAYMENT', 'TAX', 'AUDIT'] as const),
  format: z.enum(['PDF', 'CSV', 'EXCEL'] as const),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Valid start date is required' }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Valid end date is required' }),
  filters: z.record(z.any()).optional(),
}).refine((data) => {
  return new Date(data.startDate) <= new Date(data.endDate)
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
})

// Type exports for inference
export type CreateUserFormData = z.infer<typeof createUserSchema>
export type UpdateUserFormData = z.infer<typeof updateUserSchema>
export type InviteUserFormData = z.infer<typeof inviteUserSchema>
export type CreateCustomerFormData = z.infer<typeof createCustomerSchema>
export type UpdateCustomerFormData = z.infer<typeof updateCustomerSchema>
export type CreateQuoteFormData = z.infer<typeof createQuoteSchema>
export type UpdateQuoteFormData = z.infer<typeof updateQuoteSchema>
export type QuoteActionFormData = z.infer<typeof quoteActionSchema>
export type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>
export type UpdateInvoiceFormData = z.infer<typeof updateInvoiceSchema>
export type CreatePaymentFormData = z.infer<typeof createPaymentSchema>
export type UpdatePaymentFormData = z.infer<typeof updatePaymentSchema>
export type CreateOrganizationFormData = z.infer<typeof createOrganizationSchema>
export type UpdateOrganizationFormData = z.infer<typeof updateOrganizationSchema>
export type UserFiltersFormData = z.infer<typeof userFiltersSchema>
export type CustomerFiltersFormData = z.infer<typeof customerFiltersSchema>
export type QuoteFiltersFormData = z.infer<typeof quoteFiltersSchema>
export type InvoiceFiltersFormData = z.infer<typeof invoiceFiltersSchema>
export type PaymentFiltersFormData = z.infer<typeof paymentFiltersSchema>
export type FileUploadFormData = z.infer<typeof fileUploadSchema>
export type ReportParamsFormData = z.infer<typeof reportParamsSchema>