import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import { dateFormat } from '@/utils/date-format'
import Can from '@/utils/can'
import { Button } from '@/components/ui/button'
import { ExternalLink, MessageSquareReply } from 'lucide-react'
import { TrashIcon } from '@radix-ui/react-icons'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import {
  deleteComment,
  getComments,
  updateCommentStatus,
} from '@/views/admin/comment/CommentSlice'
import CommentDialog from './CommentDialog'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

const CommentPage = () => {
  const dispatch = useDispatch()
  const comments = useSelector((state) => state.comment.comments)
  const loading = useSelector((state) => state.comment.loading)
  const [showCreateCommentDialog, setShowCreateCommentDialog] = useState(false)
  const [showDeleteCommentDialog, setShowDeleteCommentDialog] = useState(false)
  const [showUpdateCommentDialog, setShowUpdateCommentDialog] = useState(false)
  const [itemChoice, setItemChoice] = useState({})
  const [replyToComment, setReplyToComment] = useState(null)
  const clientDomain = import.meta.env.VITE_CLIENT_DOMAIN || 'https://katec.vn'

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteComment(id)).unwrap()
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await dispatch(updateCommentStatus({ id, status })).unwrap()
    } catch (error) {
      console.error('Error updating comment status:', error)
    }
  }

  const handlePostClick = (post) => {
    if (post?.slug && post?.topics[0]?.slug) {
      const url = `${clientDomain}/${post.topics[0]?.slug}/${post.slug}`
      window.open(url, '_blank')
    }
  }

  const statusOptions = [
    {
      value: 'active',
      label: 'Đã duyệt',
      className: 'bg-green-100 text-green-800',
    },
    {
      value: 'blocked',
      label: 'Bị chặn',
      className: 'bg-red-100 text-red-800',
    },
    {
      value: 'published',
      label: 'Đã xuất bản',
      className: 'bg-blue-100 text-blue-800',
    },
    {
      value: 'pending',
      label: 'Chờ duyệt',
      className: 'bg-yellow-100 text-yellow-800',
    },
  ]

  const getStatusInfo = (status) => {
    return (
      statusOptions.find((option) => option.value === status) ||
      statusOptions[0]
    )
  }

  useEffect(() => {
    document.title = 'Quản lý bình luận'
    dispatch(getComments())
  }, [dispatch])

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Đã duyệt</Badge>
      case 'blocked':
        return <Badge className="bg-red-500">Bị chặn</Badge>
      case 'published':
        return <Badge className="bg-blue-500">Đã xuất bản</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500">Chờ duyệt</Badge>
      default:
        return <Badge className="bg-gray-500">Không xác định</Badge>
    }
  }

  const columns = [
    // {
    //   accessorKey: 'id',
    //   header: 'STT',
    //   cell: ({ row }) => <div className="">{row.index + 1}</div>,
    // },
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'user',
      header: 'Người bình luận',
      cell: ({ row }) => {
        const user = row.original.user
        const comment = row.original
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user?.full_name || 'Avatar'}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                  {user?.full_name?.charAt(0) || '?'}
                </div>
              )}
              <span>{user?.full_name || 'Không có'}</span>
            </div>

            {comment.parentId && (
              <div className="mt-1 text-xs text-gray-500">
                Trả lời cho ID: {comment.parentId}
                {comment.replyTo && (
                  <p className="ml-1">
                    (Trả lời cho:{' '}
                    {comment.replyToUser?.full_name || 'Người dùng'})
                  </p>
                )}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'content',
      header: 'Nội dung',
      cell: ({ row }) => {
        const comment = row.original
        return (
          <div className=" max-w-[300px]">
            <div
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {comment.content}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'post',
      header: 'Bài viết',
      cell: ({ row }) => {
        const post = row.original.post
        return (
          <div className="flex max-w-[300px] items-center gap-2">
            <div
              className="cursor-pointer  text-blue-600 hover:underline"
              onClick={() => handlePostClick(post)}
              title={post?.title || 'Không có'}
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {post?.title || 'Không có'}
            </div>
            {post?.slug && post?.topics?.[0]?.slug && (
              <ExternalLink size={16} className="flex-shrink-0 text-gray-500" />
            )}
          </div>
        )
      },
    },

    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const comment = row.original
        const statusInfo = getStatusInfo(comment.status)

        return (
          <div>
            <Select
              value={comment.status}
              onValueChange={(value) => handleStatusChange(comment.id, value)}
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
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const comment = row.original
        return (
          <div className="flex gap-2 truncate">
            {/* Reply button */}
            <Button
              variant="outline"
              size="sm"
              className="text-blue-500"
              title="Trả lời bình luận"
              onClick={() => {
                setShowCreateCommentDialog(true)
                // Pre-fill the form with reply info
                setReplyToComment(comment)
              }}
            >
              <MessageSquareReply className="mr-1 h-6 w-6" />
            </Button>

            {/* Delete button */}
            <Button
              variant="outline"
              size="sm"
              className="text-red-500"
              title="Xóa"
              onClick={() => {
                setItemChoice(row)
                setShowDeleteCommentDialog(true)
              }}
            >
              <TrashIcon
                className="h-6 w-6
              "
              />
            </Button>
          </div>
        )
      },
    },
  ]

  const toolbar = [
    {
      children: <Can permission={''}></Can>,
    },
  ]

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách bình luận bài viết
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {comments && (
            <DataTable
              columns={columns}
              data={comments}
              toolbar={toolbar}
              caption="Danh sách bình luận"
              searchKey="content"
              searchPlaceholder="Tìm theo nội dung..."
              showGlobalFilter={true}
              showColumnFilters={true}
              enableSorting={true}
              loading={loading}
            />
          )}
        </div>
      </LayoutBody>
      {showDeleteCommentDialog && (
        <ConfirmDialog
          open={showDeleteCommentDialog}
          onOpenChange={setShowDeleteCommentDialog}
          description={`Hành động này không thể hoàn tác. Bình luận sẽ bị xóa.`}
          onConfirm={() => handleDelete(itemChoice.original?.id)}
          loading={loading}
        />
      )}
      {showUpdateCommentDialog && (
        <CommentDialog
          open={showUpdateCommentDialog}
          onOpenChange={setShowUpdateCommentDialog}
          initialData={itemChoice.original}
          replyToComment={null}
        />
      )}
      {showCreateCommentDialog && (
        <CommentDialog
          open={showCreateCommentDialog}
          onOpenChange={setShowCreateCommentDialog}
          initialData={null}
          replyToComment={replyToComment}
        />
      )}
    </Layout>
  )
}

export default CommentPage
