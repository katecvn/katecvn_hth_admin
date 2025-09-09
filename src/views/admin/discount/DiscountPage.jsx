import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import Can from '@/utils/can'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { TrashIcon, Pencil1Icon } from '@radix-ui/react-icons'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import {
  deleteDiscount,
  getDiscounts,
  updateDiscountStatus,
} from '@/stores/DiscountSlice'
import { format } from 'date-fns'
import DiscountDialog from './DiscountDialog'
import { getProducts } from '@/stores/ProductSlice'
import { getProductVariants } from '@/stores/ProductVariantSlice'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const DiscountPage = () => {
  const dispatch = useDispatch()
  const discounts = useSelector((state) => state.discount.discounts)
  const loading = useSelector((state) => state.discount.loading)
  const [showCreateDiscountDialog, setShowCreateDiscountDialog] =
    useState(false)
  const [showDeleteDiscountDialog, setShowDeleteDiscountDialog] =
    useState(false)
  const [showUpdateDiscountDialog, setShowUpdateDiscountDialog] =
    useState(false)
  const [itemChoice, setItemChoice] = useState({})

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteDiscount(id)).unwrap()
    } catch (error) {
      console.error('Error deleting discount:', error)
    }
  }

  useEffect(() => {
    document.title = 'Quản lý mã giảm giá'
    dispatch(getDiscounts())
    dispatch(getProducts())
    dispatch(getProductVariants())
  }, [dispatch])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const statusOptions = [
    {
      value: 'expired',
      label: 'Đã hết hạn',
      className: 'bg-gray-100 text-gray-800',
    },
    {
      value: 'disabled',
      label: 'Đã tắt',
      className: 'bg-gray-100 text-gray-800',
    },
    {
      value: 'active',
      label: 'Hoạt động',
      className: 'bg-green-100 text-green-800',
    },
  ]

  const getStatusInfo = (status) => {
    return (
      statusOptions.find((option) => option.value === status) ||
      statusOptions[0]
    )
  }

  const handleStatusChange = async (id, value) => {
    const status = value

    try {
      await dispatch(updateDiscountStatus({ id, status })).unwrap()
    } catch (error) {
      console.error('Error update Product:', error)
    }
  }

  const columns = [
    {
      accessorKey: 'id',
      header: 'STT',
      cell: ({ row }) => <div className="">{row.index + 1}</div>,
    },
    {
      accessorKey: 'code',
      header: 'Mã giảm giá',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('code')}</div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Loại',
      cell: ({ row }) => {
        const type = row.getValue('type')
        const typeLabels = {
          percentage: 'Phần trăm',
          fixed: 'Số tiền cố định',
          free_shipping: 'Miễn phí vận chuyển',
          // buy_x_get_y: 'Mua X tặng Y',
        }
        return <div>{typeLabels[type] || type}</div>
      },
    },
    {
      accessorKey: 'value',
      header: 'Giá trị',
      cell: ({ row }) => {
        const type = row.original.type
        const value = row.getValue('value')

        if (type === 'percentage') {
          return <div>{Number(value)}%</div>
        } else if (type === 'fixed') {
          return <div>{formatCurrency(value)}</div>
        }
        // return <div>{formatCurrency(value)}</div>
      },
    },
    {
      accessorKey: 'minOrderAmount',
      header: 'Đơn hàng tối thiểu',
      cell: ({ row }) => {
        const amount = row.getValue('minOrderAmount')
        return <div>{formatCurrency(amount)}</div>
      },
    },
    {
      accessorKey: 'startDate',
      header: 'Ngày bắt đầu',
      cell: ({ row }) => {
        const date = row.getValue('startDate')
        if (!date) return null
        try {
          return format(new Date(date), 'dd/MM/yyyy')
        } catch (error) {
          return date
        }
      },
    },
    {
      accessorKey: 'endDate',
      header: 'Ngày kết thúc',
      cell: ({ row }) => {
        const date = row.getValue('endDate')
        if (!date) return null
        try {
          return format(new Date(date), 'dd/MM/yyyy')
        } catch (error) {
          return date
        }
      },
    },
    {
      accessorKey: 'usedCount',
      header: 'Đã sử dụng',
      cell: ({ row }) => {
        const usageLimit = row?.original?.usageLimit
        const usedCount = row.getValue('usedCount')
        return <div>{`${usedCount} / ${usageLimit} lần`}</div>
      },
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const discount = row?.original
        const discountStatus = row.getValue('status')
        const statusInfo = getStatusInfo(discountStatus)
        return (
          <div>
            <Select
              value={discountStatus}
              onValueChange={(value) => handleStatusChange(discount.id, value)}
              disabled={loading}
            >
              <SelectTrigger
                className={`h-8 w-[130px] text-xs font-medium ${statusInfo.className}`}
              >
                <SelectValue placeholder="Trạng thái">
                  {statusInfo.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${option.className}`}
                    >
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Can permission={'discount_update'}>
            <Button
              className="text-blue-500"
              variant="outline"
              size="sm"
              title="Chi tiết"
              onClick={() => {
                setItemChoice(row)
                setShowUpdateDiscountDialog(true)
              }}
            >
              <Pencil1Icon className=" h-6 w-6" />
            </Button>
          </Can>

          <Can permission={'discount_delete'}>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500"
              title="Xóa"
              onClick={() => {
                setItemChoice(row)
                setShowDeleteDiscountDialog(true)
              }}
            >
              <TrashIcon className=" h-6 w-6" />
            </Button>
          </Can>
        </div>
      ),
    },
  ]

  const toolbar = [
    {
      children: (
        <Can permission={'discount_create'}>
          <Button
            onClick={() => setShowCreateDiscountDialog(true)}
            className="mx-2"
            variant="outline"
            size="sm"
          >
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>

          {showCreateDiscountDialog && (
            <DiscountDialog
              open={showCreateDiscountDialog}
              onOpenChange={setShowCreateDiscountDialog}
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
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách mã giảm giá
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {discounts && (
            <DataTable
              columns={columns}
              data={discounts}
              toolbar={toolbar}
              caption="Danh sách mã giảm giá"
              searchKey="code"
              searchPlaceholder="Tìm theo mã..."
              showGlobalFilter={true}
              showColumnFilters={true}
              enableSorting={true}
              loading={loading}
            />
          )}
        </div>
      </LayoutBody>

      {showDeleteDiscountDialog && (
        <ConfirmDialog
          open={showDeleteDiscountDialog}
          onOpenChange={setShowDeleteDiscountDialog}
          description={`Hành động này không thể hoàn tác. Mã giảm giá: ${itemChoice.original?.code} sẽ bị xóa.`}
          onConfirm={() => handleDelete(itemChoice.original?.id)}
          loading={loading}
        />
      )}

      {showUpdateDiscountDialog && (
        <DiscountDialog
          open={showUpdateDiscountDialog}
          onOpenChange={setShowUpdateDiscountDialog}
          initialData={itemChoice.original}
        />
      )}
    </Layout>
  )
}

export default DiscountPage
