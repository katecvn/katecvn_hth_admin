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
  deleteContact,
  getContact,
  updateContactStatus,
} from '@/stores/ContactSlice'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import TopicDialog from './TopicDialog'
import { toast } from 'sonner'
const ContactPage = () => {
  const dispatch = useDispatch()
  const contacts = useSelector((state) => state.contact.contacts)
  const loading = useSelector((state) => state.contact.loading)
  const [showCreateContactDialog, setShowCreateContactDialog] = useState(false)
  const [showDeleteContactDialog, setShowDeleteContactDialog] = useState(false)
  const [showUpdateContactDialog, setShowUpdateContactDialog] = useState(false)
  const [itemChoice, setItemChoice] = useState({})

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteContact(id)).unwrap()
    } catch (error) {
      console.error('Error deleting Contact:', error)
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await dispatch(
        updateContactStatus({
          id: id,
          status: status,
        }),
      ).unwrap()
      // toast.success('Cập nhật trạng thái thành công')
    } catch (error) {
      console.error('Error updating contact status:', error)
      // toast.error('Lỗi khi cập nhật trạng thái')
    }
  }

  // Định nghĩa các trạng thái liên hệ với màu sắc
  const statusOptions = [
    {
      value: 'pending',
      label: 'Đang chờ xử lý',
      className: 'bg-yellow-100 text-yellow-800',
    },
    {
      value: 'in_progress',
      label: 'Đang xử lý',
      className: 'bg-blue-100 text-blue-800',
    },
    {
      value: 'resolved',
      label: 'Đã giải quyết',
      className: 'bg-green-100 text-green-800',
    },
  ]

  // Lấy thông tin trạng thái dựa trên giá trị
  const getStatusInfo = (status) => {
    return (
      statusOptions.find((option) => option.value === status) ||
      statusOptions[0]
    )
  }

  useEffect(() => {
    document.title = 'Quản lý liên hệ'
    dispatch(getContact())
  }, [dispatch])
  const columns = [
    {
      accessorKey: 'id',
      header: 'STT',
      cell: ({ row }) => <div className="">{row.index + 1}</div>,
    },
    {
      accessorKey: 'name',
      header: 'Tên liên hệ',
    },
    {
      accessorKey: 'phone',
      header: 'Số điện thoại',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'subject',
      header: 'Nội dung',
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const contact = row.original
        const statusInfo = getStatusInfo(contact.status)

        return (
          <div>
            <Select
              value={contact.status}
              onValueChange={(value) => handleStatusChange(contact.id, value)}
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
          <Can permission={'contact_delete'}>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500"
              title="Xóa"
              onClick={() => {
                setItemChoice(row)
                setShowDeleteContactDialog(true)
              }}
            >
              <TrashIcon className=" h-6 w-6" />
            </Button>
          </Can>
        </div>
      ),
    },
  ]

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách liên hệ
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {contacts && (
            <DataTable
              columns={columns}
              data={contacts}
              toolbar={[]}
              caption="Danh sách liên hệ"
              searchKey="name"
              searchPlaceholder="Tìm theo tên..."
              showGlobalFilter={true}
              showColumnFilters={true}
              enableSorting={true}
              loading={loading}
            />
          )}
        </div>
      </LayoutBody>
      {showDeleteContactDialog && (
        <ConfirmDialog
          open={showDeleteContactDialog}
          onOpenChange={setShowDeleteContactDialog}
          description={`Hành động này không thể hoàn tác. liên hệ: ${itemChoice.original?.name} sẽ bị xóa.`}
          onConfirm={() => handleDelete(itemChoice.original?.id)}
          loading={loading}
        />
      )}
      {showUpdateContactDialog && (
        <TopicDialog
          open={showUpdateContactDialog}
          onOpenChange={setShowUpdateContactDialog}
          initialData={{
            ...itemChoice.original,
            categoryIds:
              itemChoice.original?.categories?.map((ca) => ca.id) || [],
          }}
        />
      )}
    </Layout>
  )
}

export default ContactPage
