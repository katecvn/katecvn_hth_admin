import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import { dateFormat } from '@/utils/date-format'
import Can from '@/utils/can'
import { Button } from '@/components/ui/button'
import { PlusIcon, CloudUploadIcon } from 'lucide-react'
import { TrashIcon, Pencil1Icon } from '@radix-ui/react-icons'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import { getCategories } from '@/stores/CategorySlice'
import { sendProductToBCCU } from '@/stores/ProductSlice'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import ProductDialog from './ProductDialog'
import { getBrand } from '@/stores/BrandSlice'
import {
  getProducts,
  getProduct,
  updateProductStatus,
  deleteProduct,
} from '@/stores/ProductSlice'
import { getSpecifications } from '@/stores/SpecificationSlice'
import { getProductAttributes } from '@/stores/ProductAttributeSlice'
import { getGroup } from '@/stores/GroupSlice'

const ProductPageNew = () => {
  const checkBCCU = import.meta.env.VITE_CHECK_BCCU || 0

  const dispatch = useDispatch()
  const products = useSelector((state) => state.product.products)
  const brands = useSelector((state) => state.brand.brands)
  const categories = useSelector((state) => state.category.categories)
  const productDetail = useSelector((state) => state.product.product)
  const loading = useSelector((state) => state.product.loading)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [showSendToBCCUDialog, setShowSendToBCCUDialog] = useState(false)
  const [itemChoice, setItemChoice] = useState({})

  const statusOptions = [
    {
      value: 'hide',
      label: 'Ẩn',
      className: 'bg-gray-100 text-gray-800',
    },
    {
      value: 'active',
      label: 'Hiển thị',
      className: 'bg-green-100 text-green-800',
    },
    {
      value: 'active_list',
      label: 'Hiển thị danh sách',
      className: 'bg-green-100 text-green-800',
    },
  ]

  const getStatusInfo = (status) => {
    return (
      statusOptions.find((option) => option.value === status) ||
      statusOptions[0]
    )
  }

  const handleStatusChange = async (id, value) => {
    const status = value
    try {
      await dispatch(updateProductStatus({ id, status })).unwrap()
    } catch (error) {
      console.error('Error update Product:', error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteProduct(id)).unwrap()
    } catch (error) {
      console.error('Error deleting Product:', error)
    }
  }

  const handleShowDetail = async (id) => {
    try {
      await dispatch(getProduct(id)).unwrap()
      setShowUpdateDialog(true)
    } catch (error) {
      console.error('Error fetching product detail:', error)
    }
  }

  const handleSendToBCCU = async (id) => {
    try {
      await dispatch(sendProductToBCCU(id)).unwrap()
    } catch (error) {
      console.error('Error sending product to BCCU:', error)
    }
  }

  useEffect(() => {
    document.title = 'Quản lý sản phẩm'
    dispatch(getProducts())
    dispatch(getCategories())
    dispatch(getBrand())
    dispatch(getSpecifications())
    dispatch(getProductAttributes())
    dispatch(getGroup())
  }, [dispatch])

  const columns = [
    {
      accessorKey: 'id',
      header: 'STT',
      cell: ({ row }) => <div className="">{row.index + 1}</div>,
    },
    {
      accessorKey: 'name',
      header: 'Tên sản phẩm',
    },
    {
      id: 'categoryId', // dùng id rõ ràng
      accessorFn: (row) => row.categoryId, // đảm bảo đúng primitive type
      header: 'Danh mục',
      cell: ({ row }) => {
        const categoryName = row.original.category?.name
        return (
          <div
            className="max-w-[200px] truncate"
            title={categoryName || 'Không xác định'}
          >
            {categoryName || (
              <span className="italic text-muted-foreground">
                Không xác định
              </span>
            )}
          </div>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        const categoryId = row.original.categoryId
        return filterValue.includes(categoryId)
      },
      enableSorting: false,
      enableHiding: true,
      meta: {
        filterType: 'multiselect',
        placeholder: 'Lọc danh mục',
        options: categories.map((c) => ({
          label: c.name,
          value: c.id,
        })),
      },
    },
    {
      id: 'brandId',
      accessorFn: (row) => row.brand?.id,
      header: 'Thương hiệu',
      cell: ({ row }) => {
        const brandName = row.original.brand?.name
        return (
          <div
            className="max-w-[200px] truncate"
            title={brandName || 'Không xác định'}
          >
            {brandName || (
              <span className="italic text-muted-foreground">
                Không xác định
              </span>
            )}
          </div>
        )
      },
      filterFn: (row, columnId, filterValue) => {
        const brandId = row.original.brand?.id
        return filterValue.includes(brandId)
      },
      enableSorting: false,
      enableHiding: true,
      meta: {
        filterType: 'multiselect',
        placeholder: 'Lọc thương hiệu',
        options: brands.map((item) => ({
          label: item.name,
          value: item.id,
        })),
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
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const product = row?.original
        const statusInfo = getStatusInfo(product.status)

        return (
          <div>
            <Select
              value={product.status}
              onValueChange={(value) => handleStatusChange(product.id, value)}
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
          <Button
            className="text-blue-500"
            variant="outline"
            size="sm"
            title="Chi tiết"
            onClick={() => {
              setItemChoice(row)
              handleShowDetail(row.original.id)
            }}
          >
            <Pencil1Icon className="h-6 w-6" />
          </Button>
          {parseInt(checkBCCU) === 1 && (
            <Button
              className="text-green-500"
              variant="outline"
              size="sm"
              title="Gửi lên BCCU"
              onClick={() => {
                setItemChoice(row)
                setShowSendToBCCUDialog(true)
              }}
            >
              <CloudUploadIcon className="h-6 w-6" />
            </Button>
          )}

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
            <ProductDialog
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
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách sản phẩm
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {products && (
            <DataTable
              columns={columns}
              data={products}
              toolbar={toolbar}
              caption="Danh sách sản phẩm"
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
      {showDeleteDialog && (
        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          description={`Hành động này không thể hoàn tác. sản phẩm: ${itemChoice.original?.name} sẽ bị xóa.`}
          onConfirm={() => handleDelete(itemChoice.original?.id)}
          loading={loading}
        />
      )}
      {showSendToBCCUDialog && (
        <ConfirmDialog
          open={showSendToBCCUDialog}
          onOpenChange={setShowSendToBCCUDialog}
          description={`Bạn có chắc chắn muốn gửi sản phẩm "${itemChoice.original?.name}" lên BCCU?`}
          onConfirm={() => handleSendToBCCU(itemChoice.original?.id)}
          loading={loading}
        />
      )}
      {showUpdateDialog && productDetail && (
        <ProductDialog
          open={showUpdateDialog}
          onOpenChange={setShowUpdateDialog}
          initialData={{
            ...productDetail,
            imagesUrl:
              productDetail?.imagesUrl !== '' ? productDetail?.imagesUrl : '',
          }}
        />
      )}
    </Layout>
  )
}

export default ProductPageNew
