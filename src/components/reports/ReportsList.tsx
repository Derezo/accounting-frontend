import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  Play,
  User,
  FileX
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReports } from '@/hooks/useReports'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import type {
  ReportInstance,
  ReportTemplate,
  ReportStatus,
  ReportCategory,
  ReportFormat
} from '@/types/reports'

export interface ReportsListProps {
  onViewReport?: (instance: ReportInstance) => void
  onGenerateReport?: (template: ReportTemplate) => void
  className?: string
}

export function ReportsList({
  onViewReport,
  onGenerateReport,
  className
}: ReportsListProps) {
  const {
    instances,
    templates,
    isLoading,
    error,
    filter,
    currentPage,
    totalPages,
    totalInstances,
    metrics,
    fetchReports,
    downloadReport,
    deleteReport,
    updateFilter,
    setPage,
    clearFilter
  } = useReports()

  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDateRange, setSelectedDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: filter.dateRange ? new Date(filter.dateRange.from) : undefined,
    to: filter.dateRange ? new Date(filter.dateRange.to) : undefined
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

  const handleDownload = async (instanceId: string) => {
    try {
      await downloadReport(instanceId)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleDelete = async (instanceId: string) => {
    if (confirm('Are you sure you want to delete this report?')) {
      try {
        await deleteReport(instanceId)
      } catch (error) {
        console.error('Delete failed:', error)
      }
    }
  }

  const getStatusIcon = (status: ReportStatus) => {
    const icons = {
      PENDING: <Clock className="h-4 w-4 text-yellow-500" />,
      RUNNING: <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />,
      COMPLETED: <CheckCircle className="h-4 w-4 text-green-500" />,
      FAILED: <XCircle className="h-4 w-4 text-red-500" />,
      CANCELLED: <XCircle className="h-4 w-4 text-gray-500" />,
      EXPIRED: <FileX className="h-4 w-4 text-orange-500" />
    }
    return icons[status] || icons.PENDING
  }

  const getStatusColor = (status: ReportStatus) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      RUNNING: 'bg-blue-100 text-blue-800 border-blue-200',
      COMPLETED: 'bg-green-100 text-green-800 border-green-200',
      FAILED: 'bg-red-100 text-red-800 border-red-200',
      CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200',
      EXPIRED: 'bg-orange-100 text-orange-800 border-orange-200'
    }
    return colors[status] || colors.PENDING
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
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
            <FileText className="h-5 w-5" />
            Generated Reports
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchReports}
              disabled={isLoading}
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.totalReports}</div>
            <div className="text-sm text-muted-foreground">Total Reports</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.completedReports}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{metrics.runningReports}</div>
            <div className="text-sm text-muted-foreground">Running</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{metrics.failedReports}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 space-y-4">
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search reports..."
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
                <label className="text-sm font-medium">Date Range</label>
                <DatePickerWithRange
                  date={selectedDateRange}
                  onDateChange={handleDateRangeChange}
                />
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filter.status || ''}
                  onValueChange={(value) => updateFilter({ status: value as ReportStatus })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="RUNNING">Running</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              <div className="space-y-2">
                <label className="text-sm font-medium">&nbsp;</label>
                <Button variant="outline" onClick={clearFilter} className="w-full">
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6">
            <LoadingSpinner message="Loading reports..." />
          </div>
        ) : instances.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Reports Found</h3>
            <p className="text-muted-foreground mb-4">
              No reports match the current filters
            </p>
            {templates.length > 0 && (
              <Button onClick={() => onGenerateReport?.(templates[0])}>
                <Play className="h-4 w-4 mr-2" />
                Generate First Report
              </Button>
            )}
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-0">
              {instances.map((instance, index) => (
                <div key={instance.id}>
                  <div className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-2 mt-0.5">
                            {getStatusIcon(instance.status)}
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{instance.templateName}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {instance.generatedBy}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(instance.startTime).toLocaleDateString()}
                              </span>
                              {instance.duration && (
                                <>
                                  <span>•</span>
                                  <span>{formatDuration(instance.duration)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(instance.status)}>
                            {instance.status}
                          </Badge>
                          <Badge variant="outline">{instance.format}</Badge>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {instance.status === 'RUNNING' && instance.progress !== undefined && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{instance.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${instance.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* File Information */}
                      {instance.status === 'COMPLETED' && instance.fileSize && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Size: {formatFileSize(instance.fileSize)}</span>
                          <span>•</span>
                          <span>Downloads: {instance.downloadCount}</span>
                          {instance.expiresAt && (
                            <>
                              <span>•</span>
                              <span>Expires: {new Date(instance.expiresAt).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Error Message */}
                      {instance.status === 'FAILED' && instance.error && (
                        <Alert variant="destructive" className="py-2">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            {instance.error}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Actions */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {instance.status === 'COMPLETED' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onViewReport?.(instance)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(instance.id)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </>
                          )}
                          {instance.status === 'FAILED' && onGenerateReport && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const template = templates.find(t => t.id === instance.templateId)
                                if (template) onGenerateReport(template)
                              }}
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Retry
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(instance.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < instances.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalInstances)} of {totalInstances} reports
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