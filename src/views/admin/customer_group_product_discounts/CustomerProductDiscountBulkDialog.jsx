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
import { bulkProductDiscountSchema } from './SchemaCustomerProductDiscount'
import { bulkUpdateCustomerProductDiscount } from '@/stores/CustomerProductDiscountSlice'
import { toast } from 'sonner'

const CustomerProductDiscountBulkDialog = ({ open, onOpenChange, customerGroupId, productIds }) => {
  const dispatch = useDispatch()
  const loading = useSelector((s) => s.customerProductDiscount.loading)

  const form = useForm({
    resolver: zodResolver(bulkProductDiscountSchema),
    defaultValues: {
      discountType: 'percentage',
      discountValue: 0,
      status: 'active',
    },
  })

  const discountType = form.watch('discountType')
  const discountValue = form.watch('discountValue')

  useEffect(() => {
    if (open) {
      form.reset({
        discountType: 'percentage',
        discountValue: 0,
        status: 'active',
      })
    }
  }, [open, form])

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
        productIds,
      }
      await dispatch(bulkUpdateCustomerProductDiscount(payload)).unwrap()
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
          <DialogTitle>Cập nhật giảm giá hàng loạt</DialogTitle>
          <DialogDescription>
            Thiết lập giảm giá áp dụng cho nhiều sản phẩm cùng lúc
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="bulk-discount-form"
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
          <Button form="bulk-discount-form" loading={loading}>
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CustomerProductDiscountBulkDialog
