import { useEffect, useMemo, useState } from 'react'
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
  createOrderValueRuleSchema,
  createTimeSlotRuleSchema,
  updateOrderValueRuleSchema,
  updateTimeSlotRuleSchema,
} from './SchemaRewardPointRule'
import {
  createRewardPointRule,
  updateRewardPointRule,
} from '@/stores/RewardPointRuleSlice'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

const fmtMoney = (val) =>
  val !== '' && val !== null && val !== undefined
    ? `${Number(val).toLocaleString('vi-VN')}đ`
    : ''

const stripNonDigits = (s) => (s || '').replace(/[^\d]/g, '')

const RewardPointRuleDialog = ({
  open,
  onOpenChange,
  fixedType,
  initialData = null,
  showTrigger = true,
}) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.rewardPointRules.loading)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const isEditing = !!initialData

  const schema = useMemo(() => {
    if (fixedType === 'order_value')
      return isEditing ? updateOrderValueRuleSchema : createOrderValueRuleSchema
    return isEditing ? updateTimeSlotRuleSchema : createTimeSlotRuleSchema
  }, [fixedType, isEditing])

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues:
      fixedType === 'order_value'
        ? {
            type: 'order_value',
            minOrderValue: initialData?.minOrderValue ?? '',
            points: initialData?.points ?? 10,
            status: initialData?.status || 'active',
          }
        : {
            type: 'time_slot',
            beforeTime: initialData?.beforeTime || '',
            points: initialData?.points ?? 10,
            status: initialData?.status || 'active',
          },
  })

  const [displayMinOrder, setDisplayMinOrder] = useState(
    fixedType === 'order_value'
      ? initialData?.minOrderValue
        ? fmtMoney(initialData.minOrderValue)
        : ''
      : '',
  )

  useEffect(() => {
    if (initialData) {
      if (fixedType === 'order_value') {
        form.reset({
          type: 'order_value',
          minOrderValue: initialData?.minOrderValue ?? '',
          points: initialData?.points ?? 10,
          status: initialData?.status || 'active',
        })
        setDisplayMinOrder(
          initialData?.minOrderValue ? fmtMoney(initialData.minOrderValue) : '',
        )
      } else {
        form.reset({
          type: 'time_slot',
          beforeTime: initialData?.beforeTime || '',
          points: initialData?.points ?? 10,
          status: initialData?.status || 'active',
        })
      }
    }
  }, [initialData, fixedType, form])

  const onSubmit = async (values) => {
    try {
      const payload =
        fixedType === 'order_value'
          ? {
              type: 'order_value',
              minOrderValue: Number(values.minOrderValue),
              points: Number(values.points),
              status: values.status,
            }
          : {
              type: 'time_slot',
              beforeTime: values.beforeTime,
              points: Number(values.points),
              status: values.status,
            }

      if (isEditing) {
        await dispatch(
          updateRewardPointRule({ id: initialData.id, data: payload }),
        ).unwrap()
      } else {
        await dispatch(createRewardPointRule(payload)).unwrap()
      }
      form.reset()
      if (fixedType === 'order_value') setDisplayMinOrder('')
      onOpenChange?.(false)
    } catch (error) {
      const errorMessage =
        error?.response?.data?.messages ||
        error?.message ||
        'Có lỗi xảy ra. Vui lòng thử lại.'
      if (typeof errorMessage === 'object') {
        Object.keys(errorMessage).forEach((field) => {
          if (field === 'message') toast.error(errorMessage[field])
          else
            form.setError(field, {
              type: 'server',
              message: errorMessage[field],
            })
        })
      } else {
        toast.error(errorMessage)
      }
    }
  }

  const title = isEditing
    ? 'Cập nhật quy tắc điểm thưởng'
    : 'Thêm quy tắc điểm thưởng'
  const desc = isEditing
    ? 'Chỉnh sửa thông tin quy tắc điểm thưởng bên dưới'
    : 'Điền chi tiết để thêm quy tắc điểm thưởng'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {showTrigger && !isEditing && (
        <DialogTrigger asChild>
          <Button className="mx-2" variant="outline" size="sm">
            Thêm mới
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="md:h-auto md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto p-1 md:max-h-[75vh]">
          <Form {...form}>
            <form
              id="RewardRule-form"
              onSubmit={form.handleSubmit((vals) => {
                if (isEditing) return setConfirmOpen(true)
                return onSubmit(vals)
              })}
            >
              <div className="grid gap-4 md:grid-cols-2">
                {fixedType === 'order_value' && (
                  <FormField
                    control={form.control}
                    name="minOrderValue"
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1 md:col-span-2">
                        <FormLabel required>Điều kiện</FormLabel>
                        <FormControl>
                          <Input
                            inputMode="numeric"
                            placeholder="Giá trị đơn hàng tối thiểu để được cộng điểm (VD: 100000)"
                            value={displayMinOrder}
                            onChange={(e) => {
                              const raw = stripNonDigits(e.target.value)
                              setDisplayMinOrder(raw ? fmtMoney(raw) : '')
                              field.onChange(raw || '')
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {fixedType === 'time_slot' && (
                  <FormField
                    control={form.control}
                    name="beforeTime"
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1 md:col-span-2">
                        <FormLabel required>Điều kiện</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            value={field.value || ''}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="points"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required>Điểm cộng</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          placeholder="VD: 10"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value)}
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
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required>Trạng thái</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="active">Đang áp dụng</SelectItem>
                            <SelectItem value="inactive">
                              Ngừng áp dụng
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
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
            <Button type="button" variant="outline">
              Hủy
            </Button>
          </DialogClose>
          <Button form="RewardRule-form" loading={loading}>
            {isEditing ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogFooter>
      </DialogContent>

      {confirmOpen && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          description="Hành động này sẽ thay đổi thông tin quy tắc điểm thưởng."
          onConfirm={() => onSubmit(form.getValues())}
          loading={loading}
        />
      )}
    </Dialog>
  )
}

export default RewardPointRuleDialog
