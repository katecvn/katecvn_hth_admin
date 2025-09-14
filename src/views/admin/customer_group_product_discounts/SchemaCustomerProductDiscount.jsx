import { z } from 'zod'

// Chỉ validate những field có trong form
const baseFormSchema = z.object({
  discountType: z.enum(['percentage', 'fixed'], {
    required_error: 'Vui lòng chọn loại giảm giá',
  }),
  // Dùng coerce để nhận cả string số -> number
  discountValue: z.coerce.number().min(1, 'Giá trị giảm không hợp lệ'),
  status: z.enum(['active', 'inactive'], {
    required_error: 'Vui lòng chọn trạng thái',
  }),
})

export const createProductDiscountSchema = baseFormSchema
export const updateProductDiscountSchema = baseFormSchema
export const bulkProductDiscountSchema = baseFormSchema
