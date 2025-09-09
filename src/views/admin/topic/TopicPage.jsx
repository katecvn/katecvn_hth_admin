import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import Can from '@/utils/can'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { TrashIcon, Pencil1Icon } from '@radix-ui/react-icons'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import { deleteTopic, getTopic } from '@/stores/TopicSlice'

import TopicDialog from './TopicDialog'

const TopicPage = () => {
  const dispatch = useDispatch()
  const topics = useSelector((state) => state.topic.topics)
  const loading = useSelector((state) => state.topic.loading)
  const [showCreateTopicDialog, setShowCreateTopicDialog] = useState(false)
  const [showDeleteTopicDialog, setShowDeleteTopicDialog] = useState(false)
  const [showUpdateTopicDialog, setShowUpdateTopicDialog] = useState(false)
  const [itemChoice, setItemChoice] = useState({})
  const handleDelete = async (id) => {
    try {
      await dispatch(deleteTopic(id)).unwrap()
    } catch (error) {
      console.error('Error deleting Topic:', error)
    }
  }
  useEffect(() => {
    document.title = 'Quản lý chủ đề'
    dispatch(getTopic())
  }, [dispatch])
  const columns = [
    {
      accessorKey: 'id',
      header: 'STT',
      cell: ({ row }) => <div className="">{row.index + 1}</div>,
    },
    {
      accessorKey: 'name',
      header: 'Tên chủ đề',
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const status = row.getValue('status')

        const statusMapping = {
          active: { label: 'Hoạt động', bgColor: 'bg-green-300' },
          blocked: { label: 'Bị chặn', bgColor: 'bg-red-300' },
          published: { label: 'Đã xuất bản', bgColor: 'bg-blue-300' },
          pending: { label: 'Đang chờ', bgColor: 'bg-yellow-300' },
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
          <Can permission={'topic_update'}>
            <Button
              className="text-blue-500"
              variant="outline"
              size="sm"
              title="Chi tiết"
              onClick={() => {
                setItemChoice(row)
                setShowUpdateTopicDialog(true)
              }}
            >
              <Pencil1Icon className=" h-6 w-6" />
            </Button>
          </Can>

          <Can permission={'topic_delete'}>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500"
              title="Xóa"
              onClick={() => {
                setItemChoice(row)
                setShowDeleteTopicDialog(true)
              }}
            >
              <TrashIcon className=" h-6 w-6" />
            </Button>
          </Can>
        </div>
      ),
    },
  ]
  const toolbar = [
    {
      children: (
        <Can permission={'topic_create'}>
          <Button
            onClick={() => setShowCreateTopicDialog(true)}
            className="mx-2"
            variant="outline"
            size="sm"
          >
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>

          {showCreateTopicDialog && (
            <TopicDialog
              open={showCreateTopicDialog}
              onOpenChange={setShowCreateTopicDialog}
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
              Danh sách chủ đề
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {topics && (
            <DataTable
              columns={columns}
              data={topics}
              toolbar={toolbar}
              caption="Danh sách chủ đề"
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
      {showDeleteTopicDialog && (
        <ConfirmDialog
          open={showDeleteTopicDialog}
          onOpenChange={setShowDeleteTopicDialog}
          description={`Hành động này không thể hoàn tác. chủ đề: ${itemChoice.original?.name} sẽ bị xóa.`}
          onConfirm={() => handleDelete(itemChoice.original?.id)}
          loading={loading}
        />
      )}
      {showUpdateTopicDialog && (
        <TopicDialog
          open={showUpdateTopicDialog}
          onOpenChange={setShowUpdateTopicDialog}
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

export default TopicPage
