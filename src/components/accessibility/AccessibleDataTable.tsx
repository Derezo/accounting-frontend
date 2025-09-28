import React, { useState, useRef, useEffect, ReactNode } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScreenReaderOnly, LoadingAnnouncement } from './ScreenReaderUtils'
import { useAccessibility } from './AccessibilityProvider'
import { KeyboardNavigation, RovingTabIndex } from './KeyboardNavigation'
import { cn } from '@/lib/utils'
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'

interface AccessibleColumn<T> {
  id: string
  header: string
  accessorKey?: keyof T
  cell?: (row: T) => ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string
  minWidth?: string
  description?: string
  dataType?: 'text' | 'number' | 'date' | 'currency' | 'boolean'
}

interface AccessibleDataTableProps<T> {
  data: T[]
  columns: AccessibleColumn<T>[]
  caption?: string
  summary?: string
  isLoading?: boolean
  error?: Error | null
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  searchable?: boolean
  filterable?: boolean
  paginated?: boolean
  itemsPerPage?: number
  currentPage?: number
  totalItems?: number
  onPageChange?: (page: number) => void
  className?: string
  announceChanges?: boolean
  rowKeyField?: keyof T
}

export function AccessibleDataTable<T extends Record<string, any>>({
  data,
  columns,
  caption,
  summary,
  isLoading = false,
  error = null,
  sortBy,
  sortDirection,
  onSort,
  searchable = false,
  filterable = false,
  paginated = false,
  itemsPerPage = 10,
  currentPage = 1,
  totalItems,
  onPageChange,
  className,
  announceChanges = true,
  rowKeyField = 'id' as keyof T
}: AccessibleDataTableProps<T>) {
  const { announceMessage } = useAccessibility()
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const tableRef = useRef<HTMLTableElement>(null)
  const captionId = `table-caption-${React.useId()}`
  const generatedSummaryId = React.useId()
  const summaryId = summary ? `table-summary-${generatedSummaryId}` : undefined

  const totalPages = totalItems ? Math.ceil(totalItems / itemsPerPage) : Math.ceil(data.length / itemsPerPage)

  useEffect(() => {
    if (announceChanges && !isLoading) {
      const rowCount = data.length
      const totalText = totalItems ? ` of ${totalItems} total` : ''
      announceMessage(
        `Table updated. Showing ${rowCount} rows${totalText}${currentPage > 1 ? `, page ${currentPage}` : ''}`,
        'polite'
      )
    }
  }, [data.length, currentPage, totalItems, announceChanges, announceMessage, isLoading])

  const handleSort = (columnId: string) => {
    if (!onSort) return

    const column = columns.find(col => col.id === columnId)
    if (!column?.sortable) return

    const newDirection = sortBy === columnId && sortDirection === 'asc' ? 'desc' : 'asc'
    onSort(columnId, newDirection)

    if (announceChanges) {
      announceMessage(
        `Table sorted by ${column.header}, ${newDirection === 'asc' ? 'ascending' : 'descending'}`,
        'polite'
      )
    }
  }

  const getSortIcon = (columnId: string) => {
    if (sortBy !== columnId) {
      return <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
    }
    return sortDirection === 'asc' ?
      <ArrowUp className="h-4 w-4" aria-hidden="true" /> :
      <ArrowDown className="h-4 w-4" aria-hidden="true" />
  }

  const getSortAriaLabel = (column: AccessibleColumn<T>) => {
    if (!column.sortable) return undefined

    if (sortBy === column.id) {
      const currentDirection = sortDirection === 'asc' ? 'ascending' : 'descending'
      const nextDirection = sortDirection === 'asc' ? 'descending' : 'ascending'
      return `${column.header}, currently sorted ${currentDirection}, click to sort ${nextDirection}`
    }

    return `Sort by ${column.header}`
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (announceChanges) {
      announceMessage(`Search updated: ${term || 'search cleared'}`, 'polite')
    }
  }

  const handlePageChange = (page: number) => {
    if (onPageChange && page >= 1 && page <= totalPages) {
      onPageChange(page)
      if (announceChanges) {
        announceMessage(`Navigated to page ${page} of ${totalPages}`, 'polite')
      }
    }
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Error Loading Data</CardTitle>
          <CardDescription>
            There was an error loading the table data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error.message}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Filters */}
      {(searchable || filterable) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Table Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {searchable && (
              <div className="space-y-2">
                <Label htmlFor="table-search" className="sr-only">
                  Search table data
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="table-search"
                    type="search"
                    placeholder="Search table data..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                    aria-describedby="search-description"
                  />
                </div>
                <ScreenReaderOnly>
                  <div id="search-description">
                    Search will filter rows based on all visible columns
                  </div>
                </ScreenReaderOnly>
              </div>
            )}

            {filterable && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {columns.filter(col => col.filterable).map((column) => (
                  <div key={column.id} className="space-y-2">
                    <Label htmlFor={`filter-${column.id}`}>
                      Filter by {column.header}
                    </Label>
                    <Select
                      value={filters[column.id] || ''}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, [column.id]: value }))}
                    >
                      <SelectTrigger id={`filter-${column.id}`}>
                        <SelectValue placeholder={`All ${column.header}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All {column.header}</SelectItem>
                        {/* Add dynamic filter options based on data */}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table
              ref={tableRef}
              aria-labelledby={caption ? captionId : undefined}
              aria-describedby={summaryId}
              className="relative"
            >
              {caption && (
                <caption id={captionId} className="sr-only">
                  {caption}
                </caption>
              )}

              <TableHeader>
                <TableRow role="row">
                  {columns.map((column, index) => (
                    <TableHead
                      key={column.id}
                      style={{
                        width: column.width,
                        minWidth: column.minWidth
                      }}
                      scope="col"
                      aria-sort={
                        sortBy === column.id
                          ? sortDirection === 'asc' ? 'ascending' : 'descending'
                          : column.sortable ? 'none' : undefined
                      }
                    >
                      {column.sortable ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-3 h-8 data-[state=open]:bg-accent justify-start"
                          onClick={() => handleSort(column.id)}
                          aria-label={getSortAriaLabel(column)}
                        >
                          <span>{column.header}</span>
                          {getSortIcon(column.id)}
                        </Button>
                      ) : (
                        <div className="flex items-center">
                          <span>{column.header}</span>
                          {column.description && (
                            <ScreenReaderOnly>
                              , {column.description}
                            </ScreenReaderOnly>
                          )}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                        <span>Loading data...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <p className="text-muted-foreground">No data available</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, rowIndex) => (
                    <TableRow
                      key={row[rowKeyField] || rowIndex}
                      role="row"
                    >
                      {columns.map((column, colIndex) => (
                        <TableCell
                          key={column.id}
                          role="gridcell"
                          aria-describedby={`col-${column.id}-desc`}
                        >
                          {column.cell
                            ? column.cell(row)
                            : column.accessorKey
                              ? String(row[column.accessorKey] || '')
                              : ''
                          }
                          <ScreenReaderOnly>
                            <div id={`col-${column.id}-desc`}>
                              {column.description}
                            </div>
                          </ScreenReaderOnly>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {summary && (
            <ScreenReaderOnly>
              <div id={summaryId}>
                {summary}
              </div>
            </ScreenReaderOnly>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <AccessiblePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems || data.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          announceChanges={announceChanges}
        />
      )}

      <LoadingAnnouncement
        isLoading={isLoading}
        loadingMessage="Loading table data"
        completeMessage="Table data loaded"
      />
    </div>
  )
}

interface AccessiblePaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  announceChanges?: boolean
  className?: string
}

export function AccessiblePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  announceChanges = true,
  className
}: AccessiblePaginationProps) {
  const { announceMessage } = useAccessibility()

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const getPageNumbers = () => {
    const pages = []
    const showEllipsis = totalPages > 7

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 4) {
        pages.push('ellipsis-start')
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 3) {
        pages.push('ellipsis-end')
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page)
      if (announceChanges) {
        announceMessage(
          `Page ${page} of ${totalPages}. Showing items ${(page - 1) * itemsPerPage + 1} to ${Math.min(page * itemsPerPage, totalItems)} of ${totalItems}`,
          'polite'
        )
      }
    }
  }

  return (
    <nav
      className={cn('flex items-center justify-between', className)}
      aria-label="Table pagination"
      role="navigation"
    >
      <div className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {totalItems} results
      </div>

      <RovingTabIndex orientation="horizontal" className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous</span>
        </Button>

        {getPageNumbers().map((page, index) => {
          if (typeof page === 'string') {
            return (
              <span key={page} className="px-2 py-1 text-sm text-muted-foreground">
                ...
              </span>
            )
          }

          return (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePageChange(page)}
              aria-label={currentPage === page ? `Current page, page ${page}` : `Page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </Button>
          )
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next</span>
        </Button>
      </RovingTabIndex>
    </nav>
  )
}