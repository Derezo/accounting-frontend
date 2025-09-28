import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { LoadingSpinner } from '@/components/ui/loading'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Shield,
  Eye,
  Filter,
  Download,
  RefreshCw,
  Search,
  Calendar,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Info,
  Database,
  Lock,
  Unlock,
  FileText,
  Settings,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Send,
  RotateCcw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAudit } from '@/hooks/useAudit'
import type {
  AuditLogEntry,
  AuditFilter,
  AuditAction,
  AuditEntityType,
  AuditSeverity,
  AuditCategory
} from '@/types/audit'

export interface AuditTrailProps {
  className?: string
  defaultFilter?: Partial<AuditFilter>
  showSummary?: boolean
  showFilters?: boolean
  maxHeight?: string
  onEntryClick?: (entry: AuditLogEntry) => void
  onExport?: () => void
}

export function AuditTrail({
  className,
  defaultFilter,
  showSummary = true,
  showFilters = true,
  maxHeight = '600px',
  onEntryClick,
  onExport
}: AuditTrailProps) {
  const {
    entries,
    summary,
    isLoading,
    error,
    filter,
    currentPage,
    totalPages,
    totalEntries,
    pageSize,
    metrics,
    fetchAuditLogs,
    updateFilter,
    setPage,
    clearFilter,
    exportAuditLogs
  } = useAudit({ defaultFilter })

  const [searchQuery, setSearchQuery] = useState('')
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [selectedDateRange, setSelectedDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: new Date(filter.dateRange.from),
    to: new Date(filter.dateRange.to)
  })

  const handleSearch = () => {
    updateFilter({ search: searchQuery })
  }

  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setSelectedDateRange(range)
    if (range.from && range.to) {
      updateFilter({
        dateRange: {
          from: range.from.toISOString().split('T')[0],
          to: range.to.toISOString().split('T')[0]
        }
      })
    }
  }

  const handleExport = async () => {
    try {
      await exportAuditLogs({
        format: 'csv',
        filter,
        includeDetails: true,
        includeChanges: true,
        includeMetadata: true
      })
      onExport?.()
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const getActionIcon = (action: AuditAction) => {
    const icons = {
      CREATE: <Plus className="h-4 w-4 text-green-500" />,
      READ: <Eye className="h-4 w-4 text-blue-500" />,
      UPDATE: <Edit className="h-4 w-4 text-yellow-500" />,
      DELETE: <Trash2 className="h-4 w-4 text-red-500" />,
      LOGIN: <LogIn className="h-4 w-4 text-green-500" />,
      LOGOUT: <LogOut className="h-4 w-4 text-gray-500" />,
      LOGIN_FAILED: <XCircle className="h-4 w-4 text-red-500" />,
      PASSWORD_CHANGE: <Lock className="h-4 w-4 text-yellow-500" />,
      PASSWORD_RESET: <RotateCcw className="h-4 w-4 text-yellow-500" />,
      EMAIL_VERIFICATION: <CheckCircle className="h-4 w-4 text-green-500" />,
      PERMISSION_CHANGE: <Unlock className="h-4 w-4 text-yellow-500" />,
      EXPORT: <Download className="h-4 w-4 text-blue-500" />,
      IMPORT: <Database className="h-4 w-4 text-blue-500" />,
      BACKUP: <Database className="h-4 w-4 text-green-500" />,
      RESTORE: <RotateCcw className="h-4 w-4 text-yellow-500" />,
      APPROVE: <CheckCircle className="h-4 w-4 text-green-500" />,
      REJECT: <XCircle className="h-4 w-4 text-red-500" />,
      SEND: <Send className="h-4 w-4 text-blue-500" />,
      RECEIVE: <Download className="h-4 w-4 text-green-500" />,
      PROCESS: <Activity className="h-4 w-4 text-blue-500" />,
      CANCEL: <XCircle className="h-4 w-4 text-red-500" />,
      ARCHIVE: <Database className="h-4 w-4 text-gray-500" />,
      UNARCHIVE: <RotateCcw className="h-4 w-4 text-green-500" />
    }
    return icons[action] || <Activity className="h-4 w-4 text-gray-500" />
  }

  const getSeverityColor = (severity: AuditSeverity) => {
    const colors = {
      LOW: 'bg-green-100 text-green-800 border-green-200',
      MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
      CRITICAL: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[severity]
  }

  const getCategoryIcon = (category: AuditCategory) => {
    const icons = {
      AUTHENTICATION: <Shield className="h-4 w-4" />,
      AUTHORIZATION: <Lock className="h-4 w-4" />,
      DATA_MODIFICATION: <Edit className="h-4 w-4" />,
      DATA_ACCESS: <Eye className="h-4 w-4" />,
      SYSTEM_CONFIGURATION: <Settings className="h-4 w-4" />,
      SECURITY: <Shield className="h-4 w-4" />,
      FINANCIAL: <FileText className="h-4 w-4" />,
      COMPLIANCE: <CheckCircle className="h-4 w-4" />,
      INTEGRATION: <Database className="h-4 w-4" />,
      MAINTENANCE: <Settings className="h-4 w-4" />
    }
    return icons[category] || <Info className="h-4 w-4" />
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      relative: getRelativeTime(date)
    }
  }

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 30) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const renderChangeDetails = (entry: AuditLogEntry) => {
    if (!entry.changes || entry.changes.length === 0) return null

    return (
      <div className="mt-3 space-y-2">
        <h5 className="text-sm font-medium text-muted-foreground">Changes:</h5>
        <div className="space-y-2">
          {entry.changes.map((change, index) => (
            <div key={index} className="bg-muted/50 rounded-md p-3 text-sm">
              <div className="font-medium mb-1">{change.field}</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground">From: </span>
                  <span className="text-red-600 font-mono">
                    {change.sensitive ? '***' : String(change.oldValue)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">To: </span>
                  <span className="text-green-600 font-mono">
                    {change.sensitive ? '***' : String(change.newValue)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Audit Trail
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchAuditLogs}
              disabled={isLoading}
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
          </div>
        </div>

        {/* Summary Metrics */}
        {showSummary && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.todayCount}</div>
              <div className="text-sm text-muted-foreground">Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.weeklyCount}</div>
              <div className="text-sm text-muted-foreground">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{metrics.securityEvents}</div>
              <div className="text-sm text-muted-foreground">Security</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.criticalEvents}</div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.failedLogins}</div>
              <div className="text-sm text-muted-foreground">Failed Logins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalEntries}</div>
              <div className="text-sm text-muted-foreground">Total Entries</div>
            </div>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <Collapsible open={showFiltersPanel} onOpenChange={setShowFiltersPanel}>
            <CollapsibleContent className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search entries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button variant="outline" size="sm" onClick={handleSearch}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <DatePickerWithRange
                    date={selectedDateRange}
                    onDateChange={handleDateRangeChange}
                  />
                </div>

                {/* Action Filter */}
                <div className="space-y-2">
                  <Label>Action</Label>
                  <Select
                    value={filter.action || ''}
                    onValueChange={(value) => updateFilter({ action: value as AuditAction })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All actions</SelectItem>
                      <SelectItem value="CREATE">Create</SelectItem>
                      <SelectItem value="READ">Read</SelectItem>
                      <SelectItem value="UPDATE">Update</SelectItem>
                      <SelectItem value="DELETE">Delete</SelectItem>
                      <SelectItem value="LOGIN">Login</SelectItem>
                      <SelectItem value="LOGOUT">Logout</SelectItem>
                      <SelectItem value="LOGIN_FAILED">Failed Login</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Entity Type Filter */}
                <div className="space-y-2">
                  <Label>Entity Type</Label>
                  <Select
                    value={filter.entityType || ''}
                    onValueChange={(value) => updateFilter({ entityType: value as AuditEntityType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All entities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All entities</SelectItem>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="CUSTOMER">Customer</SelectItem>
                      <SelectItem value="INVOICE">Invoice</SelectItem>
                      <SelectItem value="PAYMENT">Payment</SelectItem>
                      <SelectItem value="QUOTE">Quote</SelectItem>
                      <SelectItem value="SETTINGS">Settings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Severity Filter */}
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select
                    value={filter.severity || ''}
                    onValueChange={(value) => updateFilter({ severity: value as AuditSeverity })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All severities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All severities</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button variant="outline" onClick={clearFilter} className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6">
            <LoadingSpinner message="Loading audit trail..." />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Audit Entries</h3>
            <p className="text-muted-foreground">
              No audit entries match the current filters
            </p>
          </div>
        ) : (
          <ScrollArea className="h-96" style={{ maxHeight }}>
            <div className="space-y-0">
              {entries.map((entry, index) => {
                const timestamp = formatTimestamp(entry.timestamp)
                return (
                  <div key={entry.id}>
                    <div
                      className={cn(
                        'p-4 hover:bg-muted/50 cursor-pointer transition-colors',
                        entry.severity === 'CRITICAL' && 'bg-red-50 border-l-4 border-l-red-500',
                        entry.severity === 'HIGH' && 'bg-orange-50 border-l-4 border-l-orange-500'
                      )}
                      onClick={() => onEntryClick?.(entry)}
                    >
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="flex items-center gap-2">
                              {getActionIcon(entry.action)}
                              {getCategoryIcon(entry.category)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">
                                  {entry.userName}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {entry.action.toLowerCase().replace('_', ' ')} {entry.entityType.toLowerCase()}
                                </span>
                                {entry.entityName && (
                                  <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                    {entry.entityName}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{entry.userEmail}</span>
                                <span>•</span>
                                <span>{entry.userRole}</span>
                                {entry.ipAddress && (
                                  <>
                                    <span>•</span>
                                    <span className="font-mono">{entry.ipAddress}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getSeverityColor(entry.severity)}>
                              {entry.severity}
                            </Badge>
                            <div className="text-right text-sm">
                              <div className="font-medium">{timestamp.time}</div>
                              <div className="text-muted-foreground">{timestamp.relative}</div>
                            </div>
                          </div>
                        </div>

                        {/* Changes */}
                        {renderChangeDetails(entry)}

                        {/* Metadata */}
                        {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            <div className="flex gap-4">
                              {entry.metadata.duration && (
                                <span>Duration: {entry.metadata.duration}ms</span>
                              )}
                              {entry.metadata.success !== undefined && (
                                <span>
                                  Status: {entry.metadata.success ?
                                    <span className="text-green-600">Success</span> :
                                    <span className="text-red-600">Failed</span>
                                  }
                                </span>
                              )}
                              {entry.metadata.source && (
                                <span>Source: {entry.metadata.source}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {index < entries.length - 1 && <Separator />}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}