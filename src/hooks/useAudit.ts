import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './useAuth'
import type {
  AuditLogEntry,
  AuditFilter,
  AuditSummary,
  AuditExportOptions,
  UseAuditOptions,
  AuditAction,
  AuditEntityType,
  AuditSeverity,
  AuditCategory
} from '@/types/audit'

interface AuditState {
  entries: AuditLogEntry[]
  summary: AuditSummary | null
  isLoading: boolean
  error: string | null
  filter: AuditFilter
  currentPage: number
  totalPages: number
  totalEntries: number
  pageSize: number
  lastFetch: string | null
}

const defaultFilter: AuditFilter = {
  dateRange: {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  }
}

// Mock audit data generator
const generateMockAuditEntry = (index: number): AuditLogEntry => {
  const actions: AuditAction[] = ['CREATE', 'UPDATE', 'DELETE', 'READ', 'LOGIN', 'LOGOUT', 'APPROVE', 'SEND']
  const entityTypes: AuditEntityType[] = ['INVOICE', 'CUSTOMER', 'PAYMENT', 'QUOTE', 'USER', 'SETTINGS']
  const severities: AuditSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
  const categories: AuditCategory[] = ['DATA_MODIFICATION', 'AUTHENTICATION', 'FINANCIAL', 'SECURITY']

  const userNames = ['John Doe', 'Jane Smith', 'Bob Wilson', 'Alice Johnson', 'Charlie Brown']
  const userEmails = ['john@example.com', 'jane@example.com', 'bob@example.com', 'alice@example.com', 'charlie@example.com']
  const userRoles = ['admin', 'manager', 'accountant', 'user']

  const action = actions[Math.floor(Math.random() * actions.length)]
  const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)]
  const userName = userNames[Math.floor(Math.random() * userNames.length)]
  const userEmail = userEmails[Math.floor(Math.random() * userEmails.length)]
  const userRole = userRoles[Math.floor(Math.random() * userRoles.length)]

  const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()

  return {
    id: `audit-${index}`,
    userId: `user-${Math.floor(Math.random() * 100)}`,
    userName,
    userEmail,
    userRole,
    action,
    entityType,
    entityId: `entity-${Math.floor(Math.random() * 1000)}`,
    entityName: `${entityType.toLowerCase()}-${Math.floor(Math.random() * 100)}`,
    timestamp,
    ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    changes: action === 'UPDATE' ? [
      {
        field: 'status',
        oldValue: 'draft',
        newValue: 'sent',
        fieldType: 'string'
      },
      {
        field: 'amount',
        oldValue: 1000,
        newValue: 1200,
        fieldType: 'number'
      }
    ] : undefined,
    severity: severities[Math.floor(Math.random() * severities.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    metadata: {
      source: 'web',
      duration: Math.floor(Math.random() * 5000),
      success: Math.random() > 0.1
    }
  }
}

const generateMockAuditSummary = (entries: AuditLogEntry[]): AuditSummary => {
  const entriesPerAction = entries.reduce((acc, entry) => {
    acc[entry.action] = (acc[entry.action] || 0) + 1
    return acc
  }, {} as Record<AuditAction, number>)

  const entriesPerEntityType = entries.reduce((acc, entry) => {
    acc[entry.entityType] = (acc[entry.entityType] || 0) + 1
    return acc
  }, {} as Record<AuditEntityType, number>)

  const entriesPerSeverity = entries.reduce((acc, entry) => {
    acc[entry.severity] = (acc[entry.severity] || 0) + 1
    return acc
  }, {} as Record<AuditSeverity, number>)

  const entriesPerCategory = entries.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + 1
    return acc
  }, {} as Record<AuditCategory, number>)

  const userCounts = entries.reduce((acc, entry) => {
    const key = entry.userId
    if (!acc[key]) {
      acc[key] = {
        userId: entry.userId,
        userName: entry.userName,
        count: 0
      }
    }
    acc[key].count++
    return acc
  }, {} as Record<string, { userId: string; userName: string; count: number }>)

  const mostActiveUsers = Object.values(userCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    totalEntries: entries.length,
    entriesPerAction,
    entriesPerEntityType,
    entriesPerSeverity,
    entriesPerCategory,
    mostActiveUsers,
    securityEvents: entries.filter(e => e.category === 'SECURITY').length,
    failedLoginAttempts: entries.filter(e => e.action === 'LOGIN_FAILED').length,
    dataModifications: entries.filter(e => ['CREATE', 'UPDATE', 'DELETE'].includes(e.action)).length,
    complianceEvents: entries.filter(e => e.category === 'COMPLIANCE').length
  }
}

export function useAudit(options: UseAuditOptions = {}) {
  const { user } = useAuth()
  const {
    autoRefresh = false,
    refreshInterval = 30000,
    defaultFilter: userDefaultFilter = {},
    pageSize: defaultPageSize = 50
  } = options

  const [state, setState] = useState<AuditState>({
    entries: [],
    summary: null,
    isLoading: false,
    error: null,
    filter: { ...defaultFilter, ...userDefaultFilter },
    currentPage: 1,
    totalPages: 1,
    totalEntries: 0,
    pageSize: defaultPageSize,
    lastFetch: null
  })

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchAuditLogs()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, state.filter, state.currentPage])

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchAuditLogs()
    }
  }, [user, state.filter, state.currentPage])

  const fetchAuditLogs = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In real implementation:
      // const response = await auditService.getAuditLogs(state.filter, state.currentPage, state.pageSize)

      // Generate mock data
      const totalMockEntries = 500
      const startIndex = (state.currentPage - 1) * state.pageSize
      const endIndex = Math.min(startIndex + state.pageSize, totalMockEntries)

      const entries = Array.from({ length: endIndex - startIndex }, (_, i) =>
        generateMockAuditEntry(startIndex + i)
      ).filter(entry => {
        // Apply filters
        if (state.filter.userId && entry.userId !== state.filter.userId) return false
        if (state.filter.entityType && entry.entityType !== state.filter.entityType) return false
        if (state.filter.action && entry.action !== state.filter.action) return false
        if (state.filter.severity && entry.severity !== state.filter.severity) return false
        if (state.filter.category && entry.category !== state.filter.category) return false
        if (state.filter.search) {
          const search = state.filter.search.toLowerCase()
          const searchable = `${entry.userName} ${entry.userEmail} ${entry.entityName} ${entry.action} ${entry.entityType}`.toLowerCase()
          if (!searchable.includes(search)) return false
        }

        // Date range filter
        const entryDate = new Date(entry.timestamp)
        const fromDate = new Date(state.filter.dateRange.from)
        const toDate = new Date(state.filter.dateRange.to + 'T23:59:59')
        if (entryDate < fromDate || entryDate > toDate) return false

        return true
      })

      const summary = generateMockAuditSummary(entries)

      setState(prev => ({
        ...prev,
        entries,
        summary,
        isLoading: false,
        totalEntries: totalMockEntries,
        totalPages: Math.ceil(totalMockEntries / state.pageSize),
        lastFetch: new Date().toISOString()
      }))
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to fetch audit logs',
        isLoading: false
      }))
    }
  }, [state.filter, state.currentPage, state.pageSize])

  const updateFilter = useCallback((newFilter: Partial<AuditFilter>) => {
    setState(prev => ({
      ...prev,
      filter: { ...prev.filter, ...newFilter },
      currentPage: 1 // Reset to first page when filter changes
    }))
  }, [])

  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }))
  }, [])

  const setPageSize = useCallback((size: number) => {
    setState(prev => ({
      ...prev,
      pageSize: size,
      currentPage: 1 // Reset to first page when page size changes
    }))
  }, [])

  const clearFilter = useCallback(() => {
    setState(prev => ({
      ...prev,
      filter: defaultFilter,
      currentPage: 1
    }))
  }, [])

  const getEntryById = useCallback((id: string): AuditLogEntry | undefined => {
    return state.entries.find(entry => entry.id === id)
  }, [state.entries])

  const getEntriesByUser = useCallback((userId: string): AuditLogEntry[] => {
    return state.entries.filter(entry => entry.userId === userId)
  }, [state.entries])

  const getEntriesByEntity = useCallback((entityType: AuditEntityType, entityId: string): AuditLogEntry[] => {
    return state.entries.filter(entry =>
      entry.entityType === entityType && entry.entityId === entityId
    )
  }, [state.entries])

  const exportAuditLogs = useCallback(async (options: AuditExportOptions) => {
    try {
      // In real implementation:
      // return await auditService.exportAuditLogs(options)

      // Mock export functionality
      const exportData = {
        entries: state.entries,
        summary: state.summary,
        filter: options.filter,
        exportedAt: new Date().toISOString(),
        exportedBy: user?.name || 'Unknown'
      }

      if (options.format === 'json') {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit-logs-${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)
      } else if (options.format === 'csv') {
        const csvContent = convertToCSV(state.entries)
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit-logs-${Date.now()}.csv`
        a.click()
        URL.revokeObjectURL(url)
      }

      return true
    } catch (error: any) {
      throw new Error(error.message || 'Failed to export audit logs')
    }
  }, [state.entries, state.summary, user])

  // Helper function to convert audit logs to CSV
  const convertToCSV = (entries: AuditLogEntry[]): string => {
    if (entries.length === 0) return ''

    const headers = [
      'ID', 'Timestamp', 'User Name', 'User Email', 'User Role', 'Action',
      'Entity Type', 'Entity ID', 'Entity Name', 'Severity', 'Category',
      'IP Address', 'Changes Count'
    ]

    const csvContent = [
      headers.join(','),
      ...entries.map(entry => [
        entry.id,
        entry.timestamp,
        entry.userName,
        entry.userEmail,
        entry.userRole,
        entry.action,
        entry.entityType,
        entry.entityId,
        entry.entityName || '',
        entry.severity,
        entry.category,
        entry.ipAddress || '',
        entry.changes?.length || 0
      ].map(field => `"${field}"`).join(','))
    ].join('\n')

    return csvContent
  }

  // Calculate filtered metrics
  const metrics = useMemo(() => {
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const todayEntries = state.entries.filter(e =>
      new Date(e.timestamp).toDateString() === today.toDateString()
    )
    const yesterdayEntries = state.entries.filter(e =>
      new Date(e.timestamp).toDateString() === yesterday.toDateString()
    )
    const lastWeekEntries = state.entries.filter(e =>
      new Date(e.timestamp) >= lastWeek
    )

    return {
      todayCount: todayEntries.length,
      yesterdayCount: yesterdayEntries.length,
      weeklyCount: lastWeekEntries.length,
      securityEvents: state.entries.filter(e => e.category === 'SECURITY').length,
      criticalEvents: state.entries.filter(e => e.severity === 'CRITICAL').length,
      failedLogins: state.entries.filter(e => e.action === 'LOGIN_FAILED').length
    }
  }, [state.entries])

  return {
    // State
    entries: state.entries,
    summary: state.summary,
    isLoading: state.isLoading,
    error: state.error,
    filter: state.filter,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    totalEntries: state.totalEntries,
    pageSize: state.pageSize,
    lastFetch: state.lastFetch,
    metrics,

    // Actions
    fetchAuditLogs,
    updateFilter,
    setPage,
    setPageSize,
    clearFilter,
    exportAuditLogs,

    // Utilities
    getEntryById,
    getEntriesByUser,
    getEntriesByEntity
  }
}