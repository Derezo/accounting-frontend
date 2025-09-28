import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { DataTable, Column } from '@/components/tables/DataTable'
import {
  Download,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Package,
  Settings,
  Play,
  Pause,
  SkipForward,
  Archive
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BulkPDFItem {
  id: string
  type: 'INVOICE' | 'QUOTE' | 'RECEIPT' | 'STATEMENT'
  number: string
  customerName: string
  amount: number
  currency: string
  date: string
  status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED' | 'SKIPPED'
  priority: 'LOW' | 'NORMAL' | 'HIGH'
  error?: string
  pdfUrl?: string
  generatedAt?: string
}

export interface BulkGenerationJob {
  id: string
  name: string
  items: BulkPDFItem[]
  status: 'PENDING' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  progress: {
    completed: number
    failed: number
    total: number
    percentage: number
  }
  settings: {
    template: string
    format: 'PDF' | 'ZIP'
    emailToCustomers: boolean
    includeAttachments: boolean
    concurrency: number
  }
  createdAt: string
  startedAt?: string
  completedAt?: string
  estimatedCompletion?: string
}

export interface BulkPDFGeneratorProps {
  items: BulkPDFItem[]
  onJobStart?: (job: BulkGenerationJob) => void
  onJobComplete?: (job: BulkGenerationJob) => void
  onItemComplete?: (item: BulkPDFItem) => void
  className?: string
}

const mockTemplates = [
  { id: 'modern', name: 'Modern', description: 'Clean and contemporary' },
  { id: 'classic', name: 'Classic', description: 'Traditional business style' },
  { id: 'minimal', name: 'Minimal', description: 'Simple and clean' },
  { id: 'professional', name: 'Professional', description: 'Corporate design' }
]

export function BulkPDFGenerator({
  items,
  onJobStart,
  onJobComplete,
  onItemComplete,
  className
}: BulkPDFGeneratorProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [currentJob, setCurrentJob] = useState<BulkGenerationJob | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  // Generation settings
  const [template, setTemplate] = useState('modern')
  const [outputFormat, setOutputFormat] = useState<'PDF' | 'ZIP'>('ZIP')
  const [emailToCustomers, setEmailToCustomers] = useState(false)
  const [includeAttachments, setIncludeAttachments] = useState(false)
  const [concurrency, setConcurrency] = useState(3)

  const [jobItems, setJobItems] = useState<BulkPDFItem[]>([])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(items.map(item => item.id)))
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems)
    if (checked) {
      newSelected.add(itemId)
    } else {
      newSelected.delete(itemId)
    }
    setSelectedItems(newSelected)
  }

  const createJob = (): BulkGenerationJob => {
    const selectedItemsData = items.filter(item => selectedItems.has(item.id))
    const jobItems = selectedItemsData.map(item => ({
      ...item,
      status: 'PENDING' as const
    }))

    return {
      id: `job_${Date.now()}`,
      name: `Bulk PDF Generation - ${new Date().toLocaleDateString()}`,
      items: jobItems,
      status: 'PENDING',
      progress: {
        completed: 0,
        failed: 0,
        total: jobItems.length,
        percentage: 0
      },
      settings: {
        template,
        format: outputFormat,
        emailToCustomers,
        includeAttachments,
        concurrency
      },
      createdAt: new Date().toISOString()
    }
  }

  const startGeneration = async () => {
    if (selectedItems.size === 0) return

    const job = createJob()
    setCurrentJob(job)
    setJobItems(job.items)
    setIsRunning(true)
    setIsPaused(false)

    onJobStart?.(job)

    // Update job status
    const updatedJob = {
      ...job,
      status: 'RUNNING' as const,
      startedAt: new Date().toISOString()
    }
    setCurrentJob(updatedJob)

    // Simulate bulk generation
    await processItems(updatedJob)
  }

  const processItems = async (job: BulkGenerationJob) => {
    const items = [...job.items]
    let completed = 0
    let failed = 0

    for (let i = 0; i < items.length; i++) {
      if (isPaused) {
        // Wait for resume
        while (isPaused && isRunning) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      if (!isRunning) break

      const item = items[i]

      // Update item status to generating
      const updatedItems = [...jobItems]
      updatedItems[i] = { ...item, status: 'GENERATING' }
      setJobItems(updatedItems)

      try {
        // Simulate generation time (1-3 seconds per item)
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000))

        // Simulate occasional failures (5% chance)
        if (Math.random() < 0.05) {
          throw new Error('Generation failed due to template error')
        }

        // Mark as completed
        const completedItem = {
          ...item,
          status: 'COMPLETED' as const,
          pdfUrl: `/pdfs/${item.type.toLowerCase()}-${item.number}.pdf`,
          generatedAt: new Date().toISOString()
        }

        updatedItems[i] = completedItem
        setJobItems(updatedItems)
        completed++

        onItemComplete?.(completedItem)

      } catch (error: any) {
        // Mark as failed
        const failedItem = {
          ...item,
          status: 'FAILED' as const,
          error: error.message
        }

        updatedItems[i] = failedItem
        setJobItems(updatedItems)
        failed++
      }

      // Update job progress
      const progress = {
        completed,
        failed,
        total: items.length,
        percentage: Math.round(((completed + failed) / items.length) * 100)
      }

      setCurrentJob(prev => prev ? {
        ...prev,
        progress,
        estimatedCompletion: new Date(Date.now() + (items.length - completed - failed) * 2000).toISOString()
      } : null)
    }

    // Complete the job
    const finalJob = {
      ...job,
      items: jobItems,
      status: failed === 0 ? 'COMPLETED' : 'FAILED' as const,
      progress: {
        completed,
        failed,
        total: items.length,
        percentage: 100
      },
      completedAt: new Date().toISOString()
    }

    setCurrentJob(finalJob)
    setIsRunning(false)
    setIsPaused(false)

    onJobComplete?.(finalJob)
  }

  const pauseGeneration = () => {
    setIsPaused(true)
    setCurrentJob(prev => prev ? { ...prev, status: 'PAUSED' } : null)
  }

  const resumeGeneration = () => {
    setIsPaused(false)
    setCurrentJob(prev => prev ? { ...prev, status: 'RUNNING' } : null)
  }

  const cancelGeneration = () => {
    setIsRunning(false)
    setIsPaused(false)
    setCurrentJob(prev => prev ? { ...prev, status: 'CANCELLED' } : null)
  }

  const downloadResults = () => {
    if (!currentJob) return

    const completedItems = jobItems.filter(item => item.status === 'COMPLETED')

    if (outputFormat === 'ZIP') {
      // In real implementation, create ZIP file
      console.log('Downloading ZIP with', completedItems.length, 'PDFs')
    } else {
      // Download individual PDFs
      completedItems.forEach(item => {
        if (item.pdfUrl) {
          const link = document.createElement('a')
          link.href = item.pdfUrl
          link.download = `${item.type.toLowerCase()}-${item.number}.pdf`
          link.click()
        }
      })
    }
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      PENDING: <Clock className="h-4 w-4 text-gray-500" />,
      GENERATING: <Settings className="h-4 w-4 text-blue-500 animate-spin" />,
      COMPLETED: <CheckCircle className="h-4 w-4 text-green-500" />,
      FAILED: <XCircle className="h-4 w-4 text-red-500" />,
      SKIPPED: <SkipForward className="h-4 w-4 text-gray-400" />
    }
    return icons[status as keyof typeof icons] || icons.PENDING
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800' },
      GENERATING: { variant: 'default' as const, className: 'bg-blue-100 text-blue-800' },
      COMPLETED: { variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      FAILED: { variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
      SKIPPED: { variant: 'outline' as const, className: 'bg-gray-100 text-gray-600' }
    }

    const config = variants[status as keyof typeof variants] || variants.PENDING

    return (
      <Badge variant={config.variant} className={cn('gap-1', config.className)}>
        {getStatusIcon(status)}
        {status}
      </Badge>
    )
  }

  const columns: Column<BulkPDFItem>[] = [
    {
      id: 'type',
      header: 'Type',
      accessorKey: 'type',
      cell: (item) => (
        <Badge variant="outline">
          {item.type}
        </Badge>
      )
    },
    {
      id: 'number',
      header: 'Number',
      accessorKey: 'number',
      cell: (item) => (
        <span className="font-mono text-sm">{item.number}</span>
      )
    },
    {
      id: 'customer',
      header: 'Customer',
      accessorKey: 'customerName'
    },
    {
      id: 'amount',
      header: 'Amount',
      cell: (item) => (
        <span className="font-medium">
          {item.currency} {item.amount.toFixed(2)}
        </span>
      )
    },
    {
      id: 'status',
      header: 'Status',
      cell: (item) => getStatusBadge(item.status)
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (item) => (
        <div className="flex items-center space-x-1">
          {item.status === 'COMPLETED' && item.pdfUrl && (
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <a href={item.pdfUrl} download>
                <Download className="h-4 w-4" />
              </a>
            </Button>
          )}
          {item.status === 'FAILED' && (
            <Button
              variant="ghost"
              size="sm"
              title={item.error}
            >
              <AlertTriangle className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Job Overview */}
      {currentJob && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {currentJob.name}
              </CardTitle>
              <Badge
                variant={
                  currentJob.status === 'COMPLETED' ? 'default' :
                  currentJob.status === 'FAILED' ? 'destructive' :
                  currentJob.status === 'RUNNING' ? 'default' :
                  'secondary'
                }
                className={
                  currentJob.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  currentJob.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                  currentJob.status === 'RUNNING' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }
              >
                {currentJob.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress ({currentJob.progress.completed + currentJob.progress.failed} of {currentJob.progress.total})</span>
                <span>{currentJob.progress.percentage}%</span>
              </div>
              <Progress value={currentJob.progress.percentage} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{currentJob.progress.completed} completed</span>
                <span>{currentJob.progress.failed} failed</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isRunning && !isPaused && (
                  <Button variant="outline" size="sm" onClick={pauseGeneration}>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                )}

                {isRunning && isPaused && (
                  <Button variant="outline" size="sm" onClick={resumeGeneration}>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                )}

                {isRunning && (
                  <Button variant="destructive" size="sm" onClick={cancelGeneration}>
                    Cancel
                  </Button>
                )}

                {!isRunning && currentJob.status === 'COMPLETED' && (
                  <Button onClick={downloadResults} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download All ({currentJob.progress.completed})
                  </Button>
                )}
              </div>

              {currentJob.estimatedCompletion && isRunning && (
                <span className="text-sm text-muted-foreground">
                  ETA: {new Date(currentJob.estimatedCompletion).toLocaleTimeString()}
                </span>
              )}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{currentJob.progress.completed}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{currentJob.progress.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">{currentJob.progress.total - currentJob.progress.completed - currentJob.progress.failed}</div>
                <div className="text-sm text-muted-foreground">Remaining</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration */}
      {!isRunning && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Generation Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template</Label>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTemplates.map(tmpl => (
                      <SelectItem key={tmpl.id} value={tmpl.id}>
                        <div>
                          <div className="font-medium">{tmpl.name}</div>
                          <div className="text-xs text-muted-foreground">{tmpl.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Output Format</Label>
                <Select value={outputFormat} onValueChange={(value) => setOutputFormat(value as 'PDF' | 'ZIP')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ZIP">ZIP Archive</SelectItem>
                    <SelectItem value="PDF">Individual PDFs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Concurrency</Label>
                <Select value={concurrency.toString()} onValueChange={(value) => setConcurrency(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 (Slow)</SelectItem>
                    <SelectItem value="3">3 (Recommended)</SelectItem>
                    <SelectItem value="5">5 (Fast)</SelectItem>
                    <SelectItem value="10">10 (Very Fast)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emailToCustomers"
                  checked={emailToCustomers}
                  onCheckedChange={(checked) => setEmailToCustomers(checked as boolean)}
                />
                <Label htmlFor="emailToCustomers" className="text-sm">
                  Email PDFs to customers after generation
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeAttachments"
                  checked={includeAttachments}
                  onCheckedChange={(checked) => setIncludeAttachments(checked as boolean)}
                />
                <Label htmlFor="includeAttachments" className="text-sm">
                  Include attachments in PDFs
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Items to Generate ({currentJob ? jobItems.length : selectedItems.size} selected)
            </CardTitle>

            {!isRunning && (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={startGeneration}
                  disabled={selectedItems.size === 0}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start Generation
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={currentJob ? jobItems : items}
            columns={columns}
            selectable={!isRunning}
            onSelectionChange={(selectedRows) => {
              if (!isRunning) {
                setSelectedItems(new Set(selectedRows.map(row => row.id)))
              }
            }}
            searchable={true}
            searchPlaceholder="Search items..."
            showPagination={true}
          />

          {!isRunning && selectedItems.size === 0 && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please select items to generate PDFs for.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}