import { z } from 'zod'

const createCustomerGroupSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Tên phân loại khách hàng không được để trống' }),
  description: z.string().optional(),
  type: z.enum(['individual', 'organization']).default('organization'),
})

const updateCustomerGroupSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Tên phân loại khách hàng không được để trống' }),
  description: z.string().optional(),
  type: z.enum(['individual', 'organization']).optional(),
})

export { createCustomerGroupSchema, updateCustomerGroupSchema }
