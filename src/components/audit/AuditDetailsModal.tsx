import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Shield,
  User,
  Clock,
  MapPin,
  Monitor,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  Download,
  ExternalLink,
  Copy,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AuditLogEntry, AuditChange, AuditSeverity } from '@/types/audit'

export interface AuditDetailsModalProps {
  entry: AuditLogEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onViewRelated?: (entityType: string, entityId: string) => void
  onViewUser?: (userId: string) => void
}

export function AuditDetailsModal({
  entry,
  open,
  onOpenChange,
  onViewRelated,
  onViewUser
}: AuditDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('overview')

  if (!entry) return null

  const getSeverityColor = (severity: AuditSeverity) => {
    const colors = {
      LOW: 'bg-green-100 text-green-800 border-green-200',
      MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
      CRITICAL: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[severity]
  }

  const getActionIcon = () => {
    switch (entry.action) {
      case 'CREATE':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'UPDATE':
        return <Edit className="h-5 w-5 text-yellow-500" />
      case 'DELETE':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'READ':
        return <Eye className="h-5 w-5 text-blue-500" />
      case 'LOGIN':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'LOGIN_FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      full: date.toLocaleString(),
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      iso: date.toISOString()
    }
  }

  const formatChangeValue = (value: any, fieldType: string, sensitive?: boolean) => {
    if (sensitive) return '***'

    switch (fieldType) {
      case 'date':
        return new Date(value).toLocaleString()
      case 'boolean':
        return value ? 'Yes' : 'No'
      case 'array':
        return Array.isArray(value) ? `[${value.length} items]` : String(value)
      case 'object':
        return typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
      default:
        return String(value)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const timestamp = formatTimestamp(entry.timestamp)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getActionIcon()}
              <div>
                <DialogTitle className="text-xl">
                  {entry.action.replace('_', ' ')} {entry.entityType.toLowerCase()}
                </DialogTitle>
                <DialogDescription>
                  Audit entry from {timestamp.full}
                </DialogDescription>
              </div>
            </div>
            <Badge className={getSeverityColor(entry.severity)}>
              {entry.severity}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="changes">Changes</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
          </TabsList>

          <div className="mt-4 h-[calc(90vh-200px)]">
            <TabsContent value="overview" className="h-full">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-6">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Event Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Action</label>
                          <p className="font-medium">{entry.action.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Category</label>
                          <p className="font-medium">{entry.category.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Entity Type</label>
                          <p className="font-medium">{entry.entityType}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Entity ID</label>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-sm">{entry.entityId}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(entry.entityId)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {entry.entityName && (
                          <div className="col-span-2">
                            <label className="text-sm font-medium text-muted-foreground">Entity Name</label>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{entry.entityName}</p>
                              {onViewRelated && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onViewRelated(entry.entityType, entry.entityId)}
                                  className="h-6 w-6 p-0"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* User Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        User Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Name</label>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{entry.userName}</p>
                            {onViewUser && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewUser(entry.userId)}
                                className="h-6 w-6 p-0"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                          <p className="font-medium">{entry.userEmail}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Role</label>
                          <Badge variant="outline">{entry.userRole}</Badge>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">User ID</label>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-sm">{entry.userId}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(entry.userId)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Context Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Context Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                          <div className="space-y-1">
                            <p className="font-medium">{timestamp.full}</p>
                            <p className="font-mono text-sm text-muted-foreground">{timestamp.iso}</p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Event ID</label>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-sm">{entry.id}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(entry.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {entry.ipAddress && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                            <p className="font-mono text-sm">{entry.ipAddress}</p>
                          </div>
                        )}
                        {entry.userAgent && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">User Agent</label>
                            <p className="text-sm text-muted-foreground truncate" title={entry.userAgent}>
                              {entry.userAgent}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="changes" className="h-full">
              <ScrollArea className="h-full pr-4">
                {entry.changes && entry.changes.length > 0 ? (
                  <div className="space-y-4">
                    {entry.changes.map((change, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="text-lg">{change.field}</CardTitle>
                          {change.sensitive && (
                            <Badge variant="destructive" className="w-fit">
                              <Shield className="h-3 w-3 mr-1" />
                              Sensitive Data
                            </Badge>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-red-600 mb-2 block">
                                Previous Value
                              </label>
                              <div className="bg-red-50 border border-red-200 rounded p-3">
                                <pre className="text-sm font-mono whitespace-pre-wrap break-all">
                                  {formatChangeValue(change.oldValue, change.fieldType, change.sensitive)}
                                </pre>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-green-600 mb-2 block">
                                New Value
                              </label>
                              <div className="bg-green-50 border border-green-200 rounded p-3">
                                <pre className="text-sm font-mono whitespace-pre-wrap break-all">
                                  {formatChangeValue(change.newValue, change.fieldType, change.sensitive)}
                                </pre>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 text-sm text-muted-foreground">
                            Field Type: {change.fieldType}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No Changes</h3>
                    <p className="text-muted-foreground">
                      This action did not result in any tracked changes
                    </p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="metadata" className="h-full">
              <ScrollArea className="h-full pr-4">
                {entry.metadata && Object.keys(entry.metadata).length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Metadata
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(entry.metadata).map(([key, value]) => (
                          <div key={key} className="grid grid-cols-3 gap-4">
                            <div className="font-medium text-muted-foreground">{key}</div>
                            <div className="col-span-2">
                              <pre className="text-sm font-mono bg-muted p-2 rounded whitespace-pre-wrap break-all">
                                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                              </pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No Metadata</h3>
                    <p className="text-muted-foreground">
                      No additional metadata is available for this event
                    </p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="raw" className="h-full">
              <ScrollArea className="h-full pr-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Raw JSON Data
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(JSON.stringify(entry, null, 2))}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm font-mono bg-muted p-4 rounded whitespace-pre-wrap break-all overflow-auto">
                      {JSON.stringify(entry, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}