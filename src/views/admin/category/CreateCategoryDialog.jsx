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
import { useState, useEffect } from 'react'
import { slugify } from '@/utils/slugify'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { createCategory } from '@/stores/CategorySlice'
import { createCategorySchema } from './SchemaCategory'
import MediaModal from '../media/MediaModal'
import { ImageIcon } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const CreateCategoryDialog = ({
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const loading = useSelector((state) => state.category.loading)
  const categories = useSelector((state) => state.category.categories)
  const [mediaModalOpen, setMediaModalOpen] = useState(false)
  const [mediaModalOpenForIcon, setMediaModalOpenForIcon] = useState(false)

  const form = useForm({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: '',
      slug: '',
      thumbnail: '',
      parentId: '',
      iconUrl: '',
    },
  })

  const dispatch = useDispatch()

  const thumbnailValue = form.watch('thumbnail')

  const handleImageSelect = (thumbnail) => {
    form.setValue('thumbnail', thumbnail)
    setMediaModalOpen(false)
  }

  const iconImageValue = form.watch('iconUrl')

  const handleIconImageSelect = (iconUrl) => {
    form.setValue('iconUrl', iconUrl)
    setMediaModalOpenForIcon(false)
  }

  const handleParentChange = (value) => {
    form.setValue('parentId', Number(value))
  }

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      parentId: data.parentId === 'none' ? null : Number(data.parentId),
    }

    try {
      await dispatch(createCategory(payload)).unwrap()
      form.reset()
      onOpenChange?.(false)
    } catch (error) {
      console.log('error>>>', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button className="mx-2" variant="outline" size="sm">
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="md:h-auto md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thêm danh mục mới</DialogTitle>
          <DialogDescription>
            Điền vào chi tiết phía dưới để thêm danh mục mới
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto p-1 md:max-h-[75vh]">
          <Form {...form}>
            <form id="create-category" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel required={true}>Tên danh mục</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập tên"
                            onChange={(e) => {
                              const name = e.target.value
                              const slug = slugify(name)
                              form.setValue('slug', slug)
                              field.onChange(name)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel required={true}>Slug</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập slug"
                            {...field}
                            value={field.value}
                            onChange={(e) => {
                              const slug = slugify(e.target.value)
                              field.onChange(slug)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parentId"
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel>Danh mục cấp trên</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value)
                            form.setValue('parentId', value)
                          }}
                          value={field.value ?? ''}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">
                              Không có Danh mục cấp trên
                            </SelectItem>
                            {categories.map((category) => (
                              <SelectItem
                                key={category.id}
                                value={String(category.id)}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-1">
                  <FormField
                    control={form.control}
                    name="thumbnail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ảnh đại diện</FormLabel>
                        <FormControl>
                          <div className="flex space-x-2">
                            <Input
                              placeholder="Nhập đường dẫn ảnh"
                              {...field}
                            />
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
                            <div className="relative h-32 w-full overflow-hidden rounded-md bg-gray-100">
                              <img
                                src={thumbnailValue}
                                alt="Ảnh bìa xem trước"
                                className="h-32 w-full object-contain"
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

                  <FormField
                    control={form.control}
                    name="iconUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ảnh biểu tượng</FormLabel>
                        <FormControl>
                          <div className="flex space-x-2">
                            <Input
                              placeholder="Nhập đường dẫn ảnh"
                              {...field}
                            />
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
                            <div className="relative h-32 w-full overflow-hidden rounded-md bg-gray-100">
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

          <Button form="create-category" loading={loading}>
            Thêm mới
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

export default CreateCategoryDialog
