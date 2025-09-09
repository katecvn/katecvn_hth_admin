import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updatePageSection, createPageSection } from '@/stores/PageSlice'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { PlusCircle, Trash2 } from 'lucide-react'

const InfoCompanyDialog = ({ open, onOpenChange, pageId, footerData, id }) => {
  const dispatch = useDispatch()
  const initialItems = footerData || [
    { title: '', value: '', key: '', url: '' },
  ]

  const [footerItems, setFooterItems] = useState(initialItems)

  const form = useForm({
    defaultValues: {
      footerItems: initialItems?.map((item) => ({
        title: item.title,
        value: item.value,
        key: item.key || '',
        url: item.url || '',
      })),
    },
  })

  // Update form values when footerData changes
  useEffect(() => {
    if (footerData?.content) {
      setFooterItems(footerData?.content)
      form.reset({
        footerItems: footerData?.content?.map((item) => ({
          title: item.title,
          value: item.value,
          key: item.value || '',
          url: item.url || '',
        })),
      })
    }
  }, [footerData, form])

  const handleAddItem = () => {
    const newItems = [
      ...form.watch()?.footerItems,
      { title: '', value: '', key: '', url: '' },
    ]

    setFooterItems(newItems)
    form.setValue('footerItems', newItems)
  }

  const handleRemoveItem = (index) => {
    const updatedItems = [...footerItems]
    updatedItems.splice(index, 1)
    setFooterItems(updatedItems)
    form.setValue('footerItems', updatedItems)
  }

  const onSubmit = async (data) => {
    const filteredItems = data.footerItems?.filter(
      (item) => item.title.trim() !== '' || item.value.trim() !== '',
    )

    try {
      if (footerData) {
        let dataUpdate = {
          pageId: pageId,
          sectionType: pageId == 8 ? 'lien-he' : 'infoCompany',
          content: filteredItems,
          position: 1,
        }
        await dispatch(
          updatePageSection({
            dataUpdate: dataUpdate,
            sectionId: id,
            pageId: pageId,
          }),
        ).unwrap()
      } else {
        await dispatch(
          createPageSection({
            pageId,
            sectionType: pageId == 8 ? 'lien-he' : 'infoCompany',

            content: filteredItems,
            position: 1,
          }),
        ).unwrap()
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving footer:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:h-auto md:max-w-6xl">
        <DialogHeader>
          <DialogTitle>
            {footerData ? 'Chỉnh sửa thông' : 'Thêm thông tin'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="max-h-[65vh]  overflow-auto p-1 md:max-h-[75vh]"
          >
            {footerItems.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 items-center gap-2  space-y-2"
              >
                <div className="col-span-12 mt-2 md:col-span-2">
                  <FormField
                    control={form.control}
                    name={`footerItems.${index}.key`}
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel>Key</FormLabel>
                        <FormControl>
                          <Input placeholder="key" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-12 md:col-span-3">
                  <FormField
                    control={form.control}
                    name={`footerItems.${index}.title`}
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel>Tiêu đề</FormLabel>
                        <FormControl>
                          <Input placeholder="Tiêu đề" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <FormField
                    control={form.control}
                    name={`footerItems.${index}.value`}
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel>
                          Giá trị
                          {/* {form.getValues(`footerItems.${index}.title`) ||
                            'Nội dung'} */}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Nội dung" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-12 md:col-span-2">
                  <FormField
                    control={form.control}
                    name={`footerItems.${index}.url`}
                    render={({ field }) => (
                      <FormItem className="mb-2 space-y-1">
                        <FormLabel>Link</FormLabel>
                        <FormControl>
                          <Input placeholder="Nội dung" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-1 flex items-end justify-center pb-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddItem}
                className="flex items-center"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Thêm thông tin
              </Button>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit">{footerData ? 'Cập nhật' : 'Lưu'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default InfoCompanyDialog
