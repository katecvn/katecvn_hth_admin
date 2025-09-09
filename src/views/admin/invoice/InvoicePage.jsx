import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import { dateFormat } from '@/utils/date-format'
import Can from '@/utils/can'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { TrashIcon } from '@radix-ui/react-icons'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import {
  deleteExistingInvoice,
  getInvoice,
  getInvoiceDetails,
  changeInvoiceStatus,
} from '@/stores/InvoiceSlice'
import InvoiceDetailDialog from './InvoiceDetailDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const InvoicePage = () => {
  const dispatch = useDispatch()
  const invoices = useSelector((state) => state.invoice.invoices) || []
  const invoiceDetail = useSelector((state) => state.invoice.invoice)
  const loading = useSelector((state) => state.invoice.loading)

  const [showDeleteInvoiceDialog, setShowDeleteInvoiceDialog] = useState(false)
  const [showInvoiceDetailDialog, setShowInvoiceDetailDialog] = useState(false)
  const [itemChoice, setItemChoice] = useState({})

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteExistingInvoice(id)).unwrap()
    } catch (error) {
      console.error('Error deleting invoice:', error)
    }
  }

  const handleShowDetail = async (id) => {
    try {
      await dispatch(getInvoiceDetails(id)).unwrap()
      setShowInvoiceDetailDialog(true)
    } catch (error) {
      console.error('Error fetching invoice detail:', error)
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await dispatch(
        changeInvoiceStatus({
          id,
          status,
        }),
      ).unwrap()
    } catch (error) {
      console.error('Error updating invoice status:', error)
    }
  }

  useEffect(() => {
    document.title = 'Quản lý đơn hàng'
    dispatch(getInvoice())
  }, [dispatch])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0)
  }

  // Định nghĩa các trạng thái đơn hàng
  const statusOptions = [
    {
      value: 'draft',
      label: 'Nháp đơn hàng',
      className: 'bg-gray-100 text-gray-800',
    },
    {
      value: 'pending',
      label: 'Chờ xác nhận',
      className: 'bg-yellow-100 text-yellow-800',
    },
    {
      value: 'accepted',
      label: 'Đã xác nhận',
      className: 'bg-green-100 text-green-800',
    },
    {
      value: 'rejected',
      label: 'Đã từ chối',
      className: 'bg-red-100 text-red-800',
    },
  ]

  const getStatusInfo = (status) => {
    return (
      statusOptions.find((option) => option.value === status) ||
      statusOptions[0]
    )
  }

  const columns = [
    {
      accessorKey: 'id',
      header: 'STT',
      cell: ({ row }) => <div className="">{row.index + 1}</div>,
    },
    {
      accessorKey: 'code',
      header: 'Mã đơn hàng',
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.code || `HD${row.original.id}`}
        </div>
      ),
    },
    {
      accessorKey: 'customer',
      header: 'Khách hàng',
      cell: ({ row }) => {
        const customer = row.getValue('customer')
        return <div>{customer?.full_name || 'Khách lẻ'}</div>
      },
    },
    {
      accessorKey: 'totalAmount',
      header: 'Tổng tiền',
      cell: ({ row }) => (
        <div className="font-medium">
          {formatCurrency(row.original.totalAmount)}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const status = row.getValue('status') || 'pending'
        const statusInfo = getStatusInfo(status)

        return (
          <Select
            value={status}
            onValueChange={(value) =>
              handleStatusChange(row.original.id, value)
            }
            disabled={loading}
          >
            <SelectTrigger
              className={`h-8 w-[130px] text-xs font-medium ${statusInfo.className}`}
            >
              <SelectValue>{statusInfo.label}</SelectValue>
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
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày tạo',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-32 truncate sm:max-w-72 md:max-w-[31rem]">
            {dateFormat(row.getValue('createdAt'))}
          </span>
        </div>
      ),
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
            title="Xem chi tiết"
            onClick={() => {
              setItemChoice(row)
              handleShowDetail(row.original.id)
            }}
          >
            <Eye className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-red-500"
            title="Xóa"
            onClick={() => {
              setItemChoice(row)
              setShowDeleteInvoiceDialog(true)
            }}
          >
            <TrashIcon className="h-6 w-6" />
          </Button>
        </div>
      ),
    },
  ]

  const toolbar = [
    {
      children: <Can permission={''}></Can>,
    },
  ]

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách đơn hàng
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          <DataTable
            columns={columns}
            data={Array.isArray(invoices) ? invoices : []}
            toolbar={toolbar}
            caption="Danh sách đơn hàng"
            searchKey="invoiceCode"
            searchPlaceholder="Tìm theo mã đơn hàng..."
            showGlobalFilter={true}
            showColumnFilters={true}
            enableSorting={true}
            loading={loading}
          />
        </div>
      </LayoutBody>

      {/* Dialogs */}
      {showDeleteInvoiceDialog && (
        <ConfirmDialog
          open={showDeleteInvoiceDialog}
          onOpenChange={setShowDeleteInvoiceDialog}
          description={`Hành động này không thể hoàn tác. đơn hàng: ${itemChoice.original?.invoiceCode || itemChoice.original?.orderCode || 'HD' + itemChoice.original?.id} sẽ bị xóa.`}
          onConfirm={() => handleDelete(itemChoice.original?.id)}
          loading={loading}
        />
      )}

      {showInvoiceDetailDialog && invoiceDetail && (
        <InvoiceDetailDialog
          open={showInvoiceDetailDialog}
          onOpenChange={setShowInvoiceDetailDialog}
          invoiceData={invoiceDetail}
        />
      )}
    </Layout>
  )
}

export default InvoicePage
