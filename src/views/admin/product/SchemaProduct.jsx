import * as z from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(2, 'Tên sản phẩm tối thiểu 2 ký tự').max(255),
  categoryId: z.string().min(1, 'Chọn danh mục'),
  brandId: z.string().optional().nullable(),
  productGroupId: z.string().optional().nullable(),
  slug: z.string().min(2, 'Đường dẫn tối thiểu 2 ký tự'),
  unit: z.string().max(50).optional(),
  salePrice: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Giá bán phải là số >= 0',
    }),
  originalPrice: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Giá gốc phải là số >= 0',
    }),
  stock: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Tồn kho phải là số >= 0',
  }),
  sku: z.string().min(1, 'Mã sản phẩm không được để trống').max(100),
  seoTitle: z.string().max(150).optional(),
  seoDescription: z.string().max(300).optional(),
  seoKeywords: z.string().max(255).optional(),
  content: z.string().optional(),
  imagesUrl: z
    .array(z.string().url('Phải là đường dẫn ảnh hợp lệ'))
    .min(1, 'Vui lòng thêm ít nhất 1 hình ảnh'),
  optionMappings: z
    .array(
      z.object({
        optionId: z.union([z.string(), z.number()]),
        value: z.string(),
      }),
    )
    .optional(),
  specificationValues: z
    .array(
      z.object({
        specificationId: z.union([z.string(), z.number()]),
        value: z.string().optional(),
      }),
    )
    .optional(),
  syncToBCCU: z.union([z.string(), z.number()]).default('0'),
  isFeatured: z.union([z.string(), z.number()]).default('0'),
  // variants: (validate trong submit, vì dữ liệu động)
})
