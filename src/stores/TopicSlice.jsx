import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getTopic = createAsyncThunk(
  'topic',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/topic/shows')
      const { data } = response.data

      return data.topics
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteTopic = createAsyncThunk(
  'topic/delete',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/topic/destroy/${data}`)
      await dispatch(getTopic()).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createTopic = createAsyncThunk(
  'topic/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/topic/create', data)

      await dispatch(getTopic()).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      // const message = handleError(error)
      return rejectWithValue(error)
      // return rejectWithValue(message)
    }
  },
)

export const updateTopic = createAsyncThunk(
  'topic/update',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await api.put(`/topic/update/${id}`, data)
      await dispatch(getTopic()).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      // const message = handleError(error)
      // toast.err('Cập nhật dữ liệu thành công')

      return rejectWithValue(error)
      // return rejectWithValue(message)
    }
  },
)

const initialState = {
  topic: {},
  topics: [],
  loading: false,
  error: null,
}

export const topicSlice = createSlice({
  name: 'topic',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createTopic.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createTopic.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createTopic.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getTopic.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getTopic.fulfilled, (state, action) => {
        state.loading = false
        state.topics = action.payload
      })
      .addCase(getTopic.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteTopic.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteTopic.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteTopic.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTopic.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTopic.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateTopic.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default topicSlice.reducer
