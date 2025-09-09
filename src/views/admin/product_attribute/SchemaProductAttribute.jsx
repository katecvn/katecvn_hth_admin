import { z } from 'zod'

export const attributeSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên thuộc tính'),
  code: z.string().min(1, 'Vui lòng nhập mã thuộc tính'),
  level: z.coerce.number().int().min(0, 'Level không hợp lệ'),
  inputType: z.string().optional(),
  valueType: z.string().optional(),
  unit: z.string().optional(),
  values: z
    .array(
      z.object({
        value: z.string().min(1, 'Giá trị không được để trống'),
      }),
    )
    .min(1, 'Nhập ít nhất 1 giá trị'),
})
