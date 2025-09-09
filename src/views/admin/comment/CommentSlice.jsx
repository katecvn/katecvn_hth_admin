import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getComments = createAsyncThunk(
  'comment',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/comment/post/shows')
      const { data } = response.data

      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getCommentById = createAsyncThunk(
  'comment/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/comment/${id}`)
      const { data } = response.data

      return data
    } catch (error) {
      const message = handleError(error)
      toast.error('Không thể tải chi tiết bình luận')
      return rejectWithValue(message)
    }
  },
)

export const deleteComment = createAsyncThunk(
  'comment/delete',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/comment/destroy/${data}`)
      await dispatch(getComments()).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      const message = handleError(error)
      toast.error(error?.response?.data?.messages?.id || 'Đã có lỗi xảy ra')
      return rejectWithValue(error)
    }
  },
)

export const createComment = createAsyncThunk(
  'comment/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/comment/post/create', data)
      await dispatch(getComments()).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const updateComment = createAsyncThunk(
  'comment/update',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await api.put(`/comment/update/${id}`, data)
      await dispatch(getComments()).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const updateCommentStatus = createAsyncThunk(
  'comment/updateStatus',
  async ({ id, status }, { rejectWithValue, dispatch }) => {
    try {
      await api.put(`/comment/post/update-status/${id}`, {
        status,
      })
      await dispatch(getComments()).unwrap()
      toast.success('Cập nhật trạng thái thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

const initialState = {
  comment: {},
  comments: [],
  loading: false,
  error: null,
}

export const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createComment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createComment.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createComment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getComments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getComments.fulfilled, (state, action) => {
        state.loading = false
        state.comments = action.payload
      })
      .addCase(getComments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getCommentById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCommentById.fulfilled, (state, action) => {
        state.loading = false
        state.comment = action.payload
      })
      .addCase(getCommentById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
      })
      .addCase(deleteComment.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteComment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateComment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateComment.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateCommentStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCommentStatus.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateCommentStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default commentSlice.reducer 