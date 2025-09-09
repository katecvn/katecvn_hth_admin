import { z } from 'zod'
const createTopicSchema = z.object({
  name: z.string().min(1, { message: 'Tên chủ đề không được để trống' }),
  status: z.enum(['active', 'blocked', 'published', 'pending']),
})
const updateTopicSchema = z.object({
  name: z.string().min(1, { message: 'Tên chủ đề không được để trống' }),
  status: z.enum(['active', 'blocked', 'published', 'pending']),
})
export { createTopicSchema, updateTopicSchema }
