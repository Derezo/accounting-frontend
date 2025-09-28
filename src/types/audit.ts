export interface AuditLogEntry {
  id: string
  userId: string
  userName: string
  userEmail: string
  userRole: string
  action: AuditAction
  entityType: AuditEntityType
  entityId: string
  entityName?: string
  timestamp: string
  ipAddress?: string
  userAgent?: string
  changes?: AuditChange[]
  metadata?: Record<string, any>
  severity: AuditSeverity
  category: AuditCategory
}

export interface AuditChange {
  field: string
  oldValue: any
  newValue: any
  fieldType: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object'
  sensitive?: boolean
}

export type AuditAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET'
  | 'EMAIL_VERIFICATION'
  | 'PERMISSION_CHANGE'
  | 'EXPORT'
  | 'IMPORT'
  | 'BACKUP'
  | 'RESTORE'
  | 'APPROVE'
  | 'REJECT'
  | 'SEND'
  | 'RECEIVE'
  | 'PROCESS'
  | 'CANCEL'
  | 'ARCHIVE'
  | 'UNARCHIVE'

export type AuditEntityType =
  | 'USER'
  | 'CUSTOMER'
  | 'ORGANIZATION'
  | 'QUOTE'
  | 'INVOICE'
  | 'PAYMENT'
  | 'PRODUCT'
  | 'SERVICE'
  | 'REPORT'
  | 'SETTINGS'
  | 'AUDIT'
  | 'NOTIFICATION'
  | 'FILE'
  | 'TEMPLATE'

export type AuditSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type AuditCategory =
  | 'AUTHENTICATION'
  | 'AUTHORIZATION'
  | 'DATA_MODIFICATION'
  | 'DATA_ACCESS'
  | 'SYSTEM_CONFIGURATION'
  | 'SECURITY'
  | 'FINANCIAL'
  | 'COMPLIANCE'
  | 'INTEGRATION'
  | 'MAINTENANCE'

export interface AuditFilter {
  userId?: string
  entityType?: AuditEntityType
  entityId?: string
  action?: AuditAction
  severity?: AuditSeverity
  category?: AuditCategory
  dateRange: {
    from: string
    to: string
  }
  search?: string
  ipAddress?: string
  userRole?: string
}

export interface AuditSummary {
  totalEntries: number
  entriesPerAction: Record<AuditAction, number>
  entriesPerEntityType: Record<AuditEntityType, number>
  entriesPerSeverity: Record<AuditSeverity, number>
  entriesPerCategory: Record<AuditCategory, number>
  mostActiveUsers: Array<{
    userId: string
    userName: string
    count: number
  }>
  securityEvents: number
  failedLoginAttempts: number
  dataModifications: number
  complianceEvents: number
}

export interface AuditExportOptions {
  format: 'csv' | 'json' | 'pdf' | 'excel'
  filter: AuditFilter
  includeDetails: boolean
  includeChanges: boolean
  includeMetadata: boolean
}

export interface UseAuditOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  defaultFilter?: Partial<AuditFilter>
  pageSize?: number
}