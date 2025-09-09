import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import Can from '@/utils/can'
import { Button } from '@/components/ui/button'
import { TrashIcon, Pencil1Icon } from '@radix-ui/react-icons'
import { ConfirmDialog } from '@/components/ComfirmDialog'

import VariantDialog from './VariantDialog'
import {
  deleteProductVariant,
  getProductVariants,
} from '@/stores/ProductVariantSlice'
import formatNumber from '@/utils/formatNumber'

const VariantPage = () => {
  const dispatch = useDispatch()
  const variants = useSelector((state) => state.productVariant.productVariants)
  const loading = useSelector((state) => state.productVariant.loading)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [itemChoice, setItemChoice] = useState({})

  const handleDelete = async (id) => {
    try {
      dispatch(deleteProductVariant(id))
    } catch (error) {
      console.error('Error deleting :', error)
    }
  }

  useEffect(() => {
    document.title = 'Quản lý biến thể'
    dispatch(getProductVariants())
  }, [dispatch])

  const columns = [
    {
      accessorKey: 'id',
      header: 'STT',
      cell: ({ row }) => <div className="">{row.index + 1}</div>,
    },
    {
      accessorKey: 'sku',
      header: 'Mã biến thể',
    },
    {
      accessorKey: 'productId',
      header: 'Sản phẩm',
      cell: ({ row }) => {
        const productName = row?.original?.product?.name

        return <span>{productName}</span>
      },
    },
    {
      accessorKey: 'originalPrice',
      header: 'Giá gốc',
      cell: ({ row }) => {
        const originalPrice = row?.original?.originalPrice || 0

        return <span>{formatNumber(originalPrice)}</span>
      },
    },
    {
      accessorKey: 'salePrice',
      header: 'Giá bán',
      cell: ({ row }) => {
        const salePrice = row?.original?.salePrice || 0

        return <span>{formatNumber(salePrice)}</span>
      },
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const status = row.getValue('status')

        const statusMapping = {
          active: { label: 'Hoạt động', bgColor: 'bg-green-300' },
          hide: { label: 'Ẩn', bgColor: 'bg-red-300' },
        }

        const { label, bgColor } = statusMapping[status] || {
          label: 'Không xác định',
          bgColor: 'bg-gray-500',
        }

        return (
          <span className={`rounded-md px-3 py-1 text-white ${bgColor}`}>
            {label}
          </span>
        )
      },
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
              title="Chi tiết"
              onClick={() => {
                setItemChoice(row)
                setShowUpdateDialog(true)
              }}
            >
              <Pencil1Icon className=" h-6 w-6" />
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
              <TrashIcon className=" h-6 w-6" />
            </Button>
          </Can>
        </div>
      ),
    },
  ]
  const toolbar = []

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách chủ đề
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {variants && (
            <DataTable
              columns={columns}
              data={variants}
              toolbar={toolbar}
              caption="Danh sách biến thể"
              searchKey="sku"
              searchPlaceholder="Tìm theo tên..."
              showGlobalFilter={true}
              showColumnFilters={true}
              enableSorting={true}
              loading={loading}
            />
          )}
        </div>
      </LayoutBody>
      {showDeleteDialog && (
        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          description={`Hành động này không thể hoàn tác. Biến thể: ${itemChoice.original?.sku} sẽ bị xóa.`}
          onConfirm={() => handleDelete(itemChoice.original?.id)}
          loading={loading}
        />
      )}
      {showUpdateDialog && (
        <VariantDialog
          open={showUpdateDialog}
          onOpenChange={setShowUpdateDialog}
          initialData={{
            ...itemChoice.original,
          }}
        />
      )}
    </Layout>
  )
}

export default VariantPage
