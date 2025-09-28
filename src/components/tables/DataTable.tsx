import { useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PaginationControls, usePagination } from '@/components/navigation/PaginationControls'
import { SearchInput } from '@/components/search/SearchInput'
import { LoadingTable } from '@/components/ui/loading'
import { EmptyStateWithError } from '@/components/error/ErrorDisplay'
import { MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, Download, Filter, Columns } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Column<T> {
  id: string
  header: string
  accessorKey?: keyof T
  cell?: (row: T) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string
  className?: string
  hidden?: boolean
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  title?: string
  description?: string
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
  searchable?: boolean
  searchPlaceholder?: string
  selectable?: boolean
  onSelectionChange?: (selectedRows: T[]) => void
  actions?: {
    label: string
    onClick: (row: T) => void
    icon?: React.ReactNode
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  }[]
  bulkActions?: {
    label: string
    onClick: (selectedRows: T[]) => void
    icon?: React.ReactNode
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  }[]
  exportable?: boolean
  onExport?: (data: T[], format: 'csv' | 'excel' | 'pdf') => void
  defaultSort?: { column: string; direction: 'asc' | 'desc' }
  className?: string
  showPagination?: boolean
  paginationOptions?: {
    showItemsPerPage?: boolean
    showFirstLast?: boolean
    showGoToPage?: boolean
    showTotalInfo?: boolean
    showRefresh?: boolean
    onRefresh?: () => void
    itemsPerPageOptions?: number[]
  }
}

type SortState = {
  column: string
  direction: 'asc' | 'desc'
} | null

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  description,
  isLoading = false,
  error = null,
  onRetry,
  searchable = true,
  searchPlaceholder = 'Search...',
  selectable = false,
  onSelectionChange,
  actions = [],
  bulkActions = [],
  exportable = false,
  onExport,
  defaultSort,
  className,
  showPagination = true,
  paginationOptions = {}
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [sortState, setSortState] = useState<SortState>(defaultSort ? { column: defaultSort.column, direction: defaultSort.direction } : null)
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set(columns.filter(col => col.hidden).map(col => col.id)))

  const pagination = usePagination(1, 20)

  // Filter and search data
  const filteredData = useMemo(() => {
    if (!searchTerm) return data

    const searchLower = searchTerm.toLowerCase()
    return data.filter((row) => {
      return columns.some((column) => {
        if (!column.filterable && column.filterable !== undefined) return false

        const value = column.accessorKey ? row[column.accessorKey] : ''
        return String(value).toLowerCase().includes(searchLower)
      })
    })
  }, [data, searchTerm, columns])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortState) return filteredData

    return [...filteredData].sort((a, b) => {
      const column = columns.find(col => col.id === sortState.column)
      if (!column?.accessorKey) return 0

      const aValue = a[column.accessorKey]
      const bValue = b[column.accessorKey]

      let comparison = 0
      if (aValue < bValue) comparison = -1
      if (aValue > bValue) comparison = 1

      return sortState.direction === 'desc' ? -comparison : comparison
    })
  }, [filteredData, sortState, columns])

  // Paginated data
  const paginatedData = useMemo(() => {
    if (!showPagination) return sortedData

    const offset = pagination.getOffset()
    return sortedData.slice(offset, offset + pagination.itemsPerPage)
  }, [sortedData, pagination.currentPage, pagination.itemsPerPage, showPagination])

  const totalPages = Math.ceil(sortedData.length / pagination.itemsPerPage)

  const handleSort = (columnId: string) => {
    const column = columns.find(col => col.id === columnId)
    if (!column?.sortable) return

    setSortState(prev => {
      if (prev?.column === columnId) {
        return prev.direction === 'asc' ? { column: columnId, direction: 'desc' } : null
      }
      return { column: columnId, direction: 'asc' }
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(paginatedData.map((_, index) => pagination.getOffset() + index)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (index: number, checked: boolean) => {
    const actualIndex = pagination.getOffset() + index
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(actualIndex)
    } else {
      newSelected.delete(actualIndex)
    }
    setSelectedRows(newSelected)
  }

  const getSelectedRowData = () => {
    return Array.from(selectedRows).map(index => sortedData[index]).filter(Boolean)
  }

  const toggleColumnVisibility = (columnId: string) => {
    const newHidden = new Set(hiddenColumns)
    if (newHidden.has(columnId)) {
      newHidden.delete(columnId)
    } else {
      newHidden.add(columnId)
    }
    setHiddenColumns(newHidden)
  }

  const visibleColumns = columns.filter(col => !hiddenColumns.has(col.id))

  // Update selection change callback
  useMemo(() => {
    if (onSelectionChange) {
      onSelectionChange(getSelectedRowData())
    }
  }, [selectedRows, sortedData])

  const getSortIcon = (columnId: string) => {
    if (sortState?.column !== columnId) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortState.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  if (error && !isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <EmptyStateWithError
            title="Failed to load data"
            description="There was an error loading the table data."
            error={error}
            onRetry={onRetry}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {title && <CardTitle>{title}</CardTitle>}
              {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
            <div className="flex items-center space-x-2">
              {/* Column visibility toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Columns className="h-4 w-4 mr-2" />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {columns.map((column) => (
                    <DropdownMenuItem
                      key={column.id}
                      onClick={() => toggleColumnVisibility(column.id)}
                    >
                      <Checkbox
                        checked={!hiddenColumns.has(column.id)}
                        className="mr-2"
                      />
                      {column.header}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Export options */}
              {exportable && onExport && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onExport(sortedData, 'csv')}>
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onExport(sortedData, 'excel')}>
                      Export as Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onExport(sortedData, 'pdf')}>
                      Export as PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search and bulk actions */}
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-sm">
              {searchable && (
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder={searchPlaceholder}
                  size="sm"
                />
              )}
            </div>

            {/* Bulk actions */}
            {selectable && selectedRows.size > 0 && bulkActions.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {selectedRows.size} selected
                </span>
                {bulkActions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || 'outline'}
                    size="sm"
                    onClick={() => action.onClick(getSelectedRowData())}
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Table */}
          {isLoading ? (
            <LoadingTable columns={visibleColumns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)} rows={5} />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {selectable && (
                      <TableHead className="w-12">
                        <Checkbox
                          checked={paginatedData.length > 0 && selectedRows.size === paginatedData.length}
                          indeterminate={selectedRows.size > 0 && selectedRows.size < paginatedData.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                    )}
                    {visibleColumns.map((column) => (
                      <TableHead
                        key={column.id}
                        className={cn(column.className)}
                        style={{ width: column.width }}
                      >
                        {column.sortable ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-3 h-8 data-[state=open]:bg-accent"
                            onClick={() => handleSort(column.id)}
                          >
                            <span>{column.header}</span>
                            {getSortIcon(column.id)}
                          </Button>
                        ) : (
                          column.header
                        )}
                      </TableHead>
                    ))}
                    {actions.length > 0 && (
                      <TableHead className="w-12">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={visibleColumns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)} className="h-24 text-center">
                        No results found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row, index) => {
                      const actualIndex = pagination.getOffset() + index
                      return (
                        <TableRow key={actualIndex}>
                          {selectable && (
                            <TableCell>
                              <Checkbox
                                checked={selectedRows.has(actualIndex)}
                                onCheckedChange={(checked) => handleSelectRow(index, checked as boolean)}
                              />
                            </TableCell>
                          )}
                          {visibleColumns.map((column) => (
                            <TableCell key={column.id} className={cn(column.className)}>
                              {column.cell ? column.cell(row) : (column.accessorKey ? String(row[column.accessorKey] || '') : '')}
                            </TableCell>
                          ))}
                          {actions.length > 0 && (
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {actions.map((action, actionIndex) => (
                                    <DropdownMenuItem
                                      key={actionIndex}
                                      onClick={() => action.onClick(row)}
                                    >
                                      {action.icon}
                                      {action.label}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          )}
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {showPagination && !isLoading && sortedData.length > 0 && (
            <PaginationControls
              currentPage={pagination.currentPage}
              totalPages={totalPages}
              totalItems={sortedData.length}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={pagination.handlePageChange}
              onItemsPerPageChange={pagination.handleItemsPerPageChange}
              isLoading={isLoading}
              {...paginationOptions}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}