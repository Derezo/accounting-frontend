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
import { ResponsiveContainer, ResponsiveShow } from '@/components/layout/ResponsiveContainer'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, Download, Filter, Columns, Eye, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ResponsiveColumn<T> {
  id: string
  header: string
  accessorKey?: keyof T
  cell?: (row: T) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string
  className?: string
  hidden?: boolean
  priority?: 'high' | 'medium' | 'low' // Used for mobile column prioritization
  mobileLabel?: string // Custom label for mobile stacked view
}

export interface ResponsiveDataTableProps<T> {
  data: T[]
  columns: ResponsiveColumn<T>[]
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
  mobileViewType?: 'horizontal-scroll' | 'stacked' | 'auto' // auto chooses based on column count
  stackedCardRenderer?: (row: T, index: number) => React.ReactNode // Custom card renderer for stacked view
}

type SortState = {
  column: string
  direction: 'asc' | 'desc'
} | null

// Mobile stacked card component
function MobileStackedCard<T>({
  row,
  columns,
  actions,
  selectable,
  isSelected,
  onSelect,
  index
}: {
  row: T
  columns: ResponsiveColumn<T>[]
  actions: any[]
  selectable: boolean
  isSelected: boolean
  onSelect: (checked: boolean) => void
  index: number
}) {
  const priorityColumns = columns
    .filter(col => !col.hidden && col.priority === 'high')
    .slice(0, 3) // Limit to 3 high priority columns

  const otherColumns = columns
    .filter(col => !col.hidden && col.priority !== 'high')
    .slice(0, 4) // Limit other columns

  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with selection and actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {selectable && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={onSelect}
                />
              )}
              <Badge variant="outline" className="text-xs">
                #{index + 1}
              </Badge>
            </div>
            {actions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
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
            )}
          </div>

          {/* Priority columns - prominent display */}
          {priorityColumns.length > 0 && (
            <div className="space-y-2">
              {priorityColumns.map((column) => (
                <div key={column.id}>
                  <div className="text-sm font-medium">
                    {column.mobileLabel || column.header}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {column.cell ? column.cell(row) : (column.accessorKey ? String(row[column.accessorKey] || '') : '')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Other columns - compact display */}
          {otherColumns.length > 0 && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              {otherColumns.map((column) => (
                <div key={column.id} className="flex justify-between">
                  <span className="text-muted-foreground truncate mr-2">
                    {column.mobileLabel || column.header}:
                  </span>
                  <span className="font-medium truncate">
                    {column.cell ? column.cell(row) : (column.accessorKey ? String(row[column.accessorKey] || '') : '')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function ResponsiveDataTable<T extends Record<string, any>>({
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
  paginationOptions = {},
  mobileViewType = 'auto',
  stackedCardRenderer
}: ResponsiveDataTableProps<T>) {
  const { isMobile, isTablet } = useBreakpoint()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [sortState, setSortState] = useState<SortState>(defaultSort ? { column: defaultSort.column, direction: defaultSort.direction } : null)
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set(columns.filter(col => col.hidden).map(col => col.id)))

  const pagination = usePagination(1, isMobile ? 10 : 20)

  // Determine view type
  const actualViewType = useMemo(() => {
    if (mobileViewType === 'auto') {
      // Auto-choose based on screen size and column count
      if (isMobile && columns.length > 4) return 'stacked'
      if (isMobile && columns.length <= 4) return 'horizontal-scroll'
      return 'horizontal-scroll'
    }
    return mobileViewType
  }, [mobileViewType, isMobile, columns.length])

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

  // For mobile table view, prioritize essential columns
  const mobileTableColumns = useMemo(() => {
    if (!isMobile) return visibleColumns

    // Show high priority columns first, then fill remaining space
    const highPriority = visibleColumns.filter(col => col.priority === 'high')
    const others = visibleColumns.filter(col => col.priority !== 'high')

    // Limit to 3-4 columns on mobile
    return [...highPriority, ...others].slice(0, 3)
  }, [visibleColumns, isMobile])

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
    <ResponsiveContainer maxWidth="full" padding={isMobile ? 'sm' : 'md'}>
      <Card className={className}>
        {(title || description) && (
          <CardHeader className={isMobile ? 'p-4 pb-0' : ''}>
            <div className={`${isMobile ? 'space-y-3' : 'flex items-center justify-between'}`}>
              <div>
                {title && <CardTitle className={isMobile ? 'text-lg' : 'text-xl'}>{title}</CardTitle>}
                {description && <p className={`text-muted-foreground mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>{description}</p>}
              </div>

              {/* Desktop controls */}
              <ResponsiveShow on={['desktop']}>
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
              </ResponsiveShow>

              {/* Mobile controls */}
              <ResponsiveShow on={['mobile', 'tablet']}>
                <div className="flex items-center justify-end space-x-2">
                  {exportable && onExport && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onExport(sortedData, 'csv')}>
                          CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onExport(sortedData, 'excel')}>
                          Excel
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onExport(sortedData, 'pdf')}>
                          PDF
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
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
                </div>
              </ResponsiveShow>
            </div>
          </CardHeader>
        )}

        <CardContent className={isMobile ? 'p-4 pt-2' : 'p-6'}>
          <div className="space-y-4">
            {/* Search and bulk actions */}
            <div className={`${isMobile ? 'space-y-3' : 'flex items-center justify-between'}`}>
              <div className={isMobile ? 'w-full' : 'flex-1 max-w-sm'}>
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
                <div className={`flex items-center space-x-2 ${isMobile ? 'flex-wrap gap-2' : ''}`}>
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
                      <span className={isMobile ? 'ml-1' : 'ml-2'}>{action.label}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Table or Stacked View */}
            {isLoading ? (
              <LoadingTable columns={(actualViewType === 'stacked' ? 1 : mobileTableColumns.length) + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)} rows={5} />
            ) : actualViewType === 'stacked' ? (
              /* Stacked mobile view */
              <div className="space-y-3">
                {paginatedData.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">No results found.</p>
                    </CardContent>
                  </Card>
                ) : (
                  paginatedData.map((row, index) => {
                    const actualIndex = pagination.getOffset() + index

                    if (stackedCardRenderer) {
                      return stackedCardRenderer(row, actualIndex)
                    }

                    return (
                      <MobileStackedCard
                        key={actualIndex}
                        row={row}
                        columns={columns}
                        actions={actions}
                        selectable={selectable}
                        isSelected={selectedRows.has(actualIndex)}
                        onSelect={(checked) => handleSelectRow(index, checked)}
                        index={actualIndex}
                      />
                    )
                  })
                )}
              </div>
            ) : (
              /* Table view with horizontal scroll on mobile */
              <div className={`rounded-md border ${isMobile ? 'overflow-x-auto' : ''}`}>
                <Table className={isMobile ? 'min-w-[600px]' : ''}>
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
                      {mobileTableColumns.map((column) => (
                        <TableHead
                          key={column.id}
                          className={cn(column.className, isMobile && 'px-2')}
                          style={{ width: column.width }}
                        >
                          {column.sortable ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`-ml-3 h-8 data-[state=open]:bg-accent ${isMobile ? 'text-xs p-1' : ''}`}
                              onClick={() => handleSort(column.id)}
                            >
                              <span className={isMobile ? 'text-xs' : ''}>{column.header}</span>
                              {getSortIcon(column.id)}
                            </Button>
                          ) : (
                            <span className={isMobile ? 'text-xs' : ''}>{column.header}</span>
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
                        <TableCell colSpan={mobileTableColumns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)} className="h-24 text-center">
                          No results found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedData.map((row, index) => {
                        const actualIndex = pagination.getOffset() + index
                        return (
                          <TableRow key={actualIndex}>
                            {selectable && (
                              <TableCell className={isMobile ? 'px-2' : ''}>
                                <Checkbox
                                  checked={selectedRows.has(actualIndex)}
                                  onCheckedChange={(checked) => handleSelectRow(index, checked as boolean)}
                                />
                              </TableCell>
                            )}
                            {mobileTableColumns.map((column) => (
                              <TableCell key={column.id} className={cn(column.className, isMobile && 'px-2 text-xs')}>
                                {column.cell ? column.cell(row) : (column.accessorKey ? String(row[column.accessorKey] || '') : '')}
                              </TableCell>
                            ))}
                            {actions.length > 0 && (
                              <TableCell className={isMobile ? 'px-2' : ''}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className={`p-0 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`}>
                                      <span className="sr-only">Open menu</span>
                                      <MoreHorizontal className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
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
    </ResponsiveContainer>
  )
}