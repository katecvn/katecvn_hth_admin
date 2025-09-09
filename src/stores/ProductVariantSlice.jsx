import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getProductVariants = createAsyncThunk(
  'product/variant/shows',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/product/variant/shows')
      const { data } = response.data

      return data.variants
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getProductVariant = createAsyncThunk(
  'product/variant/show',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/product/variant/show/${id}`)
      const { data } = response.data

      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createProductVariant = createAsyncThunk(
  'product/variant/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/product/variant/create', data)

      await dispatch(getProductVariants()).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const updateProductVariantStatus = createAsyncThunk(
  'product/variant/update-status',
  async (data, { rejectWithValue, dispatch }) => {
    const { id, status } = data

    try {
      await api.put(`/product/variant/update-status/${id}`, { status })

      await dispatch(getProductVariants()).unwrap()
      toast.success('Cập nhật trạng thái thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const updateProductVariant = createAsyncThunk(
  'product/variant/update',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      await api.put(`/product/variant/update/${id}`, data)

      await dispatch(getProductVariants()).unwrap()
      toast.success('Cập nhật thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const deleteProductVariant = createAsyncThunk(
  'product/variant/destroy',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/product/variant/destroy/${id}`)

      await dispatch(getProductVariants()).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const sendProductVariantToBCCU = createAsyncThunk(
  'product/variant/send-to-bccu',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.get(`/product/variant/send-bccu/${id}`)

      await dispatch(getProductVariants()).unwrap()
      toast.success('Gửi thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

const initialState = {
  productVariant: {},
  productVariants: [],
  loading: false,
  error: null,
}

export const productVariantSlice = createSlice({
  name: 'productVariant',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createProductVariant.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createProductVariant.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createProductVariant.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getProductVariants.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getProductVariants.fulfilled, (state, action) => {
        state.loading = false
        state.productVariants = action.payload
      })
      .addCase(getProductVariants.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getProductVariant.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getProductVariant.fulfilled, (state, action) => {
        state.loading = false
        state.productVariant = action.payload
      })
      .addCase(getProductVariant.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateProductVariantStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProductVariantStatus.fulfilled, (state, action) => {
        state.loading = false
      })
      .addCase(updateProductVariantStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateProductVariant.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProductVariant.fulfilled, (state, action) => {
        state.loading = false
      })
      .addCase(updateProductVariant.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteProductVariant.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteProductVariant.fulfilled, (state, action) => {
        state.loading = false
      })
      .addCase(deleteProductVariant.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(sendProductVariantToBCCU.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(sendProductVariantToBCCU.fulfilled, (state, action) => {
        state.loading = false
      })
      .addCase(sendProductVariantToBCCU.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default productVariantSlice.reducer
