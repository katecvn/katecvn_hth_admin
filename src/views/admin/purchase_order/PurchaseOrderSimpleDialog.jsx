import * as DialogPrimitive from '@radix-ui/react-dialog'
import { dateFormat } from '@/utils/date-format'

const PurchaseOrderSimpleDialog = ({ open, onOpenChange, order }) => {
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0)

  const items = Array.isArray(order?.orderItems) ? order.orderItems : []
  const customer = order?.customer || {}

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[1px]" />
        <DialogPrimitive.Content
          className="
            fixed left-1/2 top-1/2 z-[60] w-[95vw] max-w-7xl -translate-x-1/2 -translate-y-1/2
            rounded-xl border bg-background p-6 shadow-2xl focus:outline-none
          "
        >
          <div className="mb-4">
            <h2 className="text-xl font-semibold">
              Đơn hàng {order?.code || `PM${order?.id}`} —{' '}
              {order?.createdAt ? dateFormat(order.createdAt) : ''}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="rounded border p-3 text-sm">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <div className="text-muted-foreground">Mã đơn</div>
                  <div className="font-medium">
                    {order?.code || `PM${order?.id}`}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Khách hàng</div>
                  <div className="font-medium">
                    {customer.full_name || 'Khách lẻ'}
                    {customer.phone_number ? (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({customer.phone_number})
                      </span>
                    ) : null}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Ngày tạo</div>
                  <div className="font-medium">
                    {order?.createdAt ? dateFormat(order.createdAt) : ''}
                  </div>
                </div>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-auto rounded border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-3 py-2">Sản phẩm</th>
                    <th className="px-3 py-2">Đơn vị</th>
                    <th className="px-3 py-2">SL</th>
                    <th className="px-3 py-2">Đơn giá</th>
                    <th className="px-3 py-2">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="border-t">
                      <td className="px-3 py-2">{it.productName}</td>
                      <td className="px-3 py-2">{it.productUnit}</td>
                      <td className="px-3 py-2">{it.quantity}</td>
                      <td className="px-3 py-2">
                        {formatCurrency(it.salePrice)}
                      </td>
                      <td className="px-3 py-2">
                        {formatCurrency(it.totalPrice)}
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td
                        className="px-3 py-2 text-center italic text-muted-foreground"
                        colSpan={5}
                      >
                        Không có sản phẩm
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-8 text-sm">
              <div className="font-medium">
                Tổng tiền:{' '}
                <span className="font-bold">
                  {formatCurrency(order?.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          <DialogPrimitive.Close
            aria-label="Đóng"
            className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted focus:outline-none"
          >
            ✕
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export default PurchaseOrderSimpleDialog
