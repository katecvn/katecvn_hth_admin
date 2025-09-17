import { z } from 'zod'

const createRewardPointRuleSchema = z.object({
  type: z.enum(['order_value', 'time_slot'], {
    required_error: 'Loại rule không được để trống',
  }),
  minOrderValue: z
    .number({ invalid_type_error: 'Giá trị đơn hàng phải là số' })
    .nonnegative('Giá trị đơn hàng không được âm')
    .optional(),
  beforeTime: z
    .string()
    .regex(
      /^\d{2}:\d{2}(:\d{2})?$/,
      'Thời gian không hợp lệ, định dạng HH:mm hoặc HH:mm:ss',
    )
    .optional(),
  points: z
    .number({ invalid_type_error: 'Điểm phải là số' })
    .int('Điểm phải là số nguyên')
    .min(1, 'Điểm phải lớn hơn 0'),
  status: z.enum(['active', 'inactive']).default('active'),
})

const updateRewardPointRuleSchema = createRewardPointRuleSchema.partial()

const getRewardPointHistoriesSchema = z.object({
  userId: z.number().optional(),
  orderId: z.number().optional(),
  ruleType: z.enum(['order_value', 'time_slot']).optional(),
  page: z.number().int().positive().default(1).optional(),
  limit: z.number().int().positive().max(100).default(20).optional(),
})

export {
  createRewardPointRuleSchema,
  updateRewardPointRuleSchema,
  getRewardPointHistoriesSchema,
}
