import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import Can from '@/utils/can'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { TrashIcon, Pencil1Icon } from '@radix-ui/react-icons'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import {
  getRewardPointRules,
  deleteRewardPointRule,
} from '@/stores/RewardPointRuleSlice'
import RewardPointRuleDialog from './RewardPointRuleDialog'

const toLabelType = (type) =>
  type === 'order_value' ? 'Theo giá trị đơn' : 'Theo khung giờ'
const formatThreshold = (row) => {
  if (row.original.type === 'order_value')
    return `≥ ${Number(row.original.minOrderValue || 0).toLocaleString('vi-VN')} đ`
  if (row.original.type === 'time_slot')
    return `Trước ${row.original.beforeTime?.slice(0, 5) || '--:--'}`
  return ''
}
const StatusBadge = ({ value }) => (
  <span
    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${value === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
  >
    {value === 'active' ? 'Đang áp dụng' : 'Ngừng áp dụng'}
  </span>
)

const RewardPointRulePage = () => {
  const dispatch = useDispatch()
  const rules = useSelector((s) => s.rewardPointRules.rules)
  const loading = useSelector((s) => s.rewardPointRules.loading)

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [itemChoice, setItemChoice] = useState({})

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteRewardPointRule(id)).unwrap()
    } catch (error) {}
  }

  useEffect(() => {
    document.title = 'Cài đặt điểm thưởng'
    dispatch(getRewardPointRules())
  }, [dispatch])

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'STT',
        cell: ({ row }) => <div>{row.index + 1}</div>,
      },
      {
        accessorKey: 'type',
        header: 'Loại',
        cell: ({ row }) => <div>{toLabelType(row.getValue('type'))}</div>,
      },
      {
        id: 'threshold',
        header: 'Ngưỡng',
        cell: ({ row }) => <div>{formatThreshold(row)}</div>,
      },
      {
        accessorKey: 'points',
        header: 'Điểm',
        cell: ({ row }) => <div>{row.getValue('points')}</div>,
      },
      {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => <StatusBadge value={row.getValue('status')} />,
      },
      {
        id: 'actions',
        header: 'Thao tác',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Can permission="reward_rule_update">
              <Button
                className="text-blue-500"
                variant="outline"
                size="sm"
                title="Cập nhật"
                onClick={() => {
                  setItemChoice(row)
                  setShowUpdateDialog(true)
                }}
              >
                <Pencil1Icon className="h-6 w-6" />
              </Button>
            </Can>
            <Can permission="reward_rule_delete">
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
    ],
    [],
  )

  const toolbar = [
    {
      children: (
        <Can permission="reward_rule_create">
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
            <RewardPointRuleDialog
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
              Cài đặt điểm thưởng
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {rules && (
            <DataTable
              columns={columns}
              data={rules}
              toolbar={toolbar}
              caption="Danh sách quy tắc điểm thưởng"
              searchKey="type"
              searchPlaceholder="Tìm theo loại quy tắc..."
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
          description={`Hành động này không thể hoàn tác. Quy tắc sẽ bị xóa.`}
          onConfirm={() => handleDelete(itemChoice.original?.id)}
          loading={loading}
        />
      )}

      {showUpdateDialog && (
        <RewardPointRuleDialog
          open={showUpdateDialog}
          onOpenChange={setShowUpdateDialog}
          initialData={{ ...itemChoice.original }}
        />
      )}
    </Layout>
  )
}

export default RewardPointRulePage
