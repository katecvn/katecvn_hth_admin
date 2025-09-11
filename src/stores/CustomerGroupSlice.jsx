import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getCustomerGroup = createAsyncThunk(
  'customerGroup/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/customer-group/shows')
      const { data } = response.data
      return data.groups
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const getCustomerGroupWithoutDiscount = createAsyncThunk(
  'customerGroup/getWithoutDiscount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/customer-group/shows-without-discount')
      const { data } = response.data
      return data.groups
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const deleteCustomerGroup = createAsyncThunk(
  'customerGroup/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/customer-group/destroy/${id}`)
      await dispatch(getCustomerGroup()).unwrap()
      toast.success('Xóa phân loại khách hàng thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const createCustomerGroup = createAsyncThunk(
  'customerGroup/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/customer-group/create', data)
      await dispatch(getCustomerGroup()).unwrap()
      toast.success('Thêm phân loại khách hàng thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const updateCustomerGroup = createAsyncThunk(
  'customerGroup/update',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await api.put(`/customer-group/update/${id}`, data)
      await dispatch(getCustomerGroup()).unwrap()
      toast.success('Cập nhật phân loại khách hàng thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

const initialState = {
  customerGroup: {},
  customerGroups: [],
  customerGroupsWithoutDiscount: [],
  loading: false,
  error: null,
}

export const customerGroupSlice = createSlice({
  name: 'customerGroup',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createCustomerGroup.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCustomerGroup.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createCustomerGroup.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(getCustomerGroup.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCustomerGroup.fulfilled, (state, action) => {
        state.loading = false
        state.customerGroups = action.payload
      })
      .addCase(getCustomerGroup.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload?.message ||
          'Không thể tải danh sách phân loại khách hàng'
        toast.error(state.error)
      })

      .addCase(getCustomerGroupWithoutDiscount.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCustomerGroupWithoutDiscount.fulfilled, (state, action) => {
        state.loading = false
        state.customerGroupsWithoutDiscount = action.payload
      })
      .addCase(getCustomerGroupWithoutDiscount.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload?.message ||
          'Không thể tải danh sách phân loại khách hàng chưa có giảm giá'
        toast.error(state.error)
      })

      .addCase(deleteCustomerGroup.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCustomerGroup.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteCustomerGroup.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload?.message || 'Không thể xóa phân loại khách hàng'
        toast.error(state.error)
      })

      .addCase(updateCustomerGroup.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCustomerGroup.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateCustomerGroup.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export default customerGroupSlice.reducer
