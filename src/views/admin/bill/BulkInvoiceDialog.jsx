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
import api from '@/utils/axios'
import { toast } from 'sonner'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { DatePicker } from '@/components/custom/DatePicker'
import { formatDateVN, parseDateLocal } from '@/utils/parse-date'
import { ChevronDown, Calendar as CalendarIcon } from 'lucide-react'

const BulkInvoiceDialog = ({ open, onOpenChange, onCreated }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [selected, setSelected] = useState(new Set())

  const [issueDate, setIssueDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [note, setNote] = useState('')

  const [expandCompany, setExpandCompany] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [companyTaxCode, setCompanyTaxCode] = useState('')
  const [companyEmail, setCompanyEmail] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0)

  const fetchOrders = async (kw = '') => {
    setLoading(true)
    try {
      const params = { status: 'accepted', limit: 50 }
      if (kw) params.keyword = kw
      const res = await api.get('/order/shows', { params })
      const { data } = res.data || {}
      setOrders(data?.orders || [])
    } catch (e) {
      toast.error('Không tải được danh sách đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      setSelected(new Set())
      setKeyword('')
      setIssueDate('')
      setDueDate('')
      setNote('')
      setCompanyName('')
      setCompanyTaxCode('')
      setCompanyEmail('')
      setCompanyPhone('')
      setCompanyAddress('')
      setExpandCompany(false)
      fetchOrders('')
    }
  }, [open])

  const toggleAll = () => {
    if (selected.size === orders.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(orders.map((o) => String(o.id))))
    }
  }

  const allChecked = useMemo(
    () => orders.length > 0 && selected.size === orders.length,
    [orders, selected],
  )

  const handleCheck = (id) => {
    const sid = String(id)
    const next = new Set(selected)
    if (next.has(sid)) next.delete(sid)
    else next.add(sid)
    setSelected(next)
  }

  const DateField = ({ label, value, onChange, placeholder = 'Chọn ngày' }) => {
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
                placeholder={placeholder}
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
      </div>
    )
  }

  const submit = async () => {
    if (selected.size === 0) {
      toast.error('Vui lòng chọn ít nhất 1 đơn hàng')
      return
    }
    if (!issueDate) {
      toast.error('Vui lòng chọn ngày phát hành')
      return
    }
    setLoading(true)
    try {
      const payload = {
        orderIds: Array.from(selected).map((x) => Number(x)),
        issueDate,
        dueDate: dueDate || undefined,
        note: note || undefined,
        companyName: companyName || undefined,
        companyTaxCode: companyTaxCode || undefined,
        companyEmail: companyEmail || undefined,
        companyPhone: companyPhone || undefined,
        companyAddress: companyAddress || undefined,
      }
      await api.post('/invoice/bulk-create', payload)
      toast.success('Tạo hóa đơn hàng loạt thành công')
      onCreated && onCreated()
      onOpenChange(false)
    } catch (e) {
      const msg =
        e?.response?.data?.messages ||
        e?.response?.data?.message ||
        e?.message ||
        'Không thể tạo hóa đơn hàng loạt'
      toast.error(typeof msg === 'string' ? msg : 'Không thể tạo hóa đơn')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-4xl">
        <DialogHeader className="sticky top-0 bg-background">
          <DialogTitle>Tạo nhanh hóa đơn từ nhiều đơn hàng</DialogTitle>
        </DialogHeader>

        <div className="h-full overflow-auto">
          <div className="space-y-6 p-1">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  placeholder="Tìm đơn hàng đã xác nhận..."
                  className="w-72"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') await fetchOrders(keyword.trim())
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fetchOrders(keyword.trim())}
                  disabled={loading}
                >
                  Tìm
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fetchOrders('')}
                  disabled={loading}
                >
                  Tải lại
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={toggleAll}
                  disabled={orders.length === 0}
                >
                  {allChecked ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </Button>
                <div className="text-sm text-muted-foreground">
                  Đã chọn: <b>{selected.size}</b>
                </div>
              </div>

              <div className="rounded border">
                <div className="max-h-[260px] overflow-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead className="sticky top-0 bg-gray-50">
                      <tr className="border-b">
                        <th className="w-10 px-2 py-2 text-left">
                          <input
                            type="checkbox"
                            checked={allChecked}
                            onChange={toggleAll}
                          />
                        </th>
                        <th className="px-2 py-2 text-left">Đơn hàng</th>
                        <th className="px-2 py-2 text-right">Tổng tiền</th>
                        <th className="px-2 py-2 text-left">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-2 py-4 text-center">
                            {loading ? 'Đang tải...' : 'Không có dữ liệu'}
                          </td>
                        </tr>
                      )}
                      {orders.map((o) => {
                        const sid = String(o.id)
                        const checked = selected.has(sid)
                        return (
                          <tr key={o.id} className="border-b">
                            <td className="px-2 py-2">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleCheck(o.id)}
                              />
                            </td>
                            <td className="px-2 py-2">{o.code}</td>
                            <td className="px-2 py-2 text-right">
                              {formatCurrency(o.totalAmount)}
                            </td>
                            <td className="px-2 py-2">{o.status}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DateField
                label="Ngày phát hành"
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
                  className={`h-4 w-4 transition-transform ${
                    expandCompany ? 'rotate-180' : ''
                  }`}
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
                        placeholder="Tên công ty / đơn vị"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Mã số thuế</label>
                      <Input
                        placeholder="Mã số thuế"
                        value={companyTaxCode}
                        onChange={(e) => setCompanyTaxCode(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:col-span-2 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        Số điện thoại
                      </label>
                      <Input
                        placeholder="Số điện thoại"
                        value={companyPhone}
                        onChange={(e) => setCompanyPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        placeholder="Email"
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium">Địa chỉ</label>
                    <Input
                      placeholder="Địa chỉ"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
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
          <Button onClick={submit} disabled={loading}>
            Tạo hóa đơn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default BulkInvoiceDialog
