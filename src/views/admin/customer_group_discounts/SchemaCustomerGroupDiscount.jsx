import { z } from 'zod'

const createCustomerGroupDiscountSchema = z
  .object({
    customerGroupId: z
      .string()
      .min(1, { message: 'Phân loại khách hàng không được để trống' }),

    discountType: z.enum(['percentage', 'fixed'], {
      message: 'Loại giảm giá không hợp lệ',
    }),

    discountValue: z.preprocess(
      (val) =>
        val === '' || val === null || val === undefined
          ? undefined
          : Number(val),
      z
        .number({ invalid_type_error: 'Giá trị phải là số' })
        .refine((v) => !isNaN(v), { message: 'Giá trị phải là số hợp lệ' })
        .refine((v) => v >= 0, { message: 'Giá trị phải lớn hơn hoặc bằng 0' }),
    ),

    status: z.enum(['active', 'inactive']),
  })
  .superRefine((data, ctx) => {
    if (
      data.discountType === 'percentage' &&
      (data.discountValue < 0 || data.discountValue > 100)
    ) {
      ctx.addIssue({
        path: ['discountValue'],
        code: 'custom',
        message: 'Giá trị phần trăm phải từ 0 đến 100',
      })
    }
  })

const updateCustomerGroupDiscountSchema = createCustomerGroupDiscountSchema

export { createCustomerGroupDiscountSchema, updateCustomerGroupDiscountSchema }
