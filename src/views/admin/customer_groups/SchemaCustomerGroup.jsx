import { z } from 'zod'

const createCustomerGroupSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Tên nhóm khách hàng không được để trống' }),
  description: z.string().optional(),
})

const updateCustomerGroupSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Tên nhóm khách hàng không được để trống' }),
  description: z.string().optional(),
})

export { createCustomerGroupSchema, updateCustomerGroupSchema }
