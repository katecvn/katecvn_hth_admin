import { z } from 'zod'
const createCategorySchema = z.object({
  name: z.string().min(1, { message: 'Không được để trống' }),
  slug: z.string().min(1, { message: 'Không được để trống' }),
  thumbnail: z.string().optional(),
  iconUrl: z.string().optional(),
  parentId: z.union([z.string(), z.number()]).nullable().optional(),
})
const updateCategorySchema = z.object({
  name: z.string().min(1, { message: 'Không được để trống' }),
  slug: z.string().min(1, { message: 'Không được để trống' }),
  thumbnail: z.string().optional(),
  iconUrl: z.string().optional(),
  parentId: z.union([z.string(), z.number()]).nullable().optional(),
})
export { createCategorySchema, updateCategorySchema }
