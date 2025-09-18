import { useEffect, useMemo, useState } from 'react'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { DatePicker } from '@/components/custom/DatePicker'
import { ChevronDown, Calendar as CalendarIcon } from 'lucide-react'
import api from '@/utils/axios'

const BulkExportInvoiceFromSelectionDialog = ({
  open,
  onOpenChange,
  orders = [],
  onCreated,
}) => {
  const [loading, setLoading] = useState(false)
  const [issueDate, setIssueDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [note, setNote] = useState('')
  const [expandCompany, setExpandCompany] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [companyTaxCode, setCompanyTaxCode] = useState('')
  const [companyEmail, setCompanyEmail] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')

  useEffect(() => {
    if (open) {
      setIssueDate('')
      setDueDate('')
      setNote('')
      setCompanyName('')
      setCompanyTaxCode('')
      setCompanyEmail('')
      setCompanyPhone('')
      setCompanyAddress('')
      setExpandCompany(false)
    }
  }, [open])

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0)

  const totalSelected = useMemo(
    () => orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0),
    [orders],
  )

  const DateField = ({ label, value, onChange, placeholder = 'Chọn ngày' }) => {
    const selectedDate = value ? new Date(value) : null
    return (
      <div className="space-y-1">
        <label className="text-sm font-medium">{label}</label>
        <Popover>
          <PopoverTrigger asChild>
            <div className="relative">
              <Input
                readOnly
                value={value ? new Date(value).toLocaleDateString('vi-VN') : ''}
                placeholder={placeholder}
                className={`cursor-pointer pr-10 text-left ${!value ? 'text-muted-foreground' : ''}`}
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
                const y = date.getFullYear()
                const m = String(date.getMonth() + 1).padStart(2, '0')
                const d = String(date.getDate()).padStart(2, '0')
                onChange(`${y}-${m}-${d}`)
              }}
              fromYear={2000}
              toYear={new Date().getFullYear() + 1}
            />
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  const submit = async () => {
    if (!orders.length) {
      toast.error('Vui lòng chọn ít nhất 1 đơn mua')
      return
    }
    if (!issueDate) {
      toast.error('Vui lòng chọn ngày xuất hóa đơn')
      return
    }
    setLoading(true)
    try {
      const payload = {
        orderIds: orders.map((o) => Number(o.id)),
        issueDate,
        dueDate: dueDate || undefined,
        note: note || undefined,
        companyName: companyName || undefined,
        companyTaxCode: companyTaxCode || undefined,
        companyEmail: companyEmail || undefined,
        companyPhone: companyPhone || undefined,
        companyAddress: companyAddress || undefined,
        export: true,
      }
      await api.post('/invoice/bulk-create', payload)
      toast.success('Xuất hóa đơn thành công')
      onCreated && onCreated()
      onOpenChange(false)
    } catch (e) {
      const msg =
        e?.response?.data?.messages ||
        e?.response?.data?.message ||
        e?.message ||
        'Không thể xuất hóa đơn'
      toast.error(typeof msg === 'string' ? msg : 'Không thể xuất hóa đơn')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-3xl">
        <DialogHeader className="sticky top-0 bg-background">
          <DialogTitle>Xuất hóa đơn cho đơn đã chọn</DialogTitle>
        </DialogHeader>
        <div className="h-full overflow-auto">
          <div className="space-y-6 p-1">
            <div className="rounded border">
              <div className="flex items-center justify-between px-3 py-2 text-sm">
                <div>
                  Đã chọn: <b>{orders.length}</b> đơn
                </div>
                <div className="font-medium">
                  Tổng tiền: {formatCurrency(totalSelected)}
                </div>
              </div>
              <div className="max-h-[240px] overflow-auto">
                <table className="w-full border-collapse text-sm">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr className="border-b">
                      <th className="px-2 py-2 text-left">Đơn mua</th>
                      <th className="px-2 py-2 text-right">Tổng tiền</th>
                      <th className="px-2 py-2 text-left">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-2 py-4 text-center">
                          Không có dữ liệu
                        </td>
                      </tr>
                    )}
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b">
                        <td className="px-2 py-2">{o.code || `PM${o.id}`}</td>
                        <td className="px-2 py-2 text-right">
                          {formatCurrency(o.totalAmount)}
                        </td>
                        <td className="px-2 py-2">{o.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DateField
                label="Ngày xuất hóa đơn"
                value={issueDate}
                onChange={setIssueDate}
              />
              <DateField
                label="Hạn thanh toán"
                value={dueDate}
                onChange={setDueDate}
              />
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium">Ghi chú</label>
                <Input
                  placeholder="Ghi chú..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded border">
              <button
                type="button"
                className="flex w-full items-center justify-between px-3 py-2"
                onClick={() => setExpandCompany((v) => !v)}
              >
                <span className="text-sm font-medium">
                  Thông tin xuất hóa đơn (tuỳ chọn)
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${expandCompany ? 'rotate-180' : ''}`}
                />
              </button>
              {expandCompany && (
                <div className="grid grid-cols-1 gap-3 px-3 pb-3 md:grid-cols-2">
                  <div className="grid grid-cols-1 gap-3 md:col-span-2 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        Đơn vị doanh nghiệp
                      </label>
                      <Input
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Tên công ty / đơn vị"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Mã số thuế</label>
                      <Input
                        value={companyTaxCode}
                        onChange={(e) => setCompanyTaxCode(e.target.value)}
                        placeholder="Mã số thuế"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:col-span-2 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        Số điện thoại
                      </label>
                      <Input
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                        placeholder="Số điện thoại"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        placeholder="Email"
                      />
                    </div>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium">Địa chỉ</label>
                    <Input
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      placeholder="Địa chỉ"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="sticky bottom-0 bg-background">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button onClick={submit} disabled={loading || orders.length === 0}>
            Xuất hóa đơn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default BulkExportInvoiceFromSelectionDialog
