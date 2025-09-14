import { useEffect, useState } from 'react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteCustomerProductDiscount({ id, customerGroupId: selectedGroup })).unwrap()
    } catch (err) {
      console.error(err)
    }
  }

  const renderPrice = (product) => {
    const basePrice = product.salePrice || product.price
    const discount = product.currentDiscount
    if (!discount) return `${basePrice.toLocaleString('vi-VN')}đ`

    if (discount.discountType === 'percentage') {
      const newPrice = basePrice - (basePrice * discount.discountValue) / 100
      return `${newPrice.toLocaleString('vi-VN')}đ (đã giảm ${discount.discountValue}%)`
    }
    if (discount.discountType === 'fixed') {
      const newPrice = basePrice - discount.discountValue
      return `${newPrice.toLocaleString('vi-VN')}đ (đã giảm ${discount.discountValue.toLocaleString('vi-VN')}đ)`
    }
    return `${basePrice.toLocaleString('vi-VN')}đ`
  }

  const columns = [
    {
      accessorKey: 'id',
      header: '',
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row.original.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows((prev) => [...prev, row.original.id])
            } else {
              setSelectedRows((prev) => prev.filter((id) => id !== row.original.id))
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

          {selectedRows.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowBulkDialog(true)}>
                Cập nhật giảm giá
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <Layout>
      <LayoutBody fixedHeight>
        <h2 className="text-2xl font-bold mb-2">Giảm giá theo khách hàng</h2>
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
