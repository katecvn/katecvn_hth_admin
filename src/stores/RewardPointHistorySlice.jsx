import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/utils/axios'
import { toast } from 'sonner'
import { handleError } from '@/utils/handle-error'

// Admin: lấy tất cả lịch sử
export const getHistories = createAsyncThunk(
  'rewardPointHistories/getAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/reward-point-histories', { params })
      const { data } = response.data
      return data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

// User: lấy lịch sử của chính mình
export const getMyHistories = createAsyncThunk(
  'rewardPointHistories/getMine',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/reward-point-histories/me', { params })
      const { data } = response.data
      return data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

const initialState = {
  histories: [],
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
  loading: false,
  error: null,
}

const rewardPointHistorySlice = createSlice({
  name: 'rewardPointHistories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getHistories
      .addCase(getHistories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getHistories.fulfilled, (state, action) => {
        state.loading = false
        state.histories = action.payload?.histories || []
        state.totalItems = action.payload?.totalItems || 0
        state.totalPages = action.payload?.totalPages || 0
        state.currentPage = action.payload?.currentPage || 1
      })
      .addCase(getHistories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(state.error || 'Không thể tải lịch sử điểm thưởng')
      })

      // getMyHistories
      .addCase(getMyHistories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getMyHistories.fulfilled, (state, action) => {
        state.loading = false
        state.histories = action.payload?.histories || []
        state.totalItems = action.payload?.totalItems || 0
        state.totalPages = action.payload?.totalPages || 0
        state.currentPage = action.payload?.currentPage || 1
      })
      .addCase(getMyHistories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(state.error || 'Không thể tải lịch sử điểm thưởng của bạn')
      })
  },
})

export default rewardPointHistorySlice.reducer
