import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { ConfirmDialog } from '@/components/ComfirmDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash } from 'lucide-react'
import { createProductSchema } from './SchemaProduct'
import { toSlug } from '@/utils/to-slug'
import MediaModal from '../media/MediaModal'
import TextEditor from '@/components/ui/TextEditor'
import formatNumber from '@/utils/formatNumber'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { IconPhoto, IconPlus, IconTrash } from '@tabler/icons-react'
import { createProduct, updateProduct } from '@/stores/ProductSlice'

const parseNumber = (formattedNumber) => {
  if (!formattedNumber || formattedNumber === '0') return '0'
  return formattedNumber.toString().replace(/[^\d]/g, '')
}

const ProductDialog = ({
  open,
  onOpenChange,
  initialData = null,
  showTrigger = true,
  ...props
}) => {
  const dispatch = useDispatch()
  const [mediaModalOpen, setMediaModalOpen] = useState(false)
  const [openImageModalInContent, setOpenImageModalInContent] = useState(false)
  const [editorContent, setEditorContent] = useState('')
  const loading = useSelector((state) => state.product.loading)
  const categories = useSelector((state) => state.category.categories)
  const brands = useSelector((state) => state.brand.brands)
  const groups = useSelector((state) => state.group.groups)
  const productAttributes = useSelector(
    (state) => state.productAttribute.productAttributes,
  )
  const specifications = useSelector(
    (state) => state.specification.specifications,
  )
  const [confirmOpen, setConfirmOpen] = useState(false)

  const [selectedAttributes, setSelectedAttributes] = useState([]) // [{id, name, values: []}]
  const [selectedValues, setSelectedValues] = useState({}) // { [attrId]: [valueId, ...] }
  const [variants, setVariants] = useState([])
  const [variantDetails, setVariantDetails] = useState({})
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)

  // Danh sách các key (string) của variant sẽ submit (có thể bị xóa bởi user)
  const [variantKeys, setVariantKeys] = useState([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [didUserChangeAttribute, setDidUserChangeAttribute] = useState(false)

  const isEditing = !!initialData
  const form = useForm({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: initialData?.name || '',
      categoryId: initialData?.categoryId?.toString() || '',
      brandId: initialData?.brandId?.toString() || '',
      productGroupId: initialData?.productGroupId?.toString() || '',
      slug: initialData?.slug || '',
      unit: initialData?.unit || '',
      salePrice: initialData?.salePrice || '0',
      originalPrice: initialData?.originalPrice || '0',
      stock: initialData?.stock?.toString() || '0',
      sku: initialData?.sku || '',
      seoTitle: initialData?.seoTitle || '',
      seoDescription: initialData?.seoDescription || '',
      seoKeywords: initialData?.seoKeywords || '',
      content: initialData?.content || '',
      imagesUrl: initialData?.imagesUrl || [],
      optionMappings: initialData?.optionMappings || [
        { optionId: '', value: '' },
      ],
      specificationValues: initialData?.specificationValues || [
        { specificationId: '', value: '' },
      ],
      syncToBCCU: initialData?.syncToBCCU || 0,
      isFeatured: initialData?.isFeatured || 0,
    },
  })

  const toSkuPart = (str) => {
    if (!str) return ''
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/Đ/g, 'D')
      .replace(/đ/g, 'd')
      .replace(/\s+/g, '') // remove spaces
      .toUpperCase()
  }

  const getVariantKey = (variant) => {
    return variant
      .map((v) => v?.value || '')
      .filter(Boolean)
      .join('-')
  }

  useEffect(() => {
    if (isEditing && (!isInitialized || !didUserChangeAttribute)) return

    const valueOptions = selectedAttributes.map((attr) =>
      (selectedValues[attr.id] || [])
        .map((valId) => attr.values.find((v) => v.id === valId))
        .filter(Boolean),
    )

    const combos = cartesian(valueOptions)
    const newVariantKeys = combos.map(getVariantKey)

    setVariants((prev) => {
      const existingKeys = prev.map(getVariantKey)
      const merged = [...prev]
      combos.forEach((combo) => {
        const key = getVariantKey(combo)
        if (!existingKeys.includes(key)) {
          merged.push(combo)
        }
      })
      return merged
    })

    setVariantKeys((prevKeys) => {
      const updatedKeys = [...prevKeys]
      newVariantKeys.forEach((key) => {
        if (!updatedKeys.includes(key)) {
          updatedKeys.push(key)
        }
      })
      return updatedKeys
    })

    setVariantDetails((prev) => {
      const next = { ...prev }
      combos.forEach((combo) => {
        const key = getVariantKey(combo)
        if (!next[key]) {
          next[key] = {
            originalPrice: form.watch('originalPrice') || '0',
            salePrice: form.watch('salePrice') || '0',
            imageUrl: '',
            stock: '0',
            status: 'active',
            position: '0',
          }
        }
      })
      return next
    })
  }, [
    selectedAttributes,
    selectedValues,
    isInitialized,
    isEditing,
    didUserChangeAttribute,
  ])

  const existingVariantKeySet = useMemo(() => {
    if (!initialData?.variants) return new Set()
    return new Set(
      initialData.variants.map((variant) =>
        variant.attributeValues.length
          ? getVariantKey(variant.attributeValues)
          : 'self',
      ),
    )
  }, [initialData])

  useEffect(() => {
    setEditorContent(initialData?.content || '')
  }, [dispatch])

  const handleImageSelect = (imageUrl, key) => {
    if (imageUrl) {
      setVariantDetails((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          imageUrl: imageUrl,
        },
      }))
    }
    setIsMediaModalOpen(false)
  }

  useEffect(() => {
    if (
      initialData &&
      initialData.variants &&
      initialData.variants.length > 0
    ) {
      const attrs = []
      const valuesObj = {}

      initialData.variants.forEach((variant) => {
        variant.attributeValues.forEach((val) => {
          if (!attrs.find((a) => a.id === val.attributeId)) {
            const attr = productAttributes.find((a) => a.id === val.attributeId)
            if (attr) {
              attrs.push(attr)
            }
          }
          if (!valuesObj[val.attributeId]) valuesObj[val.attributeId] = []
          if (!valuesObj[val.attributeId].includes(val.id)) {
            valuesObj[val.attributeId].push(val.id)
          }
        })
      })
      setSelectedAttributes(attrs)
      setSelectedValues(valuesObj)

      // Chuẩn hóa lại variantDetails
      const details = {}
      let selfKey = 'self'
      initialData.variants.forEach((variant) => {
        const key = variant.attributeValues.length
          ? getVariantKey(variant.attributeValues)
          : selfKey
        details[key] = {
          variantId: variant.id || null,
          originalPrice: variant.originalPrice || '0',
          salePrice: variant.salePrice || '0',
          imageUrl: variant.imageUrl || '',
          stock: variant.stock || '0',
          status: variant.status || 'active',
          position: variant.position || '0',
          sku: variant.sku || '',
        }
      })

      setVariantDetails((prev) => ({
        ...details,
        self: prev.self ? { ...prev.self, ...details.self } : details.self,
      }))

      // Cập nhật luôn variantKeys từ initialData
      const variantKeysFromInit = initialData.variants.map((variant) =>
        variant.attributeValues.length
          ? getVariantKey(variant.attributeValues)
          : selfKey,
      )
      setVariants(initialData.variants.map((v) => v.attributeValues))
      setVariantKeys(variantKeysFromInit)
      setIsInitialized(true)
    } else {
      setSelectedAttributes([])
      setSelectedValues({})
      setVariants([])
      setVariantDetails({
        self: {},
      })
      setVariantKeys(['self'])
    }
  }, [initialData, productAttributes])

  useEffect(() => {
    const baseSku = form.watch('sku') || ''
    setVariantDetails((prev) => {
      const next = { ...prev }

      const existingSkus = new Set(
        Object.values(next)
          .map((v) => v && v.sku)
          .filter(Boolean),
      )

      variants.forEach((variant) => {
        const key = getVariantKey(variant)
        if (key === 'self') return
        if (!next[key] || !next[key].sku) {
          const suffix = variant
            .map((v) => toSkuPart(v.value)[0].toUpperCase())
            .join('')
          let candidate = baseSku + suffix
          let index = 1

          while (existingSkus.has(candidate)) {
            candidate = baseSku + suffix + index
            index++
          }
          next[key] = {
            ...next[key],
            sku: candidate,
          }
          existingSkus.add(candidate)
        }
      })

      return next
    })
  }, [form.watch('sku'), variants])

  const watchName = form.watch('name')
  useEffect(() => {
    if (watchName && !initialData) {
      form.setValue('slug', toSlug(watchName))
    }
  }, [watchName, form, initialData])

  const handleMediaSelect = (selectedMedia) => {
    const currentImages = form.getValues('imagesUrl') || []
    form.setValue('imagesUrl', [...currentImages, selectedMedia])

    form.trigger('imagesUrl')
    setMediaModalOpen(false)
  }

  const removeImageUrl = (index) => {
    const urls = form.getValues('imagesUrl') || []
    const newUrls = [...urls]
    newUrls.splice(index, 1)
    form.setValue('imagesUrl', newUrls)
    form.trigger('imagesUrl')
  }

  const onSubmit = async (data) => {
    try {
      let variantDataToSubmit = variants
        .filter((variant) => variantKeys.includes(getVariantKey(variant)))
        .map((variant) => {
          const key = getVariantKey(variant)
          return {
            attributeValues: variant,
            ...variantDetails[key],
          }
        })

      // Nếu self variant (sản phẩm gốc) còn giữ thì submit thêm
      if (variantKeys.includes('self') && variantDetails['self']) {
        variantDataToSubmit = [
          {
            attributeValues: [],
            ...variantDetails['self'],
            sku: variantDetails['self']?.sku || data.sku,
            salePrice: parseInt(
              variantDetails['self']?.salePrice || data.salePrice,
            ),
            originalPrice: parseInt(
              variantDetails['self']?.originalPrice || data.originalPrice,
            ),
            stock: parseInt(variantDetails['self']?.stock || data.stock),
            status: variantDetails['self']?.status || 'active',
            imageUrl: variantDetails['self']?.imageUrl || '',
          },
          ...variantDataToSubmit,
        ]
      }

      const specificationValues = selectedSpecIds
        .map((specId) => {
          const value = data[`spec_${specId}`]
          return value ? { specificationId: specId, value } : null
        })
        .filter(Boolean)

      const payload = {
        ...data,
        variants: variantDataToSubmit,
        categoryId: parseInt(data.categoryId),
        brandId: parseInt(data.brandId),
        productGroupId: parseInt(data.productGroupId)
          ? parseInt(data.productGroupId)
          : null,
        salePrice: parseInt(data.salePrice),
        originalPrice: parseInt(data.originalPrice),
        stock: parseInt(data.stock) || '0',
        syncToBCCU: parseInt(data.syncToBCCU),
        isFeatured: parseInt(data.isFeatured),
        optionMappings: data.optionMappings
          ?.filter((e) => !!e.optionId)
          ?.map((item) => ({
            ...item,
            optionId: item.optionId,
          })),
        specificationValues: specificationValues,
      }

      if (isEditing) {
        await dispatch(
          updateProduct({ id: initialData.id, data: payload }),
        ).unwrap()
      } else {
        await dispatch(createProduct(payload)).unwrap()
      }
      form.reset()
      setEditorContent('')
      onOpenChange?.(false)
    } catch (error) {
      const errorMessage =
        error.response?.data?.messages ||
        error.message ||
        'Có lỗi xảy ra. Vui lòng thử lại.'

      if (typeof errorMessage === 'object') {
        Object.keys(errorMessage).forEach((field) => {
          if (field === 'id') {
            toast.error(errorMessage[field], 'Lỗi')
          } else
            form.setError(field, {
              type: 'server',
              message: errorMessage[field],
            })
        })
      }
    }
  }

  const categoryOptions = categories.map((cat) => ({
    ...cat,
    value: cat.id.toString(),
    label: cat.name,
  }))

  const brandOptions = brands.map((brand) => ({
    ...brand,
    value: brand.id.toString(),
    label: brand.name,
  }))

  const groupOptions = groups.map((group) => ({
    ...group,
    value: group.id.toString(),
    label: group.name,
  }))

  const specificationOptions = specifications.map((attr) => ({
    ...attr,
    value: attr.id.toString(),
    label: attr.name,
  }))

  const [selectedSpecIds, setSelectedSpecIds] = useState([])
  const groupedSpecifications = useMemo(() => {
    return specificationOptions.reduce((acc, spec) => {
      const groupId = spec.group?.id || 'none'
      const groupName = spec.group?.name || 'Khác'
      if (!acc[groupId]) {
        acc[groupId] = { name: groupName, items: [] }
      }
      acc[groupId].items.push(spec)
      return acc
    }, {})
  }, [specificationOptions])

  useEffect(() => {
    if (initialData?.specificationValues) {
      setSelectedSpecIds(
        initialData.specificationValues.map((item) => item.specificationId),
      )
      initialData.specificationValues.forEach((item) => {
        form.setValue(`spec_${item.specificationId}`, item.value)
      })
    }
  }, [initialData, form])

  const [groupOptionMappings, setGroupOptionMappings] = useState([])

  useEffect(() => {
    const groupId = form.watch('productGroupId')
    if (!groupId) {
      setGroupOptionMappings([])
      form.setValue('optionMappings', [])
      return
    }

    const selectedGroup = groups.find((g) => g.id.toString() === groupId)
    if (selectedGroup && selectedGroup.productGroupOptions) {
      const initialMappings = initialData?.optionMappings || []
      const filledMappings = selectedGroup.productGroupOptions.map((opt) => {
        let old = initialMappings.find(
          (x) => String(x.optionId) === String(opt.id),
        )
        return {
          optionId: opt.id,
          optionName: opt.name,
          value: old?.value ?? '',
        }
      })
      setGroupOptionMappings(filledMappings)
      form.setValue(
        'optionMappings',
        filledMappings.map((opt) => ({
          optionId: opt.optionId,
          value: opt.value,
        })),
      )
    } else {
      setGroupOptionMappings([])
      form.setValue('optionMappings', [])
    }
    // eslint-disable-next-line
  }, [form.watch('productGroupId'), groups, initialData])

  const cartesian = (arr) => {
    if (arr.length === 0) return []
    return arr.reduce((a, b) => a.flatMap((x) => b.map((y) => [...x, y])), [[]])
  }

  useEffect(() => {
    const imageFromForm = form.watch('imagesUrl')?.[0]
    setVariantDetails((prev) => {
      if (!prev.self?.imageUrl && imageFromForm) {
        return {
          ...prev,
          self: {
            ...prev.self,
            imageUrl: imageFromForm,
          },
        }
      }
      return prev
    })
  }, [form.watch('imagesUrl')])

  const getTriggerColorClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'hide':
        return 'bg-red-100 text-red-700 border-red-300'
      case 'active_list':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      default:
        return 'bg-green-100 text-green-800 border-green-300'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent
        className="md:h-auto md:max-w-full"
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Chỉnh sửa thông tin sản phẩm bên dưới'
              : 'Điền vào chi tiết phía dưới để thêm sản phẩm mới'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto p-1 md:max-h-[75vh]">
          <Form {...form}>
            <form
              id="product-form"
              onSubmit={async (e) => {
                e.preventDefault()
                const isValid = await form.trigger()
                if (isEditing) {
                  if (isValid) {
                    setConfirmOpen(true)
                  }
                } else {
                  if (isValid) {
                    onSubmit(form.getValues())
                  }
                }
              }}
            >
              <Tabs defaultValue="info" className="w-full">
                <div className="w-full overflow-x-auto">
                  <TabsList
                    className="
                      mb-1
                      flex
                      w-full
                      min-w-max
                      whitespace-nowrap
                      rounded-lg
                      border
                      md:w-52
                    "
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >
                    <TabsTrigger value="info" className="min-w-[120px]">
                      Thông tin cơ bản
                    </TabsTrigger>
                    <TabsTrigger
                      value="specifications"
                      className="min-w-[140px]"
                    >
                      Thông số kỹ thuật
                    </TabsTrigger>
                    <TabsTrigger value="variants" className="min-w-[100px]">
                      Biến thể
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="info" className="min-h-auto space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-4 md:grid-cols-1">
                      <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                          <FormItem className="mb-2 space-y-1">
                            <FormLabel required={true}>Mã sản phẩm</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nhập mã sản phẩm"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e)
                                  form.trigger('sku')
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className=" space-y-1">
                            <FormLabel required={true}>Tên sản phẩm</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nhập tên sản phẩm"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e)
                                  form.trigger('name')
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
                            <FormLabel required={true}>Đường dẫn</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nhập đường dẫn"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e)
                                  form.trigger('slug')
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid gap-4 md:grid-cols-3">
                        <FormField
                          control={form.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel required={true}>Danh mục</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value)
                                  form.trigger('categoryId')
                                }}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn danh mục" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem key={0} value={null}>
                                    Chọn danh mục
                                  </SelectItem>
                                  {categoryOptions.map((category) => (
                                    <SelectItem
                                      key={category.id}
                                      value={category.value}
                                    >
                                      {category.label}
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
                          name="brandId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Thương hiệu</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value)
                                  form.trigger('brandId')
                                }}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn thương hiệu" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem key={0} value={null}>
                                    Chọn thương hiệu
                                  </SelectItem>

                                  {brandOptions.map((brand) => (
                                    <SelectItem
                                      key={brand.id}
                                      value={brand.value}
                                    >
                                      {brand.label}
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
                          name="unit"
                          render={({ field }) => (
                            <FormItem className="mb-2 space-y-1">
                              <FormLabel>Đơn vị</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nhập đơn vị"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e)
                                    form.trigger('unit')
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <FormField
                          control={form.control}
                          name="originalPrice"
                          render={({ field }) => (
                            <FormItem className="mb-2 space-y-1">
                              <FormLabel>Giá gốc</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nhập giá gốc"
                                  {...field}
                                  value={formatNumber(field.value, false)}
                                  onChange={(e) => {
                                    const rawValue = parseNumber(e.target.value)
                                    field.onChange(rawValue)
                                    form.trigger('originalPrice')
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="salePrice"
                          render={({ field }) => (
                            <FormItem className="mb-2 space-y-1">
                              <FormLabel>Giá bán</FormLabel>
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
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="stock"
                          render={({ field }) => (
                            <FormItem className="mb-2 space-y-1">
                              <FormLabel>Số lượng tồn</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nhập số lượng tồn"
                                  {...field}
                                  value={formatNumber(field.value)}
                                  onChange={(e) => {
                                    const rawValue = parseNumber(e.target.value)
                                    field.onChange(rawValue)
                                    form.trigger('stock')
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="productGroupId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nhóm sản phẩm</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value)
                                  form.trigger('productGroupId')
                                }}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn nhóm sản phẩm" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem key={0} value={null}>
                                    Chọn nhóm sản phẩm
                                  </SelectItem>
                                  {groupOptions.map((group) => (
                                    <SelectItem
                                      key={group.id}
                                      value={group.value}
                                    >
                                      {group.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="">
                          <h3 className="text-sm font-medium">
                            Tùy chọn sản phẩm
                          </h3>
                          <div className="mt-2 grid">
                            {groupOptionMappings.length === 0 && (
                              <p className="text-sm text-muted-foreground">
                                Hãy chọn nhóm sản phẩm để hiện các tùy chọn.
                              </p>
                            )}
                            {groupOptionMappings.map((item, index) => (
                              <div
                                key={item.optionId}
                                className="grid grid-cols-3 items-center gap-4"
                              >
                                <FormItem>
                                  <FormLabel>{item.optionName}</FormLabel>
                                </FormItem>
                                <FormField
                                  control={form.control}
                                  name={`optionMappings.${index}.value`}
                                  render={({ field }) => (
                                    <FormItem className="col-span-2 flex-1">
                                      <FormControl>
                                        <Input
                                          placeholder={`Nhập giá trị cho ${item.optionName}`}
                                          {...field}
                                          onChange={(e) => {
                                            field.onChange(e)
                                            form.trigger(
                                              `optionMappings.${index}.value`,
                                            )
                                          }}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="isFeatured"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Sản phẩm nổi bật</FormLabel>
                                <FormDescription>
                                  Hiển thị sản phẩm này ở mục sản phẩm nổi bật
                                </FormDescription>
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
                      </div>

                      <div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="seoTitle"
                            render={({ field }) => (
                              <FormItem className="mb-2 space-y-1">
                                <FormLabel>Tiêu đề SEO</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nhập tiêu đề SEO"
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(e)
                                      form.trigger('seoTitle')
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="seoKeywords"
                            render={({ field }) => (
                              <FormItem className="mb-2 space-y-1">
                                <FormLabel>Từ khóa SEO</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nhập từ khóa SEO"
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(e)
                                      form.trigger('seoKeywords')
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="seoDescription"
                          render={({ field }) => (
                            <FormItem className="mb-2 space-y-1">
                              <FormLabel>Mô tả SEO</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Nhập mô tả SEO"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e)
                                    form.trigger('seoDescription')
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">
                          Hình ảnh sản phẩm{' '}
                          <span className="text-red-500">*</span>
                        </h3>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setMediaModalOpen(true)}
                        >
                          <Plus className="mr-1 h-4 w-4" /> Thêm hình ảnh
                        </Button>
                      </div>
                      {form.watch('imagesUrl')?.length === 0 && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Vui lòng thêm ít nhất một hình ảnh sản phẩm
                        </p>
                      )}
                      <div className="mt-2 grid gap-4">
                        {form?.watch('imagesUrl')?.map((imageUrl, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="flex flex-1 items-center gap-2">
                              <img
                                src={imageUrl}
                                alt="Hình ảnh"
                                className="h-10 w-10 rounded object-cover"
                              />
                              <FormField
                                control={form.control}
                                name={`imagesUrl.${index}`}
                                render={({ field }) => (
                                  <FormItem className="flex-1">
                                    <FormControl>
                                      <Input
                                        placeholder="URL hình ảnh"
                                        {...field}
                                        onChange={(e) => {
                                          field.onChange(e)
                                          form.trigger('imagesUrl')
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              className="text-red-500"
                              onClick={() => {
                                removeImageUrl(index)
                                form.trigger('imagesUrl')
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <FormField
                        control={form.control}
                        name="imagesUrl"
                        render={() => (
                          <FormItem>
                            <FormMessage className="mmt-1 text-red-500" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem className="mt-2">
                            <FormLabel>Bài viết đánh giá</FormLabel>

                            <FormControl>
                              <FormControl>
                                <TextEditor
                                  value={editorContent}
                                  onChange={(html) => {
                                    setEditorContent(html)
                                    field.onChange(html)
                                  }}
                                  name="content"
                                  importCustomInsertImage={true}
                                />
                              </FormControl>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent
                  value="specifications"
                  className="min-h-[67vh] space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Cột trái: chọn thông số kỹ thuật */}
                    <div>
                      <h3 className="mb-2 font-semibold">Chọn thông số</h3>
                      <div className="rounded border">
                        {Object.entries(groupedSpecifications).map(
                          ([groupId, group]) => (
                            <div key={groupId}>
                              <div className="bg-gray-100 px-3 py-2 font-semibold">
                                {group.name}
                              </div>
                              <div className="grid grid-cols-1 gap-1 px-3 py-2">
                                {group.items.map((spec) => (
                                  <label
                                    key={spec.id}
                                    className="flex items-center gap-2"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedSpecIds.includes(
                                        spec.id,
                                      )}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedSpecIds([
                                            ...selectedSpecIds,
                                            spec.id,
                                          ])
                                        } else {
                                          setSelectedSpecIds(
                                            selectedSpecIds.filter(
                                              (id) => id !== spec.id,
                                            ),
                                          )
                                          form.setValue(`spec_${spec.id}`, '')
                                        }
                                      }}
                                    />
                                    <span>{spec.name}</span>
                                    {spec.isRequired && (
                                      <span className="text-red-500">*</span>
                                    )}
                                  </label>
                                ))}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Cột phải: nhập value cho thông số đã chọn, grouped */}
                    <div className="col-span-2">
                      <h3 className="mb-2 font-semibold">Nhập giá trị</h3>
                      <div className="rounded border">
                        {Object.entries(groupedSpecifications).map(
                          ([groupId, group]) => {
                            // Lọc thông số nào đang được chọn
                            const selectedSpecs = group.items.filter((spec) =>
                              selectedSpecIds.includes(spec.id),
                            )
                            if (!selectedSpecs.length) return null
                            return (
                              <div key={groupId}>
                                <div className="bg-gray-100 px-3 py-2 font-semibold">
                                  {group.name}
                                </div>
                                {selectedSpecs.map((spec) => (
                                  <div
                                    key={spec.id}
                                    className="grid grid-cols-2 items-center border-t px-3 py-2"
                                  >
                                    <div className="text-gray-700">
                                      {spec.name}
                                    </div>
                                    <Input
                                      {...form.register(`spec_${spec.id}`)}
                                      placeholder={`Nhập giá trị cho ${spec.name}`}
                                      required={!!spec.isRequired}
                                    />
                                  </div>
                                ))}
                              </div>
                            )
                          },
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                {/* Tab Biến thể */}
                <TabsContent
                  value="variants"
                  className="min-h-[66.5vh] space-y-6"
                >
                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
                    {/* LEFT: Chọn thuộc tính và giá trị */}
                    <div className="">
                      <h3 className="mb-2 font-semibold">
                        Chọn thuộc tính tạo biến thể
                      </h3>
                      <div>
                        <Select
                          value=""
                          onValueChange={(attrId) => {
                            if (
                              !selectedAttributes.find((a) => a.id === attrId)
                            ) {
                              const attr = productAttributes.find(
                                (a) => a.id.toString() === attrId,
                              )
                              setSelectedAttributes([
                                ...selectedAttributes,
                                attr,
                              ])
                              setSelectedValues({
                                ...selectedValues,
                                [attrId]: [],
                              })
                              setDidUserChangeAttribute(true)
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn thuộc tính..." />
                          </SelectTrigger>
                          <SelectContent>
                            {productAttributes
                              .filter(
                                (a) =>
                                  !selectedAttributes.find(
                                    (sa) => sa.id === a.id,
                                  ),
                              )
                              .map((attr) => (
                                <SelectItem
                                  key={attr.id}
                                  value={attr.id.toString()}
                                >
                                  {attr.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedAttributes.length === 0 && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Chưa chọn thuộc tính nào.
                        </p>
                      )}
                      {selectedAttributes.map((attr) => (
                        <div key={attr.id} className="mt-4 rounded border p-2">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="font-medium">{attr.name}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setSelectedAttributes(
                                  selectedAttributes.filter(
                                    (a) => a.id !== attr.id,
                                  ),
                                )
                                const newVals = { ...selectedValues }
                                delete newVals[attr.id]
                                setSelectedValues(newVals)
                                setDidUserChangeAttribute(true)
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {attr.values.map((val) => (
                              <label
                                key={val.id}
                                className="flex items-center gap-1"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedValues[attr.id]?.includes(
                                    val.id,
                                  )}
                                  onChange={(e) => {
                                    let next = selectedValues[attr.id] || []
                                    if (e.target.checked) {
                                      next = [...next, val.id]
                                    } else {
                                      next = next.filter((v) => v !== val.id)
                                    }
                                    setSelectedValues({
                                      ...selectedValues,
                                      [attr.id]: next,
                                    })
                                    setDidUserChangeAttribute(true)
                                  }}
                                />
                                {val.value}
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* RIGHT: Danh sách biến thể */}
                    <div className="col-span-3">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="font-semibold">Danh sách biến thể</h3>
                        <div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="mr-1 h-4 w-4" />
                                Hành động
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="flex items-center"
                                onClick={() => {
                                  // Thêm lại biến thể self nếu chưa có
                                  setVariantKeys((prev) =>
                                    prev.includes('self')
                                      ? prev
                                      : [...prev, 'self'],
                                  )
                                }}
                              >
                                <IconPlus size={14} /> Thêm lại biến thể gốc
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center text-red-600"
                                onClick={() => {
                                  // Xóa tất cả biến thể (có thể giữ lại self)
                                  setVariantKeys(['self'])
                                  setVariants([])
                                  setVariantDetails((prev) => ({
                                    self: prev.self || {
                                      originalPrice:
                                        form.watch('originalPrice') || '0',
                                      salePrice: form.watch('salePrice') || '0',
                                      imageUrl:
                                        form.watch('imagesUrl')?.[0] || '',
                                      stock: form.watch('stock') || '0',
                                      status: 'active',
                                      position: '0',
                                      sku: form.watch('sku') || '',
                                    },
                                  }))
                                }}
                              >
                                <IconTrash size={14} />
                                Xóa tất cả biến thể
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      {variants.length === 0 &&
                      !variantKeys.includes('self') ? (
                        <div className="text-sm text-muted-foreground">
                          Chưa có biến thể nào.
                        </div>
                      ) : (
                        <div className="max-h-[340px] overflow-scroll rounded border">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr>
                                <th className="border bg-gray-50 px-2 py-1 dark:bg-gray-900">
                                  Thuộc tính
                                </th>
                                <th className="border bg-gray-50 px-2 py-1 dark:bg-gray-900">
                                  SKU
                                </th>
                                <th className="border bg-gray-50 px-2 py-1 dark:bg-gray-900">
                                  Giá gốc
                                </th>
                                <th className="border bg-gray-50 px-2 py-1 dark:bg-gray-900">
                                  Giá bán
                                </th>
                                <th className="border bg-gray-50 px-2 py-1 dark:bg-gray-900">
                                  Hình ảnh
                                </th>
                                <th className="border bg-gray-50 px-2 py-1 dark:bg-gray-900">
                                  Tồn kho
                                </th>
                                <th className="border bg-gray-50 px-2 py-1 dark:bg-gray-900">
                                  Vị trí
                                </th>
                                <th className="border bg-gray-50 px-2 py-1 dark:bg-gray-900">
                                  Trạng thái
                                </th>
                                <th className="border bg-gray-50 px-2 py-1 dark:bg-gray-900">
                                  Xóa
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {variants
                                .filter((variant) =>
                                  variantKeys.includes(getVariantKey(variant)),
                                )
                                .map((variant, idx) => {
                                  const key = getVariantKey(variant)
                                  const details = variantDetails[key] || {}
                                  return (
                                    <tr key={key || idx}>
                                      <td className="min-w-24 whitespace-nowrap border">
                                        <div className="inline-flex flex-wrap items-center gap-1">
                                          {variant.map((v, j) => (
                                            <span
                                              key={j}
                                              className="rounded-lg bg-blue-400 px-2 py-1 text-xs"
                                            >
                                              {v.value}
                                            </span>
                                          ))}
                                          {!existingVariantKeySet.has(key) && (
                                            <span className="rounded-lg bg-green-100 px-2 py-1 text-xs text-green-800">
                                              mới
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="border px-2 py-1 ">
                                        <div className="flex items-center justify-center">
                                          <Input
                                            type="text"
                                            value={details.sku || ''}
                                            onChange={(e) =>
                                              setVariantDetails((prev) => ({
                                                ...prev,
                                                [key]: {
                                                  ...prev[key],
                                                  sku: e.target.value,
                                                },
                                              }))
                                            }
                                            className="min-w-20"
                                            placeholder="Mã biến thể"
                                          />
                                        </div>
                                      </td>
                                      <td className="border px-2 py-1">
                                        <Input
                                          type="text"
                                          value={formatNumber(
                                            details.originalPrice,
                                          )}
                                          min={0}
                                          onChange={(e) =>
                                            setVariantDetails((prev) => ({
                                              ...prev,
                                              [key]: {
                                                ...prev[key],
                                                originalPrice: parseNumber(
                                                  e.target.value,
                                                ),
                                              },
                                            }))
                                          }
                                          className="w-24"
                                          placeholder="Giá gốc"
                                        />
                                      </td>
                                      <td className="border px-2 py-1">
                                        <Input
                                          type="text"
                                          value={formatNumber(
                                            details.salePrice,
                                          )}
                                          min={0}
                                          onChange={(e) =>
                                            setVariantDetails((prev) => ({
                                              ...prev,
                                              [key]: {
                                                ...prev[key],
                                                salePrice: parseNumber(
                                                  e.target.value,
                                                ),
                                              },
                                            }))
                                          }
                                          className="w-24"
                                          placeholder="Giá bán"
                                        />
                                      </td>
                                      <td className="border px-2 py-1">
                                        <div className="flex justify-between gap-1">
                                          <Input
                                            type="text"
                                            value={details.imageUrl}
                                            onChange={(e) =>
                                              setVariantDetails((prev) => ({
                                                ...prev,
                                                [key]: {
                                                  ...prev[key],
                                                  imageUrl: e.target.value,
                                                },
                                              }))
                                            }
                                            className="min-w-24"
                                            placeholder="URL ảnh"
                                          />
                                          <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                              setIsMediaModalOpen(key)
                                            }
                                          >
                                            <IconPhoto size={15} />
                                          </Button>
                                        </div>
                                        <div>
                                          {isMediaModalOpen === key && (
                                            <MediaModal
                                              open={isMediaModalOpen === key}
                                              onOpenChange={() =>
                                                setIsMediaModalOpen(false)
                                              }
                                              showTrigger={false}
                                              onSelectImage={(imageUrl) =>
                                                handleImageSelect(imageUrl, key)
                                              }
                                            />
                                          )}
                                        </div>
                                        {details.imageUrl && (
                                          <img
                                            src={details.imageUrl}
                                            alt=""
                                            className="mt-1 h-10 w-10 rounded object-cover"
                                          />
                                        )}
                                      </td>
                                      <td className="border px-2 py-1">
                                        <Input
                                          type="number"
                                          value={details.stock}
                                          min={0}
                                          onChange={(e) =>
                                            setVariantDetails((prev) => ({
                                              ...prev,
                                              [key]: {
                                                ...prev[key],
                                                stock: e.target.value,
                                              },
                                            }))
                                          }
                                          className="w-24"
                                          placeholder="Tồn kho"
                                        />
                                      </td>
                                      <td className="border px-2 py-1">
                                        <Input
                                          type="number"
                                          value={details.position}
                                          min={0}
                                          onChange={(e) =>
                                            setVariantDetails((prev) => ({
                                              ...prev,
                                              [key]: {
                                                ...prev[key],
                                                position: e.target.value,
                                              },
                                            }))
                                          }
                                          className="w-20"
                                          placeholder="Vị trí"
                                        />
                                      </td>
                                      <td className="border px-2 py-1">
                                        <Select
                                          value={details.status || 'active'}
                                          onValueChange={(value) =>
                                            setVariantDetails((prev) => ({
                                              ...prev,
                                              [key]: {
                                                ...prev[key],
                                                status: value,
                                              },
                                            }))
                                          }
                                        >
                                          <SelectTrigger
                                            className={`w-28 ${getTriggerColorClass(
                                              details.status,
                                            )}`}
                                          >
                                            <SelectValue placeholder="Trạng thái" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem
                                              value="active"
                                              className="rounded-md bg-green-100 px-2 text-green-800 hover:bg-green-200"
                                            >
                                              Hoạt động
                                            </SelectItem>
                                            <SelectItem
                                              value="hide"
                                              className="rounded-md bg-red-100 px-2 text-red-700 hover:bg-red-200"
                                            >
                                              Ẩn
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </td>
                                      <td className="border px-2 py-1">
                                        <Button
                                          type="button"
                                          size="icon"
                                          variant="outline"
                                          className="text-red-500"
                                          onClick={() => {
                                            setVariantKeys((prev) =>
                                              prev.filter((k) => k !== key),
                                            )
                                          }}
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </td>
                                    </tr>
                                  )
                                })}
                              {/* SELF VARIANT */}
                              {variantKeys.includes('self') && (
                                <tr>
                                  <td className="border px-2 py-1"></td>
                                  <td className="border px-2 py-1">
                                    <Input
                                      type="text"
                                      value={
                                        variantDetails['self']?.sku ||
                                        form.watch('sku') ||
                                        ''
                                      }
                                      onChange={(e) =>
                                        setVariantDetails((prev) => ({
                                          ...prev,
                                          self: {
                                            ...prev.self,
                                            sku: e.target.value,
                                          },
                                        }))
                                      }
                                      className="min-w-24"
                                      placeholder="Mã biến thể"
                                    />
                                  </td>
                                  <td className="border px-2 py-1">
                                    <Input
                                      type="text"
                                      value={formatNumber(
                                        variantDetails['self']?.originalPrice ||
                                          form.watch('originalPrice'),
                                      )}
                                      onChange={(e) =>
                                        setVariantDetails((prev) => ({
                                          ...prev,
                                          self: {
                                            ...prev.self,
                                            originalPrice: parseNumber(
                                              e.target.value,
                                            ),
                                          },
                                        }))
                                      }
                                      className="w-24"
                                      placeholder="Giá gốc"
                                    />
                                  </td>
                                  <td className="border px-2 py-1">
                                    <Input
                                      type="text"
                                      value={formatNumber(
                                        variantDetails['self']?.salePrice ||
                                          form.watch('salePrice'),
                                      )}
                                      onChange={(e) =>
                                        setVariantDetails((prev) => ({
                                          ...prev,
                                          self: {
                                            ...prev.self,
                                            salePrice: parseNumber(
                                              e.target.value,
                                            ),
                                          },
                                        }))
                                      }
                                      className="w-24"
                                      placeholder="Giá bán"
                                    />
                                  </td>
                                  <td className="border px-2 py-1">
                                    <div className="flex justify-between gap-1">
                                      <Input
                                        type="text"
                                        value={
                                          variantDetails['self']?.imageUrl !==
                                          undefined
                                            ? variantDetails['self']?.imageUrl
                                            : form.watch('imagesUrl')?.[0] || ''
                                        }
                                        onChange={(e) =>
                                          setVariantDetails((prev) => ({
                                            ...prev,
                                            self: {
                                              ...prev.self,
                                              imageUrl: e.target.value,
                                            },
                                          }))
                                        }
                                        className="min-w-24"
                                        placeholder="URL ảnh"
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                          setIsMediaModalOpen('self')
                                        }
                                      >
                                        <IconPhoto size={15} />
                                      </Button>
                                    </div>
                                    <div>
                                      {isMediaModalOpen === 'self' && (
                                        <MediaModal
                                          open={isMediaModalOpen === 'self'}
                                          onOpenChange={() =>
                                            setIsMediaModalOpen(false)
                                          }
                                          showTrigger={false}
                                          onSelectImage={(imageUrl) => {
                                            setVariantDetails((prev) => ({
                                              ...prev,
                                              self: {
                                                ...prev.self,
                                                imageUrl,
                                              },
                                            }))
                                            setIsMediaModalOpen(false)
                                          }}
                                        />
                                      )}
                                    </div>
                                    {(variantDetails['self']?.imageUrl ||
                                      form.watch('imagesUrl')?.[0] ||
                                      '') && (
                                      <img
                                        src={
                                          variantDetails['self']?.imageUrl
                                            ? variantDetails['self'].imageUrl
                                            : form.watch('imagesUrl')?.[0] || ''
                                        }
                                        alt=""
                                        className="mt-1 h-10 w-10 rounded object-cover"
                                      />
                                    )}
                                  </td>
                                  <td className="border px-2 py-1">
                                    <Input
                                      type="number"
                                      value={
                                        variantDetails['self']?.stock ||
                                        form.watch('stock')
                                      }
                                      onChange={(e) =>
                                        setVariantDetails((prev) => ({
                                          ...prev,
                                          self: {
                                            ...prev.self,
                                            stock: e.target.value,
                                          },
                                        }))
                                      }
                                      className="w-24"
                                      placeholder="Tồn kho"
                                    />
                                  </td>
                                  <td className="border px-2 py-1">
                                    <Input
                                      type="number"
                                      value={
                                        variantDetails['self']?.position || '0'
                                      }
                                      onChange={(e) =>
                                        setVariantDetails((prev) => ({
                                          ...prev,
                                          self: {
                                            ...prev.self,
                                            position: e.target.value,
                                          },
                                        }))
                                      }
                                      className="w-20"
                                      placeholder="Vị trí"
                                    />
                                  </td>
                                  <td className="w-28 border px-2 py-1">
                                    <Select
                                      value={
                                        variantDetails['self']?.status ||
                                        'active'
                                      }
                                      onValueChange={(value) =>
                                        setVariantDetails((prev) => ({
                                          ...prev,
                                          self: { ...prev.self, status: value },
                                        }))
                                      }
                                    >
                                      <SelectTrigger
                                        className={getTriggerColorClass(
                                          variantDetails['self']?.status,
                                        )}
                                      >
                                        <SelectValue placeholder="Trạng thái" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="active">
                                          Hoạt động
                                        </SelectItem>
                                        <SelectItem value="hide">Ẩn</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </td>
                                  <td className="border px-2 py-1">
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="outline"
                                      className="text-red-500"
                                      onClick={() => {
                                        setVariantKeys((prev) =>
                                          prev.filter((k) => k !== 'self'),
                                        )
                                      }}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
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
          <Button form="product-form" loading={loading} type="submit">
            {isEditing ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
      {confirmOpen && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          description="Hành động này sẽ thay đổi Thông số kỹ thuật."
          onConfirm={() => onSubmit(form.getValues())}
          loading={loading}
        />
      )}

      <MediaModal
        open={mediaModalOpen || openImageModalInContent}
        onOpenChange={
          openImageModalInContent
            ? setOpenImageModalInContent
            : setMediaModalOpen
        }
        onSelectImage={mediaModalOpen ? handleMediaSelect : false}
        showTrigger={false}
      />
    </Dialog>
  )
}

export default ProductDialog
