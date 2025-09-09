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
import { useForm, useFieldArray } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import {
  createProductAttribute,
  updateProductAttribute,
} from '@/stores/ProductAttributeSlice'
import { attributeSchema } from './SchemaProductAttribute'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TrashIcon } from 'lucide-react'

const INPUT_TYPE_OPTIONS = [
  { label: 'Text', value: 'text' },
  { label: 'Number', value: 'number' },
  { label: 'Select', value: 'select' },
]

const VALUE_TYPE_OPTIONS = [
  { label: 'Text', value: 'text' },
  { label: 'Number', value: 'number' },
  { label: 'Boolean', value: 'boolean' },
]

const ProductAttributeDialog = ({
  open,
  onOpenChange,
  initialData = null,
  showTrigger = true,
  ...props
}) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.productAttribute.loading)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [formError, setFormError] = useState(null)

  const isEditing = !!initialData
  const form = useForm({
    resolver: zodResolver(attributeSchema),
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      level: initialData?.level?.toString() || '0',
      inputType: initialData?.inputType || '',
      valueType: initialData?.valueType || '',
      unit: initialData?.unit || '',
      values:
        initialData?.values && Array.isArray(initialData.values)
          ? initialData.values.map((v) =>
              typeof v === 'object' && v !== null
                ? { value: v.value || '' }
                : { value: v || '' },
            )
          : [{ value: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'values',
  })

  const onSubmit = async (data) => {
    try {
      setFormError(null)
      const payload = {
        ...data,
        level: Number(data.level),
        values: data.values.map((v) =>
          typeof v === 'object' && v !== null ? v.value : v,
        ),
      }

      if (isEditing) {
        await dispatch(
          updateProductAttribute({ id: initialData.id, data: payload }),
        ).unwrap()
      } else {
        await dispatch(createProductAttribute(payload)).unwrap()
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

      <DialogContent
        className="md:h-auto md:max-w-2xl"
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? 'Cập nhật thuộc tính sản phẩm'
              : 'Thêm thuộc tính sản phẩm mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Chỉnh sửa thông tin thuộc tính sản phẩm bên dưới'
              : 'Điền vào các trường dưới đây để thêm mới.'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto p-1 md:max-h-[75vh]">
          <Form {...form}>
            <form
              id="attribute-form"
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Tên thuộc tính</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên thuộc tính" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Mã thuộc tính</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập mã thuộc tính" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Vị trí</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} step={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="inputType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kiểu nhập</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn kiểu nhập" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {INPUT_TYPE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
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
                    name="valueType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kiểu giá trị</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn kiểu giá trị" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {VALUE_TYPE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
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
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Đơn vị</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập đơn vị (tùy chọn)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  {/* FieldArray: danh sách giá trị thuộc tính */}
                  <FormField
                    control={form.control}
                    name="values"
                    render={() => (
                      <FormItem>
                        <FormLabel required>Giá trị thuộc tính</FormLabel>
                        <div className="space-y-2 overflow-y-auto pr-2">
                          {fields.map((field, idx) => (
                            <div
                              key={field.id}
                              className="flex items-center gap-2"
                            >
                              <Input
                                {...form.register(`values.${idx}.value`)}
                                placeholder={`Giá trị ${idx + 1}`}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => remove(idx)}
                                disabled={fields.length === 1}
                                title="Xóa giá trị"
                                className="text-red-500"
                              >
                                <TrashIcon />
                              </Button>
                              {/* Lỗi từng field */}
                              {form.formState.errors.values &&
                                Array.isArray(form.formState.errors.values) &&
                                form.formState.errors.values[idx]?.value
                                  ?.message && (
                                  <span className="text-xs text-red-500">
                                    {
                                      form.formState.errors.values[idx].value
                                        .message
                                    }
                                  </span>
                                )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ value: '' })}
                          >
                            + Thêm giá trị
                          </Button>
                        </div>
                        {/* Lỗi tổng array */}
                        {form.formState.errors.values &&
                          !Array.isArray(form.formState.errors.values) &&
                          form.formState.errors.values.message && (
                            <span className="text-xs text-red-500">
                              {form.formState.errors.values.message}
                            </span>
                          )}
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </form>
          </Form>
        </div>

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
          <Button
            form="attribute-form"
            loading={loading || undefined}
            type="submit"
          >
            {isEditing ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogFooter>
      </DialogContent>

      {confirmOpen && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          description="Hành động này sẽ thay đổi thông tin thuộc tính sản phẩm."
          onConfirm={() => onSubmit(form.getValues())}
          loading={loading}
        />
      )}
    </Dialog>
  )
}

export default ProductAttributeDialog
