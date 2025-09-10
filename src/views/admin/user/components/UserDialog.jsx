import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog'
import { PlusIcon } from '@radix-ui/react-icons'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/custom/PasswordInput'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUser, updateUser } from '@/stores/UserSlice'
import { useDispatch, useSelector } from 'react-redux'
import { getRoles } from '@/stores/RoleSlice'
import { getCustomerGroup } from '@/stores/CustomerGroupSlice'
import { createUserSchema, updateUserSchema } from '../schema'
import { statuses, genders } from './../data/index'
import MediaModal from '../../media/MediaModal'
import { CalendarIcon, ImageIcon } from 'lucide-react'
import { DatePicker } from '@/components/custom/DatePicker'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { formatDateVN, parseDateLocal } from '@/utils/parse-date'

const formatDateForInput = (isoDateString) => {
  if (!isoDateString) return ''
  try {
    const date = new Date(isoDateString)
    return date.toISOString().split('T')[0]
  } catch {
    return ''
  }
}

const UserDialog = ({
  open,
  onOpenChange,
  showTrigger = true,
  isUpdate = false,
  userData = null,
  isModal,
  ...props
}) => {
  const loading = useSelector((state) => state.user.loading)
  const roles = useSelector((state) => state.role.roles)
  const customerGroups = useSelector(
    (state) => state.customerGroup.customerGroups || [],
  )
  const [mediaModalOpen, setMediaModalOpen] = useState(false)

  const form = useForm({
    resolver: zodResolver(isUpdate ? updateUserSchema : createUserSchema),
    defaultValues: {
      full_name: '',
      code: '',
      username: '',
      password: isUpdate ? undefined : '',
      rePassword: isUpdate ? undefined : '',
      phone_number: '',
      role_id: '',
      customerGroupId: '',
      address: '',
      email: '',
      date_of_birth: '',
      gender: '',
      avatar_url: '',
      status: '',
    },
  })

  const thumbnailValue = form.watch('avatar_url')
  const selectedCustomerGroupId = form.watch('customerGroupId')

  const selectedCustomerGroup = useMemo(() => {
    return customerGroups.find(
      (g) => String(g.id) === String(selectedCustomerGroupId),
    )
  }, [customerGroups, selectedCustomerGroupId])

  const handleImageSelect = (imageUrl) => {
    form.setValue('avatar_url', imageUrl)
    setMediaModalOpen(false)
  }

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getRoles())
    dispatch(getCustomerGroup())
  }, [dispatch])

  useEffect(() => {
    if (isUpdate && userData) {
      form.reset({
        full_name: userData.full_name || '',
        code: userData.code || '',
        username: userData.username || '',
        password: '',
        rePassword: '',
        phone_number: userData.phone_number || '',
        role_id: userData.role_id?.toString() || '',
        customerGroupId: userData.customerGroupId?.toString() || '',
        address: userData.address || '',
        email: userData.email || '',
        date_of_birth: formatDateForInput(userData.date_of_birth) || '',
        gender: userData.gender || '',
        avatar_url: userData.avatar_url || '',
        status: userData.status?.toString() || '',
      })
    } else {
      form.reset({
        full_name: '',
        code: '',
        username: '',
        password: '',
        rePassword: '',
        phone_number: '',
        role_id: '',
        customerGroupId: '',
        address: '',
        email: '',
        date_of_birth: '',
        gender: '',
        avatar_url: '',
        status: '',
      })
    }
  }, [isUpdate, userData, form])

  const onSubmit = async (data) => {
    try {
      if (isUpdate && userData) {
        await dispatch(
          updateUser({
            id: userData.id,
            data: data,
          }),
        ).unwrap()
      } else {
        await dispatch(createUser(data)).unwrap()
      }
      form.reset()
      onOpenChange?.(false)
    } catch (error) {
      const errorMessage =
        error.response?.data?.messages ||
        error.message ||
        'Có lỗi xảy ra. Vui lòng thử lại.'
      if (typeof errorMessage === 'object') {
        Object.keys(errorMessage).forEach((field) => {
          form.setError(field, {
            type: 'server',
            message: errorMessage[field],
          })
        })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button className="mx-2" variant="outline" size="sm">
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            {isUpdate ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="md:h-auto md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? 'Cập nhật người dùng' : 'Thêm người dùng mới'}
          </DialogTitle>
          <DialogDescription>
            {isUpdate
              ? 'Chỉnh sửa thông tin người dùng bên dưới'
              : 'Điền vào chi tiết phía dưới để thêm người dùng mới'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto p-1 md:max-h-[75vh]">
          <Form {...form}>
            <form id="user-form" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>
                        {isModal === 'admin' ? 'Họ và tên' : 'Tên khách hàng'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            isModal === 'admin'
                              ? 'Nhập họ và tên'
                              : 'Nhập tên khách hàng'
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isModal === 'admin' ? (
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel>Mã nhân viên</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập mã nhân viên" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="customerGroupId"
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel>Phân loại khách hàng</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn nhóm khách hàng" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customerGroups.length > 0 ? (
                              customerGroups.map((group) => (
                                <SelectItem
                                  key={group.id}
                                  value={String(group.id)}
                                >
                                  {group.name}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="px-2 py-1 text-sm text-gray-500">
                                Không có dữ liệu
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Tên tài khoản</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên tài khoản" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isUpdate && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel required={!isUpdate}>Mật khẩu</FormLabel>
                        <FormControl>
                          <PasswordInput
                            autoComplete="new-password"
                            placeholder="Nhập mật khẩu"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {!isUpdate && (
                  <FormField
                    control={form.control}
                    name="rePassword"
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel required>Xác nhận mật khẩu</FormLabel>
                        <FormControl>
                          <PasswordInput
                            autoComplete="new-password"
                            placeholder="Xác nhận mật khẩu"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {(!selectedCustomerGroup ||
                  selectedCustomerGroup?.type === 'individual') && (
                  <>
                    <FormField
                      control={form.control}
                      name="date_of_birth"
                      render={({ field }) => {
                        const displayValue = formatDateVN(field.value)
                        return (
                          <FormItem className="mb-2 space-y-1">
                            <FormLabel>Ngày sinh</FormLabel>
                            <FormControl>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <div className="relative w-full">
                                    <Input
                                      readOnly
                                      value={displayValue}
                                      placeholder="Chọn ngày sinh"
                                      className={
                                        'cursor-pointer pr-10 text-left ' +
                                        (!displayValue
                                          ? 'text-muted-foreground'
                                          : '')
                                      }
                                    />
                                    <CalendarIcon
                                      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                                      size={18}
                                    />
                                  </div>
                                </PopoverTrigger>
                                <PopoverContent
                                  align="start"
                                  className="w-auto p-0"
                                >
                                  <DatePicker
                                    mode="single"
                                    captionLayout="dropdown-buttons"
                                    selected={parseDateLocal(field.value)}
                                    onSelect={(date) => {
                                      if (date) {
                                        const year = date.getFullYear()
                                        const month = (date.getMonth() + 1)
                                          .toString()
                                          .padStart(2, '0')
                                        const day = date
                                          .getDate()
                                          .toString()
                                          .padStart(2, '0')
                                        field.onChange(
                                          `${year}-${month}-${day}`,
                                        )
                                      } else {
                                        field.onChange('')
                                      }
                                    }}
                                    fromYear={1950}
                                    toYear={new Date().getFullYear()}
                                  />
                                </PopoverContent>
                              </Popover>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )
                      }}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem className="mb-2 space-y-1">
                          <FormLabel>Giới tính</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn giới tính" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectGroup>
                                {genders?.map((gender) => (
                                  <SelectItem
                                    key={gender.value}
                                    value={gender.value}
                                  >
                                    {gender.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập số điện thoại" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Nhập địa chỉ email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Địa chỉ</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập địa chỉ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="avatar_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ảnh đại diện</FormLabel>
                      <FormControl>
                        <div className="flex space-x-2">
                          <Input placeholder="Nhập đường dẫn ảnh" {...field} />
                          <Button
                            type="button"
                            onClick={() => setMediaModalOpen(true)}
                            variant="outline"
                          >
                            <ImageIcon className="mr-2 size-4" />
                            Chọn ảnh
                          </Button>
                        </div>
                      </FormControl>
                      {!!thumbnailValue && (
                        <div className="mt-2 rounded-md border border-gray-200 p-2">
                          <p className="mb-2 text-sm text-gray-500">
                            Xem trước:
                          </p>
                          <div className="relative h-48 w-full overflow-hidden rounded-md bg-gray-100">
                            <img
                              src={thumbnailValue}
                              alt="Ảnh bìa xem trước"
                              className="h-full w-full object-contain"
                              onError={(e) => {
                                e.target.src = '/image-err.jpg'
                                e.target.onerror = null
                              }}
                            />
                          </div>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isModal === 'admin' && (
                  <FormField
                    control={form.control}
                    name="role_id"
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel required={true}>Vai trò</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn vai trò" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={null}>Chọn vai trò</SelectItem>
                            {roles &&
                              roles.map((role) => (
                                <SelectItem
                                  key={role.id}
                                  value={role.id.toString()}
                                >
                                  {role.description}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Trạng thái</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            {statuses.map((status) => (
                              <SelectItem
                                key={status.label}
                                value={status.value.toString()}
                              >
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="flex gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset()
              }}
            >
              Hủy
            </Button>
          </DialogClose>

          <Button form="user-form" loading={loading}>
            {isUpdate ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
      {mediaModalOpen && (
        <MediaModal
          open={mediaModalOpen}
          onOpenChange={setMediaModalOpen}
          showTrigger={false}
          onSelectImage={handleImageSelect}
        />
      )}
    </Dialog>
  )
}

export default UserDialog
