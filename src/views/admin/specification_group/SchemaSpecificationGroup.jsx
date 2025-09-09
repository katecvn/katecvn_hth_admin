import { z } from 'zod'
const specificationGroupSchema = z.object({
  name: z.string().min(1, { message: 'Tên chủ đề không được để trống' }),
  position: z.string(),
})

export { specificationGroupSchema }
