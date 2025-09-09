import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  createSpecification,
  updateSpecification,
} from '@/stores/SpecificationSlice'
import { specificationSchema } from './SchemaSpecification'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

const SpecificationDialog = ({
  open,
  onOpenChange,
  initialData = null,
  groupOptions = [],
  showTrigger = true,
  ...props
}) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.specification.loading)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [formError, setFormError] = useState(null)

  const isEditing = !!initialData
  const form = useForm({
    resolver: zodResolver(specificationSchema),
    defaultValues: {
      name: initialData?.name || '',
      groupId: initialData?.groupId ? String(initialData?.groupId) : '',
      isRequired:
        typeof initialData?.isRequired === 'string'
          ? initialData.isRequired
          : initialData?.isRequired
            ? '1'
            : '0',
    },
  })

  const onSubmit = async (data) => {
    try {
      setFormError(null)
      const payload = {
        ...data,
        position: Number(data.position),
      }

      if (isEditing) {
        await dispatch(
          updateSpecification({ id: initialData.id, data: payload }),
        ).unwrap()
      } else {
        await dispatch(createSpecification(payload)).unwrap()
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.messages ||
        error.message ||
        'Có lỗi xảy ra. Vui lòng thử lại.'
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
              ? 'Cập nhật thông số sản phẩm'
              : 'Thêm thông số sản phẩm mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Chỉnh sửa thông tin thông số sản phẩm bên dưới'
              : 'Điền vào các trường dưới đây để thêm mới.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="specification-form"
            onSubmit={async (e) => {
              if (isEditing) {
                e.preventDefault()
                if (await form.trigger()) setConfirmOpen(true)
              } else {
                form.handleSubmit(onSubmit)(e)
              }
            }}
            className="space-y-5 pt-2"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Tên thông số</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên thông số" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Nhóm</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn nhóm" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groupOptions.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-muted-foreground">Không có nhóm nào</div>
                      ) : (
                        groupOptions.map((g) => (
                          <SelectItem key={g.id} value={String(g.id)}>
                            {g.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isRequired"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value === '1'}
                      onCheckedChange={(val) => field.onChange(val ? '1' : '0')}
                    />
                  </FormControl>
                  <FormLabel className="mb-0 cursor-pointer">
                    Bắt buộc
                  </FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className="flex gap-2">
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
          <Button form="specification-form" loading={loading} type="submit">
            {isEditing ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogFooter>
      </DialogContent>

      {confirmOpen && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          description="Hành động này sẽ thay đổi thông tin thông số sản phẩm."
          onConfirm={() => onSubmit(form.getValues())}
          loading={loading}
        />
      )}
    </Dialog>
  )
}

export default SpecificationDialog
