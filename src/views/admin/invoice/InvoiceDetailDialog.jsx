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
import {
  changeInvoiceStatus,
  changeShippingStatus,
} from '@/stores/InvoiceSlice'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

const InvoiceDetailDialog = ({ open, onOpenChange, invoiceData }) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.invoice.loading)
  const [status, setStatus] = useState(invoiceData?.status || 'draft')
  // Dialog và input cho từng shipment
  const [showDeliveredDialog, setShowDeliveredDialog] = useState(false)
  const [deliveredAtInput, setDeliveredAtInput] = useState('')
  const [currentShipment, setCurrentShipment] = useState(null)

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0)
  }

  const shippingStatusOptions = [
    {
      value: 'pending',
      label: 'Chờ xác nhận',
      className: 'bg-yellow-100 text-yellow-800',
    },
    {
      value: 'in_transit',
      label: 'Đang vận chuyển',
      className: 'bg-orange-200 text-orange-800',
    },
    {
      value: 'delivered',
      label: 'Đã giao hàng',
      className: 'bg-green-100 text-green-800',
    },
    {
      value: 'failed',
      label: 'Đã từ chối',
      className: 'bg-red-100 text-red-800',
    },
  ]

  const getShippingStatusInfo = (status) =>
    shippingStatusOptions.find((option) => option.value === status) ||
    shippingStatusOptions[0]

  const getShippingMethodLabel = (method) => {
    const methodMap = {
      standard_shipping: 'Giao hàng tiêu chuẩn',
      express_shipping: 'Giao hàng nhanh',
      freight: 'Vận chuyển hàng hóa',
      courier: 'Chuyển phát nhanh',
    }
    return methodMap[method] || 'Không xác định'
  }

  // Status options
  const statusOptions = [
    {
      value: 'draft',
      label: 'Nháp đơn hàng',
      className: 'bg-gray-100 text-gray-800',
    },
    {
      value: 'pending',
      label: 'Chờ xác nhận',
      className: 'bg-yellow-100 text-yellow-800',
    },
    {
      value: 'accepted',
      label: 'Đã xác nhận',
      className: 'bg-green-100 text-green-800',
    },
    {
      value: 'rejected',
      label: 'Đã từ chối',
      className: 'bg-red-100 text-red-800',
    },
  ]

  // Get status info
  const getStatusInfo = (status) =>
    statusOptions.find((option) => option.value === status) || statusOptions[0]

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus)
    try {
      await dispatch(
        changeInvoiceStatus({
          id: invoiceData.id,
          status: newStatus,
        }),
      ).unwrap()
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái đơn hàng')
      console.error('Error updating order status:', error)
    }
  }

  // Sửa: Nhận shipmentId, shipment để truyền vào Dialog
  const handleShippingStatusChange = async (status, shipment) => {
    if (status === 'delivered') {
      setCurrentShipment(shipment)
      setDeliveredAtInput(new Date().toISOString().slice(0, 16)) // mặc định giờ hiện tại
      setShowDeliveredDialog(true)
      return
    }
    try {
      await dispatch(
        changeShippingStatus({
          id: shipment.id,
          orderId: invoiceData.id,
          status,
        }),
      ).unwrap()
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái vận chuyển')
      console.error('Error updating order status:', error)
    }
  }

  // Gọi xác nhận Dialog đã giao hàng
  const handleDeliveredConfirm = async () => {
    try {
      await dispatch(
        changeShippingStatus({
          id: currentShipment.id,
          orderId: invoiceData.id,
          status: 'delivered',
          deliveredAt: new Date(deliveredAtInput).toISOString(),
        }),
      ).unwrap()
      setShowDeliveredDialog(false)
      toast.success('Cập nhật trạng thái giao hàng thành công!')
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái vận chuyển')
    }
  }

  if (!invoiceData) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] md:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Chi tiết đơn hàng</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết đơn hàng{' '}
            {invoiceData.code || `HD${invoiceData.id}`}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-4 px-1">
            {/* Thông tin cơ bản */}
            <div className="rounded-md border p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-medium">Thông tin đơn hàng</h3>
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
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${option.className}`}
                          >
                            {option.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mã đơn hàng:</p>
                  <p className="font-medium">
                    {invoiceData.code || `HD${invoiceData.id}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày tạo:</p>
                  <p className="font-medium">
                    {dateFormat(invoiceData.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Khách hàng:</p>
                  <div className="font-medium">
                    <div>
                      {invoiceData.customer?.full_name || 'Khách lẻ'}
                      <div className="text-sm text-muted-foreground">
                        {invoiceData?.customer?.phone_number}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {invoiceData?.customer?.email}
                      </div>{' '}
                      <div className="text-sm text-muted-foreground">
                        {invoiceData?.customer?.address}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng tiền:</p>
                  <p className="text-lg font-medium">
                    {formatCurrency(invoiceData.totalAmount)}
                  </p>
                </div>
              </div>

              {/* Thông tin vận chuyển - đặt ngay dưới trạng thái */}
              {invoiceData.shippings && invoiceData.shippings?.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-md mb-3 font-medium">
                    Thông tin vận chuyển
                  </h4>
                  <div className="space-y-3">
                    {invoiceData?.shippings?.map((shipment, index) => (
                      <div
                        key={shipment.id || index}
                        className="rounded-md border p-3"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Mã vận đơn:
                            </p>
                            <p className="font-medium">
                              {shipment.trackingNumber}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Phương thức:
                            </p>
                            <p className="font-medium">
                              {getShippingMethodLabel(shipment.shippingMethod)}
                            </p>
                          </div>
                          <div className="flex flex-col items-start justify-center gap-1">
                            <p className="text-sm text-muted-foreground">
                              Trạng thái:
                            </p>
                            <div>
                              <Select
                                value={shipment.shippingStatus}
                                onValueChange={(value) =>
                                  handleShippingStatusChange(value, shipment)
                                }
                                disabled={loading}
                              >
                                <SelectTrigger
                                  className={`h-9 w-[180px] text-sm font-medium ${getShippingStatusInfo(shipment.shippingStatus).className}`}
                                >
                                  <SelectValue>
                                    {
                                      getShippingStatusInfo(
                                        shipment.shippingStatus,
                                      ).label
                                    }
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {shippingStatusOptions.map((option) => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      <span
                                        className={`rounded px-2 py-1 text-xs font-medium ${option.className}`}
                                      >
                                        {option.label}
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Ngày gửi hàng:
                            </p>
                            <p className="font-medium">
                              {shipment.createdAt
                                ? dateFormat(shipment.createdAt)
                                : 'Chưa gửi'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Ngày giao hàng:
                            </p>
                            <p className="font-medium">
                              {shipment.deliveredAt
                                ? dateFormat(shipment.deliveredAt, true)
                                : 'Chưa giao'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-sm text-muted-foreground">
                            Địa chỉ giao hàng:
                          </p>
                          <p className="font-medium">
                            {shipment.customerName}, {shipment.customerPhone}
                          </p>
                          <p className="text-sm">{shipment.customerEmail}</p>
                          <p className="text-sm">{shipment.customerAddress}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chi tiết sản phẩm */}
            <div className="rounded-md border p-4">
              <h3 className="mb-3 text-lg font-medium">Chi tiết sản phẩm</h3>
              {(!invoiceData.orderItems ||
                invoiceData.orderItems?.length === 0) && (
                <div className="py-4 text-center text-muted-foreground">
                  Không có thông tin chi tiết sản phẩm
                </div>
              )}

              {invoiceData.orderItems && invoiceData.orderItems?.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left">STT</th>
                        <th className="py-2 text-left">Sản phẩm</th>
                        <th className="py-2 text-right">Số lượng</th>
                        <th className="py-2 text-right">Đơn giá</th>
                        <th className="py-2 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceData.orderItems?.map((item, index) => {
                        const attributes = item?.attributes
                          ? JSON.parse(item.attributes)
                          : []
                        return (
                          <tr key={item.id || index} className="border-b">
                            <td className="py-2">{index + 1}</td>
                            <td className="py-2">
                              {item.productName}
                              {attributes.length > 0 && (
                                <span className="ml-2 text-xs text-gray-800">
                                  (
                                  {attributes
                                    .map((attr) => {
                                      if (
                                        attr?.attribute?.name &&
                                        attr?.value
                                      ) {
                                        return `${attr.attribute.name}: ${attr.value}`
                                      }
                                      if (attr?.attribute?.name)
                                        return attr.attribute.name
                                      if (attr?.value) return attr.value
                                      return null
                                    })
                                    .filter(Boolean)
                                    .join(', ')}
                                  )
                                </span>
                              )}
                            </td>
                            <td className="py-2 text-right">{item.quantity}</td>
                            <td className="py-2 text-right">
                              {formatCurrency(item.salePrice)}
                            </td>
                            <td className="py-2 text-right">
                              {formatCurrency(item.totalPrice)}
                            </td>
                          </tr>
                        )
                      })}
                      <tr>
                        <td colSpan="4" className="py-2 text-right">
                          Tổng tiền hàng:
                        </td>
                        <td className="py-2 text-right">
                          {formatCurrency(
                            invoiceData?.subTotal || invoiceData?.totalAmount,
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="4" className="py-2 text-right">
                          Giảm giá:
                        </td>
                        <td className="py-2 text-right">
                          {formatCurrency(invoiceData?.discountAmount || 0)}
                        </td>
                      </tr>
                      <tr className="font-medium">
                        <td colSpan="4" className="py-2 text-right">
                          Tổng cộng:
                        </td>
                        <td className="py-2 text-right">
                          {formatCurrency(invoiceData?.totalAmount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Thông tin bổ sung */}
            {invoiceData.notes && (
              <div className="rounded-md border p-4">
                <h3 className="mb-3 text-lg font-medium">Ghi chú</h3>
                <p>{invoiceData.notes}</p>
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

      {/* Dialog chọn ngày giờ giao hàng */}
      <Dialog open={showDeliveredDialog} onOpenChange={setShowDeliveredDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chọn ngày giờ giao hàng</DialogTitle>
            <DialogDescription>
              Vui lòng chọn ngày giờ thực tế đã giao cho khách.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="datetime-local"
              className="w-full rounded border px-2 py-2"
              value={deliveredAtInput}
              onChange={(e) => setDeliveredAtInput(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleDeliveredConfirm} disabled={loading}>
              Xác nhận
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeliveredDialog(false)}
              disabled={loading}
            >
              Huỷ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}

export default InvoiceDetailDialog
