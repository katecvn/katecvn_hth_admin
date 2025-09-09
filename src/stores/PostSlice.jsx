import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getPost = createAsyncThunk(
  'post',
  async (params = {}, { rejectWithValue }) => {

    try {
      const response = await api.get('/post/shows', { params: {
        ...params,
        page: params.page + 1,
        limit: params.limit
      } })

      const { data } = response.data

      return {
        posts: data.posts,
        total: data.totalItems,
        page: data.page,
        limit: data.limit
      }
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getPostById = createAsyncThunk(
  'post/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/post/${id}`)
      const { data } = response.data

      return data
    } catch (error) {
      const message = handleError(error)
      toast.error('Không thể tải chi tiết bài viết')
      return rejectWithValue(message)
    }
  },
)

export const deletePost = createAsyncThunk(
  'post/delete',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/post/destroy/${data}`)
      await dispatch(getPost()).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      const message = handleError(error)
      toast.error(error?.response?.data?.messages?.id || 'Đã có lỗi xảy ra')

    }
  },
)

export const createPost = createAsyncThunk(
  'post/create',
  async (createData, { rejectWithValue, dispatch }) => {
    try {
      const { data, page, limit } = createData

      await api.post('/post/create', data)

      await dispatch(getPost({ page, limit })).unwrap()

      toast.success('Thêm mới thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(error)
    }
  },
)

export const updatePost = createAsyncThunk(
  'post/update',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data, page, limit } = updateData
      await api.put(`/post/update/${id}`, data)
      await dispatch(getPost({ page, limit })).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const updatePostStatus = createAsyncThunk(
  'contact/updatePostStatus',
  async ({ id, status }, { rejectWithValue, dispatch, getState }) => {
    try {
      await api.put(`/post/update-status/${id}`, {
        status,
      })
      // Update the post status in the state directly
      const state = getState()

      const updatedPosts = state.post.posts.map(post => 
        post.id === id ? { ...post, status } : post
      )

      toast.success('Cập nhật trạng thái thành công')

      return { posts: updatedPosts }
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

const initialState = {
  post: null,
  posts: [],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,
  error: null,
}

export const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createPost.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createPost.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getPost.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPost.fulfilled, (state, action) => {
        state.loading = false
        state.posts = action.payload.posts
        state.total = action.payload.total
        state.page = action.payload.page
        state.limit = action.payload.limit
      })
      .addCase(getPost.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getPostById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPostById.fulfilled, (state, action) => {
        state.loading = false
        state.post = action.payload
      })
      .addCase(getPostById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
      })
      .addCase(deletePost.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deletePost.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updatePost.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updatePost.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updatePostStatus.pending, (state) => {
        state.loadingStatus = true
        state.error = null
      })
      .addCase(updatePostStatus.fulfilled, (state, action) => {
        state.loadingStatus = false
        state.posts = action.payload.posts
      })
      .addCase(updatePostStatus.rejected, (state, action) => {
        state.loadingStatus = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default postSlice.reducer
