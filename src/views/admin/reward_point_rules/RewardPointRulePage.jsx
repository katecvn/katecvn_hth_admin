import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import Can from '@/utils/can'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { TrashIcon, Pencil1Icon } from '@radix-ui/react-icons'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  getRewardPointRules,
  deleteRewardPointRule,
} from '@/stores/RewardPointRuleSlice'
import RewardPointRuleDialog from './RewardPointRuleDialog'

const currency = (n) => Number(n || 0).toLocaleString('vi-VN')

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

  const [activeTab, setActiveTab] = useState('order_value')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [itemChoice, setItemChoice] = useState({})

  const orderValueRules = useMemo(
    () => (rules || []).filter((r) => r.type === 'order_value'),
    [rules],
  )
  const timeSlotRules = useMemo(
    () => (rules || []).filter((r) => r.type === 'time_slot'),
    [rules],
  )

  useEffect(() => {
    document.title = 'Cài đặt điểm thưởng'
    dispatch(getRewardPointRules())
  }, [dispatch])

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteRewardPointRule(id)).unwrap()
    } catch {}
  }

  const columnsOrderValue = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'STT',
        cell: ({ row }) => <div>{row.index + 1}</div>,
      },
      {
        id: 'condition',
        header: 'Điều kiện',
        cell: ({ row }) => (
          <div>Đơn hàng ≥ {currency(row.original.minOrderValue)} đ</div>
        ),
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

  const columnsTimeSlot = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'STT',
        cell: ({ row }) => <div>{row.index + 1}</div>,
      },
      {
        id: 'condition',
        header: 'Điều kiện',
        cell: ({ row }) => (
          <div>Đặt trước {row.original.beforeTime?.slice(0, 5) || '--:--'}</div>
        ),
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

  const toolbar = (tab) => [
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
              fixedType={tab}
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
          <h2 className="text-2xl font-bold tracking-tight">
            Cài đặt điểm thưởng
          </h2>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-3">
            <TabsTrigger value="order_value">Theo giá trị đơn</TabsTrigger>
            <TabsTrigger value="time_slot">Theo khung giờ</TabsTrigger>
          </TabsList>

          <TabsContent value="order_value">
            <div className="-mx-4 flex-1 overflow-auto px-4 py-1">
              <DataTable
                columns={columnsOrderValue}
                data={orderValueRules}
                toolbar={toolbar('order_value')}
                caption="Quy tắc theo giá trị đơn"
                searchKey="minOrderValue"
                searchPlaceholder="Tìm theo giá trị..."
                showGlobalFilter={true}
                showColumnFilters={true}
                enableSorting={true}
                loading={loading}
              />
            </div>
          </TabsContent>

          <TabsContent value="time_slot">
            <div className="-mx-4 flex-1 overflow-auto px-4 py-1">
              <DataTable
                columns={columnsTimeSlot}
                data={timeSlotRules}
                toolbar={toolbar('time_slot')}
                caption="Quy tắc theo khung giờ"
                searchKey="beforeTime"
                searchPlaceholder="Tìm theo thời gian..."
                showGlobalFilter={true}
                showColumnFilters={true}
                enableSorting={true}
                loading={loading}
              />
            </div>
          </TabsContent>
        </Tabs>
      </LayoutBody>

      {showDeleteDialog && (
        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          description="Hành động này không thể hoàn tác. Quy tắc sẽ bị xóa."
          onConfirm={() => handleDelete(itemChoice.original?.id)}
          loading={loading}
        />
      )}

      {showUpdateDialog && (
        <RewardPointRuleDialog
          open={showUpdateDialog}
          onOpenChange={setShowUpdateDialog}
          fixedType={activeTab}
          initialData={{ ...itemChoice.original }}
        />
      )}
    </Layout>
  )
}

export default RewardPointRulePage
