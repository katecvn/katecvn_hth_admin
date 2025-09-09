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
import { deleteBrand, getBrand } from '@/stores/BrandSlice'
import BrandDialog from './BrandDialog'

const BrandPage = () => {
  const dispatch = useDispatch()
  const brands = useSelector((state) => state.brand.brands)
  const loading = useSelector((state) => state.brand.loading)
  const [showCreateBrandDialog, setShowCreateBrandDialog] = useState(false)
  const [showDeleteBrandDialog, setShowDeleteBrandDialog] = useState(false)
  const [showUpdateBrandDialog, setShowUpdateBrandDialog] = useState(false)
  const [itemChoice, setItemChoice] = useState({})
  const handleDelete = async (id) => {
    try {
      await dispatch(deleteBrand(id)).unwrap()
    } catch (error) {
      console.error('Error deleting Brand:', error)
    }
  }
  useEffect(() => {
    document.title = 'Quản lý thương hiệu'
    dispatch(getBrand())
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
      header: 'Tên thương hiệu',
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
              setShowUpdateBrandDialog(true)
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
              setShowDeleteBrandDialog(true)
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
            onClick={() => setShowCreateBrandDialog(true)}
            className="mx-2"
            variant="outline"
            size="sm"
          >
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>

          {showCreateBrandDialog && (
            <BrandDialog
              open={showCreateBrandDialog}
              onOpenChange={setShowCreateBrandDialog}
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
              Danh sách thương hiệu
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {brands && (
            <DataTable
              columns={columns}
              data={brands}
              toolbar={toolbar}
              caption="Danh sách thương hiệu"
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
      {showDeleteBrandDialog && (
        <ConfirmDialog
          open={showDeleteBrandDialog}
          onOpenChange={setShowDeleteBrandDialog}
          description={`Hành động này không thể hoàn tác. thương hiệu: ${itemChoice.original?.name} sẽ bị xóa.`}
          onConfirm={() => handleDelete(itemChoice.original?.id)}
          loading={loading}
        />
      )}
      {showUpdateBrandDialog && (
        <BrandDialog
          open={showUpdateBrandDialog}
          onOpenChange={setShowUpdateBrandDialog}
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

export default BrandPage
