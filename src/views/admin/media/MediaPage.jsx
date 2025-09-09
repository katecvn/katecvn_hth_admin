import { useEffect, useState, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import Can from '@/utils/can'
import { Button } from '@/components/ui/button'
import {
  PlusIcon,
  ExternalLinkIcon,
  CopyIcon,
  TrashIcon,
  Loader,
  CheckCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Select } from '@/components/ui/select'
import { getMedia, deleteMedia } from '@/stores/MediaSlice'
import MediaUploadDialog from './MediaUploadDialog'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const TYPE_PREFIX = [
  { value: 'images', label: 'Sản phẩm1' },
  { value: 'products', label: 'Sản phẩm' },
  { value: 'categories', label: 'Danh mục' },
  { value: 'brands', label: 'Thương hiệu' },
  { value: 'banners', label: 'Banner' },
  { value: 'others', label: 'Khác' },
]

const CardSkeleton = () => (
  <div className="overflow-hidden rounded-md border bg-background shadow">
    <Skeleton className="aspect-square w-full" />
    <div className="p-3">
      <Skeleton className="mb-2 h-4 w-3/4" />
      <div className="flex justify-between space-x-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
  </div>
)

const MediaPage = ({ onSelectImage }) => {
  const dispatch = useDispatch()
  const files = useSelector((state) => state.media.files)
  const loading = useSelector((state) => state.media.loading)
  const loadingMore = useSelector((state) => state.media.loadingMore)
  const hasMore = useSelector((state) => state.media.hasMore)
  const error = useSelector((state) => state.media.error)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [page, setPage] = useState(1)
  const [prefix, setPrefix] = useState([TYPE_PREFIX[0]])
  const [copied, setCopied] = useState(false)
  const [imageLoaded, setImageLoaded] = useState({})
  
  const observerRef = useRef(null)
  const loadingRef = useRef(null)

  useEffect(() => {
    document.title = 'Quản lý hình ảnh'
    fetchFiles(1, true)
  }, [prefix])
  const handleImageClick = (imageUrl) => {
    if (onSelectImage) {
      onSelectImage(imageUrl)
    }
  }
  const fetchFiles = (pageNum = 1, reset = false) => {
    const formattedPrefix = {}
    if (prefix?.length > 0) {
      prefix.forEach((item, index) => {
        formattedPrefix[`prefix[${index}]`] = item.value
      })
    } else {
      formattedPrefix['prefix[0]'] = 'images'
    }

    dispatch(
      getMedia({
        project: 'shop',
        prefix: formattedPrefix,
        sort: 'desc',
        limit: 50,
        page: pageNum,
        reset,
      }),
    )

    if (reset) {
      setPage(1)
    }
  }

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchFiles(nextPage, false)
    }
  }

  const lastElementObserver = useCallback(
    (node) => {
      if (loadingMore) return;
      
      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          handleLoadMore()
        }
      }, { rootMargin: '200px' })

      if (node) {
        observerRef.current.observe(node)
      }
    },
    [hasMore, loadingMore, page]
  )

  const handleDeleteFile = (file) => {
    setSelectedFile(file)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    try {
      await dispatch(deleteMedia(selectedFile.url)).unwrap()
      toast.success('Xóa thành công')
    } catch (err) {
      toast.error('Xóa thất bại')
    } finally {
      setShowDeleteDialog(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN')
  }
  const handleCopyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied((prev) => ({ ...prev, [url]: true }))
      setTimeout(() => {
        setCopied((prev) => ({ ...prev, [url]: false }))
      }, 2000)
    } catch (error) {
      console.error('Lỗi khi sao chép:', error)
    }
  }

  const handleImageLoaded = (imageUrl) => {
    setImageLoaded(prev => ({
      ...prev,
      [imageUrl]: true
    }))
  }

  return (
    <Layout>
      {}
      <LayoutBody
        className={`flex flex-col ${
          onSelectImage ? 'max-h-[65vh] overflow-auto md:max-h-[75vh]' : ''
        }`}
        fixedHeight
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="mb-2 flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Danh sách hình ảnh
              </h2>
            </div>
          </div>
          <Can permission={'file_upload'}>
            <Button
              onClick={() => setShowUploadDialog(true)}
              className="mx-2"
              variant="outline"
              size="sm"
            >
              <PlusIcon className="mr-2 size-4" aria-hidden="true" />
              Thêm hình ảnh
            </Button>
          </Can>
        </div>

        {/* <div className="mb-4 flex justify-end">
          <Select
            options={TYPE_PREFIX}
            value={prefix}
            onChange={(choice) => setPrefix(choice)}
            placeholder="Chọn loại hình ảnh"
            isMulti
            className="w-1/3"
          />
        </div> */}

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        <div className="-mx-4 flex-1 overflow-auto px-4 py-1">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
              {Array(12).fill(0).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <>
              {files.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <p>Không có hình ảnh nào. Hãy tải lên hình ảnh mới!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                  {files.map((file, index) => (
                    <Card
                      key={file.name}
                      className="overflow-hidden transition-all duration-300 hover:shadow-lg group cursor-pointer"
                      onClick={() =>
                        onSelectImage && handleImageClick(file.url)
                      }
                      ref={index === files.length - 1 ? lastElementObserver : null}
                    >
                      <div className="aspect-square relative overflow-hidden">
                        {!imageLoaded[file.url] && (
                          <Skeleton className="absolute inset-0" />
                        )}
                        <img
                          src={file.url}
                          alt={file.name}
                          className={cn(
                            "h-full w-full object-cover transition-all duration-300 group-hover:scale-110",
                            imageLoaded[file.url] ? "opacity-100" : "opacity-0"
                          )}
                          loading="lazy"
                          onLoad={() => handleImageLoaded(file.url)}
                        />
                      </div>
                      <CardContent className="p-3">
                        <p className="mb-2 text-xs text-gray-500">
                          Ngày tạo: {formatDate(file.createdAt)}
                        </p>
                        <div className="flex justify-between space-x-2 sm:space-x-0.5 md:space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="p-1 sm:h-6 sm:w-6 md:h-8 md:w-8"
                            onClick={() => window.open(file.url, '_blank')}
                            title="Xem ảnh"
                          >
                            <ExternalLinkIcon className="h-3 w-3 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="p-1 sm:h-6 sm:w-6 md:h-8 md:w-8"
                            onClick={() => handleCopyUrl(file.url)}
                            title="Sao chép link"
                          >
                            {copied && copied[file?.url] ? (
                              <CheckCircle className="h-3 w-3 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                            ) : (
                              <CopyIcon className="h-3 w-3 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                            )}
                          </Button>
                          <Can permission={'file_delete'}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="p-1 sm:h-6 sm:w-6 md:h-8 md:w-8"
                              onClick={() => handleDeleteFile(file)}
                              title="Xóa ảnh"
                            >
                              <TrashIcon className="h-3 w-3 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                            </Button>
                          </Can>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

         
              {hasMore && (
                <div 
                  className="mt-6 flex justify-center py-4" 
                  ref={loadingRef}
                >
                  {loadingMore ? (
                    <div className="flex items-center">
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      <span>Đang tải thêm...</span>
                    </div>
                  ) : null}
                </div>
              )}
              
              {!hasMore && files.length > 0 && (
                <div className="mt-6 text-center text-sm text-gray-500 py-4">
                  Đã hiển thị tất cả hình ảnh
                </div>
              )}
              
              {loadingMore && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6 mt-4">
                  {Array(6).fill(0).map((_, index) => (
                    <CardSkeleton key={`loading-more-${index}`} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </LayoutBody>

      {showUploadDialog && (
        <MediaUploadDialog
          open={showUploadDialog}
          onOpenChange={setShowUploadDialog}
          onUploadSuccess={() => fetchFiles(1, true)}
          prefix={prefix}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa hình ảnh</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa hình ảnh này? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {/* {loading ? <Spinner className="mr-2 h-4 w-4" /> : null} */}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  )
}

export default MediaPage
