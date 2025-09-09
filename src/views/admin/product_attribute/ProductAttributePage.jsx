import React, { useEffect, useState } from 'react'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { getProductAttributes } from '@/stores/ProductAttributeSlice'
import { useDispatch, useSelector } from 'react-redux'
import Can from '@/utils/can'
import { TrashIcon, Pencil1Icon } from '@radix-ui/react-icons'
import ProductAttributeDialog from './ProductAttributeDialog'
import { ConfirmDialog } from '@/components/ComfirmDialog'

const ProductAttributePage = () => {
  const dispatch = useDispatch()
  const productAttributes = useSelector(
    (state) => state.productAttribute.productAttributes,
  )
  const loading = useSelector((state) => state.productAttribute.loading)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [itemChoice, setItemChoice] = useState({})

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteSpecification(id)).unwrap()
    } catch (error) {
      console.error('Error deleting Specification:', error)
    }
  }

  useEffect(() => {
    document.title = 'Quản lý thuộc tính sản phẩm'
    dispatch(getProductAttributes())
  }, [dispatch])

  const columns = [
    {
      accessorKey: 'id',
      header: 'STT',
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: 'name',
      header: 'Tên thuộc tính',
    },
    {
      accessorKey: 'code',
      header: 'Mã',
    },
    {
      accessorKey: 'level',
      header: 'Phân cấp',
    },
    {
      accessorKey: 'inputType',
      header: 'Kiểu nhập',
    },
    {
      accessorKey: 'valueType',
      header: 'Kiểu giá trị',
      cell: ({ row }) => (
        <span>
          {row.original.valueType || (
            <span className="italic text-gray-400">Không có</span>
          )}
        </span>
      ),
    },
    {
      accessorKey: 'unit',
      header: 'Đơn vị',
      cell: ({ row }) => (
        <span>
          {row.original.unit || (
            <span className="italic text-gray-400">Không có</span>
          )}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Can permission={''}>
            <Button
              className="text-blue-500"
              variant="outline"
              size="sm"
              title="Sửa"
              onClick={() => {
                setItemChoice(row)
                setShowUpdateDialog(true)
              }}
            >
              <Pencil1Icon className="h-6 w-6" />
            </Button>
          </Can>
          <Can permission={''}>
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
        <Can permission={''}>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="mx-2"
            variant="outline"
            size="sm"
          >
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>

          {showCreateDialog && (
            <ProductAttributeDialog
              open={showCreateDialog}
              onOpenChange={setShowCreateDialog}
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
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Danh sách thuộc tính sản phẩm</h2>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1">
          <DataTable
            columns={columns}
            data={productAttributes}
            toolbar={toolbar}
            caption="Danh sách thuộc tính"
            searchKey="name"
            searchPlaceholder="Tìm theo tên..."
            showGlobalFilter={true}
            showColumnFilters={false}
            enableSorting={true}
            loading={false}
          />
        </div>
        {showDeleteDialog && (
          <ConfirmDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            description={`Hành động này không thể hoàn tác. Thông số: ${itemChoice.original?.name} sẽ bị xóa.`}
            onConfirm={() => handleDelete(itemChoice?.original?.id)}
            loading={loading}
          />
        )}
        {showUpdateDialog && (
          <ProductAttributeDialog
            open={showUpdateDialog}
            onOpenChange={setShowUpdateDialog}
            initialData={itemChoice.original}
          />
        )}
      </LayoutBody>
    </Layout>
  )
}

export default ProductAttributePage
