import { z } from 'zod'

const phoneRegex =
  /^(?:\+84|0)(?:3[2-9]|5[2689]|7[06789]|8[1-9]|9[0-9])[0-9]{7}$/

const passwordSchema = z
  .string()
  .min(8, { message: 'Mật khẩu phải ít nhất 8 ký tự' })
  .regex(/[A-Z]/, {
    message: 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa',
  })
  .regex(/[0-9]/, { message: 'Mật khẩu phải chứa ít nhất một số' })
  .regex(/[\W_]/, { message: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt' })

const baseUserSchema = {
  full_name: z.string().min(1, { message: 'Không được để trống' }),
  username: z.string().min(1, { message: 'Không được để trống' }),
  // role_id: z.string().min(1, { message: 'Không được để trống' }),
  role_id: z.string().optional(),
  phone_number: z
    .string()
    .nullable()
    .optional()
    .refine((value) => !value || phoneRegex.test(value), {
      message: 'Số điện thoại không hợp lệ',
    }),
  address: z.string().optional(),
  email: z
    .string()
    .email({ message: 'Email không hợp lệ' })
    .optional()
    .nullable(),
  status: z.string().min(1, { message: 'Không được để trống' }),
  date_of_birth: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  avatar_url: z.string().optional().nullable(),
}

const createUserSchema = z
  .object({
    ...baseUserSchema,
    password: passwordSchema,
    rePassword: z.string().min(1, { message: 'Không được để trống' }),
  })
  .refine((data) => data.password === data.rePassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['rePassword'],
  })

const updateUserSchema = z.object({
  ...baseUserSchema,
})
// .refine(
//   (data) => {
//     // Only validate passwords match if a new password is provided
//     if (!data.password && !data.rePassword) return true
//     return data.password === data.rePassword
//   },
//   {
//     message: 'Mật khẩu xác nhận không khớp',
//     path: ['rePassword'],
//   },
// )

const userFormSchema = z.union([createUserSchema, updateUserSchema])

export { userFormSchema, createUserSchema, updateUserSchema }
