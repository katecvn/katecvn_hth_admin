import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getNavigation = createAsyncThunk(
  'navigation',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/navigation/shows')
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteNavigation = createAsyncThunk(
  'navigation/delete',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/navigation/destroy/${data}`)
      await dispatch(getNavigation()).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createNavigation = createAsyncThunk(
  'navigation/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/navigation/create', data)

      await dispatch(getNavigation()).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      const message = handleError(error)
      // return rejectWithValue(message)
      return rejectWithValue(error)
    }
  },
)

export const updateNavigation = createAsyncThunk(
  'navigation/update',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await api.put(`/navigation/update/${id}`, data)
      await dispatch(getNavigation()).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(error)
    }
  },
)

const initialState = {
  navigation: {},
  navigations: [],
  loading: false,
  error: null,
}

export const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createNavigation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createNavigation.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createNavigation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getNavigation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getNavigation.fulfilled, (state, action) => {
        state.loading = false
        state.navigations = action.payload
      })
      .addCase(getNavigation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteNavigation.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteNavigation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteNavigation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateNavigation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateNavigation.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateNavigation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default navigationSlice.reducer
