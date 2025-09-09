import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getProductAttributes = createAsyncThunk(
  'product-attribute/shows',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/attribute/shows')
      const { data } = response.data

      return data.attributes
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getProductAttribute = createAsyncThunk(
  'product-attribute/show',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/attribute/show/${id}`)
      const { data } = response.data

      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteProductAttribute = createAsyncThunk(
  'product-attribute/destroy',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/attribute/destroy/${id}`)
      await dispatch(getProductAttributes()).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createProductAttribute = createAsyncThunk(
  'product-attribute/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/attribute/create', data)

      await dispatch(getProductAttributes()).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const updateProductAttribute = createAsyncThunk(
  'product-attribute/update',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await api.put(`/attribute/update/${id}`, data)
      await dispatch(getProductAttributes()).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

const initialState = {
  productAttribute: {},
  productAttributes: [],
  loading: false,
  error: null,
}

export const productAttributeSlice = createSlice({
  name: 'productAttribute',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createProductAttribute.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createProductAttribute.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createProductAttribute.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getProductAttributes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getProductAttributes.fulfilled, (state, action) => {
        state.loading = false
        state.productAttributes = action.payload
      })
      .addCase(getProductAttributes.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getProductAttribute.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getProductAttribute.fulfilled, (state, action) => {
        state.loading = false
        state.productAttribute = action.payload
      })
      .addCase(getProductAttribute.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteProductAttribute.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteProductAttribute.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteProductAttribute.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProductAttribute.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProductAttribute.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateProductAttribute.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default productAttributeSlice.reducer
