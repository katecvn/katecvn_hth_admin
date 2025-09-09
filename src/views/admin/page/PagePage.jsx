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
import { deletePage, getPage } from '@/stores/PageSlice'
import PageDialog from './PageDialog'

const PagePage = () => {
  const dispatch = useDispatch()
  const pages = useSelector((state) => state.page?.pages || [])
  const loading = useSelector((state) => state.page.loading)
  const [showCreatePageDialog, setShowCreatePageDialog] = useState(false)
  const [showDeletePageDialog, setShowDeletePageDialog] = useState(false)
  const [showUpdatePageDialog, setShowUpdatePageDialog] = useState(false)
  const [itemChoice, setItemChoice] = useState({})
  const handleDelete = async (id) => {
    try {
      await dispatch(deletePage(id)).unwrap()
    } catch (error) {
      console.error('Error deleting Page:', error)
    }
  }
  useEffect(() => {
    document.title = 'Quản lý trang'
    dispatch(getPage())
  }, [dispatch])
  const columns = [
    {
      accessorKey: 'id',
      header: 'STT',
      cell: ({ row }) => <div className="">{row.index + 1}</div>,
    },
    {
      accessorKey: 'title',
      header: 'Tên trang',
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
              setShowUpdatePageDialog(true)
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
              setShowDeletePageDialog(true)
            }}
            disabled={row.original?.id === 1}
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
            onClick={() => setShowCreatePageDialog(true)}
            className="mx-2"
            variant="outline"
            size="sm"
          >
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>

          {showCreatePageDialog && (
            <PageDialog
              open={showCreatePageDialog}
              onOpenChange={setShowCreatePageDialog}
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
              Danh sách trang
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {pages && (
            <DataTable
              columns={columns}
              data={pages}
              toolbar={toolbar}
              caption="Danh sách trang"
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
      {showDeletePageDialog && (
        <ConfirmDialog
          open={showDeletePageDialog}
          onOpenChange={setShowDeletePageDialog}
          description={`Hành động này không thể hoàn tác. trang: ${itemChoice.original?.title} sẽ bị xóa.`}
          onConfirm={() => handleDelete(itemChoice.original?.id)}
          loading={loading}
        />
      )}
      {showUpdatePageDialog && (
        <PageDialog
          open={showUpdatePageDialog}
          onOpenChange={setShowUpdatePageDialog}
          initialData={{
            ...itemChoice.original,
            position: itemChoice.original?.position?.toString(),
          }}
        />
      )}
    </Layout>
  )
}

export default PagePage
