import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getHistories = createAsyncThunk(
  'discountHistory/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/customer-group-discount-history/shows')
      const { data } = response.data
      return data.histories
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const getHistoryById = createAsyncThunk(
  'discountHistory/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/customer-group-discount-history/show/${id}`)
      const { data } = response.data
      return data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

const initialState = {
  histories: [],
  history: {},
  loading: false,
  error: null,
}

export const customerGroupDiscountHistorySlice = createSlice({
  name: 'discountHistory',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getHistories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getHistories.fulfilled, (state, action) => {
        state.loading = false
        state.histories = action.payload
      })
      .addCase(getHistories.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload?.message || 'Không thể tải danh sách lịch sử giảm giá'
        toast.error(state.error)
      })

      .addCase(getHistoryById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getHistoryById.fulfilled, (state, action) => {
        state.loading = false
        state.history = action.payload
      })
      .addCase(getHistoryById.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload?.message || 'Không thể tải chi tiết lịch sử giảm giá'
        toast.error(state.error)
      })
  },
})

export default customerGroupDiscountHistorySlice.reducer
