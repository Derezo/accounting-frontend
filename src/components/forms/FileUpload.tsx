import { useState, useRef, useCallback, DragEvent } from 'react'
import { Upload, X, File, Image, FileText, Download, Eye, Trash2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFilesChange: (files: File[]) => void
  onFileRemove?: (index: number) => void
  onUploadProgress?: (progress: number) => void
  onUploadComplete?: (urls: string[]) => void
  onUploadError?: (error: string) => void
  maxFiles?: number
  maxFileSize?: number // in bytes
  acceptedFileTypes?: string[]
  allowedExtensions?: string[]
  multiple?: boolean
  disabled?: boolean
  uploadUrl?: string
  existingFiles?: AttachedFile[]
  className?: string
}

interface AttachedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
  uploadedAt?: string
}

interface FileWithPreview extends File {
  preview?: string
}

export function FileUpload({
  onFilesChange,
  onFileRemove,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  acceptedFileTypes = ['image/*', 'application/pdf', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.csv', '.xls', '.xlsx', '.doc', '.docx'],
  multiple = true,
  disabled = false,
  uploadUrl,
  existingFiles = [],
  className
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File "${file.name}" is too large. Maximum size is ${formatFileSize(maxFileSize)}.`
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!allowedExtensions.includes(fileExtension)) {
      return `File type "${fileExtension}" is not allowed. Allowed types: ${allowedExtensions.join(', ')}`
    }

    return null
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (disabled) return

    const validFiles: FileWithPreview[] = []
    const errors: string[] = []

    for (const file of acceptedFiles) {
      const error = validateFile(file)
      if (error) {
        errors.push(error)
        continue
      }

      // Check total file count
      if (files.length + validFiles.length >= maxFiles) {
        errors.push(`Cannot upload more than ${maxFiles} files.`)
        break
      }

      // Add preview for images
      const fileWithPreview = file as FileWithPreview
      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file)
      }

      validFiles.push(fileWithPreview)
    }

    if (errors.length > 0) {
      setUploadError(errors.join(' '))
      onUploadError?.(errors.join(' '))
    } else {
      setUploadError(null)
    }

    if (validFiles.length > 0) {
      const newFiles = multiple ? [...files, ...validFiles] : validFiles
      setFiles(newFiles)
      onFilesChange(newFiles)
    }
  }, [files, maxFiles, maxFileSize, allowedExtensions, multiple, disabled, onFilesChange, onUploadError])

  const [isDragActive, setIsDragActive] = useState(false)

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragActive(true)
    }
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    if (disabled) return

    const droppedFiles = Array.from(e.dataTransfer.files)
    onDrop(droppedFiles)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || disabled) return

    const selectedFiles = Array.from(e.target.files)
    onDrop(selectedFiles)
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onFilesChange(newFiles)
    onFileRemove?.(index)

    // Revoke object URL for images
    const removedFile = files[index]
    if (removedFile.preview) {
      URL.revokeObjectURL(removedFile.preview)
    }
  }

  const removeExistingFile = (fileId: string) => {
    // This would typically call an API to remove the file
    console.log('Remove existing file:', fileId)
  }

  const uploadFiles = async () => {
    if (!uploadUrl || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)
    setUploadError(null)

    try {
      const formData = new FormData()
      files.forEach((file, index) => {
        formData.append(`files[${index}]`, file)
      })

      const xhr = new XMLHttpRequest()

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100
          setUploadProgress(progress)
          onUploadProgress?.(progress)
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          onUploadComplete?.(response.urls || [])
          setFiles([])
          onFilesChange([])
        } else {
          throw new Error(`Upload failed with status ${xhr.status}`)
        }
        setIsUploading(false)
      }

      xhr.onerror = () => {
        const error = 'Upload failed due to network error'
        setUploadError(error)
        onUploadError?.(error)
        setIsUploading(false)
      }

      xhr.open('POST', uploadUrl)
      xhr.send(formData)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setUploadError(errorMessage)
      onUploadError?.(errorMessage)
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string, fileName: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />
    } else if (fileType === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />
    } else if (fileName.endsWith('.csv') || fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
      return <File className="h-8 w-8 text-green-500" />
    } else {
      return <File className="h-8 w-8 text-gray-500" />
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Error */}
      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {/* Drag and Drop Area */}
      <Card className={cn(
        'border-2 border-dashed transition-colors',
        isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
        disabled && 'opacity-50 cursor-not-allowed'
      )}>
        <CardContent className="p-6">
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !disabled && fileInputRef.current?.click()}
            className={cn(
              'text-center cursor-pointer',
              disabled && 'cursor-not-allowed'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple={multiple}
              accept={acceptedFileTypes.join(',')}
              onChange={handleFileSelect}
              className="hidden"
              disabled={disabled}
            />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse files
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Supported formats: {allowedExtensions.join(', ')}</p>
                <p>Maximum file size: {formatFileSize(maxFileSize)}</p>
                <p>Maximum files: {maxFiles}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {isUploading && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading files...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Files List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Selected Files ({files.length})</h3>
                {uploadUrl && (
                  <Button
                    onClick={uploadFiles}
                    disabled={isUploading}
                    size="sm"
                  >
                    {isUploading ? 'Uploading...' : 'Upload Files'}
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-3">
                      {file.preview ? (
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="h-10 w-10 object-cover rounded"
                        />
                      ) : (
                        getFileIcon(file.type, file.name)
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <h3 className="font-medium">Attached Files ({existingFiles.length})</h3>
              <div className="space-y-2">
                {existingFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.type, file.name)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{formatFileSize(file.size)}</span>
                          {file.uploadedAt && (
                            <>
                              <span>•</span>
                              <span>Uploaded {new Date(file.uploadedAt).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Attached
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TooltipProvider>
                        {file.url && (
                          <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(file.url, '_blank')}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View file</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const a = document.createElement('a')
                                    a.href = file.url!
                                    a.download = file.name
                                    a.click()
                                  }}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Download file</TooltipContent>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExistingFile(file.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Remove file</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}