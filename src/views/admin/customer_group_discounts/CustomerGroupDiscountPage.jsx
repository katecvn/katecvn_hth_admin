import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import { dateFormat } from '@/utils/date-format'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { TrashIcon, Pencil1Icon } from '@radix-ui/react-icons'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import Can from '@/utils/can'

import {
  getCustomerGroupDiscounts,
  deleteCustomerGroupDiscount,
} from '@/stores/CustomerGroupDiscountSlice'
import CustomerGroupDiscountDialog from './CustomerGroupDiscountDialog'

const CustomerGroupDiscountPage = () => {
  const dispatch = useDispatch()
  const discounts = useSelector(
    (state) => state.customerGroupDiscount.discounts,
  )
  const loading = useSelector((state) => state.customerGroupDiscount.loading)

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [itemChoice, setItemChoice] = useState({})

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteCustomerGroupDiscount(id)).unwrap()
    } catch (error) {
      console.error('Error deleting CustomerGroupDiscount:', error)
    }
  }

  useEffect(() => {
    document.title = 'Quản lý giảm giá phân loại khách hàng'
    dispatch(getCustomerGroupDiscounts())
  }, [dispatch])

  const columns = [
    {
      accessorKey: 'id',
      header: 'STT',
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: 'customerGroup',
      header: 'Phân loại khách hàng',
      cell: ({ row }) => (
        <div>{row.original?.customerGroup?.name || 'Không xác định'}</div>
      ),
    },
    {
      accessorKey: 'discountType',
      header: 'Loại giảm giá',
      cell: ({ row }) =>
        row.getValue('discountType') === 'percentage'
          ? 'Phần trăm (%)'
          : 'Số tiền cố định',
    },
    {
      accessorKey: 'discountValue',
      header: 'Giá trị giảm',
      cell: ({ row }) => <div>{row.getValue('discountValue')}</div>,
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => (
        <span
          className={`${
            row.getValue('status') === 'active'
              ? 'text-green-600'
              : 'text-red-500'
          }`}
        >
          {row.getValue('status') === 'active' ? 'Đang áp dụng' : 'Ngưng'}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày tạo',
      cell: ({ row }) => <span>{dateFormat(row.getValue('createdAt'))}</span>,
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
            title="Chi tiết"
            onClick={() => {
              setItemChoice(row)
              setShowUpdateDialog(true)
            }}
          >
            <Pencil1Icon className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500"
            title="Xóa"
            onClick={() => {
              setItemChoice(row)
              setShowDeleteDialog(true)
            }}
          >
            <TrashIcon className="h-5 w-5" />
          </Button>
        </div>
      ),
    },
  ]

  const toolbar = [
    {
      children: (
        <Can permission={'customer_group_discount_create'}>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="mx-2"
            variant="outline"
            size="sm"
          >
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>

          {showCreateDialog && (
            <CustomerGroupDiscountDialog
              open={showCreateDialog}
              onOpenChange={setShowCreateDialog}
              initialData={null}
            />
          )}
        </Can>
      ),
    },
  ]

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            Danh sách giảm giá theo phân loại khách
          </h2>
        </div>
        <div className="flex-1 overflow-auto px-2 py-1">
          {discounts && (
            <DataTable
              columns={columns}
              data={discounts}
              toolbar={toolbar}
              caption="Danh sách giảm giá phân loại khách hàng"
              searchKey="customerGroup.name"
              searchPlaceholder="Tìm theo phân loại khách hàng..."
              showGlobalFilter={true}
              showColumnFilters={true}
              enableSorting={true}
              loading={loading}
            />
          )}
        </div>
      </LayoutBody>

      {showDeleteDialog && (
        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          description={`Hành động này không thể hoàn tác. Giảm giá của phân loại: ${itemChoice.original?.customerGroup?.name} sẽ bị xóa.`}
          onConfirm={() => handleDelete(itemChoice.original?.id)}
          loading={loading}
        />
      )}

      {showUpdateDialog && (
        <CustomerGroupDiscountDialog
          open={showUpdateDialog}
          onOpenChange={setShowUpdateDialog}
          initialData={{ ...itemChoice.original }}
          isEditing={true}
        />
      )}
    </Layout>
  )
}

export default CustomerGroupDiscountPage
