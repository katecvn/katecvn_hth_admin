import { z } from 'zod'

const createRoleSchema = z.object({
  name: z.string().min(1, { message: 'Không được để trống' }),
  description: z.string().min(1, { message: 'Không được để trống' }),
  permissionIds: z
    .array(
      z.object({
        value: z.string().or(z.number()),
        label: z.string(),
      }),
    )
    .optional(),
})

const updateRoleSchema = z.object({
  name: z.string().min(1, { message: 'Không được để trống' }),
  description: z.string().min(1, { message: 'Không được để trống' }),
  permissionIds: z
    .array(
      z.object({
        value: z.string().or(z.number()),
        label: z.string(),
      }),
    )
    .optional(),
})

export { createRoleSchema, updateRoleSchema }
