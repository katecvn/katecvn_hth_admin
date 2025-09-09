import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getSpecifications = createAsyncThunk(
  'specification/shows',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/specification/shows')
      const { data } = response.data

      return data.specifications
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getSpecification = createAsyncThunk(
  'specification/show',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/specification/show/${id}`)
      const { data } = response.data

      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteSpecification = createAsyncThunk(
  'specification/destroy',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/specification/destroy/${id}`)
      await dispatch(getSpecifications()).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createSpecification = createAsyncThunk(
  'specification/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/specification/create', data)

      await dispatch(getSpecifications()).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const updateSpecification = createAsyncThunk(
  'specification/update',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await api.put(`/specification/update/${id}`, data)
      await dispatch(getSpecifications()).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

const initialState = {
  specification: {},
  specifications: [],
  loading: false,
  error: null,
}

export const specificationSlice = createSlice({
  name: 'specification',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createSpecification.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSpecification.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createSpecification.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getSpecifications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getSpecifications.fulfilled, (state, action) => {
        state.loading = false
        state.specifications = action.payload
      })
      .addCase(getSpecifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getSpecification.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getSpecification.fulfilled, (state, action) => {
        state.loading = false
        state.specification = action.payload
      })
      .addCase(getSpecification.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteSpecification.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteSpecification.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteSpecification.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSpecification.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSpecification.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateSpecification.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default specificationSlice.reducer
