import { z } from 'zod'

export const createReviewSchema = z.object({
  productId: z.string({
    required_error: 'Sản phẩm không được để trống',
  }),
  userId: z.string({
    required_error: 'Người dùng không được để trống',
  }),
  rating: z.coerce
    .number({
      required_error: 'Số sao không được để trống',
    })
    .min(1, 'Số sao tối thiểu là 1')
    .max(5, 'Số sao tối đa là 5'),
  comment: z.string().optional(),
  status: z.coerce.number().optional(),
})
