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
import { ConfirmDialog } from '@/components/ComfirmDialog'
import {
  createSpecificationGroup,
  updateSpecificationGroup,
} from '@/stores/SpecificationGroupSlice'
import { specificationGroupSchema } from './SchemaSpecificationGroup'

const SpecificationGroupDialog = ({
  open,
  onOpenChange,
  initialData = null,
  showTrigger = true,
  ...props
}) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.specificationGroup.loading)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [formError, setFormError] = useState(null)

  const isEditing = !!initialData
  const form = useForm({
    resolver: zodResolver(specificationGroupSchema),
    defaultValues: {
      name: initialData?.name || '',
      position: initialData?.position ? String(initialData?.position) : '0',
    },
  })

  const onSubmit = async (data) => {
    try {
      setFormError(null)
      const payload = {
        ...data,
      }

      if (isEditing) {
        await dispatch(
          updateSpecificationGroup({ id: initialData.id, data: payload }),
        ).unwrap()
      } else {
        await dispatch(createSpecificationGroup(payload)).unwrap()
      }
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
    } finally {
      form.reset()
      onOpenChange?.(false)
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

      <DialogContent className="md:h-auto md:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? 'Cập nhật nhóm thông số sản phẩm'
              : 'Thêm nhóm thông số sản phẩm mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Chỉnh sửa thông tin nhóm thông số sản phẩm bên dưới'
              : 'Điền vào chi tiết phía dưới để thêm nhóm thông số sản phẩm mới'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto p-1 md:max-h-[75vh]">
          <Form {...form}>
            <form
              id="specification-group-form"
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
                      <FormLabel required={true}>tên nhóm thông số</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập tên nhóm thông số"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
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
                  name="position"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel required={true}>Vị trí</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                      {formError && (
                        <div className="mb-4 text-sm text-red-500">
                          {formError?.position}
                        </div>
                      )}
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
          <Button form="specification-group-form" loading={loading}>
            {isEditing ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
      {confirmOpen && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          description="Hành động này sẽ thay đổi thông tin nhóm thông số sản phẩm."
          onConfirm={() => onSubmit(form.getValues())}
          loading={loading}
        />
      )}
    </Dialog>
  )
}

export default SpecificationGroupDialog
