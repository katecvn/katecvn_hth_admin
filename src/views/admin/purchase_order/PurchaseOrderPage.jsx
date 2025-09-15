// src/views/admin/purchase_order/PurchaseOrderPage.jsx
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import { dateFormat } from '@/utils/date-format'
import Can from '@/utils/can'
import { Button } from '@/components/ui/button'
import { Eye, Trash } from 'lucide-react'
import {
  getPurchaseOrders,
  getPurchaseOrderDetail,
  deleteExistingPurchaseOrder,
} from '@/stores/PurchaseOrderSlice'
import PurchaseOrderDetailDialog from './PurchaseOrderDetailDialog'
import { ConfirmDialog } from '@/components/ComfirmDialog'

const PurchaseOrderPage = () => {
  const dispatch = useDispatch()
  const orders = useSelector((s) => s.purchaseOrder.orders) || []
  const orderDetail = useSelector((s) => s.purchaseOrder.order)
  const loading = useSelector((s) => s.purchaseOrder.loading)
  const [showDetail, setShowDetail] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [itemChoice, setItemChoice] = useState({})

  useEffect(() => {
    document.title = 'Đơn mua'
    dispatch(getPurchaseOrders())
  }, [dispatch])

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0)

  const handleShowDetail = async (id) => {
    await dispatch(getPurchaseOrderDetail(id)).unwrap()
    setShowDetail(true)
  }

  const handleDelete = async (id) => {
    await dispatch(deleteExistingPurchaseOrder(id)).unwrap()
  }

  const columns = [
    { accessorKey: 'id', header: 'STT', cell: ({ row }) => row.index + 1 },
    {
      accessorKey: 'code',
      header: 'Mã đơn mua',
      cell: ({ row }) => row.original.code || `PM${row.original.id}`,
    },
    {
      accessorKey: 'supplier',
      header: 'Nhà cung cấp',
      cell: ({ row }) => row.original.supplier?.name,
    },
    {
      accessorKey: 'totalAmount',
      header: 'Tổng tiền',
      cell: ({ row }) => formatCurrency(row.original.totalAmount),
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => row.original.status,
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày tạo',
      cell: ({ row }) => dateFormat(row.original.createdAt),
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            className="text-blue-500"
            variant="outline"
            size="sm"
            onClick={() => {
              setItemChoice(row.original)
              handleShowDetail(row.original.id)
            }}
          >
            <Eye className="h-5 w-5" />
          </Button>
          <Button
            className="text-red-500"
            variant="outline"
            size="sm"
            onClick={() => {
              setItemChoice(row.original)
              setShowDelete(true)
            }}
          >
            <Trash className="h-5 w-5" />
          </Button>
        </div>
      ),
    },
  ]

  const toolbar = [{ children: <Can permission="order_customer_view" /> }]

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <h2 className="mb-2 text-2xl font-bold tracking-tight">
          Danh sách đơn mua
        </h2>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1">
          <DataTable
            columns={columns}
            data={orders}
            toolbar={toolbar}
            caption="Danh sách đơn mua"
            searchKey="code"
            searchPlaceholder="Tìm theo mã đơn mua..."
            showGlobalFilter
            showColumnFilters
            enableSorting
            loading={loading}
          />
        </div>
      </LayoutBody>
      {showDetail && orderDetail && (
        <PurchaseOrderDetailDialog
          open={showDetail}
          onOpenChange={setShowDetail}
          orderData={orderDetail}
        />
      )}
      {showDelete && (
        <ConfirmDialog
          open={showDelete}
          onOpenChange={setShowDelete}
          description={`Bạn có chắc muốn xóa đơn mua ${
            itemChoice.code || `PM${itemChoice.id}`
          } không?`}
          onConfirm={() => handleDelete(itemChoice.id)}
          loading={loading}
        />
      )}
    </Layout>
  )
}

export default PurchaseOrderPage
