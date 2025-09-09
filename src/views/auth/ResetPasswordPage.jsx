import { Button } from '@/components/custom/Button'
import { Card } from '@/components/ui/card'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, FormProvider } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { resetPasswordSchema } from './schema'
import { IconArrowLeft } from '@tabler/icons-react'
import { PasswordInput } from '@/components/custom/PasswordInput'
import { useEffect } from 'react'
import { resetPass } from '@/stores/AuthSlice'
import { useDispatch } from 'react-redux'

const ResetPasswordPage = () => {
  const dispatch = useDispatch()

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data) => {
    try {
      // setFormError(null)

      await dispatch(resetPass(data)).unwrap()

      navigate('/dashboard')
      form.reset()
      // onOpenChange?.(false)
    } catch (error) {
      console.error('Submit error: ', error)
      const errorMessage =
        error.response?.data?.messages ||
        error.message ||
        'Có lỗi xảy ra. Vui lòng thử lại.'
      console.log(errorMessage, 'errorMessage')
      Object.keys(errorMessage).forEach((field) => {
        form.setError(field, { type: 'server', message: errorMessage[field] })
      })
    }
  }

  useEffect(() => {
    document.title = 'Cập nhật mật khẩu'
  }, [])

  const isAuthenticated = !!localStorage.getItem('accessToken')
  const navigate = useNavigate()

  const checkAuthenticated = () => {
    if (isAuthenticated) {
      return navigate('/dashboard')
    }
  }

  useEffect(() => {
    checkAuthenticated()
  }, [])

  return (
    <div className="container grid h-svh flex-col items-center justify-center bg-primary-foreground lg:max-w-none lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[480px] lg:p-8">
        <Card className="p-6">
          <div className="flex flex-col space-y-2 text-left">
            <h1 className="text-2xl font-semibold tracking-tight">
              Cập nhật mật khẩu
            </h1>
            <p className="text-sm text-muted-foreground">
              Vui lòng hoàn thành đầy đủ thông tin bên dưới
            </p>
          </div>

          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>OTP</FormLabel>
                      <FormControl>
                        <Input
                          // readOnly
                          // type="token"
                          autoComplete="off"
                          placeholder="Nhập OTP"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mb-3">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel>Mật khẩu mới</FormLabel>
                        <FormControl>
                          <PasswordInput
                            tabIndex={2}
                            autoComplete="new-password"
                            placeholder="Nhập mật khẩu mới"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription className="text-primary">
                          <strong className="text-destructive">Lưu ý:</strong>{' '}
                          Mật khẩu phải chứa ít nhất 8 ký tự, chữ hoa, chữ
                          thường và số.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mb-3">
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel>Xác nhận khẩu</FormLabel>
                        <FormControl>
                          <PasswordInput
                            tabIndex={3}
                            autoComplete="new-password"
                            placeholder="Xác nhận lại mật khẩu"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button className="mt-2" type="submit">
                  Cập nhật
                </Button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-sm text-muted-foreground">
                      Hoặc
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <Link
                    to="/"
                    className="text-sm font-medium text-primary hover:opacity-75"
                  >
                    <p className="flex items-center justify-center">
                      <IconArrowLeft className="mx-2 h-4 w-4" /> Quay lại trang
                      đăng nhập
                    </p>
                  </Link>
                </div>
              </div>
            </form>
          </FormProvider>

          <p className="mt-4 px-8 text-center text-sm text-muted-foreground">
            <span>Liên hệ hotline: </span>
            <a
              href="callto:0889881010"
              className="underline underline-offset-4 hover:text-primary"
            >
              0889881010
            </a>
          </p>
        </Card>
      </div>
    </div>
  )
}

export default ResetPasswordPage
