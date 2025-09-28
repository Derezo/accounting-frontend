import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, BarChart3, List, Settings } from 'lucide-react'
import { AuditDashboard } from '@/components/audit/AuditDashboard'
import { AuditTrail } from '@/components/audit/AuditTrail'
import { AuditDetailsModal } from '@/components/audit/AuditDetailsModal'
import type { AuditLogEntry } from '@/types/audit'

export default function AuditPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const handleEntryClick = (entry: AuditLogEntry) => {
    setSelectedEntry(entry)
    setShowDetailsModal(true)
  }

  const handleViewRelated = (entityType: string, entityId: string) => {
    // Navigate to related entity
    console.log('View related:', entityType, entityId)
    // Implementation would depend on routing setup
  }

  const handleViewUser = (userId: string) => {
    // Navigate to user details
    console.log('View user:', userId)
    // Implementation would depend on routing setup
  }

  const handleExport = () => {
    console.log('Export audit data')
    // Implementation handled by child components
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit & Compliance</h1>
          <p className="text-muted-foreground">
            Monitor system activity, security events, and compliance tracking
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          Export Data
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="trail" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Audit Trail
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="dashboard">
            <AuditDashboard onExport={handleExport} />
          </TabsContent>

          <TabsContent value="trail">
            <AuditTrail
              showSummary={true}
              showFilters={true}
              onEntryClick={handleEntryClick}
              onExport={handleExport}
            />
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Audit Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Audit Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Retention Policy</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Configure how long audit logs are retained in the system
                    </p>
                    <div className="bg-muted p-3 rounded">
                      <p className="text-sm">Current: 2 years</p>
                      <p className="text-xs text-muted-foreground">
                        Audit logs are automatically archived after 2 years and deleted after 7 years
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Event Categories</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Categories of events that are currently being tracked
                    </p>
                    <div className="space-y-2">
                      {[
                        'Authentication Events',
                        'Data Modifications',
                        'Security Events',
                        'Financial Transactions',
                        'User Management',
                        'System Configuration'
                      ].map((category) => (
                        <div key={category} className="flex items-center justify-between text-sm">
                          <span>{category}</span>
                          <span className="text-green-600">Enabled</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Regulatory Compliance</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Compliance frameworks and standards being monitored
                    </p>
                    <div className="space-y-2">
                      {[
                        { name: 'SOX (Sarbanes-Oxley)', status: 'Compliant' },
                        { name: 'GDPR', status: 'Compliant' },
                        { name: 'HIPAA', status: 'N/A' },
                        { name: 'PCI DSS', status: 'Compliant' }
                      ].map((framework) => (
                        <div key={framework.name} className="flex items-center justify-between text-sm">
                          <span>{framework.name}</span>
                          <span className={
                            framework.status === 'Compliant' ? 'text-green-600' :
                            framework.status === 'N/A' ? 'text-gray-500' :
                            'text-red-600'
                          }>
                            {framework.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Alert Thresholds</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Automated alerts for suspicious activities
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Failed login attempts</span>
                        <span>5 per hour</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Critical events</span>
                        <span>Immediate</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Data export volume</span>
                        <span>1000 records</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Export Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Scheduled Exports</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Automatically export audit logs for compliance reporting
                    </p>
                    <div className="bg-muted p-3 rounded">
                      <p className="text-sm">Monthly compliance report</p>
                      <p className="text-xs text-muted-foreground">
                        Next export: End of month
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Export Formats</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Available formats for audit log exports
                    </p>
                    <div className="space-y-1 text-sm">
                      <div>• CSV (Comma Separated Values)</div>
                      <div>• JSON (JavaScript Object Notation)</div>
                      <div>• PDF (Portable Document Format)</div>
                      <div>• Excel (Microsoft Excel)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Information */}
              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Audit System Status</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Service Status</span>
                        <span className="text-green-600">Running</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Health Check</span>
                        <span>2 minutes ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Storage Usage</span>
                        <span>1.2 GB / 10 GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Events Today</span>
                        <span>1,247</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Version Information</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>Audit Engine: v2.1.3</div>
                      <div>Last Updated: March 15, 2024</div>
                      <div>Configuration Version: 1.0.12</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Audit Details Modal */}
      <AuditDetailsModal
        entry={selectedEntry}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        onViewRelated={handleViewRelated}
        onViewUser={handleViewUser}
      />
    </div>
  )
}