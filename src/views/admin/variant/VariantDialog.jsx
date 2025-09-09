import { useRef, useState } from 'react'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import MediaModal from '../media/MediaModal'
import { ImageIcon } from 'lucide-react'
import { variantSchema } from './SchemaVariant'
import formatNumber from '@/utils/formatNumber'
import {
  createProductVariant,
  updateProductVariant,
} from '@/stores/ProductVariantSlice'

const types = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'hide', label: 'Ẩn' },
]
const parseNumber = (formattedNumber) => {
  if (!formattedNumber || formattedNumber === '0') return '0'
  return formattedNumber.toString().replace(/[^\d]/g, '')
}

const VariantDialog = ({
  open,
  onOpenChange,
  initialData = null,
  showTrigger = true,
  ...props
}) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.productVariant.loading)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [formError, setFormError] = useState(null)
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const editorRef = useRef(null)

  const isEditing = !!initialData
  const form = useForm({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      sku: initialData?.sku || '',
      stock: initialData?.stock || '0',
      originalPrice: initialData?.originalPrice || '0',
      salePrice: initialData?.salePrice || '0',
      position: initialData?.position || '0',
      imageUrl: initialData?.imageUrl || '',
      status: initialData?.status || 'active',
    },
  })

  const handleImageSelect = (imageUrl) => {
    form.setValue('imageUrl', imageUrl)
    setIsMediaModalOpen(false)
  }

  const handleImageSelectImage = async (imageUrl) => {
    if (imageUrl) {
      const imageHTML = `<img src="${imageUrl}" alt="inserted image" />`
      editorRef.current?.insertHTML(imageHTML)
    }
    setIsImageModalOpen(false)
  }

  const imageUrlValue = form.watch('imageUrl')

  const onSubmit = async (data) => {
    try {
      setFormError(null)
      const payload = {
        ...data,
        status: data.status,
      }

      if (isEditing) {
        await dispatch(
          updateProductVariant({ id: initialData.id, data: payload }),
        ).unwrap()
      } else {
        await dispatch(createProductVariant(payload)).unwrap()
      }

      form.reset()
      onOpenChange?.(false)
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
            {isEditing ? 'Cập nhật biến thể' : 'Thêm biến thể mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? (
              <>
                <span>Chỉnh sửa thông tin biến thể bên dưới</span>
                <br />
                <span>
                  Thông tin sản phẩm:{' '}
                  <span>{`${initialData?.product?.sku} ${initialData?.product?.name} `}</span>
                </span>
                <br />
                <span>
                  Thuộc tính biến thể:{' '}
                  {initialData?.attributeValues &&
                  initialData.attributeValues.length > 0 ? (
                    initialData.attributeValues.map((attribute, index) => (
                      <span key={index} className="me-1">
                        {attribute?.value}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground">Không có</span>
                  )}
                </span>
              </>
            ) : (
              'Điền vào chi tiết phía dưới để thêm biến thể mới'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto p-1 md:max-h-[75vh]">
          <Form {...form}>
            <form
              id="variant-form"
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
                  name="sku"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Mã biến thể</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập mã biến thể" {...field} />
                      </FormControl>
                      <FormMessage />
                      {formError && (
                        <div className="mb-4 text-sm text-red-500">
                          {formError?.name}
                        </div>
                      )}
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="originalPrice"
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel required={true}>Giá gốc</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập giá gốc"
                            {...field}
                            value={formatNumber(field.value)}
                            onChange={(e) => {
                              const rawValue = parseNumber(e.target.value)
                              field.onChange(rawValue)
                              form.trigger('originalPrice')
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                        {formError && (
                          <div className="mb-4 text-sm text-red-500">
                            {formError?.originalPrice}
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="salePrice"
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel required={true}>Giá bán</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập giá bán"
                            {...field}
                            value={formatNumber(field.value)}
                            onChange={(e) => {
                              const rawValue = parseNumber(e.target.value)
                              field.onChange(rawValue)
                              form.trigger('salePrice')
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                        {formError && (
                          <div className="mb-4 text-sm text-red-500">
                            {formError?.salePrice}
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel required={true}>Tồn kho</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                        {formError && (
                          <div className="mb-4 text-sm text-red-500">
                            {formError?.stock}
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel required={true}>Vị trí</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            placeholder="Nhập đưuòng dẫn"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        {formError && (
                          <div className="mb-4 text-sm text-red-500">
                            {formError?.position}
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel required={true}>Chọn trạng thái</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            {types.map((type, index) => (
                              <FormItem
                                key={`type-${index}`}
                                className="flex items-center space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <RadioGroupItem value={type.value} />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {type.label}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
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
                        <FormLabel>Ảnh biến thể</FormLabel>

                        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
                          <FormControl className="flex-1 gap-2">
                            <div className="flex items-center justify-between">
                              <Input placeholder="URL ảnh" {...field} />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsMediaModalOpen(true)}
                              >
                                <ImageIcon className="mr-2 size-4" />
                                Chọn ảnh
                              </Button>
                            </div>
                          </FormControl>
                        </div>
                        {!!imageUrlValue && (
                          <div className="mt-2 w-full rounded-md border border-gray-200 p-2 md:mt-0 md:w-full">
                            <p className="mb-1 text-xs text-gray-500">
                              Xem trước:
                            </p>
                            <div className="relative h-24 w-full overflow-hidden rounded-md bg-gray-100">
                              <img
                                src={imageUrlValue}
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
                setFormError(null)
              }}
            >
              Hủy
            </Button>
          </DialogClose>
          <Button form="variant-form" loading={loading}>
            {isEditing ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
      {confirmOpen && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          description="Hành động này sẽ thay đổi thông tin biến thể."
          onConfirm={() => onSubmit(form.getValues())}
          loading={loading}
        />
      )}
      {isMediaModalOpen && (
        <MediaModal
          open={isMediaModalOpen}
          onOpenChange={setIsMediaModalOpen}
          showTrigger={false}
          onSelectImage={handleImageSelect}
        />
      )}
      {isImageModalOpen && (
        <MediaModal
          open={isImageModalOpen}
          onOpenChange={setIsImageModalOpen}
          showTrigger={false}
          onSelectImage={handleImageSelectImage}
        />
      )}
    </Dialog>
  )
}

export default VariantDialog
