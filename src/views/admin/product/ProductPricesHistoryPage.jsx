import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import { Button } from '@/components/ui/button'
import { dateFormat } from '@/utils/date-format'
import { getUsers } from '@/stores/UserSlice'
import {
  getProductsByCustomer,
  getProductPriceHistoryByCustomer,
} from '@/stores/ProductSlice'
import { ChevronDown, ChevronRight } from 'lucide-react'

const ProductPriceHistoryPage = () => {
  const dispatch = useDispatch()
  const customers = useSelector((s) => s.user.users) || []
  const customerProducts = useSelector((s) => s.product.customerProducts) || {}
  const priceHistories = useSelector((s) => s.product.priceHistories) || {}
  const loading = useSelector((s) => s.product.loading)

  const [expandedCustomers, setExpandedCustomers] = useState([])
  const [expandedProducts, setExpandedProducts] = useState({})

  useEffect(() => {
    document.title = 'Lịch sử giá theo khách hàng'
    dispatch(getUsers({ type: 'customer' }))
  }, [dispatch])

  const toggleCustomerExpand = async (id) => {
    if (expandedCustomers.includes(id)) {
      setExpandedCustomers((prev) => prev.filter((cid) => cid !== id))
    } else {
      await dispatch(getProductsByCustomer(id)).unwrap()
      setExpandedCustomers((prev) => [...prev, id])
    }
  }

  const toggleProductExpand = async (customerId, productId) => {
    const key = `${customerId}-${productId}`
    if (expandedProducts[key]) {
      setExpandedProducts((prev) => {
        const copy = { ...prev }
        delete copy[key]
        return copy
      })
    } else {
      const res = await dispatch(
        getProductPriceHistoryByCustomer({ customerId, productId }),
      ).unwrap()
      setExpandedProducts((prev) => ({ ...prev, [key]: res.histories }))
    }
  }

  const columns = [
    {
      accessorKey: 'id',
      header: '',
      cell: ({ row }) => {
        const customer = row.original
        const isExpanded = expandedCustomers.includes(customer.id)
        return (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleCustomerExpand(customer.id)}
          >
            {isExpanded ? <ChevronDown /> : <ChevronRight />}
          </Button>
        )
      },
    },
    {
      accessorKey: 'full_name',
      header: 'Khách hàng',
      cell: ({ row }) =>
        row.original.full_name || row.original.email || 'Không rõ',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày tạo',
      cell: ({ row }) => dateFormat(row.original.createdAt),
    },
  ]

  const renderProductList = (customer) => {
    const products = customerProducts[customer.id] || []
    if (!products.length) {
      return (
        <div className="ml-8 pl-4 italic text-gray-500">
          Khách này chưa có sản phẩm áp dụng giá
        </div>
      )
    }

    return (
      <div className="ml-8 border-l pl-4">
        <h4 className="mb-2 font-semibold">Sản phẩm áp dụng giá</h4>
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Tên sản phẩm</th>
              <th className="p-2 text-left">Giá hiện tại</th>
              <th className="p-2 text-left">Giá gốc</th>
              <th className="p-2 text-left">Xem lịch sử</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod, idx) => {
              const key = `${customer.id}-${prod.id}`
              return (
                <tr key={prod.id} className="border-b">
                  <td className="p-2">{idx + 1}</td>
                  <td className="p-2">{prod.name}</td>
                  <td className="p-2">
                    {Number(prod.salePrice).toLocaleString('vi-VN')} đ
                  </td>
                  <td className="p-2">
                    {Number(prod.originalPrice).toLocaleString('vi-VN')} đ
                  </td>
                  <td className="p-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleProductExpand(customer.id, prod.id)}
                    >
                      {expandedProducts[key] ? 'Ẩn' : 'Xem'}
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {products.map((prod) => {
          const key = `${customer.id}-${prod.id}`
          const histories = priceHistories[key]
          if (!expandedProducts[key]) return null
          return (
            <div key={key} className="ml-8 mt-2 border-l pl-4">
              <h5 className="font-medium">
                Lịch sử thay đổi giá - {prod.name}
              </h5>
              <table className="mt-1 w-full border text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-2">Thời gian</th>
                    <th className="p-2">Người thay đổi</th>
                    <th className="p-2">Nguyên nhân</th>
                    <th className="p-2">Giá trị cũ</th>
                    <th className="p-2">Giá trị mới</th>
                  </tr>
                </thead>
                <tbody>
                  {!histories || histories.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-2 text-center italic">
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    histories.map((h) => (
                      <tr key={h.id} className="border-b">
                        <td className="p-2">{dateFormat(h.createdAt)}</td>
                        <td className="p-2">
                          {h.updatedUser?.name || h.updatedUser?.email}
                        </td>
                        <td className="p-2">
                          {h.reason ||
                            (h.type === 'percentage'
                              ? `Giảm ${h.value}%`
                              : h.type === 'fixed'
                                ? `Giảm ${Number(h.value).toLocaleString('vi-VN')} đ`
                                : 'Thay đổi giá gốc')}
                        </td>
                        <td className="p-2">
                          {h.oldValue
                            ? Number(h.oldValue).toLocaleString('vi-VN')
                            : '-'}
                        </td>
                        <td className="p-2">
                          {h.newValue
                            ? Number(h.newValue).toLocaleString('vi-VN')
                            : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Lịch sử giá theo khách hàng
          </h2>
        </div>
        <div className="flex-1 overflow-auto px-2 py-1">
          <DataTable
            columns={columns}
            data={customers}
            caption="Danh sách khách hàng"
            searchKey="full_name"
            searchPlaceholder="Tìm khách hàng..."
            loading={loading}
            showGlobalFilter={true}
            showColumnFilters={true}
            enableSorting={true}
            toolbar={[]}
            renderSubComponent={(row) => renderProductList(row.original)}
          />
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default ProductPriceHistoryPage
