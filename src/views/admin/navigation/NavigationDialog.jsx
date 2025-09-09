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
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { createNavigation, updateNavigation } from '@/stores/NavigationSlice'
import Select from 'react-select'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import { createNavigationSchema } from './SchemaNavigation'
import { toSlug } from '@/utils/to-slug'

const NavigationDialog = ({
  open,
  onOpenChange,
  initialData = null,
  showTrigger = true,
  ...props
}) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.category.loading)
  const navigations = useSelector((state) => state.navigation.navigations)

  const [confirmOpen, setConfirmOpen] = useState(false)

  const isEditing = !!initialData
  const form = useForm({
    resolver: zodResolver(createNavigationSchema),
    defaultValues: {
      title: initialData?.title || '',
      parentId: initialData?.parentId || null,
      url: initialData?.url || '',
      position: initialData?.position?.toString() || '',
    },
  })

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        parentId: data.parentId?.value || data.parentId || null,
        position: String(data.position || ''),
      }

      if (isEditing) {
        await dispatch(
          updateNavigation({ id: initialData.id, data: payload }),
        ).unwrap()
      } else {
        await dispatch(createNavigation(payload)).unwrap()
      }
      form.reset()
      onOpenChange?.(false)
    } catch (error) {
      const errorMessage =
        error.response?.data?.messages ||
        error.message ||
        'Có lỗi xảy ra. Vui lòng thử lại.'
      console.log(errorMessage, 'errorMessage')
      Object.keys(errorMessage).forEach((field) => {
        form.setError(field, { type: 'server', message: errorMessage[field] })
      })
      console.error('Submit error: ', error)
    }
  }

  const categoryOptions = navigations.map((cat) => ({
    value: cat.id,
    label: cat.title,
  }))

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
            {isEditing ? 'Cập nhật menu' : 'Thêm menu mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Chỉnh sửa thông tin menu bên dưới'
              : 'Điền vào chi tiết phía dưới để thêm menu mới'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto p-1 md:max-h-[75vh]">
          <Form {...form}>
            <form
              id="navigation-form"
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
                  name="title"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Tên menu</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Đường dẫn</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập đường dẫn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Menu cấp trên</FormLabel>
                      <FormControl>
                        <Select
                          options={categoryOptions}
                          value={
                            field.value
                              ? categoryOptions.find(
                                  (option) => option.value === field.value,
                                )
                              : null
                          }
                          onChange={(selectedOption) => {
                            field.onChange(
                              selectedOption ? selectedOption.value : '',
                            )
                          }}
                          placeholder="Chọn"
                          isClearable
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Vị trí</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập vị trí"
                          type="number"
                          {...field}
                        />
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
              onClick={() => form.reset()}
            >
              Hủy
            </Button>
          </DialogClose>
          <Button form="navigation-form" type="submit" loading={loading}>
            {isEditing ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
      {confirmOpen && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          description="Hành động này sẽ thay đổi thông tin menu."
          onConfirm={() => onSubmit(form.getValues())}
          loading={loading}
        />
      )}
    </Dialog>
  )
}

export default NavigationDialog
