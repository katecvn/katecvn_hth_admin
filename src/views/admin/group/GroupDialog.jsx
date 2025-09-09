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
import { createGroupSchema } from './SchemaGroup'
import { createGroup, updateGroup } from '@/stores/GroupSlice'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import { toSlug } from '@/utils/to-slug'
import MultipleSelector from '@/components/custom/MultiSelector'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const GroupDialog = ({
  open,
  onOpenChange,
  initialData = null,
  showTrigger = true,
  ...props
}) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.category.loading)
  const productOptions = useSelector((state) => state.option.options)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const isEditing = !!initialData

  const getInitialOptionIds = () => {
    if (!initialData?.productGroupOptions) return []
    return initialData.productGroupOptions.map((opt) => ({
      value: opt.id,
      label: opt.name,
    }))
  }

  const form = useForm({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      slug: initialData?.slug || '',
      optionId: initialData?.productGroupOptions?.[0]?.id
        ? String(initialData.productGroupOptions[0].id)
        : '',
    },
  })

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        optionIds: [Number(data.optionId)],
      }

      if (isEditing) {
        await dispatch(
          updateGroup({ id: initialData.id, data: payload }),
        ).unwrap()
      } else {
        await dispatch(createGroup(payload)).unwrap()
      }
      form.reset()
      onOpenChange?.(false)
    } catch (error) {
      {
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
      }
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
            {isEditing ? 'Cập nhật nhóm sản phẩm' : 'Thêm nhóm sản phẩm mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Chỉnh sửa thông tin nhóm sản phẩm bên dưới'
              : 'Điền vào chi tiết phía dưới để thêm nhóm sản phẩm mới'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto p-1 md:max-h-[75vh]">
          <Form {...form}>
            <form
              id="Group-form"
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
                      <FormLabel required={true}>Tên nhóm sản phẩm</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập tên"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            form.setValue('slug', toSlug(e.target.value))
                          }}
                        />
                      </FormControl>
                      <FormMessage />
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
                          placeholder="Nhập đường dẫn"
                          {...field}
                          onChange={(e) => {
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
                  name="description"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập mô tả"
                          {...field}
                          onChange={(e) => {
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
                  name="optionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tùy chọn sản phẩm</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn một tùy chọn" />
                          </SelectTrigger>
                          <SelectContent>
                            {productOptions.map((opt) => (
                              <SelectItem key={opt.id} value={String(opt.id)}>
                                {opt.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
          <Button form="Group-form" loading={loading}>
            {isEditing ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
      {confirmOpen && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          description="Hành động này sẽ thay đổi thông tin nhóm sản phẩm."
          onConfirm={() => onSubmit(form.getValues())}
          loading={loading}
        />
      )}
    </Dialog>
  )
}

export default GroupDialog
