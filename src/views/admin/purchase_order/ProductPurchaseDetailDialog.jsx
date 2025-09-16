import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DataTable } from '@/components/DataTable'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { dateFormat } from '@/utils/date-format'
import { getPurchaseOrderDetail } from '@/stores/PurchaseOrderSlice'
import PurchaseOrderSimpleDialog from './PurchaseOrderSimpleDialog'

const ProductPurchaseDetailDialog = ({ open, onOpenChange, product }) => {
  const dispatch = useDispatch()
  const orderDetail = useSelector((s) => s.purchaseOrder.order)
  const loading = useSelector((s) => s.purchaseOrder.loading)

  const [showMini, setShowMini] = useState(false)

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0)

  const handleOpenMiniOrder = async (orderId) => {
    await dispatch(getPurchaseOrderDetail(orderId)).unwrap()
    setShowMini(true)
  }

  const rows = Array.isArray(product?.orders) ? product.orders : []

  const columns = [
    { accessorKey: 'idx', header: 'STT', cell: ({ row }) => row.index + 1 },
    {
      accessorKey: 'createdAt',
      header: 'Ngày',
      cell: ({ row }) => dateFormat(row.original.createdAt),
    },
    { accessorKey: 'code', header: 'Mã đơn hàng' },
    { accessorKey: 'quantity', header: 'Số lượng' },
    {
      accessorKey: 'salePrice',
      header: 'Đơn giá',
      cell: ({ row }) => formatCurrency(row.original.salePrice),
    },
    {
      accessorKey: 'totalPrice',
      header: 'Thành tiền',
      cell: ({ row }) => formatCurrency(row.original.totalPrice),
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <Button
          className="text-blue-500"
          variant="outline"
          size="sm"
          onClick={() => handleOpenMiniOrder(row.original.orderId)}
        >
          <Eye className="h-5 w-5" />
        </Button>
      ),
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            Sản phẩm: {product?.productName} ({product?.productSku}) — Tổng SL:{' '}
            {product?.totalQuantity}
          </DialogTitle>
        </DialogHeader>

        <div className="-mx-2 px-2">
          <DataTable
            columns={columns}
            data={rows}
            toolbar={[]}
            caption="Các đơn hàng chứa sản phẩm"
            showGlobalFilter={false}
            enableSorting
            loading={loading}
          />
        </div>

        {showMini && orderDetail && (
          <PurchaseOrderSimpleDialog
            open={showMini}
            onOpenChange={setShowMini}
            order={orderDetail}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ProductPurchaseDetailDialog
