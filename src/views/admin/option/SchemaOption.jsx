import { z } from 'zod'
const createOptionSchema = z.object({
  name: z.string().min(1, { message: 'Không được để trống' }),
  groupId: z.string().optional(),
  unit: z.string().optional(),
})
const updateOptionSchema = z.object({
  name: z.string().min(1, { message: 'Không được để trống' }),
  groupId: z.string().optional(),
  unit: z.string().optional(),
})
export { createOptionSchema, updateOptionSchema }
