import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  FileText,
  BarChart3,
  List,
  Settings,
  Download,
  Play,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { ReportTemplates } from '@/components/reports/ReportTemplates'
import { ReportGenerator } from '@/components/reports/ReportGenerator'
import { ReportViewer } from '@/components/reports/ReportViewer'
import { ReportsList } from '@/components/reports/ReportsList'
import { useReports } from '@/hooks/useReports'
import type {
  ReportTemplate,
  ReportInstance,
  ReportData
} from '@/types/reports'

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState('generate')
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [currentReport, setCurrentReport] = useState<ReportData | null>(null)
  const [selectedInstance, setSelectedInstance] = useState<ReportInstance | null>(null)

  const {
    templates,
    instances,
    currentReport: hookReport,
    isLoading,
    error,
    metrics,
    generateReport,
    downloadReport
  } = useReports()

  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template)
    // Auto-switch to generate tab when template is selected
    if (activeTab === 'templates') {
      setActiveTab('generate')
    }
  }

  const handleReportGenerated = (instance: ReportInstance) => {
    // Switch to reports list to show the new report
    setActiveTab('reports')
    // Show success message or notification here
  }

  const handleReportPreview = (template: ReportTemplate, parameters: Record<string, any>) => {
    // Switch to preview tab
    setCurrentReport(hookReport)
    setActiveTab('preview')
  }

  const handleViewReport = (instance: ReportInstance) => {
    setSelectedInstance(instance)
    // In a real implementation, you would fetch the report data
    // For now, we'll use the current report from the hook
    setCurrentReport(hookReport)
    setActiveTab('preview')
  }

  const handleDownloadReport = async (format: 'PDF' | 'EXCEL' | 'CSV') => {
    if (selectedInstance) {
      try {
        await downloadReport(selectedInstance.id)
      } catch (error) {
        console.error('Download failed:', error)
      }
    }
  }

  const handleCreateCustomTemplate = () => {
    // TODO: Implement custom template builder
    alert('Custom template builder coming soon!')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Generate, view, and manage financial and business reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setActiveTab('templates')}>
            Browse Templates
          </Button>
          <Button onClick={() => setActiveTab('generate')}>
            <Play className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">
              Ready to generate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated Today</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.todayReports}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.todayReports > 0 ? '+' : ''}{metrics.todayReports} from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.completedReports} of {metrics.totalReports} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Running</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.runningReports}</div>
            <p className="text-xs text-muted-foreground">
              Reports in progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            My Reports
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="templates">
            <ReportTemplates
              onSelectTemplate={handleTemplateSelect}
              onCreateCustom={handleCreateCustomTemplate}
              selectedTemplateId={selectedTemplate?.id}
            />
          </TabsContent>

          <TabsContent value="generate">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Template Selection */}
              <div className="lg:col-span-1">
                <ReportTemplates
                  onSelectTemplate={handleTemplateSelect}
                  onCreateCustom={handleCreateCustomTemplate}
                  selectedTemplateId={selectedTemplate?.id}
                />
              </div>

              {/* Report Configuration */}
              <div className="lg:col-span-2">
                <ReportGenerator
                  template={selectedTemplate}
                  onReportGenerated={handleReportGenerated}
                  onPreview={handleReportPreview}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <ReportsList
              onViewReport={handleViewReport}
              onGenerateReport={handleTemplateSelect}
            />
          </TabsContent>

          <TabsContent value="preview">
            <ReportViewer
              report={currentReport}
              isLoading={isLoading}
              error={error}
              onDownload={handleDownloadReport}
              onPrint={() => window.print()}
              onShare={() => {
                if (navigator.share && currentReport) {
                  navigator.share({
                    title: currentReport.title,
                    text: currentReport.subtitle || 'Financial Report',
                    url: window.location.href
                  })
                } else {
                  // Fallback: copy link to clipboard
                  navigator.clipboard.writeText(window.location.href)
                  alert('Link copied to clipboard!')
                }
              }}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Quick Actions Panel */}
      {selectedTemplate && (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">{selectedTemplate.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedTemplate.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{selectedTemplate.category}</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('generate')}
                >
                  Configure & Generate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Indicators */}
      {metrics.runningReports > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600 animate-pulse" />
              <span className="text-sm font-medium text-blue-800">
                {metrics.runningReports} report{metrics.runningReports === 1 ? '' : 's'} currently generating...
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('reports')}
                className="text-blue-600 hover:text-blue-700"
              >
                View Progress
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}