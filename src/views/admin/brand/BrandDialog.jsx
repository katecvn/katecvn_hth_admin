import { useState } from 'react'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm, Controller } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { createBrandSchema } from './SchemaBrand'
import { createBrand, updateBrand } from '@/stores/BrandSlice'
import Select from 'react-select'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import { useTheme } from '@/components/ThemeProvider'
// import MediaModal from '../../media/MediaModal'
import MediaModal from '../media/MediaModal'
import { ImageIcon } from 'lucide-react'

const BrandDialog = ({
  open,
  onOpenChange,
  initialData = null,
  showTrigger = true,
  ...props
}) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.category.loading)
  const categories = useSelector((state) => state.category.categories)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [mediaModalOpen, setMediaModalOpen] = useState(false)
  const [mediaModalOpenForIcon, setMediaModalOpenForIcon] = useState(false)
  const { theme } = useTheme()

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  const customStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: isDark ? '#1f2937' : '#fff',
      color: isDark ? '#fff' : '#000',
      borderColor: isDark ? '#374151' : '#d1d5db',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? '#1f2937' : '#fff',
      color: isDark ? '#fff' : '#000',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? isDark
          ? '#374151'
          : '#e5e7eb'
        : isDark
          ? '#1f2937'
          : '#fff',
      color: isDark ? '#fff' : '#000',
    }),
    singleValue: (base) => ({
      ...base,
      color: isDark ? '#fff' : '#000',
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: isDark ? '#374151' : '#e5e7eb',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: isDark ? '#fff' : '#000',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: isDark ? '#fff' : '#000',
      ':hover': {
        backgroundColor: isDark ? '#4b5563' : '#d1d5db',
        color: isDark ? '#fff' : '#000',
      },
    }),
  }
  const isEditing = !!initialData
  const form = useForm({
    resolver: zodResolver(createBrandSchema),
    defaultValues: {
      name: initialData?.name || '',
      categoryIds:
        initialData?.categoryIds?.map((id) => ({
          value: id,
          label: categories.find((c) => c.id === id)?.name,
        })) || [],
      description: initialData?.description || '',
      imageUrl: initialData?.imageUrl || '',
      iconUrl: initialData?.iconUrl || '',
    },
  })

  const thumbnailValue = form.watch('imageUrl')
  const handleImageSelect = (imageUrl) => {
    form.setValue('imageUrl', imageUrl)
    setMediaModalOpen(false)
  }

  const iconImageValue = form.watch('iconUrl')
  const handleIconImageSelect = (iconUrl) => {
    form.setValue('iconUrl', iconUrl)
    setMediaModalOpenForIcon(false)
  }

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        categoryIds: data?.categoryIds?.map((c) => c.value) || [],
        description: data.description || '',
      }

      if (isEditing) {
        await dispatch(
          updateBrand({ id: initialData.id, data: payload }),
        ).unwrap()
      } else {
        await dispatch(createBrand(payload)).unwrap()
      }
      form.reset()
      onOpenChange?.(false)
    } catch (error) {
      console.error('Submit error: ', error)
    }
  }

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {showTrigger && !isEditing && (
        <DialogTrigger asChild>
          <Button className="mx-2" variant="outline" size="sm">
            Thêm mới
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="md:h-auto md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Cập nhật thương hiệu' : 'Thêm thương hiệu mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Chỉnh sửa thông tin thương hiệu bên dưới'
              : 'Điền vào chi tiết phía dưới để thêm thương hiệu mới'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto p-1 md:max-h-[75vh]">
          <Form {...form}>
            <form
              id="brand-form"
              onSubmit={async (e) => {
                if (isEditing) {
                  e.preventDefault()
                  if (await form.trigger()) {
                    setConfirmOpen(true)
                  }
                } else {
                  form.handleSubmit(onSubmit)(e)
                }
              }}
            >
              <div className="grid gap-4 md:grid-cols-1">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Tên thương hiệu</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập tên"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* 
                <Controller
                  control={form.control}
                  name="categoryIds"
                  render={({ field: { onChange, value, ref } }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Chọn danh mục</FormLabel>
                      <FormControl>
                        <Select
                          ref={ref}
                          isMulti
                          options={categoryOptions}
                          value={value}
                          onChange={(selectedOptions) => {
                            onChange(selectedOptions || [])
                          }}
                          placeholder="Chọn danh mục"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
                <Controller
                  control={form.control}
                  name="categoryIds"
                  render={({ field: { onChange, value, ref } }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Chọn danh mục</FormLabel>
                      <FormControl>
                        <Select
                          ref={ref}
                          isMulti
                          options={categoryOptions}
                          value={value}
                          onChange={(selectedOptions) => {
                            onChange(selectedOptions || [])
                          }}
                          placeholder="Chọn danh mục"
                          styles={customStyles}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập mô tả"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageUrl"
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
                {/* Icon image */}
                <FormField
                  control={form.control}
                  name="iconUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ảnh biểu tượng</FormLabel>
                      <FormControl>
                        <div className="flex space-x-2">
                          <Input placeholder="Nhập đường dẫn ảnh" {...field} />
                          <Button
                            type="button"
                            onClick={() => setMediaModalOpenForIcon(true)}
                            variant="outline"
                          >
                            <ImageIcon className="mr-2 size-4" />
                            Chọn ảnh
                          </Button>
                        </div>
                      </FormControl>
                      {!!iconImageValue && (
                        <div className="mt-2 rounded-md border border-gray-200 p-2">
                          <p className="mb-2 text-sm text-gray-500">
                            Xem trước:
                          </p>
                          <div className="relative h-48 w-full overflow-hidden rounded-md bg-gray-100">
                            <img
                              src={iconImageValue}
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
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="flex gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Hủy
            </Button>
          </DialogClose>
          <Button form="brand-form" loading={loading}>
            {isEditing ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
      {confirmOpen && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          description="Hành động này sẽ thay đổi thông tin thương hiệu."
          onConfirm={() => onSubmit(form.getValues())}
          loading={loading}
        />
      )}
      {mediaModalOpen && (
        <MediaModal
          open={mediaModalOpen}
          onOpenChange={setMediaModalOpen}
          showTrigger={false}
          onSelectImage={handleImageSelect}
        />
      )}
      {mediaModalOpenForIcon && (
        <MediaModal
          open={mediaModalOpenForIcon}
          onOpenChange={setMediaModalOpenForIcon}
          showTrigger={false}
          onSelectImage={handleIconImageSelect}
        />
      )}
    </Dialog>
  )
}

export default BrandDialog
