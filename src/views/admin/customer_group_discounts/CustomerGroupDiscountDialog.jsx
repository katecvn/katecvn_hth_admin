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
  createCustomerGroupDiscountSchema,
  updateCustomerGroupDiscountSchema,
} from './SchemaCustomerGroupDiscount'
import {
  createCustomerGroupDiscount,
  updateCustomerGroupDiscount,
} from '@/stores/CustomerGroupDiscountSlice'
import {
  getCustomerGroupWithoutDiscount,
  getCustomerGroup,
} from '@/stores/CustomerGroupSlice'
import { toast } from 'sonner'

const CustomerGroupDiscountDialog = ({
  open,
  onOpenChange,
  initialData = null,
  isEditing = false,
}) => {
  const dispatch = useDispatch()
  const loading = useSelector((s) => s.customerGroupDiscount.loading)
  const customerGroups = useSelector(
    (s) => s.customerGroup.customerGroups || [],
  )

  const form = useForm({
    resolver: zodResolver(
      isEditing
        ? updateCustomerGroupDiscountSchema
        : createCustomerGroupDiscountSchema,
    ),
    defaultValues: {
      customerGroupId: initialData?.customerGroupId?.toString() || '',
      discountType: initialData?.discountType || 'percentage',
      discountValue: initialData?.discountValue || 0,
      status: initialData?.status || 'active',
    },
  })

  const discountType = form.watch('discountType')
  const discountValue = form.watch('discountValue')

  useEffect(() => {
    if (isEditing) {
      dispatch(getCustomerGroup()) // lấy đủ group để hiển thị group đã có giảm giá
    } else {
      dispatch(getCustomerGroupWithoutDiscount()) // chỉ lấy group chưa có giảm giá
    }
  }, [dispatch, isEditing])

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
      }

      if (isEditing) {
        await dispatch(
          updateCustomerGroupDiscount({ id: initialData.id, data: payload }),
        ).unwrap()
      } else {
        await dispatch(createCustomerGroupDiscount(payload)).unwrap()
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
          <DialogTitle>
            {isEditing ? 'Cập nhật giảm giá' : 'Thêm giảm giá'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Sửa thông tin giảm giá theo phân loại khách hàng'
              : 'Nhập thông tin giảm giá mới'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="discount-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="customerGroupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Phân loại khách hàng</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isEditing}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phân loại" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customerGroups.map((g) => (
                        <SelectItem key={g.id} value={String(g.id)}>
                          {g.name}
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
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="inactive">Ngưng</SelectItem>
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
          <Button form="discount-form" loading={loading}>
            {isEditing ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CustomerGroupDiscountDialog
