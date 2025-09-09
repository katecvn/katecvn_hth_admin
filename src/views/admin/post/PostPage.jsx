import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import Can from '@/utils/can'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { TrashIcon, Pencil1Icon } from '@radix-ui/react-icons'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import {
  deletePost,
  getPost,
  updatePostStatus,
  getPostById,
} from '@/stores/PostSlice'

import PostDialog from './PostDialog'
import { getTopic } from '@/stores/TopicSlice'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { getUsers } from '@/stores/UserSlice'

const PostPage = () => {
  const dispatch = useDispatch()
  const posts = useSelector((state) => state.post.posts)
  const topicList = useSelector((state) => state.topic.topics) || []
  const userList = useSelector((state) => state.user.users) || []
  const postDetail = useSelector((state) => state.post.post)
  const loading = useSelector((state) => state.post.loading)
  const loadingStatus = useSelector(
    (state) => state.post.loadingStatus || false,
  )
  const total = useSelector((state) => state.post.total)
  const [showCreatePostDialog, setShowCreatePostDialog] = useState(false)
  const [showDeletePostDialog, setShowDeletePostDialog] = useState(false)
  const [showUpdatePostDialog, setShowUpdatePostDialog] = useState(false)
  const [itemChoice, setItemChoice] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 30,
  })

  const handleDelete = async (id) => {
    try {
      await dispatch(deletePost(id)).unwrap()
    } catch (error) {
      toast.error('Lỗi khi xóa bài viết')
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await dispatch(
        updatePostStatus({
          id: id,
          status: status,
        }),
      ).unwrap()
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái')
    }
  }

  const handleShowDetail = async (id) => {
    try {
      await dispatch(getPostById(id)).unwrap()
      setShowUpdatePostDialog(true)
    } catch (error) {}
  }

  const handleCloseUpdateDialog = () => {
    setShowUpdatePostDialog(false)
  }

  const statusOptions = [
    {
      value: 'pending',
      label: 'Chờ duyệt',
      className: 'bg-yellow-100 text-yellow-800',
    },
    {
      value: 'draft',
      label: 'Bản nháp',
      className: 'bg-gray-100 text-gray-800',
    },
    {
      value: 'active',
      label: 'Đã duyệt',
      className: 'bg-green-100 text-green-800',
    },
    {
      value: 'published',
      label: 'Đã xuất bản',
      className: 'bg-blue-100 text-blue-800',
    },
  ]

  const getStatusInfo = (status) => {
    return (
      statusOptions.find((option) => option.value === status) ||
      statusOptions[0]
    )
  }

  const handlePaginationChange = async (newPagination) => {
    if (
      newPagination.pageIndex !== pagination.pageIndex ||
      newPagination.pageSize !== pagination.pageSize
    ) {
      dispatch(
        getPost({
          page: newPagination.pageIndex,
          limit: newPagination.pageSize,
        }),
      )

      setPagination(newPagination)
    }
  }

  useEffect(() => {
    document.title = 'Quản lý bài viết'
    dispatch(
      getPost({
        page: 0,
        limit: 30,
      }),
    )

    dispatch(getTopic())
    dispatch(getUsers()).unwrap()
  }, [dispatch])

  const columns = [
    {
      accessorKey: 'id',
      header: 'STT',
      cell: ({ row }) => <div className="">{row.index + 1}</div>,
    },
    {
      accessorKey: 'title',
      header: 'Tên bài viết',
      cell: ({ row }) => {
        const title = row.getValue('title')
        return <div className="max-w-[400px] truncate">{title}</div>
      },
    },
    {
      id: 'topicIds',
      accessorFn: (row) => row.topics[0]?.id,
      header: 'Chủ đề',
      cell: ({ row }) => {
        const topicNames = row.original.topics?.map((t) => t.name).join(', ')
        return (
          <div title={topicNames || 'Không xác định'}>
            {topicNames || (
              <span className="text-muted-foreground">Không xác định</span>
            )}
          </div>
        )
      },
      filterFn: (row, id, valueArr) => {
        if (!Array.isArray(valueArr) || valueArr.length === 0) return true
        const rowTopicIds = row.original.topics?.map((t) => t.id) || []
        return valueArr.some((val) => rowTopicIds.includes(val))
      },
      enableSorting: false,
      enableHiding: true,
      meta: {
        filterType: 'multiselect',
        placeholder: 'Lọc chủ đề',
        options: topicList.map((topic) => ({
          label: topic.name,
          value: topic.id,
        })),
      },
    },
    {
      id: 'authorId',
      accessorFn: (row) => row.author?.id,
      header: 'Tác giả',
      cell: ({ row }) => {
        const author = row.original.author
        return (
          <div title={author?.full_name || 'Không xác định'}>
            {author?.full_name || (
              <span className="text-muted-foreground">Không xác định</span>
            )}
          </div>
        )
      },
      filterFn: (row, id, valueArr) => {
        if (!Array.isArray(valueArr) || valueArr.length === 0) return true
        const authorId = row.original.author?.id
        return valueArr.includes(authorId)
      },
      enableSorting: false,
      enableHiding: true,
      meta: {
        filterType: 'multiselect',
        placeholder: 'Lọc tác giả',
        options: userList.map((item) => ({
          label: item.full_name,
          value: item.id,
        })),
      },
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const post = row.original
        const statusInfo = getStatusInfo(post.status)

        return (
          <div>
            <Select
              value={post.status}
              onValueChange={(value) => handleStatusChange(post.id, value)}
              disabled={loadingStatus}
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
          <Can permission={'post_update'}>
            <Button
              className="text-blue-500"
              variant="outline"
              size="sm"
              title="Chi tiết"
              onClick={() => {
                setItemChoice(row)
                handleShowDetail(row?.original?.id)
              }}
            >
              <Pencil1Icon className="h-6 w-6" />
            </Button>
          </Can>
          <Can permission={'post_delete'}>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500"
              title="Xóa"
              onClick={() => {
                setItemChoice(row)
                setShowDeletePostDialog(true)
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
        <Can permission={'post_create'}>
          <Button
            onClick={() => setShowCreatePostDialog(true)}
            className="mx-2"
            variant="outline"
            size="sm"
          >
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>

          {showCreatePostDialog && (
            <PostDialog
              open={showCreatePostDialog}
              onOpenChange={setShowCreatePostDialog}
              initialData={null}
              page={pagination.pageIndex}
              limit={pagination.pageSize}
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
              Danh sách bài viết
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {posts && (
            <DataTable
              columns={columns}
              data={posts}
              toolbar={toolbar}
              caption="Danh sách bài viết"
              searchKey="name"
              searchPlaceholder="Tìm theo tên..."
              showGlobalFilter={true}
              showColumnFilters={true}
              enableSorting={true}
              loading={loading}
              manualPagination={true}
              pageCount={Math.ceil(total / pagination.pageSize)}
              onPaginationChange={handlePaginationChange}
            />
          )}
        </div>
      </LayoutBody>
      {showDeletePostDialog && (
        <ConfirmDialog
          open={showDeletePostDialog}
          onOpenChange={setShowDeletePostDialog}
          description={`Hành động này không thể hoàn tác. bài viết: ${itemChoice?.original?.title} sẽ bị xóa.`}
          onConfirm={() => handleDelete(itemChoice?.original?.id)}
          loading={loading}
        />
      )}
      {showUpdatePostDialog && postDetail && (
        <PostDialog
          open={showUpdatePostDialog}
          onOpenChange={handleCloseUpdateDialog}
          initialData={{
            ...postDetail,
            topics: postDetail?.topics?.map((ca) => ca.id)[0] || [],
          }}
          page={pagination.pageIndex}
          limit={pagination.pageSize}
        />
      )}
    </Layout>
  )
}

export default PostPage
