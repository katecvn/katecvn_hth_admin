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
import { getCategories } from '@/stores/CategorySlice'
import { deleteNavigation, getNavigation } from '@/stores/NavigationSlice'
import NavigationDialog from './NavigationDialog'

const NavigationPage = () => {
  const dispatch = useDispatch()
  const navigations = useSelector((state) => state.navigation.navigations)
  const loading = useSelector((state) => state.navigation.loading)
  const [showCreateNavigationDialog, setShowCreateNavigationDialog] =
    useState(false)
  const [showDeleteNavigationDialog, setShowDeleteNavigationDialog] =
    useState(false)
  const [showUpdateNavigationDialog, setShowUpdateNavigationDialog] =
    useState(false)
  const [itemChoice, setItemChoice] = useState({})
  const handleDelete = async (id) => {
    try {
      await dispatch(deleteNavigation(id)).unwrap()
    } catch (error) {
      console.error('Error deleting navigation:', error)
    }
  }
  useEffect(() => {
    document.title = 'Quản lý menu'
    dispatch(getNavigation())
    dispatch(getCategories())
  }, [dispatch])
  const columns = [
    {
      accessorKey: 'id',
      header: 'STT',
      cell: ({ row }) => <div className="">{row.index + 1}</div>,
    },
    {
      accessorKey: 'title',
      header: 'Tên menu',
    },
    {
      accessorKey: 'parent',
      header: 'Menu cấp trên',
      cell: ({ row }) => {
        const parent = row.getValue('parent')
        return <div>{parent?.title || ''}</div>
      },
    },
    {
      accessorKey: 'url',
      header: 'Đường dẫn',
    },
    {
      accessorKey: 'position',
      header: 'Vị trí',
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
              setShowUpdateNavigationDialog(true)
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
              setShowDeleteNavigationDialog(true)
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
        <div>
          <Button
            onClick={() => setShowCreateNavigationDialog(true)}
            className="mx-2"
            variant="outline"
            size="sm"
          >
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>

          {showCreateNavigationDialog && (
            <NavigationDialog
              open={showCreateNavigationDialog}
              onOpenChange={setShowCreateNavigationDialog}
              initialData={null}
            />
          )}
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
              Danh sách menu
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {navigations && (
            <DataTable
              columns={columns}
              data={navigations}
              toolbar={toolbar}
              caption="Danh sách menu"
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
      {showDeleteNavigationDialog && (
        <ConfirmDialog
          open={showDeleteNavigationDialog}
          onOpenChange={setShowDeleteNavigationDialog}
          description={`Hành động này không thể hoàn tác. menu: ${itemChoice.original?.title} sẽ bị xóa.`}
          onConfirm={() => handleDelete(itemChoice.original?.id)}
          loading={loading}
        />
      )}
      {showUpdateNavigationDialog && (
        <NavigationDialog
          open={showUpdateNavigationDialog}
          onOpenChange={setShowUpdateNavigationDialog}
          initialData={{
            ...itemChoice.original,
            position: itemChoice.original?.position?.toString(),
          }}
        />
      )}
    </Layout>
  )
}

export default NavigationPage
