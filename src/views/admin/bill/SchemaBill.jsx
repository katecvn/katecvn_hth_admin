import { z } from 'zod'

// validate ngày YYYY-MM-DD
const validateDateStr = (val) => {
  if (!val) return true // optional
  if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false
  const d = new Date(val)
  return !isNaN(d.getTime())
}

// validate số thuế (0-100)
const validateTax = (val) => {
  if (val === '' || val === undefined || val === null) return true
  const num = Number(val)
  return !isNaN(num) && num >= 0 && num <= 100
}

const baseSchema = {
  orderId: z.string().min(1, { message: 'Vui lòng chọn đơn hàng' }),
  invoiceNumber: z.string().optional(),
  issueDate: z
    .string()
    .refine(validateDateStr, {
      message: 'Ngày phát hành không hợp lệ (YYYY-MM-DD)',
    })
    .optional(),
  dueDate: z
    .string()
    .refine(validateDateStr, {
      message: 'Ngày hạn thanh toán không hợp lệ (YYYY-MM-DD)',
    })
    .optional(),
  taxRate: z
    .string()
    .refine(validateTax, {
      message: 'Thuế phải là số từ 0 đến 100',
    })
    .optional(),
  note: z.string().max(255, { message: 'Ghi chú tối đa 255 ký tự' }).optional(),
}

// tạo
export const createBillSchema = z.object(baseSchema)

// update (giữ như tạo nhưng có id)
export const updateBillSchema = z.object({
  ...baseSchema,
  id: z.number().optional(),
})

// Chuẩn hóa payload trước khi gửi BE
export const normalizeBillPayload = (data) => {
  return {
    orderId: Number(data.orderId),
    invoiceNumber: data.invoiceNumber || undefined,
    issueDate: data.issueDate || undefined,
    dueDate: data.dueDate || undefined,
    taxRate: Number(data.taxRate || 0),
    note: data.note || undefined,
    subTotal: data.subTotal,
    discountAmount: data.discountAmount,
    taxAmount: data.taxAmount,
    totalAmount: data.totalAmount,
  }
}
