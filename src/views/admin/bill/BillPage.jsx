import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import { Button } from '@/components/ui/button'
import { Eye, Pencil } from 'lucide-react'
import { TrashIcon } from '@radix-ui/react-icons'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import Can from '@/utils/can'
import { dateFormat } from '@/utils/date-format'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getBills,
  getBillDetails,
  deleteExistingBill,
  changeBillStatus,
} from '@/stores/BillSlice'
import BillDetailDialog from './BillDetailDialog'
import BillFormDialog from './BillFormDialog'
import BulkInvoiceDialog from './BulkInvoiceDialog'

const BillPage = () => {
  const dispatch = useDispatch()
  const bills = useSelector((s) => s.bill.bills) || []
  const billDetail = useSelector((s) => s.bill.bill)
  const loading = useSelector((s) => s.bill.loading)

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [formDialog, setFormDialog] = useState({
    open: false,
    mode: 'create',
    data: null,
  })
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [itemChoice, setItemChoice] = useState({})
  const [status, setStatus] = useState('all')

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0)

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: 'Tất cả' },
      { value: 'draft', label: 'Nháp' },
      { value: 'issued', label: 'Đã phát hành' },
      { value: 'cancelled', label: 'Đã hủy' },
    ],
    [],
  )

  const fetchList = () => {
    const filters = {}
    if (status && status !== 'all') filters.status = status
    dispatch(getBills(filters))
  }

  useEffect(() => {
    document.title = 'Quản lý hóa đơn'
    fetchList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getStatusClass = (s) => {
    if (s === 'issued') return 'bg-green-100 text-green-800'
    if (s === 'cancelled') return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  const handleStatusChange = async (id, next) => {
    await dispatch(
      changeBillStatus({ id, status: next, filters: { status } }),
    ).unwrap()
  }

  const handleDelete = async (id) => {
    await dispatch(deleteExistingBill(id)).unwrap()
  }

  const handleShowDetail = async (id) => {
    await dispatch(getBillDetails(id)).unwrap()
    setShowDetailDialog(true)
  }

  const columns = [
    { accessorKey: 'idx', header: 'STT', cell: ({ row }) => row.index + 1 },
    {
      accessorKey: 'invoiceNumber',
      header: 'Số hóa đơn',
      cell: ({ row }) =>
        row.original.invoiceNumber ||
        row.original.code ||
        `BILL${row.original.id}`,
    },
    {
      accessorKey: 'order',
      header: 'Đơn hàng',
      cell: ({ row }) =>
        row.original.order?.code || `HD${row.original.orderId || ''}`,
    },
    {
      accessorKey: 'totalAmount',
      header: 'Tổng tiền',
      cell: ({ row }) => (
        <span className="font-medium">
          {formatCurrency(row.original.totalAmount)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => (
        <Can permission={'invoice_manage_status'}>
          <Select
            value={row.original.status || 'draft'}
            onValueChange={(v) => handleStatusChange(row.original.id, v)}
            disabled={loading}
          >
            <SelectTrigger
              className={`h-8 w-[150px] text-xs font-medium ${getStatusClass(row.original.status)}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${getStatusClass(o.value)}`}
                  >
                    {o.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Can>
      ),
    },
    {
      accessorKey: 'issueDate',
      header: 'Ngày phát hành',
      cell: ({ row }) =>
        row.original.issueDate ? dateFormat(row.original.issueDate) : '',
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
            title="Xem chi tiết"
            onClick={() => {
              setItemChoice(row)
              handleShowDetail(row.original.id)
            }}
          >
            <Eye className="h-5 w-5" />
          </Button>

          {row.original.status === 'draft' && (
            <Button
              className="text-yellow-500"
              variant="outline"
              size="sm"
              title="Cập nhật"
              onClick={() => {
                setFormDialog({ open: true, mode: 'edit', data: row.original })
              }}
            >
              <Pencil className="h-5 w-5" />
            </Button>
          )}

          <Can permission={'invoice_delete'}>
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
              <TrashIcon className="h-6 w-6" />
            </Button>
          </Can>
        </div>
      ),
    },
  ]

  const toolbar = [
    {
      children: (
        <div className="flex flex-wrap items-center gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchList}>
            Lọc
          </Button>
          <Can permission={'invoice_create'}>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  setFormDialog({ open: true, mode: 'create', data: null })
                }
              >
                + Tạo hóa đơn
              </Button>
              <Button
                variant="outline"
                onClick={() => setBulkDialogOpen(true)}
                title="Tạo nhanh từ nhiều đơn hàng"
              >
                Tạo nhanh từ đơn
              </Button>
            </div>
          </Can>
        </div>
      ),
    },
  ]

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            Danh sách hóa đơn
          </h2>
        </div>

        <div className="-mx-4 flex-1 overflow-auto px-4 py-1">
          <DataTable
            columns={columns}
            data={Array.isArray(bills) ? bills : []}
            toolbar={toolbar}
            caption="Danh sách hóa đơn"
            searchKey="invoiceNumber"
            showGlobalFilter={true}
            loading={loading}
          />
        </div>
      </LayoutBody>

      {showDeleteDialog && (
        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          description={`Hành động này không thể hoàn tác. Hóa đơn ${
            itemChoice.original?.invoiceNumber ||
            itemChoice.original?.code ||
            'BILL' + itemChoice.original?.id
          } sẽ bị xóa.`}
          onConfirm={() => handleDelete(itemChoice.original?.id)}
          loading={loading}
        />
      )}

      {showDetailDialog && billDetail && (
        <BillDetailDialog
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
          billData={billDetail}
        />
      )}

      {formDialog.open && (
        <BillFormDialog
          open={formDialog.open}
          onOpenChange={(v) => setFormDialog({ ...formDialog, open: v })}
          onSaved={fetchList}
          mode={formDialog.mode}
          billData={formDialog.data}
        />
      )}

      {bulkDialogOpen && (
        <BulkInvoiceDialog
          open={bulkDialogOpen}
          onOpenChange={setBulkDialogOpen}
          onCreated={fetchList}
        />
      )}
    </Layout>
  )
}

export default BillPage
