import { useState } from 'react'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import { createTopic, updateTopic } from '@/stores/TopicSlice'
import { createTopicSchema } from './SchemaTopic'
import { toast } from 'sonner'
import { toSlug } from '@/utils/to-slug'

const types = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'blocked', label: 'Đã chặn' },
  { value: 'published', label: 'Đã xuất bản' },
  { value: 'pending', label: 'Đang chờ' },
]

const TopicDialog = ({
  open,
  onOpenChange,
  initialData = null,
  showTrigger = true,
  ...props
}) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.topic.loading)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [formError, setFormError] = useState(null)

  const isEditing = !!initialData
  const form = useForm({
    resolver: zodResolver(createTopicSchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      status: initialData?.status || 'active',
    },
  })

  const onSubmit = async (data) => {
    try {
      setFormError(null)
      const payload = {
        ...data,
        status: data.status,
      }

      if (isEditing) {
        await dispatch(
          updateTopic({ id: initialData.id, data: payload }),
        ).unwrap()
      } else {
        await dispatch(createTopic(payload)).unwrap()
      }

      form.reset()
      onOpenChange?.(false)
    } catch (error) {
      console.error('Submit error: ', error)
      const errorMessage =
        error.response?.data?.messages ||
        error.message ||
        'Có lỗi xảy ra. Vui lòng thử lại.'
      console.log(errorMessage, 'errorMessage')
      Object.keys(errorMessage).forEach((field) => {
        form.setError(field, { type: 'server', message: errorMessage[field] })
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {showTrigger && !isEditing && (
        <DialogTrigger asChild>
          <Button className="mx-2" variant="outline" size="sm">
            Thêm mới
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="md:h-auto md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Cập nhật chủ đề' : 'Thêm chủ đề mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Chỉnh sửa thông tin chủ đề bên dưới'
              : 'Điền vào chi tiết phía dưới để thêm chủ đề mới'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto p-1 md:max-h-[75vh]">
          <Form {...form}>
            <form
              id="topic-form"
              onSubmit={async (e) => {
                if (isEditing) {
                  e.preventDefault()
                  if (await form.trigger()) {
                    setConfirmOpen(true)
                  }
                } else {
                  form.handleSubmit(onSubmit)(e)
                }
              }}
            >
              <div className="grid gap-4 md:grid-cols-1">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Tên chủ đề</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập tên chủ đề"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            const slugValue = toSlug(e.target.value)
                            form.setValue("slug", slugValue)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                      {formError && (
                        <div className="mb-4 text-sm text-red-500">
                          {formError?.name}
                        </div>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Đường dẫn</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập đưuòng dẫn"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      {formError && (
                        <div className="mb-4 text-sm text-red-500">
                          {formError?.slug}
                        </div>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel required={true}>Chọn trạng thái</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {types.map((type, index) => (
                            <FormItem
                              key={`type-${index}`}
                              className="flex items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <RadioGroupItem value={type.value} />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {type.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
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
                setFormError(null)
              }}
            >
              Hủy
            </Button>
          </DialogClose>
          <Button form="topic-form" loading={loading}>
            {isEditing ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
      {confirmOpen && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          description="Hành động này sẽ thay đổi thông tin chủ đề."
          onConfirm={() => onSubmit(form.getValues())}
          loading={loading}
        />
      )}
    </Dialog>
  )
}

export default TopicDialog
