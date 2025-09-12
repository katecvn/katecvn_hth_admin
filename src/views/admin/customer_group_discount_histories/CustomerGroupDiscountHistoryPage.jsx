import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import { dateFormat } from '@/utils/date-format'
import { getCustomerGroupDiscountHistories } from '@/stores/CustomerGroupDiscountHistorySlice'

const CustomerGroupDiscountHistoryPage = () => {
  const dispatch = useDispatch()
  const histories = useSelector(
    (s) => s.customerGroupDiscountHistory.histories || [],
  )
  const loading = useSelector((s) => s.customerGroupDiscountHistory.loading)

  useEffect(() => {
    document.title = 'Lịch sử giảm giá khách hàng'
    dispatch(getCustomerGroupDiscountHistories())
  }, [dispatch])

  const formatDiscountValue = (value, type) => {
    if (value === null || value === undefined) return ''
    if (type === 'percentage') {
      return `${Number(value)}%`
    }
    if (type === 'fixed') {
      return `${Number(value).toLocaleString('vi-VN')} đ`
    }
    return ''
  }

  const getActionLabel = (row) => {
    const { oldValue, newValue } = row.original
    if ((oldValue === null || oldValue === undefined) && newValue !== null) {
      return <span className="font-medium text-green-600">Tạo mới</span>
    }
    if ((newValue === null || newValue === undefined) && oldValue !== null) {
      return <span className="font-medium text-red-500">Xóa</span>
    }
    return <span className="font-medium text-yellow-600">Cập nhật</span>
  }

  const columns = [
    {
      accessorKey: 'id',
      header: 'STT',
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: 'customerGroup',
      header: 'Phân loại khách hàng',
      cell: ({ row }) => (
        <div>{row.original?.customerGroup?.name || 'Không xác định'}</div>
      ),
    },
    {
      id: 'oldValueFormatted',
      header: 'Giá trị cũ',
      cell: ({ row }) =>
        formatDiscountValue(row.original?.oldValue, row.original?.oldType) ||
        '-',
    },
    {
      id: 'newValueFormatted',
      header: 'Giá trị mới',
      cell: ({ row }) =>
        formatDiscountValue(row.original?.newValue, row.original?.newType) ||
        '-',
    },
    // {
    //   id: 'action',
    //   header: 'Hành động',
    //   cell: (props) => getActionLabel(props.row),
    // },
    {
      accessorKey: 'updatedUser',
      header: 'Người thay đổi',
      cell: ({ row }) =>
        row.original?.updatedUser?.name ||
        row.original?.updatedUser?.email ||
        'Không rõ',
    },
    {
      accessorKey: 'createdAt',
      header: 'Thời gian',
      cell: ({ row }) => <span>{dateFormat(row.getValue('createdAt'))}</span>,
    },
  ]

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            Lịch sử giảm giá theo phân loại khách
          </h2>
        </div>
        <div className="flex-1 overflow-auto px-2 py-1">
          <DataTable
            columns={columns}
            data={histories || []}
            caption="Danh sách lịch sử giảm giá"
            searchKey="customerGroup.name"
            searchPlaceholder="Tìm theo phân loại khách hàng..."
            showGlobalFilter={true}
            showColumnFilters={true}
            enableSorting={true}
            loading={loading}
            toolbar={[]}
          />
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default CustomerGroupDiscountHistoryPage
