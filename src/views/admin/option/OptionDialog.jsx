import { useEffect, useState } from 'react'
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
import { createOptionSchema } from './SchemaOption'
import { createOption, updateOption } from '@/stores/OptionSlice'
// import Select from 'react-select'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getGroup } from '@/stores/GroupSlice'
const OptionDialog = ({
  open,
  onOpenChange,
  initialData = null,
  showTrigger = true,
  ...props
}) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.group.loading)
  const productGroups = useSelector((state) => state.group.groups)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const isEditing = !!initialData
  const form = useForm({
    resolver: zodResolver(createOptionSchema),
    defaultValues: {
      name: initialData?.name || '',
      unit: initialData?.unit || '',
    },
  })

  useEffect(() => {
    dispatch(getGroup()).unwrap()
  }, [dispatch])

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
      }

      if (isEditing) {
        await dispatch(
          updateOption({ id: initialData.id, data: payload }),
        ).unwrap()
      } else {
        await dispatch(createOption(payload)).unwrap()
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

        // toast.error(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
      }
    }
  }

  const productGroupOptions = productGroups.map((group) => ({
    ...group,
    value: group.id,
    label: group.name,
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
            {isEditing
              ? 'Cập nhật tùy chọn sản phẩm'
              : 'Thêm tùy chọn sản phẩm mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Chỉnh sửa thông tin tùy chọn sản phẩm bên dưới'
              : 'Điền vào chi tiết phía dưới để thêm tùy chọn sản phẩm mới'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto p-1 md:max-h-[75vh]">
          <Form {...form}>
            <form
              id="option-form"
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
                      <FormLabel required={true}>
                        Tên tùy chọn sản phẩm
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập tên"
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
                  name="unit"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Đơn vị</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập đơn vị"
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
          <Button form="option-form" loading={loading}>
            {isEditing ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
      {confirmOpen && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          description="Hành động này sẽ thay đổi thông tin tùy chọn sản phẩm."
          onConfirm={() => onSubmit(form.getValues())}
          loading={loading}
        />
      )}
    </Dialog>
  )
}

export default OptionDialog
