import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import Can from '@/utils/can'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { TrashIcon, Pencil1Icon } from '@radix-ui/react-icons'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import { getCategories } from '@/stores/CategorySlice'
import { deleteOption, getOption } from '@/stores/OptionSlice'
import OptionDialog from './OptionDialog'

const OptionPage = () => {
  const dispatch = useDispatch()
  const options = useSelector((state) => state.option.options)
  const loading = useSelector((state) => state.option.loading)
  const [showCreateOptionDialog, setShowCreateOptionDialog] = useState(false)
  const [showDeleteOptionDialog, setShowDeleteOptionDialog] = useState(false)
  const [showUpdateOptionDialog, setShowUpdateOptionDialog] = useState(false)
  const [itemChoice, setItemChoice] = useState({})
  const handleDelete = async (id) => {
    try {
      await dispatch(deleteOption(id)).unwrap()
    } catch (error) {
      console.error('Error deleting Option:', error)
    }
  }
  useEffect(() => {
    document.title = 'Quản lý tùy chọn sản phẩm'
    dispatch(getOption())
    dispatch(getCategories())
  }, [dispatch])
  const columns = [
    {
      accessorKey: 'id',
      header: 'STT',
      cell: ({ row }) => <div className="">{row.index + 1}</div>,
    },
    {
      accessorKey: 'name',
      header: 'Tên tùy chọn sản phẩm',
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
              setShowUpdateOptionDialog(true)
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
              setShowDeleteOptionDialog(true)
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
            onClick={() => setShowCreateOptionDialog(true)}
            className="mx-2"
            variant="outline"
            size="sm"
          >
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>

          {showCreateOptionDialog && (
            <OptionDialog
              open={showCreateOptionDialog}
              onOpenChange={setShowCreateOptionDialog}
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
              Danh sách tùy chọn sản phẩm
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {options && (
            <DataTable
              columns={columns}
              data={options}
              toolbar={toolbar}
              caption="Danh sách tùy chọn sản phẩm"
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
      {showDeleteOptionDialog && (
        <ConfirmDialog
          open={showDeleteOptionDialog}
          onOpenChange={setShowDeleteOptionDialog}
          description={`Hành động này không thể hoàn tác. tùy chọn sản phẩm: ${itemChoice.original?.name} sẽ bị xóa.`}
          onConfirm={() => handleDelete(itemChoice.original?.id)}
          loading={loading}
        />
      )}
      {showUpdateOptionDialog && (
        <OptionDialog
          open={showUpdateOptionDialog}
          onOpenChange={setShowUpdateOptionDialog}
          initialData={{
            ...itemChoice.original,
            groupId: itemChoice.original?.groupId?.toString(),
          }}
        />
      )}
    </Layout>
  )
}

export default OptionPage
