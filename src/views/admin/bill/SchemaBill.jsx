// SchemaBill.js
import { z } from 'zod'

const validateDateStr = (val) => {
  if (!val) return true
  if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false
  const d = new Date(val)
  return !isNaN(d.getTime())
}

const validateTax = (val) => {
  if (val === '' || val === undefined || val === null) return true
  const num = Number(val)
  return !isNaN(num) && num >= 0 && num <= 100
}

const baseSchema = {
  orderId: z.string().min(1, { message: 'Vui lòng chọn đơn hàng' }),
  invoiceNumber: z.string().min(1, { message: 'Vui lòng nhập số hóa đơn' }),
  issueDate: z
    .string()
    .min(1, { message: 'Vui lòng chọn ngày phát hành' })
    .refine(validateDateStr, {
      message: 'Ngày phát hành không hợp lệ (YYYY-MM-DD)',
    }),
  dueDate: z
    .string()
    .refine(validateDateStr, {
      message: 'Ngày hạn thanh toán không hợp lệ (YYYY-MM-DD)',
    })
    .optional(),
  taxRate: z
    .string()
    .refine(validateTax, { message: 'Thuế phải là số từ 0 đến 100' })
    .optional(),
  note: z.string().max(255, { message: 'Ghi chú tối đa 255 ký tự' }).optional(),
  customerCompany: z.string().optional(),
  customerTaxCode: z.string().optional(),
  customerAddress: z.string().optional(),
}

export const createBillSchema = z.object(baseSchema)

export const updateBillSchema = z.object({
  ...baseSchema,
  id: z.number().optional(),
})

export const normalizeBillPayload = (data) => {
  return {
    orderId: Number(data.orderId),
    invoiceNumber: data.invoiceNumber,
    issueDate: data.issueDate,
    dueDate: data.dueDate || undefined,
    taxRate: Number(data.taxRate || 0),
    note: data.note || undefined,
    customerCompany: data.customerCompany || undefined,
    customerTaxCode: data.customerTaxCode || undefined,
    customerAddress: data.customerAddress || undefined,
    subTotal: data.subTotal,
    discountAmount: data.discountAmount,
    taxAmount: data.taxAmount,
    totalAmount: data.totalAmount,
  }
}
