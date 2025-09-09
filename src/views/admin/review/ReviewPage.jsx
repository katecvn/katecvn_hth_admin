import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { DataTable } from '@/components/DataTable'
import { dateFormat } from '@/utils/date-format'
import Can from '@/utils/can'
import { Button } from '@/components/ui/button'
import { PlusIcon, StarIcon } from 'lucide-react'
import { TrashIcon } from '@radix-ui/react-icons'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import {
  deleteReview,
  getReviews,
  updateReviewStatus,
} from '@/stores/ReviewSlice'
import ReviewDialog from './ReviewDialog'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

const ReviewPage = () => {
  const dispatch = useDispatch()
  const reviews = useSelector((state) => state.review.reviews)
  const reviewDetail = useSelector((state) => state.review.review)
  const loading = useSelector((state) => state.review.loading)

  const [showCreateReviewDialog, setShowCreateReviewDialog] = useState(false)
  const [showDeleteReviewDialog, setShowDeleteReviewDialog] = useState(false)
  const [showUpdateReviewDialog, setShowUpdateReviewDialog] = useState(false)
  const [itemChoice, setItemChoice] = useState({})

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteReview(id)).unwrap()
      setShowDeleteReviewDialog(false)
    } catch (error) {
      console.error('Error deleting review:', error)
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await dispatch(
        updateReviewStatus({
          id,
          status: status,
        }),
      ).unwrap()
    } catch (error) {
      console.error('Error updating review status:', error)
    }
  }

  useEffect(() => {
    dispatch(getReviews())
  }, [dispatch])

  const statusOptions = [
    {
      value: 'active',
      label: 'Đã duyệt',
      className: 'bg-green-100 text-green-800',
    },
    {
      value: 'blocked',
      label: 'Chờ duyệt',
      className: 'bg-yellow-100 text-yellow-800',
    },
  ]

  const getStatusInfo = (status) => {
    const statusValue = status
    return (
      statusOptions.find((option) => option.value === statusValue) ||
      statusOptions[1]
    )
  }

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <StarIcon
          key={i}
          className={`h-4 w-4 ${
            i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))
  }

  const multiLineEllipsis = {
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }

  const columns = [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'ableId',
      header: 'Sản phẩm',
      cell: ({ row }) => {
        const product = row?.original?.product
        return (
          <div
            className="flex max-w-xs flex-col items-center justify-center"
            style={multiLineEllipsis}
            title={product.name}
          >
            <p>{product.name}</p>
          </div>
        )
      },
    },
    {
      accessorKey: 'user',
      header: 'Người dùng',
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.original.user?.full_name || ''}
        </div>
      ),
    },
    {
      accessorKey: 'rating',
      header: 'Đánh giá',
      cell: ({ row }) => (
        <div className="flex items-center">
          {renderStars(row.original.rating)}
          {/* <span className="ml-2">{row.original.rating}/5</span> */}
        </div>
      ),
    },
    {
      accessorKey: 'reviewText',
      header: 'Nội dung',
      cell: ({ row }) => (
        <div
          className="max-w-xs"
          style={multiLineEllipsis}
          title={row.original.reviewText}
        >
          {row.original.reviewText}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const review = row.original
        const statusValue = review.status
        const statusInfo = getStatusInfo(review.status)

        return (
          <div>
            <Select
              value={statusValue}
              onValueChange={(value) => handleStatusChange(review.id, value)}
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
      cell: ({ row }) => dateFormat(row?.original?.createdAt),
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const review = row.original
        return (
          <div className="flex gap-2">
            {/* <Can permission="DELETE_REVIEW"> */}
            <Button
              onClick={() => {
                setItemChoice(review)
                setShowDeleteReviewDialog(true)
              }}
              variant="outline"
              size="sm"
              className="text-red-500"
              title="Xóa đánh giá"
            >
              <TrashIcon className="h-6 w-6" />
            </Button>
            {/* </Can> */}
          </div>
        )
      },
    },
  ]

  const toolbar = [
    {
      children: (
        <Can permission="ADD_REVIEW">
          <Button
            onClick={() => setShowCreateReviewDialog(true)}
            className="mx-2"
            variant="outline"
            size="sm"
          >
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm đánh giá
          </Button>
        </Can>
      ),
    },
  ]

  return (
    <Layout title="Quản lý đánh giá sản phẩm">
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Đánh giá sản phẩm
            </h2>
          </div>
        </div>

        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {reviews && (
            <DataTable
              columns={columns}
              data={reviews || []}
              toolbar={toolbar}
              caption="Danh sách đánh giá sản phẩm"
              searchKey="reviewText"
              searchPlaceholder="Tìm kiếm..."
              showGlobalFilter={true}
              showColumnFilters={true}
              enableSorting={true}
              loading={loading}
            />
          )}
        </div>

        <ReviewDialog
          open={showCreateReviewDialog}
          onOpenChange={setShowCreateReviewDialog}
          showTrigger={false}
        />

        <ReviewDialog
          open={showUpdateReviewDialog}
          onOpenChange={setShowUpdateReviewDialog}
          initialData={reviewDetail}
          showTrigger={false}
        />

        <ConfirmDialog
          title="Xóa đánh giá"
          description="Bạn có chắc chắn muốn xóa đánh giá này không?"
          open={showDeleteReviewDialog}
          onOpenChange={setShowDeleteReviewDialog}
          onConfirm={() => handleDelete(itemChoice.id)}
          loading={loading}
        />
      </LayoutBody>
    </Layout>
  )
}

export default ReviewPage
