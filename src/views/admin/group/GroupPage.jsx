import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import { dateFormat } from '@/utils/date-format'
import Can from '@/utils/can'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { TrashIcon, Pencil1Icon } from '@radix-ui/react-icons'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import { deleteGroup, getGroup } from '@/stores/GroupSlice'
import GroupDialog from './GroupDialog'
import { getOption } from '@/stores/OptionSlice'

const GroupPage = () => {
  const dispatch = useDispatch()
  const groups = useSelector((state) => state.group.groups)
  const loading = useSelector((state) => state.group.loading)
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false)
  const [showDeleteGroupDialog, setShowDeleteGroupDialog] = useState(false)
  const [showUpdateGroupDialog, setShowUpdateGroupDialog] = useState(false)
  const [itemChoice, setItemChoice] = useState({})
  const handleDelete = async (id) => {
    try {
      await dispatch(deleteGroup(id)).unwrap()
    } catch (error) {
      console.error('Error deleting Group:', error)
    }
  }
  useEffect(() => {
    document.title = 'Quản lý nhóm sản phẩm'
    dispatch(getGroup())
    dispatch(getOption())
  }, [dispatch])
  const columns = [
    {
      accessorKey: 'id',
      header: 'STT',
      cell: ({ row }) => <div className="">{row.index + 1}</div>,
    },
    {
      accessorKey: 'name',
      header: 'Tên nhóm sản phẩm',
    },
    {
      accessorKey: 'slug',
      header: 'Đường dẫn',
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
            title="Chi tiết"
            onClick={() => {
              setItemChoice(row)
              setShowUpdateGroupDialog(true)
            }}
          >
            <Pencil1Icon className=" h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500"
            title="Xóa"
            onClick={() => {
              setItemChoice(row)
              setShowDeleteGroupDialog(true)
            }}
          >
            <TrashIcon className=" h-6 w-6" />
          </Button>
        </div>
      ),
    },
  ]
  const toolbar = [
    {
      children: (
        <Can permission={''}>
          <Button
            onClick={() => setShowCreateGroupDialog(true)}
            className="mx-2"
            variant="outline"
            size="sm"
          >
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>

          {showCreateGroupDialog && (
            <GroupDialog
              open={showCreateGroupDialog}
              onOpenChange={setShowCreateGroupDialog}
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
              Danh sách nhóm sản phẩm
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {groups && (
            <DataTable
              columns={columns}
              data={groups}
              toolbar={toolbar}
              caption="Danh sách nhóm sản phẩm"
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
      {showDeleteGroupDialog && (
        <ConfirmDialog
          open={showDeleteGroupDialog}
          onOpenChange={setShowDeleteGroupDialog}
          description={`Hành động này không thể hoàn tác. nhóm sản phẩm: ${itemChoice.original?.name} sẽ bị xóa.`}
          onConfirm={() => handleDelete(itemChoice.original?.id)}
          loading={loading}
        />
      )}
      {showUpdateGroupDialog && (
        <GroupDialog
          open={showUpdateGroupDialog}
          onOpenChange={setShowUpdateGroupDialog}
          initialData={{
            ...itemChoice.original,
            categoryId: itemChoice.original?.categoryId?.toString(),
          }}
        />
      )}
    </Layout>
  )
}

export default GroupPage
