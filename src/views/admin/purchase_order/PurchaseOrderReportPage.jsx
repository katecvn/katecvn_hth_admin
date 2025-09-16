import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import { dateFormat } from '@/utils/date-format'
import { getPurchaseOrders } from '@/stores/PurchaseOrderSlice'
import { DateRange } from '@/components/custom/DateRange'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const PurchaseOrderReportPage = () => {
  const dispatch = useDispatch()
  const orders = useSelector((s) => s.purchaseOrder.orders) || []
  const loading = useSelector((s) => s.purchaseOrder.loading)
  const [filters, setFilters] = useState({
    mode: 'month',
    dateRange: null,
  })

  useEffect(() => {
    dispatch(getPurchaseOrders(filters))
  }, [dispatch, filters])
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0)

  const columns = [
    { accessorKey: 'id', header: 'STT', cell: ({ row }) => row.index + 1 },
    {
      accessorKey: 'code',
      header: 'Mã đơn mua',
      cell: ({ row }) => row.original.code || `PM${row.original.id}`,
    },
    {
      accessorKey: 'totalAmount',
      header: 'Tổng tiền',
      cell: ({ row }) => formatCurrency(row.original.totalAmount),
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày tạo',
      cell: ({ row }) => dateFormat(row.original.createdAt),
    },
    {
      accessorKey: 'items',
      header: 'Chi tiết sản phẩm',
      cell: ({ row }) =>
        row.original.orderItems
          ?.map((i) => `${i.product?.name} x${i.quantity}`)
          .join(', ') || '-',
    },
  ]

  const totalOrders = orders.length
  const totalAmount = orders.reduce(
    (sum, o) => sum + Number(o.totalAmount || 0),
    0,
  )

  const toolbar = [
    {
      children: (
        <div className="flex gap-2">
          <Select
            value={filters.mode || 'month'}
            onValueChange={(val) =>
              setFilters((f) => ({ ...f, mode: val || 'month' }))
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Chế độ thống kê" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="year">Theo năm</SelectItem>
              <SelectItem value="month">Theo tháng</SelectItem>
              <SelectItem value="range">Khoảng thời gian</SelectItem>
            </SelectContent>
          </Select>

          {filters.mode === 'range' && (
            <DateRange
              onChange={(range) =>
                setFilters((f) => ({ ...f, dateRange: range }))
              }
            />
          )}
        </div>
      ),
    },
  ]

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <h2 className="mb-2 text-2xl font-bold tracking-tight">
          Thống kê đơn mua
        </h2>
        <div className="mb-4 flex gap-6">
          <div className="rounded bg-gray-100 p-3">
            <div className="text-sm text-gray-500">Tổng số đơn</div>
            <div className="text-xl font-bold">{totalOrders}</div>
          </div>
          <div className="rounded bg-gray-100 p-3">
            <div className="text-sm text-gray-500">Tổng giá trị</div>
            <div className="text-xl font-bold">
              {formatCurrency(totalAmount)}
            </div>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1">
          <DataTable
            columns={columns}
            data={orders}
            toolbar={toolbar}
            caption="Chi tiết thống kê"
            searchKey="code"
            searchPlaceholder="Tìm theo mã đơn mua..."
            showGlobalFilter
            enableSorting
            loading={loading}
          />
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default PurchaseOrderReportPage
