import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog'
import { PlusIcon } from '@radix-ui/react-icons'
import MediaPage from './MediaPage'

const MediaModal = ({
  open,
  onOpenChange,
  showTrigger = true,
  onSelectImage,
  ...props
}) => {
  const handleImageSelect = (imageUrl) => {
    if (onSelectImage) {
      onSelectImage(imageUrl)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button className="mx-2" variant="outline" size="sm">
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>
        </DialogTrigger>
      )}
      <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
        <DialogContent className="md:h-auto md:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Quản lý Media</DialogTitle>
            <DialogDescription>
              {onSelectImage
                ? 'Chọn ảnh bìa cho bài viết của bạn'
                : 'Quản lý và tải lên các tệp media của bạn'}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex-1 overflow-auto">
            <MediaPage onSelectImage={handleImageSelect} />
          </div>

          <DialogFooter className="flex gap-2 sm:space-x-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Đóng
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </div>
    </Dialog>
  )
}

export default MediaModal
