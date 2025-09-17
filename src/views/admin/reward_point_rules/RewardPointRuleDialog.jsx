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
  createRewardPointRuleSchema,
  updateRewardPointRuleSchema,
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

const RewardPointRuleDialog = ({
  open,
  onOpenChange,
  initialData = null,
  showTrigger = true,
}) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.rewardPointRules.loading)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const isEditing = !!initialData

  const form = useForm({
    resolver: zodResolver(
      isEditing ? updateRewardPointRuleSchema : createRewardPointRuleSchema,
    ),
    defaultValues: {
      type: initialData?.type || 'order_value',
      minOrderValue:
        typeof initialData?.minOrderValue === 'number'
          ? initialData?.minOrderValue
          : '',
      beforeTime: initialData?.beforeTime || '',
      points: initialData?.points ?? 10,
      status: initialData?.status || 'active',
    },
  })

  const watchType = form.watch('type')
  const isOrderValue = watchType === 'order_value'
  const isTimeSlot = watchType === 'time_slot'

  useEffect(() => {
    if (initialData) {
      form.reset({
        type: initialData?.type || 'order_value',
        minOrderValue:
          typeof initialData?.minOrderValue === 'number'
            ? initialData?.minOrderValue
            : '',
        beforeTime: initialData?.beforeTime || '',
        points: initialData?.points ?? 10,
        status: initialData?.status || 'active',
      })
    }
  }, [initialData, form])

  const onSubmit = async (raw) => {
    try {
      const data = {
        ...raw,
        minOrderValue:
          raw.minOrderValue === '' || raw.minOrderValue === undefined
            ? null
            : Number(raw.minOrderValue),
        beforeTime: raw.beforeTime || null,
        points: Number(raw.points),
      }

      if (isEditing) {
        await dispatch(
          updateRewardPointRule({ id: initialData.id, data }),
        ).unwrap()
      } else {
        await dispatch(createRewardPointRule(data)).unwrap()
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

  const title = useMemo(
    () =>
      isEditing ? 'Cập nhật quy tắc điểm thưởng' : 'Thêm quy tắc điểm thưởng',
    [isEditing],
  )
  const desc = useMemo(
    () =>
      isEditing
        ? 'Chỉnh sửa thông tin quy tắc điểm thưởng bên dưới'
        : 'Điền chi tiết để thêm quy tắc điểm thưởng',
    [isEditing],
  )

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
              onSubmit={async (e) => {
                if (isEditing) {
                  e.preventDefault()
                  if (await form.trigger()) setConfirmOpen(true)
                } else {
                  form.handleSubmit(onSubmit)(e)
                }
              }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required>Loại quy tắc</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại quy tắc" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="order_value">
                              Theo giá trị đơn
                            </SelectItem>
                            <SelectItem value="time_slot">
                              Theo khung giờ
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isOrderValue && (
                  <FormField
                    control={form.control}
                    name="minOrderValue"
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel required>Ngưỡng giá trị đơn (≥)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="1000"
                            min="0"
                            placeholder="VD: 5000000"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ''
                                  ? ''
                                  : Number(e.target.value),
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {isTimeSlot && (
                  <FormField
                    control={form.control}
                    name="beforeTime"
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel required>
                          Trước thời điểm (giờ:phút)
                        </FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
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
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
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
