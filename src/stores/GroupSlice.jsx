import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getGroup = createAsyncThunk(
  'group',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/product-group/shows')
      const { data } = response.data

      return data.items
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteGroup = createAsyncThunk(
  'group/delete',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/product-group/destroy/${data}`)
      await dispatch(getGroup()).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createGroup = createAsyncThunk(
  'group/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/product-group/create', data)

      await dispatch(getGroup()).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      const message = handleError(error)
      // return rejectWithValue(message)
      return rejectWithValue(error)
    }
  },
)

export const updateGroup = createAsyncThunk(
  'group/update',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await api.put(`/product-group/update/${id}`, data)
      await dispatch(getGroup()).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(error)
      // return rejectWithValue(message)
    }
  },
)

const initialState = {
  group: {},
  groups: [],
  loading: false,
  error: null,
}

export const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createGroup.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createGroup.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getGroup.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getGroup.fulfilled, (state, action) => {
        state.loading = false
        state.groups = action.payload
      })
      .addCase(getGroup.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteGroup.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteGroup.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateGroup.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateGroup.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default groupSlice.reducer
