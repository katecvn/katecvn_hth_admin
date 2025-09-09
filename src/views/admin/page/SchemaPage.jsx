import { z } from 'zod'

const createPageSchema = z.object({
  title: z.string().min(1, { message: 'Không được để trống' }),
  slug: z.string().min(1, { message: 'Không được để trống' }),
})

export { createPageSchema }
