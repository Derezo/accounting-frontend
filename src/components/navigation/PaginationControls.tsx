import { useState } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronFirst, ChevronLast, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (itemsPerPage: number) => void
  showItemsPerPage?: boolean
  showFirstLast?: boolean
  showGoToPage?: boolean
  showTotalInfo?: boolean
  showRefresh?: boolean
  onRefresh?: () => void
  isLoading?: boolean
  className?: string
  itemsPerPageOptions?: number[]
  maxVisiblePages?: number
}

export function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  showFirstLast = true,
  showGoToPage = true,
  showTotalInfo = true,
  showRefresh = false,
  onRefresh,
  isLoading = false,
  className,
  itemsPerPageOptions = [10, 20, 50, 100],
  maxVisiblePages = 7
}: PaginationControlsProps) {
  const [goToPageValue, setGoToPageValue] = useState('')

  const handleGoToPage = () => {
    const pageNumber = parseInt(goToPageValue)
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber)
      setGoToPageValue('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGoToPage()
    }
  }

  // Generate page numbers to display
  const generatePageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage <= 4) {
        // Near the beginning
        for (let i = 2; i <= Math.min(5, totalPages - 1); i++) {
          pages.push(i)
        }
        if (totalPages > 5) {
          pages.push('ellipsis')
        }
      } else if (currentPage >= totalPages - 3) {
        // Near the end
        if (totalPages > 5) {
          pages.push('ellipsis')
        }
        for (let i = Math.max(totalPages - 4, 2); i < totalPages; i++) {
          pages.push(i)
        }
      } else {
        // In the middle
        pages.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
      }

      // Always show last page (if not already included)
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = generatePageNumbers()
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Top controls */}
      <div className="flex items-center justify-between">
        {showTotalInfo && (
          <div className="text-sm text-muted-foreground">
            Showing {startItem}-{endItem} of {totalItems} items
          </div>
        )}

        <div className="flex items-center space-x-4">
          {/* Items per page selector */}
          {showItemsPerPage && onItemsPerPageChange && (
            <div className="flex items-center space-x-2">
              <Label htmlFor="items-per-page" className="text-sm whitespace-nowrap">
                Items per page:
              </Label>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
                disabled={isLoading}
              >
                <SelectTrigger id="items-per-page" className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {itemsPerPageOptions.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Go to page */}
          {showGoToPage && totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <Label htmlFor="go-to-page" className="text-sm whitespace-nowrap">
                Go to page:
              </Label>
              <Input
                id="go-to-page"
                type="number"
                min="1"
                max={totalPages}
                value={goToPageValue}
                onChange={(e) => setGoToPageValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-20"
                placeholder="Page"
                disabled={isLoading}
              />
              <Button
                onClick={handleGoToPage}
                disabled={!goToPageValue || isLoading}
                size="sm"
              >
                Go
              </Button>
            </div>
          )}

          {/* Refresh button */}
          {showRefresh && onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="gap-2"
            >
              <RotateCcw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Pagination navigation */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {/* First page button */}
            {showFirstLast && (
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onPageChange(1)}
                  disabled={currentPage === 1 || isLoading}
                  aria-label="Go to first page"
                >
                  <ChevronFirst className="h-4 w-4" />
                </Button>
              </PaginationItem>
            )}

            {/* Previous page */}
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                className={cn(
                  currentPage === 1 || isLoading
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                )}
              />
            </PaginationItem>

            {/* Page numbers */}
            {pageNumbers.map((page, index) => (
              <PaginationItem key={index}>
                {page === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={() => onPageChange(page)}
                    isActive={currentPage === page}
                    className={cn(
                      isLoading && 'pointer-events-none opacity-50',
                      'cursor-pointer'
                    )}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            {/* Next page */}
            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                className={cn(
                  currentPage === totalPages || isLoading
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                )}
              />
            </PaginationItem>

            {/* Last page button */}
            {showFirstLast && (
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onPageChange(totalPages)}
                  disabled={currentPage === totalPages || isLoading}
                  aria-label="Go to last page"
                >
                  <ChevronLast className="h-4 w-4" />
                </Button>
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}

      {/* Page info for screen readers */}
      <div className="sr-only" aria-live="polite">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  )
}

// Simplified pagination for smaller spaces
interface SimplePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  className?: string
}

export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  className
}: SimplePaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1 || isLoading}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <span className="text-sm text-muted-foreground px-2">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages || isLoading}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Hook for managing pagination state
export function usePagination(initialPage = 1, initialItemsPerPage = 20) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    // Reset to first page when changing items per page
    setCurrentPage(1)
  }

  const getOffset = () => (currentPage - 1) * itemsPerPage
  const getLimit = () => itemsPerPage

  const reset = () => {
    setCurrentPage(1)
  }

  return {
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    getOffset,
    getLimit,
    reset
  }
}