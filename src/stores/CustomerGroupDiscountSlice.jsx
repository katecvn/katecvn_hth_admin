import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { toast } from 'sonner'

export const getCustomerGroupDiscounts = createAsyncThunk(
  'customerGroupDiscount/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/customer-group-discount/shows')
      return res.data.data.discounts || []
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const createCustomerGroupDiscount = createAsyncThunk(
  'customerGroupDiscount/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/customer-group-discount/create', data)
      await dispatch(getCustomerGroupDiscounts()).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const updateCustomerGroupDiscount = createAsyncThunk(
  'customerGroupDiscount/update',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      await api.put(`/customer-group-discount/update/${id}`, data)
      await dispatch(getCustomerGroupDiscounts()).unwrap()
      toast.success('Cập nhật thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const deleteCustomerGroupDiscount = createAsyncThunk(
  'customerGroupDiscount/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/customer-group-discount/destroy/${id}`)
      await dispatch(getCustomerGroupDiscounts()).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

const initialState = {
  discounts: [],
  loading: false,
  error: null,
}

const customerGroupDiscountSlice = createSlice({
  name: 'customerGroupDiscount',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCustomerGroupDiscounts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCustomerGroupDiscounts.fulfilled, (state, action) => {
        state.loading = false
        state.discounts = action.payload
      })
      .addCase(getCustomerGroupDiscounts.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload?.message || 'Không thể tải danh sách giảm giá'
        toast.error(state.error)
      })

      .addCase(createCustomerGroupDiscount.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCustomerGroupDiscount.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createCustomerGroupDiscount.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(updateCustomerGroupDiscount.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCustomerGroupDiscount.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateCustomerGroupDiscount.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(deleteCustomerGroupDiscount.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCustomerGroupDiscount.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteCustomerGroupDiscount.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload?.message || 'Không thể xóa giảm giá phân loại khách'
        toast.error(state.error)
      })
  },
})

export default customerGroupDiscountSlice.reducer
