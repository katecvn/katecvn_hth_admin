import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import api from '@/utils/axios'
import { createNewBill, updateExistingBill } from '@/stores/BillSlice'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Eye, Calendar as CalendarIcon } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { DatePicker } from '@/components/custom/DatePicker'
import { formatDateVN, parseDateLocal } from '@/utils/parse-date'

// form + schema
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createBillSchema,
  updateBillSchema,
  normalizeBillPayload,
} from './SchemaBill'

// UI detail dialog (tái dùng dialog đơn hàng hiện có)
import InvoiceDetailDialog from '@/views/admin/invoice/InvoiceDetailDialog'

const BillFormDialog = ({
  open,
  onOpenChange,
  onSaved,
  mode = 'create',
  billData = null,
}) => {
  const dispatch = useDispatch()
  const loading = useSelector((s) => s.bill.loading)

  const [orders, setOrders] = useState([])
  const [orderInfo, setOrderInfo] = useState(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      mode === 'edit' ? updateBillSchema : createBillSchema,
    ),
    defaultValues: {
      orderId: '',
      invoiceNumber: '',
      issueDate: '',
      dueDate: '',
      taxRate: '0',
      note: '',
    },
  })

  const orderId = watch('orderId')
  const issueDate = watch('issueDate')
  const dueDate = watch('dueDate')
  const taxRate = watch('taxRate')

  // tính toán totals
  const totals = useMemo(() => {
    const subTotal = Number(orderInfo?.subTotal ?? orderInfo?.totalAmount ?? 0)
    const discountAmount = Number(orderInfo?.discountAmount ?? 0)
    const base = Math.max(subTotal - discountAmount, 0)
    const taxPct =
      Number((taxRate || '0').toString().replace(/[^\d.]/g, '')) || 0
    const taxAmount = Math.round(base * (taxPct / 100))
    const totalAmount = base + taxAmount
    return { subTotal, discountAmount, taxAmount, totalAmount }
  }, [orderInfo, taxRate])

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0)

  const fetchOrders = async (kw = '') => {
    const params = { status: 'accepted', limit: 20 }
    if (kw) params.keyword = kw
    const res = await api.get('/order/shows', { params })
    const { data } = res.data || {}
    setOrders(data?.orders || [])
  }

  const fetchOrderDetail = async (id) => {
    if (!id) return
    const res = await api.get(`/order/${id}`)
    const { data } = res.data || {}
    setOrderInfo(data || null)
  }

  useEffect(() => {
    if (open) {
      fetchOrders()
      if (mode === 'edit' && billData) {
        reset({
          orderId: String(billData.orderId),
          invoiceNumber: billData.invoiceNumber || '',
          issueDate: billData.issueDate ? billData.issueDate.slice(0, 10) : '',
          dueDate: billData.dueDate ? billData.dueDate.slice(0, 10) : '',
          taxRate: billData.taxRate?.toString() || '0',
          note: billData.note || '',
        })
        setOrderInfo(billData.order || null)
      } else {
        reset({
          orderId: '',
          invoiceNumber: '',
          issueDate: '',
          dueDate: '',
          taxRate: '0',
          note: '',
        })
        setOrderInfo(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (mode === 'create' && orderId) fetchOrderDetail(orderId)
  }, [orderId, mode])

  const onSubmit = async (formValues) => {
    if (!formValues.orderId) {
      toast.error('Vui lòng chọn đơn hàng')
      return
    }

    const payload = normalizeBillPayload({
      ...formValues,
      subTotal: totals.subTotal,
      discountAmount: totals.discountAmount,
      taxAmount: totals.taxAmount,
      totalAmount: totals.totalAmount,
    })

    if (mode === 'edit' && billData) {
      await dispatch(
        updateExistingBill({ id: billData.id, data: payload }),
      ).unwrap()
    } else {
      await dispatch(createNewBill(payload)).unwrap()
    }

    onSaved && onSaved()
    onOpenChange(false)
  }

  const DateField = ({ name, label, value, onChange }) => {
    const selectedDate = value ? parseDateLocal(value) : null

    return (
      <div className="space-y-1">
        <label className="text-sm font-medium">{label}</label>
        <Popover>
          <PopoverTrigger asChild>
            <div className="relative">
              <Input
                readOnly
                value={value ? formatDateVN(value) : ''}
                placeholder="Chọn ngày"
                className={`cursor-pointer pr-10 text-left ${
                  !value ? 'text-muted-foreground' : ''
                }`}
              />
              <CalendarIcon
                size={18}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
            </div>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <DatePicker
              mode="single"
              captionLayout="dropdown-buttons"
              selected={selectedDate}
              onSelect={(date) => {
                if (!date) {
                  onChange('')
                  return
                }
                const year = date.getFullYear()
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const day = String(date.getDate()).padStart(2, '0')
                onChange(`${year}-${month}-${day}`)
              }}
              fromYear={2000}
              toYear={new Date().getFullYear() + 1}
            />
          </PopoverContent>
        </Popover>
        {errors?.[name]?.message ? (
          <p className="text-xs text-red-500">{errors[name].message}</p>
        ) : null}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Cập nhật hóa đơn' : 'Tạo hóa đơn từ đơn hàng'}
          </DialogTitle>
        </DialogHeader>

        <div className="h-full overflow-auto">
          <form
            id="bill-form"
            className="space-y-6 p-1"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* chọn đơn hàng */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Chọn đơn hàng</label>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={watch('orderId')}
                  onValueChange={(v) =>
                    setValue('orderId', v, { shouldValidate: true })
                  }
                  disabled={mode === 'edit'}
                >
                  <SelectTrigger className="w-[320px]">
                    <SelectValue placeholder="Chọn đơn hàng đã xác nhận" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {orders.map((o) => (
                      <SelectItem key={o.id} value={String(o.id)}>
                        {o.code} — {formatCurrency(o.totalAmount)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {mode === 'create' && (
                  <>
                    <Input
                      placeholder="Tìm đơn hàng..."
                      className="w-56"
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          await fetchOrders(e.currentTarget.value)
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fetchOrders('')}
                    >
                      Tải lại
                    </Button>
                  </>
                )}

                {watch('orderId') ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={() => setShowOrderDetail(true)}
                  >
                    <Eye size={16} />
                    Xem chi tiết đơn
                  </Button>
                ) : null}
              </div>
              {errors?.orderId?.message && (
                <p className="text-xs text-red-500">{errors.orderId.message}</p>
              )}
            </div>

            {/* thông tin hóa đơn */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Số hóa đơn</label>
                <Input
                  placeholder="Tự nhập (tuỳ chọn)"
                  {...register('invoiceNumber')}
                />
              </div>

              <DateField
                name="issueDate"
                label="Ngày phát hành"
                value={issueDate}
                onChange={(v) =>
                  setValue('issueDate', v, { shouldValidate: true })
                }
              />
              <DateField
                name="dueDate"
                label="Hạn thanh toán"
                value={dueDate}
                onChange={(v) =>
                  setValue('dueDate', v, { shouldValidate: true })
                }
              />

              <div className="space-y-1">
                <label className="text-sm font-medium">Thuế (%)</label>
                <Input
                  inputMode="decimal"
                  placeholder="0 - 100"
                  {...register('taxRate')}
                  onChange={(e) => {
                    const raw = e.target.value
                    const cleaned = raw.replace(/[^\d.]/g, '')
                    setValue('taxRate', cleaned, { shouldValidate: true })
                  }}
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium">Ghi chú</label>
                <Input placeholder="Ghi chú..." {...register('note')} />
              </div>
            </div>

            {/* tổng tiền */}
            <div className="rounded border p-3">
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Tổng tiền hàng</span>
                  <b>{formatCurrency(totals.subTotal)}</b>
                </div>
                <div className="flex justify-between">
                  <span>Giảm giá</span>
                  <b>{formatCurrency(totals.discountAmount)}</b>
                </div>
                <div className="flex justify-between">
                  <span>Thuế</span>
                  <b>{formatCurrency(totals.taxAmount)}</b>
                </div>
                <div className="flex justify-between text-base">
                  <span>Tổng cộng</span>
                  <b>{formatCurrency(totals.totalAmount)}</b>
                </div>
              </div>
            </div>
          </form>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button form="bill-form" disabled={loading}>
            {mode === 'edit' ? 'Cập nhật' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>

      {showOrderDetail && orderInfo && (
        <InvoiceDetailDialog
          open={showOrderDetail}
          onOpenChange={setShowOrderDetail}
          invoiceData={orderInfo}
        />
      )}
    </Dialog>
  )
}

export default BillFormDialog
