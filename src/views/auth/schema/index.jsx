import { z } from 'zod'

const loginSchema = z.object({
  username: z.string().min(1, { message: 'Vui lòng nhập tài khoản' }),
  password: z.string().min(1, { message: 'Vui lòng nhập mật khẩu' }),
})

const forgotPasswordSchema = z.object({
  email: z.string().email('Vui lòng nhập địa chỉ email hợp lệ'),
})

const passwordSchema = z
  .string()
  .min(8, { message: 'Mật khẩu phải ít nhất 8 ký tự' })
  .regex(/[A-Z]/, {
    message: 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa',
  })
  .regex(/[0-9]/, { message: 'Mật khẩu phải chứa ít nhất một số' })
  .regex(/[\W_]/, { message: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt' })

const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: 'Không được để trống' }),
  password: passwordSchema,
  confirmPassword: z.string().min(1, { message: 'Không được để trống' }),
})

export { loginSchema, forgotPasswordSchema, resetPasswordSchema }
