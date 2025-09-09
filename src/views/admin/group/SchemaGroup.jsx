import { z } from 'zod'
const createGroupSchema = z.object({
  name: z.string().min(1, { message: 'Tên nhóm sản phẩm không được để trống' }),
  slug: z.string().min(1, { message: 'Đường dẫn không được để trống' }),
  description: z.string().optional(),
})

const updateGroupSchema = z.object({
  name: z.string().min(1, { message: 'Tên nhóm sản phẩm không được để trống' }),
  slug: z.string().min(1, { message: 'Đường dẫn không được để trống' }),
  description: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  categoryId: z.string().optional(),
  unit: z.string().optional(),
  linkUrl: z.string().optional(),
})
export { createGroupSchema, updateGroupSchema }
