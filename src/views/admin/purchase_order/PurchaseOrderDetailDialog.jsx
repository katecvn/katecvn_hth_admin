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

const PurchaseOrderDetailDialog = ({ open, onOpenChange, orderData }) => {
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0)

  const getShippingMethodLabel = (method) => {
    const map = {
      standard_shipping: 'Giao hàng tiêu chuẩn',
      express_shipping: 'Giao hàng nhanh',
      freight: 'Vận chuyển hàng hóa',
      courier: 'Chuyển phát nhanh',
    }
    return map[method] || 'Không xác định'
  }

  const getShippingStatusLabel = (status) => {
    const map = {
      pending: 'Chờ xác nhận',
      in_transit: 'Đang vận chuyển',
      delivered: 'Đã giao hàng',
      failed: 'Thất bại',
    }
    return map[status] || status
  }

  const getPaymentStatusLabel = (status) => {
    const map = {
      unpaid: 'Chưa thanh toán',
      processing: 'Đang xử lý',
      paid: 'Đã thanh toán',
      cancelled: 'Đã hủy',
    }
    return map[status] || status
  }

  if (!orderData) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] md:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Chi tiết đơn mua</DialogTitle>
          <DialogDescription>
            Thông tin đơn mua {orderData.code || `PM${orderData.id}`}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-4 px-1">
            {/* Thông tin cơ bản */}
            <div className="rounded-md border p-4">
              <h3 className="mb-3 text-lg font-medium">Thông tin đơn mua</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mã đơn:</p>
                  <p className="font-medium">{orderData.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày tạo:</p>
                  <p className="font-medium">
                    {dateFormat(orderData.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Khách hàng:</p>
                  <div className="font-medium">
                    {orderData.customer?.full_name || 'Khách lẻ'}
                    <div className="text-sm text-muted-foreground">
                      {orderData.customer?.phone_number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {orderData.customer?.email}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {orderData.customer?.address}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Trạng thái thanh toán:
                  </p>
                  <p className="font-medium">
                    {getPaymentStatusLabel(orderData.paymentStatus)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng tiền:</p>
                  <p className="text-lg font-medium">
                    {formatCurrency(orderData.totalAmount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Thông tin vận chuyển */}
            {orderData.shippings && orderData.shippings.length > 0 && (
              <div className="rounded-md border p-4">
                <h3 className="mb-3 text-lg font-medium">
                  Thông tin vận chuyển
                </h3>
                <div className="space-y-3">
                  {orderData.shippings.map((ship, index) => (
                    <div
                      key={ship.id || index}
                      className="rounded-md border p-3"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Mã vận đơn:
                          </p>
                          <p className="font-medium">{ship.trackingNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Phương thức:
                          </p>
                          <p className="font-medium">
                            {getShippingMethodLabel(ship.shippingMethod)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Trạng thái:
                          </p>
                          <p className="font-medium">
                            {getShippingStatusLabel(ship.shippingStatus)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Ngày gửi:
                          </p>
                          <p className="font-medium">
                            {ship.createdAt
                              ? dateFormat(ship.createdAt)
                              : 'Chưa gửi'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Ngày giao:
                          </p>
                          <p className="font-medium">
                            {ship.deliveredAt
                              ? dateFormat(ship.deliveredAt, true)
                              : 'Chưa giao'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground">
                          Địa chỉ giao hàng:
                        </p>
                        <p className="font-medium">
                          {ship.customerName}, {ship.customerPhone}
                        </p>
                        <p className="text-sm">{ship.customerEmail}</p>
                        <p className="text-sm">{ship.customerAddress}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chi tiết sản phẩm */}
            <div className="rounded-md border p-4">
              <h3 className="mb-3 text-lg font-medium">Chi tiết sản phẩm</h3>
              {(!orderData.orderItems || orderData.orderItems.length === 0) && (
                <div className="py-4 text-center text-muted-foreground">
                  Không có sản phẩm nào trong đơn
                </div>
              )}
              {orderData.orderItems && orderData.orderItems.length > 0 && (
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
                      {orderData.orderItems.map((item, index) => {
                        const attrs = item.attributes
                          ? JSON.parse(item.attributes)
                          : []
                        return (
                          <tr key={item.id || index} className="border-b">
                            <td className="py-2">{index + 1}</td>
                            <td className="py-2">
                              {item.productName}
                              {attrs.length > 0 && (
                                <span className="ml-2 text-xs text-gray-800">
                                  (
                                  {attrs
                                    .map((a) =>
                                      a?.attribute?.name && a?.value
                                        ? `${a.attribute.name}: ${a.value}`
                                        : a?.attribute?.name || a?.value || '',
                                    )
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
                          {formatCurrency(orderData.subTotal)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="4" className="py-2 text-right">
                          Giảm giá:
                        </td>
                        <td className="py-2 text-right">
                          {formatCurrency(orderData.discountAmount)}
                        </td>
                      </tr>
                      <tr className="font-medium">
                        <td colSpan="4" className="py-2 text-right">
                          Tổng cộng:
                        </td>
                        <td className="py-2 text-right">
                          {formatCurrency(orderData.totalAmount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Ghi chú */}
            {orderData.note && (
              <div className="rounded-md border p-4">
                <h3 className="mb-3 text-lg font-medium">Ghi chú</h3>
                <p>{orderData.note}</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PurchaseOrderDetailDialog
