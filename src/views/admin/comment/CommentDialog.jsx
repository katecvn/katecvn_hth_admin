import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createComment, updateComment } from '@/views/admin/comment/CommentSlice'

const defaultValues = {
  ableId: '',
  parentId: null,
  replyTo: null,
  content: '',
}

const CommentDialog = ({ open, onOpenChange, initialData = null, replyToComment = null }) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.comment.loading)
  const loggedInUser = useSelector((state) => state.auth.user) || {}
  const [formValues, setFormValues] = useState(() => {
    if (replyToComment) {
      return {
        ableId: replyToComment.postId || replyToComment.ableId || '',
        parentId: replyToComment.id || null,
        replyTo: replyToComment.userId || (replyToComment.user ? replyToComment.user.id : null),
        content: '',
      }
    }
    return initialData || defaultValues
  })

  const form = useForm({
    defaultValues: formValues,
  })

  const onSubmit = async (data) => {
    try {
      if (!data.content || data.content.length < 10) {
        toast.error('Nội dung bình luận cần ít nhất 10 ký tự')
        return
      }
      
      if (!data.ableId) {
        toast.error('Bài viết không được để trống')
        return
      }

      if (initialData) {
        await dispatch(
          updateComment({
            id: initialData.id,
            data,
          }),
        ).unwrap()
      } else {
        await dispatch(createComment(data)).unwrap()
      }
      onOpenChange(false)
      form.reset(defaultValues)
    } catch (error) {
      const errorMessages = error?.response?.data?.messages
      if (errorMessages) {
        Object.keys(errorMessages).forEach((key) => {
          form.setError(key, {
            type: 'manual',
            message: errorMessages[key],
          })
        })
      } else {
        toast.error('Đã có lỗi xảy ra')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData 
              ? 'Cập nhật bình luận' 
              : replyToComment 
                ? 'Trả lời bình luận' 
                : 'Thêm bình luận mới'}
          </DialogTitle>
          <DialogDescription>
            {replyToComment 
              ? `Đang trả lời cho bình luận: "${replyToComment.content?.substring(0, 50)}${replyToComment.content?.length > 50 ? '...' : ''}"` 
              : 'Nhập thông tin bình luận vào form bên dưới'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập nội dung bình luận (ít nhất 10 ký tự)"
                      className="resize-none h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!replyToComment && (
              <FormField
                control={form.control}
                name="ableId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Bài viết</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập ID bài viết" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {initialData ? 'Cập nhật' : replyToComment ? 'Trả lời' : 'Tạo mới'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default CommentDialog 