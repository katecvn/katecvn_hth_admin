import { z } from 'zod'

export const variantSchema = z.object({
  sku: z.string().trim().max(255, 'SKU tối đa 255 ký tự').optional(), // Nếu sku là bắt buộc thì bỏ .optional()
  stock: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: 'Số lượng tồn phải là số không âm',
    }),
  originalPrice: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: 'Giá gốc phải là số không âm',
    }),
  salePrice: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: 'Giá bán phải là số không âm',
    }),
  position: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: 'Vị trí phải là số không âm',
    }),
  imageUrl: z.string().url('Phải là đường dẫn ảnh hợp lệ').or(z.literal('')), // Có thể là rỗng
  status: z.enum(['active', 'hide', 'active_list']).default('active'),
})
