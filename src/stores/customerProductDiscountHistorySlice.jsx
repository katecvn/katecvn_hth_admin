import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getHistories = createAsyncThunk(
  'customerProductDiscountHistory/getHistories',
  async ({ page = 1, limit = 20, customerGroupId }, { rejectWithValue }) => {
    try {
      const response = await api.get('/customer-group-discount-history/shows', {
        params: { page, limit, customerGroupId },
      })
      const { data } = response.data
      return data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const getHistoryById = createAsyncThunk(
  'customerProductDiscountHistory/getHistoryById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/customer-group-discount-history/show/${id}`,
      )
      const { data } = response.data
      return data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

const initialState = {
  histories: [],
  pagination: {
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
  },
  historyDetail: null,
  loading: false,
  error: null,
}

export const customerProductDiscountHistorySlice = createSlice({
  name: 'customerProductDiscountHistory',
  initialState,
  reducers: {
    clearHistoryDetail: (state) => {
      state.historyDetail = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getHistories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getHistories.fulfilled, (state, action) => {
        state.loading = false
        state.histories = action.payload.histories || []
        state.pagination = {
          totalItems: action.payload.totalItems,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
        }
      })
      .addCase(getHistories.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload?.message || 'Không thể tải lịch sử giảm giá'
        toast.error(state.error)
      })
      .addCase(getHistoryById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getHistoryById.fulfilled, (state, action) => {
        state.loading = false
        state.historyDetail = action.payload
      })
      .addCase(getHistoryById.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload?.message || 'Không thể tải chi tiết lịch sử'
        toast.error(state.error)
      })
  },
})

export const { clearHistoryDetail } =
  customerProductDiscountHistorySlice.actions

export default customerProductDiscountHistorySlice.reducer
