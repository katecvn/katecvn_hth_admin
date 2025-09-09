import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getDiscounts = createAsyncThunk(
  'discount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/discount/shows')
      const { data } = response.data

      return data.discounts
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteDiscount = createAsyncThunk(
  'discount/delete',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/discount/destroy/${data}`)
      await dispatch(getDiscounts()).unwrap()
      toast.success('Xóa mã giảm giá thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createDiscount = createAsyncThunk(
  'discount/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/discount/create', data)

      await dispatch(getDiscounts()).unwrap()
      toast.success('Thêm mã giảm giá thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const updateDiscount = createAsyncThunk(
  'discount/update',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await api.put(`/discount/update/${id}`, data)
      await dispatch(getDiscounts()).unwrap()
      toast.success('Cập nhật mã giảm giá thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const updateDiscountStatus = createAsyncThunk(
  'discount/update-status',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, status } = updateData
      await api.put(`/discount/update-status/${id}`, { status })
      await dispatch(getDiscounts()).unwrap()
      toast.success('Cập nhật mã giảm giá thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

const initialState = {
  discount: {},
  discounts: [],
  loading: false,
  error: null,
}

export const discountSlice = createSlice({
  name: 'discount',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createDiscount.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createDiscount.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createDiscount.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getDiscounts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getDiscounts.fulfilled, (state, action) => {
        state.loading = false
        state.discounts = action.payload
      })
      .addCase(getDiscounts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteDiscount.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteDiscount.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteDiscount.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateDiscount.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateDiscount.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateDiscount.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateDiscountStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateDiscountStatus.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateDiscountStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default discountSlice.reducer
