import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { toast } from 'sonner'

export const getCustomerGroupDiscountHistories = createAsyncThunk(
  'customerGroupDiscountHistory/getAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('|aaaaaaa')
      const res = await api.get('/customer-group-discount-history/shows', {
        params,
      })

      return res.data.data.histories || []
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const getCustomerGroupDiscountHistoryById = createAsyncThunk(
  'customerGroupDiscountHistory/getById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/customer-group-discount-history/show/${id}`)
      return res.data.data || null
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

const initialState = {
  histories: [],
  currentHistory: null,
  loading: false,
  error: null,
}

const customerGroupDiscountHistorySlice = createSlice({
  name: 'customerGroupDiscountHistory',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // get all
      .addCase(getCustomerGroupDiscountHistories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCustomerGroupDiscountHistories.fulfilled, (state, action) => {
        state.loading = false
        state.histories = action.payload
      })
      .addCase(getCustomerGroupDiscountHistories.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload?.message || 'Không thể tải danh sách lịch sử giảm giá'
        toast.error(state.error)
      })

      // get by id
      .addCase(getCustomerGroupDiscountHistoryById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        getCustomerGroupDiscountHistoryById.fulfilled,
        (state, action) => {
          state.loading = false
          state.currentHistory = action.payload
        },
      )
      .addCase(
        getCustomerGroupDiscountHistoryById.rejected,
        (state, action) => {
          state.loading = false
          state.error =
            action.payload?.message || 'Không thể tải chi tiết lịch sử giảm giá'
          toast.error(state.error)
        },
      )
  },
})

export default customerGroupDiscountHistorySlice.reducer
