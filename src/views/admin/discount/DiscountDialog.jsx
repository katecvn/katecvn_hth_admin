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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import { createDiscount, updateDiscount } from '@/stores/DiscountSlice'
import { getProduct } from '@/stores/ProductSlice'
import { createDiscountSchema } from './SchemaDiscount'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const discountTypes = [
  { value: 'percentage', label: 'Phần trăm (%)' },
  { value: 'fixed', label: 'Số tiền cố định' },
  { value: 'free_shipping', label: 'Miễn phí vận chuyển' },
  // { value: 'buy_x_get_y', label: 'Mua X tặng Y' },
]

const DiscountDialog = ({
  open,
  onOpenChange,
  initialData = null,
  showTrigger = true,
  ...props
}) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.discount.loading)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [formError, setFormError] = useState(null)
  const productVariants = useSelector(
    (state) => state.productVariant.productVariants,
  )

  const formatDateForInput = (isoDateString) => {
    if (!isoDateString) return ''
    try {
      const date = new Date(isoDateString)
      return date.toISOString().split('T')[0]
    } catch (error) {
      console.error('Lỗi chuyển đổi định dạng ngày:', error)
      return ''
    }
  }
  useEffect(() => {
    if (open && productVariants.length === 0) {
      dispatch(getProduct())
    }
  }, [open, productVariants.length, dispatch])

  const isEditing = !!initialData
  const form = useForm({
    resolver: zodResolver(createDiscountSchema),
    defaultValues: {
      code: initialData?.code || '',
      type: initialData?.type || 'fixed',
      value: Number(initialData?.value) || '',
      minOrderAmount: Number(initialData?.minOrderAmount) || '',
      maxDiscount: Number(initialData?.maxDiscount) || '',
      startDate: formatDateForInput(initialData?.startDate) || '',
      endDate: formatDateForInput(initialData?.endDate) || '',
      usageLimit: Number(initialData?.usageLimit) || '',
      productVariantIds:
        initialData?.discountProducts?.map((e) => e.productVariantId) || [],
    },
  })

  const selectedType = form.watch('type')

  // Format number with thousand separators
  const formatNumberInput = (value) => {
    if (value === undefined || value === null || value === '') return ''

    // Remove all non-digit characters
    let digitsOnly = value.toString().replace(/\D/g, '')

    // Format with thousand separators
    return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const parseFormattedNumber = (value) => {
    if (value === undefined || value === null || value === '') return ''
    // Remove all non-digit characters
    return value.toString().replace(/\D/g, '')
  }

  const onSubmit = async (data) => {
    try {
      setFormError(null)

      // Parse numeric values
      const payload = {
        ...data,
        value:
          data.type === 'percentage'
            ? parseFloat(data.value)
            : parseFloat(parseFormattedNumber(data.value)),
        minOrderAmount: parseFloat(parseFormattedNumber(data.minOrderAmount)),
        maxDiscount: parseFloat(parseFormattedNumber(data.maxDiscount)),
        usageLimit: parseInt(parseFormattedNumber(data.usageLimit)),
        productVariantIds: data.productVariantIds || [],
      }

      if (isEditing) {
        await dispatch(
          updateDiscount({ id: initialData.id, data: payload }),
        ).unwrap()
      } else {
        await dispatch(createDiscount(payload)).unwrap()
      }

      form.reset()
      onOpenChange?.(false)
    } catch (error) {
      console.error('Submit error: ', error)
      const errorMessage =
        error.response?.data?.messages ||
        error.message ||
        'Có lỗi xảy ra. Vui lòng thử lại.'

      if (typeof errorMessage === 'object') {
        Object.keys(errorMessage).forEach((field) => {
          form.setError(field, { type: 'server', message: errorMessage[field] })
        })
      } else {
        setFormError({ general: errorMessage })
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
            {isEditing ? 'Cập nhật mã giảm giá' : 'Thêm mã giảm giá mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Chỉnh sửa thông tin mã giảm giá bên dưới'
              : 'Điền vào chi tiết phía dưới để thêm mã giảm giá mới'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto p-1 md:max-h-[75vh]">
          <Form {...form}>
            <form
              id="discount-form"
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
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Mã giảm giá</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập mã giảm giá (vd: SUMMER2023)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Loại giảm giá</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại giảm giá" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {discountTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
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
                  name="value"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>
                        {selectedType === 'percentage'
                          ? 'Phần trăm giảm giá (%)'
                          : selectedType === 'fixed'
                            ? 'Số tiền giảm'
                            : 'Giá trị'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            selectedType === 'percentage'
                              ? 'Nhập phần trăm (vd: 10)'
                              : 'Nhập số tiền'
                          }
                          {...field}
                          value={formatNumberInput(field.value)}
                          onChange={(e) => {
                            if (selectedType === 'percentage') {
                              field.onChange(
                                e.target.value.replace(/[^\d]/g, ''),
                              )
                            } else {
                              field.onChange(e.target.value)
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minOrderAmount"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>
                        Giá trị đơn hàng tối thiểu
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập giá trị tối thiểu"
                          {...field}
                          value={formatNumberInput(field.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxDiscount"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Giảm giá tối đa</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập giảm giá tối đa"
                          {...field}
                          value={formatNumberInput(field.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Ngày bắt đầu</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Ngày kết thúc</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="usageLimit"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Giới hạn sử dụng</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập số lần có thể sử dụng"
                          {...field}
                          value={formatNumberInput(field.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="col-span-2">
                  <Label>Sản phẩm áp dụng (tùy chọn)</Label>
                  <div className="mt-1 h-60 overflow-y-auto rounded border p-3">
                    {productVariants && productVariants.length > 0 ? (
                      productVariants.map((variant) => (
                        <div
                          key={variant.id}
                          className="mb-2 flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`variant-${variant.id}`}
                            checked={form
                              .watch('productVariantIds')
                              ?.includes(variant.id)}
                            onCheckedChange={(checked) => {
                              const currentIds =
                                form.getValues('productVariantIds') || []
                              const newIds = checked
                                ? [...currentIds, variant.id]
                                : currentIds.filter((id) => id !== variant.id)
                              form.setValue('productVariantIds', newIds)
                            }}
                          />
                          <Label
                            htmlFor={`variant-${variant.id}`}
                            className="cursor-pointer text-sm font-normal"
                          >
                            <span>{variant?.product?.name} </span>
                            <span>
                              {variant?.attributeValues.length
                                ? `(${variant?.attributeValues
                                    .map((item) => item.value)
                                    .join(', ')})`
                                : ''}
                            </span>
                          </Label>
                        </div>
                      ))
                    ) : (
                      <div className="py-2 text-center text-muted-foreground">
                        Không có sản phẩm nào
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {formError?.general && (
                <div className="mt-4 text-sm text-red-500">
                  {formError.general}
                </div>
              )}
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
          <Button form="discount-form" loading={loading}>
            {isEditing ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
      {confirmOpen && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          description="Hành động này sẽ thay đổi thông tin mã giảm giá."
          onConfirm={() => onSubmit(form.getValues())}
          loading={loading}
        />
      )}
    </Dialog>
  )
}

export default DiscountDialog
