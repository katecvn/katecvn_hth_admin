import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getBrand = createAsyncThunk(
  'brand',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/brand/shows')
      const { data } = response.data
      return data.brands
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteBrand = createAsyncThunk(
  'brand/delete',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/brand/destroy/${data}`)
      await dispatch(getBrand()).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createBrand = createAsyncThunk(
  'brand/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/brand/create', data)

      await dispatch(getBrand()).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateBrand = createAsyncThunk(
  'brand/update',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await api.put(`/brand/update/${id}`, data)
      await dispatch(getBrand()).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  brand: {},
  brands: [],
  loading: false,
  error: null,
}

export const brandSlice = createSlice({
  name: 'brand',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createBrand.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createBrand.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createBrand.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getBrand.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getBrand.fulfilled, (state, action) => {
        state.loading = false
        state.brands = action.payload
      })
      .addCase(getBrand.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteBrand.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteBrand.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteBrand.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateBrand.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateBrand.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateBrand.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default brandSlice.reducer
