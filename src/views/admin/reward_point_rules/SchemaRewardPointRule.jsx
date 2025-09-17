import { z } from 'zod'

const toUndefinedIfEmpty = (v) => (v === '' || v === null ? undefined : v)

const pointsSchema = z.preprocess(
  toUndefinedIfEmpty,
  z.coerce
    .number({ invalid_type_error: 'Điểm phải là số' })
    .int('Điểm phải là số nguyên')
    .min(1, 'Điểm phải lớn hơn 0'),
)

const statusSchema = z.enum(['active', 'inactive']).default('active')

export const createOrderValueRuleSchema = z.object({
  type: z.literal('order_value'),
  minOrderValue: z.preprocess(
    toUndefinedIfEmpty,
    z.coerce
      .number({ invalid_type_error: 'Giá trị đơn hàng phải là số' })
      .nonnegative('Giá trị đơn hàng không được âm'),
  ),
  points: pointsSchema,
  status: statusSchema,
})

export const createTimeSlotRuleSchema = z.object({
  type: z.literal('time_slot'),
  beforeTime: z
    .string()
    .regex(
      /^\d{2}:\d{2}(:\d{2})?$/,
      'Thời gian không hợp lệ (HH:mm hoặc HH:mm:ss)',
    ),
  points: pointsSchema,
  status: statusSchema,
})

export const updateOrderValueRuleSchema = createOrderValueRuleSchema
export const updateTimeSlotRuleSchema = createTimeSlotRuleSchema
