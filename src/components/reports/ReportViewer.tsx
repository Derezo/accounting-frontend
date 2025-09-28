import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import {
  FileText,
  Download,
  Printer,
  Share2,
  Calendar,
  DollarSign,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Eye,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  ReportData,
  ReportSection,
  ReportColumn
} from '@/types/reports'

export interface ReportViewerProps {
  report: ReportData | null
  isLoading?: boolean
  error?: string
  onDownload?: (format: 'PDF' | 'EXCEL' | 'CSV') => void
  onPrint?: () => void
  onShare?: () => void
  className?: string
}

export function ReportViewer({
  report,
  isLoading,
  error,
  onDownload,
  onPrint,
  onShare,
  className
}: ReportViewerProps) {
  const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'EXCEL' | 'CSV'>('PDF')

  const formatValue = (value: any, column: ReportColumn) => {
    if (value === null || value === undefined) return '-'

    switch (column.type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value)
      case 'number':
        return new Intl.NumberFormat('en-US').format(value)
      case 'percentage':
        return `${value.toFixed(1)}%`
      case 'date':
        return new Date(value).toLocaleDateString()
      default:
        return String(value)
    }
  }

  const renderSection = (section: ReportSection) => {
    switch (section.type) {
      case 'summary':
        return (
          <Card key={section.id} className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Object.entries(section.data).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-bold">
                      {typeof value === 'number' && key.toLowerCase().includes('amount')
                        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
                        : typeof value === 'number' && key.toLowerCase().includes('margin')
                        ? `${value}%`
                        : new Intl.NumberFormat('en-US').format(Number(value))
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case 'table':
        return (
          <Card key={section.id} className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      {section.columns?.map((column) => (
                        <th
                          key={column.key}
                          className={cn(
                            'py-3 px-4 font-medium text-left',
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right'
                          )}
                          style={{ width: column.width ? `${column.width}px` : undefined }}
                        >
                          {column.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(section.data) && section.data.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        {section.columns?.map((column) => (
                          <td
                            key={column.key}
                            className={cn(
                              'py-3 px-4',
                              column.align === 'center' && 'text-center',
                              column.align === 'right' && 'text-right'
                            )}
                          >
                            {formatValue(row[column.key], column)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )

      case 'chart':
        return (
          <Card key={section.id} className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {section.chartConfig?.type === 'pie' && <PieChartIcon className="h-5 w-5" />}
                {section.chartConfig?.type === 'bar' && <BarChart3 className="h-5 w-5" />}
                {(section.chartConfig?.type === 'line' || section.chartConfig?.type === 'area') && <Activity className="h-5 w-5" />}
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                {section.chartConfig?.type === 'bar' && (
                  <BarChart data={section.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={section.chartConfig.xAxis} />
                    <YAxis />
                    <Tooltip formatter={(value) => [
                      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value)),
                      section.chartConfig?.yAxis
                    ]} />
                    <Bar dataKey={section.chartConfig.yAxis} fill="#3b82f6" />
                  </BarChart>
                )}

                {section.chartConfig?.type === 'line' && (
                  <LineChart data={section.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={section.chartConfig.xAxis} />
                    <YAxis />
                    <Tooltip formatter={(value) => [
                      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value)),
                      section.chartConfig?.yAxis
                    ]} />
                    <Line type="monotone" dataKey={section.chartConfig.yAxis} stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                )}

                {section.chartConfig?.type === 'area' && (
                  <AreaChart data={section.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={section.chartConfig.xAxis} />
                    <YAxis />
                    <Tooltip formatter={(value) => [
                      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value)),
                      section.chartConfig?.yAxis
                    ]} />
                    <Area type="monotone" dataKey={section.chartConfig.yAxis} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                  </AreaChart>
                )}

                {section.chartConfig?.type === 'pie' && (
                  <PieChart>
                    <Pie
                      data={section.data}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey={section.chartConfig.yAxis}
                    >
                      {section.data.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={section.chartConfig?.colors?.[index] || `hsl(${index * 45}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [
                      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value)),
                      section.chartConfig?.yAxis
                    ]} />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )

      case 'text':
        return (
          <Card key={section.id} className="mb-6">
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{section.data}</p>
            </CardContent>
          </Card>
        )

      case 'breakdown':
        return (
          <Card key={section.id} className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(section.data).map(([category, items]) => (
                  <div key={category}>
                    <h4 className="font-medium mb-2">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Array.isArray(items) && items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="text-sm">{item.name}</span>
                          <span className="font-medium">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Generating report preview...</p>
            </div>
          </div>
        </CardContent>
      </Card>
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

  if (!report) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Report Data</h3>
            <p className="text-muted-foreground">
              Generate or select a report to view its content
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {report.title}
            </CardTitle>
            {report.subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{report.subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(report.generatedAt).toLocaleDateString()}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onPrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={onShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as 'PDF' | 'EXCEL' | 'CSV')}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="PDF">PDF</option>
              <option value="EXCEL">Excel</option>
              <option value="CSV">CSV</option>
            </select>
            <Button size="sm" onClick={() => onDownload?.(selectedFormat)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {/* Report Summary */}
            {report.summary && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Report Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{report.summary.totalRecords.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Records</div>
                    </div>
                    {report.summary.totalAmount && (
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: report.summary.currency || 'USD'
                          }).format(report.summary.totalAmount)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Amount</div>
                      </div>
                    )}
                    {report.summary.calculations?.map((calc, index) => (
                      <div key={index} className="text-center">
                        <div className="text-2xl font-bold">
                          {calc.type === 'currency'
                            ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(calc.value)
                            : calc.type === 'percentage'
                            ? `${calc.value}%`
                            : calc.value.toLocaleString()
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">{calc.label}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Report Sections */}
            {report.sections.map(renderSection)}

            {/* Report Parameters */}
            {report.parameters && Object.keys(report.parameters).length > 0 && (
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-sm">Report Parameters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(report.parameters).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                        </span>
                        <span className="font-medium">
                          {typeof value === 'object' && value?.from && value?.to
                            ? `${value.from} to ${value.to}`
                            : String(value)
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}