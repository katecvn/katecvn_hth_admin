import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getProductsByCustomerGroup = createAsyncThunk(
  'customerProductDiscount/getProductsByCustomerGroup',
  async ({ customerGroupId, keyword = '' }, { rejectWithValue }) => {
    try {
      const response = await api.get('/customer-product-discount/products', {
        params: { customerGroupId, keyword },
      })
      const { data } = response.data
      return data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const createCustomerProductDiscount = createAsyncThunk(
  'customerProductDiscount/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/customer-product-discount/create', data)
      await dispatch(
        getProductsByCustomerGroup({ customerGroupId: data.customerGroupId }),
      )
      toast.success('Thêm giảm giá thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const updateCustomerProductDiscount = createAsyncThunk(
  'customerProductDiscount/update',
  async ({ id, data, customerGroupId }, { rejectWithValue, dispatch }) => {
    try {
      await api.put(`/customer-product-discount/update/${id}`, data)
      await dispatch(getProductsByCustomerGroup({ customerGroupId }))
      toast.success('Cập nhật giảm giá thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const deleteCustomerProductDiscount = createAsyncThunk(
  'customerProductDiscount/delete',
  async ({ productId, customerGroupId }, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/customer-product-discount/destroy`, {
        data: { productId, customerGroupId },
      })
      await dispatch(getProductsByCustomerGroup({ customerGroupId }))
      toast.success('Xóa giảm giá thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const bulkUpdateCustomerProductDiscount = createAsyncThunk(
  'customerProductDiscount/bulkUpdate',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/customer-product-discount/bulk-update', data)
      await dispatch(
        getProductsByCustomerGroup({ customerGroupId: data.customerGroupId }),
      )
      toast.success('Cập nhật giảm giá hàng loạt thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

const initialState = {
  products: [],
  pagination: {
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
  },
  loading: false,
  error: null,
}

export const customerProductDiscountSlice = createSlice({
  name: 'customerProductDiscount',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProductsByCustomerGroup.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getProductsByCustomerGroup.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload.products || []
        state.pagination = {
          totalItems: action.payload.totalItems,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
        }
      })
      .addCase(getProductsByCustomerGroup.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload?.message ||
          'Không thể tải sản phẩm theo nhóm khách hàng'
        toast.error(state.error)
      })
      .addCase(createCustomerProductDiscount.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCustomerProductDiscount.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createCustomerProductDiscount.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateCustomerProductDiscount.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCustomerProductDiscount.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateCustomerProductDiscount.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(deleteCustomerProductDiscount.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCustomerProductDiscount.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteCustomerProductDiscount.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Không thể xóa giảm giá'
        toast.error(state.error)
      })
      .addCase(bulkUpdateCustomerProductDiscount.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(bulkUpdateCustomerProductDiscount.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(bulkUpdateCustomerProductDiscount.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export default customerProductDiscountSlice.reducer
