import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createPageSection, updatePageSection } from '@/stores/PageSlice'
import MediaModal from '../media/MediaModal'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { ImageIcon } from 'lucide-react'

const BannerDialog = ({
  open,
  onOpenChange,
  pageId,
  bannerData,
  id,
  sectionType,
}) => {
  const dispatch = useDispatch()
  const [mediaModalOpen, setMediaModalOpen] = useState(false)
  const isEditing = !!bannerData

  const form = useForm({
    defaultValues: {
      imageUrl: bannerData?.imageUrl || '',
      title: bannerData?.title || '',
      description: bannerData?.description || '',
      link: bannerData?.link || '',
    },
  })

  useEffect(() => {
    if (bannerData) {
      form.reset({
        imageUrl: bannerData.imageUrl || '',
        title: bannerData.title || '',
        description: bannerData.description || '',
        link: bannerData.link || '',
      })
    }
  }, [bannerData, form])

  const thumbnailValue = form.watch('imageUrl')

  const handleImageSelect = (imageUrl) => {
    form.setValue('imageUrl', imageUrl)
    setMediaModalOpen(false)
  }

  const onSubmit = async (data) => {
    let dataUpdate = {
      pageId: 1,
      sectionType: sectionType,
      content: [{ ...data }],
      position: 1,
    }

    try {
      if (isEditing) {
        await dispatch(
          updatePageSection({
            dataUpdate: dataUpdate,
            sectionId: id,
            pageId: pageId,
          }),
        ).unwrap()
      } else {
        await dispatch(
          createPageSection({
            pageId,
            sectionType: sectionType,
            content: [data],
            position: 1,
          }),
        ).unwrap()
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving banner:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {(() => {
              const titleMap = {
                banner: 'Banner',
                partner: 'ảnh',
                video: 'Video',
                feedback: 'Phản hồi',
              }

              const title = titleMap[sectionType] || 'Phần'
              return isEditing ? `Chỉnh sửa ${title}` : `Thêm ${title}`
            })()}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đường dẫn ảnh</FormLabel>
                  <FormControl>
                    <div className="flex space-x-2">
                      <Input placeholder="Nhập đường dẫn ảnh" {...field} />
                      <Button
                        type="button"
                        onClick={() => setMediaModalOpen(true)}
                        variant="outline"
                      >
                        <ImageIcon className="mr-2 size-4" />
                        Chọn ảnh
                      </Button>
                    </div>
                  </FormControl>
                  {!!thumbnailValue && (
                    <div className="mt-2 rounded-md border border-gray-200 p-2">
                      <p className="mb-2 text-sm text-gray-500">Xem trước:</p>
                      <div className="relative h-48 w-full overflow-hidden rounded-md bg-gray-100">
                        <img
                          src={thumbnailValue}
                          alt="Ảnh bìa xem trước"
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            e.target.src = '/image-err.jpg'
                            e.target.onerror = null
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tiêu đề" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Nhập mô tả" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Liên kết</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập liên kết" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit">{isEditing ? 'Cập nhật' : 'Lưu'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
      {mediaModalOpen && (
        <MediaModal
          open={mediaModalOpen}
          onOpenChange={setMediaModalOpen}
          showTrigger={false}
          onSelectImage={handleImageSelect}
        />
      )}
    </Dialog>
  )
}

export default BannerDialog
