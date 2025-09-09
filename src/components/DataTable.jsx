import * as React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getFacetedUniqueValues,
} from '@tanstack/react-table'
import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { Skeleton } from '@/components/ui/skeleton'

// Import from @radix-ui/react-icons
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
  EyeNoneIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'

// Import UI components
import { Button } from '@/components/custom/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
  TableCaption,
} from './ui/table'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { IconX } from '@tabler/icons-react'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'

// Column Header Component

const DataTableColumnHeader = ({ column, title, className }) => {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span className="text-sm">{title}</span>
            {column.getIsSorted() === 'desc' ? (
              <ArrowDownIcon className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'asc' ? (
              <ArrowUpIcon className="ml-2 h-4 w-4" />
            ) : (
              <CaretSortIcon className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Tăng dần
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Giảm dần
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeNoneIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Ẩn đi
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// Pagination Component
const DataTablePagination = ({
  table,
  pageSizeOptions = [30, 50, 100, 250, 500],
}) => {
  return (
    <div className="flex items-center justify-between overflow-auto px-2">
      <div className="hidden flex-1 text-sm text-muted-foreground sm:block">
        {table.getFilteredRowModel().rows.length} hàng
      </div>
      <div className="flex items-center sm:space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="hidden text-sm font-medium sm:block">
            Hàng trên mỗi trang
          </p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Trang {table.getState().pagination.pageIndex + 1} trong{' '}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Main DataTable Component
export function DataTable({
  columns,
  data,
  caption,
  searchKey,
  searchPlaceholder = 'Tìm kiếm...',
  pageSizeOptions = [30, 50, 100, 250, 500],
  showPagination = true,
  showColumnFilters = false,
  showGlobalFilter = false,
  enableSorting = true,
  enableMultiSort = false,
  enableColumnVisibility = true,
  manualPagination = false,
  pageCount,
  onPaginationChange,
  className,
  tableClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
  rowClassName,
  cellClassName,
  paginationClassName,
  filterClassName,
  loading = false,
  toolbar,
}) {
  const [sorting, setSorting] = React.useState([])
  const [columnFilters, setColumnFilters] = React.useState([])
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: pageSizeOptions[0],
  })
  const isFiltered =
    (columnFilters && columnFilters.length > 0) ||
    (globalFilter && globalFilter !== '')

  React.useEffect(() => {
    if (onPaginationChange) {
      onPaginationChange(pagination)
    }
  }, [pagination, onPaginationChange])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel:
      showPagination && !manualPagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel:
      showColumnFilters || showGlobalFilter ? getFilteredRowModel() : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getFacetedUniqueValues: getFacetedUniqueValues(),
    enableMultiSort,
    enableSorting,
    enableColumnVisibility,
    manualPagination,
    pageCount: manualPagination ? pageCount : undefined,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      pagination,
    },
  })
  const options = table
    .getAllColumns()
    .filter(
      (column) =>
        typeof column.accessorFn !== 'undefined' && column.getCanHide(),
    )
    .reduce((acc, column) => {
      acc[column.id] = column.columnDef.header || column.id
      return acc
    }, {})
  return (
    <div className={`${className}`}>
      {/* Filters */}
      {(showGlobalFilter || showColumnFilters) && (
        <div
          className={`mb-4 flex items-center gap-4 ${filterClassName} justify-between overflow-scroll`}
        >
          <div className="flex gap-2">
            {showGlobalFilter && (
              <Input
                placeholder="Tìm kiếm..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="h-auto min-w-[150px] lg:w-80"
              />
            )}
            {showColumnFilters && (
              <div className="flex gap-x-2">
                {columns.map((column, idx) => {
                  const key = column.id ?? column.accessorKey ?? idx
                  const col = table.getColumn(column.accessorKey || column.id)
                  if (!col) return null

                  if (
                    column.meta?.filterType === 'multiselect' &&
                    column.meta.options
                  ) {
                    return (
                      <DataTableFacetedFilter
                        key={key}
                        column={col}
                        title={column.meta.placeholder}
                        options={column.meta.options}
                      />
                    )
                  }

                  // Filter dạng select (single)
                  if (
                    column.meta?.filterType === 'select' &&
                    column.meta.options
                  ) {
                    return (
                      <Select
                        key={key}
                        value={col.getFilterValue() ?? '__all__'}
                        onValueChange={(value) => col.setFilterValue(value)}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder={column.meta.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {column.meta.options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )
                  }

                  // Filter dạng input
                  if (column.meta?.filterType === 'input') {
                    return (
                      <input
                        key={key}
                        type="text"
                        className="input h-8 w-[150px] rounded border px-2 text-sm"
                        placeholder={column.meta.placeholder}
                        value={col.getFilterValue() ?? ''}
                        onChange={(e) => col.setFilterValue(e.target.value)}
                      />
                    )
                  }
                  return null
                })}
                {isFiltered && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => {
                      setColumnFilters([])
                      setGlobalFilter('')
                    }}
                  >
                    Đặt lại <IconX size={14} />
                  </Button>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end">
            {toolbar.map((item, index) => (
              <React.Fragment key={index}>{item.children}</React.Fragment>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto h-8 lg:flex"
                >
                  <MixerHorizontalIcon className="mr-2 h-4 w-4" />
                  Xem
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[150px]">
                <DropdownMenuLabel>Chuyển đổi cột</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.keys(options).map((columnId) => (
                  <DropdownMenuCheckboxItem
                    key={columnId}
                    className="capitalize"
                    checked={table.getColumn(columnId)?.getIsVisible()}
                    onCheckedChange={(value) =>
                      table.getColumn(columnId)?.toggleVisibility(!!value)
                    }
                  >
                    {options[columnId]}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table className={tableClassName}>
          {caption && <TableCaption>{caption}</TableCaption>}
          <TableHeader className={headerClassName}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <DataTableColumnHeader
                        column={header.column}
                        title={flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        className={headerClassName}
                      />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className={bodyClassName}>
            {loading ? (
              <>
                {Array.from({ length: 10 }).map((_, index) => (
                  <TableRow key={index}>
                    {columns.map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        <Skeleton className="h-[20px] w-full rounded-md" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={rowClassName}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cellClassName}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {table.getFooterGroups().length > 0 && (
            <TableFooter className={footerClassName}>
              {table.getFooterGroups().map((footerGroup) => (
                <TableRow key={footerGroup.id}>
                  {footerGroup.headers.map((header) => (
                    <TableCell key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.footer,
                            header.getContext(),
                          )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableFooter>
          )}
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className={`mt-4 ${paginationClassName}`}>
          <DataTablePagination
            table={table}
            pageSizeOptions={pageSizeOptions}
          />
        </div>
      )}
    </div>
  )
}

// Export components for separate usage if needed
// export { DataTableColumnHeader, DataTablePagination };
