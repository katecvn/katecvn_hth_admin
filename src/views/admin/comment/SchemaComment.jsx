import * as z from 'zod'

export const commentSchema = z.object({
  content: z
    .string()
    .min(10, { message: 'Nội dung bình luận cần ít nhất 10 ký tự' })
    .max(500, { message: 'Nội dung bình luận tối đa 500 ký tự' }),
  
  ableId: z.string({ message: 'ID bài viết không được để trống' }),

  
  parentId: z.string().optional().nullable(),
  replyTo: z.string().optional().nullable(),
})

export const defaultValues = {
  content: '',
  ableId: '',
  parentId: null,
  replyTo: null,
} 