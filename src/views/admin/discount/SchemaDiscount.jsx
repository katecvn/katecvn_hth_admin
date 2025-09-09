import { z } from 'zod'

// Helper function to validate formatted numbers
const validateFormattedNumber = (val) => {
  if (val === undefined || val === null || val === '') return false
  
  // If it's already a number
  if (typeof val === 'number') return val > 0
  
  // If it's a string
  const digitsOnly = val.toString().replace(/\D/g, '')
  return !isNaN(digitsOnly) && Number(digitsOnly) > 0
}

const validateUsageLimit = (val) => {
  if (val === undefined || val === null || val === '') return false
  
  // If it's already a number
  if (typeof val === 'number') return val >= 1
  
  // If it's a string
  const digitsOnly = val.toString().replace(/\D/g, '')
  return !isNaN(digitsOnly) && Number(digitsOnly) >= 1
}

// Helper function to validate dates
const validateDate = (val) => {
  if (!val) return false
  
  // Check for YYYY-MM-DD format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false
  
  // Check if it's a valid date
  const date = new Date(val)
  return !isNaN(date.getTime())
}

const createDiscountSchema = z.object({
  code: z.string().min(1, { message: 'Không được để trống' }),
  type: z.enum(['percentage', 'fixed', 'free_shipping', 'buy_x_get_y'], { message: 'Không được để trống. Chỉ cho phép các giá trị: percentage, fixed, free_shipping, buy_x_get_y' }),
  value: z.union([z.string(), z.number()]).refine(validateFormattedNumber, { message: 'Phải là số dương.' }),
  minOrderAmount: z.union([z.string(), z.number()]).refine(validateFormattedNumber, { message: 'Phải là số dương.' }),
  maxDiscount: z.union([z.string(), z.number()]).refine(validateFormattedNumber, { message: 'Phải là số dương.' }),
  startDate: z.string().refine(validateDate, { message: 'Định dạng: Phải là kiểu ngày hợp lệ (YYYY-MM-DD)' }),
  endDate: z.string().refine(validateDate, { message: 'Định dạng: Phải là kiểu ngày hợp lệ (YYYY-MM-DD)' }),
  usageLimit: z.union([z.string(), z.number()]).refine(validateUsageLimit, { message: 'Phải là kiểu số nguyên lớn hơn hoặc bằng 1' }),
  productIds: z.array(z.number()).optional().default([]),
})

const updateDiscountSchema = createDiscountSchema

export { createDiscountSchema, updateDiscountSchema } 