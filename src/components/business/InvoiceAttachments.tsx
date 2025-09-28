import { useState } from 'react'
import { FileUpload } from '@/components/forms/FileUpload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Paperclip, Upload, Download, FileText, Info } from 'lucide-react'
import { useLoadingState } from '@/hooks/useLoadingStates'
import { PermissionGuard } from '@/components/auth/PermissionGuard'
import { cn } from '@/lib/utils'

interface InvoiceAttachment {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  uploadedAt: string
  uploadedBy: string
  url?: string
  description?: string
}

interface InvoiceAttachmentsProps {
  invoiceId: string
  attachments: InvoiceAttachment[]
  onAttachmentsChange?: (attachments: InvoiceAttachment[]) => void
  readOnly?: boolean
  className?: string
}

export function InvoiceAttachments({
  invoiceId,
  attachments,
  onAttachmentsChange,
  readOnly = false,
  className
}: InvoiceAttachmentsProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const loadingState = useLoadingState()

  const handleFilesChange = (files: File[]) => {
    setSelectedFiles(files)
    setUploadError(null)
  }

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return

    try {
      loadingState.startLoading({
        showProgress: true,
        estimatedDuration: 5000,
        progressMessage: 'Uploading attachments...'
      })

      // Simulate upload - replace with actual API call
      const formData = new FormData()
      selectedFiles.forEach((file, index) => {
        formData.append(`files[${index}]`, file)
      })
      formData.append('invoiceId', invoiceId)

      // Example API call:
      // const response = await fetch('/api/invoices/${invoiceId}/attachments', {
      //   method: 'POST',
      //   body: formData
      // })

      // Simulate successful upload
      await new Promise(resolve => setTimeout(resolve, 2000))

      const newAttachments: InvoiceAttachment[] = selectedFiles.map((file, index) => ({
        id: `temp-${Date.now()}-${index}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Current User', // Replace with actual user
        description: `Attached to invoice ${invoiceId}`
      }))

      const updatedAttachments = [...attachments, ...newAttachments]
      onAttachmentsChange?.(updatedAttachments)

      setSelectedFiles([])
      loadingState.stopLoading({
        success: true,
        message: `Successfully uploaded ${selectedFiles.length} file(s)`
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setUploadError(errorMessage)
      loadingState.stopLoading({ success: false })
    }
  }

  const removeAttachment = async (attachmentId: string) => {
    try {
      // API call to remove attachment
      // await fetch(`/api/invoices/${invoiceId}/attachments/${attachmentId}`, {
      //   method: 'DELETE'
      // })

      const updatedAttachments = attachments.filter(attachment => attachment.id !== attachmentId)
      onAttachmentsChange?.(updatedAttachments)
    } catch (error) {
      console.error('Failed to remove attachment:', error)
    }
  }

  const downloadAttachment = (attachment: InvoiceAttachment) => {
    if (attachment.url) {
      const link = document.createElement('a')
      link.href = attachment.url
      link.download = attachment.fileName
      link.click()
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return '🖼️'
    } else if (fileType === 'application/pdf') {
      return '📄'
    } else if (fileType.includes('spreadsheet') || fileType.includes('csv')) {
      return '📊'
    } else if (fileType.includes('document')) {
      return '📝'
    } else {
      return '📎'
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Upload Section */}
      <PermissionGuard resource="invoices" action="write" hideWhenNoAccess={readOnly}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Paperclip className="h-5 w-5 mr-2" />
              Upload Attachments
            </CardTitle>
            <CardDescription>
              Attach supporting documents to this invoice (receipts, contracts, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadError && (
              <Alert variant="destructive">
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            <FileUpload
              onFilesChange={handleFilesChange}
              maxFiles={10}
              maxFileSize={10 * 1024 * 1024} // 10MB
              acceptedFileTypes={[
                'image/*',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/csv'
              ]}
              allowedExtensions={['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv']}
              disabled={loadingState.isLoading}
            />

            {selectedFiles.length > 0 && (
              <div className="flex justify-end">
                <Button onClick={uploadFiles} disabled={loadingState.isLoading}>
                  <Upload className="h-4 w-4 mr-2" />
                  {loadingState.isLoading ? loadingState.message : `Upload ${selectedFiles.length} file(s)`}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </PermissionGuard>

      {/* Existing Attachments */}
      {attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Attachments ({attachments.length})
              </span>
              <Badge variant="secondary" className="text-xs">
                {attachments.reduce((total, attachment) => total + attachment.fileSize, 0) > 0 &&
                  formatFileSize(attachments.reduce((total, attachment) => total + attachment.fileSize, 0))
                }
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="text-2xl">
                      {getFileTypeIcon(attachment.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{attachment.fileName}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{formatFileSize(attachment.fileSize)}</span>
                        <span>•</span>
                        <span>Uploaded {new Date(attachment.uploadedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{attachment.uploadedBy}</span>
                      </div>
                      {attachment.description && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {attachment.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {attachment.url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadAttachment(attachment)}
                        title="Download attachment"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}

                    <PermissionGuard resource="invoices" action="write" hideWhenNoAccess>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(attachment.id)}
                        title="Remove attachment"
                        className="text-destructive hover:text-destructive"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                    </PermissionGuard>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Information */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Attachment Guidelines:</strong>
          <ul className="mt-2 text-sm space-y-1">
            <li>• Supported formats: PDF, Images (JPG, PNG), Office documents, CSV</li>
            <li>• Maximum file size: 10MB per file</li>
            <li>• Maximum files: 10 per invoice</li>
            <li>• Attachments are stored securely and accessible to authorized users only</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}