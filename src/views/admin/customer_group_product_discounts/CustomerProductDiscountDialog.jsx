import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createProductDiscountSchema,
  updateProductDiscountSchema,
} from './SchemaCustomerProductDiscount'
import {
  createCustomerProductDiscount,
  updateCustomerProductDiscount,
} from '@/stores/CustomerProductDiscountSlice'
import { toast } from 'sonner'

const CustomerProductDiscountDialog = ({ open, onOpenChange, product, customerGroupId }) => {
  const dispatch = useDispatch()
  const loading = useSelector((s) => s.customerProductDiscount.loading)
  const isEditing = !!product?.currentDiscount

  const form = useForm({
    resolver: zodResolver(
      isEditing ? updateProductDiscountSchema : createProductDiscountSchema,
    ),
    defaultValues: {
      discountType: 'percentage',
      discountValue: 0,
      status: 'active',
    },
  })

  const discountType = form.watch('discountType')
  const discountValue = form.watch('discountValue')

  useEffect(() => {
    if (isEditing && product?.currentDiscount) {
      form.reset({
        discountType: product.currentDiscount.discountType || 'percentage',
        discountValue: product.currentDiscount.discountValue || 0,
        status: product.currentDiscount.status || 'active',
      })
    }
  }, [isEditing, product, form])

  const formatDisplayValue = () => {
    if (discountValue === null || discountValue === undefined) return ''
    if (discountType === 'percentage') {
      return `${parseInt(discountValue, 10)}%`
    }
    return `${Number(discountValue).toLocaleString('vi-VN')} đ`
  }

  const handleValueChange = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, '')
    const num = raw ? Number(raw) : 0
    form.setValue('discountValue', num, { shouldValidate: true })
  }

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        discountValue: Number(data.discountValue),
        customerGroupId,
        productId: product.id,
      }

      if (isEditing) {
        await dispatch(
          updateCustomerProductDiscount({
            id: product.currentDiscount.id,
            data: payload,
            customerGroupId,
          }),
        ).unwrap()
      } else {
        await dispatch(createCustomerProductDiscount(payload)).unwrap()
      }
      form.reset()
      onOpenChange(false)
    } catch (err) {
      const errorMessage =
        err.response?.data?.messages ||
        err.message ||
        'Có lỗi xảy ra. Vui lòng thử lại.'

      if (typeof errorMessage === 'object') {
        Object.keys(errorMessage).forEach((field) => {
          if (field === 'message') {
            toast.error(errorMessage[field])
          } else {
            form.setError(field, {
              type: 'server',
              message: errorMessage[field],
            })
          }
        })
      } else {
        toast.error(errorMessage)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Cập nhật giảm giá' : 'Thêm giảm giá'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Sửa thông tin giảm giá cho sản phẩm này'
              : 'Nhập thông tin giảm giá mới'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="product-discount-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="discountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Loại giảm giá</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                      <SelectItem value="fixed">Cố định (VNĐ)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discountValue"
              render={() => (
                <FormItem>
                  <FormLabel required>Giá trị</FormLabel>
                  <FormControl>
                    <Input
                      value={formatDisplayValue()}
                      onChange={handleValueChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Trạng thái</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Áp dụng</SelectItem>
                      <SelectItem value="inactive">Ngưng áp dụng</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Hủy
            </Button>
          </DialogClose>
          <Button form="product-discount-form" loading={loading}>
            {isEditing ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CustomerProductDiscountDialog
