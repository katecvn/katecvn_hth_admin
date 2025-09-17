import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getRewardPointRules = createAsyncThunk(
  'rewardRules/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/reward-point-rules')
      const { data } = res.data
      return data?.rules || []
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const createRewardPointRule = createAsyncThunk(
  'rewardRules/create',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/reward-point-rules', payload)
      await dispatch(getRewardPointRules()).unwrap()
      toast.success('Thêm quy tắc điểm thưởng thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const updateRewardPointRule = createAsyncThunk(
  'rewardRules/update',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      await api.put(`/reward-point-rules/${id}`, data)
      await dispatch(getRewardPointRules()).unwrap()
      toast.success('Cập nhật quy tắc điểm thưởng thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const deleteRewardPointRule = createAsyncThunk(
  'rewardRules/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/reward-point-rules/${id}`)
      await dispatch(getRewardPointRules()).unwrap()
      toast.success('Xóa quy tắc điểm thưởng thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

const initialState = {
  rules: [],
  loading: false,
  error: null,
}

const rewardPointRuleSlice = createSlice({
  name: 'rewardPointRules',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getRewardPointRules.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getRewardPointRules.fulfilled, (state, action) => {
        state.loading = false
        state.rules = action.payload
      })
      .addCase(getRewardPointRules.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload?.message ||
          'Không thể tải danh sách quy tắc điểm thưởng'
        toast.error(state.error)
      })

      .addCase(createRewardPointRule.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createRewardPointRule.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createRewardPointRule.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(updateRewardPointRule.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateRewardPointRule.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateRewardPointRule.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(deleteRewardPointRule.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteRewardPointRule.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteRewardPointRule.rejected, (state, action) => {
        state.loading = false
        state.error =
          action.payload?.message || 'Không thể xóa quy tắc điểm thưởng'
        toast.error(state.error)
      })
  },
})

export default rewardPointRuleSlice.reducer
