import { z } from 'zod'

export const specificationSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên thông số'),
  groupId: z.string().min(1, 'Vui lòng chọn nhóm'),
  isRequired: z.enum(['0', '1'], {
    required_error: 'Vui lòng chọn trạng thái bắt buộc',
  }),
})
