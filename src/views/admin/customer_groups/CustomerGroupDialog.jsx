import { useState, useEffect } from 'react'
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
import {
  createCustomerGroupSchema,
  updateCustomerGroupSchema,
} from './SchemaCustomerGroup'
import {
  createCustomerGroup,
  updateCustomerGroup,
} from '@/stores/CustomerGroupSlice'
import { ConfirmDialog } from '@/components/ComfirmDialog'

const CustomerGroupDialog = ({
  open,
  onOpenChange,
  initialData = null,
  showTrigger = true,
  ...props
}) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.customerGroup.loading)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const isEditing = !!initialData

  const form = useForm({
    resolver: zodResolver(
      isEditing ? updateCustomerGroupSchema : createCustomerGroupSchema,
    ),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
    },
  })

  // đồng bộ lại giá trị khi mở dialog edit
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData?.name || '',
        description: initialData?.description || '',
      })
    }
  }, [initialData, form])

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await dispatch(
          updateCustomerGroup({ id: initialData.id, data }),
        ).unwrap()
      } else {
        await dispatch(createCustomerGroup(data)).unwrap()
      }
      form.reset()
      onOpenChange?.(false)
    } catch (error) {
      const errorMessage =
        error?.response?.data?.messages ||
        error?.message ||
        'Có lỗi xảy ra. Vui lòng thử lại.'

      if (typeof errorMessage === 'object') {
        Object.keys(errorMessage).forEach((field) => {
          form.setError(field, {
            type: 'server',
            message: errorMessage[field],
          })
        })
      } else {
        form.setError('name', {
          type: 'server',
          message: errorMessage,
        })
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
            {isEditing
              ? 'Cập nhật nhóm khách hàng'
              : 'Thêm nhóm khách hàng mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Chỉnh sửa thông tin nhóm khách hàng bên dưới'
              : 'Điền vào chi tiết phía dưới để thêm nhóm khách hàng mới'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto p-1 md:max-h-[75vh]">
          <Form {...form}>
            <form
              id="CustomerGroup-form"
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
                      <FormLabel required={true}>Tên nhóm khách hàng</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập tên nhóm khách hàng"
                          {...field}
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
                        <Input placeholder="Nhập mô tả" {...field} />
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
          <Button form="CustomerGroup-form" loading={loading}>
            {isEditing ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogFooter>
      </DialogContent>

      {confirmOpen && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          description="Hành động này sẽ thay đổi thông tin nhóm khách hàng."
          onConfirm={() => onSubmit(form.getValues())}
          loading={loading}
        />
      )}
    </Dialog>
  )
}

export default CustomerGroupDialog
