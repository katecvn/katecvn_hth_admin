import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createNewInvoice, updateExistingInvoice } from '@/stores/InvoiceSlice'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { X } from 'lucide-react'

// Định nghĩa schema validation với Zod
const formSchema = z.object({
  invoiceCode: z.string().min(1, { message: 'Mã đơn hàng là bắt buộc' }),
  customerId: z.string().optional(),
  totalAmount: z.coerce
    .number()
    .min(0, { message: 'Tổng tiền phải lớn hơn hoặc bằng 0' }),
  status: z.enum(['pending', 'partial', 'paid', 'cancelled'], {
    message: 'Trạng thái không hợp lệ',
  }),
})

const InvoiceDialog = ({ open, onOpenChange, initialData }) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.invoice.loading)
  const customers = useSelector((state) => state.customer?.customers || [])

  const [invoiceItems, setInvoiceItems] = useState([])

  const isUpdating = !!initialData

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoiceCode: initialData?.invoiceCode || '',
      customerId: initialData?.customer?.id?.toString() || '',
      totalAmount: initialData?.totalAmount || 0,
      status: initialData?.status || 'pending',
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        invoiceCode: initialData.invoiceCode || '',
        customerId: initialData.customer?.id?.toString() || '',
        totalAmount: initialData.totalAmount || 0,
        status: initialData.status || 'pending',
      })

      if (initialData.items) {
        setInvoiceItems(initialData.items)
      }
    }
  }, [initialData, form])

  const onSubmit = async (data) => {
    try {
      // Chuyển đổi customerId từ string sang number nếu có
      const customerId = data.customerId ? parseInt(data.customerId, 10) : null

      // Add items to the data
      const formData = {
        ...data,
        customerId,
        items: invoiceItems,
      }

      if (isUpdating) {
        await dispatch(
          updateExistingInvoice({
            id: initialData.id,
            data: formData,
          }),
        ).unwrap()
      } else {
        await dispatch(createNewInvoice(formData)).unwrap()
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const addInvoiceItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        id: Date.now(),
        productId: '',
        productName: '',
        quantity: 1,
        price: 0,
        amount: 0,
      },
    ])
  }

  const removeInvoiceItem = (index) => {
    const updatedItems = [...invoiceItems]
    updatedItems.splice(index, 1)
    setInvoiceItems(updatedItems)

    // Recalculate total
    const total = updatedItems.reduce(
      (sum, item) => sum + (item.amount || 0),
      0,
    )
    form.setValue('totalAmount', total)
  }

  const updateInvoiceItem = (index, field, value) => {
    const updatedItems = [...invoiceItems]
    updatedItems[index][field] = value

    // If price or quantity changed, update amount
    if (field === 'price' || field === 'quantity') {
      const price = field === 'price' ? value : updatedItems[index].price
      const quantity =
        field === 'quantity' ? value : updatedItems[index].quantity
      updatedItems[index].amount = price * quantity
    }

    setInvoiceItems(updatedItems)

    // Recalculate total
    const total = updatedItems.reduce(
      (sum, item) => sum + (item.amount || 0),
      0,
    )
    form.setValue('totalAmount', total)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isUpdating ? 'Cập nhật đơn hàng' : 'Thêm đơn hàng mới'}
          </DialogTitle>
          <DialogDescription>
            {isUpdating
              ? 'Cập nhật thông tin đơn hàng hiện có'
              : 'Nhập thông tin để tạo đơn hàng mới'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 px-1"
            >
              <FormField
                control={form.control}
                name="invoiceCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã đơn hàng</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập mã đơn hàng" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Khách hàng</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn khách hàng" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Khách lẻ</SelectItem>
                        {customers.map((customer) => (
                          <SelectItem
                            key={customer.id}
                            value={customer.id.toString()}
                          >
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-medium">Chi tiết đơn hàng</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addInvoiceItem}
                  >
                    Thêm sản phẩm
                  </Button>
                </div>

                {invoiceItems.length === 0 && (
                  <div className="py-4 text-center text-muted-foreground">
                    Chưa có sản phẩm nào trong đơn hàng
                  </div>
                )}

                {invoiceItems.map((item, index) => (
                  <div key={item.id} className="relative rounded-md border p-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-6 w-6"
                      onClick={() => removeInvoiceItem(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <FormLabel>Sản phẩm</FormLabel>
                        <Input
                          placeholder="Tên sản phẩm"
                          value={item.productName}
                          onChange={(e) =>
                            updateInvoiceItem(
                              index,
                              'productName',
                              e.target.value,
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <FormLabel>Số lượng</FormLabel>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Số lượng"
                          value={item.quantity}
                          onChange={(e) =>
                            updateInvoiceItem(
                              index,
                              'quantity',
                              parseInt(e.target.value, 10) || 0,
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <FormLabel>Đơn giá</FormLabel>
                        <Input
                          type="number"
                          placeholder="Đơn giá"
                          value={item.price}
                          onChange={(e) =>
                            updateInvoiceItem(
                              index,
                              'price',
                              parseInt(e.target.value, 10) || 0,
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <FormLabel>Thành tiền</FormLabel>
                        <Input readOnly value={item.amount} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tổng tiền</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Tổng tiền"
                        {...field}
                        onChange={(e) => {
                          const value =
                            e.target.value === ''
                              ? 0
                              : parseFloat(e.target.value)
                          field.onChange(value)
                        }}
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
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Chờ thanh toán</SelectItem>
                        <SelectItem value="partial">
                          Thanh toán một phần
                        </SelectItem>
                        <SelectItem value="paid">Đã thanh toán</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={loading}>
                  {isUpdating ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default InvoiceDialog
