import { getCategories } from '@/stores/CategorySlice'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import { dateFormat } from '@/utils/date-format'
import Can from '@/utils/can'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import CreateCategoryDialog from './CreateCategoryDialog'
import { TrashIcon, Pencil1Icon } from '@radix-ui/react-icons'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import { deleteCategory } from '@/stores/CategorySlice'
import UpdateCategoryDialog from './UpdateCategoryDialog'

const CategoryPage = () => {
  const dispatch = useDispatch()
  const categories = useSelector((state) => state.category.categories)
  const loading = useSelector((state) => state.category.loading)
  const [showCreateCategoryDialog, setShowCreateCategoryDialog] =
    useState(false)
  const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] =
    useState(false)
  const [showUpdateCategoryDialog, setShowUpdateCategoryDialog] =
    useState(false)
  const [itemChoice, setItemChoice] = useState({})
  const handleDelete = async (id) => {
    try {
      await dispatch(deleteCategory(id)).unwrap()
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }
  useEffect(() => {
    document.title = 'Quản lý danh mục'
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
      header: 'Tên danh mục',
    },
    {
      accessorKey: 'parentId',
      header: 'Danh mục cấp trên',
      cell: ({ row }) => {
        const parentId = row.getValue('parentId')
        const parent = categories.find((category) => category.id === parentId)
        return parent ? parent.name : 'Không có'
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
            title="Chi tiết"
            onClick={() => {
              setItemChoice(row)
              setShowUpdateCategoryDialog(true)
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
              setShowDeleteCategoryDialog(true)
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
            onClick={() => setShowCreateCategoryDialog(true)}
            className="mx-2"
            variant="outline"
            size="sm"
          >
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>

          {showCreateCategoryDialog && (
            <CreateCategoryDialog
              open={showCreateCategoryDialog}
              onOpenChange={setShowCreateCategoryDialog}
              showTrigger={false}
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
              Danh sách danh mục
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {categories && (
            <DataTable
              columns={columns}
              data={categories}
              toolbar={toolbar}
              caption="Danh sách danh mục"
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
      {showDeleteCategoryDialog && (
        <ConfirmDialog
          open={showDeleteCategoryDialog}
          onOpenChange={setShowDeleteCategoryDialog}
          description={`Hành động này không thể hoàn tác. Danh mục: ${itemChoice.original?.name} sẽ bị xóa.`}
          onConfirm={() => handleDelete(itemChoice.original?.id)}
          loading={loading}
        />
      )}
      {showUpdateCategoryDialog && (
        <UpdateCategoryDialog
          open={showUpdateCategoryDialog}
          onOpenChange={setShowUpdateCategoryDialog}
          category={itemChoice.original}
          showTrigger={false}
        />
      )}
    </Layout>
  )
}

export default CategoryPage
