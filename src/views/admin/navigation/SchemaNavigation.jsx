import { z } from 'zod'

const createNavigationSchema = z.object({
  title: z.string().min(1, { message: 'Không được để trống' }),
  url: z.string().min(1, { message: 'Không được để trống' }),
  parentId: z.union([z.string(), z.number()]).nullable().optional(),
  position: z.string().optional(), // Nếu là số thứ tự
})

export { createNavigationSchema }
