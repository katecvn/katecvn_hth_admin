import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import { Button } from '@/components/ui/button'
import { EyeOpenIcon } from '@radix-ui/react-icons'
import { getProductsByCustomerGroup } from '@/stores/CustomerProductDiscountSlice'
import ProductPriceHistoryDialog from './ProductPriceHistoryDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getCustomerGroup } from '@/stores/CustomerGroupSlice'

const ProductPricesHistoryPage = () => {
  const dispatch = useDispatch()
  const groups = useSelector((s) => s.customerGroup.customerGroups)
  const { products, loading } = useSelector((s) => s.customerProductDiscount)

  const [selectedGroup, setSelectedGroup] = useState(null)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    document.title = 'Lịch sử giá sản phẩm'
    dispatch(getCustomerGroup())
  }, [dispatch])

  useEffect(() => {
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0].id.toString())
    }
  }, [groups])

  useEffect(() => {
    if (selectedGroup) {
      dispatch(getProductsByCustomerGroup({ customerGroupId: selectedGroup }))
    }
  }, [selectedGroup, dispatch])

  const renderPrice = (product) => {
    const basePrice = Number(product.salePrice || product.originalPrice || 0)
    const discount = product.currentDiscount

    if (!discount) return `${basePrice.toLocaleString('vi-VN')}đ`

    if (discount.status !== 'active') {
      return `${basePrice.toLocaleString('vi-VN')}đ`
    }

    if (discount.discountType === 'percentage') {
      const newPrice =
        basePrice - (basePrice * Number(discount.discountValue)) / 100
      return `${newPrice.toLocaleString('vi-VN')}đ (đã giảm ${
        discount.discountValue
      }%)`
    }

    if (discount.discountType === 'fixed') {
      const newPrice = basePrice - Number(discount.discountValue)
      return `${newPrice.toLocaleString('vi-VN')}đ (đã giảm ${Number(
        discount.discountValue,
      ).toLocaleString('vi-VN')}đ)`
    }

    return `${basePrice.toLocaleString('vi-VN')}đ`
  }

  const columns = [
    {
      accessorKey: 'name',
      header: 'Tên sản phẩm',
    },
    {
      accessorKey: 'finalPrice',
      header: 'Giá cho khách hàng',
      cell: ({ row }) => renderPrice(row.original),
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const product = row.original
        return (
          <Button
            variant="outline"
            size="sm"
            title="Xem lịch sử giá"
            onClick={() => {
              setSelectedProduct(product)
              setShowHistoryDialog(true)
            }}
          >
            <EyeOpenIcon />
          </Button>
        )
      },
    },
  ]

  const toolbar = [
    {
      children: (
        <div className="flex gap-2">
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Chọn nhóm khách hàng" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((g) => (
                <SelectItem key={g.id} value={g.id.toString()}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ),
    },
  ]

  return (
    <Layout>
      <LayoutBody fixedHeight>
        <h2 className="mb-2 text-2xl font-bold">Lịch sử giá sản phẩm</h2>
        <DataTable
          columns={columns}
          data={products}
          toolbar={toolbar}
          searchKey="name"
          searchPlaceholder="Tìm sản phẩm..."
          showGlobalFilter
          enableSorting
          loading={loading}
        />
      </LayoutBody>

      {showHistoryDialog && (
        <ProductPriceHistoryDialog
          open={showHistoryDialog}
          onOpenChange={setShowHistoryDialog}
          product={selectedProduct}
          customerGroupId={selectedGroup}
        />
      )}
    </Layout>
  )
}

export default ProductPricesHistoryPage
