import { useSelector, useDispatch } from 'react-redux'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { dateFormat } from '@/utils/date-format'
import { useState } from 'react'
import { changeBillStatus } from '@/stores/BillSlice'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const BillDetailDialog = ({ open, onOpenChange, billData }) => {
  const dispatch = useDispatch()
  const loading = useSelector((s) => s.bill.loading)
  const [status, setStatus] = useState(billData?.status || 'draft')

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0)

  const statusOptions = [
    { value: 'draft', label: 'Nháp', className: 'bg-gray-100 text-gray-800' },
    {
      value: 'issued',
      label: 'Đã phát hành',
      className: 'bg-green-100 text-green-800',
    },
    {
      value: 'cancelled',
      label: 'Đã hủy',
      className: 'bg-red-100 text-red-800',
    },
  ]

  const getStatusInfo = (s) =>
    statusOptions.find((o) => o.value === s) || statusOptions[0]

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus)
    await dispatch(
      changeBillStatus({ id: billData.id, status: newStatus }),
    ).unwrap()
  }

  if (!billData) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] md:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Chi tiết hóa đơn</DialogTitle>
          <DialogDescription>
            Hóa đơn{' '}
            {billData.invoiceNumber || billData.code || `BILL${billData.id}`}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          <div className="space-y-4 px-1">
            <div className="rounded-md border p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-medium">Thông tin hóa đơn</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Trạng thái:</span>
                  <Select
                    value={status}
                    onValueChange={handleStatusChange}
                    disabled={loading}
                  >
                    <SelectTrigger
                      className={`h-9 w-[180px] text-sm font-medium ${getStatusInfo(status).className}`}
                    >
                      <SelectValue>{getStatusInfo(status).label}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${o.className}`}
                          >
                            {o.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Số hóa đơn:</p>
                  <p className="font-medium">
                    {billData.invoiceNumber ||
                      billData.code ||
                      `BILL${billData.id}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Đơn hàng tham chiếu:
                  </p>
                  <p className="font-medium">
                    {billData.order?.code || `HD${billData.orderId || ''}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Ngày phát hành:
                  </p>
                  <p className="font-medium">
                    {billData.issueDate ? dateFormat(billData.issueDate) : ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Hạn thanh toán:
                  </p>
                  <p className="font-medium">
                    {billData.dueDate ? dateFormat(billData.dueDate) : ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng tiền:</p>
                  <p className="text-lg font-medium">
                    {formatCurrency(billData.totalAmount)}
                  </p>
                </div>
              </div>
            </div>

            {billData.note && (
              <div className="rounded-md border p-4">
                <h3 className="mb-3 text-lg font-medium">Ghi chú</h3>
                <p>{billData.note}</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default BillDetailDialog
