import { useState, useEffect, useRef } from 'react'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import TextEditor from '@/components/ui/TextEditor'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createPost, updatePost } from '@/stores/PostSlice'
import { createPostSchema } from './SchemaPost'
import { ImageIcon } from 'lucide-react'
import MediaModal from '../media/MediaModal'
import { Textarea } from '@/components/ui/textarea'

const PostDialog = ({
  open,
  onOpenChange,
  initialData = null,
  showTrigger = true,
  page,
  limit,
  ...props
}) => {
  const dispatch = useDispatch()
  const topics = useSelector((state) => state.topic.topics)
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isSlugEdited, setIsSlugEdited] = useState(false)
  const editorRef = useRef(null)

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .normalize('NFD') // Loại bỏ dấu tiếng Việt
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu "-"
      .replace(/[^a-z0-9-]/g, '') // Xóa ký tự đặc biệt
      .replace(/-+/g, '-') // Xóa dấu "-" dư thừa
  }
  const handleImageSelect = (imageUrl) => {
    form.setValue('thumbnail', imageUrl)
    setIsMediaModalOpen(false)
  }
  const handleImageSelectImage = async (imageUrl) => {
    if (imageUrl) {
      const imageHTML = `<img src="${imageUrl}" alt="inserted image" />`
      editorRef.current?.insertHTML(imageHTML)
    }
    setIsImageModalOpen(false)
  }

  const [loading, setLoading] = useState(false)
  const [editorContent, setEditorContent] = useState('')

  const isEditing = !!initialData

  const getDefaultValues = () => {
    if (!initialData) {
      return {
        title: '',
        content: '',
        topics: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        thumbnail: '',
        shortDescription: '',
        slug: '',
      }
    }

    return {
      title: initialData.title || '',
      slug: initialData.slug || '',
      content: initialData.content || '',
      topics: initialData.topics ? String(initialData.topics) : '',
      meta_title: initialData.meta_title || '',
      meta_description: initialData.meta_description || '',
      meta_keywords: initialData.meta_keywords || '',
      thumbnail: initialData.thumbnail || '',
      shortDescription: initialData.short_description || '',
    }
  }
  const isReadOnly =
    initialData && ['active', 'published'].includes(initialData.status)

  const form = useForm({
    resolver: zodResolver(createPostSchema),
    defaultValues: getDefaultValues(),
    disabled: isReadOnly,
  })

  const title = form.watch('title')

  const thumbnailValue = form.watch('thumbnail')

  useEffect(() => {
    if (initialData && open) {
      const values = getDefaultValues()
      form.reset(values)
      setEditorContent(initialData.content || '')
    }
  }, [initialData, open])

  useEffect(() => {
    form.setValue('content', editorContent)
  }, [editorContent, form])

  useEffect(() => {
    if (!isSlugEdited && initialData?.title !== title) {
      form.setValue('slug', generateSlug(title))
    }
  }, [title, isSlugEdited])

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      const dataTopic = {
        ...data,
        content: editorContent,
        topics: [data.topics],
      }

      if (isEditing) {
        await dispatch(
          updatePost({ id: initialData.id, data: dataTopic, page, limit }),
        ).unwrap()
      } else {
        await dispatch(createPost({ data: dataTopic, page, limit })).unwrap()
      }

      form.reset()
      setEditorContent('')
      onOpenChange?.(false)
    } catch (error) {
      const errorMessage =
        error.response?.data?.messages ||
        error.message ||
        'Có lỗi xảy ra. Vui lòng thử lại.'

      if (typeof errorMessage === 'object') {
        Object.keys(errorMessage).forEach((field) => {
          if (field === 'id') {
            toast.error(errorMessage[field], 'Lỗi')
          } else
            form.setError(field, {
              type: 'server',
              message: errorMessage[field],
            })
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {showTrigger && !isEditing && (
        <DialogTrigger asChild>
          <Button className="mx-2" variant="outline" size="sm">
            Thêm bài viết mới
          </Button>
        </DialogTrigger>
      )}
      <DialogContent
        className="md:h-auto md:max-w-6xl"
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Cập nhật bài viết' : 'Thêm bài viết mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Chỉnh sửa thông tin bài viết bên dưới'
              : 'Điền vào chi tiết phía dưới để thêm bài viết mới'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto p-1 md:max-h-[75vh]">
          <Form {...form}>
            <form id="blog-post-form" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                {/* Title Input */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required={true}>Tiêu đề bài viết</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tiêu đề bài viết" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required={true}>Đường dẫn bài viết</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Đường dẫn bài viết"
                          {...field}
                          onChange={(e) => {
                            setIsSlugEdited(true)
                            field.onChange(e)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả bài viết</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập mô tả bài viết"
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="topics"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required={true}>Chủ đề</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn chủ đề" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {topics.map((topic) => (
                            <SelectItem key={topic.id} value={String(topic.id)}>
                              {topic.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required={true}>Nội dung bài viết</FormLabel>
                      <FormControl>
                        <TextEditor
                          editorRef={editorRef}
                          defaultValue={editorContent}
                          value={editorContent}
                          setContents={editorContent}
                          onChange={(html) => {
                            setEditorContent(html)
                            field.onChange(html)
                          }}
                          placeholder="Nhập nội dung bài viết"
                          height={150}
                          readOnly={isReadOnly}
                          handleManageImage={() => setIsImageModalOpen(true)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="thumbnail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ảnh bìa bài viết</FormLabel>
                      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
                        <div className="flex w-full flex-1 items-center gap-2 md:w-auto">
                          <FormControl className="flex-1">
                            <Input placeholder="Ảnh bìa bài viết" {...field} />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsMediaModalOpen(true)}
                            disabled={isReadOnly}
                          >
                            <ImageIcon className="mr-2 size-4" />
                            Chọn ảnh
                          </Button>
                        </div>

                        {!!thumbnailValue && (
                          <div className="mt-2 w-full rounded-md border border-gray-200 p-2 md:mt-0 md:w-48">
                            <p className="mb-1 text-xs text-gray-500">
                              Xem trước:
                            </p>
                            <div className="relative h-24 w-full overflow-hidden rounded-md bg-gray-100">
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
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Optional Meta Fields */}
                <FormField
                  control={form.control}
                  name="meta_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiêu đề SEO</FormLabel>
                      <FormControl>
                        <Input placeholder="Tiêu đề SEO" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="meta_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả SEO</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Mô tả SEO" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="meta_keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Từ khóa</FormLabel>
                      <FormControl>
                        <Input placeholder="Từ khóa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="flex gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset()
                setEditorContent('') // Reset editor content
              }}
            >
              {isReadOnly ? 'Đóng' : 'Hủy'}
            </Button>
          </DialogClose>

          {!isReadOnly && (
            <Button form="blog-post-form" type="submit" loading={loading}>
              {isEditing ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
      <div className="h-[200px]">
        {isMediaModalOpen && (
          <MediaModal
            open={isMediaModalOpen}
            onOpenChange={setIsMediaModalOpen}
            showTrigger={false}
            onSelectImage={handleImageSelect}
          />
        )}
        {isImageModalOpen && (
          <MediaModal
            open={isImageModalOpen}
            onOpenChange={setIsImageModalOpen}
            showTrigger={false}
            onSelectImage={handleImageSelectImage}
          />
        )}
      </div>
    </Dialog>
  )
}

export default PostDialog
