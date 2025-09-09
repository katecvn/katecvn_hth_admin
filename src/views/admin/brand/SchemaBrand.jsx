import { z } from 'zod'
const createBrandSchema = z.object({
  name: z.string().min(1, { message: 'Không được để trống' }),
  categoryIds: z
    .array(
      z.object({
        value: z.string().or(z.number()),
        label: z.string(),
      }),
    )
    .optional(),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
  iconUrl: z.string().optional(),
})
const updateBrandSchema = z.object({
  name: z.string().min(1, { message: 'Không được để trống' }),
  categoryIds: z
    .array(
      z.object({
        value: z.string().or(z.number()),
        label: z.string(),
      }),
    )
    .optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  iconUrl: z.string().optional(),
})
export { createBrandSchema, updateBrandSchema }
