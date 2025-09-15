import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import { Button } from '@/components/ui/button'
import { PlusIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import { getCustomerGroup } from '@/stores/CustomerGroupSlice'
import {
  getProductsByCustomerGroup,
  deleteCustomerProductDiscount,
} from '@/stores/CustomerProductDiscountSlice'
import CustomerProductDiscountDialog from './CustomerProductDiscountDialog'
import CustomerProductDiscountBulkDialog from './CustomerProductDiscountBulkDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const STORAGE_KEY = 'selected_product_discounts'

const CustomerProductDiscountPage = () => {
  const dispatch = useDispatch()
  const groups = useSelector((s) => s.customerGroup.customerGroups)
  const { products, loading } = useSelector((s) => s.customerProductDiscount)

  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])
  const [showDialog, setShowDialog] = useState(false)
  const [showBulkDialog, setShowBulkDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itemChoice, setItemChoice] = useState(null)

  useEffect(() => {
    document.title = 'Giảm giá theo khách hàng'
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

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setSelectedRows(JSON.parse(saved))
      } catch {
        setSelectedRows([])
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedRows))
  }, [selectedRows])

  const handleDelete = async (productId) => {
    try {
      await dispatch(
        deleteCustomerProductDiscount({
          productId,
          customerGroupId: selectedGroup,
        }),
      ).unwrap()
    } catch (err) {
      console.error(err)
    }
  }

  const normalizedProducts = useMemo(() => {
    return products.map((p) => {
      const discount = p.customerDiscounts?.[0] || null
      return {
        ...p,
        currentDiscount: discount,
      }
    })
  }, [products])

  const renderPrice = (product) => {
    const basePrice = Number(product.salePrice || product.price || 0)
    const discount = product.currentDiscount

    if (!discount) return `${basePrice.toLocaleString('vi-VN')}đ`
    if (discount.status !== 'active')
      return `${basePrice.toLocaleString('vi-VN')}đ`

    if (discount.discountType === 'percentage') {
      const percent = parseInt(discount.discountValue, 10)
      const newPrice = basePrice - (basePrice * percent) / 100
      return `${newPrice.toLocaleString('vi-VN')}đ (đã giảm ${percent}%)`
    }

    if (discount.discountType === 'fixed') {
      const newPrice = basePrice - Number(discount.discountValue)
      return `${newPrice.toLocaleString('vi-VN')}đ (đã giảm ${Number(
        discount.discountValue,
      ).toLocaleString('vi-VN')}đ)`
    }

    return `${basePrice.toLocaleString('vi-VN')}đ`
  }

  const allSelected =
    normalizedProducts.length > 0 &&
    selectedRows.length === normalizedProducts.length
  const someSelected = selectedRows.length > 0 && !allSelected

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedRows([])
    } else {
      setSelectedRows(normalizedProducts.map((p) => p.id))
    }
  }

  const columns = [
    {
      id: 'select',
      header: () => (
        <input
          type="checkbox"
          checked={allSelected}
          ref={(el) => {
            if (el) el.indeterminate = someSelected
          }}
          onChange={toggleSelectAll}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row.original.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows((prev) => [...prev, row.original.id])
            } else {
              setSelectedRows((prev) =>
                prev.filter((id) => id !== row.original.id),
              )
            }
          }}
        />
      ),
    },
    {
      accessorKey: 'name',
      header: 'Tên sản phẩm',
    },
    {
      accessorKey: 'price',
      header: 'Giá cho khách hàng',
      cell: ({ row }) => renderPrice(row.original),
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const product = row.original
        const hasDiscount = !!product.currentDiscount
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              title={hasDiscount ? 'Chỉnh sửa' : 'Thêm giảm giá'}
              onClick={() => {
                setItemChoice(product)
                setShowDialog(true)
              }}
            >
              {hasDiscount ? <Pencil1Icon /> : <PlusIcon />}
            </Button>
            {hasDiscount && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-500"
                title="Xóa giảm giá"
                onClick={() => {
                  setItemChoice(product)
                  setShowDeleteDialog(true)
                }}
              >
                <TrashIcon />
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  const toolbar = [
    {
      children: (
        <div className="flex gap-2">
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="mr-2 w-[250px]">
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

          {selectedRows.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkDialog(true)}
              className="mx-0 mr-4"
            >
              Cập nhật giảm giá
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <Layout>
      <LayoutBody fixedHeight>
        <h2 className="mb-2 text-2xl font-bold">Giảm giá theo khách hàng</h2>
        <DataTable
          columns={columns}
          data={normalizedProducts}
          toolbar={toolbar}
          searchKey="name"
          searchPlaceholder="Tìm sản phẩm..."
          showGlobalFilter
          enableSorting
          loading={loading}
        />
      </LayoutBody>

      {showDialog && (
        <CustomerProductDiscountDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          product={itemChoice}
          customerGroupId={selectedGroup}
        />
      )}

      {showBulkDialog && (
        <CustomerProductDiscountBulkDialog
          open={showBulkDialog}
          onOpenChange={setShowBulkDialog}
          customerGroupId={selectedGroup}
          productIds={selectedRows}
        />
      )}

      {showDeleteDialog && (
        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          description={`Xóa giảm giá sản phẩm "${itemChoice?.name}" cho nhóm này?`}
          onConfirm={() => handleDelete(itemChoice.id)}
          loading={loading}
        />
      )}
    </Layout>
  )
}

export default CustomerProductDiscountPage
