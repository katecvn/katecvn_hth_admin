import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getProducts = createAsyncThunk(
  'product/shows',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/product/shows')
      const { data } = response.data

      return data.products
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getProduct = createAsyncThunk(
  'product/show',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/product/show/${id}`)
      const { data } = response.data

      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createProduct = createAsyncThunk(
  'product/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/product/create', data)

      await dispatch(getProducts()).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const updateProductStatus = createAsyncThunk(
  'product/update-status',
  async (data, { rejectWithValue, dispatch }) => {
    const { id, status } = data

    try {
      await api.put(`/product/update-status/${id}`, { status })

      await dispatch(getProducts()).unwrap()
      toast.success('Cập nhật trạng thái thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const updateProduct = createAsyncThunk(
  'product/update',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      await api.put(`/product/update/${id}`, data)

      await dispatch(getProducts()).unwrap()
      toast.success('Cập nhật thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const deleteProduct = createAsyncThunk(
  'product/destroy',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/product/destroy/${id}`)

      await dispatch(getProducts()).unwrap()
      toast.success('Cập nhật thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const sendProductToBCCU = createAsyncThunk(
  'product/send-to-bccu',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.get(`/product/send-bccu/${id}`)

      await dispatch(getProducts()).unwrap()
      toast.success('Gửi thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

const initialState = {
  product: {},
  products: [],
  loading: false,
  error: null,
}

export const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getProduct.fulfilled, (state, action) => {
        state.loading = false
        state.product = action.payload
      })
      .addCase(getProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateProductStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProductStatus.fulfilled, (state, action) => {
        state.loading = false
      })
      .addCase(updateProductStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(sendProductToBCCU.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(sendProductToBCCU.fulfilled, (state, action) => {
        state.loading = false
      })
      .addCase(sendProductToBCCU.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default productSlice.reducer
