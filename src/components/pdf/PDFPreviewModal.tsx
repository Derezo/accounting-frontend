import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Download,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  Minimize,
  FileText,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Share,
  Printer,
  Mail
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PDFPreviewModalProps {
  trigger: React.ReactNode
  pdfUrl?: string
  pdfBlob?: Blob
  fileName: string
  title?: string
  description?: string
  onDownload?: () => void
  onShare?: () => void
  onPrint?: () => void
  onEmail?: () => void
  className?: string
}

export interface PDFMetadata {
  title: string
  author: string
  subject: string
  creator: string
  producer: string
  creationDate: string
  modificationDate: string
  pageCount: number
  fileSize: number
}

export function PDFPreviewModal({
  trigger,
  pdfUrl,
  pdfBlob,
  fileName,
  title = 'PDF Preview',
  description,
  onDownload,
  onShare,
  onPrint,
  onEmail,
  className
}: PDFPreviewModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadProgress, setLoadProgress] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [pdfData, setPdfData] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<PDFMetadata | null>(null)

  // Load PDF when modal opens
  useEffect(() => {
    if (isOpen && (pdfUrl || pdfBlob)) {
      loadPDF()
    }
  }, [isOpen, pdfUrl, pdfBlob])

  const loadPDF = async () => {
    setIsLoading(true)
    setError(null)
    setLoadProgress(0)

    try {
      let dataUrl: string

      if (pdfBlob) {
        // Convert blob to data URL
        dataUrl = URL.createObjectURL(pdfBlob)
      } else if (pdfUrl) {
        // Fetch PDF from URL
        const response = await fetch(pdfUrl)
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.statusText}`)
        }

        const blob = await response.blob()
        dataUrl = URL.createObjectURL(blob)
      } else {
        throw new Error('No PDF source provided')
      }

      setPdfData(dataUrl)

      // Simulate loading progress
      const progressInterval = setInterval(() => {
        setLoadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + 10
        })
      }, 100)

      // Mock metadata (in real implementation, extract from PDF)
      const mockMetadata: PDFMetadata = {
        title: fileName,
        author: 'Accounting System',
        subject: 'Invoice Document',
        creator: 'PDF Generator',
        producer: 'React PDF',
        creationDate: new Date().toISOString(),
        modificationDate: new Date().toISOString(),
        pageCount: 1,
        fileSize: pdfBlob?.size || 0
      }

      setMetadata(mockMetadata)
      setTotalPages(mockMetadata.pageCount)
      setLoadProgress(100)

    } catch (err: any) {
      setError(err.message || 'Failed to load PDF')
    } finally {
      setIsLoading(false)
    }
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50))
  }

  const handleResetZoom = () => {
    setZoomLevel(100)
  }

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleDownload = () => {
    if (pdfData) {
      const link = document.createElement('a')
      link.href = pdfData
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    onDownload?.()
  }

  const handlePrint = () => {
    if (pdfData) {
      const printWindow = window.open(pdfData)
      printWindow?.print()
    }
    onPrint?.()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const renderPDFViewer = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Loading PDF...</p>
            <Progress value={loadProgress} className="w-64" />
            <p className="text-xs text-muted-foreground">{loadProgress}%</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <Alert variant="destructive" className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={loadPDF} variant="outline">
            Try Again
          </Button>
        </div>
      )
    }

    if (!pdfData) {
      return (
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No PDF to display</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* PDF Viewer Controls */}
        <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center">
              {zoomLevel}%
            </span>
            <Button variant="ghost" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleResetZoom}>
              Reset
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button variant="ghost" size="sm" onClick={handleFullscreen}>
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* PDF Content */}
        <div className={cn(
          'border rounded-lg overflow-hidden bg-white',
          isFullscreen ? 'fixed inset-0 z-50' : 'h-96 md:h-[500px]'
        )}>
          <iframe
            src={pdfData}
            width="100%"
            height="100%"
            title={fileName}
            className="border-0"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top left'
            }}
          />
        </div>
      </div>
    )
  }

  const renderMetadata = () => {
    if (!metadata) return null

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Document Information</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Title:</span>
                <span>{metadata.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Author:</span>
                <span>{metadata.author}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subject:</span>
                <span>{metadata.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Creator:</span>
                <span>{metadata.creator}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">File Properties</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pages:</span>
                <span>{metadata.pageCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">File Size:</span>
                <span>{formatFileSize(metadata.fileSize)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{new Date(metadata.creationDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modified:</span>
                <span>{new Date(metadata.modificationDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className={className}>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-6xl h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {title}
              </DialogTitle>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {metadata && (
                <Badge variant="outline">
                  {metadata.pageCount} page{metadata.pageCount !== 1 ? 's' : ''}
                </Badge>
              )}
              {!isLoading && !error && (
                <Badge variant="outline" className="bg-green-50 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ready
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="preview" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="flex-1 mt-4">
              <ScrollArea className="h-full">
                {renderPDFViewer()}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="details" className="flex-1 mt-4">
              <ScrollArea className="h-full">
                {renderMetadata()}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {fileName}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {onEmail && (
              <Button variant="outline" size="sm" onClick={onEmail}>
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            )}

            {onShare && (
              <Button variant="outline" size="sm" onClick={onShare}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>

            <Button onClick={handleDownload} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}