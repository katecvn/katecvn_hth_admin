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
            <div className="rounded-md border p-4">
              <h3 className="mb-3 text-lg font-medium">Thông tin cơ bản</h3>
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
                  <p className="text-sm text-muted-foreground">Nhà cung cấp:</p>
                  <p className="font-medium">{orderData.supplier?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng tiền:</p>
                  <p className="text-lg font-medium">
                    {formatCurrency(orderData.totalAmount)}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-md border p-4">
              <h3 className="mb-3 text-lg font-medium">
                Danh sách nguyên liệu
              </h3>
              {(!orderData.items || orderData.items.length === 0) && (
                <div className="py-4 text-center text-muted-foreground">
                  Không có nguyên liệu nào trong đơn
                </div>
              )}
              {orderData.items && orderData.items.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left">STT</th>
                        <th className="py-2 text-left">Nguyên liệu</th>
                        <th className="py-2 text-right">Số lượng</th>
                        <th className="py-2 text-right">Đơn giá</th>
                        <th className="py-2 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderData.items.map((item, index) => (
                        <tr key={item.id || index} className="border-b">
                          <td className="py-2">{index + 1}</td>
                          <td className="py-2">{item.productName}</td>
                          <td className="py-2 text-right">{item.quantity}</td>
                          <td className="py-2 text-right">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="py-2 text-right">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-medium">
                        <td colSpan="4" className="py-2 text-right">
                          Tổng cộng
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
