import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getReviews = createAsyncThunk(
  'review',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/review/product/shows')
      const { data } = response.data

      return data.reviews || []
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getReviewById = createAsyncThunk(
  'review/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/review/${id}`)
      const { data } = response.data

      return data
    } catch (error) {
      const message = handleError(error)
      toast.error('Không thể tải chi tiết đánh giá')
      return rejectWithValue(message)
    }
  },
)

export const deleteReview = createAsyncThunk(
  'review/delete',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/review/destroy/${data}`)
      await dispatch(getReviews()).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      const message = handleError(error)
      toast.error(error?.response?.data?.messages?.id || 'Đã có lỗi xảy ra')
      return rejectWithValue(error)
    }
  },
)

export const createReview = createAsyncThunk(
  'review/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/review/product/create', data)
      await dispatch(getReviews()).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const updateReview = createAsyncThunk(
  'review/update',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await api.put(`/review/update/${id}`, data)
      await dispatch(getReviews()).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

export const updateReviewStatus = createAsyncThunk(
  'review/updateStatus',
  async ({ id, status }, { rejectWithValue, dispatch }) => {
    try {
      await api.put(`/review/update-status/${id}`, {
        status,
      })
      await dispatch(getReviews()).unwrap()
      toast.success('Cập nhật trạng thái thành công')
    } catch (error) {
      return rejectWithValue(error)
    }
  },
)

const initialState = {
  review: {},
  reviews: [],
  loading: false,
  error: null,
}

export const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createReview.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createReview.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getReviews.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.loading = false
        state.reviews = action.payload
      })
      .addCase(getReviews.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getReviewById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getReviewById.fulfilled, (state, action) => {
        state.loading = false
        state.review = action.payload
      })
      .addCase(getReviewById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
      })
      .addCase(deleteReview.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteReview.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateReview.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateReview.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateReviewStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateReviewStatus.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateReviewStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default reviewSlice.reducer
