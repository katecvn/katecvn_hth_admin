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
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import MediaModal from '../media/MediaModal'
import { ImageIcon } from 'lucide-react'

const VideoDialog = ({ open, onOpenChange, pageId, videoData, id , sectionType}) => {
  const dispatch = useDispatch()
  const [videoPreview, setVideoPreview] = useState('')
  const form = useForm({
    defaultValues: {
      videoUrl: videoData?.videoUrl || '',
      title: videoData?.title || '',
      description: videoData?.description || '',
      imageUrl: videoData?.imageUrl || '',
    },
  })
  const thumbnailValue = form.watch('imageUrl')

  const [mediaModalOpen, setMediaModalOpen] = useState(false)
  const handleImageSelect = (imageUrl) => {
    form.setValue('imageUrl', imageUrl)
    setMediaModalOpen(false)
  }

  useEffect(() => {
    const videoId = extractYouTubeVideoId(form.getValues('videoUrl'))
    setVideoPreview(videoId ? `https://www.youtube.com/embed/${videoId}` : '')
  }, [form.getValues('videoUrl')])

  const onSubmit = async (data) => {
    let dataUpdate = {
      pageId: 1,
      sectionType: sectionType,
      content: [{ ...data }],
      position: 1,
    }
    try {
      if (videoData) {
        await dispatch(
          updatePageSection({
            dataUpdate: dataUpdate,
            sectionId: id,
            pageId: 1,
          }),
        ).unwrap()
      } else {
        await dispatch(
          createPageSection({
            pageId,
            sectionType:sectionType,
            content: [data],
            position: 1,
          }),
        ).unwrap()
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving video:', error)
    }
  }

  const handleVideoUrlChange = (e) => {
    const url = e.target.value
    form.setValue('videoUrl', url)
    const videoId = extractYouTubeVideoId(url)
    setVideoPreview(videoId ? `https://www.youtube.com/embed/${videoId}` : '')
  }

  const extractYouTubeVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/.*(?:\?|&)v=|youtu\.be\/)([^&]+)/)
    return match ? match[1] : null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {videoData ? 'Chỉnh sửa Video' : 'Thêm Video'} {sectionType==='feedback'&&" cảm nhận"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="max-h-[65vh] space-y-4 overflow-auto p-1 md:max-h-[75vh]"
          >
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đường dẫn video (YouTube)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập URL YouTube"
                        {...field}
                        onChange={handleVideoUrlChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {videoPreview && (
              <div className="mt-2">
                <FormLabel>Xem trước</FormLabel>
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    className="h-48 w-full rounded-lg border"
                    src={videoPreview}
                    title="YouTube Video Preview"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ảnh đại diện video</FormLabel>
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
            </div>
            <div className="space-y-2">
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
            </div>

            <div className="space-y-2">
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
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit">{videoData ? 'Cập nhật' : 'Lưu'}</Button>
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

export default VideoDialog
