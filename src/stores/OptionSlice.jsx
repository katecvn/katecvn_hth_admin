import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getOption = createAsyncThunk(
  'option',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/product-option/shows')
      const { data } = response.data

      return data.items
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteOption = createAsyncThunk(
  'option/delete',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/product-option/destroy/${data}`)
      await dispatch(getOption()).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createOption = createAsyncThunk(
  'option/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/product-option/create', data)

      await dispatch(getOption()).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      const message = handleError(error)
      // return rejectWithValue(message)
      return rejectWithValue(error)
    }
  },
)

export const updateOption = createAsyncThunk(
  'option/update',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await api.put(`/product-option/update/${id}`, data)
      await dispatch(getOption()).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(error)
      // return rejectWithValue(message)
    }
  },
)

const initialState = {
  option: {},
  options: [],
  loading: false,
  error: null,
}

export const optionSlice = createSlice({
  name: 'option',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createOption.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createOption.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createOption.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getOption.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getOption.fulfilled, (state, action) => {
        state.loading = false
        state.options = action.payload
      })
      .addCase(getOption.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteOption.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteOption.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteOption.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateOption.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateOption.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateOption.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default optionSlice.reducer
