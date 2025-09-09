import { z } from 'zod'

const createPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: 'Tiêu đề phải từ 3-100 kí tự' })
    .max(100, { message: 'Tiêu đề phải từ 3-100 kí tự' }),
  slug: z
    .string()
    .trim()
    .min(3, { message: 'Tiêu đề phải từ 3-100 kí tự' })
    .max(100, { message: 'Tiêu đề phải từ 3-100 kí tự' }),
  content: z
    .string()
    .trim()
    .min(1, { message: 'Nội dung phải lớn hơn 10 kí tự' }),

  topics: z
    .string()
    // .array(z.number(), { message: 'Phải chọn ít nhất một chủ đề' })
    .min(1, { message: 'Phải chọn ít nhất một chủ đề' }),
  // shortDescription: z
  //   .string()
  //   .trim()
  //   .min(10, { message: 'Nội dung phải lớn hơn 10 kí tự' }),
  shortDescription: z.string().optional(),

  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  thumbnail: z.string().optional(),
})

export { createPostSchema }
