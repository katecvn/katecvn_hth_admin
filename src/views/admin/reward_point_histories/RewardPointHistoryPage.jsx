import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import { getHistories } from '@/stores/RewardPointHistorySlice'

const RewardPointHistoryPage = () => {
  const dispatch = useDispatch()
  const { histories, loading } = useSelector((s) => s.rewardPointHistories)

  useEffect(() => {
    document.title = 'Lịch sử điểm thưởng'
    dispatch(getHistories({ page: 1, limit: 9999 }))
  }, [dispatch])

  const columns = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => row.original.id,
    },
    {
      accessorKey: 'user.full_name',
      header: 'Khách hàng',
      cell: ({ row }) => row.original.user?.full_name || '--',
    },
    {
      accessorKey: 'points',
      header: 'Điểm',
      cell: ({ row }) => row.original.points,
    },
    {
      accessorKey: 'type',
      header: 'Loại',
      cell: ({ row }) =>
        row.original.ruleType === 'order_value'
          ? 'Theo giá trị đơn'
          : 'Theo thời gian đặt',
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày tạo',
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleString('vi-VN'),
    },
  ]

  return (
    <Layout>
      <LayoutBody>
        <DataTable
          columns={columns}
          data={histories || []}
          loading={loading}
          caption="Danh sách lịch sử điểm thưởng"
          searchKey="user.full_name"
          searchPlaceholder="Tìm theo tên khách hàng..."
          showGlobalFilter
          enableSorting
          toolbar={[]}
        />
      </LayoutBody>
    </Layout>
  )
}

export default RewardPointHistoryPage
