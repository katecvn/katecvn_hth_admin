import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import { dateFormat } from '@/utils/date-format'
import {
  getPurchaseOrders,
  getPurchaseOrderDetail,
  getPurchaseSummary,
} from '@/stores/PurchaseOrderSlice'
import { DateRange } from '@/components/custom/DateRange'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import PurchaseOrderDetailDialog from './PurchaseOrderDetailDialog'
import ProductPurchaseDetailDialog from './ProductPurchaseDetailDialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const PurchaseOrderReportPage = () => {
  const dispatch = useDispatch()
  const orders = useSelector((s) => s.purchaseOrder.orders) || []
  const summary = useSelector((s) => s.purchaseOrder.summary) || []
  const orderDetail = useSelector((s) => s.purchaseOrder.order)
  const loading = useSelector((s) => s.purchaseOrder.loading)

  const [dateRange, setDateRange] = useState(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [orderChoice, setOrderChoice] = useState(null)
  const [activeTab, setActiveTab] = useState('orders')

  const [showProductDetail, setShowProductDetail] = useState(false)
  const [productChoice, setProductChoice] = useState(null)

  useEffect(() => {
    const base = { status: 'accepted' }
    const filters =
      dateRange?.from && dateRange?.to ? { ...base, dateRange } : base
    dispatch(getPurchaseOrders(filters))
    dispatch(getPurchaseSummary(filters))
  }, [dispatch, dateRange])

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0)

  const handleShowOrderDetail = async (id, item) => {
    await dispatch(getPurchaseOrderDetail(id)).unwrap()
    setOrderChoice(item)
    setShowOrderDetail(true)
  }

  const handleShowProductDetail = (product) => {
    setProductChoice(product)
    setShowProductDetail(true)
  }

  const orderColumns = [
    { accessorKey: 'id', header: 'STT', cell: ({ row }) => row.index + 1 },
    {
      accessorKey: 'code',
      header: 'Mã đơn mua',
      cell: ({ row }) => row.original.code || `PM${row.original.id}`,
    },
    {
      accessorKey: 'totalAmount',
      header: 'Tổng tiền',
      cell: ({ row }) => formatCurrency(row.original.totalAmount),
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày tạo',
      cell: ({ row }) => dateFormat(row.original.createdAt),
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <Button
          className="text-blue-500"
          variant="outline"
          size="sm"
          onClick={() => handleShowOrderDetail(row.original.id, row.original)}
        >
          <Eye className="h-5 w-5" />
        </Button>
      ),
    },
  ]

  const totalOrders = orders.length
  const totalAmount = orders.reduce(
    (sum, o) => sum + Number(o.totalAmount || 0),
    0,
  )

  const productColumns = [
    { accessorKey: 'idx', header: 'STT', cell: ({ row }) => row.index + 1 },
    { accessorKey: 'productSku', header: 'Mã SP' },
    { accessorKey: 'productName', header: 'Tên sản phẩm' },
    { accessorKey: 'unit', header: 'Đơn vị' },
    {
      accessorKey: 'totalQuantity',
      header: 'Tổng số lượng',
      cell: ({ row }) => row.original.totalQuantity,
    },
    {
      accessorKey: 'totalAmount',
      header: 'Tổng tiền',
      cell: ({ row }) => formatCurrency(row.original.totalAmount),
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <Button
          className="text-blue-500"
          variant="outline"
          size="sm"
          onClick={() => handleShowProductDetail(row.original)}
        >
          <Eye className="h-5 w-5" />
        </Button>
      ),
    },
  ]

  const totalProducts = summary.length
  const totalProductAmount = summary.reduce(
    (sum, p) => sum + Number(p.totalAmount || 0),
    0,
  )

  const toolbar = [
    {
      children: (
        <DateRange
          onChange={(range) => setDateRange(range)}
          defaultValue={dateRange}
        />
      ),
    },
  ]

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <h2 className="mb-2 text-2xl font-bold tracking-tight">
          Tổng hợp mua hàng
        </h2>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="orders">Theo đơn mua</TabsTrigger>
            <TabsTrigger value="products">Theo sản phẩm</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="flex flex-col gap-4">
            <div className="flex gap-6">
              <div className="rounded bg-gray-100 p-3">
                <div className="text-sm text-gray-500">Tổng số đơn</div>
                <div className="text-xl font-bold">{totalOrders}</div>
              </div>
              <div className="rounded bg-gray-100 p-3">
                <div className="text-sm text-gray-500">Tổng giá trị</div>
                <div className="text-xl font-bold">
                  {formatCurrency(totalAmount)}
                </div>
              </div>
            </div>

            <div className="-mx-4 flex-1 overflow-auto px-4 py-1">
              <DataTable
                columns={orderColumns}
                data={orders}
                toolbar={toolbar}
                caption="Chi tiết báo cáo theo đơn"
                searchKey="code"
                searchPlaceholder="Tìm theo mã đơn mua..."
                showGlobalFilter
                enableSorting
                loading={loading}
              />
            </div>
          </TabsContent>

          <TabsContent value="products" className="flex flex-col gap-4">
            <div className="flex gap-6">
              <div className="rounded bg-gray-100 p-3">
                <div className="text-sm text-gray-500">Tổng số sản phẩm</div>
                <div className="text-xl font-bold">{totalProducts}</div>
              </div>
              <div className="rounded bg-gray-100 p-3">
                <div className="text-sm text-gray-500">Tổng tiền</div>
                <div className="text-xl font-bold">
                  {formatCurrency(totalProductAmount)}
                </div>
              </div>
            </div>

            <div className="-mx-4 flex-1 overflow-auto px-4 py-1">
              <DataTable
                columns={productColumns}
                data={summary}
                toolbar={toolbar}
                caption="Chi tiết báo cáo theo sản phẩm"
                searchKey="productName"
                searchPlaceholder="Tìm theo tên sản phẩm..."
                showGlobalFilter
                enableSorting
                loading={loading}
              />
            </div>
          </TabsContent>
        </Tabs>
      </LayoutBody>

      {showOrderDetail && orderChoice && orderDetail && (
        <PurchaseOrderDetailDialog
          open={showOrderDetail}
          onOpenChange={setShowOrderDetail}
          orderData={orderDetail}
        />
      )}

      {showProductDetail && productChoice && (
        <ProductPurchaseDetailDialog
          open={showProductDetail}
          onOpenChange={setShowProductDetail}
          product={productChoice}
        />
      )}
    </Layout>
  )
}

export default PurchaseOrderReportPage
