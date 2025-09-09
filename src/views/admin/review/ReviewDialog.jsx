import { useState, useEffect } from 'react'
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
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { createReview, updateReview } from '@/stores/ReviewSlice'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Star } from 'lucide-react'
import { createReviewSchema } from './SchemaReview'
import { getProduct } from '@/stores/ProductSlice'
import { getUsers } from '@/stores/UserSlice'

const ReviewDialog = ({
  open,
  onOpenChange,
  initialData = null,
  showTrigger = true,
  ...props
}) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.review.loading)
  const products = useSelector((state) => state.product.products)
  const users = useSelector((state) => state.user.users)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    // dispatch(getProduct())
    // dispatch(getUsers())
  }, [dispatch])

  const isEditing = !!initialData
  const form = useForm({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      productId: initialData?.productId?.toString() || '',
      userId: initialData?.userId?.toString() || '',
      rating: initialData?.rating || 5,
      comment: initialData?.comment || '',
      status: initialData?.status || 1,
    },
  })

  const onSubmit = async (data) => {
    setConfirmOpen(true)
  }

  const handleConfirm = async () => {
    try {
      const formData = form.getValues()
      if (isEditing) {
        await dispatch(
          updateReview({ id: initialData.id, data: formData }),
        ).unwrap()
      } else {
        await dispatch(createReview(formData)).unwrap()
      }
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setConfirmOpen(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} {...props}>
        {showTrigger && (
          <DialogTrigger asChild>
            <Button>Thêm đánh giá</Button>
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Cập nhật đánh giá' : 'Thêm đánh giá'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Cập nhật thông tin đánh giá'
                : 'Điền thông tin để thêm một đánh giá mới'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sản phẩm</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn sản phẩm" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products?.map((product) => (
                          <SelectItem
                            key={product.id}
                            value={product.id.toString()}
                          >
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Người dùng</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn người dùng" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users?.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số sao</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        {...field}
                        placeholder="Nhập số sao (1-5)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nội dung đánh giá</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Nhập nội dung đánh giá"
                        className="resize-none"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Kích hoạt</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value === 1}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? 1 : 0)
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Hủy
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={loading}>
                  {isEditing ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
        <ConfirmDialog
          title={isEditing ? 'Cập nhật đánh giá' : 'Thêm đánh giá'}
          description={
            isEditing
              ? 'Bạn có chắc chắn muốn cập nhật đánh giá này?'
              : 'Bạn có chắc chắn muốn thêm đánh giá này?'
          }
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          onConfirm={handleConfirm}
        />
      </Dialog>
    </>
  )
}

export default ReviewDialog
