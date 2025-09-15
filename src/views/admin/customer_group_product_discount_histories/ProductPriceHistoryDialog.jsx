import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DataTable } from '@/components/DataTable'
import { getHistories } from '@/stores/customerProductDiscountHistorySlice'

const ProductPriceHistoryDialog = ({
  open,
  onOpenChange,
  product,
  customerGroupId,
}) => {
  const dispatch = useDispatch()
  const { histories, loading } = useSelector(
    (s) => s.customerProductDiscountHistory,
  )

  useEffect(() => {
    if (open && product) {
      dispatch(getHistories({ customerGroupId, page: 1, limit: 9999 }))
    }
  }, [open, product, customerGroupId, dispatch])

  const productHistories = useMemo(() => {
    return histories.filter((h) => h.productId === product?.id)
  }, [histories, product])

  const formatPriceWithDiscount = (basePrice, type, value) => {
    if (!type || !value) {
      return `${basePrice.toLocaleString('vi-VN')}đ`
    }
    if (type === 'percentage') {
      const newPrice = basePrice - (basePrice * Number(value)) / 100
      return `${newPrice.toLocaleString('vi-VN')}đ (đã giảm ${parseInt(
        value,
        10,
      )}%)`
    }
    if (type === 'fixed') {
      const newPrice = basePrice - Number(value)
      return `${newPrice.toLocaleString('vi-VN')}đ (đã giảm ${Number(
        value,
      ).toLocaleString('vi-VN')}đ)`
    }
    return `${basePrice.toLocaleString('vi-VN')}đ`
  }

  const columns = [
    {
      accessorKey: 'createdAt',
      header: 'Ngày cập nhật',
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleString('vi-VN'),
    },
    {
      id: 'oldPrice',
      header: 'Giá cũ',
      cell: ({ row }) => {
        const { oldType, oldValue } = row.original
        const basePrice = Number(
          product?.salePrice || product?.originalPrice || 0,
        )
        if (!oldValue || !oldType) {
          return `${basePrice.toLocaleString('vi-VN')}đ`
        }
        return formatPriceWithDiscount(basePrice, oldType, oldValue)
      },
    },
    {
      id: 'newPrice',
      header: 'Giá mới',
      cell: ({ row }) => {
        const { newType, newValue } = row.original
        const basePrice = Number(
          product?.salePrice || product?.originalPrice || 0,
        )
        if (!newValue || !newType) {
          return `${basePrice.toLocaleString('vi-VN')}đ`
        }
        return formatPriceWithDiscount(basePrice, newType, newValue)
      },
    },
    {
      accessorKey: 'updatedUser',
      header: 'Người cập nhật',
      cell: ({ row }) => row.original.updatedUser?.full_name || '—',
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Lịch sử giá - {product?.name}</DialogTitle>
          <DialogDescription>
            Danh sách các lần thay đổi giá cho sản phẩm này
          </DialogDescription>
        </DialogHeader>
        <DataTable
          columns={columns}
          data={productHistories}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  )
}

export default ProductPriceHistoryDialog
